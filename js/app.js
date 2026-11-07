/**
 * The Sacred Timeline - Official Marvel Studios Cinematic Universe Tracker
 * Supports:
 * - Official Sacred Timeline (Disney+ & Official DK Timeline Book)
 * - 84 Verified Canon Titles
 * - Streamlined Sidebar Navigation: All Timeline, Films, and TV Series
 * - In-Universe Timeline Eras & Chronological Milestones
 * - GlassDash UI with Dark Emerald & Light Frost themes
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'mcu_glassdash_tracker_v4';

  // Application State
  const state = {
    theme: 'dark', // 'dark' | 'light'
    items: (typeof MCU_TIMELINE_DATA !== 'undefined') ? MCU_TIMELINE_DATA : [],
    watched: new Set(),
    ratings: {},
    notes: {},
    datesWatched: {},
    sidebarFilter: 'all', // 'all' (84) | 'films' (39) | 'tv' (45)
    searchTerm: '',
    filterType: 'all', // 'all', 'movie', 'series', 'animation', 'oneshot', 'special'
    filterPhase: 'all',
    filterSaga: 'all',
    filterStatus: 'all',
    sortBy: 'chronological', // 'chronological', 'release', 'title'
    viewMode: 'table', // 'table' (default, matches screenshot) | 'grid'
    activeNoteId: null
  };

  // DOM Elements cache
  const elements = {
    // Theme toggle
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    themeLabel: document.getElementById('theme-label'),

    // Sidebar navigation (Simplified to All, Films, TV Series)
    sidebarLinks: document.querySelectorAll('.sidebar-link[data-nav-filter]'),
    badgeCountAll: document.getElementById('badge-count-all'),
    badgeCountFilms: document.getElementById('badge-count-films'),
    badgeCountTv: document.getElementById('badge-count-tv'),
    currentScopeBreadcrumb: document.getElementById('current-scope-breadcrumb'),
    pageHeading: document.getElementById('page-heading'),

    // KPI Metrics
    totalWatchedCount: document.getElementById('total-watched-count'),
    totalItemsCount: document.getElementById('total-items-count'),
    totalPercentText: document.getElementById('total-percent-text'),
    statMovies: document.getElementById('stat-movies'),
    statSeries: document.getElementById('stat-series'),
    statInfinity: document.getElementById('stat-infinity'),
    statMultiverse: document.getElementById('stat-multiverse'),

    // Up Next section
    upNextSection: document.getElementById('up-next-section'),

    // Search and controls
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    phaseFilter: document.getElementById('phase-filter'),
    sagaFilter: document.getElementById('saga-filter'),
    sortSelect: document.getElementById('sort-select'),
    typePills: document.querySelectorAll('[data-filter-type]'),
    statusPills: document.querySelectorAll('[data-filter-status]'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewTableBtn: document.getElementById('view-table-btn'),

    // Bulk actions
    bulkMarkBtn: document.getElementById('bulk-mark-btn'),
    bulkUnmarkBtn: document.getElementById('bulk-unmark-btn'),
    resetBtn: document.getElementById('reset-btn'),
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),

    // Timeline container
    timelineContainer: document.getElementById('timeline-container'),
    resultsCount: document.getElementById('results-count'),

    // Modals
    noteModal: document.getElementById('note-modal'),
    noteModalTitle: document.getElementById('note-modal-title'),
    noteTextarea: document.getElementById('note-textarea'),
    noteDateInput: document.getElementById('note-date-input'),
    noteSaveBtn: document.getElementById('note-save-btn'),
    noteCloseBtns: document.querySelectorAll('.close-note-modal'),

    importModal: document.getElementById('import-modal'),
    importFile: document.getElementById('import-file'),
    importTextarea: document.getElementById('import-textarea'),
    importSubmitBtn: document.getElementById('import-submit-btn'),
    importCloseBtns: document.querySelectorAll('.close-import-modal'),

    confirmModal: document.getElementById('confirm-modal'),
    confirmModalMsg: document.getElementById('confirm-modal-msg'),
    confirmModalOk: document.getElementById('confirm-modal-ok'),
    confirmCloseBtns: document.querySelectorAll('.close-confirm-modal'),

    // Toast
    toastContainer: document.getElementById('toast-container'),

    // Realtime Updates & Sync
    checkUpdatesBtn: document.getElementById('check-updates-btn'),
    syncIcon: document.getElementById('sync-icon'),
    syncLabel: document.getElementById('sync-label'),
    syncBadge: document.getElementById('sync-badge'),
    updateToastBanner: document.getElementById('update-toast-banner'),
    updateToastText: document.getElementById('update-toast-text'),
    updateToastViewBtn: document.getElementById('update-toast-view-btn'),
    updateToastDismissBtn: document.getElementById('update-toast-dismiss-btn')
  };

  /**
   * Helper: Generate colorful avatar initials like GlassDash table
   */
  function getAvatarData(title) {
    const clean = title.replace(/^(Marvel Studios One-Shot:\s*|Marvel's\s*|Marvel Studios\s*)/i, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    let initials = 'MC';
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].slice(0, 2).toUpperCase();
    } else if (words.length === 1) {
      initials = words[0][0].toUpperCase() + 'U';
    }

    const colors = [
      'avatar-emerald', 
      'avatar-amber', 
      'avatar-cyan', 
      'avatar-coral', 
      'avatar-purple', 
      'avatar-blue'
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) & 0xffffff;
    const colorClass = colors[Math.abs(hash) % colors.length];
    return { initials, colorClass };
  }

  /**
   * Theme Switcher (Temporal Loom Dark Mode vs TVA Archival Paper Light Mode)
   */
  function setTheme(theme) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    if (elements.themeIcon && elements.themeLabel) {
      if (theme === 'light') {
        elements.themeIcon.textContent = '⏳';
        elements.themeLabel.textContent = 'Temporal Loom Mode';
      } else {
        elements.themeIcon.textContent = '📜';
        elements.themeLabel.textContent = 'TVA Archive Mode';
      }
    }
    saveState();
    showToast(`Switched to ${theme === 'light' ? 'TVA Archive' : 'Temporal Loom'} Mode`, 'info');
  }

  function toggleTheme() {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  }

  /**
   * Set Active Navigation Filter: 'all' | 'films' | 'tv'
   */
  function setNavFilter(filter) {
    state.sidebarFilter = filter;
    
    // Reset specific type pill when switching major sidebar sections
    state.filterType = 'all';

    elements.sidebarLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.navFilter === filter);
    });

    // Sync filter pills in controls bar
    elements.typePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.filterType === 'all');
    });

    // Update breadcrumbs and titles
    if (elements.currentScopeBreadcrumb && elements.pageHeading) {
      if (filter === 'films') {
        elements.currentScopeBreadcrumb.textContent = 'Feature Films';
        elements.pageHeading.textContent = 'MCU Feature Films';
      } else if (filter === 'tv') {
        elements.currentScopeBreadcrumb.textContent = 'TV Series & Specials';
        elements.pageHeading.textContent = 'MCU Series & Specials';
      } else {
        elements.currentScopeBreadcrumb.textContent = 'The Sacred Timeline';
        elements.pageHeading.textContent = 'The Sacred Timeline';
      }
    }

    saveState();
    updateUI();
  }

  /**
   * Load state from localStorage
   */
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || 
                    localStorage.getItem('mcu_glassdash_tracker_v3') || 
                    localStorage.getItem('mcu_timeline_tracker_v2') || 
                    localStorage.getItem('mcu_timeline_tracker_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.watched)) {
          state.watched = new Set(parsed.watched);
        }
        state.ratings = parsed.ratings || {};
        state.notes = parsed.notes || {};
        state.datesWatched = parsed.datesWatched || {};
        if (parsed.viewMode) state.viewMode = parsed.viewMode;
        if (parsed.sortBy) state.sortBy = parsed.sortBy;
        if (parsed.sidebarFilter) state.sidebarFilter = parsed.sidebarFilter;
        if (parsed.theme) state.theme = parsed.theme;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
  }

  /**
   * Save state to localStorage
   */
  function saveState() {
    try {
      const dataToSave = {
        theme: state.theme,
        sidebarFilter: state.sidebarFilter,
        watched: Array.from(state.watched),
        ratings: state.ratings,
        notes: state.notes,
        datesWatched: state.datesWatched,
        viewMode: state.viewMode,
        sortBy: state.sortBy
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  /**
   * Show Toast Notification
   */
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span style="font-weight:bold; color:var(--emerald-400);">${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /**
   * Toggle Watched Status for an item
   */
  function toggleWatched(id) {
    const item = state.items.find(i => i.id === id);
    const title = item ? item.title : 'Title';

    if (state.watched.has(id)) {
      state.watched.delete(id);
      showToast(`Unmarked "${title}"`, 'info');
    } else {
      state.watched.add(id);
      showToast(`Watched "${title}"!`, 'success');
      if (!state.datesWatched[id]) {
        state.datesWatched[id] = new Date().toISOString().split('T')[0];
      }
    }

    saveState();
    updateUI();
  }

  /**
   * Set rating for an item (1 to 5)
   */
  function setRating(id, rating) {
    if (state.ratings[id] === rating) {
      delete state.ratings[id];
      showToast('Rating cleared', 'info');
    } else {
      state.ratings[id] = rating;
      showToast(`Rated ${rating} ★`, 'success');
      if (!state.watched.has(id)) {
        state.watched.add(id);
      }
    }
    saveState();
    updateUI();
  }

  /**
   * Open Notes Modal
   */
  function openNoteModal(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    state.activeNoteId = id;
    elements.noteModalTitle.textContent = `Notes: ${item.title}`;
    elements.noteTextarea.value = state.notes[id] || '';
    elements.noteDateInput.value = state.datesWatched[id] || '';
    elements.noteModal.classList.add('active');
    elements.noteTextarea.focus();
  }

  function closeNoteModal() {
    state.activeNoteId = null;
    elements.noteModal.classList.remove('active');
  }

  function saveNote() {
    if (!state.activeNoteId) return;
    const noteText = elements.noteTextarea.value.trim();
    const dateVal = elements.noteDateInput.value;

    if (noteText) state.notes[state.activeNoteId] = noteText;
    else delete state.notes[state.activeNoteId];

    if (dateVal) state.datesWatched[state.activeNoteId] = dateVal;
    else delete state.datesWatched[state.activeNoteId];

    saveState();
    closeNoteModal();
    showToast('Saved notes & viewing date', 'success');
    updateUI();
  }

  /**
   * Get items matching sidebar filter (all, films, tv)
   */
  function getScopedItems() {
    if (state.sidebarFilter === 'films') {
      return state.items.filter(i => i.type === 'movie');
    }
    if (state.sidebarFilter === 'tv') {
      return state.items.filter(i => i.type !== 'movie');
    }
    return state.items;
  }

  /**
   * Get filtered and sorted list of items
   */
  function getFilteredItems() {
    const scoped = getScopedItems();

    return scoped.filter(item => {
      // Search query
      if (state.searchTerm) {
        const query = state.searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = (item.description && item.description.toLowerCase().includes(query)) ||
                            (item.bookNote && item.bookNote.toLowerCase().includes(query));
        const matchesPhase = item.phase && item.phase.toLowerCase().includes(query);
        const matchesEra = item.timelineEra && item.timelineEra.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesPhase && !matchesEra) return false;
      }

      // Type filter
      if (state.filterType !== 'all') {
        if (item.type !== state.filterType) return false;
      }

      // Phase filter
      if (state.filterPhase !== 'all') {
        if (item.phase !== state.filterPhase) return false;
      }

      // Saga filter
      if (state.filterSaga !== 'all') {
        if (item.saga !== state.filterSaga) return false;
      }

      // Status filter
      if (state.filterStatus === 'watched' && !state.watched.has(item.id)) return false;
      if (state.filterStatus === 'unwatched' && state.watched.has(item.id)) return false;

      return true;
    }).sort((a, b) => {
      if (state.sortBy === 'chronological') {
        return a.order - b.order;
      } else if (state.sortBy === 'release') {
        if (a.releaseYear !== b.releaseYear) return a.releaseYear - b.releaseYear;
        return a.releaseOrder - b.releaseOrder;
      } else if (state.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return a.order - b.order;
    });
  }

  /**
   * Update Progress & KPI Metrics
   */
  function updateStats() {
    const scoped = getScopedItems();
    const total = scoped.length;
    const watchedInScope = scoped.filter(i => state.watched.has(i.id)).length;
    const percentage = total > 0 ? ((watchedInScope / total) * 100).toFixed(1) : 0;

    if (elements.totalWatchedCount) elements.totalWatchedCount.textContent = watchedInScope;
    if (elements.totalItemsCount) elements.totalItemsCount.textContent = total;
    if (elements.totalPercentText) elements.totalPercentText.textContent = `+${percentage}%`;

    // KPI 2: Movies
    const allMovies = state.items.filter(i => i.type === 'movie');
    const moviesWatched = allMovies.filter(i => state.watched.has(i.id)).length;
    if (elements.statMovies) elements.statMovies.innerHTML = `${moviesWatched} <small>/ ${allMovies.length}</small>`;

    // KPI 3: TV Series & Specials
    const allSeries = state.items.filter(i => i.type !== 'movie');
    const seriesWatched = allSeries.filter(i => state.watched.has(i.id)).length;
    if (elements.statSeries) elements.statSeries.innerHTML = `${seriesWatched} <small>/ ${allSeries.length}</small>`;

    // KPI 4: Sagas
    const infinity = state.items.filter(i => i.saga === 'The Infinity Saga');
    const infinityWatched = infinity.filter(i => state.watched.has(i.id)).length;
    if (elements.statInfinity) elements.statInfinity.textContent = `${infinityWatched}/${infinity.length}`;

    const multiverse = state.items.filter(i => i.saga === 'The Multiverse Saga');
    const multiverseWatched = multiverse.filter(i => state.watched.has(i.id)).length;
    if (elements.statMultiverse) elements.statMultiverse.textContent = `${multiverseWatched}/${multiverse.length}`;

    // Sidebar count badges
    if (elements.badgeCountAll) elements.badgeCountAll.textContent = state.items.length;
    if (elements.badgeCountFilms) elements.badgeCountFilms.textContent = allMovies.length;
    if (elements.badgeCountTv) elements.badgeCountTv.textContent = allSeries.length;
  }

  /**
   * Update Up Next Hero Glass Panel
   */
  function updateUpNext() {
    const scoped = getScopedItems().sort((a, b) => a.order - b.order);
    const nextItem = scoped.find(item => !state.watched.has(item.id));

    if (!nextItem) {
      elements.upNextSection.innerHTML = `
        <div class="up-next-glass-panel" style="border-color: var(--tva-orange-500); background: rgba(249, 115, 22, 0.1);">
          <div class="up-next-inner">
            <div>
              <div class="up-next-tag-row">
                <span class="up-next-indicator" style="color:var(--tva-orange-400);">🏆 SACRED TIMELINE FULLY STABILIZED</span>
              </div>
              <h3 class="up-next-title-text">All timeline branches are secured &amp; monitored!</h3>
              <p class="up-next-desc-text">
                All ${scoped.length} canonical titles in the active universe view have been verified.
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    elements.upNextSection.innerHTML = `
      <div class="up-next-glass-panel">
        <div class="up-next-inner">
          <div style="flex:1; min-width:280px;">
            <div class="up-next-tag-row">
              <span class="up-next-indicator">Temporal Loom Monitor • Up Next</span>
              <span class="badge-glass-order">#${nextItem.order}</span>
              <span class="badge-era" title="${nextItem.bookNote || ''}">📖 ${nextItem.timelineEra}</span>
              <span class="badge-canon">Disney+ &amp; Book</span>
            </div>
            <h3 class="up-next-title-text">${nextItem.title}</h3>
            <div class="up-next-meta-text">
              <span>📅 ${nextItem.releaseYear}</span>
              <span>•</span>
              <span>⏱️ ${nextItem.duration}</span>
              <span>•</span>
              <span>🏷️ ${nextItem.phase}</span>
              <span>•</span>
              <span>📂 ${nextItem.saga}</span>
            </div>
            <p class="up-next-desc-text">${nextItem.bookNote || nextItem.description}</p>
          </div>

          <div class="up-next-action-group">
            <button class="btn-glass btn-primary-green" id="btn-watch-next" data-id="${nextItem.id}">
              ✓ Mark Watched
            </button>
            <a href="${nextItem.imdbLink}" target="_blank" rel="noopener noreferrer" class="btn-glass" title="View on IMDb">
              <span class="imdb-badge">IMDb</span> ↗
            </a>
            <a href="${nextItem.disneyLink}" target="_blank" rel="noopener noreferrer" class="btn-glass" title="Stream on Disney+">
              Stream ↗
            </a>
          </div>
        </div>
      </div>
    `;

    const watchBtn = document.getElementById('btn-watch-next');
    if (watchBtn) {
      watchBtn.addEventListener('click', () => toggleWatched(nextItem.id));
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'movie': return 'Feature Film';
      case 'series': return 'TV Series';
      case 'animation': return 'Animated Series';
      case 'oneshot': return 'Marvel One-Shot';
      case 'special': return 'Special';
      default: return type;
    }
  }

  /**
   * Star rating widget generator
   */
  function renderStars(id, currentRating = 0) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      const active = i <= currentRating ? 'active' : '';
      starsHtml += `<span class="star ${active}" data-star-id="${id}" data-star-val="${i}">★</span>`;
    }
    return `<div class="star-rating" title="Rate this title">${starsHtml}</div>`;
  }

  /**
   * Render Recent Transactions Style Glass Table
   */
  function renderTableView(items) {
    if (items.length === 0) return renderEmptyState();

    return `
      <div class="table-container-card">
        <div class="table-glass-header">
          <div>
            <h3>TVA Sacred Timeline Archive</h3>
            <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-muted);">
              Codified by Disney+ &amp; Marvel Studios: An Official Timeline (DK Books)
            </span>
          </div>
          <span style="font-size:0.75rem; font-weight:700; color:var(--tva-orange-400); background:rgba(249,115,22,0.15); padding:0.25rem 0.65rem; border-radius:12px;">
            ${items.length} Titles
          </span>
        </div>

        <table class="glass-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">Done</th>
              <th style="width: 65px;">Order</th>
              <th>Title &amp; In-Universe Era</th>
              <th>Type</th>
              <th>Year</th>
              <th>Status</th>
              <th>Rating</th>
              <th style="text-align: right;">Links</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const isWatched = state.watched.has(item.id);
              const rating = state.ratings[item.id] || 0;
              const hasNote = !!state.notes[item.id];
              const primaryLink = item.disneyLink || item.imdbLink;
              const { initials, colorClass } = getAvatarData(item.title);

              return `
                <tr class="${isWatched ? 'row-watched' : ''}">
                  <td style="text-align: center;">
                    <button 
                      class="watch-check-btn ${isWatched ? 'checked' : ''}" 
                      data-check-id="${item.id}"
                      title="${isWatched ? 'Mark unwatched' : 'Mark watched'}">
                      ${isWatched ? '✓' : ''}
                    </button>
                  </td>
                  <td>
                    <span class="badge-glass-order">#${item.order}</span>
                  </td>
                  <td>
                    <div class="table-title-cell">
                      <div class="title-avatar ${colorClass}">${initials}</div>
                      <div class="title-info">
                        <a href="${primaryLink}" target="_blank" rel="noopener noreferrer" class="title-name">
                          ${item.title}
                        </a>
                        <div style="display:flex; align-items:center; gap:0.4rem; margin-top:3px; flex-wrap:wrap;">
                          <span class="badge-era" title="${item.bookNote || ''}">📖 ${item.timelineEra}</span>
                          <span class="title-subline">${item.phase} • ${item.saga}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge-type ${item.type}">${getTypeLabel(item.type)}</span>
                    <div style="margin-top: 3px;">
                      <span class="badge-canon" title="Official Marvel Studios Timeline">Disney+ &amp; Book</span>
                    </div>
                  </td>
                  <td style="color:var(--text-muted); font-weight:600;">${item.releaseYear}</td>
                  <td>
                    <span class="status-pill ${isWatched ? 'status-completed' : 'status-unwatched'}">
                      ${isWatched ? '● Completed' : '○ Unwatched'}
                    </span>
                  </td>
                  <td>
                    ${renderStars(item.id, rating)}
                  </td>
                  <td style="text-align: right;">
                    <div style="display:inline-flex; align-items:center; gap:0.4rem;">
                      <button 
                        class="card-action-btn ${hasNote ? 'has-notes' : ''}" 
                        data-note-id="${item.id}" 
                        title="${hasNote ? 'Edit Notes: ' + state.notes[item.id].slice(0, 30) + '...' : 'Add Note / Log Date'}">
                        📝
                      </button>
                      <a 
                        href="${item.imdbLink}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="card-action-btn" 
                        title="View on IMDb">
                        <span class="imdb-badge" style="font-size:0.55rem; padding:1px 2px;">IMDb</span>
                      </a>
                      <a 
                        href="${item.disneyLink}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="card-action-btn" 
                        title="Stream on Disney+">
                        ↗
                      </a>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render Card Grid View
   */
  function renderGridView(items) {
    if (items.length === 0) return renderEmptyState();

    return `
      <div class="timeline-grid">
        ${items.map(item => {
          const isWatched = state.watched.has(item.id);
          const rating = state.ratings[item.id] || 0;
          const hasNote = !!state.notes[item.id];
          const primaryLink = item.disneyLink || item.imdbLink;
          const { initials, colorClass } = getAvatarData(item.title);

          return `
            <div class="card ${isWatched ? 'watched' : ''}" id="card-${item.id}">
              <div>
                <div class="card-top">
                  <div class="card-badges">
                    <span class="badge-glass-order">#${item.order}</span>
                    <span class="badge-era" title="${item.bookNote || ''}">📖 ${item.timelineEra}</span>
                    <span class="badge-type ${item.type}">${getTypeLabel(item.type)}</span>
                  </div>
                  <button 
                    class="watch-check-btn ${isWatched ? 'checked' : ''}" 
                    data-check-id="${item.id}"
                    title="${isWatched ? 'Mark unwatched' : 'Mark watched'}">
                    ${isWatched ? '✓' : ''}
                  </button>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
                  <div class="title-avatar ${colorClass}" style="width:32px; height:32px; font-size:0.7rem;">${initials}</div>
                  <h3 class="card-title" style="margin-bottom:0;">
                    <a href="${primaryLink}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                  </h3>
                </div>

                <div class="card-meta-line">
                  <span>📅 ${item.releaseYear}</span>
                  <span>•</span>
                  <span>⏱️ ${item.duration}</span>
                  <span>•</span>
                  <span>${item.phase}</span>
                </div>

                <p class="card-desc">${item.bookNote || item.description}</p>
              </div>

              <div>
                <div class="card-footer">
                  <div>
                    ${renderStars(item.id, rating)}
                  </div>
                  <div class="card-footer-actions">
                    <button 
                      class="card-action-btn ${hasNote ? 'has-notes' : ''}" 
                      data-note-id="${item.id}" 
                      title="${hasNote ? 'Edit Notes: ' + state.notes[item.id].slice(0, 30) + '...' : 'Add Note'}">
                      📝
                    </button>
                    <a 
                      href="${item.imdbLink}" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="card-action-btn" 
                      title="View on IMDb">
                      <span class="imdb-badge" style="font-size:0.6rem; padding:1px 3px;">IMDb</span>
                    </a>
                    <a 
                      href="${item.disneyLink}" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="card-action-btn" 
                      title="Stream on Disney+">
                      ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderEmptyState() {
    return `
      <div class="empty-state">
        <div style="font-size: 2.8rem; margin-bottom: 0.75rem;">🔍</div>
        <h3 style="color: var(--text-heading); margin-bottom: 0.4rem;">No MCU titles found</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 380px; margin: 0 auto 1.25rem;">
          Try adjusting your search query, clearing filters, or switching navigation.
        </p>
        <button class="btn-glass" id="btn-reset-filters">Clear All Filters</button>
      </div>
    `;
  }

  /**
   * Main Render Controller
   */
  function updateUI() {
    const items = getFilteredItems();

    if (elements.resultsCount) {
      elements.resultsCount.textContent = `Showing ${items.length} of ${getScopedItems().length} titles`;
    }

    if (elements.timelineContainer) {
      if (state.viewMode === 'grid') {
        elements.timelineContainer.innerHTML = renderGridView(items);
      } else {
        elements.timelineContainer.innerHTML = renderTableView(items);
      }
    }

    updateStats();
    updateUpNext();
    attachDynamicListeners();
  }

  /**
   * Attach Listeners to dynamic elements (checks, stars, notes)
   */
  function attachDynamicListeners() {
    // Watch toggles
    document.querySelectorAll('[data-check-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatched(btn.dataset.checkId);
      });
    });

    // Star rating
    document.querySelectorAll('.star[data-star-id]').forEach(star => {
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = star.dataset.starId;
        const val = parseInt(star.dataset.starVal, 10);
        setRating(id, val);
      });
    });

    // Note buttons
    document.querySelectorAll('[data-note-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNoteModal(btn.dataset.noteId);
      });
    });

    // Reset filters button
    const resetFiltersBtn = document.getElementById('btn-reset-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        state.searchTerm = '';
        state.filterType = 'all';
        state.filterPhase = 'all';
        state.filterSaga = 'all';
        state.filterStatus = 'all';
        state.sidebarFilter = 'all';

        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.phaseFilter) elements.phaseFilter.value = 'all';
        if (elements.sagaFilter) elements.sagaFilter.value = 'all';

        elements.typePills.forEach(p => p.classList.toggle('active', p.dataset.filterType === 'all'));
        elements.statusPills.forEach(p => p.classList.toggle('active', p.dataset.filterStatus === 'all'));
        elements.sidebarLinks.forEach(link => link.classList.toggle('active', link.dataset.navFilter === 'all'));

        updateUI();
      });
    }
  }

  /**
   * Bulk action: Mark/Unmark filtered titles
   */
  function bulkSetWatched(markWatched = true) {
    const items = getFilteredItems();
    if (items.length === 0) return;

    items.forEach(item => {
      if (markWatched) {
        state.watched.add(item.id);
        if (!state.datesWatched[item.id]) {
          state.datesWatched[item.id] = new Date().toISOString().split('T')[0];
        }
      } else {
        state.watched.delete(item.id);
      }
    });

    saveState();
    updateUI();
    showToast(
      markWatched 
        ? `Marked ${items.length} titles as watched!` 
        : `Unmarked ${items.length} titles!`,
      markWatched ? 'success' : 'info'
    );
  }

  /**
   * Export Progress JSON Backup
   */
  function exportData() {
    const exportObject = {
      app: 'The Sacred Timeline',
      version: '4.0.0',
      exportedAt: new Date().toISOString(),
      canonSource: 'Disney+ & Marvel Studios: An Official Timeline (DK Books)',
      stats: {
        totalWatched: state.watched.size,
        totalItems: state.items.length
      },
      watched: Array.from(state.watched),
      ratings: state.ratings,
      notes: state.notes,
      datesWatched: state.datesWatched,
      theme: state.theme,
      sidebarFilter: state.sidebarFilter
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sacred_Timeline_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Progress exported successfully!', 'success');
  }

  function openImportModal() {
    elements.importTextarea.value = '';
    elements.importFile.value = '';
    elements.importModal.classList.add('active');
  }

  function closeImportModal() {
    elements.importModal.classList.remove('active');
  }

  function executeImport(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.watched)) {
        showToast('Invalid backup file format.', 'warning');
        return;
      }

      state.watched = new Set(data.watched);
      state.ratings = data.ratings || {};
      state.notes = data.notes || {};
      state.datesWatched = data.datesWatched || {};
      if (data.theme) setTheme(data.theme);
      if (data.sidebarFilter) setNavFilter(data.sidebarFilter);

      saveState();
      updateUI();
      closeImportModal();
      showToast(`Imported progress: ${state.watched.size} titles restored!`, 'success');
    } catch (err) {
      showToast('Error parsing JSON backup file.', 'warning');
      console.error(err);
    }
  }

  function showConfirm(message, onConfirm) {
    elements.confirmModalMsg.textContent = message;
    elements.confirmModal.classList.add('active');

    const handleConfirm = () => {
      elements.confirmModalOk.removeEventListener('click', handleConfirm);
      elements.confirmModal.classList.remove('active');
      onConfirm();
    };

    elements.confirmModalOk.addEventListener('click', handleConfirm);
  }

  function closeConfirmModal() {
    elements.confirmModal.classList.remove('active');
  }

  function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Sidebar navigation (All Timeline, Films, TV Series)
    elements.sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (link.dataset.navFilter) {
          setNavFilter(link.dataset.navFilter);
        }
      });
    });

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value.trim();
      elements.clearSearchBtn.style.display = state.searchTerm ? 'block' : 'none';
      updateUI();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchTerm = '';
      elements.clearSearchBtn.style.display = 'none';
      updateUI();
      elements.searchInput.focus();
    });

    // Phase & Saga select
    elements.phaseFilter.addEventListener('change', (e) => {
      state.filterPhase = e.target.value;
      updateUI();
    });

    elements.sagaFilter.addEventListener('change', (e) => {
      state.filterSaga = e.target.value;
      updateUI();
    });

    // Sort select
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      saveState();
      updateUI();
    });

    // Type pills
    elements.typePills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.typePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterType = pill.dataset.filterType;
        updateUI();
      });
    });

    // Status pills
    elements.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.statusPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterStatus = pill.dataset.filterStatus;
        updateUI();
      });
    });

    // View mode switchers (Table vs Grid)
    elements.viewGridBtn.addEventListener('click', () => {
      elements.viewGridBtn.classList.add('active');
      elements.viewTableBtn.classList.remove('active');
      state.viewMode = 'grid';
      saveState();
      updateUI();
    });

    elements.viewTableBtn.addEventListener('click', () => {
      elements.viewTableBtn.classList.add('active');
      elements.viewGridBtn.classList.remove('active');
      state.viewMode = 'table';
      saveState();
      updateUI();
    });

    // Bulk actions
    elements.bulkMarkBtn.addEventListener('click', () => bulkSetWatched(true));
    elements.bulkUnmarkBtn.addEventListener('click', () => bulkSetWatched(false));

    elements.resetBtn.addEventListener('click', () => {
      showConfirm(
        'Are you sure you want to reset all tracked progress, ratings, and notes? This cannot be undone unless you have exported a backup.',
        () => {
          state.watched.clear();
          state.ratings = {};
          state.notes = {};
          state.datesWatched = {};
          saveState();
          updateUI();
          showToast('All progress has been reset.', 'info');
        }
      );
    });

    // Export & Import
    elements.exportBtn.addEventListener('click', exportData);
    elements.importBtn.addEventListener('click', openImportModal);

    elements.importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        elements.importTextarea.value = event.target.result;
      };
      reader.readAsText(file);
    });

    elements.importSubmitBtn.addEventListener('click', () => {
      const text = elements.importTextarea.value.trim();
      if (!text) {
        showToast('Please select a file or paste JSON content.', 'warning');
        return;
      }
      executeImport(text);
    });

    // Modal buttons
    elements.noteCloseBtns.forEach(btn => btn.addEventListener('click', closeNoteModal));
    elements.noteSaveBtn.addEventListener('click', saveNote);

    elements.importCloseBtns.forEach(btn => btn.addEventListener('click', closeImportModal));
    elements.confirmCloseBtns.forEach(btn => btn.addEventListener('click', closeConfirmModal));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNoteModal();
        closeImportModal();
        closeConfirmModal();
      }
    });

    // Realtime sync & updates button
    if (elements.checkUpdatesBtn) {
      elements.checkUpdatesBtn.addEventListener('click', () => {
        fetchLatestTimeline(true);
      });
    }

    if (elements.updateToastDismissBtn) {
      elements.updateToastDismissBtn.addEventListener('click', () => {
        if (elements.updateToastBanner) {
          elements.updateToastBanner.style.display = 'none';
        }
      });
    }

    if (elements.updateToastViewBtn) {
      elements.updateToastViewBtn.addEventListener('click', () => {
        setNavFilter('all');
        state.searchTerm = '';
        if (elements.searchInput) elements.searchInput.value = '';
        updateUI();
        if (elements.timelineContainer) {
          elements.timelineContainer.scrollIntoView({ behavior: 'smooth' });
        }
        if (elements.updateToastBanner) {
          elements.updateToastBanner.style.display = 'none';
        }
      });
    }

    [elements.noteModal, elements.importModal, elements.confirmModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  /**
   * Realtime Update Handler: Fetch latest data/timeline.json
   */
  async function fetchLatestTimeline(showFeedback = false) {
    const checkBtn = elements.checkUpdatesBtn;
    const syncIcon = elements.syncIcon;
    const syncLabel = elements.syncLabel;

    if (showFeedback && checkBtn) {
      checkBtn.disabled = true;
      if (syncIcon) syncIcon.classList.add('spin-icon');
      if (syncLabel) syncLabel.textContent = 'Checking...';
    }

    try {
      // Dynamic fetch with timestamp cache-buster
      const response = await fetch(`data/timeline.json?v=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const latestData = await response.json();

      if (Array.isArray(latestData) && latestData.length > 0) {
        const prevCount = state.items.length;
        const newCount = latestData.length;

        if (newCount > prevCount) {
          const diff = newCount - prevCount;
          const newTitles = latestData.slice(prevCount).map(t => t.title).join(', ');
          state.items = latestData;
          updateUI();

          // Show banner and badge
          if (elements.updateToastBanner && elements.updateToastText) {
            elements.updateToastText.textContent = `✨ ${diff} new Marvel release${diff > 1 ? 's' : ''} added: ${newTitles}`;
            elements.updateToastBanner.style.display = 'flex';
          }
          if (elements.syncBadge) {
            elements.syncBadge.style.display = 'inline-flex';
            elements.syncBadge.textContent = `+${diff}`;
          }

          showToast(`🎉 Synced! Added ${diff} new Marvel release${diff > 1 ? 's' : ''}.`, 'success');
        } else {
          // Update in-memory items in case dates or links changed
          state.items = latestData;
          updateUI();
          if (showFeedback) {
            showToast(`✓ Timeline is up to date (${latestData.length} official titles).`, 'info');
          }
        }
      }
    } catch (err) {
      console.warn('Realtime sync note (running with bundled data):', err);
      if (showFeedback) {
        showToast('✓ Running on bundled timeline data.', 'info');
      }
    } finally {
      if (showFeedback && checkBtn) {
        checkBtn.disabled = false;
        if (syncIcon) syncIcon.classList.remove('spin-icon');
        if (syncLabel) syncLabel.textContent = 'Check for Updates';
      }
    }
  }

  function init() {
    loadState();

    // Apply theme
    document.body.setAttribute('data-theme', state.theme);
    if (elements.themeIcon && elements.themeLabel) {
      if (state.theme === 'light') {
        elements.themeIcon.textContent = '⏳';
        elements.themeLabel.textContent = 'Temporal Loom Mode';
      } else {
        elements.themeIcon.textContent = '📜';
        elements.themeLabel.textContent = 'TVA Archive Mode';
      }
    }

    if (elements.sortSelect) elements.sortSelect.value = state.sortBy;
    if (state.viewMode === 'grid') {
      elements.viewGridBtn.classList.add('active');
      elements.viewTableBtn.classList.remove('active');
    } else {
      elements.viewTableBtn.classList.add('active');
      elements.viewGridBtn.classList.remove('active');
    }

    elements.sidebarLinks.forEach(link => {
      const isMatch = link.dataset.navFilter === state.sidebarFilter;
      link.classList.toggle('active', isMatch);
    });

    setupEventListeners();
    updateUI();

    // Check for realtime updates in background
    fetchLatestTimeline(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
