// Miro Links Popup
// Renders inside <div class="link-miro-board"></div> and mirrors Google Meet links layer behavior.
(function miroLinksPopupModule() {
    const LAYER_ID = 'miroLinksLayer';
    const CLOSE_ANIMATION_MS = 220;
    let hideTimer = null;
    let eventsBound = false;

    const sampleRows = [
        { id: 'jane-doe', student: 'Jane Doe', initials: 'JD', status: 'saved', boardUrl: 'https://miro.com/app/board/uXjV-jane/' },
        { id: 'alex-brown', student: 'Alex Brown', initials: 'AB', status: 'missing', boardUrl: '' },
        { id: 'sam-green', student: 'Sam Green', initials: 'SG', status: 'saved', boardUrl: 'https://miro.com/app/board/uXjV-sam/' },
        { id: 'mary-hill', student: 'Mary Hill', initials: 'MH', status: 'invalid', boardUrl: 'miro-board-link' }
    ];

    function getStatusForUrl(urlRaw) {
        const url = String(urlRaw || '').trim();
        if (!url) return 'missing';
        return /^https:\/\/miro\.com\/app\/board\//i.test(url) ? 'saved' : 'invalid';
    }

    function ensureRendered() {
        const host = document.querySelector('.link-miro-board');
        if (!host || host.querySelector(`#${LAYER_ID}`)) return;
        host.innerHTML = `
            <div id="${LAYER_ID}" class="google-meet-links-layer" hidden aria-hidden="true">
                <div class="google-meet-links-layer-backdrop" data-miro-role="backdrop" aria-hidden="true"></div>
                <div class="google-meet-popup" role="dialog" aria-modal="true" aria-labelledby="miroLinksHeadline">
                    <div class="header">
                        <div class="header-title">
                            <h1 id="miroLinksHeadline" class="headline">Miro Board Links</h1>
                            <p class="guideline">Add, edit and manage your students' Miro board links.</p>
                        </div>
                        <div class="header-actions">
                            <button type="button" class="btn-add-student-cancel" data-miro-role="close">Close</button>
                        </div>
                    </div>
                    <div class="cards">
                        <div class="meet-stat-card card-total-students"><div class="info"><p id="miroTotalStudents" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Total students</h5></div></div></div>
                        <div class="meet-stat-card card-links-saved"><div class="info"><p id="miroSavedLinks" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Links saved</h5></div></div></div>
                        <div class="meet-stat-card card-links-missing"><div class="info"><p id="miroMissingLinks" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Links missing</h5></div></div></div>
                    </div>
                    <div class="students-list">
                        <div class="search-and-filter">
                            <div class="search-bar">
                                <input type="search" id="miroLinksSearch" class="meet-links-search-input" placeholder="Search students..." autocomplete="off" aria-label="Search students" />
                            </div>
                            <div class="filter-options">
                                <div class="status-filter-bar">
                                    <select id="miroLinksStatus" class="meet-links-status-select" aria-label="Filter by status">
                                        <option value="">All status</option>
                                        <option value="saved">Saved</option>
                                        <option value="missing">Missing</option>
                                        <option value="invalid">Invalid</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="students-list-header" role="row">
                            <p class="student-title">Student</p>
                            <p class="link-title">Miro board link</p>
                            <p class="status-title">Status</p>
                            <div class="actions meet-links-header-actions" aria-hidden="true"><span class="meet-links-actions-placeholder"></span></div>
                        </div>
                        <div class="students-list-body" id="miroLinksStudentsBody"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRows() {
        const layer = document.getElementById(LAYER_ID);
        if (!layer) return;
        const body = document.getElementById('miroLinksStudentsBody');
        const searchValue = String(document.getElementById('miroLinksSearch')?.value || '').trim().toLowerCase();
        const statusValue = String(document.getElementById('miroLinksStatus')?.value || '').trim();
        if (!body) return;

        const rows = sampleRows.filter((row) => {
            const status = getStatusForUrl(row.boardUrl);
            if (statusValue && status !== statusValue) return false;
            if (!searchValue) return true;
            return row.student.toLowerCase().includes(searchValue) || String(row.boardUrl || '').toLowerCase().includes(searchValue);
        });

        body.innerHTML = rows.map((row) => {
            const status = getStatusForUrl(row.boardUrl);
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
            const displayUrl = row.boardUrl || 'No link saved';
            const openDisabled = !/^https?:\/\//i.test(row.boardUrl || '');
            return `
                <div class="meet-links-row ${status === 'missing' ? 'meet-links-row--missing' : ''}" data-row-id="${row.id}" role="row">
                    <div class="meet-links-cell meet-links-cell--student">
                        <span class="meet-links-avatar" aria-hidden="true">${row.initials}</span>
                        <span class="meet-links-student-name">${row.student}</span>
                    </div>
                    <div class="meet-links-cell meet-links-cell--link">
                        <span class="meet-links-url">${displayUrl}</span>
                        <button type="button" class="meet-links-open-external" data-miro-action="open" aria-label="Open board in new tab" ${openDisabled ? 'disabled' : ''}>↗</button>
                    </div>
                    <div class="meet-links-cell meet-links-cell--status">
                        <span class="meet-links-status meet-links-status--${status}"><span class="meet-links-status-dot"></span>${statusLabel}</span>
                    </div>
                    <div class="meet-links-cell meet-links-cell--actions">
                        <button type="button" class="meet-links-icon-btn meet-links-icon-btn--edit" data-miro-action="edit" aria-label="Edit board link">Edit</button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('miroTotalStudents').textContent = String(sampleRows.length);
        document.getElementById('miroSavedLinks').textContent = String(sampleRows.filter((r) => getStatusForUrl(r.boardUrl) === 'saved').length);
        document.getElementById('miroMissingLinks').textContent = String(sampleRows.filter((r) => getStatusForUrl(r.boardUrl) !== 'saved').length);
    }

    function openLayer() {
        ensureRendered();
        const layer = document.getElementById(LAYER_ID);
        if (!layer) return;
        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
        layer.hidden = false;
        layer.classList.remove('is-closing');
        layer.classList.add('is-open');
        layer.setAttribute('aria-hidden', 'false');
        renderRows();
    }

    function closeLayer() {
        const layer = document.getElementById(LAYER_ID);
        if (!layer || layer.hidden) return;
        layer.classList.remove('is-open');
        layer.classList.add('is-closing');
        layer.setAttribute('aria-hidden', 'true');
        if (hideTimer) window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
            layer.hidden = true;
            layer.classList.remove('is-closing');
            hideTimer = null;
        }, CLOSE_ANIMATION_MS);
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (target.closest('#googleMeetSideBtn')) {
                openLayer();
                return;
            }
            if (target.closest(`[data-miro-role="backdrop"]`) || target.closest(`[data-miro-role="close"]`)) {
                closeLayer();
                return;
            }
            const rowEl = target.closest('[data-row-id]');
            if (!rowEl) return;
            const rowId = String(rowEl.getAttribute('data-row-id') || '');
            const row = sampleRows.find((item) => item.id === rowId);
            if (!row) return;
            if (target.closest('[data-miro-action="open"]')) {
                if (row.boardUrl) window.open(row.boardUrl, '_blank', 'noopener,noreferrer');
                return;
            }
            if (target.closest('[data-miro-action="edit"]')) {
                const current = String(row.boardUrl || '');
                const next = window.prompt(`Paste Miro board URL for ${row.student}:`, current);
                if (next === null) return;
                row.boardUrl = String(next || '').trim();
                row.status = getStatusForUrl(row.boardUrl);
                renderRows();
            }
        });

        document.addEventListener('input', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
            if (target.id === 'miroLinksSearch' || target.id === 'miroLinksStatus') {
                renderRows();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const layer = document.getElementById(LAYER_ID);
            if (!layer || layer.hidden) return;
            closeLayer();
        });
    }

    ensureRendered();
    bindEvents();
    window.openMiroLinksLayer = openLayer;
    window.closeMiroLinksLayer = closeLayer;
})();
