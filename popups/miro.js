// Miro Links Popup
// Fully isolated IDs/classes for Miro popup (no Google Meet naming reuse).
(function miroLinksPopupModule() {
    const LAYER_ID = 'miroLinksLayer';
    const CLOSE_ANIMATION_MS = 220;
    const MIRO_LINKS_STORAGE_KEY = 'timetable_miro_board_links_by_student';
    let hideTimer = null;
    let eventsBound = false;
    let miroLinksByStudent = {};

    function loadMiroLinksStorage() {
        try {
            const raw = localStorage.getItem(MIRO_LINKS_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch {
            return {};
        }
    }

    function saveMiroLinksStorage() {
        try {
            localStorage.setItem(MIRO_LINKS_STORAGE_KEY, JSON.stringify(miroLinksByStudent || {}));
        } catch {
            // ignore
        }
    }

    function normalizeStudentKey(name) {
        return String(name || '').trim().toLowerCase();
    }

    function getStudentInitials(name) {
        const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'ST';
        if (parts.length === 1) return String(parts[0]).slice(0, 2).toUpperCase();
        return `${String(parts[0]).charAt(0)}${String(parts[parts.length - 1]).charAt(0)}`.toUpperCase();
    }

    function getRosterStudentNames() {
        const all = [
            ...(Array.isArray(privateStudentsList) ? privateStudentsList : []),
            ...(Array.isArray(speakonStudentsList) ? speakonStudentsList : []),
            ...(Array.isArray(passportStudentsList) ? passportStudentsList : [])
        ]
            .map((name) => String(name || '').trim())
            .filter(Boolean);
        return [...new Set(all)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }

    function getRowsFromRoster() {
        return getRosterStudentNames().map((studentName) => {
            const key = normalizeStudentKey(studentName);
            const stored = miroLinksByStudent[key];
            return {
                id: key,
                student: studentName,
                initials: getStudentInitials(studentName),
                lessonsUrl: String(stored?.lessonsUrl || '').trim(),
                workbookUrl: String(stored?.workbookUrl || '').trim()
            };
        });
    }

    function upsertStudentLinks(studentName, lessonsUrl, workbookUrl) {
        const key = normalizeStudentKey(studentName);
        if (!key) return;
        const lessons = String(lessonsUrl || '').trim();
        const workbook = String(workbookUrl || '').trim();
        if (!lessons && !workbook) {
            delete miroLinksByStudent[key];
            saveMiroLinksStorage();
            return;
        }
        miroLinksByStudent[key] = { lessonsUrl: lessons, workbookUrl: workbook };
        saveMiroLinksStorage();
    }

    function isValidMiroUrl(urlRaw) {
        return /^https:\/\/miro\.com\/app\/board\/[^/\s]+\/?$/i.test(String(urlRaw || '').trim());
    }

    function getRowStatus(row) {
        const lessons = String(row.lessonsUrl || '').trim();
        const workbook = String(row.workbookUrl || '').trim();
        if (!lessons && !workbook) return 'missing';
        const invalid = (lessons && !isValidMiroUrl(lessons)) || (workbook && !isValidMiroUrl(workbook));
        if (invalid) return 'invalid';
        return (lessons && workbook) ? 'saved' : 'missing';
    }

    function statusLabel(status) {
        if (status === 'saved') return 'Saved';
        if (status === 'invalid') return 'Invalid';
        return 'Missing';
    }

    function toPercent(part, total) {
        return total ? Math.round((part / total) * 100) : 0;
    }

    function percentBand(percentage) {
        if (percentage >= 100) return 100;
        if (percentage >= 80) return 80;
        if (percentage >= 60) return 60;
        if (percentage >= 40) return 40;
        if (percentage >= 20) return 20;
        return 0;
    }

    function ShowMessage(cardKey, percentage) {
        const band = percentBand(percentage);
        if (cardKey === 'valid') {
            if (band === 100) return 'All links valid.';
            if (band === 80) return 'A few links missing.';
            if (band === 60) return 'Missing links!';
            if (band === 40) return 'Needs attention.';
            if (band === 20) return 'A few links added.';
            return 'No links added yet.';
        }
        if (cardKey === 'missing') {
            if (band === 0) return 'No missing links.';
            if (band === 20) return 'A few missing links.';
            if (band === 40) return 'Moderate missing links.';
            if (band === 60) return 'Missing links need review.';
            if (band === 80) return 'Action needed: many missing links.';
            return 'All links are missing.';
        }
        if (cardKey === 'invalid') {
            if (band === 0) return 'No invalid links.';
            if (band === 20) return 'A few invalid links.';
            if (band === 40) return 'Moderate invalid links.';
            if (band === 60) return 'Invalid links need review.';
            if (band === 80) return 'Action needed: many invalid links.';
            return 'All links are invalid.';
        }
        if (cardKey === 'total') {
            return percentage > 0 ? 'All roster loaded.' : 'No students yet.';
        }
        return '';
    }

    function showContextMessage(message) {
        const toast = document.getElementById('miroLinksContextMessage');
        if (!toast) return;
        toast.hidden = false;
        toast.setAttribute('aria-hidden', 'false');
        toast.textContent = String(message || '').trim();
    }

    function downloadReport() {
        const rows = getRowsFromRoster().map((row) => {
            const status = getRowStatus(row);
            const student = String(row.student || '').replace(/"/g, '""');
            const lessons = String(row.lessonsUrl || '').replace(/"/g, '""');
            const workbook = String(row.workbookUrl || '').replace(/"/g, '""');
            return `"${student}","${lessons}","${workbook}","${status}"`;
        });
        const csv = ['Student,Lessons Link,Workbook Link,Status', ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'miro-links-report.csv';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        showContextMessage('Report downloaded.');
    }

    function ensureRendered() {
        const host = document.querySelector('.link-miro-board');
        if (!host || host.querySelector(`#${LAYER_ID}`)) return;
        host.innerHTML = `
            <div id="${LAYER_ID}" class="miro-links-layer" hidden aria-hidden="true">
                <div class="miro-links-layer-backdrop" data-miro-role="backdrop" aria-hidden="true"></div>
                <div class="miro-popup" role="dialog" aria-modal="true" aria-labelledby="miroLinksHeadline">
                    <div class="miro-header">
                        <div class="miro-header-title">
                            <h1 id="miroLinksHeadline" class="miro-headline">Miro Board Links</h1>
                            <p class="miro-guideline">Add, edit and manage your students' Miro board links.</p>
                        </div>
                        <div class="miro-header-actions">
                            <button type="button" class="miro-import-btn" disabled>
                                <span class="miro-import-btn-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                </span>
                                <span>Import Links</span>
                            </button>
                            <button type="button" class="miro-close-btn" data-miro-role="close">
                                <span class="miro-close-btn-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                                </span>
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                    <div class="miro-cards">
                        <div class="miro-card miro-card--total">
                            <span class="miro-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122Z"/></svg></span>
                            <div><p id="miroTotalStudents" class="miro-card-value">0</p><p class="miro-card-label">Total students</p><p id="miroTotalStudentsSub" class="miro-card-sub">No students yet.</p></div>
                        </div>
                        <div class="miro-card miro-card--valid">
                            <span class="miro-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" /></svg></span>
                            <div><p id="miroValidLinks" class="miro-card-value">0</p><p class="miro-card-label">Valid links</p><p id="miroValidLinksSub" class="miro-card-sub">No links added yet.</p></div>
                        </div>
                        <div class="miro-card miro-card--missing">
                            <span class="miro-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Z" clip-rule="evenodd" /></svg></span>
                            <div><p id="miroMissingLinks" class="miro-card-value">0</p><p class="miro-card-label">Missing links</p><p id="miroMissingLinksSub" class="miro-card-sub">No missing links.</p></div>
                        </div>
                        <div class="miro-card miro-card--invalid">
                            <span class="miro-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304Z" clip-rule="evenodd" /></svg></span>
                            <div><p id="miroInvalidLinks" class="miro-card-value">0</p><p class="miro-card-label">Invalid links</p><p id="miroInvalidLinksSub" class="miro-card-sub">No invalid links.</p></div>
                        </div>
                        <button type="button" id="miroDownloadReport" class="miro-card miro-download-card" aria-label="Download Miro links report">
                            <span class="miro-card-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg></span>
                            <div><p class="miro-card-label">Download</p><p class="miro-card-sub">Report CSV</p></div>
                        </button>
                    </div>
                    <p id="miroLinksContextMessage" class="miro-context-message" hidden aria-hidden="true" role="status" aria-live="polite"></p>
                    <div class="miro-students">
                        <div class="miro-search-filter">
                            <div class="miro-search-box">
                                <input type="search" id="miroLinksSearchInput" class="miro-search-input" placeholder="Search students..." autocomplete="off" aria-label="Search students" />
                            </div>
                            <div class="miro-filter-wrap">
                                <select id="miroLinksStatusFilter" class="miro-filter-select" aria-label="Filter by status">
                                    <option value="">All status</option>
                                    <option value="saved">Saved</option>
                                    <option value="missing">Missing</option>
                                    <option value="invalid">Invalid</option>
                                </select>
                            </div>
                        </div>
                        <div class="miro-table-head" role="row">
                            <div></div><p>Student</p><p>Miro links</p><p>Status</p><div></div>
                        </div>
                        <div class="miro-table-body" id="miroLinksTableBody"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRows() {
        const body = document.getElementById('miroLinksTableBody');
        const searchValue = String(document.getElementById('miroLinksSearchInput')?.value || '').trim().toLowerCase();
        const statusValue = String(document.getElementById('miroLinksStatusFilter')?.value || '').trim();
        if (!body) return;
        const rosterRows = getRowsFromRoster();
        const rows = rosterRows.filter((row) => {
            const rowStatus = getRowStatus(row);
            if (statusValue && rowStatus !== statusValue) return false;
            if (!searchValue) return true;
            return row.student.toLowerCase().includes(searchValue)
                || String(row.lessonsUrl || '').toLowerCase().includes(searchValue)
                || String(row.workbookUrl || '').toLowerCase().includes(searchValue);
        });
        body.innerHTML = rows.map((row) => {
            const rowStatus = getRowStatus(row);
            const lessonsDisplay = String(row.lessonsUrl || '').trim() || 'No lessons board';
            const workbookDisplay = String(row.workbookUrl || '').trim() || 'No workbook board';
            const hasAnyLink = Boolean(String(row.lessonsUrl || '').trim() || String(row.workbookUrl || '').trim());
            return `
                <div class="miro-row" data-row-id="${row.id}" role="row">
                    <div></div>
                    <div class="miro-student-cell">
                        <span class="miro-avatar" aria-hidden="true">${row.initials}</span>
                        <span class="miro-student-name">${row.student}</span>
                    </div>
                    <div class="miro-link-cell">
                        ${hasAnyLink ? '<span class="miro-link-icon" aria-hidden="true"><img src="icon/miro.jpeg" alt="Miro"></span>' : ''}
                        <div class="miro-link-lines">
                            ${hasAnyLink ? `<span class="miro-link-text">Lessons: ${lessonsDisplay}</span>
                            <span class="miro-link-text">Workbook: ${workbookDisplay}</span>` : ''}
                            <button type="button" class="miro-add-link-btn" data-miro-action="add-link" aria-label="Add link for ${row.student}">Add Link</button>
                        </div>
                    </div>
                    <div><span class="miro-status miro-status--${rowStatus}"><span class="miro-status-dot"></span>${statusLabel(rowStatus)}</span></div>
                    <div class="miro-actions">
                        <button type="button" class="miro-icon-btn" data-miro-action="edit" aria-label="Edit links for ${row.student}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button type="button" class="miro-icon-btn" data-miro-action="delete" aria-label="Delete links for ${row.student}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304Z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const total = rosterRows.length;
        const valid = rosterRows.filter((row) => getRowStatus(row) === 'saved').length;
        const missing = rosterRows.filter((row) => getRowStatus(row) === 'missing').length;
        const invalid = rosterRows.filter((row) => getRowStatus(row) === 'invalid').length;
        const validPct = toPercent(valid, total);
        const missingPct = toPercent(missing, total);
        const invalidPct = toPercent(invalid, total);

        const totalEl = document.getElementById('miroTotalStudents');
        const validEl = document.getElementById('miroValidLinks');
        const missingEl = document.getElementById('miroMissingLinks');
        const invalidEl = document.getElementById('miroInvalidLinks');
        const totalSub = document.getElementById('miroTotalStudentsSub');
        const validSub = document.getElementById('miroValidLinksSub');
        const missingSub = document.getElementById('miroMissingLinksSub');
        const invalidSub = document.getElementById('miroInvalidLinksSub');
        if (totalEl) totalEl.textContent = String(total);
        if (validEl) validEl.textContent = String(valid);
        if (missingEl) missingEl.textContent = String(missing);
        if (invalidEl) invalidEl.textContent = String(invalid);
        if (totalSub) totalSub.textContent = ShowMessage('total', total);
        if (validSub) validSub.textContent = ShowMessage('valid', validPct);
        if (missingSub) missingSub.textContent = ShowMessage('missing', missingPct);
        if (invalidSub) invalidSub.textContent = ShowMessage('invalid', invalidPct);
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
            if (target.closest('#miroDownloadReport')) {
                downloadReport();
                return;
            }
            const rowEl = target.closest('[data-row-id]');
            if (!rowEl) return;
            const row = getRowsFromRoster().find((item) => item.id === String(rowEl.getAttribute('data-row-id') || ''));
            if (!row) return;
            if (target.closest('[data-miro-action="edit"]') || target.closest('[data-miro-action="add-link"]')) {
                const nextLessons = window.prompt(`Paste Lessons board URL for ${row.student}:`, String(row.lessonsUrl || ''));
                if (nextLessons === null) return;
                const nextWorkbook = window.prompt(`Paste Workbook board URL for ${row.student}:`, String(row.workbookUrl || ''));
                if (nextWorkbook === null) return;
                upsertStudentLinks(row.student, nextLessons, nextWorkbook);
                renderRows();
                return;
            }
            if (target.closest('[data-miro-action="delete"]')) {
                upsertStudentLinks(row.student, '', '');
                renderRows();
            }
        });
        document.addEventListener('input', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
            if (target.id === 'miroLinksSearchInput' || target.id === 'miroLinksStatusFilter') {
                renderRows();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const layer = document.getElementById(LAYER_ID);
            if (layer && !layer.hidden) closeLayer();
        });
    }

    ensureRendered();
    miroLinksByStudent = loadMiroLinksStorage();
    bindEvents();
    window.openMiroLinksLayer = openLayer;
    window.closeMiroLinksLayer = closeLayer;
})();
