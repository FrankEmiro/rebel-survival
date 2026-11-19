/* ============================================================
   Modulo Condividi — Genera/importa il piano via QR code
   Usa js/vendor/qrcode (libreria locale, nessuna dipendenza CDN)
   ============================================================ */
const CondividiModule = (() => {
  // Margine di sicurezza sotto il limite reale (~2953 byte a versione 40-L)
  const QR_MAX_BYTES = 2200;

  let scanStream   = null;
  let scanRAF      = null;
  let scanDetector = null;

  function _buildPayloadString() {
    return JSON.stringify(Storage.exportAll());
  }

  /* ── MODAL ── */
  function open() {
    if (document.getElementById('condividi-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'disclaimer-overlay';
    overlay.id = 'condividi-overlay';
    overlay.innerHTML = `
      <div class="disclaimer-modal condividi-modal">
        <div class="disclaimer-header">
          <i class="ph ph-qr-code"></i>
          <h2>Condividi piano</h2>
        </div>
        <div class="condividi-tabs">
          <button class="condividi-tab active" data-ctab="genera" onclick="CondividiModule._tab('genera')">
            <i class="ph ph-qr-code"></i> Genera QR
          </button>
          <button class="condividi-tab" data-ctab="importa" onclick="CondividiModule._tab('importa')">
            <i class="ph ph-camera"></i> Importa
          </button>
        </div>
        <div class="disclaimer-body" id="condividi-panel"></div>
        <button class="disclaimer-btn" onclick="CondividiModule.close()">
          <i class="ph ph-x"></i> Chiudi
        </button>
      </div>`;
    document.body.appendChild(overlay);
    _tab('genera');
  }

  function close() {
    _stopScan();
    const overlay = document.getElementById('condividi-overlay');
    if (overlay) overlay.remove();
  }

  function _tab(id) {
    document.querySelectorAll('.condividi-tab').forEach(b => b.classList.toggle('active', b.dataset.ctab === id));
    if (id !== 'importa') _stopScan();
    const panel = document.getElementById('condividi-panel');
    if (!panel) return;
    panel.innerHTML = id === 'genera' ? _renderGenera() : _renderImporta();
    if (id === 'genera') _renderQr();
  }

  /* ── GENERA ── */
  function _renderGenera() {
    const str = _buildPayloadString();
    const bytes = new Blob([str]).size;
    if (bytes > QR_MAX_BYTES) {
      return `
        <div class="alert alert-warning">
          <span>⚠️</span>
          <div>Il piano salvato è troppo grande (${bytes} byte) per un singolo QR code (limite ~${QR_MAX_BYTES} byte). Usa <strong>Esporta</strong> nelle Piano per condividere il file JSON completo.</div>
        </div>`;
    }
    return `
      <p class="text-secondary text-sm mb-12">Fai inquadrare questo codice da un altro dispositivo con l'app aperta per copiare dimensioni, checklist kit e task.</p>
      <div id="condividi-qr" class="condividi-qr"></div>
      <p class="text-secondary text-xs mt-8" style="text-align:center">${bytes} / ${QR_MAX_BYTES} byte usati</p>`;
  }

  function _renderQr() {
    const el = document.getElementById('condividi-qr');
    if (!el || typeof qrcode === 'undefined') return;
    try {
      const qr = qrcode(0, 'L'); // 0 = versione automatica (la più piccola che contiene i dati)
      qr.addData(_buildPayloadString());
      qr.make();
      el.innerHTML = qr.createSvgTag(4);
    } catch(e) {
      el.innerHTML = `<p class="text-secondary text-sm">Impossibile generare il codice.</p>`;
    }
  }

  /* ── IMPORTA ── */
  function _renderImporta() {
    const supportsScan = 'BarcodeDetector' in window;
    return `
      ${supportsScan ? `
        <button class="btn btn-outline btn-full mb-12" id="condividi-scan-btn" onclick="CondividiModule._toggleScan()">
          <i class="ph ph-camera"></i> Scansiona con la fotocamera
        </button>
        <div id="condividi-scan-wrap" class="condividi-scan-wrap hidden">
          <video id="condividi-video" playsinline muted></video>
        </div>` : `
        <div class="alert alert-info mb-12">
          <span>ℹ️</span>
          <div>Il tuo browser non supporta la scansione diretta. Usa una qualsiasi app fotocamera/QR per leggere il codice, poi incolla qui sotto il testo ottenuto.</div>
        </div>`}
      <div class="form-group">
        <label>Testo del codice</label>
        <textarea id="condividi-paste" rows="4" placeholder="Incolla qui i dati letti dal QR..."></textarea>
      </div>
      <button class="btn btn-primary btn-full" onclick="CondividiModule._importPasted()">
        <i class="ph ph-download-simple"></i> Importa
      </button>
      <p id="condividi-import-msg" class="text-secondary text-sm mt-8"></p>`;
  }

  async function _toggleScan() {
    if (scanStream) { _stopScan(); return; }
    const wrap  = document.getElementById('condividi-scan-wrap');
    const video = document.getElementById('condividi-video');
    const btn   = document.getElementById('condividi-scan-btn');
    const msg   = document.getElementById('condividi-import-msg');
    try {
      scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = scanStream;
      await video.play();
      if (wrap) wrap.classList.remove('hidden');
      if (btn)  btn.innerHTML = '<i class="ph ph-x"></i> Ferma scansione';
      scanDetector = new BarcodeDetector({ formats: ['qr_code'] });
      _scanLoop(video);
    } catch(e) {
      _stopScan();
      if (msg) msg.textContent = 'Impossibile accedere alla fotocamera.';
    }
  }

  function _scanLoop(video) {
    if (!scanStream) return;
    scanDetector.detect(video).then(codes => {
      if (codes.length > 0) { _handleImportString(codes[0].rawValue); _stopScan(); return; }
      scanRAF = requestAnimationFrame(() => _scanLoop(video));
    }).catch(() => {
      scanRAF = requestAnimationFrame(() => _scanLoop(video));
    });
  }

  function _stopScan() {
    if (scanRAF) cancelAnimationFrame(scanRAF);
    scanRAF = null;
    scanDetector = null;
    if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
    const wrap = document.getElementById('condividi-scan-wrap');
    if (wrap) wrap.classList.add('hidden');
    const btn = document.getElementById('condividi-scan-btn');
    if (btn) btn.innerHTML = '<i class="ph ph-camera"></i> Scansiona con la fotocamera';
  }

  function _importPasted() {
    const ta = document.getElementById('condividi-paste');
    if (!ta || !ta.value.trim()) return;
    _handleImportString(ta.value.trim());
  }

  function _handleImportString(str) {
    const msg = document.getElementById('condividi-import-msg');
    try {
      const payload = JSON.parse(str);
      if (!confirm(I18n.t('Importare questo piano? I dati attuali verranno sovrascritti.'))) return;
      Storage.importAll(payload);
      if (typeof SettingsModule !== 'undefined') SettingsModule.init();
      if (typeof DashboardModule !== 'undefined') DashboardModule.render();
      if (msg) msg.textContent = 'Piano importato correttamente.';
      setTimeout(close, 1200);
    } catch(e) {
      if (msg) msg.textContent = 'Codice non valido o corrotto.';
    }
  }

  return { open, close, _tab, _toggleScan, _importPasted };
})();
