/* ============================================================
   Strumenti di Campo — Bussola, GPS, Torcia, Batteria, Rete, SOS
   ============================================================ */
const StrumentiModule = (() => {

  /* ── STATE ── */
  let compassListener = null;
  let compassHeading  = null;
  let gpsWatchId      = null;
  let gpsPos          = null;
  let torchStream     = null;
  let torchTrack      = null;
  let torchOn         = false;
  let batteryObj      = null;
  let sosActive       = false;
  let sosInterval     = null;
  let sosFlashEl      = null;
  let audioCtx        = null;
  let wakeLock        = null;

  /* ── UTILITY ── */
  function deg2card(d) {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
    return dirs[Math.round(((d % 360) + 360) % 360 / 22.5) % 16];
  }

  function dd2dms(dd, isLat) {
    const dir = dd >= 0 ? (isLat ? 'N' : 'E') : (isLat ? 'S' : 'O');
    const abs = Math.abs(dd);
    const deg = Math.floor(abs);
    const min = Math.floor((abs - deg) * 60);
    const sec = ((abs - deg - min / 60) * 3600).toFixed(1);
    return `${deg}°${min}'${sec}" ${dir}`;
  }

  /* ── BUSSOLA ── */
  async function startCompass() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') { _compassStatus('Permesso negato — abilita il sensore nelle impostazioni Safari'); return; }
      } catch(e) { _compassStatus('Impossibile richiedere il permesso'); return; }
    }

    compassListener = e => {
      let h;
      if (e.webkitCompassHeading != null) {
        h = e.webkitCompassHeading;                   // iOS
      } else if (e.alpha != null) {
        h = (360 - e.alpha + 360) % 360;             // Android
      }
      if (h == null) return;
      compassHeading = Math.round(h);
      _compassUpdate();
    };

    window.addEventListener('deviceorientationabsolute', compassListener, true);
    window.addEventListener('deviceorientation',          compassListener, true);
    _compassStatus('');
  }

  function stopCompass() {
    if (compassListener) {
      window.removeEventListener('deviceorientationabsolute', compassListener, true);
      window.removeEventListener('deviceorientation',          compassListener, true);
      compassListener = null;
    }
    compassHeading = null;
    const btn = document.getElementById('st-compass-toggle');
    if (btn) btn.textContent = 'Attiva';
    _compassStatus('Bussola ferma');
  }

  function _compassUpdate() {
    if (compassHeading == null) return;
    const needle = document.querySelector('.compass-needle');
    const degEl  = document.getElementById('compass-deg');
    const cardEl = document.getElementById('compass-card');
    if (needle) needle.style.transform = `translate(-50%, -50%) rotate(${compassHeading}deg)`;
    if (degEl)  degEl.textContent  = compassHeading + '°';
    if (cardEl) cardEl.textContent = deg2card(compassHeading);
  }

  function _compassStatus(msg) {
    const el = document.getElementById('compass-status');
    if (el) el.textContent = msg;
  }

  function toggleCompass() {
    const btn = document.getElementById('st-compass-toggle');
    if (compassListener) {
      stopCompass();
    } else {
      if (btn) btn.textContent = 'Stop';
      _compassStatus('In attesa del sensore...');
      startCompass();
    }
  }

  /* ── GPS ── */
  function toggleGPS() {
    const btn = document.getElementById('st-gps-toggle');
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      gpsWatchId = null; gpsPos = null;
      _gpsContent('<p class="st-idle-msg">Tocca Attiva per acquisire la posizione</p>');
      if (btn) btn.textContent = 'Attiva';
    } else {
      if (!navigator.geolocation) { _gpsContent('<p class="st-unavail"><i class="ph ph-warning"></i> GPS non disponibile</p>'); return; }
      if (btn) btn.textContent = 'Stop';
      _gpsContent('<p class="st-loading"><i class="ph ph-arrows-clockwise"></i> Acquisizione segnale GPS...</p>');
      gpsWatchId = navigator.geolocation.watchPosition(
        pos => { gpsPos = pos.coords; _gpsUpdate(); },
        err => {
          const msgs = { 1:'Permesso GPS negato', 2:'Posizione non disponibile', 3:'Timeout — riprova' };
          _gpsContent(`<p class="st-unavail"><i class="ph ph-warning"></i> ${msgs[err.code]||'Errore GPS'}</p>`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    }
  }

  function _gpsUpdate() {
    if (!gpsPos) return;
    const p   = gpsPos;
    const lat = p.latitude.toFixed(6);
    const lon = p.longitude.toFixed(6);
    const alt = p.altitude  != null ? Math.round(p.altitude)      + ' m'     : '—';
    const acc = p.accuracy  != null ? Math.round(p.accuracy)      + ' m'     : '—';
    const spd = p.speed     != null ? (p.speed * 3.6).toFixed(1)  + ' km/h'  : '—';

    _gpsContent(`
      <div class="st-gps-grid">
        <div class="st-gps-row"><span class="st-gps-lbl">LAT</span><span class="mono">${lat}°</span></div>
        <div class="st-gps-row"><span class="st-gps-lbl">LON</span><span class="mono">${lon}°</span></div>
        <div class="st-gps-row"><span class="st-gps-lbl">ALT</span><span class="mono">${alt}</span></div>
        <div class="st-gps-row"><span class="st-gps-lbl">ACC</span><span class="mono">${acc}</span></div>
        <div class="st-gps-row"><span class="st-gps-lbl">VEL</span><span class="mono">${spd}</span></div>
      </div>
      <div class="st-gps-dms">${dd2dms(p.latitude, true)} · ${dd2dms(p.longitude, false)}</div>
      <button class="btn btn-outline btn-sm btn-full mt-8" onclick="StrumentiModule.copyCoords()">
        <i class="ph ph-copy"></i> Copia coordinate
      </button>`);
  }

  function _gpsContent(html) {
    const el = document.getElementById('st-gps-content');
    if (el) el.innerHTML = html;
  }

  function copyCoords() {
    if (!gpsPos) return;
    const text = `${gpsPos.latitude.toFixed(6)}, ${gpsPos.longitude.toFixed(6)}`;
    navigator.clipboard?.writeText(text).then(() => {
      const btn = document.querySelector('#st-gps-content .btn');
      if (btn) { btn.innerHTML = '<i class="ph ph-check"></i> Copiato!'; setTimeout(() => { btn.innerHTML = '<i class="ph ph-copy"></i> Copia coordinate'; }, 2000); }
    });
  }

  /* ── TORCIA ── */
  async function toggleTorch() {
    if (torchOn) {
      try {
        if (torchTrack)  await torchTrack.applyConstraints({ advanced: [{ torch: false }] });
        if (torchStream) torchStream.getTracks().forEach(t => t.stop());
      } catch(e) {}
      torchTrack = null; torchStream = null; torchOn = false;
    } else {
      try {
        torchStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        torchTrack  = torchStream.getVideoTracks()[0];
        if (!torchTrack.getCapabilities().torch) throw new Error('no torch');
        await torchTrack.applyConstraints({ advanced: [{ torch: true }] });
        torchOn = true;
      } catch(e) {
        const s = document.getElementById('st-torch-status');
        if (s) s.textContent = 'Torcia non supportata su questo dispositivo';
        return;
      }
    }
    _torchUI();
  }

  function _torchUI() {
    const btn = document.getElementById('st-torch-btn');
    const ico = document.getElementById('st-torch-ico');
    if (btn) btn.classList.toggle('st-big-btn-on', torchOn);
    if (ico) ico.className = `ph ph-flashlight${torchOn ? '-fill' : ''}`;
    const lbl = document.getElementById('st-torch-lbl');
    if (lbl) lbl.textContent = torchOn ? 'ON' : 'OFF';
  }

  /* ── BATTERIA ── */
  async function initBattery() {
    const el = document.getElementById('st-battery-content');
    if (!el) return;
    if (!navigator.getBattery) {
      el.innerHTML = '<p class="st-unavail">Non disponibile su iOS / Safari</p>'; return;
    }
    try {
      batteryObj = await navigator.getBattery();
      _batteryUI();
      ['levelchange','chargingchange','chargingtimechange','dischargingtimechange']
        .forEach(ev => batteryObj.addEventListener(ev, _batteryUI));
    } catch(e) { el.innerHTML = '<p class="st-unavail">Batteria non accessibile</p>'; }
  }

  function _batteryUI() {
    const el = document.getElementById('st-battery-content');
    if (!el || !batteryObj) return;
    const pct      = Math.round(batteryObj.level * 100);
    const charging = batteryObj.charging;
    const cls      = pct > 50 ? 'good' : pct > 20 ? 'warn' : 'bad';
    const dt       = batteryObj.dischargingTime;
    const ct       = batteryObj.chargingTime;
    const timeStr  = !charging && dt && dt !== Infinity
      ? `${Math.floor(dt/3600)}h ${Math.floor((dt%3600)/60)}m rimasti`
      : charging && ct && ct !== Infinity
      ? `${Math.floor(ct/3600)}h ${Math.floor((ct%3600)/60)}m a piena carica`
      : '';

    el.innerHTML = `
      <div class="st-batt-row">
        <div class="st-batt-icon">
          <div class="st-batt-fill ${cls}" style="width:${pct}%"></div>
          <span class="st-batt-pct mono">${pct}%</span>
        </div>
        <div class="st-batt-info">
          <span class="${cls}">${charging ? '⚡ In carica' : '🔋 In uso'}</span>
          ${timeStr ? `<span class="text-secondary text-sm">${timeStr}</span>` : ''}
        </div>
      </div>`;
  }

  /* ── RETE ── */
  function _networkUI() {
    const el   = document.getElementById('st-network-content');
    if (!el) return;
    const online = navigator.onLine;
    const conn   = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const type   = conn ? (conn.effectiveType || conn.type || '—').toUpperCase() : '—';
    const down   = conn?.downlink ? conn.downlink.toFixed(1) + ' Mbps' : '';
    const cls    = online ? 'good' : 'bad';

    el.innerHTML = `
      <div class="st-net-status ${cls}">
        <i class="ph ph-${online ? 'wifi' : 'wifi-slash'}"></i>
        <span>${online ? 'ONLINE' : 'OFFLINE'}</span>
      </div>
      <div class="st-net-detail">
        <span class="st-gps-lbl">TIPO</span><span class="mono">${type}</span>
      </div>
      ${down ? `<div class="st-net-detail"><span class="st-gps-lbl">VEL</span><span class="mono">${down}</span></div>` : ''}`;
  }

  /* ── SOS MORSE ── */
  // S = ... (200ms on, 100ms off × 3)
  // O = --- (600ms on, 100ms off × 3)
  // separatore lettera = 300ms, separatore ciclo = 1000ms
  const SOS_VIB = [
    200,100, 200,100, 200,   // S
    300,
    600,100, 600,100, 600,   // O
    300,
    200,100, 200,100, 200,   // S
    1000
  ];

  function toggleSOS() {
    sosActive ? _stopSOS() : _startSOS();
  }

  function _startSOS() {
    sosActive = true;
    _sosUI();

    // Overlay flash
    sosFlashEl = document.createElement('div');
    sosFlashEl.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:9999;pointer-events:none;opacity:0';
    document.body.appendChild(sosFlashEl);

    const cycle = () => {
      if (!sosActive) return;
      if (navigator.vibrate) navigator.vibrate(SOS_VIB);
      _sosFlash();
      _sosBeep();
    };

    cycle();
    const totalMs = SOS_VIB.reduce((a,b)=>a+b,0);
    sosInterval = setInterval(cycle, totalMs);
  }

  function _sosFlash() {
    if (!sosFlashEl) return;
    const timings = [200,100,200,100,200,300,600,100,600,100,600,300,200,100,200,100,200];
    let t = 0, on = true;
    timings.forEach(dur => {
      setTimeout(() => { if (sosFlashEl) sosFlashEl.style.opacity = on ? '0.92' : '0'; on = !on; }, t);
      t += dur;
    });
    setTimeout(() => { if (sosFlashEl) sosFlashEl.style.opacity = '0'; }, t);
  }

  function _sosBeep() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const dots  = [{s:0,d:.18},{s:.3,d:.18},{s:.6,d:.18}];
      const dashes = [{s:1.0,d:.55},{s:1.7,d:.55},{s:2.4,d:.55}];
      const dots2  = [{s:3.1,d:.18},{s:3.4,d:.18},{s:3.7,d:.18}];
      [...dots,...dashes,...dots2].forEach(({s,d}) => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime + s);
        gain.gain.setValueAtTime(0,   audioCtx.currentTime + s + d);
        osc.start(audioCtx.currentTime + s);
        osc.stop(audioCtx.currentTime + s + d + 0.01);
      });
    } catch(e) {}
  }

  function _stopSOS() {
    sosActive = false;
    clearInterval(sosInterval); sosInterval = null;
    if (navigator.vibrate) navigator.vibrate(0);
    if (sosFlashEl) { sosFlashEl.remove(); sosFlashEl = null; }
    try { if (audioCtx) { audioCtx.close(); audioCtx = null; } } catch(e) {}
    _sosUI();
  }

  function _sosUI() {
    const btn = document.getElementById('st-sos-btn');
    if (!btn) return;
    btn.classList.toggle('st-sos-active', sosActive);
    btn.innerHTML = sosActive
      ? '<i class="ph ph-stop-circle-fill"></i><span>STOP SOS</span>'
      : '<i class="ph ph-siren"></i><span>INVIA SOS</span>';
  }

  /* ── WAKE LOCK ── */
  async function _requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
  }

  /* ── RENDER ── */
  function render() {
    const root = document.getElementById('strumenti-root');
    if (!root) return;

    root.innerHTML = `
      <div class="st-grid">

        <!-- BUSSOLA -->
        <div class="st-card">
          <div class="st-card-hdr">
            <span><i class="ph ph-compass"></i> Bussola</span>
            <button class="st-toggle" id="st-compass-toggle" onclick="StrumentiModule.toggleCompass()">Attiva</button>
          </div>
          <div class="st-compass-wrap">
            <div class="compass-rose">
              <span class="cr-n">N</span><span class="cr-e">E</span>
              <span class="cr-s">S</span><span class="cr-o">O</span>
              <div class="compass-ring"></div>
              <div class="compass-needle" id="compass-needle">
                <div class="needle-n"></div>
                <div class="needle-s"></div>
              </div>
            </div>
            <div class="compass-readout">
              <div class="compass-deg-val" id="compass-deg">—°</div>
              <div class="compass-card-val" id="compass-card">—</div>
            </div>
          </div>
          <p class="st-status" id="compass-status">Premi Attiva e punta il telefono</p>
        </div>

        <!-- GPS -->
        <div class="st-card">
          <div class="st-card-hdr">
            <span><i class="ph ph-map-pin"></i> GPS</span>
            <button class="st-toggle" id="st-gps-toggle" onclick="StrumentiModule.toggleGPS()">Attiva</button>
          </div>
          <div id="st-gps-content">
            <p class="st-idle-msg">Premi Attiva per acquisire la posizione</p>
          </div>
        </div>

        <!-- TORCIA -->
        <div class="st-card st-card-center">
          <div class="st-card-hdr"><span><i class="ph ph-flashlight"></i> Torcia</span></div>
          <button class="st-big-btn" id="st-torch-btn" onclick="StrumentiModule.toggleTorch()">
            <i class="ph ph-flashlight" id="st-torch-ico"></i>
            <span id="st-torch-lbl">OFF</span>
          </button>
          <p class="st-status" id="st-torch-status"></p>
        </div>

        <!-- BATTERIA -->
        <div class="st-card">
          <div class="st-card-hdr"><span><i class="ph ph-battery-full"></i> Batteria</span></div>
          <div id="st-battery-content"><p class="st-idle-msg">Caricamento...</p></div>
        </div>

        <!-- RETE -->
        <div class="st-card">
          <div class="st-card-hdr"><span><i class="ph ph-wifi"></i> Rete</span></div>
          <div id="st-network-content"></div>
        </div>

        <!-- SOS -->
        <div class="st-card st-card-center">
          <div class="st-card-hdr"><span><i class="ph ph-siren"></i> SOS</span></div>
          <button class="st-sos-btn" id="st-sos-btn" onclick="StrumentiModule.toggleSOS()">
            <i class="ph ph-siren"></i><span>INVIA SOS</span>
          </button>
          <p class="st-status">Morse: vibrazione + lampeggio + audio</p>
        </div>

      </div>`;

    _networkUI();
    initBattery();
    window.addEventListener('online',  _networkUI);
    window.addEventListener('offline', _networkUI);
  }

  /* ── PUBLIC ── */
  function init() {
    render();
    _requestWakeLock();
  }

  function destroy() {
    if (compassListener) stopCompass();
    if (gpsWatchId !== null) { navigator.geolocation.clearWatch(gpsWatchId); gpsWatchId = null; }
    if (torchOn) toggleTorch();
    if (sosActive) _stopSOS();
    if (wakeLock) { try { wakeLock.release(); } catch(e) {} wakeLock = null; }
    window.removeEventListener('online',  _networkUI);
    window.removeEventListener('offline', _networkUI);
  }

  return { init, destroy, toggleCompass, toggleGPS, toggleTorch, toggleSOS, copyCoords };

})();
