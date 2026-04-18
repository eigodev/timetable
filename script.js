// Configuration
const START_HOUR = 7; // 7 AM
const END_HOUR = 23; // 11 PM (exclusive, includes 10 PM slot)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// LocalStorage key (fallback)
const STORAGE_KEY = 'timetable_schedules';
const ROSTER_STORAGE_KEY = 'timetable_roster';
const CLASS_REPORT_ROWS_KEY = 'timetable_student_class_report_rows';
const LOGIN_CREDENTIALS_STORAGE_KEY = 'timetable_saved_login_credentials';
/** When set in sessionStorage, skip auto-login until the next successful manual login (same tab). */
const LOGIN_SESSION_SUPPRESS_KEY = 'timetable_teacher_session_suppressed';
const PROFILE_AVATARS_STORAGE_KEY = 'timetable_profile_avatars';
const SCHOOL_THEME_COLORS = [
    '#c2185b','#f57c00','#fbc02d','#388e3c','#009688','#7b1fa2','#e91e63','#ef6c00','#afb42b','#26a69a','#5c6bc0','#6d4c41','#d32f2f','#7cb342','#9575cd','#757575','#e57373','#43a047','#42a5f5','#7986cb','#616161','#ef9a9a','#fdd835','#66bb6a','#1e88e5','#5e35b1','#bdbdbd'
];
const SCHOOL_THEME_PALETTE_GROUPS = [
    { label: 'Reds & Pinks', colors: ['#c2185b', '#e91e63', '#d32f2f', '#e57373', '#ef9a9a'] },
    { label: 'Oranges & Yellows', colors: ['#ef6c00', '#f57c00', '#fbc02d', '#fdd835'] },
    { label: 'Greens & Teals', colors: ['#388e3c', '#43a047', '#7cb342', '#afb42b', '#009688', '#26a69a', '#66bb6a'] },
    { label: 'Blues & Purples', colors: ['#1e88e5', '#42a5f5', '#5c6bc0', '#7986cb', '#9575cd', '#5e35b1', '#7b1fa2'] },
    { label: 'Neutrals', colors: ['#6d4c41', '#616161', '#757575', '#bdbdbd'] }
];
const SCHOOL_THEME_COLOR_SET = new Set(SCHOOL_THEME_COLORS.map((c) => c.toLowerCase()));
const PHONE_COUNTRY_OPTIONS = [
    { iso: 'BR', flag: '🇧🇷', name: 'Brazil', dialCode: '+55', sample: '11 99999-9999' },
    { iso: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1', sample: '(555) 123-4567' },
    { iso: 'CA', flag: '🇨🇦', name: 'Canada', dialCode: '+1', sample: '(555) 123-4567' },
    { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44', sample: '7400 123456' },
    { iso: 'PT', flag: '🇵🇹', name: 'Portugal', dialCode: '+351', sample: '912 345 678' },
    { iso: 'ES', flag: '🇪🇸', name: 'Spain', dialCode: '+34', sample: '612 34 56 78' },
    { iso: 'FR', flag: '🇫🇷', name: 'France', dialCode: '+33', sample: '6 12 34 56 78' },
    { iso: 'DE', flag: '🇩🇪', name: 'Germany', dialCode: '+49', sample: '1512 3456789' },
    { iso: 'IT', flag: '🇮🇹', name: 'Italy', dialCode: '+39', sample: '312 345 6789' },
    { iso: 'IE', flag: '🇮🇪', name: 'Ireland', dialCode: '+353', sample: '85 123 4567' },
    { iso: 'MX', flag: '🇲🇽', name: 'Mexico', dialCode: '+52', sample: '55 1234 5678' },
    { iso: 'AR', flag: '🇦🇷', name: 'Argentina', dialCode: '+54', sample: '9 11 1234-5678' },
    { iso: 'CL', flag: '🇨🇱', name: 'Chile', dialCode: '+56', sample: '9 1234 5678' },
    { iso: 'CO', flag: '🇨🇴', name: 'Colombia', dialCode: '+57', sample: '300 123 4567' },
    { iso: 'PE', flag: '🇵🇪', name: 'Peru', dialCode: '+51', sample: '912 345 678' },
    { iso: 'AU', flag: '🇦🇺', name: 'Australia', dialCode: '+61', sample: '412 345 678' },
    { iso: 'NZ', flag: '🇳🇿', name: 'New Zealand', dialCode: '+64', sample: '21 123 4567' },
    { iso: 'JP', flag: '🇯🇵', name: 'Japan', dialCode: '+81', sample: '90-1234-5678' },
    { iso: 'KR', flag: '🇰🇷', name: 'South Korea', dialCode: '+82', sample: '10-1234-5678' },
    { iso: 'IN', flag: '🇮🇳', name: 'India', dialCode: '+91', sample: '91234 56789' }
];
const DEFAULT_PHONE_COUNTRY_ISO = 'BR';
const BRAZIL_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%2036%2036%22%3E%3Cpath%20fill%3D%22%23009B3A%22%20d%3D%22M36%2027a4%204%200%200%201-4%204H4a4%204%200%200%201-4-4V9a4%204%200%200%201%204-4h28a4%204%200%200%201%204%204v18z%22/%3E%3Cpath%20fill%3D%22%23FEDF01%22%20d%3D%22M32.728%2018L18%2029.124L3.272%2018L18%206.875z%22/%3E%3Ccircle%20cx%3D%2217.976%22%20cy%3D%2217.924%22%20r%3D%226.458%22%20fill%3D%22%23002776%22/%3E%3Cpath%20fill%3D%22%23CBE9D4%22%20d%3D%22M12.277%2014.887a6.406%206.406%200%200%200-.672%202.023c3.995-.29%209.417%201.891%2011.744%204.595c.402-.604.7-1.28.883-2.004c-2.872-2.808-7.917-4.63-11.955-4.614z%22/%3E%3Cpath%20fill%3D%22%2388C9F9%22%20d%3D%22M12%2018.233h1v1h-1zm1%202h1v1h-1z%22/%3E%3Cpath%20fill%3D%22%2355ACEE%22%20d%3D%22M15%2018.233h1v1h-1zm2%201h1v1h-1zm4%202h1v1h-1zm-3%201h1v1h-1zm3-6h1v1h-1z%22/%3E%3Cpath%20fill%3D%22%233B88C3%22%20d%3D%22M19%2020.233h1v1h-1z%22/%3E%3C/svg%3E';

/** @type {Record<string, Array<Record<string, string>>>} */
let studentClassReportRows = {};

let teachersList = [];
let privateStudentsList = [];
let speakonStudentsList = [];
let passportStudentsList = [];
let passportFollowupLinks = {};
let passportHeaderPageLink = '';
let studentSchoolByName = {};
let studentPhonesByName = {};
let teacherEmailsByName = {};
let teacherPasswordsByName = {};
/** School titles to show in sidebar with no students yet (persisted). */
let customSchoolsList = [];
/** Per-school external URLs (spreadsheet etc.), keyed by normalized school title. */
let schoolExternalLinks = {};
/** Per-school UI colors (primary/secondary), keyed by normalized school title. */
let schoolThemeColors = {};
let addStudentModalMode = 'student';
let addStudentTargetSchool = '';
let editStudentEscHandlerBound = false;
let pendingDeleteSchoolTitle = '';
let pendingSchoolSettingsTitle = '';
let schoolSettingsColorTarget = '';
let schoolSettingsColorPopupHideTimer = null;
let addSchoolColorTarget = '';
let addSchoolColorPopupHideTimer = null;
let calendarToolbarExternalLink = '';
/** @type {Record<string, { classDay: string, classHour: string, extraDay: string, extraHour: string }>} */
let speakonStudentWeeklyClass = {};
let isTeacherLoggedIn = false;
let loggedInTeacherName = '';
let classReportCollapsedBySchool = {};
let sidebarPaneCollapsedState = {
    teachers: false,
    schools: false,
    classReport: false,
    finances: false
};
let profileAvatarsByKey = {};
let profileAvatarsLoaded = false;
let googleMeetSelectedSchool = '';
/** @type {Set<string>} */
let googleMeetSelectedStudentNames = new Set();
/** @type {Record<string, string>} student display name → Meet URL */
let studentGoogleMeetLinksByName = {};
let googleMeetLinkPopoverStudent = '';
let googleMeetLinkPopoverEscapeHandler = null;
let googleMeetToggleSwapTimer = null;
let googleMeetContextMessageTimer = null;
let googleMeetContextMessageHideTimer = null;
let googleMeetUseSharedSchoolLink = false;
let googleMeetSharedLinkModeBySchoolKey = {};
const MODAL_CLOSE_ANIMATION_MS = 220;
const modalCloseTimers = new WeakMap();

function openModalWithAnimation(modal) {
    if (!modal) return;
    const timer = modalCloseTimers.get(modal);
    if (timer) {
        clearTimeout(timer);
        modalCloseTimers.delete(modal);
    }
    modal.classList.remove('is-closing');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function setGoogleMeetToggleText(nextText, animate = false) {
    const schoolToggleText = document.getElementById('googleMeetSchoolToggleText');
    if (!schoolToggleText) {
        return;
    }
    const targetText = String(nextText || '').trim() || 'Select a School';
    const currentText = String(schoolToggleText.textContent || '').trim();
    if (!animate || currentText === targetText) {
        schoolToggleText.textContent = targetText;
        schoolToggleText.classList.remove('is-swap-out', 'is-swap-in');
        if (googleMeetToggleSwapTimer) {
            clearTimeout(googleMeetToggleSwapTimer);
            googleMeetToggleSwapTimer = null;
        }
        return;
    }
    if (googleMeetToggleSwapTimer) {
        clearTimeout(googleMeetToggleSwapTimer);
        googleMeetToggleSwapTimer = null;
    }
    schoolToggleText.classList.remove('is-swap-in');
    schoolToggleText.classList.add('is-swap-out');
    googleMeetToggleSwapTimer = window.setTimeout(() => {
        schoolToggleText.textContent = targetText;
        schoolToggleText.classList.remove('is-swap-out');
        schoolToggleText.classList.add('is-swap-in');
        googleMeetToggleSwapTimer = window.setTimeout(() => {
            schoolToggleText.classList.remove('is-swap-in');
            googleMeetToggleSwapTimer = null;
        }, 260);
    }, 220);
}

function closeModalWithAnimation(modal) {
    if (!modal) return;
    const timer = modalCloseTimers.get(modal);
    if (timer) {
        clearTimeout(timer);
    }
    modal.classList.add('is-closing');
    modal.setAttribute('aria-hidden', 'true');
    const nextTimer = window.setTimeout(() => {
        modal.classList.remove('is-open', 'is-closing');
        modalCloseTimers.delete(modal);
    }, MODAL_CLOSE_ANIMATION_MS);
    modalCloseTimers.set(modal, nextTimer);
}

function loadRosterFromStorage() {
    try {
        const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getThemeByRosterKind(kind) {
    const k = String(kind || '').trim().toLowerCase();
    if (k === 'passport') return { primary: '#d32f2f', secondary: '#e57373' };
    if (k === 'speakon') return { primary: '#c2185b', secondary: '#ef9a9a' };
    return { primary: '#1e88e5', secondary: '#5c6bc0' };
}

function normalizeSchoolTheme(theme, schoolTitle = '') {
    const fallback = getThemeByRosterKind(rosterKindFromSchoolName(schoolTitle));
    const rawPrimary = String(theme?.primary || '').trim().toLowerCase();
    const rawSecondary = String(theme?.secondary || '').trim().toLowerCase();
    const primary = SCHOOL_THEME_COLOR_SET.has(rawPrimary) ? rawPrimary : fallback.primary;
    let secondary = SCHOOL_THEME_COLOR_SET.has(rawSecondary) ? rawSecondary : fallback.secondary;
    if (secondary === primary) {
        secondary = SCHOOL_THEME_COLORS.find((c) => c.toLowerCase() !== primary) || fallback.secondary;
    }
    return { primary, secondary };
}

function hexToRgb(hex) {
    const normalized = String(hex || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return { r: 63, g: 81, b: 181 };
    const int = Number.parseInt(normalized, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbaFromHex(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function schoolThemeKey(displayTitle) {
    return String(displayTitle || '').trim().toLowerCase();
}

function compactSchoolThemeKey(displayTitle) {
    return schoolThemeKey(displayTitle).replace(/[^a-z0-9]+/g, '');
}

function isCustomizedThemeForSchool(theme, schoolTitle) {
    const normalized = normalizeSchoolTheme(theme, schoolTitle);
    const fallback = getThemeByRosterKind(rosterKindFromSchoolName(schoolTitle));
    return normalized.primary !== fallback.primary || normalized.secondary !== fallback.secondary;
}

function getStoredSchoolThemeByDisplayTitle(displayTitle) {
    const key = schoolThemeKey(displayTitle);
    const exact = key ? schoolThemeColors[key] : null;
    const compact = compactSchoolThemeKey(displayTitle);
    if (!compact) return exact || null;
    const compactMatches = Object.keys(schoolThemeColors)
        .filter((k) => compactSchoolThemeKey(k) === compact)
        .map((k) => schoolThemeColors[k])
        .filter(Boolean);
    if (exact && isCustomizedThemeForSchool(exact, displayTitle)) {
        return exact;
    }
    const customizedCompact = compactMatches.find((theme) => isCustomizedThemeForSchool(theme, displayTitle));
    if (customizedCompact) return customizedCompact;
    return exact || compactMatches[0] || null;
}

function getSchoolTheme(displayTitle) {
    const stored = getStoredSchoolThemeByDisplayTitle(displayTitle);
    return normalizeSchoolTheme(stored, displayTitle);
}

function applySchoolThemeCssVars(el, displayTitle) {
    if (!el) return;
    const theme = getSchoolTheme(displayTitle);
    el.style.setProperty('--school-primary', theme.primary);
    el.style.setProperty('--school-secondary', theme.secondary);
    el.style.setProperty('--school-primary-soft', rgbaFromHex(theme.primary, 0.12));
    el.style.setProperty('--school-secondary-soft', rgbaFromHex(theme.secondary, 0.18));
    el.style.setProperty('--school-primary-border', rgbaFromHex(theme.primary, 0.3));
    el.style.setProperty('--school-primary-hover', rgbaFromHex(theme.primary, 0.2));
}

function applyColorSelectPreview(selectEl) {
    if (!selectEl) return;
    const color = String(selectEl.value || '').trim().toLowerCase();
    if (!/^#[0-9a-f]{6}$/i.test(color)) return;
    selectEl.style.setProperty('--theme-select-color', color);
}

function initColorThemeSelect(selectEl) {
    if (!selectEl) return;
    if (selectEl.dataset.themePreviewBound !== '1') {
        selectEl.dataset.themePreviewBound = '1';
        selectEl.classList.add('color-theme-select');
        selectEl.addEventListener('change', () => applyColorSelectPreview(selectEl));
    }
    applyColorSelectPreview(selectEl);
}

function renderSchoolSettingsThemeSquares() {
    const primaryInput = document.getElementById('schoolSettingsPrimaryColor');
    const secondaryInput = document.getElementById('schoolSettingsSecondaryColor');
    const primarySquare = document.querySelector('.school-settings-theme-square--primary');
    const secondarySquare = document.querySelector('.school-settings-theme-square--secondary');
    const primary = String(primaryInput?.value || '').trim().toLowerCase();
    const secondary = String(secondaryInput?.value || '').trim().toLowerCase();
    if (primarySquare && /^#[0-9a-f]{6}$/i.test(primary)) {
        primarySquare.style.background = primary;
    }
    if (secondarySquare && /^#[0-9a-f]{6}$/i.test(secondary)) {
        secondarySquare.style.background = secondary;
    }
}

function closeSchoolSettingsColorPopup() {
    const popup = document.getElementById('schoolSettingsColorPopup');
    if (!popup) return;
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    if (schoolSettingsColorPopupHideTimer) {
        clearTimeout(schoolSettingsColorPopupHideTimer);
        schoolSettingsColorPopupHideTimer = null;
    }
    schoolSettingsColorPopupHideTimer = window.setTimeout(() => {
        popup.hidden = true;
        schoolSettingsColorPopupHideTimer = null;
    }, 200);
    schoolSettingsColorTarget = '';
}

function openSchoolSettingsColorPopup(target, anchorEl) {
    const popup = document.getElementById('schoolSettingsColorPopup');
    const options = document.getElementById('schoolSettingsColorPopupOptions');
    const primaryInput = document.getElementById('schoolSettingsPrimaryColor');
    const secondaryInput = document.getElementById('schoolSettingsSecondaryColor');
    const dialog = document.querySelector('.school-settings-dialog');
    if (!popup || !options || !anchorEl || !dialog || !primaryInput || !secondaryInput) return;
    schoolSettingsColorTarget = target === 'secondary' ? 'secondary' : 'primary';
    options.innerHTML = '';
    SCHOOL_THEME_PALETTE_GROUPS.forEach((group) => {
        const section = document.createElement('div');
        section.className = 'school-settings-color-popup-group';
        const title = document.createElement('p');
        title.className = 'school-settings-color-popup-group-title';
        title.textContent = String(group.label || '').trim();
        section.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'school-settings-color-popup-group-options';
        (group.colors || []).forEach((hex) => {
            const color = String(hex || '').trim().toLowerCase();
            if (!SCHOOL_THEME_COLOR_SET.has(color)) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'school-settings-color-popup-option';
            btn.style.setProperty('--swatch', color);
            btn.setAttribute('aria-label', color);
            btn.title = color.toUpperCase();
            btn.addEventListener('click', () => {
                if (schoolSettingsColorTarget === 'secondary') {
                    secondaryInput.value = color;
                } else {
                    primaryInput.value = color;
                }
                renderSchoolSettingsThemeSquares();
                closeSchoolSettingsColorPopup();
            });
            grid.appendChild(btn);
        });
        section.appendChild(grid);
        options.appendChild(section);
    });

    const dialogRect = dialog.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    popup.hidden = false;
    if (schoolSettingsColorPopupHideTimer) {
        clearTimeout(schoolSettingsColorPopupHideTimer);
        schoolSettingsColorPopupHideTimer = null;
    }
    options.style.maxHeight = '220px';
    // Measure after un-hiding so coordinates follow actual popup size.
    const popupWidth = popup.offsetWidth || 220;
    const popupHeight = popup.offsetHeight || 220;
    const horizontalPad = 10;
    const verticalPad = 10;
    const anchorLeft = anchorRect.left - dialogRect.left;
    let left = anchorLeft - 4;
    left = Math.max(horizontalPad, Math.min(left, dialogRect.width - popupWidth - horizontalPad));
    const anchorBottom = anchorRect.bottom - dialogRect.top;
    const anchorTop = anchorRect.top - dialogRect.top;
    const availableBelow = Math.max(0, dialogRect.height - anchorBottom - verticalPad - 8);
    const availableAbove = Math.max(0, anchorTop - verticalPad - 8);
    const minPopupHeight = 140;
    let top = anchorBottom + 8;

    if (availableBelow < minPopupHeight && availableAbove > availableBelow) {
        top = Math.max(verticalPad, anchorTop - popupHeight - 8);
    } else {
        const targetHeight = Math.max(minPopupHeight, Math.min(availableBelow, 260));
        options.style.maxHeight = `${Math.round(targetHeight)}px`;
    }

    top = Math.max(verticalPad, Math.min(top, dialogRect.height - popupHeight - verticalPad));
    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(top)}px`;
    requestAnimationFrame(() => popup.classList.add('is-open'));
    popup.setAttribute('aria-hidden', 'false');
}

function renderAddSchoolThemeSquares() {
    const primaryInput = document.getElementById('addSchoolPrimaryColor');
    const secondaryInput = document.getElementById('addSchoolSecondaryColor');
    const primarySquare = document.querySelector('.add-school-theme-square--primary');
    const secondarySquare = document.querySelector('.add-school-theme-square--secondary');
    const primary = String(primaryInput?.value || '').trim().toLowerCase();
    const secondary = String(secondaryInput?.value || '').trim().toLowerCase();
    if (primarySquare && /^#[0-9a-f]{6}$/i.test(primary)) {
        primarySquare.style.background = primary;
    }
    if (secondarySquare && /^#[0-9a-f]{6}$/i.test(secondary)) {
        secondarySquare.style.background = secondary;
    }
}

function closeAddSchoolColorPopup() {
    const popup = document.getElementById('addSchoolColorPopup');
    if (!popup) return;
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    if (addSchoolColorPopupHideTimer) {
        clearTimeout(addSchoolColorPopupHideTimer);
        addSchoolColorPopupHideTimer = null;
    }
    addSchoolColorPopupHideTimer = window.setTimeout(() => {
        popup.hidden = true;
        addSchoolColorPopupHideTimer = null;
    }, 200);
    addSchoolColorTarget = '';
}

function openAddSchoolColorPopup(target, anchorEl) {
    const popup = document.getElementById('addSchoolColorPopup');
    const options = document.getElementById('addSchoolColorPopupOptions');
    const primaryInput = document.getElementById('addSchoolPrimaryColor');
    const secondaryInput = document.getElementById('addSchoolSecondaryColor');
    const dialog = document.querySelector('.add-student-dialog');
    if (!popup || !options || !anchorEl || !dialog || !primaryInput || !secondaryInput) return;
    addSchoolColorTarget = target === 'secondary' ? 'secondary' : 'primary';
    options.innerHTML = '';
    SCHOOL_THEME_PALETTE_GROUPS.forEach((group) => {
        const section = document.createElement('div');
        section.className = 'school-settings-color-popup-group';
        const title = document.createElement('p');
        title.className = 'school-settings-color-popup-group-title';
        title.textContent = String(group.label || '').trim();
        section.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'school-settings-color-popup-group-options';
        (group.colors || []).forEach((hex) => {
            const color = String(hex || '').trim().toLowerCase();
            if (!SCHOOL_THEME_COLOR_SET.has(color)) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'school-settings-color-popup-option';
            btn.style.setProperty('--swatch', color);
            btn.setAttribute('aria-label', color);
            btn.title = color.toUpperCase();
            btn.addEventListener('click', () => {
                if (addSchoolColorTarget === 'secondary') {
                    secondaryInput.value = color;
                } else {
                    primaryInput.value = color;
                }
                renderAddSchoolThemeSquares();
                closeAddSchoolColorPopup();
            });
            grid.appendChild(btn);
        });
        section.appendChild(grid);
        options.appendChild(section);
    });

    const dialogRect = dialog.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    popup.hidden = false;
    if (addSchoolColorPopupHideTimer) {
        clearTimeout(addSchoolColorPopupHideTimer);
        addSchoolColorPopupHideTimer = null;
    }
    options.style.maxHeight = '220px';
    const popupWidth = popup.offsetWidth || 220;
    const popupHeight = popup.offsetHeight || 220;
    const horizontalPad = 10;
    const verticalPad = 10;
    const anchorLeft = anchorRect.left - dialogRect.left;
    let left = anchorLeft - 4;
    left = Math.max(horizontalPad, Math.min(left, dialogRect.width - popupWidth - horizontalPad));
    const anchorBottom = anchorRect.bottom - dialogRect.top;
    const anchorTop = anchorRect.top - dialogRect.top;
    const availableBelow = Math.max(0, dialogRect.height - anchorBottom - verticalPad - 8);
    const availableAbove = Math.max(0, anchorTop - verticalPad - 8);
    const minPopupHeight = 140;
    let top = anchorBottom + 8;

    if (availableBelow < minPopupHeight && availableAbove > availableBelow) {
        top = Math.max(verticalPad, anchorTop - popupHeight - 8);
    } else {
        const targetHeight = Math.max(minPopupHeight, Math.min(availableBelow, 260));
        options.style.maxHeight = `${Math.round(targetHeight)}px`;
    }

    top = Math.max(verticalPad, Math.min(top, dialogRect.height - popupHeight - verticalPad));
    popup.style.left = `${Math.round(left)}px`;
    popup.style.top = `${Math.round(top)}px`;
    requestAnimationFrame(() => popup.classList.add('is-open'));
    popup.setAttribute('aria-hidden', 'false');
}

function loadSavedLoginCredentials() {
    try {
        const raw = localStorage.getItem(LOGIN_CREDENTIALS_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            email: String(parsed.email || '').trim(),
            password: String(parsed.password || '')
        };
    } catch {
        return null;
    }
}

function saveLoginCredentials(email, password) {
    try {
        localStorage.setItem(
            LOGIN_CREDENTIALS_STORAGE_KEY,
            JSON.stringify({
                email: String(email || '').trim(),
                password: String(password || '')
            })
        );
    } catch (error) {
        console.error('Error saving login credentials to localStorage:', error);
    }
}

function clearSavedLoginCredentials() {
    try {
        localStorage.removeItem(LOGIN_CREDENTIALS_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing saved login credentials from localStorage:', error);
    }
}

/**
 * If the user previously chose to save credentials, validate them against the roster
 * and restore an authenticated teacher session (same rules as the login form).
 * @returns {string|null} teacher name when session was restored, otherwise null
 */
function tryRestoreTeacherSessionFromSavedCredentials() {
    try {
        if (sessionStorage.getItem(LOGIN_SESSION_SUPPRESS_KEY) === '1') return null;
    } catch {
        /* sessionStorage may be unavailable in some environments */
    }
    const saved = loadSavedLoginCredentials();
    if (!saved) return null;
    const email = String(saved.email || '').trim().toLowerCase();
    const password = String(saved.password || '').trim();
    if (!email || !password || password.length < 8) return null;

    const teacherNameByEmail = teachersList.find((name) => {
        const teacherEmail = String(teacherEmailsByName[name] || '').trim().toLowerCase();
        return teacherEmail && teacherEmail === email;
    });
    if (!teacherNameByEmail) return null;

    const expectedPassword = String(teacherPasswordsByName[teacherNameByEmail] || '');
    if (!expectedPassword || password !== expectedPassword) return null;

    isTeacherLoggedIn = true;
    loggedInTeacherName = teacherNameByEmail;
    return teacherNameByEmail;
}

function isTeacherSelectionAllowed(name) {
    const requested = String(name || '').trim();
    if (!requested) return false;
    if (!isTeacherLoggedIn) return false;
    if (!loggedInTeacherName) return true;
    return requested.toLowerCase() === String(loggedInTeacherName || '').trim().toLowerCase();
}

function getActiveTeacherProfileName() {
    if (!isTeacherLoggedIn) return '';
    const logged = String(loggedInTeacherName || '').trim();
    if (logged) return logged;
    const current = String(currentTeacher || '').trim();
    if (current && isActiveTeacherName(current)) return current;
    return String(teachersList[0] || '').trim();
}

function getCurrentProfileKey() {
    const name = isTeacherLoggedIn ? getActiveTeacherProfileName() : 'guest';
    return name.toLowerCase();
}

function loadProfileAvatars() {
    try {
        const raw = localStorage.getItem(PROFILE_AVATARS_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function saveProfileAvatars(avatars) {
    try {
        localStorage.setItem(PROFILE_AVATARS_STORAGE_KEY, JSON.stringify(avatars || {}));
        return true;
    } catch (error) {
        console.error('Error saving profile avatars to localStorage:', error);
        return false;
    }
}

function getProfileAvatarDataUrl(profileKey) {
    if (!profileAvatarsLoaded) {
        profileAvatarsByKey = loadProfileAvatars();
        profileAvatarsLoaded = true;
    }
    return String(profileAvatarsByKey[String(profileKey || '').toLowerCase()] || '');
}

function setProfileAvatarDataUrl(profileKey, dataUrl) {
    const key = String(profileKey || '').toLowerCase();
    if (!key) return;
    if (!profileAvatarsLoaded) {
        profileAvatarsByKey = loadProfileAvatars();
        profileAvatarsLoaded = true;
    }
    profileAvatarsByKey[key] = String(dataUrl || '');
    const persisted = saveProfileAvatars(profileAvatarsByKey);
    if (!persisted) {
        showAppMessage('Profile picture previewed, but could not be saved permanently (storage limit).');
    }
}

function initRoster() {
    const saved = loadRosterFromStorage();
    if (!saved) {
        teachersList = [];
        privateStudentsList = [];
        speakonStudentsList = [];
        passportStudentsList = [];
        passportFollowupLinks = {};
        passportHeaderPageLink = '';
        studentSchoolByName = {};
        studentPhonesByName = {};
        teacherEmailsByName = {};
        teacherPasswordsByName = {};
        customSchoolsList = [];
        schoolExternalLinks = {};
        schoolThemeColors = {};
        calendarToolbarExternalLink = '';
        speakonStudentWeeklyClass = {};
        studentGoogleMeetLinksByName = {};
        googleMeetSharedLinkModeBySchoolKey = {};
        loadStudentClassReportRows();
        return;
    }
    teachersList = Array.isArray(saved.teachers) ? [...saved.teachers] : [];
    privateStudentsList = Array.isArray(saved.private) ? [...saved.private] : [];
    speakonStudentsList = Array.isArray(saved.speakon) ? [...saved.speakon] : [];
    passportStudentsList = Array.isArray(saved.passport) ? [...saved.passport] : [];
    passportFollowupLinks =
        saved.passportLinks && typeof saved.passportLinks === 'object' && !Array.isArray(saved.passportLinks)
            ? { ...saved.passportLinks }
            : {};
    passportHeaderPageLink = String(saved.passportHeaderPageLink || '').trim();
    const fromStorage =
        saved.studentSchools && typeof saved.studentSchools === 'object' && !Array.isArray(saved.studentSchools)
            ? { ...saved.studentSchools }
            : {};
    studentSchoolByName = {};
    privateStudentsList.forEach((name) => {
        studentSchoolByName[name] = String(fromStorage[name] || 'HomeTeachers').trim() || 'HomeTeachers';
    });
    speakonStudentsList.forEach((name) => {
        studentSchoolByName[name] = String(fromStorage[name] || 'SpeakOn').trim() || 'SpeakOn';
    });
    passportStudentsList.forEach((name) => {
        studentSchoolByName[name] = String(fromStorage[name] || 'Passport').trim() || 'Passport';
    });
    const phonesRaw =
        saved.studentPhones && typeof saved.studentPhones === 'object' && !Array.isArray(saved.studentPhones)
            ? saved.studentPhones
            : {};
    studentPhonesByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const entry = phonesRaw[name];
        if (!entry || typeof entry !== 'object') return;
        const countryIso = String(entry.countryIso || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
        const normalizedIso = PHONE_COUNTRY_OPTIONS.some((country) => country.iso === countryIso)
            ? countryIso
            : DEFAULT_PHONE_COUNTRY_ISO;
        const number = String(entry.number || '').trim();
        if (!number) return;
        studentPhonesByName[name] = { countryIso: normalizedIso, number };
    });
    const emailsRaw =
        saved.teacherEmails && typeof saved.teacherEmails === 'object' && !Array.isArray(saved.teacherEmails)
            ? { ...saved.teacherEmails }
            : {};
    teacherEmailsByName = {};
    teachersList.forEach((name) => {
        const e = String(emailsRaw[name] || '').trim();
        if (e) teacherEmailsByName[name] = e;
    });
    const passwordsRaw =
        saved.teacherPasswords && typeof saved.teacherPasswords === 'object' && !Array.isArray(saved.teacherPasswords)
            ? { ...saved.teacherPasswords }
            : {};
    teacherPasswordsByName = {};
    teachersList.forEach((name) => {
        const p = String(passwordsRaw[name] || '');
        if (p) teacherPasswordsByName[name] = p;
    });
    customSchoolsList = Array.isArray(saved.customSchools)
        ? [...new Set(saved.customSchools.map((s) => String(s || '').trim()).filter(Boolean))]
        : [];
    customSchoolsList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const meetLinksRaw =
        saved.studentGoogleMeetLinks &&
        typeof saved.studentGoogleMeetLinks === 'object' &&
        !Array.isArray(saved.studentGoogleMeetLinks)
            ? saved.studentGoogleMeetLinks
            : {};
    studentGoogleMeetLinksByName = {};
    Object.keys(meetLinksRaw).forEach((k) => {
        const key = String(k || '').trim();
        const v = String(meetLinksRaw[k] || '').trim();
        if (key && v) studentGoogleMeetLinksByName[key] = v;
    });
    const sharedMeetModeRaw =
        saved.googleMeetSharedLinkModeBySchool &&
        typeof saved.googleMeetSharedLinkModeBySchool === 'object' &&
        !Array.isArray(saved.googleMeetSharedLinkModeBySchool)
            ? saved.googleMeetSharedLinkModeBySchool
            : {};
    googleMeetSharedLinkModeBySchoolKey = {};
    Object.keys(sharedMeetModeRaw).forEach((key) => {
        const k = String(key || '').trim().toLowerCase();
        if (!k) return;
        googleMeetSharedLinkModeBySchoolKey[k] = !!sharedMeetModeRaw[key];
    });
    const linksRaw =
        saved.schoolExternalLinks && typeof saved.schoolExternalLinks === 'object' && !Array.isArray(saved.schoolExternalLinks)
            ? saved.schoolExternalLinks
            : {};
    schoolExternalLinks = {};
    Object.keys(linksRaw).forEach((key) => {
        const k = String(key || '').trim().toLowerCase();
        if (!k) return;
        schoolExternalLinks[k] = String(linksRaw[key] || '').trim();
    });
    const themesRaw =
        saved.schoolThemeColors && typeof saved.schoolThemeColors === 'object' && !Array.isArray(saved.schoolThemeColors)
            ? saved.schoolThemeColors
            : {};
    schoolThemeColors = {};
    Object.keys(themesRaw).forEach((key) => {
        const k = String(key || '').trim().toLowerCase();
        if (!k) return;
        schoolThemeColors[k] = normalizeSchoolTheme(themesRaw[key] || {}, key);
    });
    calendarToolbarExternalLink = String(saved.calendarToolbarExternalLink || '').trim();
    const swcRaw =
        saved.speakonWeeklyClass && typeof saved.speakonWeeklyClass === 'object' && !Array.isArray(saved.speakonWeeklyClass)
            ? saved.speakonWeeklyClass
            : {};
    speakonStudentWeeklyClass = {};
    Object.keys(swcRaw).forEach((k) => {
        const v = swcRaw[k];
        if (!v || typeof v !== 'object') return;
        const nameKey = String(k || '').trim();
        if (!nameKey) return;
        speakonStudentWeeklyClass[nameKey] = {
            classDay: String(v.classDay || '').trim(),
            classHour: String(v.classHour ?? '').trim(),
            extraDay: String(v.extraDay || '').trim(),
            extraHour: String(v.extraHour ?? '').trim()
        };
    });
    normalizeCustomSchoolsList();
    loadStudentClassReportRows();
}

function normalizeCustomSchoolsList() {
    const keys = new Set();
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        keys.add((getStudentSchoolName(name) || '').trim().toLowerCase());
    });
    customSchoolsList = customSchoolsList.filter((s) => {
        const k = String(s || '').trim().toLowerCase();
        return k && !keys.has(k);
    });
}

function getAvailableSchoolNames() {
    const schools = new Set();
    Object.keys(studentSchoolByName).forEach((studentName) => {
        const school = String(studentSchoolByName[studentName] || '').trim();
        if (school) schools.add(school);
    });
    customSchoolsList.forEach((school) => {
        const s = String(school || '').trim();
        if (s) schools.add(s);
    });
    return [...schools].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function refreshAddStudentSchoolSelect(selectedSchool = '') {
    const schoolSelect = document.getElementById('addStudentSchoolSelect');
    if (!schoolSelect) return;
    const selected = String(selectedSchool || '').trim();
    const options = getAvailableSchoolNames();
    schoolSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select a school';
    placeholder.disabled = true;
    placeholder.hidden = true;
    schoolSelect.appendChild(placeholder);
    options.forEach((school) => {
        const option = document.createElement('option');
        option.value = school;
        option.textContent = school;
        schoolSelect.appendChild(option);
    });
    const hasSelected = options.includes(selected);
    schoolSelect.value = hasSelected ? selected : '';
    placeholder.selected = !hasSelected;
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
        speakonStudentsList.some((x) => x.trim().toLowerCase() === n) ||
        passportStudentsList.some((x) => x.trim().toLowerCase() === n)
    );
}

function getStudentSchoolName(name) {
    const key = String(name || '').trim();
    if (!key) return '';
    const stored = String(studentSchoolByName[key] || '').trim();
    if (stored) return stored;
    const n = key.toLowerCase();
    if (privateStudentsList.some((x) => x.trim().toLowerCase() === n)) return 'HomeTeachers';
    if (speakonStudentsList.some((x) => x.trim().toLowerCase() === n)) return 'SpeakOn';
    if (passportStudentsList.some((x) => x.trim().toLowerCase() === n)) return 'Passport';
    return '';
}

function rosterKindFromSchoolName(schoolName) {
    const s = String(schoolName || '').trim().toLowerCase();
    if (!s) return '';
    if (s.includes('passport')) return 'passport';
    if (s.includes('speakon')) return 'speakon';
    return 'private';
}

function schoolLinkKey(displayTitle) {
    return String(displayTitle || '').trim().toLowerCase();
}

function getSchoolExternalLinkUrl(displayTitle) {
    const k = schoolLinkKey(displayTitle);
    if (!k) return '';
    return String(schoolExternalLinks[k] || '').trim();
}

function schoolSectionUsesPassportStyleHeader(displayTitle) {
    return !!getSchoolSpreadsheetUrl(displayTitle);
}

function getSchoolSpreadsheetUrl(displayTitle) {
    const per = getSchoolExternalLinkUrl(displayTitle);
    if (per) return per;
    if (rosterKindFromSchoolName(displayTitle) === 'passport') {
        return String(passportHeaderPageLink || '').trim();
    }
    return '';
}

function parseHttpUrlInput(value) {
    const next = String(value || '').trim();
    if (!next) return { error: 'empty' };
    try {
        const parsed = new URL(next);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { error: 'protocol' };
        }
        return { url: next };
    } catch {
        return { error: 'invalid' };
    }
}

function getStudentRosterKind(name) {
    return rosterKindFromSchoolName(getStudentSchoolName(name));
}

function isSpeakOnStudentName(name) {
    return isStudentName(name) && getStudentRosterKind(name) === 'speakon';
}

/** Match roster name to key in speakonStudentWeeklyClass (handles case / stray spacing in saved JSON). */
function getSpeakonWeeklyClassStorageKey(studentName) {
    const want = String(studentName || '').trim().toLowerCase();
    if (!want) return '';
    const exact = String(studentName || '').trim();
    if (speakonStudentWeeklyClass[exact] != null) {
        return exact;
    }
    const found = Object.keys(speakonStudentWeeklyClass).find((k) => String(k || '').trim().toLowerCase() === want);
    return found || '';
}

function getSpeakonWeeklyClassEntry(studentName) {
    const key = getSpeakonWeeklyClassStorageKey(studentName);
    const raw = key ? speakonStudentWeeklyClass[key] : null;
    if (!raw || typeof raw !== 'object') {
        return { classDay: '', classHour: '', extraDay: '', extraHour: '' };
    }
    return {
        classDay: String(raw.classDay || '').trim(),
        classHour: String(raw.classHour ?? '').trim(),
        extraDay: String(raw.extraDay || '').trim(),
        extraHour: String(raw.extraHour ?? '').trim()
    };
}

function fillSpeakOnDaySelect(selectEl) {
    if (!selectEl) return;
    const prev = selectEl.value;
    selectEl.innerHTML = '';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = '— None —';
    selectEl.appendChild(none);
    DAYS.forEach((d) => {
        const o = document.createElement('option');
        o.value = d;
        o.textContent = d;
        selectEl.appendChild(o);
    });
    if (prev && [...selectEl.options].some((opt) => opt.value === prev)) {
        selectEl.value = prev;
    }
}

function fillSpeakOnHourSelect(selectEl) {
    if (!selectEl) return;
    const prev = selectEl.value;
    selectEl.innerHTML = '';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = '— None —';
    selectEl.appendChild(none);
    for (let h = START_HOUR; h < END_HOUR; h++) {
        const o = document.createElement('option');
        o.value = String(h);
        o.textContent = formatHour(h);
        selectEl.appendChild(o);
    }
    if (prev && [...selectEl.options].some((opt) => opt.value === prev)) {
        selectEl.value = prev;
    }
}

/**
 * SpeakOn class/extra slots come only from weekly picks; strip old overlay states then apply.
 * @param {Record<string, string | null | undefined>} sched
 * @param {string} studentName
 */
function mergeSpeakonWeeklyClassIntoScheduleCopy(sched, studentName) {
    if (!isSpeakOnStudentName(studentName)) {
        return { ...sched };
    }
    const c = getSpeakonWeeklyClassEntry(studentName);
    const hasCfg =
        (c.classDay && String(c.classHour || '').trim() !== '') ||
        (c.extraDay && String(c.extraHour || '').trim() !== '');
    if (!hasCfg) {
        return { ...sched };
    }
    const out = { ...sched };
    const states = getStudentOverlayStates(studentName);
    Object.keys(out).forEach((k) => {
        const val = String(out[k] || '').trim().toLowerCase();
        if (val === states.classState || val === states.extraState || val === 'magenta' || val === 'salmon') {
            delete out[k];
        }
    });
    const ch = Number.parseInt(String(c.classHour || ''), 10);
    const eh = Number.parseInt(String(c.extraHour || ''), 10);
    if (c.classDay && !Number.isNaN(ch) && ch >= START_HOUR && ch < END_HOUR) {
        out[`${c.classDay}-${ch}`] = states.classState;
    }
    if (c.extraDay && !Number.isNaN(eh) && eh >= START_HOUR && eh < END_HOUR) {
        out[`${c.extraDay}-${eh}`] = states.extraState;
    }
    return out;
}

function stripSpeakonColorsFromScheduleCopy(sched) {
    const out = { ...sched };
    Object.keys(out).forEach((k) => {
        const v = String(out[k] || '').trim().toLowerCase();
        if (v === 'magenta' || v === 'salmon' || parseSchoolStateToken(v) || isLegacyOverlayState(v)) {
            delete out[k];
        }
    });
    return out;
}

function isActiveTeacherName(name) {
    const n = String(name || '').trim().toLowerCase();
    if (!n) return false;
    return teachersList.some((t) => String(t || '').trim().toLowerCase() === n);
}

function makeSchoolStateToken(schoolTitle, variant) {
    const key = schoolThemeKey(schoolTitle) || schoolThemeKey('HomeTeachers');
    const kind = variant === 'extra' ? 'extra' : 'class';
    return `school::${key}::${kind}`;
}

function parseSchoolStateToken(state) {
    const raw = String(state || '').trim().toLowerCase();
    const m = /^school::(.+)::(class|extra)$/.exec(raw);
    if (!m) return null;
    return { schoolKey: m[1], variant: m[2] };
}

function getSchoolTitleByKey(schoolKey) {
    const key = schoolThemeKey(schoolKey);
    if (!key) return '';
    const found = getAvailableSchoolNames().find((name) => schoolThemeKey(name) === key);
    return found || '';
}

function isLegacyOverlayState(state) {
    return ['navy', 'cyan', 'magenta', 'salmon', 'special'].includes(String(state || '').trim().toLowerCase());
}

function resolveSchoolTokenInfoFromState(state) {
    const token = parseSchoolStateToken(state);
    if (token) {
        const title = getSchoolTitleByKey(token.schoolKey) || token.schoolKey;
        const theme = getSchoolTheme(title);
        const color = token.variant === 'extra' ? theme.secondary : theme.primary;
        return { token: `school::${token.schoolKey}::${token.variant}`, color };
    }
    const legacy = String(state || '').trim().toLowerCase();
    const legacyMap = {
        navy: { school: 'HomeTeachers', variant: 'class' },
        cyan: { school: 'HomeTeachers', variant: 'extra' },
        magenta: { school: 'SpeakOn', variant: 'class' },
        salmon: { school: 'SpeakOn', variant: 'extra' },
        special: { school: 'Passport', variant: 'class' }
    };
    const cfg = legacyMap[legacy];
    if (!cfg) return null;
    const tokenValue = makeSchoolStateToken(cfg.school, cfg.variant);
    const schoolTheme = getSchoolTheme(cfg.school);
    const color = cfg.variant === 'extra' ? schoolTheme.secondary : schoolTheme.primary;
    return { token: tokenValue, color };
}

function getStudentOverlayStates(studentName) {
    const schoolTitle = getStudentSchoolName(studentName) || (getStudentRosterKind(studentName) === 'speakon' ? 'SpeakOn' : (getStudentRosterKind(studentName) === 'passport' ? 'Passport' : 'HomeTeachers'));
    const kind = getStudentRosterKind(studentName);
    if (kind === 'passport') {
        return { classState: makeSchoolStateToken(schoolTitle, 'class'), extraState: '' };
    }
    return {
        classState: makeSchoolStateToken(schoolTitle, 'class'),
        extraState: makeSchoolStateToken(schoolTitle, 'extra')
    };
}

/**
 * Teacher schedules aggregate class/extra overlays from all student grids.
 * SpeakOn weekly template remains supported as fallback.
 * @param {Record<string, string | null | undefined>} sched
 */
function applyAllSpeakOnStudentColorsToTeacherScheduleCopy(sched) {
    const out = { ...sched };
    Object.keys(out).forEach((k) => {
        const current = String(out[k] || '').trim();
        if (parseSchoolStateToken(current) || isLegacyOverlayState(current)) {
            delete out[k];
        }
    });
    const keyBest = {};
    const classPriorityByKind = { speakon: 3, private: 2, passport: 1 };
    const extraPriorityByKind = { speakon: 2, private: 1, passport: 0 };
    const keyClassPriority = {};
    const keyExtraPriority = {};
    const students = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    for (const studentName of students) {
        const { classState, extraState } = getStudentOverlayStates(studentName);
        const kind = getStudentRosterKind(studentName) || 'private';
        const st = teacherSchedules[studentName] || {};
        for (const [k, v] of Object.entries(st)) {
            const rawVal = String(v || '').trim().toLowerCase();
            let val = '';
            if (rawVal === classState || rawVal === extraState) {
                val = rawVal;
            } else if (rawVal === 'magenta' || rawVal === 'special' || rawVal === 'navy') {
                val = classState;
            } else if (rawVal === 'salmon' || rawVal === 'cyan') {
                val = extraState;
            } else {
                const resolved = resolveSchoolTokenInfoFromState(rawVal);
                val = resolved?.token || '';
            }
            if (val !== classState && val !== extraState) continue;
            if (val === classState) {
                const currScore = keyClassPriority[k] || 0;
                const nextScore = classPriorityByKind[kind] || 0;
                if (nextScore >= currScore) {
                    keyBest[k] = val;
                    keyClassPriority[k] = nextScore;
                }
            } else if (val === extraState) {
                if ((keyClassPriority[k] || 0) > 0) continue;
                const currScore = keyExtraPriority[k] || 0;
                const nextScore = extraPriorityByKind[kind] || 0;
                if (nextScore >= currScore) {
                    keyBest[k] = val;
                    keyExtraPriority[k] = nextScore;
                }
            }
        }
    }

    for (const studentName of speakonStudentsList) {
        const states = getStudentOverlayStates(studentName);
        const c = getSpeakonWeeklyClassEntry(studentName);
        const hasCfg =
            (c.classDay && String(c.classHour || '').trim() !== '') ||
            (c.extraDay && String(c.extraHour || '').trim() !== '');
        if (!hasCfg) continue;
        const ch = Number.parseInt(String(c.classHour || ''), 10);
        const eh = Number.parseInt(String(c.extraHour || ''), 10);
        if (c.extraDay && !Number.isNaN(eh) && eh >= START_HOUR && eh < END_HOUR) {
            const ek = `${c.extraDay}-${eh}`;
            if (!(keyClassPriority[ek] || 0) && !(keyExtraPriority[ek] || 0)) {
                keyBest[ek] = states.extraState;
                keyExtraPriority[ek] = extraPriorityByKind.speakon;
            }
        }
        if (c.classDay && !Number.isNaN(ch) && ch >= START_HOUR && ch < END_HOUR) {
            const ck = `${c.classDay}-${ch}`;
            const curr = keyClassPriority[ck] || 0;
            if (curr <= classPriorityByKind.speakon) {
                keyBest[ck] = states.classState;
                keyClassPriority[ck] = classPriorityByKind.speakon;
            }
        }
    }

    Object.keys(keyBest).forEach((k) => {
        out[k] = keyBest[k];
    });
    return out;
}

/** Recompute SpeakOn magenta/salmon on every teacher profile from student grids + roster. */
function syncSpeakOnWeeklyToAllTeacherSchedules() {
    teachersList.forEach((tName) => {
        const raw = teacherSchedules[tName] ? { ...teacherSchedules[tName] } : {};
        teacherSchedules[tName] = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(raw);
    });
    if (currentTeacher && isActiveTeacherName(currentTeacher)) {
        slotStates = { ...teacherSchedules[currentTeacher] };
        if (document.getElementById('timeSlots')?.querySelector('.time-slot')) {
            refreshCalendarDisplay();
            updateSummary();
        }
    }
}

let calendarStudentPopoverOpen = false;
let calendarStudentNamesInCellsVisible = false;
let calendarLinkPopoverOpen = false;
let calendarNameVisibleSchoolKeys = new Set();

function getAllRosterStudentNamesSorted() {
    const names = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList]
        .map((n) => String(n || '').trim())
        .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function getStudentSchoolKey(name) {
    return schoolThemeKey(getStudentSchoolName(name) || 'HomeTeachers');
}

function isStudentNameVisibleBySchoolFilter(name) {
    if (!calendarStudentNamesInCellsVisible) return false;
    if (calendarNameVisibleSchoolKeys.size === 0) return false;
    return calendarNameVisibleSchoolKeys.has(getStudentSchoolKey(name));
}

function ensureCalendarSchoolFilterSelection() {
    if (calendarNameVisibleSchoolKeys.size > 0) return;
    getAvailableSchoolNames().forEach((schoolName) => {
        const k = schoolThemeKey(schoolName);
        if (k) calendarNameVisibleSchoolKeys.add(k);
    });
}

function getStudentNamesForTeacherSlot(day, hour, state) {
    if (!state || !currentTeacher || !isActiveTeacherName(currentTeacher)) return [];
    const resolvedState = resolveSchoolTokenInfoFromState(state);
    const normalizedState = resolvedState?.token || String(state || '').trim().toLowerCase();
    if (!parseSchoolStateToken(normalizedState) && !isLegacyOverlayState(normalizedState)) return [];
    const key = `${day}-${hour}`;
    const students = getAllRosterStudentNamesSorted();
    const names = [];
    const used = new Set();
    for (const studentName of students) {
        const { classState, extraState } = getStudentOverlayStates(studentName);
        const st = teacherSchedules[studentName] || {};
        const rawStudentState = String(st[key] || '').trim().toLowerCase();
        let studentState = '';
        if (rawStudentState === classState || rawStudentState === extraState) {
            studentState = rawStudentState;
        } else if (rawStudentState === 'magenta' || rawStudentState === 'special' || rawStudentState === 'navy') {
            studentState = classState;
        } else if (rawStudentState === 'salmon' || rawStudentState === 'cyan') {
            studentState = extraState;
        } else {
            studentState = resolveSchoolTokenInfoFromState(rawStudentState)?.token || rawStudentState;
        }
        if (studentState === classState || (extraState && studentState === extraState)) {
            if (!used.has(studentName) && isStudentNameVisibleBySchoolFilter(studentName)) {
                used.add(studentName);
                names.push(studentName);
            }
            continue;
        }
        if (getStudentRosterKind(studentName) !== 'speakon') continue;
        const weekly = getSpeakonWeeklyClassEntry(studentName);
        const classHour = Number.parseInt(String(weekly.classHour || ''), 10);
        const extraHour = Number.parseInt(String(weekly.extraHour || ''), 10);
        const isClass = normalizedState === classState && weekly.classDay === day && classHour === hour;
        const isExtra = normalizedState === extraState && weekly.extraDay === day && extraHour === hour;
        if ((isClass || isExtra) && !used.has(studentName) && isStudentNameVisibleBySchoolFilter(studentName)) {
            used.add(studentName);
            names.push(studentName);
        }
    }
    return names;
}

function renderStudentNamesInSlot(slotEl, day, hour, state) {
    if (!slotEl) return;
    if (!calendarStudentNamesInCellsVisible) {
        slotEl.textContent = '';
        slotEl.title = '';
        slotEl.classList.remove('time-slot--with-student-names');
        return;
    }
    const names = getStudentNamesForTeacherSlot(day, hour, state);
    const label = names.join(', ');
    slotEl.textContent = '';
    if (label) {
        const textEl = document.createElement('span');
        textEl.className = 'time-slot-student-names-text';
        textEl.textContent = label;
        slotEl.appendChild(textEl);
    }
    slotEl.title = label;
    slotEl.classList.toggle('time-slot--with-student-names', names.length > 0);
}

function setCalendarStudentNamesInCellsVisible(visible) {
    calendarStudentNamesInCellsVisible = !!visible;
    const btn = document.getElementById('calendarToolbarStudentsBtn');
    if (btn) {
        btn.classList.toggle('is-active', calendarStudentNamesInCellsVisible);
        btn.setAttribute('aria-pressed', calendarStudentNamesInCellsVisible ? 'true' : 'false');
    }
    refreshCalendarDisplay();
}

function isCustomContextMenuEnabledForCurrentSelection() {
    return !!currentTeacher && !isActiveTeacherName(currentTeacher);
}

function applyStateVisualToSlot(slot, state) {
    if (!slot) return;
    slot.classList.remove('state-available', 'state-unavailable', 'state-school');
    slot.style.removeProperty('--slot-school-bg');
    slot.style.removeProperty('--slot-school-border');
    slot.style.removeProperty('--slot-school-shadow');
    if (!state) return;
    const normalized = String(state || '').trim().toLowerCase();
    if (normalized === 'available') {
        slot.classList.add('state-available');
        return;
    }
    if (normalized === 'unavailable') {
        slot.classList.add('state-unavailable');
        return;
    }
    const resolved = resolveSchoolTokenInfoFromState(normalized);
    if (!resolved) return;
    const color = resolved.color;
    slot.classList.add('state-school');
    slot.style.setProperty('--slot-school-bg', color);
    slot.style.setProperty('--slot-school-border', color);
    slot.style.setProperty('--slot-school-shadow', rgbaFromHex(color, 0.4));
}

function renderCalendarStudentNamesList() {
    const title = document.getElementById('calendarStudentNamesPopoverTitle');
    const ul = document.getElementById('calendarStudentNamesList');
    if (!ul) return;
    if (title) title.textContent = 'Schools';
    ensureCalendarSchoolFilterSelection();
    ul.innerHTML = '';
    const schools = getAvailableSchoolNames();
    if (schools.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No schools found.';
        li.style.color = '#666';
        ul.appendChild(li);
        return;
    }
    schools.forEach((schoolName) => {
        const key = schoolThemeKey(schoolName);
        const checked = calendarNameVisibleSchoolKeys.has(key);
        const theme = getSchoolTheme(schoolName);
        const li = document.createElement('li');
        li.className = 'calendar-school-filter-item';
        const label = document.createElement('label');
        label.className = 'calendar-school-filter-option';
        label.style.setProperty('--menu-option-color', theme.primary);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;
        input.dataset.schoolKey = key;
        input.addEventListener('change', () => {
            const schoolKey = String(input.dataset.schoolKey || '').trim();
            if (!schoolKey) return;
            if (input.checked) calendarNameVisibleSchoolKeys.add(schoolKey);
            else calendarNameVisibleSchoolKeys.delete(schoolKey);
            setCalendarStudentNamesInCellsVisible(calendarNameVisibleSchoolKeys.size > 0);
        });
        const text = document.createElement('span');
        text.textContent = schoolName;
        label.appendChild(input);
        label.appendChild(text);
        li.appendChild(label);
        ul.appendChild(li);
    });
}

function positionCalendarStudentPopover(anchorEl) {
    const pop = document.getElementById('calendarStudentNamesPopover');
    if (!pop || !anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    const pad = 8;
    let left = r.left;
    let top = r.bottom + pad;
    const w = pop.offsetWidth || 240;
    const h = pop.offsetHeight || 200;
    if (left + w > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - w - pad);
    }
    if (top + h > window.innerHeight - pad) {
        top = Math.max(pad, r.top - h - pad);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
}

function closeCalendarStudentNamesPopover() {
    const pop = document.getElementById('calendarStudentNamesPopover');
    const btn = document.getElementById('calendarToolbarStudentsBtn');
    if (pop) {
        pop.hidden = true;
    }
    if (btn) {
        btn.setAttribute('aria-expanded', 'false');
    }
    calendarStudentPopoverOpen = false;
}

function toggleCalendarStudentNamesPopover(anchorEl) {
    const pop = document.getElementById('calendarStudentNamesPopover');
    if (!pop) return;
    if (calendarStudentPopoverOpen) {
        closeCalendarStudentNamesPopover();
        return;
    }
    renderCalendarStudentNamesList();
    setCalendarStudentNamesInCellsVisible(true);
    pop.hidden = false;
    calendarStudentPopoverOpen = true;
    anchorEl?.setAttribute('aria-expanded', 'true');
    positionCalendarStudentPopover(anchorEl);
    requestAnimationFrame(() => positionCalendarStudentPopover(anchorEl));
}

function positionCalendarLinkPopover(anchorEl) {
    const pop = document.getElementById('calendarLinkPopover');
    if (!pop || !anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    const pad = 8;
    let left = r.left;
    let top = r.bottom + pad;
    const w = pop.offsetWidth || 320;
    const h = pop.offsetHeight || 220;
    if (left + w > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - w - pad);
    }
    if (top + h > window.innerHeight - pad) {
        top = Math.max(pad, r.top - h - pad);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
}

function closeCalendarLinkPopover() {
    const pop = document.getElementById('calendarLinkPopover');
    if (pop) pop.hidden = true;
    calendarLinkPopoverOpen = false;
}

function openCalendarLinkPopover(anchorEl) {
    const pop = document.getElementById('calendarLinkPopover');
    const input = document.getElementById('calendarLinkInput');
    if (!pop || !input) return;
    closeCalendarStudentNamesPopover();
    input.value = String(calendarToolbarExternalLink || '').trim();
    pop.hidden = false;
    calendarLinkPopoverOpen = true;
    positionCalendarLinkPopover(anchorEl);
    requestAnimationFrame(() => positionCalendarLinkPopover(anchorEl));
    window.setTimeout(() => {
        input.focus();
        input.select();
    }, 0);
}

function saveCalendarToolbarLinkFromPopover() {
    const input = document.getElementById('calendarLinkInput');
    if (!input) return;
    const raw = String(input.value || '').trim();
    if (!raw) {
        showAppMessage('Please provide a calendar URL link.');
        input.focus();
        return;
    }
    const parsed = parseHttpUrlInput(raw);
    if (parsed.error === 'protocol') {
        showAppMessage('Please provide a valid http(s) link.');
        input.focus();
        return;
    }
    if (parsed.error === 'invalid' || !parsed.url) {
        showAppMessage('Please provide a valid URL link.');
        input.focus();
        return;
    }
    calendarToolbarExternalLink = parsed.url;
    saveRoster();
    closeCalendarLinkPopover();
    window.open(calendarToolbarExternalLink, '_blank', 'noopener,noreferrer');
}

function setupCalendarStudentPopoverDismiss() {
    if (document.body.dataset.calendarPopoverDismiss === '1') return;
    document.body.dataset.calendarPopoverDismiss = '1';
    document.addEventListener('click', (e) => {
        const pop = document.getElementById('calendarStudentNamesPopover');
        const linkPop = document.getElementById('calendarLinkPopover');
        const t = e.target;
        if (!pop || pop.hidden) return;
        if (pop.contains(t) || (linkPop && linkPop.contains(t))) return;
        const btn = document.getElementById('calendarToolbarStudentsBtn');
        if (btn && btn.contains(t)) return;
        closeCalendarStudentNamesPopover();
    });
    document.addEventListener('click', (e) => {
        const pop = document.getElementById('calendarLinkPopover');
        const t = e.target;
        if (!pop || pop.hidden) return;
        if (pop.contains(t)) return;
        const btn = document.getElementById('calendarToolbarCalendarBtn');
        if (btn && btn.contains(t)) return;
        closeCalendarLinkPopover();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCalendarStudentNamesPopover();
            closeCalendarLinkPopover();
        }
    });
    window.addEventListener('resize', () => {
        const btn = document.getElementById('calendarToolbarStudentsBtn');
        if (calendarStudentPopoverOpen && btn) {
            positionCalendarStudentPopover(btn);
        }
        const linkBtn = document.getElementById('calendarToolbarCalendarBtn');
        if (calendarLinkPopoverOpen && linkBtn) {
            positionCalendarLinkPopover(linkBtn);
        }
    });
    const saveBtn = document.getElementById('calendarLinkSaveBtn');
    const cancelBtn = document.getElementById('calendarLinkCancelBtn');
    const input = document.getElementById('calendarLinkInput');
    saveBtn?.addEventListener('click', () => saveCalendarToolbarLinkFromPopover());
    cancelBtn?.addEventListener('click', () => closeCalendarLinkPopover());
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveCalendarToolbarLinkFromPopover();
        }
    });
}

function renameStudentClassReportRows(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    if (!studentClassReportRows[oldName]) return;
    studentClassReportRows[newName] = studentClassReportRows[oldName];
    delete studentClassReportRows[oldName];
    saveStudentClassReportRows();
}

function getPreferredPassportStudentName() {
    if (currentTeacher && passportStudentsList.includes(currentTeacher)) {
        return currentTeacher;
    }
    return passportStudentsList[0] || '';
}

function openSchoolExternalLinkFromSidebar(displayTitle) {
    const link = getSchoolSpreadsheetUrl(displayTitle);
    if (!link) {
        alert('No external link is saved for this school yet.');
        return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
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

/** Outlined pencil-on-square (Heroicons-style); stroke currentColor — all edit controls */
const EDIT_ICON_SVG_OUTLINE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>';
const EDIT_ICON_SVG_SOLID =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" /><path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" /></svg>';

const CLASS_TOPIC_PENCIL_ICON_HTML =
    `<span class="student-class-report-topic-btn-icon">${EDIT_ICON_SVG_OUTLINE}</span>`;

/** Plus for sidebar add buttons; stroke inherits button color */
const SIDEBAR_ADD_PLUS_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

const SIDEBAR_ADD_SCHOOL_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"/></svg>';
const SIDEBAR_GOOGLE_MEET_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill="currentColor" d="M22.205 9.41v5.13c.01.382-.087.76-.28 1.09a2.13 2.13 0 0 1-.86.77a2 2 0 0 1-.9.21h-.25a2.07 2.07 0 0 1-1-.43l-2.53-2v.91a4.34 4.34 0 0 1-4.34 4.34h-5.91a4.37 4.37 0 0 1-3.07-1.27a4.31 4.31 0 0 1-1.27-3.07V8.92a4.298 4.298 0 0 1 .33-1.66a4.38 4.38 0 0 1 2.35-2.36a4.31 4.31 0 0 1 1.66-.33h5.79a4.4 4.4 0 0 1 1.67.33a4.38 4.38 0 0 1 2.35 2.36c.22.529.33 1.097.32 1.67v.9l2.53-2a2.09 2.09 0 0 1 3.06.53c.207.313.328.675.35 1.05"/></svg>';
const SIDEBAR_GOOGLE_MEET_OFF_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path stroke-miterlimit="10" d="m11.047 10l-4 3.991m0-3.982l4 3.991"/><path stroke-linejoin="round" d="M12 5.32H6.095A3.595 3.595 0 0 0 2.5 8.923v6.162a3.595 3.595 0 0 0 3.595 3.595H12a3.595 3.595 0 0 0 3.595-3.595V8.924A3.594 3.594 0 0 0 12 5.32m9.5 4.118v5.135c0 .25-.071.496-.205.708a1.355 1.355 0 0 1-.555.493a1.27 1.27 0 0 1-.73.124a1.366 1.366 0 0 1-.677-.278l-3.225-2.588a1.377 1.377 0 0 1-.503-1.047c0-.2.045-.396.133-.575c.092-.168.218-.315.37-.432l3.225-2.567a1.36 1.36 0 0 1 .678-.278c.25-.032.504.011.729.124a1.325 1.325 0 0 1 .76 1.181"/></g></svg>';
const SIDEBAR_WHATSAPP_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 258" aria-hidden="true"><defs><linearGradient id="logosWhatsappIcon0" x1="50%" x2="50%" y1="100%" y2="0%"><stop offset="0%" stop-color="#1FAF38"/><stop offset="100%" stop-color="#60D669"/></linearGradient><linearGradient id="logosWhatsappIcon1" x1="50%" x2="50%" y1="100%" y2="0%"><stop offset="0%" stop-color="#F9F9F9"/><stop offset="100%" stop-color="#FFF"/></linearGradient></defs><path fill="url(#logosWhatsappIcon0)" d="M5.463 127.456c-.006 21.677 5.658 42.843 16.428 61.499L4.433 252.697l65.232-17.104a122.994 122.994 0 0 0 58.8 14.97h.054c67.815 0 123.018-55.183 123.047-123.01c.013-32.867-12.775-63.773-36.009-87.025c-23.23-23.25-54.125-36.061-87.043-36.076c-67.823 0-123.022 55.18-123.05 123.004"/><path fill="url(#logosWhatsappIcon1)" d="M1.07 127.416c-.007 22.457 5.86 44.38 17.014 63.704L0 257.147l67.571-17.717c18.618 10.151 39.58 15.503 60.91 15.511h.055c70.248 0 127.434-57.168 127.464-127.423c.012-34.048-13.236-66.065-37.3-90.15C194.633 13.286 162.633.014 128.536 0C58.276 0 1.099 57.16 1.071 127.416Zm40.24 60.376l-2.523-4.005c-10.606-16.864-16.204-36.352-16.196-56.363C22.614 69.029 70.138 21.52 128.576 21.52c28.3.012 54.896 11.044 74.9 31.06c20.003 20.018 31.01 46.628 31.003 74.93c-.026 58.395-47.551 105.91-105.943 105.91h-.042c-19.013-.01-37.66-5.116-53.922-14.765l-3.87-2.295l-40.098 10.513l10.706-39.082Z"/><path fill="#ffffff" d="M96.678 74.148c-2.386-5.303-4.897-5.41-7.166-5.503c-1.858-.08-3.982-.074-6.104-.074c-2.124 0-5.575.799-8.492 3.984c-2.92 3.188-11.148 10.892-11.148 26.561c0 15.67 11.413 30.813 13.004 32.94c1.593 2.123 22.033 35.307 54.405 48.073c26.904 10.609 32.379 8.499 38.218 7.967c5.84-.53 18.844-7.702 21.497-15.139c2.655-7.436 2.655-13.81 1.859-15.142c-.796-1.327-2.92-2.124-6.105-3.716c-3.186-1.593-18.844-9.298-21.763-10.361c-2.92-1.062-5.043-1.592-7.167 1.597c-2.124 3.184-8.223 10.356-10.082 12.48c-1.857 2.129-3.716 2.394-6.9.801c-3.187-1.598-13.444-4.957-25.613-15.806c-9.468-8.442-15.86-18.867-17.718-22.056c-1.858-3.184-.199-4.91 1.398-6.497c1.431-1.427 3.186-3.719 4.78-5.578c1.588-1.86 2.118-3.187 3.18-5.311c1.063-2.126.531-3.986-.264-5.579c-.798-1.593-6.987-17.343-9.819-23.64"/></svg>';

/** Outline check in rounded square — shown before Meet link is saved (color via CSS currentColor) */
const GOOGLE_MEET_STUDENT_LINK_STATUS_EMPTY_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="m7.393 12.084l2.593 2.593a.983.983 0 0 0 1.395 0l5.227-5.226"/><rect width="18.5" height="18.5" x="2.75" y="2.75" rx="6"/></g></svg>';

/** Filled check in rounded square — crossfades in when a Meet link exists */
const GOOGLE_MEET_STUDENT_LINK_STATUS_SAVED_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.25 2h-6.5A6.76 6.76 0 0 0 2 8.75v6.5A6.76 6.76 0 0 0 8.75 22h6.5A6.76 6.76 0 0 0 22 15.25v-6.5A6.76 6.76 0 0 0 15.25 2m2.06 8.16l-5.22 5.22a2 2 0 0 1-1.41.59a2 2 0 0 1-.76-.15a1.999 1.999 0 0 1-.64-.44l-2.59-2.59a1 1 0 0 1 1.41-1.41l2.59 2.59l5.21-5.23a1.002 1.002 0 0 1 1.41 1.42"/></svg>';

function animateGoogleMeetSaveButtonOk() {
    const btn = document.getElementById('googleMeetStudentLinkPopoverSave');
    if (!btn) return;
    let icon = btn.querySelector('.google-meet-save-ok-icon');
    if (!icon) {
        icon = document.createElement('span');
        icon.className = 'google-meet-save-ok-icon';
        icon.innerHTML = GOOGLE_MEET_STUDENT_LINK_STATUS_SAVED_SVG;
        btn.appendChild(icon);
    }
    btn.classList.remove('google-meet-save-ok-animate');
    void btn.offsetWidth;
    btn.classList.add('google-meet-save-ok-animate');
    window.setTimeout(() => {
        btn.classList.remove('google-meet-save-ok-animate');
    }, 620);
}

const SIDEBAR_ADD_TEACHER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg>';

const SIDEBAR_LOGIN_TEACHER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/></svg>';
const SIDEBAR_LOGOUT_TEACHER_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"/></svg>';

const PASSWORD_SHOW_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>';
const PASSWORD_HIDE_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>';

/** Solid 6-tooth cog (Heroicons cog-6-tooth); fill inherits currentColor */
const SETTINGS_GEAR_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"/></svg>';

const ADD_STUDENT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 13c.552 0 1.01-.452.9-.994a5.002 5.002 0 0 0-9.802 0c-.109.542.35.994.902.994h8ZM12.5 3.5a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1v-1a.75.75 0 0 1 .75-.75Z"/></svg>';

const CALENDAR_TOOLBAR_CALENDAR_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="calendar-toolbar-icon" aria-hidden="true">' +
    '<path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />' +
    '<path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" />' +
    '</svg>';

const CLASS_REPORT_STATUS_OPTIONS = [
    '—',
    'Class Given',
    'Class Canceled',
    'Class Rescheduled',
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
const CLASS_TOPIC_EXERCISE_OPTIONS = [
    'Speaking',
    'Grammar',
    'Pronunciation/Listening',
    'Writing/Reading',
    'Interchange Activity',
    'Free Conversation'
];

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
        classTopic: '',
        exercises: []
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

function classReportMonthKeyFromIso(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    return isoDate.slice(0, 7);
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
        display.textContent = formatClassReportDateDisplay(iso) || '';

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

        wrap.appendChild(calLabel);
        wrap.appendChild(display);
        td.appendChild(wrap);
    } else if (field === 'time') {
        td.classList.add('column-time');
        const sel = document.createElement('select');
        sel.className = 'student-class-report-input student-class-report-field student-class-report-time-select';
        sel.dataset.field = 'time';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '';
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
        placeholder.textContent = '';
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
        placeholder.textContent = '';
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
        placeholder.textContent = '';
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
            const kind = getStudentRosterKind(currentTeacher);
            if (kind === 'passport') {
                const link = String(passportFollowupLinks[currentTeacher] || '').trim();
                if (!link) {
                    alert('No follow-up spreadsheet link found for this Passport student.');
                    return;
                }
                window.open(link, '_blank', 'noopener,noreferrer');
                return;
            }
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
            disp.textContent = formatClassReportDateDisplay(iso) || '';
        }
    } else {
        list[idx][field] = fieldEl.value;
    }
    saveStudentClassReportRows();
    if (field === 'date') {
        renderStudentClassReportTable(sel);
    }
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
    const totalColumns = STUDENT_CLASS_REPORT_FIELDS.length + 1;
    tbody.textContent = '';
    let previousMonthKey = '';

    const indexedRows = list.map((row, index) => ({ row, index }));
    indexedRows.sort((a, b) => {
        const aIso = normalizeClassReportDateValue(a.row?.date);
        const bIso = normalizeClassReportDateValue(b.row?.date);
        if (aIso && bIso) {
            if (aIso < bIso) return -1;
            if (aIso > bIso) return 1;
            return a.index - b.index;
        }
        if (aIso) return -1;
        if (bIso) return 1;
        return a.index - b.index;
    });

    indexedRows.forEach(({ row, index: sourceIndex }) => {
        const merged = { ...emptyStudentClassReportRow(), ...row };
        const monthKey = classReportMonthKeyFromIso(normalizeClassReportDateValue(merged.date));

        if (monthKey && monthKey !== previousMonthKey) {
            const monthTr = document.createElement('tr');
            monthTr.className = 'student-class-report-month-separator-row';
            monthTr.setAttribute('aria-hidden', 'true');
            const monthTd = document.createElement('td');
            monthTd.className = 'student-class-report-month-separator-cell';
            monthTd.colSpan = totalColumns;
            monthTd.textContent = '';
            monthTr.appendChild(monthTd);
            tbody.appendChild(monthTr);
            previousMonthKey = monthKey;
        }

        const tr = document.createElement('tr');
        tr.dataset.rowIndex = String(sourceIndex);

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
            removeStudentClassReportRowAt(studentName, sourceIndex);
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
let classTopicDraftExercises = [];

function getExerciseChipLabel(item) {
    if (item && typeof item === 'object') {
        const numberRaw = parseInt(String(item.number || ''), 10);
        const number = Number.isNaN(numberRaw) ? null : numberRaw;
        const topic = String(item.topic || '').trim();
        if (number != null && topic) return `${number} - ${topic}`;
        if (topic) return topic;
        if (item.title) return String(item.title);
    }
    return String(item || '').trim();
}

function normalizeExerciseDraftItem(item) {
    if (item && typeof item === 'object') {
        const numberRaw = parseInt(String(item.number || ''), 10);
        const number = Number.isNaN(numberRaw) ? null : numberRaw;
        return {
            number,
            topic: String(item.topic || '').trim(),
            title: String(item.title || '').trim(),
            description: String(item.description || '').trim()
        };
    }
    const text = String(item || '').trim();
    if (!text) return null;
    const match = text.match(/^(\d+)\s*[-:]\s*(.+)$/);
    if (match) {
        return {
            number: parseInt(match[1], 10),
            topic: match[2].trim(),
            title: '',
            description: ''
        };
    }
    return { number: null, topic: text, title: '', description: '' };
}

function syncClassTopicExerciseOverlayHeight() {
    const wrap = document.querySelector('.class-topic-textarea-wrap');
    if (!wrap) return;
    wrap.style.setProperty('--class-topic-chips-space', '64px');
}

function renderClassTopicExerciseDraftList() {
    const listEl = document.getElementById('classTopicExerciseList');
    if (!listEl) return;
    listEl.textContent = '';
    classTopicDraftExercises.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'class-topic-exercise-item';
        const text = document.createElement('span');
        const label = getExerciseChipLabel(item);
        text.textContent = label;
        if (item && typeof item === 'object' && item.title) {
            const ttl = String(item.title).trim();
            text.title = ttl || label;
        }
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'class-topic-exercise-remove';
        rm.setAttribute('aria-label', `Remove ${label}`);
        rm.textContent = '\u00D7';
        rm.addEventListener('click', () => {
            classTopicDraftExercises.splice(index, 1);
            renderClassTopicExerciseDraftList();
        });
        li.appendChild(text);
        li.appendChild(rm);
        listEl.appendChild(li);
    });
    syncClassTopicExerciseOverlayHeight();
}

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
    const exerciseSelect = document.getElementById('classTopicExerciseSelect');
    if (!modal || !ta || !exerciseSelect) return;
    classTopicEditContext = { studentName, rowIndex };
    const row = list[rowIndex];
    ta.value = row.classTopic != null ? String(row.classTopic) : '';
    classTopicDraftExercises = Array.isArray(row.exercises)
        ? row.exercises.map((x) => String(x || '').trim()).filter(Boolean)
        : [];
    exerciseSelect.value = '';
    renderClassTopicExerciseDraftList();
    if (subtitle) {
        subtitle.textContent = `Student: ${studentName}`;
    }
    openModalWithAnimation(modal);
    ta.focus();
}

function closeClassTopicModal() {
    const modal = document.getElementById('classTopicModal');
    if (modal) {
        closeModalWithAnimation(modal);
    }
    classTopicDraftExercises = [];
    syncClassTopicExerciseOverlayHeight();
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
    list[rowIndex].exercises = [...classTopicDraftExercises];
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
    const exerciseSelect = document.getElementById('classTopicExerciseSelect');
    const exerciseAdd = document.getElementById('classTopicExerciseAdd');
    if (exerciseSelect && exerciseSelect.options.length <= 1) {
        CLASS_TOPIC_EXERCISE_OPTIONS.forEach((label) => {
            const opt = document.createElement('option');
            opt.value = label;
            opt.textContent = label;
            exerciseSelect.appendChild(opt);
        });
    }
    exerciseAdd?.addEventListener('click', () => {
        const selected = String(exerciseSelect?.value || '').trim();
        if (!selected) return;
        classTopicDraftExercises.push(selected);
        if (exerciseSelect) exerciseSelect.value = '';
        renderClassTopicExerciseDraftList();
    });
    backdrop?.addEventListener('click', closeClassTopicModal);
    cancel?.addEventListener('click', closeClassTopicModal);
    save?.addEventListener('click', saveClassTopicFromModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeClassTopicModal();
        }
    });
    window.addEventListener('resize', () => {
        if (modal.classList.contains('is-open')) {
            syncClassTopicExerciseOverlayHeight();
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
    normalizeCustomSchoolsList();
    try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify({
            teachers: teachersList,
            private: privateStudentsList,
            speakon: speakonStudentsList,
            passport: passportStudentsList,
            studentSchools: studentSchoolByName,
            teacherEmails: teacherEmailsByName,
            teacherPasswords: teacherPasswordsByName,
            customSchools: customSchoolsList,
            schoolExternalLinks,
            schoolThemeColors,
            calendarToolbarExternalLink,
            passportLinks: passportFollowupLinks,
            passportHeaderPageLink,
            speakonWeeklyClass: speakonStudentWeeklyClass,
            studentPhones: studentPhonesByName,
            studentGoogleMeetLinks: studentGoogleMeetLinksByName,
            googleMeetSharedLinkModeBySchool: googleMeetSharedLinkModeBySchoolKey
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

// Left-click toggles only availability (no red step)
const STATE_CYCLE = [null, 'available'];

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
                            syncSpeakOnWeeklyToAllTeacherSchedules();
                            
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

function getSidebarProfileInitials(fullName) {
    const cleaned = String(fullName || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return 'T';
    const parts = cleaned.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function renderSidebarHeaderProfile() {
    const nameEl = document.getElementById('sidebarProfileName');
    const roleEl = document.getElementById('sidebarProfileRole');
    const avatarEl = document.getElementById('sidebarProfileAvatar');
    if (!nameEl || !roleEl || !avatarEl) return;

    const activeTeacherName = getActiveTeacherProfileName();
    const displayName = isTeacherLoggedIn
        ? String(activeTeacherName || 'Teacher').trim()
        : 'Guest profile';
    const displayRole = isTeacherLoggedIn ? 'Teacher' : 'Guest';

    nameEl.textContent = displayName;
    roleEl.textContent = displayRole;
    avatarEl.textContent = getSidebarProfileInitials(displayName);
    const avatarUrl = getProfileAvatarDataUrl(getCurrentProfileKey());
    avatarEl.classList.toggle('has-image', !!avatarUrl);
    avatarEl.style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : '';

    const headerRow = avatarEl.closest('.sidebar-header-row');
    if (headerRow) {
        if (isTeacherLoggedIn) {
            headerRow.removeAttribute('aria-hidden');
        } else {
            headerRow.setAttribute('aria-hidden', 'true');
        }
    }
    avatarEl.tabIndex = isTeacherLoggedIn ? 0 : -1;
}

function setupSidebarProfileAvatarUpload() {
    const avatarBtn = document.getElementById('sidebarProfileAvatar');
    const avatarInput = document.getElementById('sidebarProfileAvatarInput');
    if (!avatarBtn || !avatarInput) return;

    avatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showAppMessage('Please select an image file.');
            avatarInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result || '');
            if (!dataUrl) return;
            setProfileAvatarDataUrl(getCurrentProfileKey(), dataUrl);
            renderSidebarHeaderProfile();
        };
        reader.readAsDataURL(file);
        avatarInput.value = '';
    });
}

function setupSidebarPaneHeaderToggle(paneEl, paneInnerEl, headerLabelEl, paneKey) {
    if (!paneEl || !paneInnerEl || !headerLabelEl || !paneKey) return;
    const applyPaneCollapsedVisual = (collapsed) => {
        paneEl.classList.toggle('is-collapsed', collapsed);
        paneInnerEl.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
        headerLabelEl.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        sidebarPaneCollapsedState[paneKey] = collapsed;
    };
    const isCollapsed = !!sidebarPaneCollapsedState[paneKey];
    applyPaneCollapsedVisual(isCollapsed);
    headerLabelEl.setAttribute('role', 'button');
    headerLabelEl.tabIndex = 0;
    const toggle = () => {
        const next = !paneEl.classList.contains('is-collapsed');
        applyPaneCollapsedVisual(next);
    };
    headerLabelEl.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
    });
    headerLabelEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });
}

function renderSidebar() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList) return;
    const sidebarRoot = teacherList.closest('.sidebar');
    sidebarRoot?.classList.toggle('is-logged-in', !!isTeacherLoggedIn);
    renderSidebarHeaderProfile();

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
    teachersHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const teachersHeaderLabel = document.createElement('span');
    teachersHeaderLabel.className = 'sidebar-section-header-label';
    teachersHeaderLabel.textContent = 'Teachers';
    const addTeacherBtn = document.createElement('button');
    addTeacherBtn.type = 'button';
    addTeacherBtn.id = 'addTeacherProfileBtn';
    addTeacherBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--teacher sidebar-add-btn--expandable';
    addTeacherBtn.setAttribute('aria-label', 'Add teacher profile');
    addTeacherBtn.innerHTML = `<span class="sidebar-add-btn-state sidebar-add-btn-state--icon">${SIDEBAR_ADD_TEACHER_SVG}</span><span class="sidebar-add-btn-state sidebar-add-btn-state--full"><span class="sidebar-add-btn-state-label">Add Teacher</span>${SIDEBAR_ADD_TEACHER_SVG}</span>`;
    addTeacherBtn.addEventListener('click', () => openAddStudentModal('teacher'));
    const loginTeacherBtn = document.createElement('button');
    loginTeacherBtn.type = 'button';
    loginTeacherBtn.className = 'sidebar-add-btn sidebar-add-btn--with-text sidebar-section-add-btn sidebar-auth-btn';
    if (isTeacherLoggedIn) {
        loginTeacherBtn.classList.add('sidebar-auth-btn--logout');
        loginTeacherBtn.setAttribute('aria-label', 'Teacher logout');
        loginTeacherBtn.innerHTML = `${SIDEBAR_LOGOUT_TEACHER_SVG}<span class="sidebar-add-btn-label">Log Out</span>`;
        loginTeacherBtn.addEventListener('click', () => {
            isTeacherLoggedIn = false;
            loggedInTeacherName = '';
            currentTeacher = null;
            try {
                sessionStorage.setItem(LOGIN_SESSION_SUPPRESS_KEY, '1');
            } catch {
                /* ignore */
            }
            renderSidebar();
            setLoggedOutDashboard();
        });
    } else {
        loginTeacherBtn.classList.add('sidebar-auth-btn--login');
        loginTeacherBtn.setAttribute('aria-label', 'Teacher login');
        loginTeacherBtn.innerHTML = `<span class="sidebar-add-btn-label">Log In</span>${SIDEBAR_LOGIN_TEACHER_SVG}`;
        loginTeacherBtn.addEventListener('click', () => {
            if (teachersList.length === 0) {
                showAppMessage('No teacher profile found yet. Click the academic icon to create your profile.');
                return;
            }
            openTeacherLoginModal();
        });
    }
    const teachersHeaderActions = document.createElement('div');
    teachersHeaderActions.className = 'sidebar-section-actions';
    teachersHeaderActions.appendChild(loginTeacherBtn);
    teachersHeaderActions.appendChild(addTeacherBtn);
    teachersHeader.appendChild(teachersHeaderLabel);
    teachersHeader.appendChild(teachersHeaderActions);
    const teachersInner = document.createElement('div');
    teachersInner.className = 'sidebar-pane-teachers-inner';
    setupSidebarPaneHeaderToggle(paneTeachers, teachersInner, teachersHeaderLabel, 'teachers');
    paneTeachers.appendChild(teachersHeader);
    paneTeachers.appendChild(teachersInner);

    const paneStudents = document.createElement('div');
    paneStudents.className = 'sidebar-pane sidebar-pane-students';

    const studentsHeader = document.createElement('div');
    studentsHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const studentsHeaderLabel = document.createElement('span');
    studentsHeaderLabel.className = 'sidebar-section-header-label';
    studentsHeaderLabel.textContent = 'Schools';
    const addStudentEntryBtn = document.createElement('button');
    addStudentEntryBtn.type = 'button';
    addStudentEntryBtn.id = 'addStudentEntryBtn';
    addStudentEntryBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--student-entry sidebar-add-btn--expandable';
    addStudentEntryBtn.setAttribute('aria-label', 'Add student');
    addStudentEntryBtn.innerHTML = `<span class="sidebar-add-btn-state sidebar-add-btn-state--icon">${ADD_STUDENT_SVG}</span><span class="sidebar-add-btn-state sidebar-add-btn-state--full">${ADD_STUDENT_SVG}<span class="sidebar-add-btn-state-label">Add Student</span></span>`;
    addStudentEntryBtn.addEventListener('click', () => openAddStudentModal('student-global'));
    const googleMeetBtn = document.createElement('button');
    googleMeetBtn.type = 'button';
    googleMeetBtn.id = 'googleMeetBtn';
    googleMeetBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--google-meet sidebar-add-btn--expandable';
    googleMeetBtn.setAttribute('aria-label', 'Open Google Meet');
    googleMeetBtn.innerHTML = `<span class="sidebar-add-btn-state sidebar-add-btn-state--icon">${SIDEBAR_GOOGLE_MEET_SVG}</span><span class="sidebar-add-btn-state sidebar-add-btn-state--full">${SIDEBAR_GOOGLE_MEET_SVG}<span class="sidebar-add-btn-state-label">Google Meet</span></span>`;
    googleMeetBtn.addEventListener('click', openGoogleMeetModal);
    const addStudentBtn = document.createElement('button');
    addStudentBtn.type = 'button';
    addStudentBtn.id = 'addSchoolBtn';
    addStudentBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--school sidebar-add-btn--expandable';
    addStudentBtn.setAttribute('aria-label', 'Add school');
    addStudentBtn.innerHTML = `<span class="sidebar-add-btn-state sidebar-add-btn-state--icon">${SIDEBAR_ADD_SCHOOL_SVG}</span><span class="sidebar-add-btn-state sidebar-add-btn-state--full">${SIDEBAR_ADD_SCHOOL_SVG}<span class="sidebar-add-btn-state-label">Add School</span></span>`;
    addStudentBtn.addEventListener('click', () => openAddStudentModal('student'));
    const studentsHeaderActions = document.createElement('div');
    studentsHeaderActions.className = 'sidebar-section-actions';
    studentsHeaderActions.appendChild(googleMeetBtn);
    studentsHeaderActions.appendChild(addStudentEntryBtn);
    studentsHeaderActions.appendChild(addStudentBtn);
    studentsHeader.appendChild(studentsHeaderLabel);
    studentsHeader.appendChild(studentsHeaderActions);

    const studentsInner = document.createElement('div');
    studentsInner.className = 'sidebar-pane-students-inner';
    setupSidebarPaneHeaderToggle(paneStudents, studentsInner, studentsHeaderLabel, 'schools');

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
    classReportDownloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    const classReportHeaderActions = document.createElement('div');
    classReportHeaderActions.className = 'sidebar-section-actions';
    classReportHeaderActions.appendChild(classReportDownloadBtn);
    classReportHeader.appendChild(classReportHeaderTitle);
    classReportHeader.appendChild(classReportHeaderActions);
    const classReportInner = document.createElement('div');
    classReportInner.className = 'sidebar-pane-class-report-inner';
    classReportInner.setAttribute('aria-label', 'Class report content');
    setupSidebarPaneHeaderToggle(paneClassReport, classReportInner, classReportHeaderTitle, 'classReport');
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
    financesDownloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    const financesHeaderActions = document.createElement('div');
    financesHeaderActions.className = 'sidebar-section-actions';
    financesHeaderActions.appendChild(financesDownloadBtn);
    financesHeader.appendChild(financesHeaderTitle);
    financesHeader.appendChild(financesHeaderActions);
    const financesInner = document.createElement('div');
    financesInner.className = 'sidebar-pane-finances-inner';
    financesInner.setAttribute('aria-label', 'Finances');
    setupSidebarPaneHeaderToggle(paneFinances, financesInner, financesHeaderTitle, 'finances');
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
    const googleMeetSchoolToggle = document.getElementById('googleMeetSchoolToggle');
    if (googleMeetSchoolToggle) {
        refreshGoogleMeetSchoolSelect(googleMeetSelectedSchool);
    }

    if (!isTeacherLoggedIn) {
        const teachersEmpty = document.createElement('p');
        teachersEmpty.className = 'class-report-empty';
        teachersEmpty.textContent = 'Create your profile or log in.';
        teachersInner.appendChild(teachersEmpty);

        const schoolsEmpty = document.createElement('p');
        schoolsEmpty.className = 'class-report-empty';
        schoolsEmpty.textContent = "No school's info to show.";
        studentsInner.appendChild(schoolsEmpty);

        const classReportEmpty = document.createElement('p');
        classReportEmpty.className = 'class-report-empty';
        classReportEmpty.textContent = "No student's info to show.";
        classReportInner.appendChild(classReportEmpty);
        return;
    }

    const studentGroups = new Map();
    const allStudents = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList];
    allStudents.forEach((name) => {
        const school = getStudentSchoolName(name) || 'HomeTeachers';
        const key = school.trim().toLowerCase();
        if (!studentGroups.has(key)) {
            studentGroups.set(key, {
                title: school,
                names: [],
                rosterKey: rosterKindFromSchoolName(school)
            });
        }
        studentGroups.get(key).names.push(name);
    });
    customSchoolsList.forEach((raw) => {
        const school = String(raw || '').trim();
        if (!school) return;
        const key = school.toLowerCase();
        if (!studentGroups.has(key)) {
            studentGroups.set(key, {
                title: school,
                names: [],
                rosterKey: rosterKindFromSchoolName(school)
            });
        }
    });
    const studentCategories = [...studentGroups.values()]
        .map((group) => ({
            title: group.title,
            names: group.names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
            rosterKey: group.rosterKey,
            schoolTheme: getSchoolTheme(group.title),
            itemClass: group.rosterKey === 'passport' ? 'category-passport' : (group.rosterKey === 'speakon' ? 'category-speakon' : 'category-private'),
            deletable: true,
            parent: studentsInner,
            usesSchoolLinkHeader: schoolSectionUsesPassportStyleHeader(group.title)
        }))
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

    const visibleTeachers = isTeacherLoggedIn && loggedInTeacherName
        ? teachersList.filter((name) => String(name || '').trim().toLowerCase() === String(loggedInTeacherName || '').trim().toLowerCase())
        : teachersList;
    const categories = [
        { title: 'Teachers', names: visibleTeachers, itemClass: 'category-teachers', deletable: false, parent: teachersInner, collapsible: false },
        ...studentCategories
    ];

    categories.forEach((category) => {
        const isCollapsible = category.collapsible !== false;
        const defaultCollapsed = category.title === 'Teachers' ? false : true;
        const prev = collapsedByTitle[category.title];
        const collapsed = isCollapsible && (typeof prev === 'boolean' ? prev : defaultCollapsed);

        const section = document.createElement('div');
        section.className = 'sidebar-category';
        if (category.schoolTheme) {
            section.classList.add('sidebar-category-school');
            applySchoolThemeCssVars(section, category.title);
        } else if (category.itemClass === 'category-private') {
            section.classList.add('sidebar-category-private');
        } else if (category.itemClass === 'category-speakon') {
            section.classList.add('sidebar-category-speakon');
        } else if (category.itemClass === 'category-passport') {
            section.classList.add('sidebar-category-passport');
        }
        if (collapsed) {
            section.classList.add('collapsed');
        }

        if (category.usesSchoolLinkHeader) {
            const titleRow = document.createElement('div');
            titleRow.className = 'sidebar-section-title sidebar-section-title-passport';
            const label = document.createElement('span');
            label.textContent = category.title;
            const actions = document.createElement('span');
            actions.className = 'sidebar-section-title-passport-actions';

            const offsiteBtn = document.createElement('button');
            offsiteBtn.type = 'button';
            offsiteBtn.className = 'sidebar-section-title-passport-btn sidebar-section-title-passport-btn--offsite';
            offsiteBtn.setAttribute('aria-label', 'Open spreadsheet or external link');
            offsiteBtn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';
            offsiteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSchoolExternalLinkFromSidebar(category.title);
            });

            const settingsBtn = document.createElement('button');
            settingsBtn.type = 'button';
            settingsBtn.className = 'sidebar-section-title-passport-btn sidebar-section-title-passport-btn--settings';
            settingsBtn.setAttribute(
                'aria-label',
                `School settings for ${category.title}`
            );
            settingsBtn.innerHTML = SETTINGS_GEAR_SVG;
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeSchoolFromSidebar(category.title);
            });

            actions.appendChild(offsiteBtn);
            actions.appendChild(settingsBtn);
            titleRow.appendChild(label);
            titleRow.appendChild(actions);
            section.appendChild(titleRow);
        } else if (isCollapsible) {
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'sidebar-section-title';
            if (category.deletable) {
                sectionTitle.classList.add('sidebar-section-title--with-settings');
                const label = document.createElement('span');
                label.textContent = category.title;
                const actions = document.createElement('span');
                actions.className = 'sidebar-section-title-passport-actions';
                const settingsBtn = document.createElement('button');
                settingsBtn.type = 'button';
                settingsBtn.className = 'sidebar-section-title-passport-btn sidebar-section-title-passport-btn--settings';
                settingsBtn.setAttribute('aria-label', `School settings for ${category.title}`);
                settingsBtn.innerHTML = SETTINGS_GEAR_SVG;
                settingsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeSchoolFromSidebar(category.title);
                });
                actions.appendChild(settingsBtn);
                sectionTitle.appendChild(label);
                sectionTitle.appendChild(actions);
            } else {
                sectionTitle.textContent = category.title;
            }
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
            if (category.schoolTheme) {
                teacherItem.classList.add('teacher-item--school-theme');
                applySchoolThemeCssVars(teacherItem, category.title);
            }
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
                editBtn.innerHTML = EDIT_ICON_SVG_SOLID;
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

    const makeGroup = (heading, names, variant, groupKey) => {
        const group = document.createElement('div');
        group.className = 'class-report-group';
        group.classList.add('class-report-group--school');
        applySchoolThemeCssVars(group, heading);

        const title = document.createElement('div');
        title.className = 'class-report-group-title';
        title.textContent = heading;
        title.setAttribute('role', 'button');
        title.tabIndex = 0;
        title.setAttribute('aria-expanded', 'true');
        group.appendChild(title);

        const body = document.createElement('div');
        body.className = 'class-report-group-body';

        const sorted = [...names].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
        );

        if (sorted.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'class-report-empty';
            empty.textContent = 'No students yet.';
            body.appendChild(empty);
        } else {
            const ul = document.createElement('ul');
            ul.className = 'class-report-student-list';
            sorted.forEach((name) => {
                const li = document.createElement('li');
                li.className = 'class-report-student-item';
                li.dataset.studentName = name;
                li.setAttribute('role', 'button');
                li.tabIndex = 0;
                const itemContent = document.createElement('div');
                itemContent.className = 'class-report-student-item-content';
                const studentNameLabel = document.createElement('span');
                studentNameLabel.className = 'class-report-student-name';
                studentNameLabel.textContent = name;
                const savedMeetLink = String(studentGoogleMeetLinksByName[name] || '').trim();
                const actionsWrap = document.createElement('div');
                actionsWrap.className = 'class-report-student-actions';
                if (savedMeetLink) {
                    const meetBtn = document.createElement('button');
                    meetBtn.type = 'button';
                    meetBtn.className = 'class-report-student-meet-btn';
                    meetBtn.setAttribute('aria-label', `Open saved Google Meet link for ${name}`);
                    meetBtn.innerHTML = SIDEBAR_GOOGLE_MEET_SVG;
                    meetBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        window.open(savedMeetLink, '_blank', 'noopener,noreferrer');
                    });
                    actionsWrap.appendChild(meetBtn);
                } else {
                    const meetOff = document.createElement('span');
                    meetOff.className = 'class-report-student-meet-btn class-report-student-meet-btn--off';
                    meetOff.innerHTML = SIDEBAR_GOOGLE_MEET_OFF_SVG;
                    meetOff.setAttribute('aria-hidden', 'true');
                    actionsWrap.appendChild(meetOff);
                }
                const whatsappBtn = document.createElement('button');
                whatsappBtn.type = 'button';
                whatsappBtn.className = 'class-report-student-whatsapp-btn';
                whatsappBtn.setAttribute('aria-label', `Open WhatsApp for ${name}`);
                whatsappBtn.innerHTML = SIDEBAR_WHATSAPP_SVG;
                whatsappBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const whatsappUrl = buildStudentWhatsappUrl(name, buildStudentWhatsappMessage(name));
                    if (!whatsappUrl) {
                        showAppMessage(`No valid phone number found for ${name}.`);
                        return;
                    }
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                });
                actionsWrap.prepend(whatsappBtn);
                itemContent.appendChild(actionsWrap);
                itemContent.appendChild(studentNameLabel);
                li.appendChild(itemContent);
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
            body.appendChild(ul);
        }
        group.appendChild(body);

        const setCollapsed = (collapsed, animate = true) => {
            if (!animate) {
                const prevTransition = body.style.transition;
                body.style.transition = 'none';
                group.classList.toggle('collapsed', collapsed);
                body.style.maxHeight = collapsed ? '0px' : '';
                body.style.opacity = collapsed ? '0' : '1';
                body.style.transform = collapsed ? 'translateY(-4px)' : 'translateY(0)';
                // Force style flush before restoring transition.
                void body.offsetHeight;
                body.style.transition = prevTransition;
                return;
            }

            if (collapsed) {
                body.style.maxHeight = `${body.scrollHeight}px`;
                body.style.opacity = '1';
                body.style.transform = 'translateY(0)';
                requestAnimationFrame(() => {
                    group.classList.add('collapsed');
                    body.style.maxHeight = '0px';
                    body.style.opacity = '0';
                    body.style.transform = 'translateY(-4px)';
                });
                return;
            }

            group.classList.remove('collapsed');
            body.style.maxHeight = '0px';
            body.style.opacity = '0';
            body.style.transform = 'translateY(-4px)';
            requestAnimationFrame(() => {
                body.style.maxHeight = `${body.scrollHeight}px`;
                body.style.opacity = '1';
                body.style.transform = 'translateY(0)';
            });
            const onTransitionEnd = (e) => {
                if (e.propertyName !== 'max-height') return;
                if (!group.classList.contains('collapsed')) {
                    body.style.maxHeight = '';
                }
                body.removeEventListener('transitionend', onTransitionEnd);
            };
            body.addEventListener('transitionend', onTransitionEnd);
        };

        const isCollapsed = !!classReportCollapsedBySchool[groupKey];
        title.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        setCollapsed(isCollapsed, false);
        const toggleGroup = () => {
            const nextCollapsed = !group.classList.contains('collapsed');
            classReportCollapsedBySchool[groupKey] = nextCollapsed;
            title.setAttribute('aria-expanded', nextCollapsed ? 'false' : 'true');
            setCollapsed(nextCollapsed, true);
        };
        title.addEventListener('click', toggleGroup);
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleGroup();
            }
        });
        return group;
    };

    const grouped = new Map();
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const school = getStudentSchoolName(name) || 'HomeTeachers';
        const key = school.trim().toLowerCase();
        if (!grouped.has(key)) {
            grouped.set(key, { title: school, names: [], kind: rosterKindFromSchoolName(school) });
        }
        grouped.get(key).names.push(name);
    });
    customSchoolsList.forEach((raw) => {
        const school = String(raw || '').trim();
        if (!school) return;
        const key = school.toLowerCase();
        if (!grouped.has(key)) {
            grouped.set(key, { title: school, names: [], kind: rosterKindFromSchoolName(school) });
        }
    });
    [...grouped.values()]
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
        .forEach((group) => {
            wrap.appendChild(makeGroup(group.title, group.names, group.kind, group.title.trim().toLowerCase()));
        });
    container.appendChild(wrap);
}

function setLoggedOutDashboard() {
    const calendarWrapper = document.getElementById('calendarWrapper');
    const summaryPanel = document.getElementById('summaryPanel');
    const reportPanel = document.getElementById('studentClassReportPanel');
    if (calendarWrapper) calendarWrapper.hidden = true;
    if (summaryPanel) summaryPanel.hidden = true;
    if (reportPanel) reportPanel.hidden = true;
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

function removeSchoolFromSidebar(displayTitle) {
    const schoolTitle = String(displayTitle || '').trim();
    const schoolKey = schoolTitle.toLowerCase();
    if (!schoolTitle || !schoolKey) return;

    openSchoolSettingsModal(schoolTitle);
}

function deleteSchoolFromSidebarConfirmed(displayTitle) {
    const schoolTitle = String(displayTitle || '').trim();
    const schoolKey = schoolTitle.toLowerCase();
    if (!schoolTitle || !schoolKey) return;

    const studentsInSchool = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].filter((name) => {
        return (getStudentSchoolName(name) || '').trim().toLowerCase() === schoolKey;
    });

    const removedKeys = new Set(studentsInSchool.map((name) => name.trim().toLowerCase()));
    privateStudentsList = privateStudentsList.filter((name) => !removedKeys.has(name.trim().toLowerCase()));
    speakonStudentsList = speakonStudentsList.filter((name) => !removedKeys.has(name.trim().toLowerCase()));
    passportStudentsList = passportStudentsList.filter((name) => !removedKeys.has(name.trim().toLowerCase()));

    studentsInSchool.forEach((name) => {
        delete teacherSchedules[name];
        delete studentClassReportRows[name];
        delete passportFollowupLinks[name];
        delete studentSchoolByName[name];
        delete studentPhonesByName[name];
        delete studentGoogleMeetLinksByName[name];
    });

    customSchoolsList = customSchoolsList.filter((school) => String(school || '').trim().toLowerCase() !== schoolKey);
    delete schoolExternalLinks[schoolKey];
    delete schoolThemeColors[schoolKey];
    delete googleMeetSharedLinkModeBySchoolKey[schoolKey];

    if (currentTeacher && removedKeys.has(currentTeacher.trim().toLowerCase())) {
        currentTeacher = null;
        slotStates = {};
    }

    saveRoster();
    saveStudentClassReportRows();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();

    const fallbackTeacher = currentTeacher
        || teachersList[0]
        || privateStudentsList[0]
        || speakonStudentsList[0]
        || passportStudentsList[0]
        || '';
    if (fallbackTeacher) {
        selectTeacher(fallbackTeacher);
    }
}

function openDeleteSchoolModal(schoolTitle, studentCount = 0) {
    const modal = document.getElementById('deleteSchoolModal');
    const message = document.getElementById('deleteSchoolModalMessage');
    const warning = document.getElementById('deleteSchoolModalWarning');
    const confirmBtn = document.getElementById('deleteSchoolConfirm');
    if (!modal || !message || !warning || !confirmBtn) return;

    pendingDeleteSchoolTitle = String(schoolTitle || '').trim();
    if (!pendingDeleteSchoolTitle) return;

    message.textContent = `Are you sure you want to delete "${pendingDeleteSchoolTitle}"?`;
    warning.textContent = studentCount > 0
        ? `${studentCount} student${studentCount === 1 ? '' : 's'} will also be deleted.`
        : 'This school has no students yet.';
    confirmBtn.textContent = studentCount > 0 ? 'Delete school and students' : 'Delete school';
    openModalWithAnimation(modal);
}

function closeDeleteSchoolModal() {
    const modal = document.getElementById('deleteSchoolModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
    pendingDeleteSchoolTitle = '';
}

function setupDeleteSchoolModal() {
    const modal = document.getElementById('deleteSchoolModal');
    const cancelBtn = document.getElementById('deleteSchoolCancel');
    const confirmBtn = document.getElementById('deleteSchoolConfirm');
    const backdrop = document.getElementById('deleteSchoolModalBackdrop');
    if (!modal || !confirmBtn) return;

    cancelBtn?.addEventListener('click', () => closeDeleteSchoolModal());
    backdrop?.addEventListener('click', () => closeDeleteSchoolModal());
    confirmBtn.addEventListener('click', () => {
        const title = pendingDeleteSchoolTitle;
        closeDeleteSchoolModal();
        if (title) {
            deleteSchoolFromSidebarConfirmed(title);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeDeleteSchoolModal();
        }
    });
}

function openSchoolSettingsModal(schoolTitle) {
    const modal = document.getElementById('schoolSettingsModal');
    const nameEl = document.getElementById('schoolSettingsModalSchoolName');
    const externalCheckbox = document.getElementById('schoolSettingsExternalCheckbox');
    const externalPanel = document.getElementById('schoolSettingsExternalPanel');
    const externalUrl = document.getElementById('schoolSettingsExternalUrl');
    const primaryColorSelect = document.getElementById('schoolSettingsPrimaryColor');
    const secondaryColorSelect = document.getElementById('schoolSettingsSecondaryColor');
    if (!modal || !nameEl || !externalCheckbox || !externalPanel || !externalUrl || !primaryColorSelect || !secondaryColorSelect) return;
    initColorThemeSelect(primaryColorSelect);
    initColorThemeSelect(secondaryColorSelect);

    pendingSchoolSettingsTitle = String(schoolTitle || '').trim();
    if (!pendingSchoolSettingsTitle) return;

    const existingUrl = getSchoolSpreadsheetUrl(pendingSchoolSettingsTitle);
    const enabled = !!existingUrl;
    const theme = getSchoolTheme(pendingSchoolSettingsTitle);
    nameEl.value = pendingSchoolSettingsTitle;
    primaryColorSelect.value = theme.primary;
    secondaryColorSelect.value = theme.secondary;
    applyColorSelectPreview(primaryColorSelect);
    applyColorSelectPreview(secondaryColorSelect);
    renderSchoolSettingsThemeSquares();
    closeSchoolSettingsColorPopup();
    externalCheckbox.checked = enabled;
    externalPanel.classList.toggle('is-collapsed', !enabled);
    externalPanel.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    externalUrl.value = existingUrl;

    openModalWithAnimation(modal);
    if (enabled) {
        externalUrl.focus();
    } else {
        externalCheckbox.focus();
    }
}

function closeSchoolSettingsModal() {
    const modal = document.getElementById('schoolSettingsModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
    closeSchoolSettingsColorPopup();
    pendingSchoolSettingsTitle = '';
}

function saveSchoolSettingsFromModal() {
    const schoolTitle = String(pendingSchoolSettingsTitle || '').trim();
    const schoolNameInput = document.getElementById('schoolSettingsModalSchoolName');
    const nextSchoolTitle = String(schoolNameInput?.value || '').trim();
    const schoolKey = schoolTitle.toLowerCase();
    const nextSchoolKey = nextSchoolTitle.toLowerCase();
    const externalCheckbox = document.getElementById('schoolSettingsExternalCheckbox');
    const externalUrlInput = document.getElementById('schoolSettingsExternalUrl');
    const primaryColorSelect = document.getElementById('schoolSettingsPrimaryColor');
    const secondaryColorSelect = document.getElementById('schoolSettingsSecondaryColor');
    if (!schoolTitle || !schoolKey || !externalCheckbox || !externalUrlInput || !primaryColorSelect || !secondaryColorSelect) return;
    if (!nextSchoolTitle) {
        showAppMessage("Please enter the school's name.");
        schoolNameInput?.focus();
        return;
    }
    const duplicateSchoolExists = getAvailableSchoolNames().some((name) => {
        const k = String(name || '').trim().toLowerCase();
        return k && k !== schoolKey && k === nextSchoolKey;
    });
    if (duplicateSchoolExists) {
        showAppMessage('Another school with this name already exists.');
        schoolNameInput?.focus();
        return;
    }
    const currentTheme = getSchoolTheme(nextSchoolTitle || schoolTitle);

    if (nextSchoolKey !== schoolKey) {
        Object.keys(studentSchoolByName).forEach((studentName) => {
            const currentSchool = String(studentSchoolByName[studentName] || '').trim();
            if (currentSchool.toLowerCase() === schoolKey) {
                studentSchoolByName[studentName] = nextSchoolTitle;
            }
        });
        customSchoolsList = customSchoolsList
            .map((name) => {
                const n = String(name || '').trim();
                return n.toLowerCase() === schoolKey ? nextSchoolTitle : n;
            })
            .filter(Boolean);
        customSchoolsList = [...new Set(customSchoolsList)];
        customSchoolsList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }

    if (externalCheckbox.checked) {
        const urlRaw = String(externalUrlInput.value || '').trim();
        if (!urlRaw) {
            alert('Please paste the spreadsheet or external URL.');
            externalUrlInput.focus();
            return;
        }
        const parsed = parseHttpUrlInput(urlRaw);
        if (parsed.error === 'protocol') {
            alert('Please provide a valid http(s) link.');
            externalUrlInput.focus();
            return;
        }
        if (parsed.error === 'invalid') {
            alert('Please provide a valid URL link.');
            externalUrlInput.focus();
            return;
        }
        schoolExternalLinks[nextSchoolKey] = parsed.url;
    } else {
        delete schoolExternalLinks[nextSchoolKey];
        if (rosterKindFromSchoolName(nextSchoolTitle) === 'passport') {
            passportHeaderPageLink = '';
        }
    }
    if (nextSchoolKey !== schoolKey) {
        delete schoolExternalLinks[schoolKey];
        if (Object.prototype.hasOwnProperty.call(googleMeetSharedLinkModeBySchoolKey, schoolKey)) {
            googleMeetSharedLinkModeBySchoolKey[nextSchoolKey] = !!googleMeetSharedLinkModeBySchoolKey[schoolKey];
            delete googleMeetSharedLinkModeBySchoolKey[schoolKey];
        }
    }

    schoolThemeColors[nextSchoolKey] = normalizeSchoolTheme(
        {
            primary: String(primaryColorSelect.value || currentTheme.primary || '').trim(),
            secondary: String(secondaryColorSelect.value || currentTheme.secondary || '').trim()
        },
        nextSchoolTitle
    );
    if (nextSchoolKey !== schoolKey) {
        delete schoolThemeColors[schoolKey];
        const oldCollapsedKey = schoolKey;
        const nextCollapsedKey = nextSchoolKey;
        if (Object.prototype.hasOwnProperty.call(classReportCollapsedBySchool, oldCollapsedKey)) {
            classReportCollapsedBySchool[nextCollapsedKey] = !!classReportCollapsedBySchool[oldCollapsedKey];
            delete classReportCollapsedBySchool[oldCollapsedKey];
        }
    }
    pendingSchoolSettingsTitle = nextSchoolTitle;

    saveRoster();
    refreshContextMenuTheme();
    renderSidebar();
    if (currentTeacher) {
        selectTeacher(currentTeacher);
    } else if (teachersList[0]) {
        selectTeacher(teachersList[0]);
    }
    closeSchoolSettingsModal();
}

function setupSchoolSettingsModal() {
    const modal = document.getElementById('schoolSettingsModal');
    const cancelBtn = document.getElementById('schoolSettingsCancel');
    const saveBtn = document.getElementById('schoolSettingsSave');
    const deleteBtn = document.getElementById('schoolSettingsDelete');
    const backdrop = document.getElementById('schoolSettingsModalBackdrop');
    const externalCheckbox = document.getElementById('schoolSettingsExternalCheckbox');
    const externalPanel = document.getElementById('schoolSettingsExternalPanel');
    const externalUrl = document.getElementById('schoolSettingsExternalUrl');
    const primaryColorSelect = document.getElementById('schoolSettingsPrimaryColor');
    const secondaryColorSelect = document.getElementById('schoolSettingsSecondaryColor');
    const primarySquare = document.querySelector('.school-settings-theme-square--primary');
    const secondarySquare = document.querySelector('.school-settings-theme-square--secondary');
    const colorPopup = document.getElementById('schoolSettingsColorPopup');
    if (!modal || !saveBtn || !externalCheckbox || !externalPanel) return;
    initColorThemeSelect(primaryColorSelect);
    initColorThemeSelect(secondaryColorSelect);

    cancelBtn?.addEventListener('click', () => closeSchoolSettingsModal());
    backdrop?.addEventListener('click', () => closeSchoolSettingsModal());
    saveBtn.addEventListener('click', () => saveSchoolSettingsFromModal());
    deleteBtn?.addEventListener('click', () => {
        const title = String(pendingSchoolSettingsTitle || '').trim();
        if (!title) return;
        closeSchoolSettingsModal();
        const studentsInSchool = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].filter((name) => {
            return (getStudentSchoolName(name) || '').trim().toLowerCase() === title.toLowerCase();
        });
        openDeleteSchoolModal(title, studentsInSchool.length);
    });
    primarySquare?.addEventListener('click', (e) => {
        e.stopPropagation();
        openSchoolSettingsColorPopup('primary', primarySquare);
    });
    secondarySquare?.addEventListener('click', (e) => {
        e.stopPropagation();
        openSchoolSettingsColorPopup('secondary', secondarySquare);
    });
    colorPopup?.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => {
        if (!modal.classList.contains('is-open')) return;
        closeSchoolSettingsColorPopup();
    });
    externalCheckbox.addEventListener('change', () => {
        const on = !!externalCheckbox.checked;
        externalPanel.classList.toggle('is-collapsed', !on);
        externalPanel.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) {
            window.setTimeout(() => externalUrl?.focus(), 220);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeSchoolSettingsModal();
        }
    });
}

function openAppMessageModal(title, message) {
    const modal = document.getElementById('appMessageModal');
    const titleEl = document.getElementById('appMessageModalTitle');
    const bodyEl = document.getElementById('appMessageModalBody');
    const okBtn = document.getElementById('appMessageModalOk');
    if (!modal || !titleEl || !bodyEl) return;
    titleEl.textContent = String(title || 'Notice').trim() || 'Notice';
    bodyEl.textContent = String(message || '').trim();
    openModalWithAnimation(modal);
    window.setTimeout(() => okBtn?.focus(), 0);
}

function closeAppMessageModal() {
    const modal = document.getElementById('appMessageModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
}

function showAppMessage(message, title = 'Notice') {
    openAppMessageModal(title, message);
}

function setupAppMessageModal() {
    const modal = document.getElementById('appMessageModal');
    const okBtn = document.getElementById('appMessageModalOk');
    const backdrop = document.getElementById('appMessageModalBackdrop');
    if (!modal || !okBtn) return;
    okBtn.addEventListener('click', () => closeAppMessageModal());
    backdrop?.addEventListener('click', () => closeAppMessageModal());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeAppMessageModal();
        }
    });
}

function setPasswordToggleVisual(inputEl, btnEl) {
    if (!inputEl || !btnEl) return;
    const showing = inputEl.type === 'text';
    const iconWrap = btnEl.querySelector('.password-toggle-btn-icon');
    if (iconWrap) {
        iconWrap.innerHTML = showing ? PASSWORD_HIDE_ICON_SVG : PASSWORD_SHOW_ICON_SVG;
    }
    btnEl.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
    btnEl.setAttribute('title', showing ? 'Hide password' : 'Show password');
    btnEl.setAttribute('aria-pressed', showing ? 'true' : 'false');
}

function setupPasswordToggle(inputId, buttonId) {
    const inputEl = document.getElementById(inputId);
    const btnEl = document.getElementById(buttonId);
    if (!inputEl || !btnEl) return;
    setPasswordToggleVisual(inputEl, btnEl);
    btnEl.addEventListener('click', () => {
        inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
        setPasswordToggleVisual(inputEl, btnEl);
        inputEl.focus();
    });
}

function setupPasswordToggles() {
    setupPasswordToggle('addTeacherPassword', 'addTeacherPasswordToggle');
    setupPasswordToggle('teacherLoginPassword', 'teacherLoginPasswordToggle');
}

function openTeacherLoginModal() {
    const modal = document.getElementById('teacherLoginModal');
    const emailInput = document.getElementById('teacherLoginEmail');
    const passwordInput = document.getElementById('teacherLoginPassword');
    const passwordToggleBtn = document.getElementById('teacherLoginPasswordToggle');
    const saveCredentialsCheckbox = document.getElementById('teacherLoginSaveCredentials');
    const errorEl = document.getElementById('teacherLoginError');
    if (!modal || !emailInput || !passwordInput || !errorEl) return;

    const savedCredentials = loadSavedLoginCredentials();
    errorEl.textContent = '';
    emailInput.value = savedCredentials?.email || '';
    passwordInput.value = savedCredentials?.password || '';
    if (saveCredentialsCheckbox) saveCredentialsCheckbox.checked = !!savedCredentials;
    passwordInput.type = 'password';
    setPasswordToggleVisual(passwordInput, passwordToggleBtn);
    openModalWithAnimation(modal);
    window.setTimeout(() => (emailInput.value ? passwordInput.focus() : emailInput.focus()), 0);
}

function closeTeacherLoginModal() {
    const modal = document.getElementById('teacherLoginModal');
    const errorEl = document.getElementById('teacherLoginError');
    if (!modal) return;
    closeModalWithAnimation(modal);
    if (errorEl) errorEl.textContent = '';
}

function setupTeacherLoginModal() {
    const modal = document.getElementById('teacherLoginModal');
    const form = document.getElementById('teacherLoginForm');
    const cancelBtn = document.getElementById('teacherLoginCancel');
    const backdrop = document.getElementById('teacherLoginModalBackdrop');
    const emailInput = document.getElementById('teacherLoginEmail');
    const passwordInput = document.getElementById('teacherLoginPassword');
    const saveCredentialsCheckbox = document.getElementById('teacherLoginSaveCredentials');
    const errorEl = document.getElementById('teacherLoginError');
    if (!modal || !form || !emailInput || !passwordInput || !errorEl) return;

    const setError = (message) => {
        errorEl.textContent = String(message || '').trim();
    };

    cancelBtn?.addEventListener('click', () => closeTeacherLoginModal());
    backdrop?.addEventListener('click', () => closeTeacherLoginModal());

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = String(emailInput.value || '').trim().toLowerCase();
        const password = String(passwordInput.value || '').trim();

        if (!email) {
            setError('Email is required to log in.');
            emailInput.focus();
            return;
        }
        if (!password) {
            setError('Password is required to log in.');
            passwordInput.focus();
            return;
        }
        if (password.length < 8) {
            setError('Password must have at least 8 characters.');
            passwordInput.focus();
            return;
        }

        const teacherNameByEmail = teachersList.find((name) => {
            const teacherEmail = String(teacherEmailsByName[name] || '').trim().toLowerCase();
            return teacherEmail && teacherEmail === email;
        });
        if (!teacherNameByEmail) {
            setError('Email not found. Make sure you created your profile with this email.');
            emailInput.focus();
            return;
        }
        const expectedPassword = String(teacherPasswordsByName[teacherNameByEmail] || '');
        if (!expectedPassword) {
            setError('This profile has no password saved. Please create it again.');
            return;
        }
        if (password !== expectedPassword) {
            setError('Incorrect password.');
            passwordInput.focus();
            return;
        }

        if (saveCredentialsCheckbox?.checked) {
            saveLoginCredentials(email, password);
        } else {
            clearSavedLoginCredentials();
        }

        try {
            sessionStorage.removeItem(LOGIN_SESSION_SUPPRESS_KEY);
        } catch {
            /* ignore */
        }

        closeTeacherLoginModal();
        isTeacherLoggedIn = true;
        loggedInTeacherName = teacherNameByEmail;
        renderSidebar();
        selectTeacher(teacherNameByEmail, { view: 'calendar' });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeTeacherLoginModal();
        }
    });
}

// Initialize teachers sidebar
async function initTeachers() {
    await loadAllSchedules();
    initRoster();
    syncSpeakOnWeeklyToAllTeacherSchedules();
    const restoredTeacher = tryRestoreTeacherSessionFromSavedCredentials();
    renderSidebar();
    setupTeacherListEditDelegation();

    if (!isTeacherLoggedIn) {
        setLoggedOutDashboard();
        return;
    }

    if (teachersList.length > 0) {
        const initialTeacher = restoredTeacher || loggedInTeacherName || teachersList[0];
        selectTeacher(initialTeacher, restoredTeacher ? { view: 'calendar' } : undefined);
    }
}

/**
 * @param {string} teacherName
 * @param {{ view?: 'calendar' | 'classReport' }} [opts]
 */
function selectTeacher(teacherName, opts) {
    if (!isTeacherLoggedIn) {
        setLoggedOutDashboard();
        return;
    }

    if (isActiveTeacherName(teacherName) && !isTeacherSelectionAllowed(teacherName)) {
        showAppMessage('You can only access the logged-in teacher profile.');
        return;
    }

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
    renderSidebarHeaderProfile();

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
    applyCalendarStatePaletteCssVars();
    refreshContextMenuTheme();

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
    const list = kind === 'private'
        ? privateStudentsList
        : (kind === 'speakon' ? speakonStudentsList : passportStudentsList);
    let idx = list.indexOf(name);
    if (idx === -1) {
        const trimmed = name.trim();
        idx = list.findIndex((n) => n.trim() === trimmed);
    }
    if (idx === -1) {
        console.warn('removeStudentFromRoster: name not found in roster', { name, rosterKey: kind });
        return;
    }

    const removedName = list[idx];
    list.splice(idx, 1);
    saveRoster();

    const wasCurrent = currentTeacher === removedName;
    if (wasCurrent) {
        currentTeacher = null;
        slotStates = {};
    }

    delete teacherSchedules[removedName];
    delete speakonStudentWeeklyClass[removedName];
    delete studentClassReportRows[removedName];
    delete passportFollowupLinks[removedName];
    delete studentSchoolByName[removedName];
    delete studentPhonesByName[removedName];
    delete studentGoogleMeetLinksByName[removedName];
    saveStudentClassReportRows();
    syncSpeakOnWeeklyToAllTeacherSchedules();
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

function getStudentPhoneInfo(studentName) {
    const name = String(studentName || '').trim();
    const raw = name ? studentPhonesByName[name] : null;
    if (!raw || typeof raw !== 'object') {
        return { countryIso: DEFAULT_PHONE_COUNTRY_ISO, number: '' };
    }
    const iso = String(raw.countryIso || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const countryIso = PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso) ? iso : DEFAULT_PHONE_COUNTRY_ISO;
    const number = String(raw.number || '').trim();
    return { countryIso, number };
}

function saveStudentPhoneInfo(studentName, countryIsoRaw, numberRaw) {
    const name = String(studentName || '').trim();
    if (!name) return;
    const number = String(numberRaw || '').trim();
    if (!number) {
        delete studentPhonesByName[name];
        return;
    }
    const iso = String(countryIsoRaw || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const countryIso = PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso) ? iso : DEFAULT_PHONE_COUNTRY_ISO;
    studentPhonesByName[name] = { countryIso, number };
}

function buildStudentWhatsappUrl(studentName, message = '') {
    const name = String(studentName || '').trim();
    if (!name) return '';
    const phoneInfo = getStudentPhoneInfo(name);
    const country = PHONE_COUNTRY_OPTIONS.find((item) => item.iso === phoneInfo.countryIso)
        || PHONE_COUNTRY_OPTIONS.find((item) => item.iso === DEFAULT_PHONE_COUNTRY_ISO)
        || PHONE_COUNTRY_OPTIONS[0];
    if (!country) return '';

    const dialDigits = String(country.dialCode || '').replace(/\D+/g, '');
    let numberDigits = String(phoneInfo.number || '').replace(/\D+/g, '');
    if (!dialDigits || !numberDigits) return '';

    if (numberDigits.startsWith('00')) {
        numberDigits = numberDigits.slice(2);
    }
    const fullNumberDigits = numberDigits.startsWith(dialDigits)
        ? numberDigits
        : `${dialDigits}${numberDigits.replace(/^0+/, '')}`;
    if (!/^\d{8,15}$/.test(fullNumberDigits)) return '';

    const encodedMessage = encodeURIComponent(String(message || '').trim());
    return encodedMessage
        ? `https://wa.me/${fullNumberDigits}?text=${encodedMessage}`
        : `https://wa.me/${fullNumberDigits}`;
}

function getOrdinalSuffix(day) {
    const n = Number(day) || 0;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return 'th';
    const mod10 = n % 10;
    if (mod10 === 1) return 'st';
    if (mod10 === 2) return 'nd';
    if (mod10 === 3) return 'rd';
    return 'th';
}

function buildStudentWhatsappMessage(studentName) {
    const fullName = String(studentName || '').trim();
    const firstName = splitName(fullName).first || fullName || 'student';
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const day = now.getDate();
    const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
    const dateLine = `*${month}, ${day}${getOrdinalSuffix(day)} — ${dayOfWeek}.*`;
    const greetingOptions = ['Hi', 'Hi there', 'Hello', 'Hello there', 'Hey', 'Hey there'];
    const greeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)] || 'Hi there';
    const followUpOptions = [
        'How are you?',
        'How are you doing?',
        "How's it going?",
        'How have you been?',
        "How's everything?",
        'How are things going?',
        "How's your day going?",
        "How's your day been so far?",
        "What's up?",
        "What's going on?",
        "How's it going so far?",
        'How are things?',
        'How are you today?',
        "I hope you're doing well.",
        "Hope you're having a great day."
    ];
    const followUp = followUpOptions[Math.floor(Math.random() * followUpOptions.length)] || 'How are you today?';
    const meetLink = String(studentGoogleMeetLinksByName[fullName] || '').trim();
    const meetLine = `*${meetLink || "<Google Meet link>"}*`;
    const classLinkLineOptions = [
        "Here's the link for our class.",
        "Here's your class link.",
        "Here's the link to our class.",
        'This is our class link.',
        "Here's your link for today's class.",
        "Here's the link for our lesson today.",
        "Here's your class link for today.",
        "Here's where we'll meet.",
        'Please find the class link below.',
        'Here is the link for our class.',
        'You can access the class using the link below.',
        'Class link.',
        'Your class link.',
        'Join here.'
    ];
    const classLinkLine = classLinkLineOptions[Math.floor(Math.random() * classLinkLineOptions.length)] || "Here's your class link.";
    return `${dateLine}
${greeting}, ${firstName}. ${followUp}

${meetLine}
${classLinkLine}`;
}

function refreshEditStudentSchoolSelect(selectedSchool = '') {
    const schoolSelect = document.getElementById('editStudentSchool');
    if (!schoolSelect) return;
    const selected = String(selectedSchool || '').trim();
    const options = getAvailableSchoolNames();
    if (selected && !options.includes(selected)) {
        options.push(selected);
        options.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }
    schoolSelect.innerHTML = '';
    options.forEach((school) => {
        const option = document.createElement('option');
        option.value = school;
        option.textContent = school;
        schoolSelect.appendChild(option);
    });
    schoolSelect.value = selected && options.includes(selected) ? selected : (options[0] || '');
}

function openEditStudentModal(studentName, rosterKey) {
    const modal = document.getElementById('editStudentModal');
    const firstInput = document.getElementById('editStudentFirst');
    const lastInput = document.getElementById('editStudentLast');
    const phoneInput = document.getElementById('editStudentPhone');
    const phoneCountrySelect = document.getElementById('editStudentPhoneCountry');
    const schoolSelect = document.getElementById('editStudentSchool');
    const originalNameInput = document.getElementById('editStudentOriginalName');
    const originalCategoryInput = document.getElementById('editStudentOriginalCategory');
    if (!modal || !firstInput || !lastInput || !phoneInput || !phoneCountrySelect || !schoolSelect || !originalNameInput || !originalCategoryInput) {
        return;
    }

    const parsed = splitName(studentName);
    const currentSchool = getStudentSchoolName(studentName) || (rosterKey === 'passport' ? 'Passport' : (rosterKey === 'speakon' ? 'SpeakOn' : 'HomeTeachers'));
    firstInput.value = parsed.first;
    lastInput.value = parsed.last;
    const phone = getStudentPhoneInfo(studentName);
    phoneInput.value = phone.number;
    phoneCountrySelect.value = phone.countryIso;
    updateEditStudentPhonePlaceholder();
    refreshEditStudentSchoolSelect(currentSchool);
    originalNameInput.value = studentName;
    originalCategoryInput.value = rosterKey;

    openModalWithAnimation(modal);
    firstInput.focus();
}

function closeEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
}

function upsertStudentFromEditForm(action = 'save') {
    const originalName = document.getElementById('editStudentOriginalName')?.value || '';
    const originalKind = document.getElementById('editStudentOriginalCategory')?.value || '';
    const first = document.getElementById('editStudentFirst')?.value || '';
    const last = document.getElementById('editStudentLast')?.value || '';
    const phoneNumber = document.getElementById('editStudentPhone')?.value || '';
    const phoneCountryIso = document.getElementById('editStudentPhoneCountry')?.value || DEFAULT_PHONE_COUNTRY_ISO;
    const schoolName = document.getElementById('editStudentSchool')?.value || '';
    const nextSchool = String(schoolName || '').trim();
    const nextKind = rosterKindFromSchoolName(nextSchool);

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
    if (!nextSchool) {
        alert("Please select the school's name.");
        return;
    }

    const oldList = originalKind === 'private'
        ? privateStudentsList
        : (originalKind === 'speakon' ? speakonStudentsList : passportStudentsList);
    const oldIdx = oldList.findIndex((n) => n.trim().toLowerCase() === originalName.trim().toLowerCase());
    if (oldIdx === -1) {
        alert('Student was not found in the list.');
        closeEditStudentModal();
        return;
    }

    const duplicateExists = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((n) => {
        const sameAsOriginal = n.trim().toLowerCase() === originalName.trim().toLowerCase();
        return !sameAsOriginal && n.trim().toLowerCase() === fullName.toLowerCase();
    });
    if (duplicateExists) {
        alert('That name is already in the list.');
        return;
    }

    oldList.splice(oldIdx, 1);
    const newList = nextKind === 'private'
        ? privateStudentsList
        : (nextKind === 'speakon' ? speakonStudentsList : passportStudentsList);
    newList.push(fullName);
    newList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    studentSchoolByName[fullName] = nextSchool;

    if (originalName !== fullName) {
        if (teacherSchedules[originalName] && !teacherSchedules[fullName]) {
            teacherSchedules[fullName] = teacherSchedules[originalName];
        } else if (!teacherSchedules[fullName]) {
            teacherSchedules[fullName] = {};
        }
        delete teacherSchedules[originalName];
        renameStudentClassReportRows(originalName, fullName);
        if (originalKind === 'passport' && passportFollowupLinks[originalName]) {
            passportFollowupLinks[fullName] = passportFollowupLinks[originalName];
            delete passportFollowupLinks[originalName];
        }
        delete studentSchoolByName[originalName];
        if (studentGoogleMeetLinksByName[originalName]) {
            studentGoogleMeetLinksByName[fullName] = studentGoogleMeetLinksByName[originalName];
        }
        delete studentGoogleMeetLinksByName[originalName];
    } else if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }
    if (originalKind === 'passport' && nextKind !== 'passport') {
        delete passportFollowupLinks[fullName];
    }
    saveStudentPhoneInfo(fullName, phoneCountryIso, phoneNumber);
    if (originalName !== fullName) {
        delete studentPhonesByName[originalName];
    }

    if (currentTeacher && currentTeacher.trim().toLowerCase() === originalName.trim().toLowerCase()) {
        currentTeacher = fullName;
    }

    if (nextKind === 'speakon') {
        if (originalName !== fullName && speakonStudentWeeklyClass[originalName]) {
            speakonStudentWeeklyClass[fullName] = speakonStudentWeeklyClass[originalName];
            delete speakonStudentWeeklyClass[originalName];
        }
        const classDayInput = document.getElementById('editStudentSpeakonClassDay');
        const classHourInput = document.getElementById('editStudentSpeakonClassHour');
        const extraDayInput = document.getElementById('editStudentSpeakonExtraDay');
        const extraHourInput = document.getElementById('editStudentSpeakonExtraHour');
        const hasScheduleInputs = !!(classDayInput && classHourInput && extraDayInput && extraHourInput);
        const bucket = hasScheduleInputs
            ? {
                classDay: String(classDayInput.value || '').trim(),
                classHour: String(classHourInput.value || '').trim(),
                extraDay: String(extraDayInput.value || '').trim(),
                extraHour: String(extraHourInput.value || '').trim()
            }
            : getSpeakonWeeklyClassEntry(originalName !== fullName ? originalName : fullName);
        const templateEmpty =
            !bucket.classDay &&
            !String(bucket.classHour || '').trim() &&
            !bucket.extraDay &&
            !String(bucket.extraHour || '').trim();
        const speakonCanonical =
            speakonStudentsList.find((n) => n.trim().toLowerCase() === fullName.trim().toLowerCase()) || fullName;
        if (templateEmpty) {
            Object.keys(speakonStudentWeeklyClass).forEach((k) => {
                if (String(k || '').trim().toLowerCase() === fullName.trim().toLowerCase()) {
                    delete speakonStudentWeeklyClass[k];
                }
            });
            const ts = { ...(teacherSchedules[fullName] || {}) };
            teacherSchedules[fullName] = stripSpeakonColorsFromScheduleCopy(ts);
        } else {
            Object.keys(speakonStudentWeeklyClass).forEach((k) => {
                if (
                    k !== speakonCanonical &&
                    String(k || '').trim().toLowerCase() === speakonCanonical.trim().toLowerCase()
                ) {
                    delete speakonStudentWeeklyClass[k];
                }
            });
            speakonStudentWeeklyClass[speakonCanonical] = bucket;
        }
    } else {
        delete speakonStudentWeeklyClass[fullName];
        delete speakonStudentWeeklyClass[originalName];
        const ts = { ...(teacherSchedules[fullName] || {}) };
        teacherSchedules[fullName] = stripSpeakonColorsFromScheduleCopy(ts);
    }

    if (teacherSchedules[fullName]) {
        teacherSchedules[fullName] = mergeSpeakonWeeklyClassIntoScheduleCopy(teacherSchedules[fullName], fullName);
    } else {
        teacherSchedules[fullName] = mergeSpeakonWeeklyClassIntoScheduleCopy({}, fullName);
    }
    if (currentTeacher && currentTeacher.trim().toLowerCase() === fullName.trim().toLowerCase()) {
        slotStates = { ...teacherSchedules[fullName] };
    }

    syncSpeakOnWeeklyToAllTeacherSchedules();

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();
    selectTeacher(currentTeacher || teachersList[0] || fullName);
    syncSpeakOnWeeklyToAllTeacherSchedules();
    saveAllSchedulesLocal();
    saveAllSchedules();
    closeEditStudentModal();
}

function setupEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    const form = document.getElementById('editStudentForm');
    const cancelBtn = document.getElementById('editStudentCancel');
    const deleteBtn = document.getElementById('editStudentDelete');
    const backdrop = document.getElementById('editStudentModalBackdrop');
    const phoneCountrySelect = document.getElementById('editStudentPhoneCountry');
    if (!modal || !form) {
        return;
    }
    populateEditStudentPhoneCountrySelect();
    updateEditStudentPhonePlaceholder();

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeEditStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeEditStudentModal());
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => upsertStudentFromEditForm('delete'));
    }
    phoneCountrySelect?.addEventListener('change', updateEditStudentPhonePlaceholder);

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

function addSchoolFromForm(schoolNameRaw, primaryColorRaw, secondaryColorRaw) {
    const schoolName = String(schoolNameRaw || '').trim();
    if (!schoolName) {
        alert("Please enter the school's name.");
        return;
    }

    normalizeCustomSchoolsList();
    const k = schoolName.toLowerCase();
    const usedByStudent = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
        return (getStudentSchoolName(name) || '').trim().toLowerCase() === k;
    });
    if (usedByStudent || customSchoolsList.some((s) => s.trim().toLowerCase() === k)) {
        alert('That school is already listed.');
        return;
    }

    const extCb = document.getElementById('addSchoolExternalCheckbox');
    const extUrlInput = document.getElementById('addSchoolExternalUrl');
    if (extCb && extCb.checked) {
        const urlRaw = String(extUrlInput?.value || '').trim();
        if (!urlRaw) {
            alert('Please paste the spreadsheet or external URL.');
            extUrlInput?.focus();
            return;
        }
        const parsed = parseHttpUrlInput(urlRaw);
        if (parsed.error === 'protocol') {
            alert('Please provide a valid http(s) link.');
            extUrlInput?.focus();
            return;
        }
        if (parsed.error === 'invalid') {
            alert('Please provide a valid URL link.');
            extUrlInput?.focus();
            return;
        }
        schoolExternalLinks[k] = parsed.url;
    }
    schoolThemeColors[k] = normalizeSchoolTheme(
        { primary: primaryColorRaw, secondary: secondaryColorRaw },
        schoolName
    );

    customSchoolsList.push(schoolName);
    customSchoolsList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    saveRoster();
    refreshContextMenuTheme();
    renderSidebar();
    if (currentTeacher) {
        selectTeacher(currentTeacher);
    } else if (teachersList[0]) {
        selectTeacher(teachersList[0]);
    }

    closeAddStudentModal();
}

function addTeacherFromForm(firstName, lastName, emailRaw, passwordRaw) {
    const first = String(firstName || '').trim();
    const last = String(lastName || '').trim();
    const email = String(emailRaw || '').trim();
    const password = String(passwordRaw || '');
    if (!first || !last) {
        showAppMessage('Please enter both first and last name.');
        return;
    }
    if (!email) {
        showAppMessage('Please enter an email address.');
        return;
    }
    if (password.length < 8) {
        showAppMessage('Password must have at least 8 characters.');
        return;
    }
    const emailInput = document.getElementById('addTeacherEmail');
    if (emailInput && typeof emailInput.checkValidity === 'function' && !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ');
    const nameTaken = [...teachersList, ...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some(
        (n) => n.trim().toLowerCase() === fullName.toLowerCase()
    );
    if (nameTaken) {
        showAppMessage('That name is already in the list.');
        return;
    }

    teachersList.push(fullName);
    teachersList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    teacherEmailsByName[fullName] = email;
    teacherPasswordsByName[fullName] = password;
    if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();
    if (isTeacherLoggedIn) {
        selectTeacher(fullName);
    } else {
        setLoggedOutDashboard();
    }
    closeAddStudentModal();
}

function addStudentToSchoolFromForm(firstName, lastName, schoolNameRaw) {
    const first = String(firstName || '').trim();
    const last = String(lastName || '').trim();
    const schoolName = String(schoolNameRaw || '').trim();
    if (!first || !last) {
        alert('Please enter both first and last name.');
        return;
    }
    if (!schoolName) {
        alert("Please enter the school's name.");
        return;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ');
    const nameTaken = [...teachersList, ...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some(
        (n) => n.trim().toLowerCase() === fullName.toLowerCase()
    );
    if (nameTaken) {
        alert('That name is already in the list.');
        return;
    }

    const rosterKey = rosterKindFromSchoolName(schoolName);
    const roster = rosterKey === 'passport'
        ? passportStudentsList
        : (rosterKey === 'speakon' ? speakonStudentsList : privateStudentsList);
    roster.push(fullName);
    roster.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    studentSchoolByName[fullName] = schoolName;
    const addPhoneInput = document.getElementById('addStudentPhone');
    const addPhoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    saveStudentPhoneInfo(fullName, addPhoneCountrySelect?.value || DEFAULT_PHONE_COUNTRY_ISO, addPhoneInput?.value || '');
    if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();
    selectTeacher(fullName, { view: 'classReport' });
    closeAddStudentModal();
}

function populateAddStudentPhoneCountrySelect() {
    const countrySelect = document.getElementById('addStudentPhoneCountry');
    if (!countrySelect) return;
    if (countrySelect.options.length > 0) return;

    PHONE_COUNTRY_OPTIONS.forEach((country) => {
        const option = document.createElement('option');
        option.value = country.iso;
        option.textContent = country.flag;
        option.dataset.dialCode = country.dialCode;
        option.dataset.sample = country.sample;
        option.dataset.flagUrl = `https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`;
        countrySelect.appendChild(option);
    });

    countrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
}

function updateAddStudentPhonePlaceholder() {
    const countrySelect = document.getElementById('addStudentPhoneCountry');
    const phoneInput = document.getElementById('addStudentPhone');
    const flagImg = document.getElementById('addStudentPhoneCountryFlag');
    if (!countrySelect || !phoneInput) return;

    const selected = PHONE_COUNTRY_OPTIONS.find((country) => country.iso === countrySelect.value)
        || PHONE_COUNTRY_OPTIONS.find((country) => country.iso === DEFAULT_PHONE_COUNTRY_ISO)
        || PHONE_COUNTRY_OPTIONS[0];
    if (!selected) return;
    phoneInput.placeholder = `${selected.dialCode} ${selected.sample}`;
    if (flagImg) {
        const flagUrl = `https://flagcdn.com/w40/${selected.iso.toLowerCase()}.png`;
        flagImg.src = flagUrl;
        flagImg.alt = `${selected.name} flag`;
        flagImg.onerror = () => {
            if (selected.iso === 'BR') {
                flagImg.src = BRAZIL_FLAG_SVG_DATA_URI;
            }
        };
    }
}

function populateEditStudentPhoneCountrySelect() {
    const countrySelect = document.getElementById('editStudentPhoneCountry');
    if (!countrySelect) return;
    if (countrySelect.options.length > 0) return;

    PHONE_COUNTRY_OPTIONS.forEach((country) => {
        const option = document.createElement('option');
        option.value = country.iso;
        option.textContent = country.flag;
        countrySelect.appendChild(option);
    });

    countrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
}

function updateEditStudentPhonePlaceholder() {
    const countrySelect = document.getElementById('editStudentPhoneCountry');
    const phoneInput = document.getElementById('editStudentPhone');
    const flagImg = document.getElementById('editStudentPhoneCountryFlag');
    if (!countrySelect || !phoneInput) return;

    const selected = PHONE_COUNTRY_OPTIONS.find((country) => country.iso === countrySelect.value)
        || PHONE_COUNTRY_OPTIONS.find((country) => country.iso === DEFAULT_PHONE_COUNTRY_ISO)
        || PHONE_COUNTRY_OPTIONS[0];
    if (!selected) return;
    phoneInput.placeholder = `${selected.dialCode} ${selected.sample}`;
    if (flagImg) {
        const flagUrl = `https://flagcdn.com/w40/${selected.iso.toLowerCase()}.png`;
        flagImg.src = flagUrl;
        flagImg.alt = `${selected.name} flag`;
        flagImg.onerror = () => {
            if (selected.iso === 'BR') {
                flagImg.src = BRAZIL_FLAG_SVG_DATA_URI;
            }
        };
    }
}

function updateAddStudentPassportFieldVisibility() {
    const nameRow = document.getElementById('addTeacherNameRow');
    const firstInput = document.getElementById('addStudentFirst');
    const lastInput = document.getElementById('addStudentLast');
    const phoneInput = document.getElementById('addStudentPhone');
    const schoolWrap = document.getElementById('addStudentSchoolWrap');
    const cityInput = document.getElementById('addStudentCity');
    const stateInput = document.getElementById('addStudentState');
    const schoolInput = document.getElementById('addStudentSchool');
    const schoolSelect = document.getElementById('addStudentSchoolSelect');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    const teacherEmailWrap = document.getElementById('addTeacherEmailWrap');
    const teacherEmailInput = document.getElementById('addTeacherEmail');
    const teacherPasswordInput = document.getElementById('addTeacherPassword');
    const passportLinkWrap = document.getElementById('addStudentPassportLinkWrap');
    const passportLinkInput = document.getElementById('addStudentPassportLink');
    const addSchoolExternalWrap = document.getElementById('addSchoolExternalWrap');
    const addSchoolThemeWrap = document.getElementById('addSchoolThemeWrap');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const dialog = document.querySelector('.add-student-dialog');
    const title = document.getElementById('addStudentModalTitle');
    const submitBtn = document.getElementById('addStudentFormSubmit');
    if (!passportLinkWrap || !passportLinkInput || !dialog || !title || !schoolWrap || !schoolInput) return;

    const isTeacherMode = addStudentModalMode === 'teacher';
    const isStudentEntryMode = addStudentModalMode === 'student-entry';
    const isStudentGlobalMode = addStudentModalMode === 'student-global';
    const useNameFields = isTeacherMode || isStudentEntryMode;
    const useNameFieldsAny = useNameFields || isStudentGlobalMode;
    if (nameRow && firstInput && lastInput) {
        nameRow.classList.toggle('is-hidden', !useNameFieldsAny);
        nameRow.setAttribute('aria-hidden', useNameFieldsAny ? 'false' : 'true');
        firstInput.required = useNameFieldsAny;
        lastInput.required = useNameFieldsAny;
        if (!useNameFieldsAny) {
            firstInput.value = '';
            lastInput.value = '';
            if (phoneInput) phoneInput.value = '';
            if (phoneCountrySelect) {
                phoneCountrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
                updateAddStudentPhonePlaceholder();
            }
        }
    }
    if (teacherEmailWrap && teacherEmailInput) {
        teacherEmailWrap.classList.toggle('is-hidden', !isTeacherMode);
        teacherEmailWrap.setAttribute('aria-hidden', isTeacherMode ? 'false' : 'true');
        teacherEmailInput.required = isTeacherMode;
        if (teacherPasswordInput) teacherPasswordInput.required = isTeacherMode;
        if (!isTeacherMode) {
            teacherEmailInput.value = '';
            if (teacherPasswordInput) teacherPasswordInput.value = '';
        }
    }
    const hideSchoolInput = isTeacherMode || isStudentEntryMode;
    schoolWrap.classList.toggle('is-hidden', hideSchoolInput);
    schoolWrap.setAttribute('aria-hidden', hideSchoolInput ? 'true' : 'false');
    if (hideSchoolInput) {
        if (cityInput) cityInput.value = '';
        if (stateInput) stateInput.value = '';
    }
    const useSchoolSelect = isStudentGlobalMode;
    if (schoolInput) {
        schoolInput.classList.toggle('is-hidden', useSchoolSelect);
        schoolInput.setAttribute('aria-hidden', useSchoolSelect ? 'true' : 'false');
        schoolInput.required = !hideSchoolInput && !useSchoolSelect;
        if (isTeacherMode || useSchoolSelect) {
            schoolInput.value = '';
        }
    }
    if (schoolSelect) {
        schoolSelect.classList.toggle('is-hidden', !useSchoolSelect);
        schoolSelect.setAttribute('aria-hidden', useSchoolSelect ? 'false' : 'true');
        schoolSelect.required = !hideSchoolInput && useSchoolSelect;
        if (!useSchoolSelect) {
            schoolSelect.value = '';
        } else {
            refreshAddStudentSchoolSelect(schoolSelect.value);
        }
    }

    const hideExternalLinkControls = isTeacherMode || isStudentEntryMode;
    if (addSchoolExternalWrap) {
        addSchoolExternalWrap.classList.toggle('is-hidden', hideExternalLinkControls);
        addSchoolExternalWrap.setAttribute('aria-hidden', hideExternalLinkControls ? 'true' : 'false');
    }
    if (addSchoolThemeWrap) {
        addSchoolThemeWrap.classList.toggle('is-hidden', hideExternalLinkControls);
        addSchoolThemeWrap.setAttribute('aria-hidden', hideExternalLinkControls ? 'true' : 'false');
    }
    if (hideExternalLinkControls) {
        if (addSchoolExternalCheckbox) addSchoolExternalCheckbox.checked = false;
        if (addSchoolExternalPanel) {
            addSchoolExternalPanel.classList.add('is-collapsed');
            addSchoolExternalPanel.setAttribute('aria-hidden', 'true');
        }
        if (addSchoolExternalUrl) addSchoolExternalUrl.value = '';
        if (addSchoolPrimaryColor) addSchoolPrimaryColor.value = '#5c6bc0';
        if (addSchoolSecondaryColor) addSchoolSecondaryColor.value = '#1e88e5';
        renderAddSchoolThemeSquares();
        closeAddSchoolColorPopup();
    }

    passportLinkWrap.classList.remove('is-visible');
    passportLinkWrap.setAttribute('aria-hidden', 'true');
    passportLinkInput.required = false;
    passportLinkInput.value = '';
    dialog.classList.remove('add-student-dialog--expanded');

    title.textContent = isTeacherMode ? 'Add Teacher Profile' : ((isStudentEntryMode || isStudentGlobalMode) ? 'Add Student' : 'Add School');
    if (submitBtn) {
        submitBtn.textContent = isTeacherMode ? 'Add' : ((isStudentEntryMode || isStudentGlobalMode) ? 'Add student' : 'Add school');
    }
    renderAddSchoolThemeSquares();
}

function openAddStudentModal(mode = 'student') {
    const modal = document.getElementById('addStudentModal');
    const firstInput = document.getElementById('addStudentFirst');
    const lastInput = document.getElementById('addStudentLast');
    const phoneInput = document.getElementById('addStudentPhone');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    const schoolInput = document.getElementById('addStudentSchool');
    const schoolSelect = document.getElementById('addStudentSchoolSelect');
    const cityInput = document.getElementById('addStudentCity');
    const stateInput = document.getElementById('addStudentState');
    const passportLinkInput = document.getElementById('addStudentPassportLink');
    const teacherEmailInput = document.getElementById('addTeacherEmail');
    const teacherPasswordInput = document.getElementById('addTeacherPassword');
    const teacherPasswordToggleBtn = document.getElementById('addTeacherPasswordToggle');
    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    if (!modal || !schoolInput || !passportLinkInput) {
        return;
    }

    addStudentModalMode =
        mode === 'teacher'
            ? 'teacher'
            : (mode === 'student-entry' ? 'student-entry' : (mode === 'student-global' ? 'student-global' : 'student'));
    addStudentTargetSchool = '';
    if (addStudentModalMode === 'teacher' && (!firstInput || !lastInput)) {
        return;
    }
    if (firstInput) firstInput.value = '';
    if (lastInput) lastInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (phoneCountrySelect) phoneCountrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
    schoolInput.value = '';
    if (cityInput) cityInput.value = '';
    if (stateInput) stateInput.value = '';
    if (schoolSelect) {
        refreshAddStudentSchoolSelect();
        schoolSelect.value = '';
    }
    passportLinkInput.value = '';
    if (teacherEmailInput) teacherEmailInput.value = '';
    if (teacherPasswordInput) {
        teacherPasswordInput.value = '';
        teacherPasswordInput.type = 'password';
        setPasswordToggleVisual(teacherPasswordInput, teacherPasswordToggleBtn);
    }
    if (addSchoolExternalCheckbox) addSchoolExternalCheckbox.checked = false;
    if (addSchoolExternalPanel) {
        addSchoolExternalPanel.classList.add('is-collapsed');
        addSchoolExternalPanel.setAttribute('aria-hidden', 'true');
    }
    if (addSchoolExternalUrl) addSchoolExternalUrl.value = '';
    if (addSchoolPrimaryColor) addSchoolPrimaryColor.value = '#5c6bc0';
    if (addSchoolSecondaryColor) addSchoolSecondaryColor.value = '#1e88e5';
    renderAddSchoolThemeSquares();
    closeAddSchoolColorPopup();
    updateAddStudentPhonePlaceholder();
    updateAddStudentPassportFieldVisibility();

    openModalWithAnimation(modal);
    if ((addStudentModalMode === 'teacher' || addStudentModalMode === 'student-entry' || addStudentModalMode === 'student-global') && firstInput) {
        firstInput.focus();
    } else {
        if (addStudentModalMode === 'student-global') {
            schoolSelect?.focus();
        } else {
            schoolInput.focus();
        }
    }
}

function openAddStudentModalForSchool(schoolTitle) {
    const school = String(schoolTitle || '').trim();
    if (!school) return;
    addStudentTargetSchool = school;
    openAddStudentModal('student-entry');
}

function getStudentNamesForSchool(schoolTitle) {
    const schoolKey = String(schoolTitle || '').trim().toLowerCase();
    if (!schoolKey) return [];
    return [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList]
        .filter((name) => (getStudentSchoolName(name) || '').trim().toLowerCase() === schoolKey)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function getGoogleMeetSchoolKey(schoolTitle) {
    return String(schoolTitle || '').trim().toLowerCase();
}

function getSharedGoogleMeetLinkForStudents(names) {
    const links = names
        .map((name) => String(studentGoogleMeetLinksByName[name] || '').trim())
        .filter(Boolean);
    if (links.length === 0) return '';
    const first = links[0];
    return links.every((link) => link === first) ? first : '';
}

function refreshGoogleMeetSharedSchoolPanel() {
    const panel = document.getElementById('googleMeetSharedSchoolPanel');
    const checkbox = document.getElementById('googleMeetSharedSchoolCheckbox');
    const inputWrap = document.getElementById('googleMeetSharedSchoolInputWrap');
    const actions = document.getElementById('googleMeetSharedSchoolActions');
    const input = document.getElementById('googleMeetSharedSchoolInput');
    if (!panel || !checkbox || !inputWrap || !actions || !input) return;

    const school = String(googleMeetSelectedSchool || '').trim();
    const schoolKey = getGoogleMeetSchoolKey(school);
    const hasSchool = !!schoolKey;
    panel.hidden = !hasSchool;
    panel.setAttribute('aria-hidden', hasSchool ? 'false' : 'true');
    if (!hasSchool) {
        googleMeetUseSharedSchoolLink = false;
        checkbox.checked = false;
    }

    if (hasSchool) {
        checkbox.checked = !!googleMeetUseSharedSchoolLink;
    }
    const shouldShowSharedInput = hasSchool && !!checkbox.checked;
    inputWrap.hidden = !shouldShowSharedInput;
    inputWrap.setAttribute('aria-hidden', shouldShowSharedInput ? 'false' : 'true');
    actions.hidden = !shouldShowSharedInput;
    actions.setAttribute('aria-hidden', shouldShowSharedInput ? 'false' : 'true');

    if (hasSchool && shouldShowSharedInput) {
        const names = getStudentNamesForSchool(googleMeetSelectedSchool);
        input.value = getSharedGoogleMeetLinkForStudents(names);
    }
}

function isPlausibleGoogleMeetUrl(candidate) {
    const raw = String(candidate || '').trim();
    if (!raw) return true;
    let u = raw;
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    try {
        const url = new URL(u);
        const h = url.hostname.toLowerCase();
        return h === 'meet.google.com' || h.endsWith('.meet.google.com') || h === 'meet.app';
    } catch {
        return false;
    }
}

function normalizeGoogleMeetUrl(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function hideGoogleMeetContextMessage(immediate = false) {
    if (googleMeetContextMessageTimer) {
        clearTimeout(googleMeetContextMessageTimer);
        googleMeetContextMessageTimer = null;
    }
    if (googleMeetContextMessageHideTimer) {
        clearTimeout(googleMeetContextMessageHideTimer);
        googleMeetContextMessageHideTimer = null;
    }
    const toast = document.getElementById('googleMeetContextMessage');
    if (!toast) return;
    if (immediate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        toast.classList.remove('is-visible', 'is-exit');
        toast.hidden = true;
        toast.setAttribute('aria-hidden', 'true');
        return;
    }
    if (toast.hidden) return;
    toast.classList.remove('is-visible');
    toast.classList.add('is-exit');
    googleMeetContextMessageHideTimer = window.setTimeout(() => {
        toast.classList.remove('is-exit');
        toast.hidden = true;
        toast.setAttribute('aria-hidden', 'true');
        googleMeetContextMessageHideTimer = null;
    }, 240);
}

function showGoogleMeetContextMessage(message, anchorEl) {
    const toast = document.getElementById('googleMeetContextMessage');
    if (!toast) return;
    hideGoogleMeetContextMessage(true);
    toast.textContent = String(message || '').trim();
    if (!toast.textContent) return;
    toast.hidden = false;
    toast.setAttribute('aria-hidden', 'false');
    toast.classList.remove('is-exit');

    const rect = anchorEl?.getBoundingClientRect?.();
    const pad = 10;
    const gap = 10;
    const top = rect ? Math.round(rect.top + (rect.height - toast.offsetHeight) / 2) : pad + 10;
    let left = rect ? rect.right + gap : window.innerWidth - toast.offsetWidth - pad;
    const maxTop = window.innerHeight - toast.offsetHeight - pad;
    const clampedTop = Math.min(Math.max(pad, top), Math.max(pad, maxTop));
    if (left < pad) left = pad;
    if (left + toast.offsetWidth > window.innerWidth - pad) {
        left = rect ? rect.left - toast.offsetWidth - gap : window.innerWidth - toast.offsetWidth - pad;
    }
    if (left < pad) {
        left = window.innerWidth - toast.offsetWidth - pad;
    }
    if (left < pad) {
        left = pad;
    }
    toast.style.top = `${Math.round(clampedTop)}px`;
    toast.style.left = `${Math.round(left)}px`;
    requestAnimationFrame(() => {
        toast.classList.add('is-visible');
    });
    googleMeetContextMessageTimer = window.setTimeout(() => {
        hideGoogleMeetContextMessage();
    }, 2000);
}

function findGoogleMeetStudentIndicator(studentName) {
    const name = String(studentName || '').trim();
    const list = document.getElementById('googleMeetStudentList');
    if (!name || !list) return null;
    const rows = list.querySelectorAll('.google-meet-student-row');
    for (const row of rows) {
        const label = row.querySelector('.google-meet-student-name');
        if (!label || String(label.textContent || '').trim() !== name) continue;
        return row.querySelector('.google-meet-student-save-indicator') || row.querySelector('.google-meet-student-meet-btn');
    }
    return null;
}

function closeGoogleMeetStudentLinkPopover() {
    if (googleMeetLinkPopoverEscapeHandler) {
        document.removeEventListener('keydown', googleMeetLinkPopoverEscapeHandler, true);
        googleMeetLinkPopoverEscapeHandler = null;
    }
    googleMeetLinkPopoverStudent = '';
    const pop = document.getElementById('googleMeetStudentLinkPopover');
    if (pop) {
        pop.classList.remove('google-meet-student-link-popover--enter');
        pop.hidden = true;
        pop.setAttribute('aria-hidden', 'true');
    }
}

function positionGoogleMeetStudentLinkPopover(anchorRef) {
    const pop = document.getElementById('googleMeetStudentLinkPopover');
    if (!pop || pop.hidden) return;
    // Respect CSS-driven positioning for this popup.
    pop.style.removeProperty('left');
    pop.style.removeProperty('top');
}

function openGoogleMeetStudentLinkPopover(studentName, anchorRef) {
    closeGoogleMeetStudentLinkPopover();
    const pop = document.getElementById('googleMeetStudentLinkPopover');
    const sub = document.getElementById('googleMeetStudentLinkPopoverStudentName');
    const input = document.getElementById('googleMeetStudentLinkPopoverInput');
    if (!pop || !sub || !input) return;
    googleMeetLinkPopoverStudent = String(studentName || '').trim();
    if (!googleMeetLinkPopoverStudent) return;
    sub.textContent = googleMeetLinkPopoverStudent;
    input.value = studentGoogleMeetLinksByName[googleMeetLinkPopoverStudent] || '';
    pop.classList.remove('google-meet-student-link-popover--enter');
    pop.hidden = false;
    pop.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        positionGoogleMeetStudentLinkPopover(anchorRef);
        requestAnimationFrame(() => {
            positionGoogleMeetStudentLinkPopover(anchorRef);
            if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
                void pop.offsetWidth;
                pop.classList.add('google-meet-student-link-popover--enter');
            }
            input.focus();
            if (typeof input.select === 'function') input.select();
        });
    });
    googleMeetLinkPopoverEscapeHandler = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeGoogleMeetStudentLinkPopover();
        }
    };
    document.addEventListener('keydown', googleMeetLinkPopoverEscapeHandler, true);
}

function openGoogleMeetStudentAccordion() {
    const panel = document.getElementById('googleMeetStudentPanel');
    const toggle = document.getElementById('googleMeetStudentToggle');
    const listWrap = document.getElementById('googleMeetStudentListWrap');
    if (!panel || !toggle || !listWrap || panel.hidden) return;
    toggle.setAttribute('aria-expanded', 'true');
    listWrap.classList.add('is-open');
    listWrap.setAttribute('aria-hidden', 'false');
}

function closeGoogleMeetStudentAccordion() {
    const toggle = document.getElementById('googleMeetStudentToggle');
    const listWrap = document.getElementById('googleMeetStudentListWrap');
    if (!toggle || !listWrap) return;
    toggle.setAttribute('aria-expanded', 'false');
    listWrap.classList.remove('is-open');
    listWrap.setAttribute('aria-hidden', 'true');
}

/** CSS animations often skip when `hidden` is cleared in the same frame; run after layout. */
function queueGoogleMeetStudentPanelEnter(panel) {
    if (!panel || panel.hidden) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const run = () => {
        panel.classList.remove('google-meet-student-panel--enter');
        void panel.offsetWidth;
        panel.classList.add('google-meet-student-panel--enter');
    };
    requestAnimationFrame(() => {
        requestAnimationFrame(run);
    });
}

function refreshGoogleMeetStudentPanel() {
    const panel = document.getElementById('googleMeetStudentPanel');
    const list = document.getElementById('googleMeetStudentList');
    const toggle = document.getElementById('googleMeetStudentToggle');
    const toggleText = document.getElementById('googleMeetStudentToggleText');
    const dialog = document.querySelector('#googleMeetModal .google-meet-dialog');
    if (!panel || !list || !toggle || !toggleText) return;

    const setGoogleMeetDialogWidth = (percent) => {
        if (!dialog) return;
        const p = Math.max(35, Math.min(78, Number(percent) || 35));
        dialog.style.setProperty('--google-meet-dialog-width', `${p}%`);
    };

    const school = String(googleMeetSelectedSchool || '').trim();
    const schoolKey = getGoogleMeetSchoolKey(school);
    googleMeetUseSharedSchoolLink = !!(schoolKey && googleMeetSharedLinkModeBySchoolKey[schoolKey]);
    const useShared = googleMeetUseSharedSchoolLink;
    if (!school) {
        setGoogleMeetDialogWidth(35);
        panel.hidden = true;
        panel.classList.remove('google-meet-student-panel--enter');
        delete panel.dataset.studentsSchool;
        googleMeetSelectedStudentNames.clear();
        closeGoogleMeetStudentAccordion();
        return;
    }

    if (useShared) {
        setGoogleMeetDialogWidth(35);
        panel.hidden = true;
        panel.classList.remove('google-meet-student-panel--enter');
        closeGoogleMeetStudentAccordion();
        return;
    }

    const prevSchool = panel.dataset.studentsSchool || '';
    const schoolChanged = prevSchool !== school;
    const wasHidden = panel.hidden;
    panel.dataset.studentsSchool = school;

    if (schoolChanged) {
        googleMeetSelectedStudentNames.clear();
    }

    panel.hidden = false;
    const names = getStudentNamesForSchool(school);
    const n = names.length;
    toggleText.textContent = n === 1 ? 'Students (1)' : `Students (${n})`;
    const getGoogleMeetStudentColumns = (count) => {
        const total = Number(count) || 0;
        if (total <= 5) return 1;
        if (total <= 8) return 2;
        if (total <= 11) return 3;
        if (total <= 14) return 4;
        return 5;
    };
    const getGoogleMeetColumnSizes = (count, columns) => {
        const total = Number(count) || 0;
        const cols = Math.max(1, Math.min(Number(columns) || 1, total || 1));
        const base = Math.floor(total / cols);
        const remainder = total % cols;
        return Array.from({ length: cols }, (_, idx) => base + (idx < remainder ? 1 : 0));
    };
    const columnCount = getGoogleMeetStudentColumns(n);
    const columnSizes = getGoogleMeetColumnSizes(n, columnCount);
    setGoogleMeetDialogWidth(35 + (columnCount - 1) * 10);
    list.style.setProperty('--google-meet-student-columns', String(columnCount));
    list.classList.toggle('is-multi-column', columnCount > 1);

    if (!schoolChanged && names.length > 0) {
        const nameSet = new Set(names);
        googleMeetSelectedStudentNames = new Set(
            [...googleMeetSelectedStudentNames].filter((x) => nameSet.has(x))
        );
    }

    const wasExpanded = toggle.getAttribute('aria-expanded') === 'true';

    list.innerHTML = '';
    const columnParents = columnCount > 1
        ? columnSizes.map(() => {
            const col = document.createElement('div');
            col.className = 'google-meet-student-column';
            list.appendChild(col);
            return col;
        })
        : [list];
    let currentColumnIndex = 0;
    let itemsInCurrentColumn = 0;
    if (names.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'google-meet-school-empty';
        empty.textContent = 'No students assigned to this school yet.';
        list.appendChild(empty);
    } else {
        names.forEach((name, index) => {
            const hasSavedMeet = !!String(studentGoogleMeetLinksByName[name] || '').trim();
            const row = document.createElement('div');
            row.className = `google-meet-student-row${googleMeetSelectedStudentNames.has(name) ? ' is-selected' : ''}${
                hasSavedMeet ? ' has-saved-meet-link' : ''
            }`;
            row.setAttribute('role', 'option');
            row.setAttribute('aria-selected', googleMeetSelectedStudentNames.has(name) ? 'true' : 'false');
            row.style.animationDelay = `${Math.min(index, 14) * 28}ms`;

            const nameP = document.createElement('p');
            nameP.className = 'google-meet-student-name';
            nameP.textContent = name;

            const statusWrap = document.createElement('span');
            statusWrap.className = `google-meet-student-save-indicator${hasSavedMeet ? ' is-saved' : ''}`;
            statusWrap.setAttribute('aria-hidden', 'true');

            const emptyLayer = document.createElement('span');
            emptyLayer.className = 'google-meet-student-save-indicator-layer google-meet-student-save-indicator-layer--empty';
            emptyLayer.innerHTML = GOOGLE_MEET_STUDENT_LINK_STATUS_EMPTY_SVG;

            const savedLayer = document.createElement('span');
            savedLayer.className = 'google-meet-student-save-indicator-layer google-meet-student-save-indicator-layer--saved';
            savedLayer.innerHTML = GOOGLE_MEET_STUDENT_LINK_STATUS_SAVED_SVG;

            statusWrap.appendChild(emptyLayer);
            statusWrap.appendChild(savedLayer);
            statusWrap.style.cursor = 'pointer';
            statusWrap.addEventListener('click', (ev) => {
                ev.stopPropagation();
                openGoogleMeetStudentLinkPopover(name, { x: ev.clientX, y: ev.clientY });
            });

            const meetBtn = document.createElement('button');
            meetBtn.type = 'button';
            meetBtn.className = 'google-meet-student-meet-btn';
            meetBtn.setAttribute('aria-label', `Google Meet link for ${name}`);
            meetBtn.innerHTML = SIDEBAR_GOOGLE_MEET_SVG;
            meetBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                openGoogleMeetStudentLinkPopover(name, { x: ev.clientX, y: ev.clientY });
            });

            row.addEventListener('click', (ev) => {
                if (ev.target.closest('.google-meet-student-meet-btn') || ev.target.closest('.google-meet-student-save-indicator')) {
                    return;
                }
                if (googleMeetSelectedStudentNames.has(name)) {
                    googleMeetSelectedStudentNames.delete(name);
                } else {
                    googleMeetSelectedStudentNames.add(name);
                }
                const on = googleMeetSelectedStudentNames.has(name);
                row.classList.toggle('is-selected', on);
                row.setAttribute('aria-selected', on ? 'true' : 'false');
            });

            row.appendChild(nameP);
            row.appendChild(meetBtn);
            row.appendChild(statusWrap);
            const targetColumn = columnParents[Math.min(currentColumnIndex, columnParents.length - 1)] || list;
            targetColumn.appendChild(row);
            itemsInCurrentColumn += 1;
            const currentTargetSize = columnSizes[currentColumnIndex] || 0;
            if (itemsInCurrentColumn >= currentTargetSize && currentColumnIndex < columnSizes.length - 1) {
                currentColumnIndex += 1;
                itemsInCurrentColumn = 0;
            }
        });
    }

    if (schoolChanged) {
        openGoogleMeetStudentAccordion();
    } else if (wasExpanded) {
        openGoogleMeetStudentAccordion();
    } else {
        closeGoogleMeetStudentAccordion();
    }

    if (wasHidden || schoolChanged) {
        queueGoogleMeetStudentPanelEnter(panel);
    }
}

function refreshGoogleMeetSchoolSelect(selectedSchool = '', animateLabel = false) {
    const schoolToggleText = document.getElementById('googleMeetSchoolToggleText');
    const schoolList = document.getElementById('googleMeetSchoolList');
    if (!schoolToggleText || !schoolList) {
        return;
    }
    const selected = String(selectedSchool || '').trim();
    const options = getAvailableSchoolNames();
    const hasSelected = options.includes(selected);
    googleMeetSelectedSchool = hasSelected ? selected : '';
    const selectedKey = getGoogleMeetSchoolKey(googleMeetSelectedSchool);
    googleMeetUseSharedSchoolLink = !!(selectedKey && googleMeetSharedLinkModeBySchoolKey[selectedKey]);
    setGoogleMeetToggleText(googleMeetSelectedSchool || 'Select a School', animateLabel);
    refreshGoogleMeetSharedSchoolPanel();

    schoolList.innerHTML = '';
    if (options.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'google-meet-school-empty';
        empty.textContent = 'No schools available';
        schoolList.appendChild(empty);
        refreshGoogleMeetStudentPanel();
        return;
    }

    options.forEach((school, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.type = 'button';
        optionBtn.className = `google-meet-school-option${school === googleMeetSelectedSchool ? ' is-selected' : ''}`;
        optionBtn.setAttribute('role', 'option');
        optionBtn.setAttribute('aria-selected', school === googleMeetSelectedSchool ? 'true' : 'false');
        optionBtn.style.animationDelay = `${index * 40}ms`;
        optionBtn.textContent = school;
        optionBtn.addEventListener('click', () => {
            googleMeetSelectedSchool = school;
            const schoolKey = getGoogleMeetSchoolKey(school);
            googleMeetUseSharedSchoolLink = !!(schoolKey && googleMeetSharedLinkModeBySchoolKey[schoolKey]);
            setGoogleMeetToggleText(school, true);
            window.setTimeout(() => {
                closeGoogleMeetSchoolAccordion();
                window.setTimeout(() => {
                    refreshGoogleMeetSchoolSelect(googleMeetSelectedSchool, false);
                }, 380);
            }, 220);
        });
        schoolList.appendChild(optionBtn);
    });
    refreshGoogleMeetStudentPanel();
}

function openGoogleMeetSchoolAccordion() {
    const toggle = document.getElementById('googleMeetSchoolToggle');
    const listWrap = document.getElementById('googleMeetSchoolListWrap');
    if (!toggle || !listWrap) return;
    toggle.setAttribute('aria-expanded', 'true');
    listWrap.classList.add('is-open');
    listWrap.setAttribute('aria-hidden', 'false');
}

function closeGoogleMeetSchoolAccordion() {
    const toggle = document.getElementById('googleMeetSchoolToggle');
    const listWrap = document.getElementById('googleMeetSchoolListWrap');
    if (!toggle || !listWrap) return;
    toggle.setAttribute('aria-expanded', 'false');
    listWrap.classList.remove('is-open');
    listWrap.setAttribute('aria-hidden', 'true');
}

function openGoogleMeetModal() {
    const modal = document.getElementById('googleMeetModal');
    const schoolToggle = document.getElementById('googleMeetSchoolToggle');
    if (!modal || !schoolToggle) {
        return;
    }
    googleMeetSelectedSchool = '';
    googleMeetUseSharedSchoolLink = false;
    googleMeetSelectedStudentNames.clear();
    closeGoogleMeetStudentLinkPopover();
    refreshGoogleMeetSchoolSelect();
    closeGoogleMeetSchoolAccordion();
    openModalWithAnimation(modal);
    schoolToggle.focus();
}

function closeGoogleMeetModal() {
    const modal = document.getElementById('googleMeetModal');
    if (!modal) {
        return;
    }
    hideGoogleMeetContextMessage(true);
    closeGoogleMeetStudentLinkPopover();
    closeGoogleMeetSchoolAccordion();
    closeGoogleMeetStudentAccordion();
    closeModalWithAnimation(modal);
}

function setupGoogleMeetModal() {
    const modal = document.getElementById('googleMeetModal');
    const form = document.getElementById('googleMeetForm');
    const backdrop = document.getElementById('googleMeetModalBackdrop');
    const cancelBtn = document.getElementById('googleMeetCancel');
    const schoolToggle = document.getElementById('googleMeetSchoolToggle');
    const listWrap = document.getElementById('googleMeetSchoolListWrap');
    const studentToggle = document.getElementById('googleMeetStudentToggle');
    const studentListWrap = document.getElementById('googleMeetStudentListWrap');
    const sharedSchoolCheckbox = document.getElementById('googleMeetSharedSchoolCheckbox');
    const sharedSchoolInput = document.getElementById('googleMeetSharedSchoolInput');
    const sharedSchoolSave = document.getElementById('googleMeetSharedSchoolSave');

    if (!modal || !form || !schoolToggle || !listWrap) {
        return;
    }

    backdrop?.addEventListener('click', closeGoogleMeetModal);
    cancelBtn?.addEventListener('click', closeGoogleMeetModal);
    schoolToggle.addEventListener('click', () => {
        const isOpen = schoolToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeGoogleMeetSchoolAccordion();
        } else {
            openGoogleMeetSchoolAccordion();
        }
    });
    studentToggle?.addEventListener('click', () => {
        const isOpen = studentToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeGoogleMeetStudentAccordion();
        } else {
            openGoogleMeetStudentAccordion();
        }
    });
    sharedSchoolCheckbox?.addEventListener('change', () => {
        googleMeetUseSharedSchoolLink = !!sharedSchoolCheckbox.checked;
        const schoolKey = getGoogleMeetSchoolKey(googleMeetSelectedSchool);
        if (schoolKey) {
            googleMeetSharedLinkModeBySchoolKey[schoolKey] = !!googleMeetUseSharedSchoolLink;
            saveRoster();
        }
        refreshGoogleMeetSharedSchoolPanel();
        refreshGoogleMeetStudentPanel();
        if (googleMeetUseSharedSchoolLink) {
            closeGoogleMeetStudentLinkPopover();
            if (!sharedSchoolInput?.hidden) sharedSchoolInput?.focus();
        }
    });
    sharedSchoolSave?.addEventListener('click', () => {
        const school = String(googleMeetSelectedSchool || '').trim();
        if (!school) return;
        const raw = String(sharedSchoolInput?.value || '').trim();
        if (raw && !isPlausibleGoogleMeetUrl(raw)) {
            showAppMessage('Enter a valid Google Meet link (e.g. meet.google.com or meet.app).');
            sharedSchoolInput?.focus();
            return;
        }
        const names = getStudentNamesForSchool(school);
        if (names.length === 0) {
            showAppMessage('No students found for this school.');
            return;
        }
        if (!raw) {
            names.forEach((name) => {
                delete studentGoogleMeetLinksByName[name];
            });
        } else {
            const normalized = normalizeGoogleMeetUrl(raw);
            names.forEach((name) => {
                studentGoogleMeetLinksByName[name] = normalized;
            });
        }
        saveRoster();
        refreshGoogleMeetStudentPanel();
        showGoogleMeetContextMessage(raw ? 'Meet link saved.' : 'Meet link cleared.', sharedSchoolSave);
    });
    sharedSchoolInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sharedSchoolSave?.click();
        }
    });
    modal.addEventListener('click', (e) => {
        const linkPopover = document.getElementById('googleMeetStudentLinkPopover');
        if (linkPopover && !linkPopover.hidden && linkPopover.contains(e.target)) {
            return;
        }
        const inSchool =
            e.target === schoolToggle || schoolToggle.contains(e.target) || listWrap.contains(e.target);
        if (!inSchool) {
            closeGoogleMeetSchoolAccordion();
        }
        const studentPanel = document.getElementById('googleMeetStudentPanel');
        if (studentToggle && studentListWrap && studentPanel && !studentPanel.hidden) {
            const inStudent =
                e.target === studentToggle ||
                studentToggle.contains(e.target) ||
                studentListWrap.contains(e.target);
            if (!inStudent) {
                closeGoogleMeetStudentAccordion();
            }
        }
    });

    const linkPopover = document.getElementById('googleMeetStudentLinkPopover');
    const linkInput = document.getElementById('googleMeetStudentLinkPopoverInput');
    const linkCancel = document.getElementById('googleMeetStudentLinkPopoverCancel');
    const linkSave = document.getElementById('googleMeetStudentLinkPopoverSave');
    linkPopover?.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    linkCancel?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeGoogleMeetStudentLinkPopover();
    });
    linkSave?.addEventListener('click', (e) => {
        e.stopPropagation();
        const student = String(googleMeetLinkPopoverStudent || '').trim();
        if (!student) return;
        const raw = String(linkInput?.value || '').trim();
        if (raw && !isPlausibleGoogleMeetUrl(raw)) {
            showAppMessage('Enter a valid Google Meet link (e.g. meet.google.com or meet.app).');
            linkInput?.focus();
            return;
        }
        if (!raw) {
            delete studentGoogleMeetLinksByName[student];
        } else {
            studentGoogleMeetLinksByName[student] = normalizeGoogleMeetUrl(raw);
        }
        saveRoster();
        if (raw) {
            animateGoogleMeetSaveButtonOk();
        }
        closeGoogleMeetStudentLinkPopover();
        refreshGoogleMeetStudentPanel();
        if (raw) {
            const anchor = findGoogleMeetStudentIndicator(student);
            showGoogleMeetContextMessage('Meet link saved.', anchor);
        }
    });
    linkInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            linkSave?.click();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolName = String(googleMeetSelectedSchool || '').trim();
        if (!schoolName) {
            showAppMessage("Please select the school's name.");
            schoolToggle.focus();
            return;
        }
        closeGoogleMeetModal();
        window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
    });
}

function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (!modal) {
        return;
    }
    closeAddSchoolColorPopup();
    closeModalWithAnimation(modal);
}

function setupAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    const form = document.getElementById('addStudentForm');
    const cancelBtn = document.getElementById('addStudentCancel');
    const backdrop = document.getElementById('addStudentModalBackdrop');
    const schoolInput = document.getElementById('addStudentSchool');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');

    if (!modal || !form) {
        return;
    }

    populateAddStudentPhoneCountrySelect();
    updateAddStudentPhonePlaceholder();

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeAddStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeAddStudentModal());
    }
    schoolInput?.addEventListener('input', updateAddStudentPassportFieldVisibility);
    phoneCountrySelect?.addEventListener('change', updateAddStudentPhonePlaceholder);

    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const addSchoolExternalOffsite = document.getElementById('addSchoolExternalOffsite');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    const addSchoolPrimarySquare = document.querySelector('.add-school-theme-square--primary');
    const addSchoolSecondarySquare = document.querySelector('.add-school-theme-square--secondary');
    const addSchoolColorPopup = document.getElementById('addSchoolColorPopup');
    addSchoolExternalCheckbox?.addEventListener('change', () => {
        const on = !!addSchoolExternalCheckbox.checked;
        if (addSchoolExternalPanel) {
            addSchoolExternalPanel.classList.toggle('is-collapsed', !on);
            addSchoolExternalPanel.setAttribute('aria-hidden', on ? 'false' : 'true');
        }
        if (on) {
            window.setTimeout(() => addSchoolExternalUrl?.focus(), 220);
        } else {
            addSchoolExternalUrl?.blur();
        }
    });
    addSchoolExternalOffsite?.addEventListener('click', () => {
        const parsed = parseHttpUrlInput(addSchoolExternalUrl?.value || '');
        if (parsed.error && parsed.error !== 'empty') {
            alert('Please provide a valid URL link.');
            addSchoolExternalUrl?.focus();
            return;
        }
        if (parsed.error === 'empty' || !parsed.url) {
            alert('Paste the spreadsheet or external URL first.');
            addSchoolExternalUrl?.focus();
            return;
        }
        window.open(parsed.url, '_blank', 'noopener,noreferrer');
    });
    addSchoolPrimarySquare?.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddSchoolColorPopup('primary', addSchoolPrimarySquare);
    });
    addSchoolSecondarySquare?.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddSchoolColorPopup('secondary', addSchoolSecondarySquare);
    });
    addSchoolColorPopup?.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => {
        if (!modal.classList.contains('is-open')) return;
        closeAddSchoolColorPopup();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const first = document.getElementById('addStudentFirst')?.value || '';
        const last = document.getElementById('addStudentLast')?.value || '';
        if (addStudentModalMode === 'teacher') {
            const email = document.getElementById('addTeacherEmail')?.value || '';
            const password = document.getElementById('addTeacherPassword')?.value || '';
            addTeacherFromForm(first, last, email, password);
            return;
        }
        if (addStudentModalMode === 'student-entry') {
            addStudentToSchoolFromForm(first, last, addStudentTargetSchool);
            return;
        }
        if (addStudentModalMode === 'student-global') {
            const schoolName = document.getElementById('addStudentSchoolSelect')?.value || '';
            addStudentToSchoolFromForm(first, last, schoolName);
            return;
        }
        const school = document.getElementById('addStudentSchool').value;
        addSchoolFromForm(
            school,
            addSchoolPrimaryColor?.value || '#5c6bc0',
            addSchoolSecondaryColor?.value || '#1e88e5'
        );
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeAddSchoolColorPopup();
            closeAddStudentModal();
        }
    });
}

// Save current schedule to teacherSchedules
function saveTeacherSchedule(teacherName) {
    if (!teacherName) return;
    const copy = { ...slotStates };
    if (isActiveTeacherName(teacherName)) {
        teacherSchedules[teacherName] = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(copy);
    } else {
        teacherSchedules[teacherName] = mergeSpeakonWeeklyClassIntoScheduleCopy(copy, teacherName);
        syncSpeakOnWeeklyToAllTeacherSchedules();
    }
    // Save to Cloudflare (will also save to localStorage as backup)
    saveAllSchedules();
}

// Load schedule from teacherSchedules
function loadTeacherSchedule(teacherName) {
    const raw = teacherSchedules[teacherName] ? { ...teacherSchedules[teacherName] } : {};
    if (isActiveTeacherName(teacherName)) {
        slotStates = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(raw);
        teacherSchedules[teacherName] = { ...slotStates };
    } else {
        slotStates = mergeSpeakonWeeklyClassIntoScheduleCopy(raw, teacherName);
    }
}

function initCalendarHeaderToolbar() {
    const corner = document.getElementById('calendarHeaderCorner');
    if (!corner || corner.querySelector('#calendarToolbarStudentsBtn')) {
        return;
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'time-slot-toolbar calendar-header-toolbar-inner';

    const btnCalendar = document.createElement('button');
    btnCalendar.type = 'button';
    btnCalendar.className = 'calendar-toolbar-btn calendar-toolbar-btn--calendar calendar-toolbar-btn--on-blue';
    btnCalendar.id = 'calendarToolbarCalendarBtn';
    btnCalendar.title = 'Show calendar';
    btnCalendar.setAttribute('aria-label', 'Show calendar');
    btnCalendar.innerHTML = CALENDAR_TOOLBAR_CALENDAR_SVG;

    const btnStudents = document.createElement('button');
    btnStudents.type = 'button';
    btnStudents.className = 'calendar-toolbar-btn calendar-toolbar-btn--students calendar-toolbar-btn--on-blue';
    btnStudents.id = 'calendarToolbarStudentsBtn';
    btnStudents.title = 'Show student names';
    btnStudents.setAttribute('aria-label', 'Show student names');
    btnStudents.setAttribute('aria-pressed', 'false');
    btnStudents.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="calendar-toolbar-icon" aria-hidden="true">' +
        '<path fill-rule="evenodd" d="M1 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V6Zm4 1.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2 3a4 4 0 0 0-3.665 2.395.75.75 0 0 0 .416 1A8.98 8.98 0 0 0 7 14.5a8.98 8.98 0 0 0 3.249-.604.75.75 0 0 0 .416-1.001A4.001 4.001 0 0 0 7 10.5Zm5-3.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm0 6.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Zm.75-4a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clip-rule="evenodd" />' +
        '</svg>';

    const btnClear = document.createElement('button');
    btnClear.type = 'button';
    btnClear.className = 'calendar-toolbar-btn calendar-toolbar-btn--clear calendar-toolbar-btn--on-blue';
    btnClear.id = 'calendarToolbarClearAllBtn';
    btnClear.title = 'Clear all slots';
    btnClear.setAttribute('aria-label', 'Clear all slots');
    btnClear.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="calendar-toolbar-icon" aria-hidden="true">' +
        '<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />' +
        '</svg>';

    toolbar.appendChild(btnCalendar);
    toolbar.appendChild(btnStudents);
    toolbar.appendChild(btnClear);
    corner.appendChild(toolbar);

    btnCalendar.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeCalendarStudentNamesPopover();
        if (String(calendarToolbarExternalLink || '').trim()) {
            closeCalendarLinkPopover();
            window.open(calendarToolbarExternalLink, '_blank', 'noopener,noreferrer');
            return;
        }
        openCalendarLinkPopover(btnCalendar);
    });
    btnCalendar.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCalendarLinkPopover(btnCalendar);
    });
    btnStudents.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeCalendarLinkPopover();
        toggleCalendarStudentNamesPopover(btnStudents);
    });
    btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeCalendarStudentNamesPopover();
        closeCalendarLinkPopover();
        clearAll();
    });
}

// Initialize the calendar
function initCalendar() {
    const timeSlotsContainer = document.getElementById('timeSlots');

    initCalendarHeaderToolbar();

    // Initialize context menu
    contextMenu = document.getElementById('contextMenu');
    applyCalendarStatePaletteCssVars();
    refreshContextMenuTheme();

    // Generate time slots for each hour
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
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
                if (e.button === 0 || !e.button) {
                    cycleSlotState(day, hour);
                }
            });

            // Right click: show context menu
            slot.addEventListener('contextmenu', (e) => {
                if (!isCustomContextMenuEnabledForCurrentSelection()) {
                    hideContextMenu();
                    return;
                }
                e.preventDefault();
                showContextMenu(e, day, hour);
            });

            timeSlotsContainer.appendChild(slot);
        });
    }

    setupCalendarStudentPopoverDismiss();

    // Close context menu when clicking elsewhere
    document.addEventListener('click', () => {
        hideContextMenu();
    });

    // Handle context menu item clicks (delegated; menu rows are rebuilt dynamically)
    contextMenu?.addEventListener('click', (e) => {
        const item = e.target.closest('.context-menu-item');
        if (!item || !contextMenu.contains(item)) return;
        const color = item.dataset.color;
        if (currentSlot) {
            setSlotState(currentSlot.day, currentSlot.hour, color || null);
            hideContextMenu();
        }
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
                applyStateVisualToSlot(slot, state);
                renderStudentNamesInSlot(slot, day, hour, state);
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
    
    if (state) {
        slotStates[key] = state;
    } else {
        slotStates[key] = null;
    }
    applyStateVisualToSlot(slot, state);
    renderStudentNamesInSlot(slot, day, hour, state);
    
    // Save to teacher schedule and localStorage
    saveTeacherSchedule(currentTeacher);
    
    updateSummary();
}

// Cycle through states on left click: null <-> available
function cycleSlotState(day, hour) {
    if (!currentTeacher) return;
    
    const currentState = getSlotState(day, hour);
    const currentIndex = STATE_CYCLE.indexOf(currentState);
    const nextState = currentIndex === -1
        ? 'available'
        : STATE_CYCLE[(currentIndex + 1) % STATE_CYCLE.length];
    
    setSlotState(day, hour, nextState);
}

// Show context menu on right click
function showContextMenu(event, day, hour) {
    if (!currentTeacher) return;
    
    currentSlot = { day, hour };
    refreshContextMenuTheme();
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

function getContextMenuSchoolConfig() {
    let schoolTitle = 'HomeTeachers';
    if (currentTeacher && isStudentName(currentTeacher)) {
        schoolTitle = getStudentSchoolName(currentTeacher) || 'HomeTeachers';
    }
    const classState = makeSchoolStateToken(schoolTitle, 'class');
    const extraState = makeSchoolStateToken(schoolTitle, 'extra');
    const theme = getSchoolTheme(schoolTitle);
    return {
        classState,
        extraState,
        classColor: theme.primary,
        extraColor: theme.secondary
    };
}

function getCalendarStatePaletteByContext() {
    const getSchoolForKindInTeacherView = (kind) => {
        const defaultSchool = kind === 'passport' ? 'Passport' : (kind === 'speakon' ? 'SpeakOn' : 'HomeTeachers');
        if (!currentTeacher || !isActiveTeacherName(currentTeacher)) return defaultSchool;
        const teacherSched = teacherSchedules[currentTeacher] || {};
        const relevantStudents = kind === 'passport'
            ? passportStudentsList
            : (kind === 'speakon' ? speakonStudentsList : privateStudentsList);
        const statePair = kind === 'passport'
            ? { classState: 'special', extraState: '' }
            : (kind === 'speakon' ? { classState: 'magenta', extraState: 'salmon' } : { classState: 'navy', extraState: 'cyan' });
        const teacherStateKeys = Object.entries(teacherSched)
            .filter(([, v]) => {
                const val = String(v || '');
                return val === statePair.classState || (!!statePair.extraState && val === statePair.extraState);
            })
            .map(([k]) => k);
        if (teacherStateKeys.length === 0) return defaultSchool;
        const contributing = relevantStudents.find((studentName) => {
            const st = teacherSchedules[studentName] || {};
            return teacherStateKeys.some((key) => {
                const val = String(st[key] || '');
                return val === statePair.classState || (!!statePair.extraState && val === statePair.extraState);
            });
        });
        return (contributing && getStudentSchoolName(contributing)) || defaultSchool;
    };
    const homeTheme = getSchoolTheme(getSchoolForKindInTeacherView('private'));
    const speakTheme = getSchoolTheme(getSchoolForKindInTeacherView('speakon'));
    const passportTheme = getSchoolTheme(getSchoolForKindInTeacherView('passport'));
    const palette = {
        navy: homeTheme.primary,
        cyan: homeTheme.secondary,
        magenta: speakTheme.primary,
        salmon: speakTheme.secondary,
        special: passportTheme.primary
    };
    if (currentTeacher && isStudentName(currentTeacher)) {
        const schoolTitle = getStudentSchoolName(currentTeacher) || 'HomeTeachers';
        const schoolTheme = getSchoolTheme(schoolTitle);
        const states = getStudentOverlayStates(currentTeacher);
        if (states.classState) palette[states.classState] = schoolTheme.primary;
        if (states.extraState) palette[states.extraState] = schoolTheme.secondary;
    }
    return palette;
}

function applyCalendarStatePaletteCssVars() {
    const root = document.documentElement;
    if (!root) return;
    const palette = getCalendarStatePaletteByContext();
    ['navy', 'cyan', 'magenta', 'salmon', 'special'].forEach((state) => {
        const color = String(palette[state] || '').trim().toLowerCase();
        if (!/^#[0-9a-f]{6}$/i.test(color)) return;
        root.style.setProperty(`--slot-state-${state}-bg`, color);
        root.style.setProperty(`--slot-state-${state}-border`, color);
        root.style.setProperty(`--slot-state-${state}-shadow`, rgbaFromHex(color, 0.4));
    });
}

function refreshContextMenuTheme() {
    if (!contextMenu) return;
    const cfg = getContextMenuSchoolConfig();
    const selectedState = currentSlot ? getSlotState(currentSlot.day, currentSlot.hour) : null;
    const classChecked = selectedState === cfg.classState;
    const extraChecked = selectedState === cfg.extraState;
    contextMenu.innerHTML = `
        <div class="context-menu-row">
            <button type="button" class="context-menu-item context-menu-item--compact" data-color="${cfg.classState}">
                <span class="context-menu-checkbox${classChecked ? ' is-checked' : ''}" aria-hidden="true"></span>
                <span class="context-menu-label">Class</span>
            </button>
            <span class="context-menu-divider" aria-hidden="true"></span>
            <button type="button" class="context-menu-item context-menu-item--compact" data-color="${cfg.extraState}">
                <span class="context-menu-checkbox${extraChecked ? ' is-checked' : ''}" aria-hidden="true"></span>
                <span class="context-menu-label">Extra/Reposition</span>
            </button>
        </div>
    `;
    const rows = contextMenu.querySelectorAll('.context-menu-item');
    if (rows[0]) rows[0].style.setProperty('--menu-option-color', cfg.classColor);
    if (rows[1]) rows[1].style.setProperty('--menu-option-color', cfg.extraColor);
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
                slotStates[key] = 'available';
                applyStateVisualToSlot(slot, 'available');
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
                slotStates[key] = null;
                applyStateVisualToSlot(slot, null);
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
    setupAppMessageModal();
    setupPasswordToggles();
    setupSidebarProfileAvatarUpload();
    setupTeacherLoginModal();
    initCalendar();
    if (currentTeacher) {
        refreshCalendarDisplay();
        updateSummary();
    }
    setupAddStudentModal();
    setupGoogleMeetModal();
    setupEditStudentModal();
    setupSchoolSettingsModal();
    setupDeleteSchoolModal();
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