/* ============================================================
   Chat tra telefoni vicini via Bluetooth, senza internet né rete telefonica.
   Solo nell'app Android: la rete è quella di bitchat (android/mesh, GPLv3),
   compatibile con l'app bitchat per Android e iPhone.
   La pagina parla con l'app tramite window.RSAndroid.mesh*() e riceve
   gli eventi in window.RSMeshEvent({type: 'msg'|'peers'|'ack'|'read'|'state'|'error'}).
   I messaggi restano solo in questo telefono (localStorage 'rs-chat', ultimi 300),
   fuori dal backup dell'app. Immagini, voce e file stanno in IndexedDB ('rs-chat-media'), anch'essi solo sul telefono.
   ============================================================ */
const ChatModule = (() => {
  const KEY = 'rs-chat';
  const MAX = 300;
  const A = () => window.RSAndroid;
  const esc = s => Utils.escapeHtml(String(s ?? ''));
  let state = { running: false, me: '', peers: [], to: 'all', error: '' };
  let msgs = [];
  try { msgs = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { msgs = []; }

  /* ── Immagini, voce e file ──
     I limiti sono scelte di prudenza nostre (il Bluetooth è lento): si cambiano qui. */
  const IMG_SIDE = 800, IMG_QUALITY = 0.6;      // le foto vengono rimpicciolite prima dell'invio
  const FILE_MAX = 256 * 1024;                   // byte, per i documenti
  const SAFE_IMG = /^image\/(jpeg|png|webp)$/, SAFE_AUD = /^audio\/(mp4|mpeg|ogg|wav|aac|webm)$/;
  let pending = null;                            // media pronto da inviare: {kind,name,mime,b64,size}
  let rec = { on: false, t0: 0, timer: null };
  let mediaDb = null;
  function idb() {
    if (mediaDb) return mediaDb;
    mediaDb = new Promise((res, rej) => {
      const r = indexedDB.open('rs-chat-media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('m');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return mediaDb;
  }
  const mediaPut = (id, v) => idb().then(db => new Promise(res => { const t = db.transaction('m', 'readwrite'); t.objectStore('m').put(v, id); t.oncomplete = () => res(true); t.onerror = () => res(false); })).catch(() => false);
  const mediaGet = id => idb().then(db => new Promise(res => { const q = db.transaction('m').objectStore('m').get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); })).catch(() => null);
  const mediaDel = ids => idb().then(db => { const t = db.transaction('m', 'readwrite'); ids.forEach(i => t.objectStore('m').delete(i)); }).catch(() => {});
  const mediaClear = () => idb().then(db => db.transaction('m', 'readwrite').objectStore('m').clear()).catch(() => {});
  const kb = n => n < 1024 ? n + ' B' : Math.round(n / 1024) + ' KB';

  const available = () => !!(A() && A().meshStart);
  const save = () => {
    if (msgs.length > MAX) mediaDel(msgs.slice(0, msgs.length - MAX).filter(m => m.kind).map(m => m.id));
    try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-MAX))); } catch (e) {}
  };
  const peerNick = id => (state.peers.find(p => p.id === id) || {}).nick || ('…' + String(id).slice(-4));
  const time = ts => new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const ERRORS = {
    'no-bluetooth': 'Questo telefono non ha il Bluetooth.',
    'bluetooth-off': 'Il Bluetooth è spento: accendilo dalle impostazioni del telefono e tocca di nuovo «Accendi la chat».',
    permission: 'Senza il permesso «Dispositivi nelle vicinanze» la chat non può funzionare. Puoi darlo dalle impostazioni dell\'app.',
    start: 'Non riesco ad accendere la chat. Riprova; se non va, riavvia il Bluetooth.',
  };

  function onEvent(e) {
    if (!e || !e.type) return;
    if (e.type === 'state') { state.running = !!e.running; if (e.me) state.me = e.me; state.error = ''; }
    else if (e.type === 'peers') state.peers = e.peers || [];
    else if (e.type === 'error') { state.running = false; state.error = ERRORS[e.code] || ERRORS.start; }
    else if (e.type === 'msg') {
      if (msgs.some(m => m.id === e.id)) return;
      msgs.push({ id: e.id, from: e.from, nick: e.nick, text: e.text, ts: e.ts || Date.now(), priv: !!e.private, conv: e.private ? e.from : 'all' });
      save();
    } else if (e.type === 'media') {
      if (msgs.some(m => m.id === e.id)) return;
      const kind = e.kind === 'image' && SAFE_IMG.test(e.mime || '') ? 'image' : e.kind === 'audio' && SAFE_AUD.test(e.mime || '') ? 'audio' : 'file';
      msgs.push({ id: e.id, from: e.from, nick: e.nick, kind, name: e.name, mime: e.mime, size: e.size, tooBig: !!e.tooBig, ts: e.ts || Date.now(), priv: !!e.private, conv: e.private ? e.from : 'all' });
      if (e.data) mediaPut(e.id, { mime: e.mime, name: e.name, b64: e.data }).then(() => { if (currentSection === 'chat') render(); });
      save();
    } else if (e.type === 'voice') {
      onVoice(e);
      return;
    } else if (e.type === 'ack' || e.type === 'read') {
      const m = msgs.find(x => x.id === e.id);
      if (m) { m.status = e.type === 'read' ? 'letto' : 'consegnato'; save(); }
    }
    if (currentSection === 'chat') render();
  }

  function start() { state.error = ''; A().meshStart(); renderStatus('Accendo…'); }
  function stop() { A().meshStop(); }

  function send() {
    const inp = document.getElementById('chat-text');
    if (sendText((inp?.value || '').trim())) { inp.value = ''; document.getElementById('chat-text')?.focus(); }
  }

  // Invia un testo a chi è selezionato (tutti i vicini o una persona)
  function sendText(text) {
    if (!text || !state.running) return false;
    if (state.to === 'all') {
      if (!A().meshSend(text)) return false;
      msgs.push({ id: 'me-' + Date.now(), mine: true, text, ts: Date.now(), conv: 'all' });
    } else {
      const id = A().meshSendPrivate(state.to, text);
      if (!id) return false;
      msgs.push({ id, mine: true, text, ts: Date.now(), conv: state.to, priv: true, status: 'inviato' });
    }
    save();
    render();
    return true;
  }

  // Preparazione di immagini e file: si mostra un'anteprima e si invia solo dopo conferma
  function pickFile(kind) {
    if (!state.running) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = kind === 'image' ? 'image/*' : '*/*';
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) kind === 'image' ? prepImage(f) : prepFile(f); };
    inp.click();
  }
  function toB64(blob) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
  }
  function prepImage(f) {
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      const k = Math.min(1, IMG_SIDE / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(async b => {
        if (!b) { setNote('Non riesco a preparare questa immagine.'); return; }
        pending = { kind: 'image', name: 'foto-' + Date.now() + '.jpg', mime: 'image/jpeg', b64: await toB64(b), size: b.size };
        note = ''; render();
      }, 'image/jpeg', IMG_QUALITY);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setNote('Non riesco a leggere questa immagine.'); };
    img.src = url;
  }
  async function prepFile(f) {
    if (f.size > FILE_MAX) { setNote('Il file è troppo grande (' + kb(f.size) + '): via Bluetooth si inviano file fino a ' + kb(FILE_MAX) + '.'); return; }
    pending = { kind: 'file', name: f.name, mime: f.type || 'application/octet-stream', b64: await toB64(f), size: f.size };
    note = ''; render();
  }
  let note = '';
  function setNote(t) { note = t; render(); }

  async function sendPending() {
    if (!pending || !state.running) return;
    const p = pending, to = state.to;
    const r = A().meshSendMedia(to === 'all' ? '' : to, p.name, p.mime, p.b64);
    if (r === 'ok') {
      const id = 'me-' + Date.now();
      await mediaPut(id, { mime: p.mime, name: p.name, b64: p.b64 });
      msgs.push({ id, mine: true, kind: p.kind, name: p.name, mime: p.mime, size: p.size, ts: Date.now(), conv: to, priv: to !== 'all' });
      pending = null; note = ''; save();
    } else if (r === 'handshake' || r === 'wait') note = 'Sto stabilendo la connessione cifrata con questa persona: tocca «Invia» di nuovo tra qualche secondo.';
    else if (r === 'blocked') note = 'Questa persona non può ricevere file cifrati in questo momento. Prova a inviarlo a «Tutti i vicini» o riprova più tardi.';
    else note = 'Invio non riuscito. Riprova.';
    render();
  }
  function cancelPending() { pending = null; note = ''; render(); }

  // Voce: registra l'app Android (max 30 s), poi anteprima e conferma come per le immagini
  function toggleVoice() {
    if (!state.running) return;
    if (rec.on) { A().voiceStop(); return; }
    note = ''; A().voiceStart();
  }
  function onVoice(e) {
    if (e.state === 'recording') {
      rec = { on: true, t0: Date.now(), timer: setInterval(() => { const b = document.getElementById('chat-mic'); if (b) b.innerHTML = micLabel(); }, 500) };
    } else {
      clearInterval(rec.timer); rec = { on: false, t0: 0, timer: null };
      if (e.state === 'done' && e.data) pending = { kind: 'audio', name: 'voce-' + Date.now() + '.m4a', mime: e.mime || 'audio/mp4', b64: e.data, size: Math.floor(e.data.length * 3 / 4), ms: e.ms };
      else if (e.state === 'denied') note = 'Senza il permesso «Microfono» non posso registrare la voce. Puoi darlo dalle impostazioni dell\'app.';
      else if (e.state === 'error') note = 'Non riesco a registrare. Riprova.';
    }
    if (currentSection === 'chat') render();
  }
  const micLabel = () => rec.on ? '<i class="ph ph-stop-circle"></i> Ferma (' + Math.round((Date.now() - rec.t0) / 1000) + ' s)' : '<i class="ph ph-microphone"></i> Voce';

  // Riempie le immagini, gli audio e i file dei messaggi leggendoli dal telefono
  function hydrate() {
    document.querySelectorAll('#chat-list [data-mid]').forEach(async el => {
      if (el.dataset.done) return;
      const v = await mediaGet(el.dataset.mid);
      if (!v) return;
      el.dataset.done = '1';
      if (el.dataset.k === 'image' || el.dataset.k === 'audio') el.src = 'data:' + v.mime + ';base64,' + v.b64;
      else el.onclick = () => A().shareData && A().shareData(v.name || 'file', v.mime || 'application/octet-stream', v.b64);
    });
  }
  function mediaHtml(m) {
    if (m.tooBig) return `<div class="chat-text">📎 ${esc(m.name)} (${kb(m.size || 0)}): troppo grande per essere mostrato.</div>`;
    if (m.kind === 'image') return `<img class="chat-img" data-mid="${esc(m.id)}" data-k="image" alt="Immagine ricevuta">`;
    if (m.kind === 'audio') return `<audio class="chat-aud" controls preload="none" data-mid="${esc(m.id)}" data-k="audio"></audio>`;
    return `<button class="btn btn-secondary chat-file" data-mid="${esc(m.id)}" data-k="file"><i class="ph ph-paperclip"></i> ${esc(m.name)} (${kb(m.size || 0)}) · Salva o condividi</button>`;
  }

  // Messaggi pronti: un tocco invece di scrivere
  const QUICK = ['Sto bene', 'Ho bisogno di aiuto', 'Serve un medico'];
  function quick(i) { sendText(QUICK[i]); }

  // Posizione: va a tutti i vicini se è selezionato «Tutti», quindi chiede un secondo tocco
  let posArmed = false, posTimer = null;
  function sharePos() {
    const btn = document.getElementById('chat-pos');
    if (!state.running || !btn) return;
    if (state.to === 'all' && !posArmed) {
      posArmed = true;
      btn.textContent = 'Tocca ancora: la vedrà chiunque sia vicino';
      clearTimeout(posTimer); posTimer = setTimeout(() => { posArmed = false; render(); }, 6000);
      return;
    }
    posArmed = false; clearTimeout(posTimer);
    if (!navigator.geolocation) { renderStatus('Posizione non disponibile su questo telefono.'); return; }
    btn.disabled = true; btn.textContent = 'Cerco la posizione…';
    navigator.geolocation.getCurrentPosition(p => {
      const c = p.coords;
      sendText('La mia posizione: ' + c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5) + ' (precisione circa ' + Math.round(c.accuracy) + ' m)');
      render();
    }, () => { renderStatus('Non riesco a leggere la posizione: controlla che il GPS sia acceso e il permesso dato.'); render(); },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
  }

  function setNick(v) { A().meshSetNick(v); }
  function talkTo(id) { state.to = id; render(); }

  function clearAll() {
    msgs = []; save(); mediaClear(); pending = null; render();
  }

  function renderStatus(t) { const s = document.getElementById('chat-status'); if (s) s.textContent = t; }

  // La struttura (con le caselle di testo) si crea una volta sola; agli eventi si aggiornano
  // solo stato, vicini e messaggi. Ricreare la casella mentre si scrive chiude la tastiera.
  function shell(root) {
    root.innerHTML = `
      <div class="chat-warn"><i class="ph ph-flask"></i> <span><strong>Funzione sperimentale.</strong>
        Usa il Bluetooth: arriva a chi è vicino, e i messaggi possono passare di telefono in telefono attraverso altre persone con la chat accesa.
        Funziona solo con l'app aperta. È compatibile con l'app <em>bitchat</em>.
        I messaggi a «Tutti i vicini» li può leggere chiunque sia vicino; quelli a una persona sono cifrati.
        Puoi inviare anche foto, messaggi vocali e piccoli file (lenti via Bluetooth). Non sostituisce il 112.</span></div>
      <div class="chat-bar" id="chat-bar"></div>
      <div id="chat-err"></div>
      <label class="chat-nick">Il tuo nome nella chat
        <input id="chat-nick" type="text" maxlength="32" placeholder="Es. Marco – via Roma" onchange="ChatModule.setNick(this.value)"></label>
      <div class="chat-peers" id="chat-peers"></div>
      <div class="chat-list" id="chat-list"></div>
      <div class="chat-quick" id="chat-quick"></div>
      <div id="chat-pending"></div>
      <div class="chat-send">
        <input id="chat-text" type="text" maxlength="2000" onkeydown="if(event.key==='Enter')ChatModule.send()">
        <button id="chat-send-btn" class="btn btn-primary" onclick="ChatModule.send()" aria-label="Invia"><i class="ph ph-paper-plane-tilt"></i></button>
      </div>
      <div id="chat-clear"></div>`;
    document.getElementById('chat-nick').value = A().meshNick() || '';
  }

  function render() {
    const root = document.getElementById('chat-root');
    if (!root) return;
    if (!available()) {
      root.innerHTML = `<p class="pf-note"><i class="ph ph-info"></i> La chat tra telefoni vicini funziona solo nell'app Android di Rebel Survival.</p>`;
      return;
    }
    try { state.running = A().meshRunning(); if (state.running) { state.me = A().meshMe(); state.peers = JSON.parse(A().meshPeers()).peers || []; } } catch (e) {}
    if (!root.querySelector('#chat-text') || !root.querySelector('#chat-bar')) shell(root);
    const conv = msgs.filter(m => m.conv === state.to).slice(-150);
    const toLabel = state.to === 'all' ? 'Tutti i vicini' : peerNick(state.to);

    document.getElementById('chat-bar').innerHTML = `
        ${state.running
          ? `<button class="btn btn-secondary" onclick="ChatModule.stop()"><i class="ph ph-power"></i> Spegni</button>`
          : `<button class="btn btn-primary" onclick="ChatModule.start()"><i class="ph ph-bluetooth"></i> Accendi la chat</button>`}
        <span id="chat-status" class="chat-status">${state.running ? `Accesa · ${state.peers.length} vicin${state.peers.length === 1 ? 'o' : 'i'}` : 'Spenta'}</span>`;
    document.getElementById('chat-err').innerHTML = state.error ? `<p class="chat-error"><i class="ph ph-warning"></i> ${esc(state.error)}</p>` : '';
    document.getElementById('chat-peers').innerHTML = `
        <button class="chat-peer ${state.to === 'all' ? 'active' : ''}" onclick="ChatModule.talkTo('all')"><i class="ph ph-broadcast"></i> Tutti i vicini</button>
        ${state.peers.map(p => `<button class="chat-peer ${state.to === p.id ? 'active' : ''}" onclick="ChatModule.talkTo('${esc(p.id)}')"><i class="ph ph-lock-simple"></i> ${esc(p.nick || p.id)}</button>`).join('')}
        ${state.to !== 'all' && !state.peers.some(p => p.id === state.to) ? `<button class="chat-peer active"><i class="ph ph-lock-simple"></i> ${esc(toLabel)} (non in zona)</button>` : ''}`;
    const list = document.getElementById('chat-list');
    const html = conv.length ? conv.map(m => `
          <div class="chat-msg ${m.mine ? 'mine' : ''}">
            <div class="chat-meta">${m.mine ? 'Tu' : esc(m.nick || peerNick(m.from))} · ${time(m.ts)}${m.status ? ' · ' + esc(m.status) : ''}</div>
            ${m.kind ? mediaHtml(m) : `<div class="chat-text">${esc(m.text)}</div>`}
          </div>`).join('') : `<p class="pf-note">Nessun messaggio ${state.to === 'all' ? 'per tutti' : 'con ' + esc(toLabel)}.</p>`;
    if (list.dataset.html !== html) { list.innerHTML = html; list.dataset.html = html; list.scrollTop = list.scrollHeight; }
    hydrate();

    const inp = document.getElementById('chat-text');
    const ph = state.running ? 'Scrivi a ' + toLabel + '…' : 'Accendi la chat per scrivere';
    if (inp.placeholder !== ph) inp.placeholder = ph;
    if (inp.disabled === state.running) inp.disabled = !state.running;
    document.getElementById('chat-send-btn').disabled = !state.running;
    posArmed = false;
    document.getElementById('chat-quick').innerHTML = state.running
      ? QUICK.map((q, i) => `<button class="chat-peer" onclick="ChatModule.quick(${i})">${esc(q)}</button>`).join('')
        + `<button class="chat-peer" id="chat-pos" onclick="ChatModule.sharePos()"><i class="ph ph-map-pin"></i> Invia la mia posizione</button>`
        + `<button class="chat-peer" onclick="ChatModule.pickFile('image')"><i class="ph ph-image"></i> Foto</button>`
        + `<button class="chat-peer" id="chat-mic" onclick="ChatModule.toggleVoice()">${micLabel()}</button>`
        + `<button class="chat-peer" onclick="ChatModule.pickFile('file')"><i class="ph ph-paperclip"></i> File</button>` : '';
    const dest = state.to === 'all' ? 'a TUTTI i vicini (lo vedrà chiunque sia vicino)' : 'a ' + esc(toLabel) + ' (cifrato)';
    document.getElementById('chat-pending').innerHTML = pending ? `<div class="chat-pend">
        <strong>${pending.kind === 'image' ? 'Foto' : pending.kind === 'audio' ? 'Messaggio vocale' : 'File ' + esc(pending.name)} pronto (${kb(pending.size)})</strong>
        ${pending.kind === 'audio' ? `<audio controls src="data:${pending.mime};base64,${pending.b64}"></audio>` : ''}
        ${pending.kind === 'image' ? `<img class="chat-img" src="data:${pending.mime};base64,${pending.b64}" alt="Anteprima">` : ''}
        <div>Verrà inviato ${dest}. Via Bluetooth può richiedere tempo: tieni vicini i telefoni.</div>
        <button class="btn btn-primary" onclick="ChatModule.sendPending()"><i class="ph ph-paper-plane-tilt"></i> Invia</button>
        <button class="btn btn-secondary" onclick="ChatModule.cancelPending()">Annulla</button></div>` : '';
    if (note) document.getElementById('chat-err').innerHTML += `<p class="chat-error"><i class="ph ph-info"></i> ${esc(note)}</p>`;
    document.getElementById('chat-clear').innerHTML = msgs.length ? `<button class="btn btn-link chat-clear" onclick="ChatModule.clearAll()"><i class="ph ph-trash"></i> Cancella i messaggi da questo telefono</button>` : '';
  }

  window.RSMeshEvent = onEvent;
  return { init: render, render, start, stop, send, quick, sharePos, pickFile, sendPending, cancelPending, toggleVoice, setNick, talkTo, clearAll, available, onEvent };
})();
