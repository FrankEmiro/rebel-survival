/* ============================================================
   Chat tra telefoni vicini via Bluetooth, senza internet né rete telefonica.
   Solo nell'app Android: la rete è quella di bitchat (android/mesh, GPLv3),
   compatibile con l'app bitchat per Android e iPhone.
   La pagina parla con l'app tramite window.RSAndroid.mesh*() e riceve
   gli eventi in window.RSMeshEvent({type: 'msg'|'peers'|'ack'|'read'|'state'|'error'}).
   I messaggi restano solo in questo telefono (localStorage 'rs-chat', ultimi 300),
   fuori dal backup dell'app.
   ============================================================ */
const ChatModule = (() => {
  const KEY = 'rs-chat';
  const MAX = 300;
  const A = () => window.RSAndroid;
  const esc = s => Utils.escapeHtml(String(s ?? ''));
  let state = { running: false, me: '', peers: [], to: 'all', error: '' };
  let msgs = [];
  try { msgs = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { msgs = []; }

  const available = () => !!(A() && A().meshStart);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-MAX))); } catch (e) {} };
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
    msgs = []; save(); render();
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
        Non sostituisce il 112.</span></div>
      <div class="chat-bar" id="chat-bar"></div>
      <div id="chat-err"></div>
      <label class="chat-nick">Il tuo nome nella chat
        <input id="chat-nick" type="text" maxlength="32" placeholder="Es. Marco – via Roma" onchange="ChatModule.setNick(this.value)"></label>
      <div class="chat-peers" id="chat-peers"></div>
      <div class="chat-list" id="chat-list"></div>
      <div class="chat-quick" id="chat-quick"></div>
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
            <div class="chat-text">${esc(m.text)}</div>
          </div>`).join('') : `<p class="pf-note">Nessun messaggio ${state.to === 'all' ? 'per tutti' : 'con ' + esc(toLabel)}.</p>`;
    if (list.dataset.html !== html) { list.innerHTML = html; list.dataset.html = html; list.scrollTop = list.scrollHeight; }

    const inp = document.getElementById('chat-text');
    const ph = state.running ? 'Scrivi a ' + toLabel + '…' : 'Accendi la chat per scrivere';
    if (inp.placeholder !== ph) inp.placeholder = ph;
    if (inp.disabled === state.running) inp.disabled = !state.running;
    document.getElementById('chat-send-btn').disabled = !state.running;
    posArmed = false;
    document.getElementById('chat-quick').innerHTML = state.running
      ? QUICK.map((q, i) => `<button class="chat-peer" onclick="ChatModule.quick(${i})">${esc(q)}</button>`).join('')
        + `<button class="chat-peer" id="chat-pos" onclick="ChatModule.sharePos()"><i class="ph ph-map-pin"></i> Invia la mia posizione</button>` : '';
    document.getElementById('chat-clear').innerHTML = msgs.length ? `<button class="btn btn-link chat-clear" onclick="ChatModule.clearAll()"><i class="ph ph-trash"></i> Cancella i messaggi da questo telefono</button>` : '';
  }

  window.RSMeshEvent = onEvent;
  return { init: render, render, start, stop, send, quick, sharePos, setNick, talkTo, clearAll, available, onEvent };
})();
