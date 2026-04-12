// Configuration
const START_HOUR = 7; // 7 AM
const END_HOUR = 23; // 11 PM (exclusive, includes 10 PM slot)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// LocalStorage key (fallback)
const STORAGE_KEY = 'timetable_schedules';
const ROSTER_STORAGE_KEY = 'timetable_roster';
const CLASS_REPORT_ROWS_KEY = 'timetable_student_class_report_rows';

/** @type {Record<string, Array<Record<string, string>>>} */
let studentClassReportRows = {};

// Sidebar categories
const DEFAULT_TEACHERS = ['Samuel Öettinger'];
const DEFAULT_PRIVATE_STUDENTS = [
    'Alexandre Eleuterio',
    'Berenildo Nascimento',
    'Fernanda Penteado',
    'Lorena Albergoni',
    'Lucas Tonholi',
    'Maiza Camargo',
    'Matheus Santos',
    'Michele Miranda',
    'Rosangela de Paula',
    'Talita Freire',
    'Vinicios Santos'
];
const DEFAULT_SPEAKON_STUDENTS = [
    'Adelcio Souza',
    'Alessandra Ramos',
    'Ana Tereza Candeloro',
    'Bruna Santos',
    'Eliane Marcon',
    'Fernando Yeshua',
    'Maria Carolina Cecilio',
    'Maria Ribeiro',
    'Marisa Nogueira',
    'Neide de Paula',
    'Raquel Guedes',
    'Tamires Busichia'
];

let teachersList = [];
let privateStudentsList = [];
let speakonStudentsList = [];
let editStudentEscHandlerBound = false;

function loadRosterFromStorage() {
    try {
        const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function initRoster() {
    const saved = loadRosterFromStorage();
    if (!saved) {
        teachersList = [...DEFAULT_TEACHERS];
        privateStudentsList = [...DEFAULT_PRIVATE_STUDENTS];
        speakonStudentsList = [...DEFAULT_SPEAKON_STUDENTS];
        loadStudentClassReportRows();
        return;
    }
    teachersList = Array.isArray(saved.teachers) && saved.teachers.length > 0 ? [...saved.teachers] : [...DEFAULT_TEACHERS];
    privateStudentsList = Array.isArray(saved.private) ? [...saved.private] : [...DEFAULT_PRIVATE_STUDENTS];
    speakonStudentsList = Array.isArray(saved.speakon) ? [...saved.speakon] : [...DEFAULT_SPEAKON_STUDENTS];
    loadStudentClassReportRows();
}

function loadStudentClassReportRows() {
    try {
        const raw = localStorage.getItem(CLASS_REPORT_ROWS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        studentClassReportRows =
            parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        studentClassReportRows = {};
    }
}

function saveStudentClassReportRows() {
    try {
        localStorage.setItem(CLASS_REPORT_ROWS_KEY, JSON.stringify(studentClassReportRows));
    } catch (error) {
        console.error('Error saving class report rows:', error);
    }
}

function isStudentName(name) {
    const n = String(name || '').trim().toLowerCase();
    if (!n) return false;
    return (
        privateStudentsList.some((x) => x.trim().toLowerCase() === n) ||
        speakonStudentsList.some((x) => x.trim().toLowerCase() === n)
    );
}

function renameStudentClassReportRows(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    if (!studentClassReportRows[oldName]) return;
    studentClassReportRows[newName] = studentClassReportRows[oldName];
    delete studentClassReportRows[oldName];
    saveStudentClassReportRows();
}

const STUDENT_CLASS_REPORT_FIELDS = [
    'date',
    'time',
    'dayOfWeek',
    'status',
    'level',
    'unit',
    'classTopic'
];

/** Inline SVG pencil (currentColor); matches row control height */
const CLASS_TOPIC_PENCIL_ICON_HTML =
    '<span class="student-class-report-topic-btn-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></span>';

const CLASS_REPORT_STATUS_OPTIONS = [
    'Class Given',
    'Class Canceled',
    'Rescheduled',
    'PostPoned',
    'Bonus Class'
];

const CLASS_REPORT_LEVEL_OPTIONS = [
    'Intro',
    'Level 1',
    'Level 2',
    'Level 3',
    'Passages 1',
    'Passages 2'
];

const CLASS_REPORT_UNIT_OPTIONS = Array.from({ length: 16 }, (_, i) => `Unit ${i + 1}`);

const CLASS_REPORT_TIME_START_HOUR = 7;
const CLASS_REPORT_TIME_END_HOUR = 23;

function emptyStudentClassReportRow() {
    return {
        date: '',
        time: '',
        dayOfWeek: '',
        status: '',
        level: '',
        unit: '',
        classTopic: ''
    };
}

function normalizeClassReportDateValue(raw) {
    const s = String(raw || '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return '';
}

const CLASS_REPORT_MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function ordinalSuffix(day) {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

function formatClassReportDateDisplay(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    const month = CLASS_REPORT_MONTH_NAMES[d.getMonth()];
    const day = d.getDate();
    return `${month}, ${day}${ordinalSuffix(day)}`;
}

function dayOfWeekFromIso(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return DAYS[d.getDay()];
}

function normalizeClassReportTimeValue(raw) {
    const s = String(raw || '').trim();
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && n >= CLASS_REPORT_TIME_START_HOUR && n <= CLASS_REPORT_TIME_END_HOUR) {
        return String(n);
    }
    return '';
}

function classReportDayDisplay(merged) {
    const iso = normalizeClassReportDateValue(merged.date);
    const fromDate = dayOfWeekFromIso(iso);
    if (fromDate) return fromDate;
    return String(merged.dayOfWeek || '').trim();
}

function appendClassReportFieldCell(tr, field, merged) {
    const td = document.createElement('td');

    if (field === 'date') {
        td.classList.add('column-date');
        const iso = normalizeClassReportDateValue(merged.date);

        const wrap = document.createElement('div');
        wrap.className = 'student-class-report-date-wrap';

        const display = document.createElement('span');
        display.className = 'student-class-report-date-display';
        display.textContent = formatClassReportDateDisplay(iso) || '\u2014';

        const calLabel = document.createElement('label');
        calLabel.className = 'student-class-report-date-calendar-btn';
        calLabel.setAttribute('aria-label', 'Open calendar');
        calLabel.title = 'Pick date';

        const calIcon = document.createElement('span');
        calIcon.className = 'student-class-report-date-calendar-btn-icon';
        calIcon.setAttribute('aria-hidden', 'true');
        calIcon.textContent = '\u{1F4C5}';

        const pick = document.createElement('input');
        pick.type = 'date';
        pick.className = 'student-class-report-date-picker-native student-class-report-field';
        pick.dataset.field = 'date';
        pick.value = iso;
        pick.setAttribute('aria-label', 'Pick date');

        calLabel.appendChild(calIcon);
        calLabel.appendChild(pick);

        wrap.appendChild(display);
        wrap.appendChild(calLabel);
        td.appendChild(wrap);
    } else if (field === 'time') {
        td.classList.add('column-time');
        const sel = document.createElement('select');
        sel.className = 'student-class-report-input student-class-report-field student-class-report-time-select';
        sel.dataset.field = 'time';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '\u2014';
        sel.appendChild(placeholder);
        for (let h = CLASS_REPORT_TIME_START_HOUR; h <= CLASS_REPORT_TIME_END_HOUR; h++) {
            const opt = document.createElement('option');
            opt.value = String(h);
            opt.textContent = formatHour(h);
            sel.appendChild(opt);
        }
        sel.value = normalizeClassReportTimeValue(merged.time);
        td.appendChild(sel);
    } else if (field === 'dayOfWeek') {
        td.classList.add('column-day');
        const input = document.createElement('input');
        input.type = 'text';
        input.readOnly = true;
        input.tabIndex = -1;
        input.className = 'student-class-report-input student-class-report-day-readonly';
        input.dataset.field = 'dayOfWeek';
        input.value = classReportDayDisplay(merged);
        input.setAttribute('aria-label', 'Day of the week (from date)');
        td.appendChild(input);
    } else if (field === 'status') {
        td.classList.add('column-status');
        const sel = document.createElement('select');
        sel.className = 'student-class-report-input student-class-report-field student-class-report-status-select';
        sel.dataset.field = 'status';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '\u2014';
        sel.appendChild(placeholder);
        CLASS_REPORT_STATUS_OPTIONS.forEach((label) => {
            const opt = document.createElement('option');
            opt.value = label;
            opt.textContent = label;
            sel.appendChild(opt);
        });
        const st = String(merged.status || '').trim();
        sel.value = CLASS_REPORT_STATUS_OPTIONS.includes(st) ? st : '';
        td.appendChild(sel);
    } else if (field === 'level') {
        td.classList.add('column-level');
        const sel = document.createElement('select');
        sel.className = 'student-class-report-input student-class-report-field student-class-report-level-select';
        sel.dataset.field = 'level';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '\u2014';
        sel.appendChild(placeholder);
        CLASS_REPORT_LEVEL_OPTIONS.forEach((label) => {
            const opt = document.createElement('option');
            opt.value = label;
            opt.textContent = label;
            sel.appendChild(opt);
        });
        const lv = String(merged.level || '').trim();
        sel.value = CLASS_REPORT_LEVEL_OPTIONS.includes(lv) ? lv : '';
        td.appendChild(sel);
    } else if (field === 'unit') {
        td.classList.add('column-unit');
        const sel = document.createElement('select');
        sel.className = 'student-class-report-input student-class-report-field student-class-report-unit-select';
        sel.dataset.field = 'unit';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '\u2014';
        sel.appendChild(placeholder);
        CLASS_REPORT_UNIT_OPTIONS.forEach((label) => {
            const opt = document.createElement('option');
            opt.value = label;
            opt.textContent = label;
            sel.appendChild(opt);
        });
        const u = String(merged.unit || '').trim();
        sel.value = CLASS_REPORT_UNIT_OPTIONS.includes(u) ? u : '';
        td.appendChild(sel);
    } else if (field === 'classTopic') {
        td.classList.add('column-topic');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'student-class-report-topic-btn';
        updateClassTopicButtonFromText(btn, merged.classTopic);
        btn.addEventListener('click', () => {
            const trEl = btn.closest('tr');
            if (!trEl || trEl.dataset.rowIndex == null) return;
            const idx = parseInt(trEl.dataset.rowIndex, 10);
            if (!currentTeacher || !isStudentName(currentTeacher)) return;
            openClassTopicEditor(currentTeacher, idx);
        });
        td.appendChild(btn);
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'student-class-report-input student-class-report-field';
        input.dataset.field = field;
        input.value = merged[field] ?? '';
        td.appendChild(input);
    }

    tr.appendChild(td);
}

function persistClassReportRowField(tr, el) {
    const trEl = tr;
    const fieldEl = el;
    if (!trEl || trEl.dataset.rowIndex == null) return;
    const idx = parseInt(trEl.dataset.rowIndex, 10);
    const field = fieldEl.dataset.field;
    const sel = currentTeacher;
    if (!field || !sel || !isStudentName(sel)) return;
    const list = studentClassReportRows[sel];
    if (!Array.isArray(list) || !list[idx]) return;

    if (field === 'date') {
        const iso = normalizeClassReportDateValue(fieldEl.value);
        list[idx].date = iso;
        list[idx].dayOfWeek = iso ? dayOfWeekFromIso(iso) : '';
        const dayInput = trEl.querySelector('[data-field="dayOfWeek"]');
        if (dayInput) {
            dayInput.value = list[idx].dayOfWeek;
        }
        const disp = trEl.querySelector('.student-class-report-date-display');
        if (disp) {
            disp.textContent = formatClassReportDateDisplay(iso) || '\u2014';
        }
    } else {
        list[idx][field] = fieldEl.value;
    }
    saveStudentClassReportRows();
}

function renderStudentClassReportTable(studentName) {
    const title = document.getElementById('studentClassReportTitle');
    const tbody = document.getElementById('studentClassReportBody');
    const hint = document.getElementById('studentClassReportHint');
    if (!tbody) return;

    if (title) {
        title.textContent = studentName;
    }

    const rawList = studentClassReportRows[studentName];
    const list = Array.isArray(rawList) ? rawList : [];

    tbody.textContent = '';

    list.forEach((row, index) => {
        const merged = { ...emptyStudentClassReportRow(), ...row };
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = String(index);

        STUDENT_CLASS_REPORT_FIELDS.forEach((field) => {
            appendClassReportFieldCell(tr, field, merged);
        });

        const tdAct = document.createElement('td');
        tdAct.classList.add('column-actions');
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'student-class-report-remove-row';
        rm.textContent = '\u00D7';
        rm.setAttribute('aria-label', 'Remove row');
        rm.addEventListener('click', (e) => {
            e.stopPropagation();
            removeStudentClassReportRowAt(studentName, index);
        });
        tdAct.appendChild(rm);
        tr.appendChild(tdAct);

        tbody.appendChild(tr);
    });

    if (hint) {
        hint.hidden = list.length > 0;
    }
}

function removeStudentClassReportRowAt(studentName, index) {
    const list = studentClassReportRows[studentName];
    if (!Array.isArray(list) || index < 0 || index >= list.length) return;
    list.splice(index, 1);
    if (list.length === 0) {
        delete studentClassReportRows[studentName];
    }
    saveStudentClassReportRows();
    if (currentTeacher === studentName && isStudentName(studentName)) {
        renderStudentClassReportTable(studentName);
    }
}

let studentClassReportPanelSetup = false;

/** @type {{ studentName: string, rowIndex: number } | null} */
let classTopicEditContext = null;

function updateClassTopicButtonFromText(btn, rawText) {
    const t = String(rawText || '').trim();
    const has = t.length > 0;
    btn.innerHTML = CLASS_TOPIC_PENCIL_ICON_HTML;
    btn.setAttribute(
        'aria-label',
        has ? 'Edit class content notes' : 'Add class content notes'
    );
    btn.title = has ? (t.length > 200 ? `${t.slice(0, 200)}\u2026` : t) : 'Add or edit class content for this row';
    if (has) btn.dataset.hasContent = 'true';
    else delete btn.dataset.hasContent;
}

function openClassTopicEditor(studentName, rowIndex) {
    if (!studentName || !isStudentName(studentName)) return;
    const list = studentClassReportRows[studentName];
    if (!Array.isArray(list) || !list[rowIndex]) return;
    const modal = document.getElementById('classTopicModal');
    const ta = document.getElementById('classTopicTextarea');
    const subtitle = document.getElementById('classTopicModalSubtitle');
    if (!modal || !ta) return;
    classTopicEditContext = { studentName, rowIndex };
    const row = list[rowIndex];
    ta.value = row.classTopic != null ? String(row.classTopic) : '';
    if (subtitle) {
        subtitle.textContent = `Student: ${studentName}`;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    ta.focus();
}

function closeClassTopicModal() {
    const modal = document.getElementById('classTopicModal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
    classTopicEditContext = null;
}

function saveClassTopicFromModal() {
    const ta = document.getElementById('classTopicTextarea');
    if (!classTopicEditContext || !ta) {
        closeClassTopicModal();
        return;
    }
    const { studentName, rowIndex } = classTopicEditContext;
    const list = studentClassReportRows[studentName];
    if (!Array.isArray(list) || !list[rowIndex]) {
        closeClassTopicModal();
        return;
    }
    list[rowIndex].classTopic = ta.value;
    saveStudentClassReportRows();
    const tbody = document.getElementById('studentClassReportBody');
    const tr = tbody?.querySelector(`tr[data-row-index="${rowIndex}"]`);
    const btn = tr?.querySelector('.student-class-report-topic-btn');
    if (btn) {
        updateClassTopicButtonFromText(btn, ta.value);
    } else if (currentTeacher === studentName) {
        renderStudentClassReportTable(studentName);
    }
    closeClassTopicModal();
}

let classTopicModalListenersBound = false;

function setupClassTopicModal() {
    if (classTopicModalListenersBound) return;
    const modal = document.getElementById('classTopicModal');
    if (!modal) return;
    classTopicModalListenersBound = true;
    const backdrop = document.getElementById('classTopicModalBackdrop');
    const cancel = document.getElementById('classTopicModalCancel');
    const save = document.getElementById('classTopicModalSave');
    backdrop?.addEventListener('click', closeClassTopicModal);
    cancel?.addEventListener('click', closeClassTopicModal);
    save?.addEventListener('click', saveClassTopicFromModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeClassTopicModal();
        }
    });
}

function setupStudentClassReportPanel() {
    const tbody = document.getElementById('studentClassReportBody');
    const addBtn = document.getElementById('addStudentClassReportRow');
    if (!tbody || !addBtn) return;

    if (!studentClassReportPanelSetup) {
        studentClassReportPanelSetup = true;
        tbody.addEventListener('change', (e) => {
            const el = e.target.closest('.student-class-report-field');
            if (!el || !tbody.contains(el)) return;
            const tr = el.closest('tr');
            persistClassReportRowField(tr, el);
        });
        tbody.addEventListener('input', (e) => {
            const el = e.target.closest('.student-class-report-field');
            if (!el || !tbody.contains(el)) return;
            if (el.tagName === 'SELECT' || el.type === 'date') return;
            const tr = el.closest('tr');
            persistClassReportRowField(tr, el);
        });
    }

    if (addBtn.dataset.bound !== '1') {
        addBtn.dataset.bound = '1';
        addBtn.addEventListener('click', () => {
            if (!currentTeacher || !isStudentName(currentTeacher)) return;
            if (!studentClassReportRows[currentTeacher]) {
                studentClassReportRows[currentTeacher] = [];
            }
            studentClassReportRows[currentTeacher].push(emptyStudentClassReportRow());
            saveStudentClassReportRows();
            renderStudentClassReportTable(currentTeacher);
        });
    }
}

function saveRoster() {
    try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify({
            teachers: teachersList,
            private: privateStudentsList,
            speakon: speakonStudentsList
        }));
    } catch (error) {
        console.error('Error saving roster to localStorage:', error);
    }
}

// Store schedules for all teachers: { teacherName: { 'day-hour': state } }
const teacherSchedules = {};

// Current selected teacher
let currentTeacher = null;

// Store slot states for current teacher (working copy)
let slotStates = {};

// State cycling order for left-click
const STATE_CYCLE = [null, 'available', 'unavailable'];

// Context menu
let contextMenu = null;
let currentSlot = null;

// Cloudflare API endpoint
const API_ENDPOINT = '/api/schedules';

// Polling interval for checking updates (in milliseconds)
const POLL_INTERVAL = 2000; // 2 seconds - faster polling for better sync

// Track if we're currently saving
let isSaving = false;

// Track last update timestamp to prevent unnecessary updates
let lastUpdateTimestamp = null;

// Debounce timer for saving
let saveTimer = null;

// Polling timer for checking updates
let pollTimer = null;

// Track if status update is pending
let statusUpdateTimer = null;

// Update sync status indicator
function updateSyncStatus(status, message) {
    const syncStatus = document.getElementById('syncStatus');
    const syncIcon = document.getElementById('syncIcon');
    const syncText = document.getElementById('syncText');
    
    if (!syncStatus) return;
    
    // Don't override "Saving to cloud..." status while saving
    if (isSaving && status !== 'syncing' && syncText.textContent.includes('Saving')) {
        return;
    }
    
    syncStatus.className = 'sync-status ' + status;
    syncIcon.className = status === 'syncing' ? 'syncing' : '';
    syncText.textContent = message;
}

// Load all schedules from Cloudflare KV or localStorage
async function loadAllSchedules() {
    try {
        updateSyncStatus('syncing', 'Syncing with cloud...');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                if (data.schedules) {
                    Object.assign(teacherSchedules, data.schedules);
                }
                lastUpdateTimestamp = data.lastUpdated;
                
                // Start polling for updates
                startPolling();
                
                updateSyncStatus('synced', '✓ Cloud sync active');
            } else {
                // API returned error
                const errorMsg = data.error || 'Unknown error';
                console.error('API Error:', errorMsg);
                if (errorMsg.includes('schedules_kv not configured') || errorMsg.includes('KV_SCHEDULES not configured')) {
                    updateSyncStatus('local-only', '⚠ KV not configured - check Pages settings');
                } else {
                    updateSyncStatus('local-only', '⚠ Cloud error - using local storage');
                }
                // Fallback to localStorage
                loadAllSchedulesLocal();
            }
        } else {
            // Get error details
            let errorDetails = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorDetails = errorData.error;
                }
            } catch (e) {
                // Couldn't parse error
            }
            
            throw new Error(errorDetails);
        }
    } catch (error) {
        console.error('Error loading schedules from Cloudflare:', error);
        
        // Check if it's a network error or API error
        let statusMessage = '⚠ Offline mode (localStorage only)';
        if (error.message.includes('schedules_kv not configured') || error.message.includes('KV_SCHEDULES not configured')) {
            statusMessage = '⚠ KV not configured - check Pages settings';
        } else if (error.message.includes('HTTP 404')) {
            statusMessage = '⚠ API not found - check function path';
        } else if (error.message.includes('HTTP 503')) {
            statusMessage = '⚠ KV not bound - check binding name is "schedules_kv"';
        }
        
        updateSyncStatus('local-only', statusMessage);
        // Fallback to localStorage
        loadAllSchedulesLocal();
    }
}

// Start polling for updates from other devices
function startPolling() {
    // Clear any existing polling
    if (pollTimer) {
        clearInterval(pollTimer);
    }
    
    console.log('Starting polling for updates every', POLL_INTERVAL / 1000, 'seconds');
    
    // Poll every few seconds for updates
    pollTimer = setInterval(async () => {
        // Don't poll while we're saving
        if (isSaving) {
            return;
        }
        
        try {
            const response = await fetch(API_ENDPOINT + '?t=' + Date.now(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.schedules) {
                    // Always update timestamp (even if data hasn't changed)
                    const timestampChanged = data.lastUpdated && data.lastUpdated !== lastUpdateTimestamp;
                    
                    // Compare data to see if it changed
                    const localSchedulesStr = JSON.stringify(teacherSchedules);
                    const remoteSchedulesStr = JSON.stringify(data.schedules);
                    const dataChanged = localSchedulesStr !== remoteSchedulesStr;
                    
                    // Update if timestamp changed (means someone else made changes)
                    if (timestampChanged) {
                        console.log('Timestamp changed - checking for updates');
                        
                        if (dataChanged) {
                            console.log('Data changed - updating from cloud');
                            // Update local schedules with remote data
                            Object.assign(teacherSchedules, data.schedules);
                            lastUpdateTimestamp = data.lastUpdated;
                            
                            // If current teacher is selected, refresh their calendar
                            if (currentTeacher) {
                                loadTeacherSchedule(currentTeacher);
                                refreshCalendarDisplay();
                                updateSummary();
                            }
                            
                            updateSyncStatus('synced', '✓ Updated from cloud');
                            setTimeout(() => {
                                updateSyncStatus('synced', 'Cloud sync active');
                            }, 2000);
                        } else {
                            // Timestamp changed but data is same - just update timestamp
                            lastUpdateTimestamp = data.lastUpdated;
                            console.log('Timestamp updated, data unchanged');
                        }
                    }
                } else if (data.success && !data.schedules) {
                    // Empty schedules - update timestamp
                    lastUpdateTimestamp = data.lastUpdated;
                }
            } else {
                console.error('Polling failed with status:', response.status);
            }
        } catch (error) {
            // Silent error - don't show error for polling failures
            console.error('Polling error:', error);
        }
    }, POLL_INTERVAL);
}

// Load from localStorage (fallback)
function loadAllSchedulesLocal() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(teacherSchedules, parsed);
        }
    } catch (error) {
        console.error('Error loading schedules from localStorage:', error);
    }
}

// Save all schedules to Cloudflare KV or localStorage (with debouncing)
function saveAllSchedules() {
    // Don't queue another save if we're already saving
    if (isSaving) {
        return;
    }
    
    // Clear any pending save
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    
    // Debounce saves - wait 800ms before actually saving
    saveTimer = setTimeout(async () => {
        saveTimer = null; // Clear timer reference
        await performSave();
    }, 800);
}

// Actually perform the save operation
async function performSave() {
    // Clear any pending status updates
    if (statusUpdateTimer) {
        clearTimeout(statusUpdateTimer);
        statusUpdateTimer = null;
    }
    
    try {
        isSaving = true;
        updateSyncStatus('syncing', 'Saving to cloud...');
        
        console.log('Saving schedules to cloud...', Object.keys(teacherSchedules).length, 'teachers');
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                schedules: teacherSchedules,
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                lastUpdateTimestamp = data.lastUpdated;
                console.log('Successfully saved to cloud. Timestamp:', data.lastUpdated);
                
                // Also save to localStorage as backup (even when cloud save succeeds)
                saveAllSchedulesLocal();
                
                // Update status after a short delay
                statusUpdateTimer = setTimeout(() => {
                    isSaving = false;
                    updateSyncStatus('synced', '✓ Saved to cloud');
                    
                    // Reset to normal status after a delay
                    statusUpdateTimer = setTimeout(() => {
                        updateSyncStatus('synced', 'Cloud sync active');
                        statusUpdateTimer = null;
                    }, 1500);
                }, 300);
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } else {
            // Get error details from response
            let errorDetails = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData?.error) {
                    errorDetails = errorData.error;
                    console.error('API Error:', errorData);
                }
            } catch (e) {
                // Couldn't parse error response
            }
            throw new Error(errorDetails);
        }
    } catch (error) {
        console.error('Error saving schedules to Cloudflare:', error);
        console.error('Error details:', error.message);
        
        isSaving = false;
        
        // Determine error message
        let errorMessage = 'Save failed';
        if (error.message.includes('schedules_kv not configured') || error.message.includes('KV_SCHEDULES not configured') || error.message.includes('503')) {
            errorMessage = 'KV not configured - check binding name is "schedules_kv"';
        } else if (error.message.includes('404')) {
            errorMessage = 'API not found - check function deployment';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        updateSyncStatus('local-only', `⚠ ${errorMessage} - using local storage`);
        
        // Still save locally as fallback
        saveAllSchedulesLocal();
    }
}

// Save to localStorage (fallback)
function saveAllSchedulesLocal() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(teacherSchedules));
    } catch (error) {
        console.error('Error saving schedules to localStorage:', error);
    }
}

function renderSidebar() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList) return;

    const collapsedByTitle = {};
    teacherList.querySelectorAll('.sidebar-category').forEach((sec) => {
        const titleBtn = sec.querySelector('.sidebar-section-title');
        if (titleBtn) {
            collapsedByTitle[titleBtn.textContent.trim()] = sec.classList.contains('collapsed');
        }
    });

    teacherList.innerHTML = '';

    const paneTeachers = document.createElement('div');
    paneTeachers.className = 'sidebar-pane sidebar-pane-teachers';
    const teachersHeader = document.createElement('div');
    teachersHeader.className = 'sidebar-section-header';
    teachersHeader.textContent = 'Teachers';
    const teachersInner = document.createElement('div');
    teachersInner.className = 'sidebar-pane-teachers-inner';
    paneTeachers.appendChild(teachersHeader);
    paneTeachers.appendChild(teachersInner);

    const paneStudents = document.createElement('div');
    paneStudents.className = 'sidebar-pane sidebar-pane-students';

    const studentsHeader = document.createElement('div');
    studentsHeader.className = 'sidebar-section-header';
    studentsHeader.textContent = 'Free Time';

    const studentsInner = document.createElement('div');
    studentsInner.className = 'sidebar-pane-students-inner';

    paneStudents.appendChild(studentsHeader);
    paneStudents.appendChild(studentsInner);

    const paneClassReport = document.createElement('div');
    paneClassReport.className = 'sidebar-pane sidebar-pane-class-report';
    const classReportHeader = document.createElement('div');
    classReportHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const classReportHeaderTitle = document.createElement('span');
    classReportHeaderTitle.className = 'sidebar-section-header-label';
    classReportHeaderTitle.textContent = 'Class Report';
    const classReportDownloadBtn = document.createElement('button');
    classReportDownloadBtn.type = 'button';
    classReportDownloadBtn.className = 'sidebar-class-report-download-btn';
    classReportDownloadBtn.setAttribute('aria-label', 'Download class report as PDF');
    classReportDownloadBtn.setAttribute('title', 'Download class report (PDF)');
    classReportDownloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    classReportHeader.appendChild(classReportHeaderTitle);
    classReportHeader.appendChild(classReportDownloadBtn);
    const classReportInner = document.createElement('div');
    classReportInner.className = 'sidebar-pane-class-report-inner';
    classReportInner.setAttribute('aria-label', 'Class report content');
    paneClassReport.appendChild(classReportHeader);
    paneClassReport.appendChild(classReportInner);

    const paneFinances = document.createElement('div');
    paneFinances.className = 'sidebar-pane sidebar-pane-finances';
    const financesHeader = document.createElement('div');
    financesHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const financesHeaderTitle = document.createElement('span');
    financesHeaderTitle.className = 'sidebar-section-header-label';
    financesHeaderTitle.textContent = 'Finances';
    const financesDownloadBtn = document.createElement('button');
    financesDownloadBtn.type = 'button';
    financesDownloadBtn.className = 'sidebar-finances-download-btn';
    financesDownloadBtn.setAttribute('aria-label', 'Download finances as PDF');
    financesDownloadBtn.setAttribute('title', 'Download finances (PDF)');
    financesDownloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    financesHeader.appendChild(financesHeaderTitle);
    financesHeader.appendChild(financesDownloadBtn);
    const financesInner = document.createElement('div');
    financesInner.className = 'sidebar-pane-finances-inner';
    financesInner.setAttribute('aria-label', 'Finances');
    const financesPlaceholder = document.createElement('p');
    financesPlaceholder.className = 'finances-placeholder';
    financesPlaceholder.textContent = 'No finance items yet.';
    financesInner.appendChild(financesPlaceholder);
    paneFinances.appendChild(financesHeader);
    paneFinances.appendChild(financesInner);

    teacherList.appendChild(paneTeachers);
    teacherList.appendChild(paneStudents);
    teacherList.appendChild(paneClassReport);
    teacherList.appendChild(paneFinances);

    const categories = [
        { title: 'Teachers', names: teachersList, itemClass: 'category-teachers', deletable: false, parent: teachersInner, collapsible: false },
        { title: 'HomeTeachers', names: privateStudentsList, itemClass: 'category-private', deletable: true, rosterKey: 'private', parent: studentsInner },
        { title: 'SpeakOn', names: speakonStudentsList, itemClass: 'category-speakon', deletable: true, rosterKey: 'speakon', parent: studentsInner }
    ];

    categories.forEach((category) => {
        const isCollapsible = category.collapsible !== false;
        const defaultCollapsed = category.title === 'Teachers' ? false : true;
        const prev = collapsedByTitle[category.title];
        const collapsed = isCollapsible && (typeof prev === 'boolean' ? prev : defaultCollapsed);

        const section = document.createElement('div');
        section.className = 'sidebar-category';
        if (category.itemClass === 'category-private') {
            section.classList.add('sidebar-category-private');
        } else if (category.itemClass === 'category-speakon') {
            section.classList.add('sidebar-category-speakon');
        }
        if (collapsed) {
            section.classList.add('collapsed');
        }

        if (isCollapsible) {
            const sectionTitle = document.createElement('button');
            sectionTitle.className = 'sidebar-section-title';
            sectionTitle.type = 'button';
            sectionTitle.textContent = category.title;
            section.appendChild(sectionTitle);
        } else {
            section.classList.add('sidebar-category-no-title');
        }

        const sectionItems = document.createElement('div');
        sectionItems.className = 'sidebar-category-items';

        category.names.forEach(name => {
            if (!teacherSchedules[name]) {
                teacherSchedules[name] = {};
            }

            const teacherItem = document.createElement('div');
            teacherItem.className = 'teacher-item';
            teacherItem.classList.add(category.itemClass);
            teacherItem.dataset.teacher = name;

            const nameEl = document.createElement('span');
            nameEl.className = 'teacher-item-name';
            nameEl.textContent = name;
            teacherItem.appendChild(nameEl);

            if (category.deletable) {
                const editBtn = document.createElement('button');
                editBtn.type = 'button';
                editBtn.className = 'teacher-item-edit';
                editBtn.setAttribute('aria-label', `Edit ${name}`);
                editBtn.setAttribute('title', `Edit ${name}`);
                editBtn.setAttribute('data-student-name', name);
                editBtn.setAttribute('data-roster-kind', category.rosterKey);
                editBtn.textContent = '\u270E';
                teacherItem.appendChild(editBtn);
            }

            teacherItem.addEventListener('click', (e) => {
                if (e.target.closest('.teacher-item-edit')) {
                    return;
                }
                selectTeacher(name, { view: 'calendar' });
            });

            sectionItems.appendChild(teacherItem);
        });

        section.appendChild(sectionItems);
        category.parent.appendChild(section);

        if (isCollapsible) {
            setSidebarSectionCollapsed(section, collapsed, false);
            const sectionTitle = section.querySelector('.sidebar-section-title');
            sectionTitle.addEventListener('click', () => {
                const willCollapse = !section.classList.contains('collapsed');
                setSidebarSectionCollapsed(section, willCollapse, true);
            });
        }
    });

    populateClassReportStudentLists(classReportInner);
}

function populateClassReportStudentLists(container) {
    if (!container) return;
    container.textContent = '';

    const reportPanel = document.getElementById('studentClassReportPanel');
    const classReportVisible = reportPanel && !reportPanel.hidden;

    const wrap = document.createElement('div');
    wrap.className = 'class-report-lists';

    const makeGroup = (heading, names, variant) => {
        const group = document.createElement('div');
        group.className = `class-report-group class-report-group--${variant}`;

        const title = document.createElement('div');
        title.className = 'class-report-group-title';
        title.textContent = heading;
        group.appendChild(title);

        const sorted = [...names].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );

        if (sorted.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'class-report-empty';
            empty.textContent = 'No students yet.';
            group.appendChild(empty);
            return group;
        }

        const ul = document.createElement('ul');
        ul.className = 'class-report-student-list';
        sorted.forEach((name) => {
            const li = document.createElement('li');
            li.className = 'class-report-student-item';
            li.dataset.studentName = name;
            li.setAttribute('role', 'button');
            li.tabIndex = 0;
            li.textContent = name;
            if (classReportVisible && currentTeacher === name && isStudentName(name)) {
                li.classList.add('class-report-student-item--active');
            }
            li.addEventListener('click', () => selectTeacher(name, { view: 'classReport' }));
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectTeacher(name, { view: 'classReport' });
                }
            });
            ul.appendChild(li);
        });
        group.appendChild(ul);
        return group;
    };

    wrap.appendChild(makeGroup('HomeTeachers', privateStudentsList, 'private'));
    wrap.appendChild(makeGroup('SpeakOn', speakonStudentsList, 'speakon'));
    container.appendChild(wrap);
}

function setSidebarSectionCollapsed(section, collapsed, animate = true) {
    const sectionItems = section.querySelector('.sidebar-category-items');
    if (!sectionItems) return;

    if (!animate) {
        sectionItems.classList.add('no-animate');
        if (collapsed) {
            section.classList.add('collapsed');
            sectionItems.style.maxHeight = '0px';
            sectionItems.style.opacity = '0';
            sectionItems.style.transform = 'translateY(-4px)';
        } else {
            section.classList.remove('collapsed');
            sectionItems.style.maxHeight = `${sectionItems.scrollHeight}px`;
            sectionItems.style.opacity = '1';
            sectionItems.style.transform = 'translateY(0)';
        }
        requestAnimationFrame(() => {
            sectionItems.classList.remove('no-animate');
        });
        return;
    }

    if (collapsed) {
        sectionItems.style.maxHeight = `${sectionItems.scrollHeight}px`;
        sectionItems.style.opacity = '1';
        sectionItems.style.transform = 'translateY(0)';
        requestAnimationFrame(() => {
            section.classList.add('collapsed');
            sectionItems.style.maxHeight = '0px';
            sectionItems.style.opacity = '0';
            sectionItems.style.transform = 'translateY(-4px)';
        });
    } else {
        section.classList.remove('collapsed');
        sectionItems.style.maxHeight = '0px';
        sectionItems.style.opacity = '0';
        sectionItems.style.transform = 'translateY(-4px)';
        requestAnimationFrame(() => {
            sectionItems.style.maxHeight = `${sectionItems.scrollHeight}px`;
            sectionItems.style.opacity = '1';
            sectionItems.style.transform = 'translateY(0)';
        });
    }
}

// Initialize teachers sidebar
async function initTeachers() {
    await loadAllSchedules();
    initRoster();
    renderSidebar();
    setupTeacherListEditDelegation();

    if (teachersList.length > 0) {
        selectTeacher(teachersList[0]);
    }
}

/**
 * @param {string} teacherName
 * @param {{ view?: 'calendar' | 'classReport' }} [opts]
 */
function selectTeacher(teacherName, opts) {
    if (currentTeacher) {
        saveTeacherSchedule(currentTeacher);
    }

    const requested = opts && opts.view;
    let showClassReport = false;
    if (requested === 'calendar') {
        showClassReport = false;
    } else if (requested === 'classReport') {
        showClassReport = isStudentName(teacherName);
    } else {
        showClassReport = isStudentName(teacherName);
    }

    currentTeacher = teacherName;

    document.querySelectorAll('.teacher-item').forEach((item) => {
        item.classList.remove('active');
        if (item.dataset.teacher === teacherName) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.class-report-student-item').forEach((li) => {
        li.classList.toggle(
            'class-report-student-item--active',
            showClassReport && !!teacherName && li.dataset.studentName === teacherName
        );
    });

    loadTeacherSchedule(teacherName);

    const calendarWrapper = document.getElementById('calendarWrapper');
    const summaryPanel = document.getElementById('summaryPanel');
    const reportPanel = document.getElementById('studentClassReportPanel');

    if (showClassReport) {
        if (calendarWrapper) calendarWrapper.hidden = true;
        if (summaryPanel) summaryPanel.hidden = true;
        if (reportPanel) {
            reportPanel.hidden = false;
            renderStudentClassReportTable(teacherName);
        }
    } else {
        if (calendarWrapper) calendarWrapper.hidden = false;
        if (summaryPanel) summaryPanel.hidden = false;
        if (reportPanel) reportPanel.hidden = true;
        refreshCalendarDisplay();
        updateSummary();
    }
}

function removeStudentFromRoster(name, rosterKey) {
    const kind = String(rosterKey || '').trim();
    const list = kind === 'private' ? privateStudentsList : speakonStudentsList;
    let idx = list.indexOf(name);
    if (idx === -1) {
        const trimmed = name.trim();
        idx = list.findIndex((n) => n.trim() === trimmed);
    }
    if (idx === -1) {
        console.warn('removeStudentFromRoster: name not found in roster', { name, rosterKey: kind });
        return;
    }

    list.splice(idx, 1);
    saveRoster();

    const wasCurrent = currentTeacher === name;
    if (wasCurrent) {
        currentTeacher = null;
        slotStates = {};
    }

    delete teacherSchedules[name];
    delete studentClassReportRows[name];
    saveStudentClassReportRows();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();

    if (wasCurrent) {
        selectTeacher(teachersList[0]);
    } else {
        selectTeacher(currentTeacher);
    }
}

function setupTeacherListEditDelegation() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList || teacherList.dataset.editDelegation === '1') {
        return;
    }
    teacherList.dataset.editDelegation = '1';
    teacherList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.teacher-item-edit');
        if (!editBtn || !teacherList.contains(editBtn)) {
            return;
        }
        e.preventDefault();
        const studentName = editBtn.getAttribute('data-student-name');
        const rosterKind = editBtn.getAttribute('data-roster-kind');
        if (studentName != null && rosterKind) {
            openEditStudentModal(studentName, rosterKind);
        }
    });
}

function splitName(fullName) {
    const cleaned = String(fullName || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return { first: '', last: '' };
    const parts = cleaned.split(' ');
    if (parts.length === 1) {
        return { first: parts[0], last: '' };
    }
    return {
        first: parts[0],
        last: parts.slice(1).join(' ')
    };
}

function openEditStudentModal(studentName, rosterKey) {
    const modal = document.getElementById('editStudentModal');
    const firstInput = document.getElementById('editStudentFirst');
    const lastInput = document.getElementById('editStudentLast');
    const categorySelect = document.getElementById('editStudentCategory');
    const originalNameInput = document.getElementById('editStudentOriginalName');
    const originalCategoryInput = document.getElementById('editStudentOriginalCategory');
    if (!modal || !firstInput || !lastInput || !categorySelect || !originalNameInput || !originalCategoryInput) {
        return;
    }

    const parsed = splitName(studentName);
    firstInput.value = parsed.first;
    lastInput.value = parsed.last;
    categorySelect.value = rosterKey === 'private' ? 'private' : 'speakon';
    originalNameInput.value = studentName;
    originalCategoryInput.value = categorySelect.value;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    firstInput.focus();
}

function closeEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function upsertStudentFromEditForm(action = 'save') {
    const originalName = document.getElementById('editStudentOriginalName')?.value || '';
    const originalKind = document.getElementById('editStudentOriginalCategory')?.value || '';
    const first = document.getElementById('editStudentFirst')?.value || '';
    const last = document.getElementById('editStudentLast')?.value || '';
    const nextKind = document.getElementById('editStudentCategory')?.value || '';

    if (!originalName || !originalKind) {
        return;
    }

    if (action === 'delete') {
        removeStudentFromRoster(originalName, originalKind);
        closeEditStudentModal();
        return;
    }

    const fullName = `${String(first).trim()} ${String(last).trim()}`.replace(/\s+/g, ' ').trim();
    if (!fullName) {
        alert('Please enter first and last name.');
        return;
    }
    if (!['private', 'speakon'].includes(nextKind)) {
        alert('Please choose HomeTeachers or SpeakOn.');
        return;
    }

    const oldList = originalKind === 'private' ? privateStudentsList : speakonStudentsList;
    const oldIdx = oldList.findIndex((n) => n.trim().toLowerCase() === originalName.trim().toLowerCase());
    if (oldIdx === -1) {
        alert('Student was not found in the list.');
        closeEditStudentModal();
        return;
    }

    const duplicateExists = [...privateStudentsList, ...speakonStudentsList].some((n) => {
        const sameAsOriginal = n.trim().toLowerCase() === originalName.trim().toLowerCase();
        return !sameAsOriginal && n.trim().toLowerCase() === fullName.toLowerCase();
    });
    if (duplicateExists) {
        alert('That name is already in the list.');
        return;
    }

    oldList.splice(oldIdx, 1);
    const newList = nextKind === 'private' ? privateStudentsList : speakonStudentsList;
    newList.push(fullName);
    newList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    if (originalName !== fullName) {
        if (teacherSchedules[originalName] && !teacherSchedules[fullName]) {
            teacherSchedules[fullName] = teacherSchedules[originalName];
        } else if (!teacherSchedules[fullName]) {
            teacherSchedules[fullName] = {};
        }
        delete teacherSchedules[originalName];
        renameStudentClassReportRows(originalName, fullName);
    } else if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }

    if (currentTeacher && currentTeacher.trim().toLowerCase() === originalName.trim().toLowerCase()) {
        currentTeacher = fullName;
    }

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();
    selectTeacher(currentTeacher || teachersList[0] || fullName);
    closeEditStudentModal();
}

function setupEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    const form = document.getElementById('editStudentForm');
    const cancelBtn = document.getElementById('editStudentCancel');
    const deleteBtn = document.getElementById('editStudentDelete');
    const backdrop = document.getElementById('editStudentModalBackdrop');
    if (!modal || !form) {
        return;
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeEditStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeEditStudentModal());
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => upsertStudentFromEditForm('delete'));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        upsertStudentFromEditForm('save');
    });

    if (!editStudentEscHandlerBound) {
        editStudentEscHandlerBound = true;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeEditStudentModal();
            }
        });
    }
}

function addStudentFromForm(firstName, lastName, rosterKey) {
    const first = String(firstName || '').trim();
    const last = String(lastName || '').trim();
    const kind = String(rosterKey || '').trim();

    if (!first || !last) {
        alert('Please enter both first and last name.');
        return;
    }

    if (!['teacher', 'private', 'speakon'].includes(kind)) {
        alert('Please choose Teacher, HomeTeachers, or SpeakOn.');
        return;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ');
    const nameTaken = [...teachersList, ...privateStudentsList, ...speakonStudentsList].some(
        (n) => n.trim().toLowerCase() === fullName.toLowerCase()
    );
    if (nameTaken) {
        alert('That name is already in the list.');
        return;
    }

    const list = kind === 'teacher'
        ? teachersList
        : (kind === 'private' ? privateStudentsList : speakonStudentsList);
    list.push(fullName);
    list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();
    selectTeacher(currentTeacher || teachersList[0]);

    closeAddStudentModal();
}

function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    const firstInput = document.getElementById('addStudentFirst');
    const lastInput = document.getElementById('addStudentLast');
    const categorySelect = document.getElementById('addStudentCategory');
    if (!modal || !firstInput || !lastInput || !categorySelect) {
        return;
    }

    firstInput.value = '';
    lastInput.value = '';
    categorySelect.selectedIndex = 0;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    firstInput.focus();
}

function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (!modal) {
        return;
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function setupAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    const form = document.getElementById('addStudentForm');
    const openBtn = document.getElementById('addStudentBtn');
    const cancelBtn = document.getElementById('addStudentCancel');
    const backdrop = document.getElementById('addStudentModalBackdrop');

    if (!modal || !form || !openBtn) {
        return;
    }

    openBtn.addEventListener('click', () => openAddStudentModal());

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeAddStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeAddStudentModal());
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const first = document.getElementById('addStudentFirst').value;
        const last = document.getElementById('addStudentLast').value;
        const cat = document.getElementById('addStudentCategory').value;
        addStudentFromForm(first, last, cat);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeAddStudentModal();
        }
    });
}

// Save current schedule to teacherSchedules
function saveTeacherSchedule(teacherName) {
    teacherSchedules[teacherName] = { ...slotStates };
    // Save to Cloudflare (will also save to localStorage as backup)
    saveAllSchedules();
}

// Load schedule from teacherSchedules
function loadTeacherSchedule(teacherName) {
    slotStates = teacherSchedules[teacherName] ? { ...teacherSchedules[teacherName] } : {};
}

// Initialize the calendar
function initCalendar() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    
    // Initialize context menu
    contextMenu = document.getElementById('contextMenu');
    
    // Generate time slots for each hour
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        // Time label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatHour(hour);
        timeSlotsContainer.appendChild(timeLabel);
        
        // Time slots for each day
        DAYS.forEach((day, dayIndex) => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.dataset.day = day;
            slot.dataset.hour = hour;
            
            // Left click: cycle through states
            slot.addEventListener('click', (e) => {
                if (e.button === 0 || !e.button) { // Left click
                    cycleSlotState(day, hour);
                }
            });
            
            // Right click: show context menu
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, day, hour);
            });
            
            timeSlotsContainer.appendChild(slot);
        });
    }
    
    // Close context menu when clicking elsewhere
    document.addEventListener('click', () => {
        hideContextMenu();
    });
    
    // Handle context menu item clicks
    document.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const color = item.dataset.color;
            if (currentSlot) {
                setSlotState(currentSlot.day, currentSlot.hour, color === 'clear' ? null : color);
                hideContextMenu();
            }
        });
    });
}

// Refresh calendar display based on current slotStates
function refreshCalendarDisplay() {
    DAYS.forEach(day => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const key = `${day}-${hour}`;
            const state = slotStates[key] || null;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                // Remove all state classes
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon', 'state-special');
                
                // Add current state class
                if (state) {
                    slot.classList.add(`state-${state}`);
                }
            }
        }
    });
}

// Format hour for display (e.g., 8 -> "8:00 a.m.", 13 -> "1:00 p.m.")
function formatHour(hour) {
    const period = hour >= 12 ? 'p.m.' : 'a.m.';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
}

// Get current state of a slot
function getSlotState(day, hour) {
    const key = `${day}-${hour}`;
    return slotStates[key] || null;
}

// Set state of a slot
function setSlotState(day, hour, state) {
    if (!currentTeacher) return;
    
    const key = `${day}-${hour}`;
    const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
    
    if (!slot) return;
    
    // Remove all state classes
    slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon', 'state-special');
    
    if (state) {
        slotStates[key] = state;
        slot.classList.add(`state-${state}`);
    } else {
        slotStates[key] = null;
    }
    
    // Save to teacher schedule and localStorage
    saveTeacherSchedule(currentTeacher);
    
    updateSummary();
}

// Cycle through states on left click: null -> available -> unavailable -> null
function cycleSlotState(day, hour) {
    if (!currentTeacher) return;
    
    const currentState = getSlotState(day, hour);
    const currentIndex = STATE_CYCLE.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % STATE_CYCLE.length;
    const nextState = STATE_CYCLE[nextIndex];
    
    setSlotState(day, hour, nextState);
}

// Show context menu on right click
function showContextMenu(event, day, hour) {
    if (!currentTeacher) return;
    
    currentSlot = { day, hour };
    contextMenu.classList.add('show');
    
    // Position menu near cursor
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    
    // Adjust if menu goes off screen
    setTimeout(() => {
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${event.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${event.pageY - rect.height}px`;
        }
    }, 0);
}

// Hide context menu
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.remove('show');
    }
    currentSlot = null;
}

// Update the summary panel - show only Available slots
function updateSummary() {
    if (!currentTeacher) return;

    const summaryContent = document.getElementById('summaryContent');
    const summaryPanel = document.getElementById('summaryPanel');

    const availableSlots = {};

    DAYS.forEach((day) => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const state = getSlotState(day, hour);
            if (state === 'available') {
                if (!availableSlots[day]) {
                    availableSlots[day] = [];
                }
                availableSlots[day].push(hour);
            }
        }
    });

    const hasAvailable = Object.values(availableSlots).some((hours) => hours.length > 0);

    if (!hasAvailable) {
        summaryContent.innerHTML =
            '<div class="day-summary day-summary-available">' +
            '<h3>Available</h3>' +
            '<p class="empty-message">No available hours selected yet. Left-click to mark available time slots.</p>' +
            '</div>';
    } else {
        let html = '';
        html += '<div class="day-summary day-summary-available">';
        html += '<h3>Available</h3>';

        DAYS.forEach((day) => {
            if (!availableSlots[day] || availableSlots[day].length === 0) return;
            const ranges = groupConsecutiveHours(availableSlots[day]);
            const hoursFlat = [];
            for (const range of ranges) {
                for (let h = range.start; h <= range.end; h++) {
                    hoursFlat.push(h);
                }
            }
            html += '<div class="summary-day-block">';
            html += `<div class="summary-day-name">${day}:</div>`;
            for (const h of hoursFlat) {
                html += `<div class="summary-time-line">\u2014 ${formatHour(h)}</div>`;
            }
            html += '</div>';
        });

        html += '</div>';
        summaryContent.innerHTML = html;
    }

    if (summaryPanel) {
        summaryPanel.classList.toggle('summary-panel--has-slots', hasAvailable);
    }
}

// Group consecutive hours into ranges
function groupConsecutiveHours(hours) {
    if (hours.length === 0) return [];
    
    const sortedHours = [...hours].sort((a, b) => a - b);
    const ranges = [];
    let start = sortedHours[0];
    let end = sortedHours[0];
    
    for (let i = 1; i < sortedHours.length; i++) {
        if (sortedHours[i] === end + 1) {
            end = sortedHours[i];
        } else {
            ranges.push({ start, end });
            start = sortedHours[i];
            end = sortedHours[i];
        }
    }
    
    ranges.push({ start, end });
    return ranges;
}

// Select all time slots as available
function selectAll() {
    if (!currentTeacher) return;
    
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon', 'state-special');
                slotStates[key] = 'available';
                slot.classList.add('state-available');
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
    updateSummary();
}

// Clear all selections
function clearAll() {
    if (!currentTeacher) return;
    
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                slot.classList.remove('state-available', 'state-unavailable', 'state-navy', 'state-cyan', 'state-magenta', 'state-salmon', 'state-special');
                slotStates[key] = null;
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
    updateSummary();
}

// Export schedule as text
function exportSchedule() {
    if (!currentTeacher) {
        alert('Please select a teacher first.');
        return;
    }
    
    // Save current schedule before exporting
    saveTeacherSchedule(currentTeacher);
    
    let text = `${currentTeacher.toUpperCase()}'S TEACHING AVAILABILITY SCHEDULE\n`;
    text += '='.repeat(50) + '\n\n';
    
    const stateLabels = {
        available: 'Available',
        unavailable: 'Unavailable',
        navy: 'HomeTeachers',
        cyan: 'HomeTeachers (extra)',
        magenta: 'SpeakOn',
        salmon: 'SpeakOn (extra)',
        special: 'Special Class'
    };
    
    let hasSelections = false;
    
    Object.keys(stateLabels).forEach(state => {
        const days = {};
        
        DAYS.forEach(day => {
            const hours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (getSlotState(day, hour) === state) {
                    hours.push(hour);
                }
            }
            if (hours.length > 0) {
                days[day] = hours;
                hasSelections = true;
            }
        });
        
        if (Object.keys(days).length > 0) {
            text += `${stateLabels[state]}:\n`;
            text += '-'.repeat(30) + '\n';
            
            DAYS.forEach(day => {
                if (days[day] && days[day].length > 0) {
                    text += `  ${day}:\n`;
                    const ranges = groupConsecutiveHours(days[day]);
                    ranges.forEach(range => {
                        if (range.start === range.end) {
                            text += `    - ${formatHour(range.start)}\n`;
                        } else {
                            text += `    - ${formatHour(range.start)} - ${formatHour(range.end + 1)}\n`;
                        }
                    });
                }
            });
            text += '\n';
        }
    });
    
    if (!hasSelections) {
        text += 'No hours selected.\n';
    }
    
    // Create and download file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTeacher}-availability.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Schedule exported! Check the downloaded file.');
}

// Export schedule as PDF
function exportSchedulePDF() {
    if (!currentTeacher) {
        alert('Please select a teacher first.');
        return;
    }
    
    // Save current schedule before exporting
    saveTeacherSchedule(currentTeacher);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colors for PDF (RGB values)
    const stateColors = {
        available: [107, 142, 35],      // Olive green
        unavailable: [139, 0, 0],        // Dark red
        navy: [0, 0, 128],               // Navy blue
        cyan: [0, 188, 212],             // Cyan
        magenta: [255, 0, 255],          // Magenta
        salmon: [250, 128, 114],         // Salmon
        special: [167, 155, 142]         // Special class
    };
    
    const stateLabels = {
        available: 'Available',
        unavailable: 'Unavailable',
        navy: 'HomeTeachers',
        cyan: 'HomeTeachers (extra)',
        magenta: 'SpeakOn',
        salmon: 'SpeakOn (extra)',
        special: 'Special Class'
    };
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(63, 81, 181);
    doc.text(`${currentTeacher}'s Teaching Availability`, 105, 20, { align: 'center' });
    
    // Date
    const now = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, 28, { align: 'center' });
    
    let yPos = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = 170;
    let hasSelections = false;
    
    // Organize data by state
    Object.keys(stateLabels).forEach(state => {
        const days = {};
        
        DAYS.forEach(day => {
            const hours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (getSlotState(day, hour) === state) {
                    hours.push(hour);
                }
            }
            if (hours.length > 0) {
                days[day] = hours;
                hasSelections = true;
            }
        });
        
        if (Object.keys(days).length > 0) {
            // Check if we need a new page
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }
            
            // Section header with color
            const color = stateColors[state];
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(stateLabels[state], margin + 2, yPos + 2);
            
            yPos += 12;
            
            // Days and hours
            DAYS.forEach(day => {
                if (days[day] && days[day].length > 0) {
                    // Check if we need a new page
                    if (yPos > pageHeight - 30) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.setFontSize(10);
                    doc.setTextColor(70, 70, 70);
                    doc.setFont(undefined, 'bold');
                    doc.text(day + ':', margin + 5, yPos);
                    
                    const ranges = groupConsecutiveHours(days[day]);
                    let timeText = ranges.map(range => {
                        if (range.start === range.end) {
                            return formatHour(range.start);
                        } else {
                            return `${formatHour(range.start)} - ${formatHour(range.end + 1)}`;
                        }
                    }).join(', ');
                    
                    doc.setFont(undefined, 'normal');
                    doc.text(timeText, margin + 45, yPos);
                    
                    yPos += 7;
                }
            });
            
            yPos += 5; // Space between sections
        }
    });
    
    if (!hasSelections) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(12);
        doc.text('No hours selected.', margin, yPos);
    }
    
    // Save the PDF
    doc.save(`${currentTeacher}-availability.pdf`);
    alert('PDF exported successfully!');
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    await initTeachers();
    initCalendar();
    setupAddStudentModal();
    setupEditStudentModal();
    setupStudentClassReportPanel();
    setupClassTopicModal();
});

// Save schedules before page unload as a safety backup
window.addEventListener('beforeunload', () => {
    if (currentTeacher) {
        saveTeacherSchedule(currentTeacher);
    }
    
    // Clean up polling
    if (pollTimer) {
        clearInterval(pollTimer);
    }
});
