/* ============================================================
   Strumenti di Campo — Bussola, GPS, Torcia, Batteria, Rete, SOS, Mappa
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

  /* ── MAPPA ── */
  let _compassDeg         = 0;   // angolo corrente accumulato (non wrappato) per evitare spin
  let _compassAbsDetected = false;  // true se riceviamo heading assoluto (iOS o Android absolute)

  let _map            = null;
  let _gpsMarker      = null;
  let _gpsCircle      = null;
  let _layerOSM       = null;
  let _layerRegioni   = null;
  let _layerProvince  = null;
  let _layerComuni    = null;
  let _comuniLoading  = false;
  let _mapReady       = false;
  let _waypointMarker = null;
  let _waypointLine   = null;
  let _settingWaypoint = false;

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

    _compassAbsDetected = false;

    compassListener = e => {
      let h;
      if (e.webkitCompassHeading != null) {
        // iOS — sempre assoluto
        h = e.webkitCompassHeading;
        _compassAbsDetected = true;
      } else if (e.alpha != null) {
        h = (360 - e.alpha + 360) % 360;
        if (e.absolute === true) {
          _compassAbsDetected = true;
        } else if (!_compassAbsDetected) {
          // Android con solo orientamento relativo — avvisa di calibrare
          _compassStatus('⚠️ Nord relativo — calibra ruotando il tel. a forma di ∞');
        }
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
    _compassDeg = 0;
    _compassAbsDetected = false;
    const btn = document.getElementById('st-compass-toggle');
    if (btn) btn.textContent = 'Attiva';
    _compassStatus('Bussola ferma');
  }

  function _compassUpdate() {
    if (compassHeading == null) return;
    const needle = document.querySelector('.compass-needle');
    const degEl  = document.getElementById('compass-deg');
    const cardEl = document.getElementById('compass-card');

    // Calcola percorso angolare più corto per evitare spin 360° al wrap 0°/360°
    let delta = compassHeading - ((_compassDeg % 360) + 360) % 360;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    _compassDeg += delta;

    if (needle) needle.style.transform = `translate(-50%, -50%) rotate(${_compassDeg}deg)`;
    if (degEl)  degEl.textContent  = compassHeading + '°';
    if (cardEl) cardEl.textContent = deg2card(compassHeading);
    // aggiorna icona heading sulla mappa
    if (_gpsMarker) _gpsMarker.setIcon(_makeHeadingIcon(compassHeading));
  }

  function _compassStatus(msg) {
    const el = document.getElementById('compass-status');
    if (el) el.textContent = msg;
  }

  /* ── HEADING ICON (GPS marker con cono direzionale) ── */
  function _makeHeadingIcon(heading) {
    const hasCone = heading != null;
    const cone = hasCone
      ? `<polygon points="20,2 14,18 26,18" fill="#c9a84c" opacity="0.65"/>`
      : '';
    return L.divIcon({
      className: '',
      html: `<svg viewBox="0 0 40 40" width="40" height="40"
               style="transform:rotate(${hasCone ? heading : 0}deg);overflow:visible;display:block">
               ${cone}
               <circle cx="20" cy="20" r="8" fill="#c9a84c" stroke="white" stroke-width="2.5"/>
               <circle cx="20" cy="20" r="3" fill="white"/>
             </svg>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }

  /* ── WAYPOINT MATH ── */
  function _haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371, toR = Math.PI / 180;
    const dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*toR)*Math.cos(lat2*toR)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function _bearingDeg(lat1, lon1, lat2, lon2) {
    const toR = Math.PI / 180;
    const y = Math.sin((lon2-lon1)*toR) * Math.cos(lat2*toR);
    const x = Math.cos(lat1*toR)*Math.sin(lat2*toR) - Math.sin(lat1*toR)*Math.cos(lat2*toR)*Math.cos((lon2-lon1)*toR);
    return (Math.atan2(y, x) * 180/Math.PI + 360) % 360;
  }

  /* ── WAYPOINT LINE + HUD ── */
  function _updateWaypointLine() {
    if (!_waypointMarker || !gpsPos) return;
    const from = [gpsPos.latitude, gpsPos.longitude];
    const wll  = _waypointMarker.getLatLng();
    const to   = [wll.lat, wll.lng];
    if (_waypointLine) {
      _waypointLine.setLatLngs([from, to]);
    } else {
      _waypointLine = L.polyline([from, to], {
        color: '#e85c40', weight: 2.5, dashArray: '7 5', opacity: 0.9,
      }).addTo(_map);
    }
    const dist = _haversineKm(from[0], from[1], to[0], to[1]);
    const brg  = _bearingDeg(from[0], from[1], to[0], to[1]);
    const distTxt = dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km';
    const hud = document.getElementById('map-waypoint-hud');
    if (hud) {
      hud.textContent = `▶ ${distTxt}  ·  ${Math.round(brg)}° ${deg2card(brg)}`;
      hud.style.display = 'block';
    }
  }

  function _clearWaypoint() {
    if (_waypointMarker) { _map.removeLayer(_waypointMarker); _waypointMarker = null; }
    if (_waypointLine)   { _map.removeLayer(_waypointLine);   _waypointLine   = null; }
    const hud = document.getElementById('map-waypoint-hud');
    if (hud) hud.style.display = 'none';
    const btn = document.querySelector('.map-waypoint-btn');
    if (btn) btn.classList.remove('active');
  }

  function _onMapClickWaypoint(e) {
    _settingWaypoint = false;
    const wpIcon = L.divIcon({
      className: '',
      html: `<svg viewBox="0 0 24 36" width="24" height="36" style="overflow:visible">
               <path d="M12 0 C5.4 0 0 5.4 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.4 18.6 0 12 0Z"
                     fill="#e85c40" stroke="white" stroke-width="1.5"/>
               <circle cx="12" cy="12" r="4" fill="white"/>
             </svg>`,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
    });
    _waypointMarker = L.marker(e.latlng, { icon: wpIcon }).addTo(_map);
    _waypointMarker.bindPopup(`<b>Meta</b><br>${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    _updateWaypointLine();
    const btn = document.querySelector('.map-waypoint-btn');
    if (btn) btn.classList.add('active');
  }

  function _toggleWaypoint() {
    if (_waypointMarker) {
      _clearWaypoint();
      _settingWaypoint = false;
      _map.off('click', _onMapClickWaypoint);
    } else if (_settingWaypoint) {
      // annulla modo selezione
      _settingWaypoint = false;
      _map.off('click', _onMapClickWaypoint);
      const btn = document.querySelector('.map-waypoint-btn');
      if (btn) btn.classList.remove('active');
    } else {
      _settingWaypoint = true;
      const hint = document.getElementById('st-map-hint');
      if (hint) hint.textContent = 'Tocca la mappa per impostare la meta →';
      const btn = document.querySelector('.map-waypoint-btn');
      if (btn) btn.classList.add('active');
      _map.once('click', _onMapClickWaypoint);
    }
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
    const lat    = p.latitude.toFixed(6);
    const lon    = p.longitude.toFixed(6);
    const alt    = p.altitude != null ? Math.round(p.altitude) + ' m' : '—';
    const spd    = p.speed    != null ? (p.speed * 3.6).toFixed(1) + ' km/h' : '—';
    const accM   = p.accuracy != null ? Math.round(p.accuracy) : null;
    const accTier = accM == null ? '' : accM < 10 ? '<span class="gps-tier gps-good">ottimo</span>' : accM < 50 ? '<span class="gps-tier gps-warn">buono</span>' : '<span class="gps-tier gps-bad">scarso</span>';
    const acc    = accM != null ? `${accM} m ${accTier}` : '—';

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
    _mapUpdateGPS();
  }

  function _mapUpdateGPS() {
    if (!_map || !gpsPos) return;
    const lat = gpsPos.latitude;
    const lon = gpsPos.longitude;
    const acc = gpsPos.accuracy || 50;
    const latlng = L.latLng(lat, lon);

    if (_gpsMarker) {
      _gpsMarker.setLatLng(latlng);
      _gpsMarker.setIcon(_makeHeadingIcon(compassHeading));
      _gpsCircle.setLatLng(latlng).setRadius(acc);
    } else {
      _gpsMarker = L.marker(latlng, {
        icon: _makeHeadingIcon(compassHeading),
        zIndexOffset: 1000,
      }).addTo(_map).bindPopup(`<b>Posizione</b><br>${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      _gpsCircle = L.circle(latlng, {
        radius: acc, color: '#c9a84c', fillColor: '#c9a84c',
        fillOpacity: 0.1, weight: 1,
      }).addTo(_map);
    }
    if (_waypointMarker) _updateWaypointLine();
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
        if (torchStream) torchStream.getTracks().forEach(t => t.stop());
        torchStream = null; torchTrack = null;
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
  function _geoStyle(color, weight, fillOpacity) {
    return { color, weight, fillColor: '#1a2214', fillOpacity, opacity: 0.9 };
  }

  function _geoLayer(data, nameKey, tooltipClass) {
    return L.geoJSON(data, {
      style: _geoStyle('#c9a84c', 1, 0.35),
      onEachFeature: (feature, layer) => {
        const name = feature.properties && feature.properties[nameKey];
        if (name) {
          layer.bindTooltip(name, { permanent: false, className: tooltipClass, sticky: true });
          layer.on('click', () => layer.openTooltip());
        }
      },
    });
  }

  function _initMap() {
    if (_mapReady) return;
    const el = document.getElementById('st-map');
    if (!el || typeof L === 'undefined') return;

    _map = L.map('st-map', { zoomControl: true, attributionControl: false }).setView([42.5, 12.5], 6);

    // Layer OSM
    _layerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(_map);

    // Carica regioni e province in parallelo
    Promise.all([
      fetch('/js/data/italy-regions.geojson').then(r => r.json()),
      fetch('/js/data/italy-provinces.geojson').then(r => r.json()),
    ]).then(([regioni, province]) => {
      _layerRegioni  = _geoLayer(regioni,  'reg_name',  'map-region-tooltip').addTo(_map);
      _layerProvince = _geoLayer(province, 'prov_name', 'map-region-tooltip');

      // Layer control — base + overlays
      const overlays = {
        '<span class="map-lbl">Regioni</span>':  _layerRegioni,
        '<span class="map-lbl">Province</span>': _layerProvince,
        '<span class="map-lbl">Comuni <small>(zoom 10+)</small></span>': _dummyComuniLayer(),
      };
      L.control.layers({ 'OSM': _layerOSM }, overlays, { collapsed: false, position: 'topright' }).addTo(_map);

      // Attiva/disattiva comuni in base allo zoom e al toggle
      _map.on('overlayadd',    e => { if (e.name.includes('Comuni')) _onComuniToggle(true);  });
      _map.on('overlayremove', e => { if (e.name.includes('Comuni')) _onComuniToggle(false); });
      _map.on('zoomend', _checkComuniZoom);
    }).catch(() => {});

    // Bottone centra su GPS
    const LocateBtn = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'map-locate-btn');
        btn.innerHTML = '<i class="ph ph-crosshair"></i>';
        btn.title = 'Centra su posizione';
        L.DomEvent.on(btn, 'click', e => {
          L.DomEvent.stopPropagation(e);
          if (gpsPos) _map.setView([gpsPos.latitude, gpsPos.longitude], 13);
          else alert('Attiva prima il GPS');
        });
        return btn;
      },
    });
    _map.addControl(new LocateBtn());

    // Bottone waypoint
    const WaypointBtn = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'map-locate-btn map-waypoint-btn');
        btn.innerHTML = '<i class="ph ph-navigation-arrow"></i>';
        btn.title = 'Imposta meta (tap sulla mappa)';
        L.DomEvent.on(btn, 'click', e => { L.DomEvent.stopPropagation(e); _toggleWaypoint(); });
        return btn;
      },
    });
    _map.addControl(new WaypointBtn());

    // Bottone fullscreen
    const FullscreenBtn = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const btn = L.DomUtil.create('button', 'map-locate-btn map-fs-btn');
        btn.innerHTML = '<i class="ph ph-arrows-out"></i>';
        btn.title = 'Fullscreen';
        L.DomEvent.on(btn, 'click', e => {
          L.DomEvent.stopPropagation(e);
          const wrap = document.querySelector('.st-map-wrap');
          if (!wrap) return;
          if (!document.fullscreenElement) {
            wrap.requestFullscreen().catch(() => {});
            btn.innerHTML = '<i class="ph ph-arrows-in"></i>';
          } else {
            document.exitFullscreen().catch(() => {});
            btn.innerHTML = '<i class="ph ph-arrows-out"></i>';
          }
        });
        document.addEventListener('fullscreenchange', () => {
          if (!document.fullscreenElement) {
            btn.innerHTML = '<i class="ph ph-arrows-out"></i>';
          }
          setTimeout(() => _map && _map.invalidateSize(), 200);
        }, { once: false });
        return btn;
      },
    });
    _map.addControl(new FullscreenBtn());

    _mapReady = true;
    if (gpsPos) _mapUpdateGPS();
  }

  // Layer placeholder per comuni (il vero layer viene caricato lazy)
  function _dummyComuniLayer() {
    return L.layerGroup();
  }

  let _comuniEnabled = false;

  function _onComuniToggle(enabled) {
    _comuniEnabled = enabled;
    if (enabled) _loadComuni();
    else if (_layerComuni) { _map.removeLayer(_layerComuni); }
  }

  function _checkComuniZoom() {
    if (!_comuniEnabled || !_layerComuni) return;
    if (_map.getZoom() >= 10) {
      if (!_map.hasLayer(_layerComuni)) _map.addLayer(_layerComuni);
    } else {
      if (_map.hasLayer(_layerComuni)) _map.removeLayer(_layerComuni);
    }
  }

  function _loadComuni() {
    if (_layerComuni) { _checkComuniZoom(); return; }
    if (_comuniLoading) return;
    _comuniLoading = true;

    // Mostra indicatore loading
    const hint = document.getElementById('st-map-hint');
    if (hint) hint.textContent = 'Caricamento comuni... (36MB, attendere)';

    fetch('/js/data/italy-municipalities.geojson')
      .then(r => r.json())
      .then(data => {
        _layerComuni = _geoLayer(data, 'name', 'map-region-tooltip');
        _comuniLoading = false;
        if (hint) hint.textContent = '';
        if (_comuniEnabled) _checkComuniZoom();
      })
      .catch(() => { _comuniLoading = false; });
  }

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

        <!-- NUMERI EMERGENZA -->
        <div class="st-card">
          <div class="st-card-hdr"><span><i class="ph ph-phone-call"></i> Numeri Emergenza</span></div>
          <div class="st-emerg-grid">
            <a class="st-emerg-num" href="tel:112">
              <span class="st-emerg-code">112</span>
              <span class="st-emerg-label">Emergenza Europea</span>
            </a>
            <a class="st-emerg-num" href="tel:118">
              <span class="st-emerg-code">118</span>
              <span class="st-emerg-label">Soccorso Sanitario</span>
            </a>
            <a class="st-emerg-num" href="tel:115">
              <span class="st-emerg-code">115</span>
              <span class="st-emerg-label">Vigili del Fuoco</span>
            </a>
            <a class="st-emerg-num" href="tel:113">
              <span class="st-emerg-code">113</span>
              <span class="st-emerg-label">Polizia di Stato</span>
            </a>
            <a class="st-emerg-num" href="tel:1515">
              <span class="st-emerg-code">1515</span>
              <span class="st-emerg-label">Emergenza Ambientale</span>
            </a>
            <a class="st-emerg-num" href="tel:1530">
              <span class="st-emerg-code">1530</span>
              <span class="st-emerg-label">Guardia Costiera</span>
            </a>
          </div>
          <p class="st-status" style="text-align:center;margin-top:8px">Tocca un numero per chiamare</p>
        </div>

        <!-- MAPPA -->
        <div class="st-card st-card-full">
          <div class="st-card-hdr">
            <span><i class="ph ph-map-trifold"></i> Mappa Italia</span>
            <span class="st-map-hint" id="st-map-hint">Dot arancio = posizione GPS · Attiva GPS per centrare</span>
          </div>
          <div class="st-map-wrap">
            <div id="st-map"></div>
            <div id="map-waypoint-hud" class="map-waypoint-hud" style="display:none"></div>
          </div>
          <p class="st-status text-dim" style="font-size:0.72rem;margin-top:6px">
            Tile © <a href="https://openstreetmap.org" target="_blank" rel="noopener" style="color:var(--text-dim)">OpenStreetMap</a> contributors · Regioni © ISTAT CC BY
          </p>
        </div>

      </div>`;

    _networkUI();
    initBattery();
    window.addEventListener('online',  _networkUI);
    window.addEventListener('offline', _networkUI);
    setTimeout(_initMap, 100);
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
    if (_map) { _map.remove(); _map = null; _mapReady = false; _gpsMarker = null; _gpsCircle = null; _waypointMarker = null; _waypointLine = null; _settingWaypoint = false; _layerComuni = null; _comuniEnabled = false; _comuniLoading = false; }
    window.removeEventListener('online',  _networkUI);
    window.removeEventListener('offline', _networkUI);
  }

  return { init, destroy, toggleCompass, toggleGPS, toggleTorch, toggleSOS, copyCoords };

})();
