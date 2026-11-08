/* ============================================================
   Copia offline — l'app costruisce da sola UN file .html con dentro
   tutto (stili, font, icone, codice) e lo passa a un altro telefono
   con la condivisione del sistema (Bluetooth, Quick Share, ...).
   Nessuno strumento esterno: i file vengono presi dalla cache del
   service worker, quindi funziona anche senza internet.
   NON entrano nella copia: guide PDF, confini della mappa, AI.
   ============================================================ */
const CopiaOffline = (() => {
  const FILE_NAME = 'RebelSurvival-offline.html';   // nome del file condiviso (rinomina prodotto: cambiare qui)
  const isCopy = () => window.RS_OFFLINE_COPY === true;

  const abs = (u, base) => new URL(u, base).href;
  const local = href => { try { return new URL(href, location.href).origin === location.origin; } catch (e) { return false; } };

  async function get(url, as) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return as === 'blob' ? r.blob() : r.text();
  }
  const toDataUri = blob => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });

  // url(...) dentro un CSS → data URI (font, immagini). Se un file manca resta com'è.
  async function inlineCssUrls(css, cssUrl) {
    const found = new Set();
    css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => { if (!/^(data:|#|https?:)/.test(u)) found.add(u); return m; });
    const map = {};
    await Promise.all([...found].map(async u => {
      const clean = u.split('#')[0].split('?')[0];
      if (/\.svg$/i.test(clean)) return;                    // font SVG di riserva: non serve
      try { map[u] = await toDataUri(await get(abs(clean, cssUrl), 'blob')); } catch (e) {}
    }));
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => map[u] ? `url("${map[u]}")` : m);
  }

  async function build() {
    const base = location.origin + '/';
    const html = await get(base + 'index.html');
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('link[rel="manifest"]').forEach(l => l.remove());

    for (const l of [...doc.querySelectorAll('link[rel="stylesheet"][href]')]) {
      const url = abs(l.getAttribute('href'), base);
      const st = doc.createElement('style');
      if (l.media) st.media = l.media;
      st.textContent = await inlineCssUrls(await get(url), url);
      l.replaceWith(st);
    }
    for (const el of [...doc.querySelectorAll('img[src], link[rel~="icon"][href], link[rel="apple-touch-icon"][href]')]) {
      const attr = el.tagName === 'IMG' ? 'src' : 'href';
      try { el.setAttribute(attr, await toDataUri(await get(abs(el.getAttribute(attr), base), 'blob'))); } catch (e) {}
    }
    for (const s of [...doc.querySelectorAll('script[src]')]) {
      const code = await get(abs(s.getAttribute('src'), base));
      const n = doc.createElement('script');
      n.textContent = code.replace(/<\/script/gi, '<\\/script');
      s.replaceWith(n);
    }

    const flag = doc.createElement('script');
    flag.textContent = `window.RS_OFFLINE_COPY=true;window.RS_ORIGIN=${JSON.stringify(location.origin)};` +
      `window.RS_COPY_DATE=${JSON.stringify(new Date().toISOString().slice(0, 10))};`;
    doc.head.prepend(flag);

    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  const say = t => { const el = document.getElementById('app-share-msg'); if (el) el.textContent = t; };

  async function share() {
    if (isCopy()) {
      say('Per passarla ancora, invia lo stesso file che hai ricevuto (lo trovi nei Download).');
      return;
    }
    say('Preparo il file…');
    let text;
    try { text = await build(); }
    catch (e) { say('Non riesco a preparare il file: apri l\'app almeno una volta con internet e riprova.'); return; }
    const file = new File([text], FILE_NAME, { type: 'text/html' });
    const mb = (file.size / 1048576).toFixed(1);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Rebel Survival (copia offline)' });
        say(`File inviato (${mb} MB). Chi lo riceve lo apre dai Download con il browser.`);
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') { say(''); return; }
      }
    }
    // condivisione non disponibile: scarica il file, poi lo si invia dall'app File
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = FILE_NAME;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    say(`File salvato nei Download (${mb} MB): invialo dall'app File con Bluetooth o Quick Share.`);
  }

  /* ── dentro la copia offline ── */
  function initCopy() {
    if (!isCopy()) return;
    document.body.classList.add('rs-offline-copy');
    const bar = document.createElement('div');
    bar.className = 'rs-copy-bar';
    const origin = Utils.escapeHtml(window.RS_ORIGIN || '');
    bar.innerHTML = `<i class="ph ph-info"></i><span>Copia offline del ${Utils.escapeHtml(window.RS_COPY_DATE || '')}: ` +
      `mancano guide PDF, mappa e aggiornamenti. Versione completa: <b>${origin}</b></span>`;
    (document.getElementById('main-content') || document.body).prepend(bar);
    // i collegamenti a file dell'app (PDF, pagine legali) qui non esistono
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const h = a.getAttribute('href') || '';
      if (h.startsWith('/') && !h.startsWith('//')) {
        e.preventDefault();
        alertBar(`Questa parte c'è solo nella versione completa: ${window.RS_ORIGIN || ''}${h}`);
      }
    }, true);
  }
  function alertBar(t) {
    const bar = document.querySelector('.rs-copy-bar span');
    if (bar) { bar.textContent = t; bar.parentElement.classList.add('rs-copy-flash'); setTimeout(() => bar.parentElement.classList.remove('rs-copy-flash'), 1500); }
  }

  return { share, build, initCopy, isCopy };
})();
