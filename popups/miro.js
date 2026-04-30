// Miro Links Popup
// Same visual shell as Google Meet links popup, but each student has 2 links:
// Lessons board + Workbook board.
(function miroLinksPopupModule() {
    const LAYER_ID = 'miroLinksLayer';
    const CLOSE_ANIMATION_MS = 220;
    let hideTimer = null;
    let eventsBound = false;

    const sampleRows = [
        {
            id: 'jane-doe',
            student: 'Jane Doe',
            initials: 'JD',
            lessonsUrl: 'https://miro.com/app/board/uXjV-jane-lessons/',
            workbookUrl: 'https://miro.com/app/board/uXjV-jane-workbook/'
        },
        {
            id: 'alex-brown',
            student: 'Alex Brown',
            initials: 'AB',
            lessonsUrl: '',
            workbookUrl: ''
        },
        {
            id: 'sam-green',
            student: 'Sam Green',
            initials: 'SG',
            lessonsUrl: 'https://miro.com/app/board/uXjV-sam-lessons/',
            workbookUrl: ''
        },
        {
            id: 'mary-hill',
            student: 'Mary Hill',
            initials: 'MH',
            lessonsUrl: 'miro-board-link',
            workbookUrl: 'https://miro.com/app/board/uXjV-mary-workbook/'
        }
    ];

    function isValidMiroUrl(urlRaw) {
        const url = String(urlRaw || '').trim();
        return /^https:\/\/miro\.com\/app\/board\//i.test(url);
    }

    function getRowStatus(row) {
        const lessons = String(row.lessonsUrl || '').trim();
        const workbook = String(row.workbookUrl || '').trim();
        const hasAny = !!(lessons || workbook);
        if (!hasAny) return 'missing';
        const anyInvalid = (lessons && !isValidMiroUrl(lessons)) || (workbook && !isValidMiroUrl(workbook));
        if (anyInvalid) return 'invalid';
        return (lessons && workbook) ? 'saved' : 'missing';
    }

    function statusLabel(status) {
        if (status === 'saved') return 'Saved';
        if (status === 'invalid') return 'Invalid';
        return 'Missing';
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
                            <div class="import-link-action">
                                <button type="button" class="import-link-btn" disabled>
                                    <span class="import-link-btn-icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    </span>
                                    <span>Import Links</span>
                                </button>
                            </div>
                            <div class="add-link-action">
                                <button type="button" class="add-link-btn" data-miro-role="close">
                                    <span class="add-link-btn-icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                    </span>
                                    <span>Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="cards">
                        <div class="meet-stat-card card-total-students">
                            <div class="icon meet-stat-card-icon meet-stat-card-icon--total" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"/></svg>
                            </div>
                            <div class="info"><p id="miroTotalStudents" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Total students</h5><h6 class="meet-stat-sub">All students</h6></div></div>
                        </div>
                        <div class="meet-stat-card card-links-saved">
                            <div class="icon meet-stat-card-icon meet-stat-card-icon--saved" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" /></svg>
                            </div>
                            <div class="info"><p id="miroFullySaved" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Both links saved</h5><h6 class="meet-stat-sub">Lessons + Workbook</h6></div></div>
                        </div>
                        <div class="meet-stat-card card-links-missing">
                            <div class="icon meet-stat-card-icon meet-stat-card-icon--missing" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clip-rule="evenodd" /></svg>
                            </div>
                            <div class="info"><p id="miroMissingAny" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Missing links</h5><h6 class="meet-stat-sub">At least one missing</h6></div></div>
                        </div>
                        <div class="meet-stat-card card-invalid-links">
                            <div class="icon meet-stat-card-icon meet-stat-card-icon--invalid" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304ZM5.846 11.773a.75.75 0 0 1 0 1.06l-1.757 1.758a3.75 3.75 0 0 0 5.303 5.304l3.129-3.13a.75.75 0 1 1 1.06 1.061l-3.128 3.13a5.25 5.25 0 1 1-7.425-7.426l1.757-1.757a.75.75 0 0 1 1.061 0Zm2.401.26a.75.75 0 0 1 .957.458c.18.512.474.992.885 1.403.31.311.661.555 1.035.733a.75.75 0 0 1-.647 1.354 5.244 5.244 0 0 1-1.449-1.026 5.232 5.232 0 0 1-1.24-1.965.75.75 0 0 1 .46-.957Z" clip-rule="evenodd" /></svg>
                            </div>
                            <div class="info"><p id="miroInvalidAny" class="meet-stat-value">0</p><div class="meet-stat-value-text"><h5 class="meet-stat-label">Invalid links</h5><h6 class="meet-stat-sub">Fix formatting</h6></div></div>
                        </div>
                    </div>
                    <div class="students-list">
                        <div class="search-and-filter">
                            <div class="search-bar">
                                <span class="search-bar-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                </span>
                                <input type="search" id="miroLinksSearch" class="meet-links-search-input" placeholder="Search students..." autocomplete="off" aria-label="Search students" />
                            </div>
                            <div class="filter-options">
                                <div class="status-filter-bar">
                                    <span class="status-filter-icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd" /></svg>
                                    </span>
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
                            <div class="select-all-students-checkbox">
                                <label class="meet-links-checkbox-label">
                                    <input type="checkbox" class="meet-links-checkbox" id="miroLinksSelectAll" aria-label="Select all students" />
                                    <span class="meet-links-checkbox-ui" aria-hidden="true"></span>
                                </label>
                            </div>
                            <p class="student-title">Student</p>
                            <p class="link-title">Miro links (Lessons + Workbook)</p>
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
            const rowStatus = getRowStatus(row);
            if (statusValue && rowStatus !== statusValue) return false;
            if (!searchValue) return true;
            return row.student.toLowerCase().includes(searchValue)
                || String(row.lessonsUrl || '').toLowerCase().includes(searchValue)
                || String(row.workbookUrl || '').toLowerCase().includes(searchValue);
        });

        body.innerHTML = rows.map((row) => {
            const rowStatus = getRowStatus(row);
            const lessons = String(row.lessonsUrl || '').trim();
            const workbook = String(row.workbookUrl || '').trim();
            const lessonsValid = isValidMiroUrl(lessons);
            const workbookValid = isValidMiroUrl(workbook);
            const lessonsDisplay = lessons || 'No lessons board';
            const workbookDisplay = workbook || 'No workbook board';
            return `
                <div class="meet-links-row ${rowStatus === 'missing' ? 'meet-links-row--missing' : ''}" data-row-id="${row.id}" role="row">
                    <div class="meet-links-cell meet-links-cell--check">
                        <label class="meet-links-checkbox-label">
                            <input type="checkbox" class="meet-links-checkbox" aria-label="Select student" />
                            <span class="meet-links-checkbox-ui" aria-hidden="true"></span>
                        </label>
                    </div>
                    <div class="meet-links-cell meet-links-cell--student">
                        <span class="meet-links-avatar" aria-hidden="true">${row.initials}</span>
                        <span class="meet-links-student-name">${row.student}</span>
                    </div>
                    <div class="meet-links-cell meet-links-cell--link">
                        <span class="meet-links-link-icon" aria-hidden="true"><img src="icon/miro.jpeg" alt="Miro"></span>
                        <div style="display:flex;flex-direction:column;gap:4px;min-width:0;">
                            <span class="meet-links-url">Lessons: ${lessonsDisplay}</span>
                            <span class="meet-links-url">Workbook: ${workbookDisplay}</span>
                        </div>
                    </div>
                    <div class="meet-links-cell meet-links-cell--status">
                        <span class="meet-links-status meet-links-status--${rowStatus}"><span class="meet-links-status-dot"></span>${statusLabel(rowStatus)}</span>
                    </div>
                    <div class="meet-links-cell meet-links-cell--actions">
                        <button type="button" class="meet-links-icon-btn meet-links-icon-btn--edit" data-miro-action="edit" aria-label="Edit links">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button type="button" class="meet-links-icon-btn meet-links-icon-btn--more" data-miro-action="delete" aria-label="Delete links">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                <path fill-rule="evenodd" d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304ZM5.846 11.773a.75.75 0 0 1 0 1.06l-1.757 1.758a3.75 3.75 0 0 0 5.303 5.304l3.129-3.13a.75.75 0 1 1 1.06 1.061l-3.128 3.13a5.25 5.25 0 1 1-7.425-7.426l1.757-1.757a.75.75 0 0 1 1.061 0Zm2.401.26a.75.75 0 0 1 .957.458c.18.512.474.992.885 1.403.31.311.661.555 1.035.733a.75.75 0 0 1-.647 1.354 5.244 5.244 0 0 1-1.449-1.026 5.232 5.232 0 0 1-1.24-1.965.75.75 0 0 1 .46-.957Z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const total = sampleRows.length;
        const saved = sampleRows.filter((r) => getRowStatus(r) === 'saved').length;
        const invalid = sampleRows.filter((r) => getRowStatus(r) === 'invalid').length;
        const missing = sampleRows.filter((r) => getRowStatus(r) !== 'saved').length;
        const totalEl = document.getElementById('miroTotalStudents');
        const savedEl = document.getElementById('miroFullySaved');
        const missingEl = document.getElementById('miroMissingAny');
        const invalidEl = document.getElementById('miroInvalidAny');
        if (totalEl) totalEl.textContent = String(total);
        if (savedEl) savedEl.textContent = String(saved);
        if (missingEl) missingEl.textContent = String(missing);
        if (invalidEl) invalidEl.textContent = String(invalid);
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
            if (target.closest('[data-miro-role="backdrop"]') || target.closest('[data-miro-role="close"]')) {
                closeLayer();
                return;
            }
            const rowEl = target.closest('[data-row-id]');
            if (!rowEl) return;
            const rowId = String(rowEl.getAttribute('data-row-id') || '');
            const row = sampleRows.find((item) => item.id === rowId);
            if (!row) return;

            if (target.closest('[data-miro-action="open-lessons"]')) {
                if (isValidMiroUrl(row.lessonsUrl)) window.open(String(row.lessonsUrl), '_blank', 'noopener,noreferrer');
                return;
            }
            if (target.closest('[data-miro-action="open-workbook"]')) {
                if (isValidMiroUrl(row.workbookUrl)) window.open(String(row.workbookUrl), '_blank', 'noopener,noreferrer');
                return;
            }
            if (target.closest('[data-miro-action="edit"]')) {
                const nextLessons = window.prompt(`Paste Lessons board URL for ${row.student}:`, String(row.lessonsUrl || ''));
                if (nextLessons === null) return;
                const nextWorkbook = window.prompt(`Paste Workbook board URL for ${row.student}:`, String(row.workbookUrl || ''));
                if (nextWorkbook === null) return;
                row.lessonsUrl = String(nextLessons || '').trim();
                row.workbookUrl = String(nextWorkbook || '').trim();
                renderRows();
                return;
            }
            if (target.closest('[data-miro-action="delete"]')) {
                row.lessonsUrl = '';
                row.workbookUrl = '';
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
