/* ============================================================
   Modulo Guide — Hybrid format: quick-ref + collapsible detail
   Reads from GUIDES_DATA (js/data/guides.js)
   ============================================================ */
const GuideModule = (() => {
  let initialized = false;
  let activeCategory = 'all';
  let searchQuery = '';
  let openSections = {};   // guideId -> Set of open section indices
  let openGuides = {};     // guideId -> bool (quick-ref expanded)

  /* ── build category filter bar ── */
  function _catBar() {
    return `<div class="guide-cat-bar" id="guide-cat-bar">
      ${GUIDE_CATEGORIES.map(c => `
        <button class="guide-cat-btn${c.id === activeCategory ? ' active' : ''}"
                onclick="GuideModule._setCategory('${c.id}')">
          <i class="ph ${c.icon}"></i> ${c.label}
        </button>
      `).join('')}
    </div>`;
  }

  /* ── render one guide card ── */
  function _card(g) {
    const isOpen = !!openGuides[g.id];
    const sections = openSections[g.id] || new Set();

    const quickRefItems = g.quickRef.map((line, i) =>
      `<li class="qr-item"><i class="ph ph-check-circle qr-icon"></i>${line}</li>`
    ).join('');

    const sectionBlocks = (g.sections || []).map((sec, i) => {
      const expanded = sections.has(i);
      const slug = sec.heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      const imgSrc = `/js/images/guides/${g.id}--${slug}.webp`;

      let body = '';
      if (sec.steps) {
        body = `<ol class="guide-steps">${sec.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
      } else if (sec.content) {
        body = `<p class="guide-sec-content">${sec.content}</p>`;
      }

      return `
        <div class="guide-sec${expanded ? ' open' : ''}">
          <button class="guide-sec-btn" onclick="GuideModule._toggleSection('${g.id}', ${i})">
            <span>${sec.heading}</span>
            <i class="ph ${expanded ? 'ph-caret-up' : 'ph-caret-down'}"></i>
          </button>
          <div class="guide-sec-body">
            <img class="guide-sec-img" src="${imgSrc}" alt="${sec.heading}"
                 onerror="this.style.display='none'" loading="lazy">
            ${body}
          </div>
        </div>`;
    }).join('');

    const related = (g.relatedGuides || []).map(rid => {
      const r = GUIDES_DATA.find(x => x.id === rid);
      if (!r || !guideVisible(rid)) return '';
      return `<button class="guide-related-btn" onclick="GuideModule.openGuide('${rid}')">
        <i class="ph ${r.icon}"></i> ${r.title}
      </button>`;
    }).join('');

    const caution = (typeof GUIDE_CAUTION !== 'undefined') ? GUIDE_CAUTION[g.id] : null;
    const cautionBadge = caution
      ? `<span class="guide-caution-badge"><i class="ph ph-warning"></i> Cautela</span>` : '';
    const cautionBox = caution
      ? `<div class="guide-caution" role="alert"><i class="ph ph-warning-octagon"></i>
           <div><strong>Attenzione — da usare con cautela</strong><p>${GUIDE_CAUTION_TEXT[caution]}</p></div>
         </div>` : '';

    return `
      <div class="guide-card2${isOpen ? ' open' : ''}" id="guide2-${g.id}">
        <div class="guide-card2-header" onclick="GuideModule._toggleCard('${g.id}')">
          <div class="guide-card2-icon"><i class="ph ${g.icon}"></i></div>
          <div class="guide-card2-meta">
            <div class="guide-card2-title">${g.title}</div>
            <div class="guide-card2-sub">
              <span class="guide-source">${g.source}</span>
              <span class="guide-readtime"><i class="ph ph-clock"></i> ${g.readTime}</span>
              ${cautionBadge}
            </div>
          </div>
          <i class="ph ph-caret-down guide-card2-chevron"></i>
        </div>

        <div class="guide-card2-body">
          ${cautionBox}
          <!-- Quick Ref box — always first -->
          <div class="guide-quickref">
            <div class="guide-qr-label"><i class="ph ph-lightning-fill"></i> In breve — leggi in 30 secondi</div>
            <ul class="guide-qr-list">${quickRefItems}</ul>
          </div>

          <!-- Collapsible detail sections -->
          ${sectionBlocks ? `<div class="guide-sections">${sectionBlocks}</div>` : ''}

          <!-- Related guides -->
          ${related ? `<div class="guide-related"><span class="guide-related-label">Correlate:</span>${related}</div>` : ''}
        </div>
      </div>`;
  }

  /* ── filter and render guide list ── */
  function _renderList() {
    const list = document.getElementById('guide-list');
    if (!list) return;

    const q = searchQuery.toLowerCase();
    const visible = GUIDES_DATA.filter(g => {
      if (!guideVisible(g.id)) return false;
      if (activeCategory !== 'all' && g.category !== activeCategory) return false;
      if (q) {
        const hay = (g.title + ' ' + g.source + ' ' + g.quickRef.join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (visible.length === 0) {
      list.innerHTML = `<div class="guide-empty">
        <i class="ph ph-magnifying-glass"></i>
        <p>Nessuna guida trovata per "<strong>${Utils.escapeHtml(searchQuery)}</strong>"</p>
      </div>`;
      return;
    }

    list.innerHTML = visible.map(_card).join('');
  }

  /* ── public: toggle full card open/close ── */
  function _toggleCard(id) {
    openGuides[id] = !openGuides[id];
    _renderList();
    if (openGuides[id]) {
      // Scroll to card
      requestAnimationFrame(() => {
        const el = document.getElementById('guide2-' + id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  /* ── public: toggle one section inside a guide ── */
  function _toggleSection(guideId, idx) {
    if (!openSections[guideId]) openSections[guideId] = new Set();
    const s = openSections[guideId];
    s.has(idx) ? s.delete(idx) : s.add(idx);
    _renderList();
  }

  /* ── public: set category filter ── */
  function _setCategory(cat) {
    activeCategory = cat;
    _refreshCatBar();
    _renderList();
  }

  function _refreshCatBar() {
    const bar = document.getElementById('guide-cat-bar');
    if (!bar) return;
    bar.querySelectorAll('.guide-cat-btn').forEach(btn => {
      const m = btn.getAttribute('onclick').match(/'([^']+)'/);
      const cat = m ? m[1] : null;
      btn.classList.toggle('active', cat === activeCategory);
    });
  }

  /* ── init ── */
  function init() {
    if (initialized) return;
    const root = document.getElementById('guide-root');
    if (!root) return;
    initialized = true;

    root.innerHTML = `
      <div id="offline-pack-slot"></div>
      <div class="alert alert-success mb-12">
        <i class="ph ph-wifi-slash"></i>
        <div><strong>${GUIDES_DATA.filter(g => guideVisible(g.id)).length} guide disponibili offline</strong> — nessuna connessione necessaria.</div>
      </div>

      ${_catBar()}

      <div class="guide-search-wrap">
        <i class="ph ph-magnifying-glass guide-search-icon"></i>
        <input type="text" id="guide-search" class="guide-search-input"
               placeholder="Cerca nelle guide..." oninput="GuideModule._onSearch(this.value)">
      </div>

      <div id="guide-list"></div>

      <div class="card mt-16">
        <div class="flex-between mb-12">
          <h3><i class="ph ph-printer"></i> Stampa / Salva PDF</h3>
        </div>
        <p class="text-secondary text-sm mb-12">Stampa le guide o salvale come PDF per averle offline senza dispositivi.</p>
        <div class="guide-print-actions">
          <button class="btn btn-secondary" onclick="GuideModule.printAll()">
            <i class="ph ph-printer"></i> Stampa
          </button>
          <button class="btn btn-primary" onclick="GuideModule.savePdf()">
            <i class="ph ph-file-pdf"></i> Salva come PDF
          </button>
        </div>
        <p id="guide-pdf-hint" class="guide-pdf-hint hidden">
          <i class="ph ph-info"></i> Nella finestra che si apre, imposta <strong>Destinazione → Salva come PDF</strong> e clicca Salva.
        </p>
      </div>

      <!-- GUIDE UFFICIALI PROTEZIONE CIVILE -->
      <div class="pc-guides-section mt-16">
        <div class="pc-guides-header">
          <i class="ph ph-shield-star"></i>
          <div>
            <div class="pc-guides-title">Guide Ufficiali — Protezione Civile</div>
            <div class="pc-guides-sub">Licenza CC BY 4.0 · Fonte: sito Io non rischio. Dipartimento della Protezione Civile — Presidenza del Consiglio dei Ministri</div>
          </div>
        </div>
        <div class="pc-guides-grid">
          ${PC_GUIDES.map(g => `
            <a class="pc-guide-card" href="${g.file}" target="_blank" rel="noopener">
              <div class="pc-guide-icon"><i class="ph ${g.icon}"></i></div>
              <div class="pc-guide-info">
                <div class="pc-guide-name">${g.name}</div>
                <div class="pc-guide-desc">${g.desc}</div>
              </div>
              <i class="ph ph-file-pdf pc-guide-arrow"></i>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    if (typeof DashboardModule !== 'undefined') DashboardModule.refreshOfflineCard();
    _renderList();
  }

  /* ── public: search handler ── */
  function _onSearch(val) {
    searchQuery = val.trim();
    _renderList();
  }

  /* ── public: open a specific guide by guide id or task id ── */
  function openGuide(id) {
    // Check if it's a task id — find guide that has this task
    let guide = GUIDES_DATA.find(g => g.id === id);
    if (!guide) {
      guide = GUIDES_DATA.find(g => g.tasks && g.tasks.includes(id));
    }
    if (!guide) return;

    // Navigate to guide section
    if (typeof navigateTo === 'function') navigateTo('guide');

    // Wait for section to be visible, then open the card
    setTimeout(() => {
      // Reset to all categories so the guide is visible
      activeCategory = 'all';
      searchQuery = '';
      const inp = document.getElementById('guide-search');
      if (inp) inp.value = '';
      _refreshCatBar();

      openGuides[guide.id] = true;
      if (!openSections[guide.id]) {
        // Open all sections by default when navigating from a task
        openSections[guide.id] = new Set((guide.sections || []).map((_, i) => i));
      }
      _renderList();

      requestAnimationFrame(() => {
        const el = document.getElementById('guide2-' + guide.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }, 150);
  }

  /* ── print / pdf helpers ── */
  function _openAll() {
    GUIDES_DATA.forEach(g => {
      openGuides[g.id] = true;
      openSections[g.id] = new Set((g.sections || []).map((_, i) => i));
    });
    _renderList();
  }

  function printAll() {
    _openAll();
    const section = document.getElementById('section-guide');
    section.classList.add('print-target');
    setTimeout(() => {
      window.print();
      section.classList.remove('print-target');
    }, 300);
  }

  function savePdf() {
    const hint = document.getElementById('guide-pdf-hint');
    if (hint) {
      hint.classList.remove('hidden');
      setTimeout(() => hint.classList.add('hidden'), 8000);
    }

    _openAll();

    const section = document.getElementById('section-guide');
    section.classList.add('print-target');
    const prevTitle = document.title;
    document.title = 'Rebel-Survival-Guide-Offline';

    setTimeout(() => {
      window.print();
      section.classList.remove('print-target');
      const restore = () => { document.title = prevTitle; window.removeEventListener('afterprint', restore); };
      window.addEventListener('afterprint', restore);
    }, 300);
  }

  // il filtro «cautela» del Profilo è cambiato: alla prossima apertura l'elenco si ricostruisce
  function reset() { initialized = false; }

  return { init, reset, openGuide, printAll, savePdf, _toggleCard, _toggleSection, _setCategory, _onSearch };
})();
