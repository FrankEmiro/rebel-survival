/* ============================================================
   Lettore di file ZIM (Wikipedia offline di Kiwix), scritto da zero.
   Formato: https://wiki.openzim.org/wiki/ZIM_file_format
   La sorgente è un oggetto con read(offset, length) → Promise<Uint8Array>:
   un Blob nel telefono (pezzi OPFS uniti) oppure, per le prove, HTTP Range.
   Decompressione zstd: js/vendor/fzstd.min.js (licenza MIT).
   I file compressi con xz (ZIM vecchi, prima del 2021) non sono supportati.
   ============================================================ */
const Zim = (() => {
  const dec = new TextDecoder('utf-8');
  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
  const u64 = (b, o) => u32(b, o) + u32(b, o + 4) * 4294967296;   // fino a 2^53: basta per file di decine di GB

  function blobSource(blob) {
    return { size: blob.size, read: async (off, len) => new Uint8Array(await blob.slice(off, Math.min(blob.size, off + len)).arrayBuffer()) };
  }

  async function open(src) {
    const h = await src.read(0, 80);
    if (u32(h, 0) !== 72173914) throw new Error('non è un file ZIM');
    const z = {
      src,
      major: u16(h, 4), minor: u16(h, 6),
      entryCount: u32(h, 24), clusterCount: u32(h, 28),
      pathPtrPos: u64(h, 32), titlePtrPos: u64(h, 40), clusterPtrPos: u64(h, 48),
      mimeListPos: u64(h, 56), mainPage: u32(h, 64), checksumPos: u64(h, 72),
      mimes: [], cache: new Map(),
    };
    // elenco dei tipi MIME: stringhe terminate da zero, finisce con una stringa vuota
    const m = await src.read(z.mimeListPos, 4096);
    for (let i = 0, s = 0; i < m.length; i++) {
      if (m[i] === 0) {
        if (i === s) break;
        z.mimes.push(dec.decode(m.subarray(s, i)));
        s = i + 1;
      }
    }
    return z;
  }

  async function entryAt(z, off) {
    let b = await z.src.read(off, 1024);
    const parse = b => {
      const mime = u16(b, 0), paramLen = b[2], ns = String.fromCharCode(b[3]);
      const redirect = mime === 0xffff;
      let p = redirect ? 12 : 16;
      const e0 = b.indexOf(0, p); if (e0 < 0) return null;
      const path = dec.decode(b.subarray(p, e0));
      const e1 = b.indexOf(0, e0 + 1); if (e1 < 0) return null;
      const title = dec.decode(b.subarray(e0 + 1, e1)) || path;
      return redirect
        ? { ns, path, title, redirect: u32(b, 8) }
        : { ns, path, title, mime: z.mimes[mime] || '', cluster: u32(b, 8), blob: u32(b, 12) };
    };
    let e = parse(b);
    if (!e) { b = await z.src.read(off, 8192); e = parse(b); }
    if (!e) throw new Error('voce ZIM non leggibile');
    return e;
  }

  // voce n-esima nell'ordine dei percorsi
  async function entryByIndex(z, i) {
    const p = await z.src.read(z.pathPtrPos + i * 8, 8);
    const e = await entryAt(z, u64(p, 0));
    e.index = i;
    return e;
  }
  // Indice dei titoli: nei ZIM recenti l'intestazione non lo ha (titlePtrPos = tutti 1) e si usa
  // la voce X/listing/titleOrdered/v1 (solo articoli), un elenco di numeri di voce a 4 byte.
  async function titleList(z) {
    if (z.titles !== undefined) return z.titles;
    z.titles = null;
    if (z.titlePtrPos < z.src.size || (z.src.size === undefined && z.titlePtrPos < 2 ** 52)) {
      z.titles = { n: z.entryCount, at: async i => u32(await z.src.read(z.titlePtrPos + i * 4, 4), 0) };
    } else {
      const e = await findByPath(z, 'X', 'listing/titleOrdered/v1');
      if (e) {
        const b = (await content(z, e)).bytes;
        const arr = new Uint32Array(b.length >> 2);
        for (let i = 0; i < arr.length; i++) arr[i] = u32(b, i * 4);
        z.titles = { n: arr.length, at: async i => arr[i] };
      }
    }
    return z.titles;
  }
  // voce n-esima nell'ordine dei titoli
  async function entryByTitleIndex(z, i) {
    return entryByIndex(z, await (await titleList(z)).at(i));
  }

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // cerca per percorso esatto (namespace + percorso); null se manca
  async function findByPath(z, ns, path) {
    const key = ns + '/' + path;
    let lo = 0, hi = z.entryCount - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const e = await entryByIndex(z, mid);
      const c = cmp(e.ns + '/' + e.path, key);
      if (c === 0) return e;
      if (c < 0) lo = mid + 1; else hi = mid - 1;
    }
    return null;
  }

  // titoli che iniziano con «prefix» (namespace C o A): ordine alfabetico del file
  async function searchTitle(z, prefix, limit = 20) {
    prefix = prefix.trim();
    if (!prefix) return [];
    const variants = [...new Set([prefix, prefix[0].toUpperCase() + prefix.slice(1)])];
    const out = [], seen = new Set();
    const tl = await titleList(z);
    if (!tl) return [];
    for (const ns of ['C', 'A']) {
      for (const pre of variants) {
        const key = ns + '/' + pre;
        let lo = 0, hi = tl.n;
        while (lo < hi) {             // primo titolo >= chiave
          const mid = (lo + hi) >> 1;
          const e = await entryByTitleIndex(z, mid);
          if (cmp(e.ns + '/' + e.title, key) < 0) lo = mid + 1; else hi = mid;
        }
        for (let i = lo; i < tl.n && out.length < limit; i++) {
          const e = await entryByTitleIndex(z, i);
          if (e.ns !== ns || !e.title.startsWith(pre)) break;
          if (!seen.has(e.path) && (e.redirect !== undefined || /html/.test(e.mime))) { seen.add(e.path); out.push(e); }
        }
      }
      if (out.length) break;
    }
    return out;
  }

  async function resolve(z, e) {
    for (let n = 0; e && e.redirect !== undefined && n < 10; n++) e = await entryByIndex(z, e.redirect);
    return e;
  }

  async function cluster(z, n) {
    if (z.cache.has(n)) { const c = z.cache.get(n); z.cache.delete(n); z.cache.set(n, c); return c; }
    const ptr = await z.src.read(z.clusterPtrPos + n * 8, 16);
    const start = u64(ptr, 0);
    const end = n + 1 < z.clusterCount ? u64(ptr, 8) : z.checksumPos;
    const raw = await z.src.read(start, end - start);
    const info = raw[0], comp = info & 0x0f, ext = (info & 0x10) !== 0;
    let data;
    if (comp === 0 || comp === 1) data = raw.subarray(1);
    else if (comp === 5) data = fzstd.decompress(raw.subarray(1));
    else throw new Error('questo file ZIM usa una compressione vecchia (xz) non supportata: scarica una versione recente');
    const osz = ext ? 8 : 4;
    const rd = o => (ext ? u64(data, o) : u32(data, o));
    const count = rd(0) / osz;
    const offs = [];
    for (let i = 0; i < count; i++) offs.push(rd(i * osz));
    const c = { data, offs };
    z.cache.set(n, c);
    if (z.cache.size > 8) z.cache.delete(z.cache.keys().next().value);
    return c;
  }

  // contenuto di una voce (segue i rinvii): { entry, mime, bytes }
  async function content(z, e) {
    e = await resolve(z, e);
    if (!e || e.cluster === undefined) throw new Error('voce senza contenuto');
    const c = await cluster(z, e.cluster);
    return { entry: e, mime: e.mime, bytes: c.data.subarray(c.offs[e.blob], c.offs[e.blob + 1]) };
  }

  async function mainEntry(z) {
    if (z.mainPage !== 0xffffffff) return resolve(z, await entryByIndex(z, z.mainPage));
    const w = await findByPath(z, 'W', 'mainPage');
    return w ? resolve(z, w) : null;
  }

  async function metadata(z, name) {
    const e = await findByPath(z, 'M', name);
    if (!e) return '';
    try { return dec.decode((await content(z, e)).bytes); } catch (err) { return ''; }
  }

  return { open, blobSource, findByPath, searchTitle, content, mainEntry, metadata, resolve, decode: b => dec.decode(b) };
})();
if (typeof module !== 'undefined') module.exports = Zim;
