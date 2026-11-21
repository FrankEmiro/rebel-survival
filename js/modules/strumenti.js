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
  let _compassSmooth = null;      // media circolare del nord
  let _compassAbsFn = null;       // ascoltatore del sensore assoluto
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
  let _mapFixed = false;

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
    _compassSmooth = null;
    let gotAbsEvent = false;   // se il telefono dà l'orientamento assoluto, si ignora quello relativo

    // Prima la bussola saltava perché due sensori diversi (assoluto e relativo) arrivavano a turno
    // con valori diversi. Ora si usa UN solo sensore e il valore è addolcito (media circolare).
    const handle = (e, isAbsEvent) => {
      let h;
      if (e.webkitCompassHeading != null) {
        h = e.webkitCompassHeading;                   // iOS: sempre assoluto
        _compassAbsDetected = true;
      } else if (e.alpha != null) {
        if (isAbsEvent) { gotAbsEvent = true; _compassAbsDetected = true; }
        else if (gotAbsEvent) return;                 // c'è già l'assoluto: ignora il relativo
        else if (e.absolute === true) _compassAbsDetected = true;
        else _compassStatus('⚠️ Nord non sicuro — calibra muovendo il telefono a forma di 8');
        h = (360 - e.alpha + 360) % 360;
      }
      if (h == null) return;
      // media circolare (evita il salto tra 359° e 0°)
      const r = h * Math.PI / 180;
      if (_compassSmooth == null) _compassSmooth = { x: Math.cos(r), y: Math.sin(r) };
      else { _compassSmooth.x += 0.15 * (Math.cos(r) - _compassSmooth.x); _compassSmooth.y += 0.15 * (Math.sin(r) - _compassSmooth.y); }
      compassHeading = Math.round((Math.atan2(_compassSmooth.y, _compassSmooth.x) * 180 / Math.PI + 360) % 360);
      _compassUpdate();
      if (_compassAbsDetected && gotAbsEvent) _compassStatus('');
    };
    _compassAbsFn = e => handle(e, true);
    compassListener = e => handle(e, false);

    window.addEventListener('deviceorientationabsolute', _compassAbsFn, true);
    window.addEventListener('deviceorientation',          compassListener, true);
    _compassStatus('');
  }

  function stopCompass() {
    if (compassListener) {
      if (_compassAbsFn) window.removeEventListener('deviceorientationabsolute', _compassAbsFn, true);
      _compassAbsFn = null; _compassSmooth = null;
      window.removeEventListener('deviceorientation',          compassListener, true);
      compassListener = null;
    }
    compassHeading = null;
    _compassDeg = 0;
    _compassAbsDetected = false;
    const dial = document.getElementById('compass-dial');
    if (dial) dial.style.transform = 'rotate(0deg)';
    const degEl = document.getElementById('compass-deg'); if (degEl) degEl.textContent = '—°';
    const cardEl = document.getElementById('compass-card'); if (cardEl) cardEl.textContent = '—';
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

    const dial = document.getElementById('compass-dial');
    if (dial) dial.style.transform = `rotate(${-_compassDeg}deg)`;
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

  /* ── QUADRANTE BUSSOLA (SVG) ── */
  // Quadrante che ruota: tacche ogni 5°, numeri ogni 30°, lettere cardinali.
  // La linea fissa in alto indica la direzione verso cui punta il telefono.
  function _dialSvg() {
    const C = 100, R = 92;
    let ticks = '';
    for (let d = 0; d < 360; d += 5) {
      const long = d % 30 === 0, mid = d % 10 === 0;
      const len = long ? 12 : mid ? 8 : 5;
      const a = (d - 90) * Math.PI / 180;
      const x1 = C + R * Math.cos(a), y1 = C + R * Math.sin(a);
      const x2 = C + (R - len) * Math.cos(a), y2 = C + (R - len) * Math.sin(a);
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="cd-tick${long ? ' cd-tick-l' : ''}"/>`;
    }
    const labels = [[0,'N'],[30,'30'],[60,'60'],[90,'E'],[120,'120'],[150,'150'],[180,'S'],[210,'210'],[240,'240'],[270,'O'],[300,'300'],[330,'330']]
      .map(([d, t]) => {
        const card = isNaN(t);
        const r = card ? 62 : 66;
        const a = (d - 90) * Math.PI / 180;
        const x = C + r * Math.cos(a), y = C + r * Math.sin(a);
        return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${d} ${x.toFixed(1)} ${y.toFixed(1)})" class="${card ? 'cd-card' + (t === 'N' ? ' cd-north' : '') : 'cd-num'}">${t}</text>`;
      }).join('');
    return `<svg viewBox="0 0 200 200" class="cd-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="97" class="cd-bezel"/>
      <g id="compass-dial" class="cd-dial">
        <circle cx="100" cy="100" r="92" class="cd-face"/>
        ${ticks}${labels}
        <polygon points="100,22 95,34 105,34" class="cd-north-mark"/>
      </g>
      <line x1="100" y1="2" x2="100" y2="22" class="cd-lubber"/>
      <circle cx="100" cy="100" r="3" class="cd-center"/>
      <line x1="100" y1="88" x2="100" y2="112" class="cd-cross"/><line x1="88" y1="100" x2="112" y2="100" class="cd-cross"/>
    </svg>`;
  }

  /* ── HEADING ICON (GPS marker con cono direzionale) ── */
  function _makeHeadingIcon(heading) {
    const h = heading != null ? heading : _curHeading();
    const has = h != null;
    // con la direzione nota: fascio luminoso + grossa freccia gialla con bordo scuro e bianco; altrimenti un punto con alone
    const body = has
      ? `<g style="transform:rotate(${h}deg);transform-origin:36px 36px">
           <path d="M36 36 L12 -8 A46 46 0 0 1 60 -8 Z" fill="#ffd54a" opacity="0.28"/>
           <path d="M36 6 L54 58 L36 47 L18 58 Z" fill="#ffc400" stroke="#111" stroke-width="5" stroke-linejoin="round" paint-order="stroke"/>
           <path d="M36 6 L54 58 L36 47 L18 58 Z" fill="#ffc400" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
         </g>`
      : `<circle cx="36" cy="36" r="22" fill="#ffc400" opacity="0.25" class="gps-pulse"/>
         <circle cx="36" cy="36" r="11" fill="#ffc400" stroke="#111" stroke-width="5"/>
         <circle cx="36" cy="36" r="11" fill="#ffc400" stroke="#fff" stroke-width="3"/>`;
    return L.divIcon({
      className: 'gps-arrow',
      html: `<svg viewBox="0 0 72 72" width="72" height="72" style="overflow:visible;display:block">${body}</svg>`,
      iconSize: [72, 72],
      iconAnchor: [36, 36],
      popupAnchor: [0, -30],
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

  function _onMapClickWaypoint(e) { _setWaypointAt(e.latlng, 'Meta'); }
  function _setWaypointAt(latlng, nome) {
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
    _waypointMarker = L.marker(latlng, { icon: wpIcon }).addTo(_map);
    _waypointMarker.bindPopup(`<b>${_esc(nome)}</b><br>${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
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


  /* ── LUOGHI SALVATI, PERCORSO REGISTRATO, RITORNO ──
     Tutto resta nel telefono (Storage: 'luoghi', 'percorsi', 'percorso-corrente').
     Si registra solo con l'app aperta sugli Strumenti e il GPS acceso: a schermo spento il browser/WebView non dà la posizione. */
  const _esc = t => String(t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const MAX_PERCORSI = 15, MAX_PUNTI = 3000, PASSO_M = 8;
  let _placeLayer = null, _placeMarkers = {}, _pendingPlace = null;
  let _rec = null;            // { id, nome, t0, pts:[[lat,lon,t]] } mentre si registra
  let _recLine = null, _backLine = null, _backShowLine = null;
  let _back = null;           // { nome, pts, idx } mentre si torna indietro
  let _settingPlace = false;

  const _luoghi = () => Storage.get('luoghi', []) || [];
  const _percorsi = () => Storage.get('percorsi', []) || [];
  const _fmtDist = km => km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';
  const _pad = n => String(n).padStart(2, '0');
  const _stamp = t => { const d = new Date(t); return `${_pad(d.getDate())}/${_pad(d.getMonth() + 1)} ${_pad(d.getHours())}:${_pad(d.getMinutes())}`; };
  const _lenKm = pts => { let s = 0; for (let i = 1; i < pts.length; i++) s += _haversineKm(pts[i-1][0], pts[i-1][1], pts[i][0], pts[i][1]); return s; };

  // Direzione verso cui si guarda: bussola se accesa, altrimenti direzione di marcia del GPS (solo se ci si muove)
  function _curHeading() {
    if (compassHeading != null) return compassHeading;
    if (gpsPos && gpsPos.heading != null && !isNaN(gpsPos.heading) && (gpsPos.speed || 0) > 0.5) return gpsPos.heading;
    return null;
  }

  function _placeIcon() {
    return L.divIcon({
      className: '',
      html: `<svg viewBox="0 0 24 36" width="26" height="38" style="overflow:visible">
               <path d="M12 0 C5.4 0 0 5.4 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.4 18.6 0 12 0Z" fill="#3d8bd9" stroke="white" stroke-width="1.5"/>
               <circle cx="12" cy="12" r="4" fill="white"/></svg>`,
      iconSize: [26, 38], iconAnchor: [13, 38], popupAnchor: [0, -34], tooltipAnchor: [0, -34],
    });
  }

  function _placeTip(p) {
    let s = _esc(p.label);
    if (gpsPos) s += ' · ' + _fmtDist(_haversineKm(gpsPos.latitude, gpsPos.longitude, p.lat, p.lon));
    return s;
  }
  function _placePopup(p) {
    let d = '';
    if (gpsPos) {
      const km = _haversineKm(gpsPos.latitude, gpsPos.longitude, p.lat, p.lon), b = _bearingDeg(gpsPos.latitude, gpsPos.longitude, p.lat, p.lon);
      d = `<div>${_fmtDist(km)} · ${Math.round(b)}° ${deg2card(b)}</div>`;
    }
    return `<b>${_esc(p.label)}</b><br>${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}${d}
      <div class="map-pop-act"><button onclick="StrumentiModule.placeGo('${p.id}')">Vai qui</button><button onclick="StrumentiModule.placeDel('${p.id}')">Elimina</button></div>`;
  }
  function _drawPlaces() {
    if (!_map) return;
    if (!_placeLayer) _placeLayer = L.layerGroup().addTo(_map);
    _placeLayer.clearLayers(); _placeMarkers = {};
    _luoghi().forEach(p => {
      const m = L.marker([p.lat, p.lon], { icon: _placeIcon() }).addTo(_placeLayer);
      m.bindTooltip(_placeTip(p), { permanent: true, direction: 'top', className: 'map-place-tip' });
      m.bindPopup(() => _placePopup(p));
      _placeMarkers[p.id] = m;
    });
  }
  function _refreshPlaceTips() {
    _luoghi().forEach(p => { const m = _placeMarkers[p.id]; if (m) m.setTooltipContent(_placeTip(p)); });
  }

  function _mapHint(t) { const h = document.getElementById('st-map-hint'); if (h) h.textContent = t; }

  function _needGps() {
    if (gpsWatchId === null) toggleGPS();
  }

  // Segnaposto: aggiunge un punto con etichetta (form in sovrimpressione sulla mappa)
  function placeHere() {
    if (!gpsPos) { _needGps(); _mapHint(I18n.t('Acquisisco la posizione… riprova tra qualche secondo')); return; }
    _askLabel(gpsPos.latitude, gpsPos.longitude);
  }
  function placeOnMap() {
    if (!_map) return;
    _settingPlace = !_settingPlace;
    document.getElementById('map-btn-place-map')?.classList.toggle('active', _settingPlace);
    if (_settingPlace) {
      _mapHint(I18n.t('Tocca la mappa dove vuoi mettere il segnaposto'));
      _map.once('click', e => { _settingPlace = false; document.getElementById('map-btn-place-map')?.classList.remove('active'); _askLabel(e.latlng.lat, e.latlng.lng); });
    }
  }
  function _askLabel(lat, lon) {
    _pendingPlace = { lat, lon };
    const f = document.getElementById('map-form');
    if (!f) return;
    f.innerHTML = `<input id="map-form-label" type="text" maxlength="40" placeholder="Nome del luogo (es. Auto, Sorgente, Punto di ritrovo)" autocomplete="off">
      <button class="btn btn-primary btn-sm" onclick="StrumentiModule.placeSave()"><i class="ph ph-check"></i> Salva</button>
      <button class="btn btn-outline btn-sm" onclick="StrumentiModule.placeCancel()">Annulla</button>`;
    f.style.display = 'flex';
    const inp = document.getElementById('map-form-label');
    if (inp) { inp.focus(); inp.onkeydown = e => { if (e.key === 'Enter') placeSave(); }; }
  }
  function placeCancel() {
    _pendingPlace = null;
    const f = document.getElementById('map-form'); if (f) { f.style.display = 'none'; f.innerHTML = ''; }
    _mapHint(I18n.t('Il punto arancione è la tua posizione'));
  }
  function placeSave() {
    if (!_pendingPlace) return;
    const label = (document.getElementById('map-form-label')?.value || '').trim().slice(0, 40) || I18n.t('Luogo');
    const list = _luoghi();
    list.push({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), label, lat: _pendingPlace.lat, lon: _pendingPlace.lon, t: Date.now() });
    Storage.set('luoghi', list);
    placeCancel(); _drawPlaces(); _mapLists();
  }
  function placeDel(id) {
    Storage.set('luoghi', _luoghi().filter(p => p.id !== id));
    if (_map) _map.closePopup();
    _drawPlaces(); _mapLists();
  }
  function placeGo(id) {
    const p = _luoghi().find(x => x.id === id); if (!p || !_map) return;
    _map.closePopup();
    if (_waypointMarker) _clearWaypoint();
    _setWaypointAt(L.latLng(p.lat, p.lon), p.label);
    _needGps();
    _map.setView([p.lat, p.lon], Math.max(_map.getZoom(), 14));
  }
  function placeShow(id) {
    const p = _luoghi().find(x => x.id === id); if (!p || !_map) return;
    _map.setView([p.lat, p.lon], 16);
    if (_placeMarkers[id]) _placeMarkers[id].openPopup();
    document.getElementById('st-map')?.scrollIntoView({ block: 'center' });
  }

  // Registrazione del percorso
  function recToggle() {
    if (_rec) { _recStop(); return; }
    _needGps();
    _rec = { id: 'r' + Date.now().toString(36), t0: Date.now(), pts: [] };
    if (gpsPos) _recFeed();
    _recUi();
    _mapHint(I18n.t('Registro il percorso: tieni l\'app aperta con lo schermo acceso'));
  }
  function _recFeed() {
    if (!_rec || !gpsPos) return;
    if (gpsPos.accuracy != null && gpsPos.accuracy > 50) return;           // punto troppo impreciso: si scarta
    const last = _rec.pts[_rec.pts.length - 1];
    if (last && _haversineKm(last[0], last[1], gpsPos.latitude, gpsPos.longitude) * 1000 < PASSO_M) return;
    _rec.pts.push([+gpsPos.latitude.toFixed(6), +gpsPos.longitude.toFixed(6), Date.now()]);
    if (_rec.pts.length > MAX_PUNTI) _rec.pts = _rec.pts.filter((_, i) => i % 2 === 0 || i === _rec.pts.length - 1);
    if (_rec.pts.length % 5 === 1) Storage.set('percorso-corrente', _rec);  // copia di sicurezza
    if (_map) {
      const ll = _rec.pts.map(p => [p[0], p[1]]);
      if (_recLine) _recLine.setLatLngs(ll); else _recLine = L.polyline(ll, { color: '#3dbd6e', weight: 4, opacity: 0.9 }).addTo(_map);
    }
    _recUi();
  }
  function _recStop() {
    const r = _rec; _rec = null;
    Storage.remove('percorso-corrente');
    if (_recLine && _map) { _map.removeLayer(_recLine); _recLine = null; }
    if (r && r.pts.length >= 2) {
      const list = _percorsi();
      r.nome = I18n.t('Percorso') + ' ' + _stamp(r.t0);
      r.t1 = Date.now();
      list.push(r);
      while (list.length > MAX_PERCORSI) list.shift();
      Storage.set('percorsi', list);
      _mapHint(I18n.t('Percorso salvato'));
    } else _mapHint(I18n.t('Percorso troppo corto: non salvato'));
    _recUi(); _mapLists();
  }
  function _recUi() {
    const b = document.getElementById('map-btn-rec');
    if (b) {
      b.classList.toggle('active', !!_rec);
      b.innerHTML = _rec ? `<i class="ph ph-stop-circle"></i> <span>Ferma</span> <small class="mono">${_fmtDist(_lenKm(_rec.pts))}</small>` : '<i class="ph ph-record"></i> <span>Registra percorso</span>';
    }
  }
  function pathDel(id) {
    Storage.set('percorsi', _percorsi().filter(p => p.id !== id));
    if (_back && _back.id === id) backStop();
    _mapLists();
  }
  function pathShow(id) {
    const p = _percorsi().find(x => x.id === id); if (!p || !_map) return;
    if (_backShowLine) _map.removeLayer(_backShowLine);
    _backShowLine = L.polyline(p.pts.map(x => [x[0], x[1]]), { color: '#c9a84c', weight: 4, opacity: 0.85, dashArray: '2 8' }).addTo(_map);
    _map.fitBounds(_backShowLine.getBounds(), { padding: [30, 30] });
    document.getElementById('st-map')?.scrollIntoView({ block: 'center' });
  }

  // Ritorno lungo il percorso registrato (di notte: freccia e distanza verso il punto precedente)
  function backStart(id) {
    let p = id ? _percorsi().find(x => x.id === id) : null;
    if (!p && _rec && _rec.pts.length >= 2) { p = { id: _rec.id, nome: I18n.t('Percorso in corso'), pts: _rec.pts.slice() }; }
    if (!p) { const l = _percorsi(); p = l[l.length - 1]; }
    if (!p || p.pts.length < 2) { _mapHint(I18n.t('Prima registra un percorso')); return; }
    if (_rec) _recStop();
    _needGps();
    _back = { id: p.id, nome: p.nome, pts: p.pts, idx: p.pts.length - 1 };
    if (_backShowLine && _map) { _map.removeLayer(_backShowLine); _backShowLine = null; }
    _backShowLine = L.polyline(p.pts.map(x => [x[0], x[1]]), { color: '#c9a84c', weight: 4, opacity: 0.85, dashArray: '2 8' }).addTo(_map);
    document.getElementById('map-btn-back')?.classList.add('active');
    const d = document.getElementById('map-btn-back'); if (d) d.innerHTML = '<i class="ph ph-x-circle"></i> <span>Basta ritorno</span>';
    _mapHint(I18n.t('Segui la freccia verso il punto di partenza'));
    _backUpdate();
  }
  function backStop() {
    _back = null;
    if (_backLine && _map) { _map.removeLayer(_backLine); _backLine = null; }
    if (_backShowLine && _map) { _map.removeLayer(_backShowLine); _backShowLine = null; }
    const h = document.getElementById('map-back-hud'); if (h) h.style.display = 'none';
    const d = document.getElementById('map-btn-back'); if (d) { d.classList.remove('active'); d.innerHTML = '<i class="ph ph-arrow-u-up-left"></i> <span>Torna indietro</span>'; }
  }
  function backToggle() { _back ? backStop() : backStart(); }
  function _backUpdate() {
    if (!_back || !gpsPos || !_map) return;
    const pts = _back.pts, la = gpsPos.latitude, lo = gpsPos.longitude;
    const dist = j => _haversineKm(la, lo, pts[j][0], pts[j][1]) * 1000;
    // punto del percorso più vicino, cercando solo da dove si era arrivati verso l'inizio
    let best = _back.idx, bd = dist(best);
    for (let j = Math.max(0, _back.idx - 40); j <= Math.min(pts.length - 1, _back.idx + 3); j++) { const d = dist(j); if (d < bd) { bd = d; best = j; } }
    _back.idx = best;
    let tgt = 0;
    for (let j = best - 1; j >= 0; j--) if (dist(j) >= 25) { tgt = j; break; }
    const hud = document.getElementById('map-back-hud');
    if (best === 0 && bd < 20 || dist(0) < 20) {
      if (hud) { hud.innerHTML = '<i class="ph ph-flag-checkered"></i> <span>Sei tornato al punto di partenza</span>'; hud.style.display = 'flex'; }
      return;
    }
    const t = pts[tgt], km = _haversineKm(la, lo, t[0], t[1]), b = _bearingDeg(la, lo, t[0], t[1]);
    const left = _fmtDist(_lenKm(pts.slice(0, best + 1)) + bd / 1000);
    const hd = _curHeading();
    const rot = hd != null ? b - hd : b;
    if (_backLine) _backLine.setLatLngs([[la, lo], [t[0], t[1]]]);
    else _backLine = L.polyline([[la, lo], [t[0], t[1]]], { color: '#e85c40', weight: 4, opacity: 0.95 }).addTo(_map);
    if (hud) {
      hud.innerHTML = `<i class="ph ph-navigation-arrow map-back-arrow" style="transform:rotate(${Math.round(rot)}deg)"></i>
        <span class="mono">${_fmtDist(km)} · ${Math.round(b)}° ${deg2card(b)}</span><small class="mono">${left}</small>`;
      hud.style.display = 'flex';
    }
  }

  function _mapLists() {
    const el = document.getElementById('map-lists'); if (!el) return;
    const luoghi = _luoghi(), percorsi = _percorsi();
    const near = p => gpsPos ? ` · ${_fmtDist(_haversineKm(gpsPos.latitude, gpsPos.longitude, p.lat, p.lon))}` : '';
    el.innerHTML = (luoghi.length || percorsi.length ? '' : '<p class="st-status text-dim" style="font-size:0.78rem">Segna i luoghi importanti (auto, sorgente, punto di ritrovo) e registra il tuo percorso per poter tornare indietro anche al buio.</p>')
      + (luoghi.length ? `<div class="st-sub-lbl">Luoghi salvati</div>` + luoghi.map(p => `<div class="map-row"><button class="map-row-main" onclick="StrumentiModule.placeShow('${p.id}')"><i class="ph ph-map-pin"></i> <b>${_esc(p.label)}</b><small class="mono">${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}${near(p)}</small></button><button class="map-row-btn" aria-label="Vai qui" title="Vai qui" onclick="StrumentiModule.placeGo('${p.id}')"><i class="ph ph-navigation-arrow"></i></button><button class="map-row-btn" aria-label="Elimina" title="Elimina" onclick="StrumentiModule.placeDel('${p.id}')"><i class="ph ph-trash"></i></button></div>`).join('') : '')
      + (percorsi.length ? `<div class="st-sub-lbl" style="margin-top:8px">Percorsi registrati</div>` + percorsi.slice().reverse().map(p => `<div class="map-row"><button class="map-row-main" onclick="StrumentiModule.pathShow('${p.id}')"><i class="ph ph-path"></i> <b>${_esc(p.nome)}</b><small class="mono">${_fmtDist(_lenKm(p.pts))}</small></button><button class="map-row-btn" aria-label="Torna indietro" title="Torna indietro" onclick="StrumentiModule.backStart('${p.id}')"><i class="ph ph-arrow-u-up-left"></i></button><button class="map-row-btn" aria-label="Elimina" title="Elimina" onclick="StrumentiModule.pathDel('${p.id}')"><i class="ph ph-trash"></i></button></div>`).join('') : '');
  }

  // Mappa a tutto schermo: si fa con CSS (requestFullscreen non funziona in modo affidabile nell'app Android)
  let _bigHome = null;
  function mapBig(on) {
    const wrap = document.querySelector('.st-map-wrap'); if (!wrap) return;
    const big = on == null ? !wrap.classList.contains('map-big') : on;
    // Si sposta la mappa sotto <body>: dentro la sezione (che ha trasformazioni CSS) il «fixed» non copre lo schermo
    if (big && !_bigHome) { _bigHome = document.createComment('map'); wrap.parentNode.insertBefore(_bigHome, wrap); document.body.appendChild(wrap); }
    else if (!big && _bigHome) { _bigHome.parentNode.insertBefore(wrap, _bigHome); _bigHome.remove(); _bigHome = null; }
    wrap.classList.toggle('map-big', big);
    document.body.classList.toggle('map-big-open', big);
    const b = document.querySelector('.map-fs-btn');
    if (b) b.innerHTML = big ? '<i class="ph ph-arrows-in"></i>' : '<i class="ph ph-arrows-out"></i>';
    setTimeout(() => _map && _map.invalidateSize(), 120);
    setTimeout(() => _map && _map.invalidateSize(), 400);
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

  /* ── LIVELLA (bolla) ── */
  let levelFn = null, _lvl = { x: 0, y: 0 };
  async function toggleLevel() {
    const btn = document.getElementById('st-level-toggle');
    const st = document.getElementById('level-status');
    if (levelFn) {
      window.removeEventListener('deviceorientation', levelFn, true);
      levelFn = null; if (btn) btn.textContent = 'Attiva';
      if (st) st.textContent = 'Livella ferma';
      return;
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') { if (st) st.textContent = 'Permesso negato'; return; } }
      catch (e) { if (st) st.textContent = 'Impossibile richiedere il permesso'; return; }
    }
    if (btn) btn.textContent = 'Stop';
    if (st) st.textContent = 'In attesa del sensore...';
    levelFn = e => {
      if (e.beta == null || e.gamma == null) return;
      // filtro per non far tremare la bolla
      _lvl.x += 0.25 * (e.gamma - _lvl.x);
      _lvl.y += 0.25 * (e.beta - _lvl.y);
      const MAX = 15;                                   // oltre ±15° la bolla resta sul bordo
      const cl = v => Math.max(-MAX, Math.min(MAX, v));
      const bub = document.getElementById('level-bubble');
      if (bub) bub.style.transform = `translate(${cl(_lvl.x) / MAX * 45}px, ${cl(_lvl.y) / MAX * 45}px)`;
      const rad = Math.PI / 180;
      const tilt = Math.acos(Math.max(-1, Math.min(1, Math.cos(_lvl.x * rad) * Math.cos(_lvl.y * rad)))) / rad;
      const val = document.getElementById('level-deg');
      if (val) val.textContent = tilt.toFixed(1).replace('.', ',') + '°';
      const box = document.getElementById('level-box');
      if (box) box.classList.toggle('level-ok', tilt < 1);
      if (st) st.textContent = tilt < 1 ? 'In piano' : 'Appoggia il telefono su una superficie piana. Avanti/indietro ' + _lvl.y.toFixed(1).replace('.', ',') + '° · destra/sinistra ' + _lvl.x.toFixed(1).replace('.', ',') + '°';
    };
    window.addEventListener('deviceorientation', levelFn, true);
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
        pos => { gpsPos = pos.coords; _gpsUpdate(); _recFeed(); },
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
      <div class="gps-coords">
        <div class="gps-coord"><span class="gps-k">Latitudine</span><span class="gps-v mono">${lat}°</span></div>
        <div class="gps-coord"><span class="gps-k">Longitudine</span><span class="gps-v mono">${lon}°</span></div>
        <div class="gps-dms mono">${dd2dms(p.latitude, true)} · ${dd2dms(p.longitude, false)}</div>
      </div>
      <div class="gps-stats">
        <div class="gps-stat"><span class="gps-k">Precisione</span><span class="mono">${acc}</span></div>
        <div class="gps-stat"><span class="gps-k">Altitudine</span><span class="mono">${alt}</span></div>
        <div class="gps-stat"><span class="gps-k">Velocità</span><span class="mono">${spd}</span></div>
      </div>
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
      if (!_mapFixed) { _mapFixed = true; _map.setView(latlng, 15); }   // al primo segnale la mappa si porta sulla tua posizione
      _gpsCircle = L.circle(latlng, {
        radius: acc, color: '#c9a84c', fillColor: '#c9a84c',
        fillOpacity: 0.1, weight: 1,
      }).addTo(_map);
    }
    if (_waypointMarker) _updateWaypointLine();
    _refreshPlaceTips();
    _backUpdate();
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
        const q = document.getElementById('qt-torch-sub');
        if (q) q.textContent = 'Non supportata';
        return;
      }
    }
    _torchUI();
  }

  function _torchUI() {
    const btn = document.getElementById('st-torch-btn');
    const ico = document.getElementById('st-torch-ico');
    if (btn) btn.classList.toggle('st-big-btn-on', torchOn);
    if (ico) ico.className = `ph ${torchOn ? 'ph-lightbulb' : 'ph-flashlight'}`;
    const lbl = document.getElementById('st-torch-lbl');
    if (lbl) lbl.textContent = torchOn ? 'Accesa' : 'Spenta';
    _quickUI();
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
          <span class="${cls}"><i class="ph ${charging ? 'ph-battery-charging' : 'ph-battery-full'}"></i> ${charging ? 'In carica' : 'In uso'}</span>
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
        <i class="ph ph-${online ? 'wifi-high' : 'wifi-slash'}"></i>
        <span>${online ? 'Connesso' : 'Senza rete'}</span>
      </div>
      <div class="st-net-detail">
        <span class="st-gps-lbl">Tipo</span><span class="mono">${type}</span>
      </div>
      ${down ? `<div class="st-net-detail"><span class="st-gps-lbl">Velocità</span><span class="mono">${down}</span></div>` : ''}`;
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
      ? '<i class="ph ph-stop-circle"></i><span>Ferma</span>'
      : '<i class="ph ph-siren"></i><span>Avvia</span>';
    _quickUI();
  }

  /* ── ACCESSO RAPIDO (in cima alla pagina Emergenza) ── */
  const QUICK = [
    { id: 'torch',   icon: 'ph-flashlight',  label: 'Torcia',      act: 'StrumentiModule.toggleTorch()' },
    { id: 'sos',     icon: 'ph-siren',       label: 'Segnale SOS', act: 'StrumentiModule.toggleSOS()' },
    { id: 'compass', icon: 'ph-compass',     label: 'Bussola',     act: "StrumentiModule.goTo('compass')" },
    { id: 'level',   icon: 'ph-ruler', label: 'Livella',   act: "StrumentiModule.goTo('level')" },
    { id: 'chat',    icon: 'ph-bluetooth',   label: 'Chat vicini', act: "navigateTo('chat')", onlyIf: () => typeof ChatModule !== 'undefined' && ChatModule.available() },
    { id: 'gps',     icon: 'ph-map-pin',     label: 'Posizione',   act: "StrumentiModule.goTo('gps')" },
    { id: 'map',     icon: 'ph-map-trifold', label: 'Mappa',       act: "StrumentiModule.goTo('map')" },
    { id: 'phone',   icon: 'ph-device-mobile', label: 'Telefono',  act: "StrumentiModule.goTo('phone')" },
  ];
  function quickHtml() {
    return `<div class="st-quick" role="group" aria-label="Strumenti rapidi">
      ${QUICK.filter(q => !q.onlyIf || q.onlyIf()).map(q => {
        const on = (q.id === 'torch' && torchOn) || (q.id === 'sos' && sosActive);
        const sub = on ? (q.id === 'torch' ? 'Accesa' : 'In corso') : '';
        return `<button class="st-quick-btn${on ? ' on' : ''}" id="qt-${q.id}" onclick="${q.act}"${q.id === 'torch' || q.id === 'sos' ? ` aria-pressed="${on}"` : ''}>
        <i class="ph ${q.icon}"></i><span class="st-quick-lab">${q.label}</span><span class="st-quick-sub" id="qt-${q.id}-sub">${sub}</span>
      </button>`; }).join('')}
    </div>`;
  }
  function _quickUI() {
    const set = (id, on, sub) => {
      const b = document.getElementById('qt-' + id);
      if (!b) return;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      const s = document.getElementById('qt-' + id + '-sub');
      if (s) s.textContent = sub;
    };
    set('torch', torchOn, torchOn ? 'Accesa' : '');
    set('sos', sosActive, sosActive ? 'In corso' : '');
  }
  // Porta alla scheda dello strumento; bussola e posizione si attivano subito
  function goTo(id) {
    const card = document.getElementById('st-card-' + id);
    if (!card) return;
    card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (id === 'compass' && !compassListener) toggleCompass();
    if (id === 'gps' && gpsWatchId === null) toggleGPS();
    if (id === 'level' && !levelFn) toggleLevel();
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

    // Layer OSM — subdomain fisso ('a'): le tile scaricate per uso offline vengono
    // richieste sempre dallo stesso host, così la cache le serve senza mismatch
    // (con rotazione a/b/c una tile su tre andrebbe in cache-miss anche se già scaricata)
    // App Android: non c'è il service worker, quindi le tile scaricate per l'uso
    // offline si leggono qui dalla cache prima di chiederle a internet
    const TileLayer = window.RSAndroid ? L.TileLayer.extend({
      createTile(coords, done) {
        const img = document.createElement('img');
        img.alt = '';
        const url = this.getTileUrl(coords);
        img.onload = () => done(null, img);
        img.onerror = e => done(e, img);
        caches.open(TILES_CACHE).then(c => c.match(url)).then(r => r ? r.blob() : null)
          .then(b => { img.src = b ? URL.createObjectURL(b) : url; })
          .catch(() => { img.src = url; });
        return img;
      },
    }) : L.TileLayer;
    _layerOSM = new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      subdomains: 'a',
    }).addTo(_map);

    // Carica regioni e province in parallelo
    const iso = CountryMaps.get();
    const loading = iso === 'ITA'
      ? Promise.all([
          fetch('/js/data/italy-regions.geojson').then(r => r.json()),
          fetch('/js/data/italy-provinces.geojson').then(r => r.json()),
        ]).then(([r, p]) => ({ r, p, rn: 'reg_name', pn: 'prov_name', comuni: true, l1: 'Regioni', l2: 'Province' }))
      // altri paesi: confini da geoBoundaries (livello 1 e 2, senza comuni)
      : CountryMaps.load(iso).then(c => (c.adm1
          ? { r: c.adm1, p: c.adm2, rn: 'shapeName', pn: 'shapeName', comuni: false, l1: 'Regioni / Stati', l2: 'Province / Distretti' }
          : { r: c.adm2, p: null, rn: 'shapeName', pn: 'shapeName', comuni: false, l1: 'Province / Distretti', l2: '' }));
    loading.then(({ r: regioni, p: province, rn, pn, comuni, l1, l2 }) => {
      _layerRegioni  = _geoLayer(regioni,  rn, 'map-region-tooltip').addTo(_map);
      _layerProvince = province ? _geoLayer(province, pn, 'map-region-tooltip') : null;
      if (!comuni) { try { _map.fitBounds(_layerRegioni.getBounds()); } catch (e) {} }

      // Layer control — base + overlays
      const overlays = { [`<span class="map-lbl">${l1}</span>`]: _layerRegioni };
      if (_layerProvince) overlays[`<span class="map-lbl">${l2}</span>`] = _layerProvince;
      if (comuni) overlays['<span class="map-lbl">Comuni <small>(zoom 10+)</small></span>'] = _dummyComuniLayer();
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
          else alert(I18n.t('Attiva prima il GPS'));
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
        L.DomEvent.on(btn, 'click', e => { L.DomEvent.stopPropagation(e); mapBig(); });
        return btn;
      },
    });
    _map.addControl(new FullscreenBtn());

    _mapReady = true;
    _drawPlaces(); _mapLists(); _recUi();
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

  /* ── MAPPA OFFLINE PER PROSSIMITÀ ── */
  // Scarica le tile OSM in un raggio configurabile attorno a una posizione salvata,
  // per garantire la mappa anche senza connessione (oltre al pack "confini comunali/province"
  // già scaricabile dal Dashboard, che resta invariato).
  const TILES_ZOOM_MIN = 12, TILES_ZOOM_MAX = 15;
  const TILES_MAX_COUNT = 3000; // limite di responsabilità verso i server tile pubblici OSM
  const TILES_CACHE = 'kit-resilienza-tiles';

  function _lon2tile(lon, z) { return Math.floor((lon + 180) / 360 * Math.pow(2, z)); }
  function _lat2tile(lat, z) {
    const rad = lat * Math.PI / 180;
    return Math.floor((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z));
  }

  function _tilesForRadius(lat, lon, radiusKm) {
    const urls = [];
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    const latMin = lat - latDelta, latMax = lat + latDelta;
    const lonMin = lon - lonDelta, lonMax = lon + lonDelta;
    for (let z = TILES_ZOOM_MIN; z <= TILES_ZOOM_MAX; z++) {
      const xMin = _lon2tile(lonMin, z), xMax = _lon2tile(lonMax, z);
      const yMin = _lat2tile(latMax, z), yMax = _lat2tile(latMin, z); // lat decresce quando y cresce
      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          urls.push(`https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`);
        }
      }
    }
    return urls;
  }

  async function _downloadTiles(urls, progEl) {
    const cache = await caches.open(TILES_CACHE);
    const BATCH = 6;
    let done = 0;
    for (let i = 0; i < urls.length; i += BATCH) {
      await Promise.allSettled(urls.slice(i, i + BATCH).map(async u => {
        try { const r = await fetch(u); if (r.ok) await cache.put(u, r); } catch(e) {}
        done++;
        if (progEl) progEl.textContent = `${done} / ${urls.length}`;
      }));
    }
  }

  function _saveHomeLocation() {
    if (!gpsPos) { alert(I18n.t('Attiva prima il GPS per acquisire la posizione da salvare')); return; }
    Storage.set('home-location', { lat: gpsPos.latitude, lon: gpsPos.longitude, savedAt: new Date().toISOString() });
    Storage.remove('tiles-pack-done'); // la posizione è cambiata: il pacchetto scaricato non è più valido
    _renderTilesPack();
  }

  function _tilesRadiusChange(val) {
    const r = Math.min(20, Math.max(1, Utils.int(val, 5)));
    Storage.set('tiles-radius', r);
    _renderTilesPack();
  }

  async function _downloadTilesPack() {
    const home = Storage.get('home-location');
    if (!home) return;
    const radius = Storage.get('tiles-radius') || 5;
    const urls = _tilesForRadius(home.lat, home.lon, radius);
    if (urls.length > TILES_MAX_COUNT) {
      alert(I18n.t(`Troppe tile da scaricare (${urls.length}). Riduci il raggio (max consigliato ~${TILES_MAX_COUNT} tile per non sovraccaricare i server OSM pubblici).`));
      return;
    }
    const btn = document.getElementById('st-tiles-btn');
    const prog = document.getElementById('st-tiles-prog');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Download…';
    await _downloadTiles(urls, prog);
    Storage.set('tiles-pack-done', { count: urls.length, radius, doneAt: new Date().toISOString() });
    _renderTilesPack();
  }

  async function _deleteTilesPack() {
    if (!confirm(I18n.t('Eliminare le tile scaricate per uso offline?'))) return;
    await caches.delete(TILES_CACHE);
    Storage.remove('tiles-pack-done');
    _renderTilesPack();
  }

  function _renderTilesPack() {
    const el = document.getElementById('st-tiles-pack');
    if (!el) return;
    const home = Storage.get('home-location');

    if (!home) {
      el.innerHTML = `
        <div class="st-tiles-setup">
          <p class="text-secondary text-xs">Salva una posizione di riferimento per scaricare la mappa dell'area circostante e usarla senza connessione.</p>
          <button class="btn btn-outline btn-sm" onclick="StrumentiModule._saveHomeLocation()">
            <i class="ph ph-map-pin-simple-area"></i> Salva posizione attuale (GPS attivo)
          </button>
        </div>`;
      return;
    }

    const radius = Storage.get('tiles-radius') || 5;
    const packDone = Storage.get('tiles-pack-done');
    const count = _tilesForRadius(home.lat, home.lon, radius).length;
    const stale = packDone && packDone.radius !== radius;

    el.innerHTML = `
      <div class="st-tiles-setup">
        <div class="st-tiles-loc">
          <i class="ph ph-map-pin-simple-area"></i>
          <span>Riferimento: ${home.lat.toFixed(4)}, ${home.lon.toFixed(4)}</span>
          <button class="btn btn-outline btn-sm" onclick="StrumentiModule._saveHomeLocation()">Aggiorna</button>
        </div>
        <div class="form-group">
          <label>Raggio da scaricare (km)</label>
          <input type="number" min="1" max="20" step="1" value="${radius}"
            oninput="StrumentiModule._tilesRadiusChange(this.value)">
        </div>
        <p class="text-secondary text-xs">~${count} tile stimate (zoom ${TILES_ZOOM_MIN}–${TILES_ZOOM_MAX})</p>
        ${packDone && !stale
          ? `<div class="op-item op-done">
              <i class="ph ph-map-trifold"></i><span>Tile area locale (raggio ${packDone.radius}km)</span>
              <span class="op-ok"><i class="ph ph-check-circle"></i> Offline</span>
              <button class="btn btn-outline btn-sm" onclick="StrumentiModule._deleteTilesPack()">Elimina</button>
            </div>`
          : `<div class="st-tiles-action">
              <span id="st-tiles-prog" class="op-prog"></span>
              <button id="st-tiles-btn" class="btn btn-sm btn-outline" onclick="StrumentiModule._downloadTilesPack()">
                <i class="ph ph-download-simple"></i> Scarica tile per uso offline
              </button>
            </div>`}
      </div>`;
  }

  async function _requestWakeLock() {
    try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
    if (window.RSAndroid) RSAndroid.keepScreenOn(true);   // app Android: la WebView non ha Wake Lock
  }

  /* ── RENDER ── */
  function render() {
    const root = document.getElementById('strumenti-root');
    if (!root) return;

    root.innerHTML = `
      <div class="st-grid">

        <!-- TORCIA -->
        <div class="st-card st-card-center" id="st-card-torch">
          <div class="st-card-hdr"><span><span class="st-hdr-ico"><i class="ph ph-flashlight"></i></span> Torcia</span></div>
          <button class="st-big-btn${torchOn ? ' st-big-btn-on' : ''}" id="st-torch-btn" onclick="StrumentiModule.toggleTorch()" aria-label="Accendi o spegni la torcia">
            <i class="ph ${torchOn ? 'ph-lightbulb' : 'ph-flashlight'}" id="st-torch-ico"></i>
            <span id="st-torch-lbl">${torchOn ? 'Accesa' : 'Spenta'}</span>
          </button>
          <p class="st-status" id="st-torch-status">Usa il flash della fotocamera</p>
        </div>

        <!-- SEGNALE SOS -->
        <div class="st-card st-card-center" id="st-card-sos">
          <div class="st-card-hdr"><span><span class="st-hdr-ico st-hdr-ico-danger"><i class="ph ph-siren"></i></span> Segnale SOS</span></div>
          <button class="st-sos-btn${sosActive ? ' st-sos-active' : ''}" id="st-sos-btn" onclick="StrumentiModule.toggleSOS()" aria-label="Avvia o ferma il segnale SOS">
            ${sosActive ? '<i class="ph ph-stop-circle"></i><span>Ferma</span>' : '<i class="ph ph-siren"></i><span>Avvia</span>'}
          </button>
          <p class="st-status">Lampeggio dello schermo, suono e vibrazione in codice Morse. Non invia messaggi né chiamate.</p>
        </div>

        <!-- BUSSOLA -->
        <div class="st-card" id="st-card-compass">
          <div class="st-card-hdr">
            <span><span class="st-hdr-ico"><i class="ph ph-compass"></i></span> Bussola</span>
            <button class="st-toggle" id="st-compass-toggle" onclick="StrumentiModule.toggleCompass()">Attiva</button>
          </div>
          <div class="st-compass-wrap">
            <div class="compass-readout">
              <div class="compass-deg-val" id="compass-deg">—°</div>
              <div class="compass-card-val" id="compass-card">—</div>
            </div>
            <div class="compass-dialbox">${_dialSvg()}</div>
          </div>
          <p class="st-status" id="compass-status">Premi Attiva e tieni il telefono in piano</p>
        </div>

        <!-- LIVELLA -->
        <div class="st-card" id="st-card-level">
          <div class="st-card-hdr">
            <span><span class="st-hdr-ico"><i class="ph ph-ruler"></i></span> Livella</span>
            <button class="st-toggle" id="st-level-toggle" onclick="StrumentiModule.toggleLevel()">Attiva</button>
          </div>
          <div class="level-wrap">
            <div class="level-box" id="level-box">
              <div class="level-cross-h"></div><div class="level-cross-v"></div>
              <div class="level-center"></div>
              <div class="level-bubble" id="level-bubble"></div>
            </div>
            <div class="compass-deg-val" id="level-deg">—°</div>
          </div>
          <p class="st-status" id="level-status">Premi Attiva e appoggia il telefono su una superficie</p>
        </div>

        <!-- POSIZIONE -->
        <div class="st-card" id="st-card-gps">
          <div class="st-card-hdr">
            <span><span class="st-hdr-ico"><i class="ph ph-map-pin"></i></span> Posizione</span>
            <button class="st-toggle" id="st-gps-toggle" onclick="StrumentiModule.toggleGPS()">Attiva</button>
          </div>
          <div id="st-gps-content">
            <p class="st-idle-msg">Premi Attiva per leggere le coordinate: servono per dire ai soccorsi dove sei</p>
          </div>
        </div>

        <!-- MAPPA -->
        <div class="st-card st-card-full" id="st-card-map">
          <div class="st-card-hdr">
            <span><span class="st-hdr-ico"><i class="ph ph-map-trifold"></i></span> Mappa</span>
            <span class="st-map-hint" id="st-map-hint">Il punto arancione è la tua posizione</span>
          </div>
          <div class="st-map-wrap">
            <div id="st-map"></div>
            <div id="map-waypoint-hud" class="map-waypoint-hud" style="display:none"></div>
            <div id="map-back-hud" class="map-back-hud" style="display:none"></div>
            <div id="map-form" class="map-form" style="display:none"></div>
            <div class="map-tools">
              <button class="map-tool" onclick="StrumentiModule.placeHere()"><i class="ph ph-map-pin-plus"></i> <span>Segna qui</span></button>
              <button class="map-tool" id="map-btn-place-map" onclick="StrumentiModule.placeOnMap()"><i class="ph ph-hand-tap"></i> <span>Segna sulla mappa</span></button>
              <button class="map-tool" id="map-btn-rec" onclick="StrumentiModule.recToggle()"><i class="ph ph-record"></i> <span>Registra percorso</span></button>
              <button class="map-tool" id="map-btn-back" onclick="StrumentiModule.backToggle()"><i class="ph ph-arrow-u-up-left"></i> <span>Torna indietro</span></button>
            </div>
          </div>
          <div id="map-lists" class="map-lists"></div>
          <p class="st-status text-dim" style="font-size:0.72rem;margin-top:6px">
            Tile © <a href="https://openstreetmap.org" target="_blank" rel="noopener" style="color:var(--text-dim)">OpenStreetMap</a> contributors · Regioni © ISTAT CC BY
          </p>
          <div id="st-tiles-pack"></div>
        </div>

        <!-- STATO DEL TELEFONO -->
        <div class="st-card st-card-full" id="st-card-phone">
          <div class="st-card-hdr"><span><span class="st-hdr-ico"><i class="ph ph-device-mobile"></i></span> Stato del telefono</span></div>
          <div class="st-phone-grid">
            <div><div class="st-sub-lbl">Batteria</div><div id="st-battery-content"><p class="st-idle-msg">Caricamento...</p></div></div>
            <div><div class="st-sub-lbl">Rete</div><div id="st-network-content"></div></div>
          </div>
        </div>

      </div>`;

    _quickUI();
    _networkUI();
    initBattery();
    _renderTilesPack();
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
    if (levelFn) { window.removeEventListener('deviceorientation', levelFn, true); levelFn = null; }
    if (gpsWatchId !== null) { navigator.geolocation.clearWatch(gpsWatchId); gpsWatchId = null; }
    if (torchOn) toggleTorch();
    if (sosActive) _stopSOS();
    if (wakeLock) { try { wakeLock.release(); } catch(e) {} wakeLock = null; }
    if (window.RSAndroid) RSAndroid.keepScreenOn(false);
    document.body.classList.remove('map-big-open'); if (_bigHome) { document.querySelector('body > .st-map-wrap')?.remove(); _bigHome.remove(); _bigHome = null; } if (_rec) _recStop(); _back = null; _recLine = _backLine = _backShowLine = _placeLayer = null; _placeMarkers = {};
    if (_map) { _map.remove(); _map = null; _mapReady = false; _mapFixed = false; _gpsMarker = null; _gpsCircle = null; _waypointMarker = null; _waypointLine = null; _settingWaypoint = false; _layerComuni = null; _comuniEnabled = false; _comuniLoading = false; }
    window.removeEventListener('online',  _networkUI);
    window.removeEventListener('offline', _networkUI);
  }

  return {
    init, destroy, quickHtml, goTo, toggleCompass, toggleLevel, toggleGPS, toggleTorch, toggleSOS, copyCoords,
    placeHere, placeOnMap, placeSave, placeCancel, placeDel, placeGo, placeShow, recToggle, backToggle, backStart, pathDel, pathShow,
    _saveHomeLocation, _tilesRadiusChange, _downloadTilesPack, _deleteTilesPack,
  };

})();
