// Configuration
const START_HOUR = 7; // 7 AM
const END_HOUR = 23; // 11 PM (exclusive, includes 10 PM slot)
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// LocalStorage key (fallback)
const STORAGE_KEY = 'timetable_schedules';
/** Set after local schedule edits until `performSave` confirms KV write (avoids stale cloud wiping a fast refresh). */
const SCHEDULE_PENDING_CLOUD_UPLOAD_KEY = 'timetable_schedule_pending_cloud_upload';
const ROSTER_STORAGE_KEY = 'timetable_roster';
const CLASS_REPORT_ROWS_KEY = 'timetable_student_class_report_rows';
const LEGACY_CLASS_REPORT_UPLOADS_LS_KEY = 'timetable_student_class_report_uploads';
/** Persisted KV `lastUpdated` for `/api/class-report-uploads` so reloads compare revisions (deletions propagate). */
const CLASS_REPORT_UPLOADS_CLOUD_TS_STORAGE_KEY = 'timetable_class_report_uploads_cloud_updated';
const CLASS_REPORT_UPLOADS_API_ENDPOINT = '/api/class-report-uploads';

try {
    if (typeof ClassReportUploadsStore !== 'undefined') {
        ClassReportUploadsStore.purgeLegacyUploadDatabase('timetable_student_class_report_uploads_db');
    }
    localStorage.removeItem(LEGACY_CLASS_REPORT_UPLOADS_LS_KEY);
} catch (_) {
    /* ignore */
}
const LOGIN_CREDENTIALS_STORAGE_KEY = 'timetable_saved_login_credentials';
/** Session bearer for `/api/*` when Cloudflare `TIMETABLE_AUTH_SECRET` is configured (teacher-scoped roster/schedules/uploads). */
const API_BEARER_TOKEN_STORAGE_KEY = 'timetable_api_bearer_token';
/** When set in sessionStorage, skip auto-login until the next successful manual login (same tab). */
const LOGIN_SESSION_SUPPRESS_KEY = 'timetable_teacher_session_suppressed';
const ADMIN_LOGIN_SESSION_KEY = 'timetable_admin_login_complete';
/** Bumped in localStorage on logout so other tabs/windows receive `storage` and sign out too. */
const LOGOUT_BROADCAST_STORAGE_KEY = 'timetable_logout_broadcast_ts';
/** Session: auto popup for pending data-share invites was already shown for these link ids. */
const SUPERVISION_NOTICE_SESSION_KEY = 'timetable_supervision_invite_notice_shown_ids';
const ADMIN_ACCOUNT_STORAGE_KEY = 'timetable_admin_account';
const DEFAULT_ADMIN_USERNAME = 'admin_';
const DEFAULT_ADMIN_PASSWORD = '@Admin';
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
    { iso: 'BR', flag: '🇧🇷', name: 'Brazil', dialCode: '+55', sample: '(__) _____-____' },
    { iso: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1', sample: '(___) ___-____' },
    { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44', sample: '____ ______' },
    { iso: 'IE', flag: '🇮🇪', name: 'Ireland', dialCode: '+353', sample: '__ ___ ____' },
    { iso: 'CA', flag: '🇨🇦', name: 'Canada', dialCode: '+1', sample: '(___) ___-____' }
];
const DEFAULT_PHONE_COUNTRY_ISO = 'BR';
const BRAZIL_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cmask%20id%3D%22circleFlagsBr0%22%3E%3Ccircle%20cx%3D%22256%22%20cy%3D%22256%22%20r%3D%22256%22%20fill%3D%22%23fff%22/%3E%3C/mask%3E%3Cg%20mask%3D%22url(%23circleFlagsBr0)%22%3E%3Cpath%20fill%3D%22%236da544%22%20d%3D%22M0%200h512v512H0z%22/%3E%3Cpath%20fill%3D%22%23ffda44%22%20d%3D%22M256%20100.2L467.5%20256L256%20411.8L44.5%20256z%22/%3E%3Cpath%20fill%3D%22%23eee%22%20d%3D%22M174.2%20221a87%2087%200%200%200-7.2%2036.3l162%2049.8a88.5%2088.5%200%200%200%2014.4-34c-40.6-65.3-119.7-80.3-169.1-52z%22/%3E%3Cpath%20fill%3D%22%230052b4%22%20d%3D%22M255.7%20167a89%2089%200%200%200-41.9%2010.6a89%2089%200%200%200-39.6%2043.4a181.7%20181.7%200%200%201%20169.1%2052.2a89%2089%200%200%200-9-59.4a89%2089%200%200%200-78.6-46.8zM212%20250.5a149%20149%200%200%200-45%206.8a89%2089%200%200%200%2010.5%2040.9a89%2089%200%200%200%20120.6%2036.2a89%2089%200%200%200%2030.7-27.3A151%20151%200%200%200%20212%20250.5z%22/%3E%3C/g%3E%3C/svg%3E';
const IRELAND_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cmask%20id%3D%22circleFlagsCi0%22%3E%3Ccircle%20cx%3D%22256%22%20cy%3D%22256%22%20r%3D%22256%22%20fill%3D%22%23fff%22/%3E%3C/mask%3E%3Cg%20mask%3D%22url(%23circleFlagsCi0)%22%3E%3Cpath%20fill%3D%22%23eee%22%20d%3D%22M167%200h178l31%20253.2L345%20512H167l-33.4-257.4z%22/%3E%3Cpath%20fill%3D%22%23ff9811%22%20d%3D%22M0%200h167v512H0z%22/%3E%3Cpath%20fill%3D%22%236da544%22%20d%3D%22M345%200h167v512H345z%22/%3E%3C/g%3E%3C/svg%3E';
const UNITED_KINGDOM_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cmask%20id%3D%22circleFlagsEn0%22%3E%3Ccircle%20cx%3D%22256%22%20cy%3D%22256%22%20r%3D%22256%22%20fill%3D%22%23fff%22/%3E%3C/mask%3E%3Cg%20mask%3D%22url(%23circleFlagsEn0)%22%3E%3Cpath%20fill%3D%22%23eee%22%20d%3D%22m0%200l8%2022l-8%2023v23l32%2054l-32%2054v32l32%2048l-32%2048v32l32%2054l-32%2054v68l22-8l23%208h23l54-32l54%2032h32l48-32l48%2032h32l54-32l54%2032h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22%208l-23-8h-23l-54%2032l-54-32h-32l-48%2032l-48-32h-32l-54%2032L68%200z%22/%3E%3Cpath%20fill%3D%22%230052b4%22%20d%3D%22M336%200v108L444%200Zm176%2068L404%20176h108zM0%20176h108L0%2068ZM68%200l108%20108V0Zm108%20512V404L68%20512ZM0%20444l108-108H0Zm512-108H404l108%20108Zm-68%20176L336%20404v108z%22/%3E%3Cpath%20fill%3D%22%23d80027%22%20d%3D%22M0%200v45l131%20131h45zm208%200v208H0v96h208v208h96V304h208v-96H304V0zm259%200L336%20131v45L512%200zM176%20336L0%20512h45l131-131zm160%200l176%20176v-45L381%20336z%22/%3E%3C/g%3E%3C/svg%3E';
const UNITED_STATES_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2036%2036%22%3E%3Cpath%20fill%3D%22%23B22334%22%20d%3D%22M35.445%207C34.752%205.809%2033.477%205%2032%205H18v2h17.445zM0%2025h36v2H0zm18-8h18v2H18zm0-4h18v2H18zM0%2021h36v2H0zm4%2010h28c1.477%200%202.752-.809%203.445-2H.555c.693%201.191%201.968%202%203.445%202zM18%209h18v2H18z%22/%3E%3Cpath%20fill%3D%22%23EEE%22%20d%3D%22M.068%2027.679c.017.093.036.186.059.277c.026.101.058.198.092.296c.089.259.197.509.333.743L.555%2029h34.89l.002-.004a4.22%204.22%200%200%200%20.332-.741a3.75%203.75%200%200%200%20.152-.576c.041-.22.069-.446.069-.679H0c0%20.233.028.458.068.679zM0%2023h36v2H0zm0-4v2h36v-2H18zm18-4h18v2H18zm0-4h18v2H18zM0%209zm.555-2l-.003.005L.555%207zM.128%208.044c.025-.102.06-.199.092-.297a3.78%203.78%200%200%200-.092.297zM18%209h18c0-.233-.028-.459-.069-.68a3.606%203.606%200%200%200-.153-.576A4.21%204.21%200%200%200%2035.445%207H18v2z%22/%3E%3Cpath%20fill%3D%22%233C3B6E%22%20d%3D%22M18%205H4a4%204%200%200%200-4%204v10h18V5z%22/%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M2.001%207.726l.618.449l-.236.725L3%208.452l.618.448l-.236-.725L4%207.726h-.764L3%207l-.235.726zm2%202l.618.449l-.236.725l.617-.448l.618.448l-.236-.725L6%209.726h-.764L5%209l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9%209l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13%209l-.235.726zm-8%204l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L5%2013l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L9%2013l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L13%2013l-.235.726zm-6-6l.618.449l-.236.725L7%208.452l.618.448l-.236-.725L8%207.726h-.764L7%207l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11%207l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15%207l-.235.726zm-12%204l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3%2011l-.235.726zM6.383%2012.9L7%2012.452l.618.448l-.236-.725l.618-.449h-.764L7%2011l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11%2011l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15%2011l-.235.726zm-12%204l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L3%2015l-.235.726zM6.383%2016.9L7%2016.452l.618.448l-.236-.725l.618-.449h-.764L7%2015l-.235.726h-.764l.618.449zm3.618-1.174l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L11%2015l-.235.726zm4%200l.618.449l-.236.725l.617-.448l.618.448l-.236-.725l.618-.449h-.764L15%2015l-.235.726z%22/%3E%3C/svg%3E';
const CANADA_FLAG_SVG_DATA_URI = 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20512%20512%22%3E%3Cmask%20id%3D%22circleFlagsCa0%22%3E%3Ccircle%20cx%3D%22256%22%20cy%3D%22256%22%20r%3D%22256%22%20fill%3D%22%23fff%22/%3E%3C/mask%3E%3Cg%20mask%3D%22url(%23circleFlagsCa0)%22%3E%3Cpath%20fill%3D%22%23d80027%22%20d%3D%22M0%200v512h144l112-64l112%2064h144V0H368L256%2064L144%200Z%22/%3E%3Cpath%20fill%3D%22%23eee%22%20d%3D%22M144%200h224v512H144Z%22/%3E%3Cpath%20fill%3D%22%23d80027%22%20d%3D%22m301%20289l44-22l-22-11v-22l-45%2022l23-44h-23l-22-34l-22%2033h-23l23%2045l-45-22v22l-22%2011l45%2022l-12%2023h45v33h22v-33h45z%22/%3E%3C/g%3E%3C/svg%3E';
const PHONE_COUNTRY_FLAG_DATA_URIS = {
    BR: BRAZIL_FLAG_SVG_DATA_URI,
    US: UNITED_STATES_FLAG_SVG_DATA_URI,
    GB: UNITED_KINGDOM_FLAG_SVG_DATA_URI,
    IE: IRELAND_FLAG_SVG_DATA_URI,
    CA: CANADA_FLAG_SVG_DATA_URI
};

function getPhoneCountryFlagImageSrc(countryIso) {
    const iso = String(countryIso || '').trim().toUpperCase();
    return PHONE_COUNTRY_FLAG_DATA_URIS[iso] || BRAZIL_FLAG_SVG_DATA_URI;
}

function getPhoneCountryByIso(countryIso) {
    const iso = String(countryIso || '').trim().toUpperCase();
    return PHONE_COUNTRY_OPTIONS.find((item) => item.iso === iso)
        || PHONE_COUNTRY_OPTIONS.find((item) => item.iso === DEFAULT_PHONE_COUNTRY_ISO)
        || PHONE_COUNTRY_OPTIONS[0]
        || null;
}

const PHONE_RESIDENCE_COUNTRY_DATALIST_ID = 'phoneResidenceCountryNames';

function isPhoneCountrySelectorAlwaysInteractive(countrySelect) {
    if (!countrySelect || !countrySelect.id) return false;
    const id = countrySelect.id;
    return id === 'addStudentPhoneCountry' || id === 'addTeacherPhoneCountry' || id === 'editStudentPhoneCountry';
}

function getPreferredStudentPhoneCountryOptions() {
    const preferred = new Set(['BR', 'IE', 'GB', 'US', 'CA']);
    const filtered = PHONE_COUNTRY_OPTIONS.filter((country) => preferred.has(String(country.iso || '').toUpperCase()));
    return filtered.length > 0 ? filtered : PHONE_COUNTRY_OPTIONS;
}

function ensurePhoneResidenceCountryDatalist() {
    if (document.getElementById(PHONE_RESIDENCE_COUNTRY_DATALIST_ID)) return;
    const dl = document.createElement('datalist');
    dl.id = PHONE_RESIDENCE_COUNTRY_DATALIST_ID;
    PHONE_COUNTRY_OPTIONS.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.name;
        dl.appendChild(opt);
    });
    document.body.appendChild(dl);
}

function resetPhoneCountryDialSyncState(countryInput) {
    if (!countryInput || !countryInput.dataset) return;
    delete countryInput.dataset.phoneDialIsoForCountry;
}

/** When the dial-code ISO changes, set residence country name to match; do not overwrite on every phone keystroke. */
function syncResidenceCountryInputToDialCode(countryInput, countrySelect) {
    if (!countryInput || !countrySelect) return;
    const dialIso = String(countrySelect.value || '').trim().toUpperCase();
    const prev = String(countryInput.dataset.phoneDialIsoForCountry || '').trim().toUpperCase();
    if (dialIso === prev) return;
    const picked = getPhoneCountryByIso(dialIso);
    if (picked) countryInput.value = picked.name;
    countryInput.dataset.phoneDialIsoForCountry = dialIso;
}

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
/** Display / assignment: instructor name per student (optional). */
let studentTeacherByName = {};
/** Optional account / location fields for roster students (persisted with roster). */
let studentEmailsByName = {};
/** Maps legacy login keys (lowercase) to canonical usernames after email→username migration. */
let authLoginAliasesByKey = {};
let studentUsernamesByName = {};
let studentPasswordsByName = {};
let studentCityByName = {};
let studentCountryByName = {};
let studentBirthDatesByName = {};
let studentAgesByName = {};
let studentLevelsByName = {};
let studentExternalFollowUpLinksByName = {};
let teacherEmailsByName = {};
let teacherPasswordsByName = {};
/** Staff profiles from signup (coordinator, class supervisor, assistant); login uses teacher-like session until role rules exist. */
let gateStaffAccounts = [];
/** Supervision invites/links returned in scoped roster (server-filtered). */
let supervisionLinks = [];
/** Per-teacher app role (e.g. teacher); reserved for future permission logic. */
let teacherAppRolesByName = {};
/** School titles to show in sidebar with no students yet (persisted). */
let customSchoolsList = [];
/** Per-school external URLs (spreadsheet etc.), keyed by normalized school title. */
let schoolExternalLinks = {};
/** Per-school UI colors (primary/secondary), keyed by normalized school title. */
let schoolThemeColors = {};
/** Per-school billing model, keyed by normalized school title. */
let schoolBillingModels = {};
/** Per-school billing configuration values, keyed by normalized school title. */
let schoolBillingConfigs = {};
let addModalMode = 'school';
let addStudentTargetSchool = '';
const ADD_MODAL_MODE_ALIASES = {
    school: 'school',
    student: 'student-global',
    'student-global': 'student-global',
    'student-entry': 'student-entry',
    teacher: 'teacher'
};
let pendingDeleteSchoolTitle = '';
let pendingSchoolSettingsTitle = '';
let schoolSettingsColorTarget = '';
let schoolSettingsColorPopupHideTimer = null;
let addSchoolColorTarget = '';
let addSchoolColorPopupHideTimer = null;
/** Appended under `<body>` while open — add-modal-dialog uses transform (modal animation), which traps `fixed` descendants and `overflow:hidden` clips them. */
let addSchoolColorPopupRestoreParent = null;
/** @type {ChildNode | null} */
let addSchoolColorPopupRestoreBefore = null;
let calendarToolbarExternalLink = '';
/** @type {Record<string, { classDay: string, classHour: string, extraDay: string, extraHour: string }>} */
let speakonStudentWeeklyClass = {};
let isTeacherLoggedIn = false;
let loggedInTeacherName = '';
let isAdminLoggedIn = false;
/** When set, the signed-in user is this student (username + password login); may only view their own schedule. */
let loggedInStudentFullName = '';
let adminAccount = { username: DEFAULT_ADMIN_USERNAME, passwordHash: '' };
let classReportCollapsedBySchool = {};
let studentClassReportUploadsByName = {};
/**
 * Stable manifest-only fingerprint string. Polling skips re-hydration while this matches remote manifest.
 */
let lastSyncedClassReportUploadsJson = '';

let profileAvatarsByKey = {};
let profileAvatarsLoaded = false;
let googleMeetSelectedSchool = '';
/** @type {Set<string>} */
let googleMeetSelectedStudentNames = new Set();
/** @type {Record<string, string>} student display name → Meet URL */
let studentGoogleMeetLinksByName = {};
let googleMeetLinkPopoverStudent = '';
let googleMeetStudentLinkPopoverHideTimer = null;
/** @type {Record<string, string>} synthetic student id -> student name */
let googleMeetLinksStudentNameById = {};
let googleMeetLinksAddDialogStudentId = '';
let googleMeetLinksAddDialogAnchor = null;
let googleMeetLinksAddDialogHideTimer = null;
let googleMeetToggleSwapTimer = null;
let googleMeetContextMessageTimer = null;
let googleMeetContextMessageHideTimer = null;
let googleMeetUseSharedSchoolLink = false;
let googleMeetSharedLinkModeBySchoolKey = {};
let calendarTodayRefreshTimer = null;
let currentTimeIndicatorTimer = null;
let classStartNotificationTimer = null;
let classStartNotificationPermissionRequested = false;
const CLASS_START_NOTIFY_LEAD_MINUTES = 5;
const classStartNotifiedKeys = new Set();
const studentClassStartNotifiedKeys = new Set();
const MODAL_CLOSE_ANIMATION_MS = 220;
const modalCloseTimers = new WeakMap();

function getCurrentUser() {
    if (loggedInStudentFullName) return { role: 'student', name: loggedInStudentFullName };
    if (isAdminLoggedIn) return { role: 'admin', name: String(adminAccount?.username || DEFAULT_ADMIN_USERNAME).trim() };
    if (isTeacherLoggedIn) return { role: 'teacher', name: loggedInTeacherName };
    return { role: 'guest', name: '' };
}

function canManageRoster(user = getCurrentUser()) {
    return !!user && (user.role === 'admin' || user.role === 'teacher');
}

function canEditFeed(user = getCurrentUser()) {
    return !!user && (user.role === 'admin' || user.role === 'teacher');
}

// Role-based sidebar rendering: students get only view-safe navigation and actions.
function getSidebarRenderMode(user = getCurrentUser()) {
    if (user.role === 'student') return 'student';
    if (user.role === 'admin') return 'admin';
    if (user.role === 'teacher') return 'teacher';
    return 'guest';
}

/** Normalize mentor string to the roster `teachers` row when it matches case-insensitively. */
function canonicalTeacherNameOnRoster(rawLabel) {
    const label = String(rawLabel || '').trim();
    if (!label) return '';
    const found = teachersList.find((t) => String(t || '').trim().toLowerCase() === label.toLowerCase());
    return found ? String(found) : label;
}

function normSchoolTitleKeyForSupervision(title) {
    return String(title || '').trim().toLowerCase();
}

/** Align with server `supervision-links.js` aliases: accepted → active, cancelled → revoked. */
function normalizeSupervisionStatusClient(s) {
    const x = String(s || '').trim();
    if (x === 'accepted') return 'active';
    if (x === 'cancelled') return 'revoked';
    return x;
}

function isSupervisionLinkActiveClient(l) {
    return normalizeSupervisionStatusClient(l?.status) === 'active';
}

/**
 * Supervisee teachers linked by active class-supervisor supervision (accepted + school scope on the link).
 */
function getClassSupervisorActiveSuperviseeTeacherNames() {
    const sup = String(loggedInTeacherName || '').trim();
    if (!sup) return [];
    const supLc = sup.toLowerCase();
    const out = new Set();
    supervisionLinks.forEach((l) => {
        if (!isSupervisionLinkActiveClient(l)) return;
        if (String(l?.superiorAppRole || '').trim() !== 'class-supervisor') return;
        if (String(l?.superiorProfile || '').trim().toLowerCase() !== supLc) return;
        const tp = String(l?.teacherProfile || '').trim();
        if (tp) out.add(canonicalTeacherNameOnRoster(tp));
    });
    return [...out].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/**
 * Students a class supervisor may see: assigned to a supervised teacher, school on the active link only.
 */
function getStudentNamesVisibleToClassSupervisor() {
    const allStudents = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList];
    const sup = String(loggedInTeacherName || '').trim();
    if (!sup) return [];
    const supLc = sup.toLowerCase();
    const visible = new Set();
    supervisionLinks.forEach((link) => {
        if (!isSupervisionLinkActiveClient(link)) return;
        if (String(link?.superiorAppRole || '').trim() !== 'class-supervisor') return;
        if (String(link?.superiorProfile || '').trim().toLowerCase() !== supLc) return;
        const teacherProf = canonicalTeacherNameOnRoster(String(link?.teacherProfile || '').trim());
        const schoolKeys = new Set(
            (Array.isArray(link.schoolTitles) ? link.schoolTitles : []).map((s) =>
                normSchoolTitleKeyForSupervision(s)
            )
        );
        if (!teacherProf || schoolKeys.size === 0) return;
        allStudents.forEach((name) => {
            const assigned = canonicalTeacherNameOnRoster(getStudentTeacherInfo(name));
            if (!assigned || assigned.toLowerCase() !== teacherProf.toLowerCase()) return;
            const sch = String(getStudentSchoolName(name) || '').trim();
            if (!sch) return;
            if (schoolKeys.has(normSchoolTitleKeyForSupervision(sch))) visible.add(name);
        });
    });
    return [...visible];
}

/** Schools sidebar + Class Report: admin: all; student: self; class-supervisor: shared supervisees only; other teachers: assigned students + unassigned. */
function getStudentNamesVisibleInNavigation() {
    const allStudents = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList];
    if (loggedInStudentFullName) {
        const self = String(loggedInStudentFullName || '').trim().toLowerCase();
        return allStudents.filter((name) => name.trim().toLowerCase() === self);
    }
    if (
        isTeacherLoggedIn &&
        !isAdminLoggedIn &&
        !loggedInStudentFullName &&
        isGateStaffAccountSession() &&
        getGateSessionAppRole() === 'class-supervisor'
    ) {
        return getStudentNamesVisibleToClassSupervisor();
    }
    if (isTeacherLoggedIn && !isAdminLoggedIn && String(loggedInTeacherName || '').trim()) {
        const loggedCanon = canonicalTeacherNameOnRoster(loggedInTeacherName);
        const loggedLc = loggedCanon.toLowerCase();
        const onlyTeacher =
            teachersList.length === 1 ? canonicalTeacherNameOnRoster(String(teachersList[0] || '')) : '';
        const isSingleTeacherSession = Boolean(onlyTeacher) && loggedLc === onlyTeacher.toLowerCase();
        return allStudents.filter((name) => {
            if (isSingleTeacherSession) return true;
            const assigned = getStudentTeacherInfo(name);
            if (!String(assigned || '').trim()) return true;
            return canonicalTeacherNameOnRoster(assigned).toLowerCase() === loggedLc;
        });
    }
    return allStudents;
}

window.TimeTablePermissions = {
    getCurrentUser,
    canManageRoster,
    canEditFeed
};

window.TimeTablePhone = {
    sanitizeNationalPhoneDigits,
    isPlausibleNationalPhoneDigits,
    formatNationalPhoneDisplay,
    getNationalPhoneDigitsForValidation,
    normalizeStudentPhoneLocalInput
};

function denyStudentAction(message = 'Permission denied: students cannot manage this content.') {
    console.warn(message);
    showAppMessage(message);
}

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

function getCanonicalAddModalMode(mode) {
    const key = String(mode || '').trim().toLowerCase();
    return ADD_MODAL_MODE_ALIASES[key] || 'school';
}

function ensureAddPopupProvidersRendered() {
    const registry = window.addPopupRegistry;
    if (!registry || typeof registry.get !== 'function') return;
    ['student', 'school', 'teacher'].forEach((modeKey) => {
        const provider = registry.get(modeKey);
        if (!provider || typeof provider.render !== 'function') return;
        provider.render();
    });
}

function getAddModalDialogEl() {
    return document.querySelector('[data-ui="add-modal-dialog"]')
        || document.querySelector('.am-dlg')
        || document.querySelector('.add-modal-dialog');
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

/**
 * Escape dismisses the top overlay: nested popups first, then modals (highest z-index first).
 * Registered once in capture phase so behavior is consistent and actions are cancelled (close only).
 */
function setupGlobalEscapeToDismissOverlays() {
    if (document.body.dataset.globalEscapeDismissBound === '1') return;
    document.body.dataset.globalEscapeDismissBound = '1';
    document.addEventListener(
        'keydown',
        (e) => {
            if (e.key !== 'Escape') return;

            const addTeacherCountryMenu = document.getElementById('addTeacherCountryPickerMenu');
            if (addTeacherCountryMenu && !addTeacherCountryMenu.hidden) {
                e.preventDefault();
                closeAddTeacherCountryPickerMenu();
                return;
            }

            const editStudentCountryMenu = document.getElementById('editStudentCountryPickerMenu');
            if (editStudentCountryMenu && !editStudentCountryMenu.hidden) {
                e.preventDefault();
                closeEditStudentCountryPickerMenu();
                return;
            }

            const schoolColorPopup = document.getElementById('schoolSettingsColorPopup');
            if (schoolColorPopup && !schoolColorPopup.hidden && schoolColorPopup.classList.contains('is-open')) {
                e.preventDefault();
                closeSchoolSettingsColorPopup();
                return;
            }

            const addSchoolColorPopup = document.getElementById('addSchoolColorPopup');
            if (addSchoolColorPopup && !addSchoolColorPopup.hidden) {
                e.preventDefault();
                closeAddSchoolColorPopup();
                return;
            }

            if (contextMenu && contextMenu.classList.contains('show')) {
                e.preventDefault();
                hideContextMenu();
                return;
            }

            const calendarLinkPopover = document.getElementById('calendarLinkPopover');
            if (calendarLinkPopover && !calendarLinkPopover.hidden) {
                e.preventDefault();
                closeCalendarLinkPopover();
                return;
            }

            const meetStudentLinkPop = document.getElementById('googleMeetStudentLinkPopover');
            if (meetStudentLinkPop && !meetStudentLinkPop.hidden) {
                e.preventDefault();
                closeGoogleMeetStudentLinkPopover();
                return;
            }

            const calendarStudentPop = document.getElementById('calendarStudentNamesPopover');
            if (calendarStudentPop && !calendarStudentPop.hidden) {
                e.preventDefault();
                closeCalendarStudentNamesPopover();
                return;
            }

            const calendarPromptPop = document.getElementById('calendarPromptPopover');
            if (calendarPromptPop && !calendarPromptPop.hidden) {
                e.preventDefault();
                closeCalendarPromptPopover();
                return;
            }

            const meetLinksAddDialog = document.getElementById('googleMeetLinksAddDialog');
            if (meetLinksAddDialog && !meetLinksAddDialog.hidden) {
                e.preventDefault();
                closeGoogleMeetAddLinkDialog();
                return;
            }

            const googleMeetLinksLayer = document.getElementById('googleMeetLinksLayer');
            if (googleMeetLinksLayer && !googleMeetLinksLayer.hidden) {
                e.preventDefault();
                closeGoogleMeetLinksLayer();
                return;
            }

            const studentRepositionModal = document.getElementById('studentRepositionModal');
            if (studentRepositionModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeStudentRepositionModal();
                return;
            }

            const supervisionPendingNoticeModal = document.getElementById('supervisionPendingNoticeModal');
            if (supervisionPendingNoticeModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeSupervisionPendingNoticeModal();
                return;
            }

            const supervisionInviteModal = document.getElementById('supervisionInviteModal');
            if (supervisionInviteModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeSupervisionInviteModal();
                return;
            }

            const supervisionModalEl = document.getElementById('supervisionModal');
            if (supervisionModalEl?.classList.contains('is-open')) {
                e.preventDefault();
                closeSupervisionModal();
                return;
            }

            const appMessageModal = document.getElementById('appMessageModal');
            if (appMessageModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeAppMessageModal();
                return;
            }

            const classTopicModal = document.getElementById('classTopicModal');
            if (classTopicModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeClassTopicModal();
                return;
            }

            const adminDashboardDeleteModal = document.getElementById('adminDashboardDeleteModal');
            if (adminDashboardDeleteModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeAdminDashboardDeleteModal();
                return;
            }

            const deleteSchoolModal = document.getElementById('deleteSchoolModal');
            if (deleteSchoolModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeDeleteSchoolModal();
                return;
            }

            const schoolSettingsModal = document.getElementById('schoolSettingsModal');
            if (schoolSettingsModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeSchoolSettingsModal();
                return;
            }

            const googleMeetModal = document.getElementById('googleMeetModal');
            if (googleMeetModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeGoogleMeetModal();
                return;
            }

            const editStudentModal = document.getElementById('editStudentModal');
            if (editStudentModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeEditStudentModal();
                return;
            }

            const addModal = document.getElementById('addModal');
            if (addModal?.classList.contains('is-open')) {
                e.preventDefault();
                closeAddStudentModal();
                return;
            }
        },
        true
    );
}

/**
 * Pointer-down outside the active overlay dismisses it (same top-first priority as Escape).
 * This makes closing popups/modals easier on desktop and touch devices.
 */
function setupGlobalPointerDownToDismissOverlays() {
    if (document.body.dataset.globalPointerDismissBound === '1') return;
    document.body.dataset.globalPointerDismissBound = '1';
    document.addEventListener(
        'pointerdown',
        (e) => {
            const target = e.target;
            if (!target) return;

            const addTeacherCountryMenu = document.getElementById('addTeacherCountryPickerMenu');
            if (addTeacherCountryMenu && !addTeacherCountryMenu.hidden) {
                if (!(target instanceof Element) || (!target.closest('#addTeacherCountryDisplay') && !target.closest('#addTeacherCountryPickerMenu'))) {
                    closeAddTeacherCountryPickerMenu();
                }
                return;
            }

            const editStudentCountryMenu = document.getElementById('editStudentCountryPickerMenu');
            if (editStudentCountryMenu && !editStudentCountryMenu.hidden) {
                if (!(target instanceof Element) || (!target.closest('#editStudentCountryDisplay') && !target.closest('#editStudentCountryPickerMenu'))) {
                    closeEditStudentCountryPickerMenu();
                }
                return;
            }

            const schoolColorPopup = document.getElementById('schoolSettingsColorPopup');
            if (schoolColorPopup && !schoolColorPopup.hidden && schoolColorPopup.classList.contains('is-open')) {
                if (!schoolColorPopup.contains(target)) {
                    closeSchoolSettingsColorPopup();
                }
                return;
            }

            const addSchoolColorPopup = document.getElementById('addSchoolColorPopup');
            /** Picker lives under `<body>` while open; it is outside `[role="dialog"]`, so we must bail before modalDismissOrder closes `#addModal`. */
            if (addSchoolColorPopup && !addSchoolColorPopup.hidden) {
                if (target instanceof Element && addSchoolColorPopup.contains(target)) {
                    return;
                }
                closeAddSchoolColorPopup();
            }

            if (contextMenu && contextMenu.classList.contains('show')) {
                if (!contextMenu.contains(target)) {
                    hideContextMenu();
                }
                return;
            }

            const calendarLinkPopover = document.getElementById('calendarLinkPopover');
            if (calendarLinkPopover && !calendarLinkPopover.hidden) {
                const btn = document.getElementById('calendarToolbarCalendarBtn');
                if (!calendarLinkPopover.contains(target) && !(btn && btn.contains(target))) {
                    closeCalendarLinkPopover();
                }
                return;
            }

            const meetStudentLinkPop = document.getElementById('googleMeetStudentLinkPopover');
            if (meetStudentLinkPop && !meetStudentLinkPop.hidden) {
                if (!meetStudentLinkPop.contains(target)) {
                    closeGoogleMeetStudentLinkPopover();
                }
                return;
            }

            const appMessageModal = document.getElementById('appMessageModal');
            if (appMessageModal?.classList.contains('is-open')) {
                return;
            }

            const meetLinksAddDialog = document.getElementById('googleMeetLinksAddDialog');
            if (meetLinksAddDialog && !meetLinksAddDialog.hidden) {
                if (!meetLinksAddDialog.contains(target)) {
                    closeGoogleMeetAddLinkDialog();
                }
                return;
            }

            const calendarStudentPop = document.getElementById('calendarStudentNamesPopover');
            if (calendarStudentPop && !calendarStudentPop.hidden) {
                const btn = document.getElementById('calendarToolbarStudentsBtn');
                if (!calendarStudentPop.contains(target) && !(btn && btn.contains(target))) {
                    closeCalendarStudentNamesPopover();
                }
                return;
            }

            const modalDismissOrder = [
                { id: 'googleMeetLinksLayer', close: closeGoogleMeetLinksLayer },
                { id: 'studentRepositionModal', close: closeStudentRepositionModal },
                { id: 'supervisionPendingNoticeModal', close: closeSupervisionPendingNoticeModal },
                { id: 'supervisionInviteModal', close: closeSupervisionInviteModal },
                { id: 'supervisionModal', close: closeSupervisionModal },
                { id: 'appMessageModal', close: closeAppMessageModal },
                { id: 'classTopicModal', close: closeClassTopicModal },
                { id: 'adminDashboardDeleteModal', close: closeAdminDashboardDeleteModal },
                { id: 'deleteSchoolModal', close: closeDeleteSchoolModal },
                { id: 'schoolSettingsModal', close: closeSchoolSettingsModal },
                { id: 'googleMeetModal', close: closeGoogleMeetModal },
                { id: 'editStudentModal', close: closeEditStudentModal },
                { id: 'addModal', close: closeAddStudentModal }
            ];

            for (const item of modalDismissOrder) {
                const modal = document.getElementById(item.id);
                if (!modal) continue;
                const isLayer = item.id === 'googleMeetLinksLayer';
                if (!isLayer && !modal.classList.contains('is-open')) continue;
                if (isLayer && modal.hidden) continue;
                const dialog = modal.querySelector('[role="dialog"]');
                if (dialog && !dialog.contains(target)) {
                    item.close();
                }
                return;
            }
        },
        true
    );
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

async function loadRosterFromCloud() {
    try {
        const rosterUrl = absoluteHttpApiUrl('/api/roster');
        if (!rosterUrl) return null;
        const response = await fetch(rosterUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getTimetableApiAuthHeaders()
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        rosterLastUpdateTimestamp = data?.lastUpdated || rosterLastUpdateTimestamp;
        if (!data?.success || !data?.roster || typeof data.roster !== 'object') return null;
        try {
            localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(data.roster));
        } catch (error) {
            console.error('Error caching cloud roster to localStorage:', error);
        }
        return data.roster;
    } catch (error) {
        console.error('Error loading roster from cloud:', error);
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
    const primaryCode = document.getElementById('addSchoolPrimaryColorCode');
    const secondaryCode = document.getElementById('addSchoolSecondaryColorCode');
    const primary = String(primaryInput?.value || '').trim().toLowerCase();
    const secondary = String(secondaryInput?.value || '').trim().toLowerCase();
    if (primarySquare && /^#[0-9a-f]{6}$/i.test(primary)) {
        primarySquare.style.background = primary;
    }
    if (secondarySquare && /^#[0-9a-f]{6}$/i.test(secondary)) {
        secondarySquare.style.background = secondary;
    }
    if (primaryCode) {
        primaryCode.value = /^#[0-9a-f]{6}$/i.test(primary) ? primary.toUpperCase() : '#5C6BC0';
    }
    if (secondaryCode) {
        secondaryCode.value = /^#[0-9a-f]{6}$/i.test(secondary) ? secondary.toUpperCase() : '#1E88E5';
    }
}

function getSchoolBillingModelExplainer(modelRaw) {
    const model = normalizeSchoolBillingModel(modelRaw);
    if (model === 'perClass') return "You’re paid for each class you teach.";
    if (model === 'monthly') return 'You receive a fixed monthly fee per student.';
    if (model === 'package') return 'Each student has a set number of classes per month.';
    return '';
}

function getSchoolBillingModelLabel(modelRaw) {
    const model = normalizeSchoolBillingModel(modelRaw);
    if (model === 'perClass') return 'Per class';
    if (model === 'monthly') return 'Monthly';
    if (model === 'package') return 'Package (Classes per Student)';
    return 'Select billing model';
}

function normalizeSchoolBillingModel(modelRaw) {
    const model = String(modelRaw || '').trim();
    if (model === 'per-class') return 'perClass';
    if (model === 'package-per-student') return 'package';
    return model;
}

function updateAddSchoolBillingExplainer() {
    const input = document.getElementById('addSchoolBillingModel');
    const optionsWrap = document.getElementById('addSchoolBillingOptions');
    const billingLayout = document.getElementById('addSchoolBillingLayout');
    const settingsPanel = document.getElementById('addSchoolBillingSettings');
    if (!input || !optionsWrap) return;
    const value = normalizeSchoolBillingModel(input.value);
    if (input.value !== value) {
        input.value = value;
    }
    optionsWrap.querySelectorAll('.add-school-billing-option').forEach((option) => {
        const optionValue = String(option.getAttribute('data-billing-model') || '').trim();
        const isSelected = !!value && optionValue === value;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
    const hasActiveModel = !!value;
    if (billingLayout) {
        billingLayout.classList.toggle('settings-visible', hasActiveModel);
    }
    if (settingsPanel) {
        settingsPanel.setAttribute('aria-hidden', hasActiveModel ? 'false' : 'true');
    }
    updateAddSchoolBillingFieldsVisibility(value);
}

function updateAddSchoolBillingFieldsVisibility(modelRaw) {
    const model = String(modelRaw || '').trim();
    const allFields = document.querySelectorAll('.add-school-billing-fields');
    allFields.forEach((block) => {
        const blockModel = String(block.getAttribute('data-billing-fields') || '').trim();
        const isActive = !!model && blockModel === model;
        block.classList.toggle('is-hidden', !isActive);
        block.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        block.querySelectorAll('input, select').forEach((fieldEl) => {
            if (!(fieldEl instanceof HTMLInputElement || fieldEl instanceof HTMLSelectElement)) return;
            const isRequiredField = fieldEl instanceof HTMLInputElement && fieldEl.dataset.billingRequired === 'true';
            fieldEl.disabled = !isActive;
            fieldEl.required = isActive && isRequiredField;
        });
    });
}

function parseBillingAmount(inputEl) {
    const raw = String(inputEl?.value || '').trim();
    if (!raw) return { ok: false, value: null };
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return { ok: false, value: null };
    return { ok: true, value };
}

function parseBillingInteger(inputEl) {
    const raw = String(inputEl?.value || '').trim();
    if (!raw) return { ok: false, value: null };
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 1 || !Number.isInteger(value)) return { ok: false, value: null };
    return { ok: true, value };
}

function getAddSchoolBillingConfigFromForm(modelRaw) {
    const model = normalizeSchoolBillingModel(modelRaw);
    if (model === 'perClass') {
        const field = document.getElementById('addSchoolPricePerClass');
        const parsed = parseBillingAmount(field);
        if (!parsed.ok) {
            showAppMessage('Enter a valid price per class.');
            field?.focus();
            return null;
        }
        return { pricePerClass: parsed.value };
    }
    if (model === 'monthly') {
        const field = document.getElementById('addSchoolMonthlyFeePerStudent');
        const parsed = parseBillingAmount(field);
        if (!parsed.ok) {
            showAppMessage('Enter a valid monthly fee per student.');
            field?.focus();
            return null;
        }
        return { monthlyFeePerStudent: parsed.value };
    }
    if (model === 'package') {
        const priceField = document.getElementById('addSchoolPackagePricePerClass');
        const classesField = document.getElementById('addSchoolClassesPerMonth');
        const parsedPrice = parseBillingAmount(priceField);
        if (!parsedPrice.ok) {
            showAppMessage('Enter a valid package price per class.');
            priceField?.focus();
            return null;
        }
        const parsedClasses = parseBillingInteger(classesField);
        if (!parsedClasses.ok) {
            showAppMessage('Enter a valid number of classes per month.');
            classesField?.focus();
            return null;
        }
        return {
            pricePerClass: parsedPrice.value,
            classesPerMonth: parsedClasses.value
        };
    }
    return null;
}

function portalAddSchoolColorPopupToBody(popup) {
    if (!(popup instanceof HTMLElement)) return;
    if (popup.parentNode === document.body) return;
    addSchoolColorPopupRestoreParent = popup.parentNode;
    addSchoolColorPopupRestoreBefore = popup.nextSibling;
    document.body.appendChild(popup);
}

function restoreAddSchoolColorPopupFromBody(popup) {
    if (!(popup instanceof HTMLElement)) return;
    if (!addSchoolColorPopupRestoreParent) return;
    const parent = addSchoolColorPopupRestoreParent;
    const before = addSchoolColorPopupRestoreBefore;
    addSchoolColorPopupRestoreParent = null;
    addSchoolColorPopupRestoreBefore = null;
    try {
        if (before instanceof Node && before.parentNode === parent) {
            parent.insertBefore(popup, before);
        } else {
            parent.appendChild(popup);
        }
    } catch {
        if (!popup.parentNode) document.body.appendChild(popup);
    }
}

function closeAddSchoolColorPopup() {
    const popup = document.getElementById('addSchoolColorPopup');
    const options = document.getElementById('addSchoolColorPopupOptions');
    if (!popup) return;
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    options?.style.removeProperty('max-height');
    if (addSchoolColorPopupHideTimer) {
        clearTimeout(addSchoolColorPopupHideTimer);
        addSchoolColorPopupHideTimer = null;
    }
    addSchoolColorPopupHideTimer = window.setTimeout(() => {
        popup.hidden = true;
        popup.style.removeProperty('position');
        popup.style.removeProperty('left');
        popup.style.removeProperty('top');
        popup.style.removeProperty('z-index');
        restoreAddSchoolColorPopupFromBody(popup);
        addSchoolColorPopupHideTimer = null;
    }, 200);
    addSchoolColorTarget = '';
}

function openAddSchoolColorPopup(target, anchorEl) {
    const popup = document.getElementById('addSchoolColorPopup');
    const options = document.getElementById('addSchoolColorPopupOptions');
    const primaryInput = document.getElementById('addSchoolPrimaryColor');
    const secondaryInput = document.getElementById('addSchoolSecondaryColor');
    const dialog = getAddModalDialogEl();
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

    portalAddSchoolColorPopupToBody(popup);

    /** Fixed viewport coordinates while open (picker is under `<body>`). */
    const anchorRect = anchorEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    popup.hidden = false;
    popup.style.position = 'fixed';
    popup.style.zIndex = '2500';
    if (addSchoolColorPopupHideTimer) {
        clearTimeout(addSchoolColorPopupHideTimer);
        addSchoolColorPopupHideTimer = null;
    }
    options.style.maxHeight = '220px';
    const popupWidth = popup.offsetWidth || 220;
    const popupHeight = popup.offsetHeight || 220;
    const horizontalPad = 10;
    const verticalPad = 10;
    let left = anchorRect.left - 4;
    left = Math.max(horizontalPad, Math.min(left, vw - popupWidth - horizontalPad));
    const anchorBottom = anchorRect.bottom;
    const anchorTop = anchorRect.top;
    const availableBelow = Math.max(0, vh - anchorBottom - verticalPad - 8);
    const availableAbove = Math.max(0, anchorTop - verticalPad - 8);
    const minPopupHeight = 140;
    let top = anchorBottom + 8;

    if (availableBelow < minPopupHeight && availableAbove > availableBelow) {
        top = Math.max(verticalPad, anchorTop - popupHeight - 8);
    } else {
        const targetHeight = Math.max(minPopupHeight, Math.min(availableBelow, 260));
        options.style.maxHeight = `${Math.round(targetHeight)}px`;
    }

    const finalH = popup.offsetHeight || popupHeight;
    top = Math.max(verticalPad, Math.min(top, vh - finalH - verticalPad));
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
            username: String(parsed.username || parsed.email || '').trim(),
            password: String(parsed.password || '')
        };
    } catch {
        return null;
    }
}

function saveLoginCredentials(username, password) {
    try {
        localStorage.setItem(
            LOGIN_CREDENTIALS_STORAGE_KEY,
            JSON.stringify({
                username: String(username || '').trim(),
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

function getTimetableApiAuthHeaders() {
    try {
        let t = localStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
        if (!t || !String(t).trim()) {
            t = sessionStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
        }
        if (t && String(t).trim()) {
            return { Authorization: `Bearer ${String(t).trim()}` };
        }
    } catch {
        /* sessionStorage / localStorage unavailable */
    }
    return {};
}

function clearTimetableApiBearerToken() {
    try {
        sessionStorage.removeItem(API_BEARER_TOKEN_STORAGE_KEY);
    } catch {
        /* ignore */
    }
    try {
        localStorage.removeItem(API_BEARER_TOKEN_STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

function persistTimetableApiBearerToken(token) {
    const t = String(token || '').trim();
    if (!t) return;
    try {
        sessionStorage.setItem(API_BEARER_TOKEN_STORAGE_KEY, t);
    } catch {
        /* ignore */
    }
    try {
        localStorage.setItem(API_BEARER_TOKEN_STORAGE_KEY, t);
    } catch {
        /* ignore */
    }
}

function broadcastSessionLogoutToOtherTabs() {
    try {
        localStorage.setItem(LOGOUT_BROADCAST_STORAGE_KEY, String(Date.now()));
    } catch {
        /* ignore */
    }
}

function shouldHandleCrossTabLogoutInThisWindow() {
    try {
        const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
        if (path.includes('login-screen')) return false;
        return path.endsWith('index.html') || path.endsWith('/') || path === '';
    } catch {
        return true;
    }
}

function handleLogoutBroadcastFromOtherTab() {
    if (!shouldHandleCrossTabLogoutInThisWindow()) return;
    try {
        if (document.body?.dataset.remoteLogoutRedirectPending === '1') return;
        if (document.body) document.body.dataset.remoteLogoutRedirectPending = '1';
    } catch {
        /* ignore */
    }
    try {
        sessionStorage.setItem(LOGIN_SESSION_SUPPRESS_KEY, '1');
        sessionStorage.removeItem(ADMIN_LOGIN_SESSION_KEY);
    } catch {
        /* ignore */
    }
    clearTimetableApiBearerToken();
    window.location.href = 'login-screen.html';
}

function initCrossTabLogoutBroadcastListener() {
    try {
        if (document.body?.dataset.crossTabLogoutBound === '1') return;
        if (document.body) document.body.dataset.crossTabLogoutBound = '1';
    } catch {
        /* ignore */
    }
    window.addEventListener('storage', (e) => {
        if (e.storageArea !== localStorage) return;
        if (e.key !== LOGOUT_BROADCAST_STORAGE_KEY || e.newValue == null) return;
        handleLogoutBroadcastFromOtherTab();
    });
}

async function refreshTimetableApiBearerTokenIfPossible() {
    const loginUrl = absoluteHttpApiUrl('/api/auth-login');
    if (!loginUrl) return;
    const creds = loadSavedLoginCredentials();
    if (!creds) return;
    const username = resolveAuthLoginTyped(String(creds.username || '').trim());
    const password = sanitizeTypedLoginPassword(creds.password);
    if (!username || !password) return;
    try {
        const res = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        const data = await res.json().catch(() => null);
        if (res.status === 503) {
            try {
                sessionStorage.setItem('timetable_api_auth_unconfigured', '1');
            } catch {
                /* ignore */
            }
            clearTimetableApiBearerToken();
            return;
        }
        try {
            sessionStorage.removeItem('timetable_api_auth_unconfigured');
        } catch {
            /* ignore */
        }
        if (!res.ok || !data?.token) {
            clearTimetableApiBearerToken();
            return;
        }
        persistTimetableApiBearerToken(data.token);
        const ru = String(data.resolvedUsername || username || '').trim();
        if (ru && password) {
            saveLoginCredentials(ru, password);
        }
    } catch (e) {
        console.warn('API token refresh:', e);
    }
}

/** Prefer server-verified Bearer JWT for admin (stateless; not tied to sessionStorage). */
async function tryRestoreAdminFromBearerIfPossible() {
    const verifyUrl = absoluteHttpApiUrl('/api/auth-verify');
    if (!verifyUrl) return false;
    const headers = getTimetableApiAuthHeaders();
    if (!headers.Authorization) return false;
    try {
        const res = await fetch(`${verifyUrl}?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            cache: 'no-cache'
        });
        const data = await res.json().catch(() => null);
        if (data?.legacy === true) return false;
        if (!res.ok || !data?.success || data.role !== 'admin') return false;
        isAdminLoggedIn = true;
        loggedInStudentFullName = '';
        loggedInTeacherName = '';
        isTeacherLoggedIn = true;
        return true;
    } catch {
        return false;
    }
}

/** Drop other teachers' and unrelated students' schedule keys for isolated teacher sessions (keeps own grid + visible students). */
function applyTeacherDataIsolationInMemory() {
    if (isAdminLoggedIn || loggedInStudentFullName) return;
    if (!isTeacherLoggedIn || !loggedInTeacherName) return;
    const keep = new Set();
    const tk = String(loggedInTeacherName || '').trim();
    if (tk) keep.add(tk);
    getStudentNamesVisibleInNavigation().forEach((name) => {
        const k = String(name || '').trim();
        if (k) keep.add(k);
    });
    if (isGateStaffAccountSession()) {
        const supLc = tk.toLowerCase();
        supervisionLinks.forEach((row) => {
            if (!isSupervisionLinkActiveClient(row)) return;
            if (String(row?.superiorProfile || '').trim().toLowerCase() !== supLc) return;
            if (
                getGateSessionAppRole() === 'class-supervisor' &&
                String(row?.superiorAppRole || '').trim() !== 'class-supervisor'
            ) {
                return;
            }
            const tp = String(row?.teacherProfile || '').trim();
            if (tp) keep.add(tp);
        });
    }
    Object.keys(teacherSchedules).forEach((k) => {
        if (!keep.has(k)) delete teacherSchedules[k];
    });
}

function digitsOnly(s) {
    return String(s || '').replace(/\D/g, '');
}

function getDialCodeDigitsForCountryIso(iso) {
    const c = getPhoneCountryByIso(iso);
    return c ? digitsOnly(c.dialCode) : '';
}

function stripLeadingCountryDigitsFromFormattedPhone(formatted, dialDigits) {
    if (!dialDigits) return String(formatted || '').trim();
    const all = digitsOnly(formatted);
    if (!all.startsWith(dialDigits)) return String(formatted || '').trim();
    let toDrop = dialDigits.length;
    let out = '';
    for (const ch of formatted) {
        if (/\d/.test(ch)) {
            if (toDrop > 0) {
                toDrop--;
                continue;
            }
        }
        out += ch;
    }
    return out.replace(/^[\s\-()./]+/, '').trim();
}

function findPhoneCountryByDialPrefix(rawDigits, requireLocalDigits = true) {
    const digits = digitsOnly(rawDigits);
    if (!digits) return null;
    if (digits.startsWith('1') && (!requireLocalDigits || digits.length > 1)) {
        const us = PHONE_COUNTRY_OPTIONS.find((country) => country.iso === 'US');
        if (us) return { country: us, dialDigits: '1' };
    }
    const matches = PHONE_COUNTRY_OPTIONS
        .map((country) => ({ country, dialDigits: digitsOnly(country.dialCode) }))
        .filter((entry) => {
            if (!entry.dialDigits) return false;
            if (!digits.startsWith(entry.dialDigits)) return false;
            if (!requireLocalDigits) return true;
            return digits.length > entry.dialDigits.length;
        })
        .sort((a, b) => b.dialDigits.length - a.dialDigits.length);
    return matches[0] || null;
}

/** National-significant digits only — strips non-digits; drops Irish domestic trunk leading 0 when present. */
function sanitizeNationalPhoneDigits(countryIso, digitString) {
    let d = digitsOnly(digitString);
    const iso = String(countryIso || '').trim().toUpperCase();
    if (iso === 'IE' && d.length === 10 && d.startsWith('0')) {
        d = d.slice(1);
    }
    return d;
}

/**
 * Plausible lengths for stored national digits (calling code stripped; matches country-specific format caps).
 */
function isPlausibleNationalPhoneDigits(countryIso, digitCount) {
    if (!digitCount) return false;
    const iso = String(countryIso || '').trim().toUpperCase();
    if (iso === 'IE') return digitCount >= 8 && digitCount <= 9;
    if (iso === 'GB') return digitCount >= 9 && digitCount <= 10;
    if (iso === 'BR') return digitCount >= 10 && digitCount <= 11;
    if (iso === 'US' || iso === 'CA') return digitCount === 10;
    return digitCount >= 8 && digitCount <= 15;
}

function formatBrazilNationalPhoneDisplay(rawDigits) {
    const digits = String(rawDigits || '').replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatNanpNationalPhoneDisplay(rawDigits) {
    const digits = String(rawDigits || '').replace(/\D/g, '').slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatUkNationalPhoneDisplay(rawDigits) {
    const digits = String(rawDigits || '').replace(/\D/g, '').slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

function formatIrelandNationalPhoneDisplay(rawDigits) {
    let digits = sanitizeNationalPhoneDigits('IE', rawDigits).slice(0, 9);
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/** WhatsApp/UI-friendly national display for the app's supported dial countries. */
function formatNationalPhoneDisplay(countryIso, rawDigitsOrFormatted) {
    const iso = String(countryIso || '').trim().toUpperCase();
    if (iso === 'BR') return formatBrazilNationalPhoneDisplay(rawDigitsOrFormatted);
    if (iso === 'GB') return formatUkNationalPhoneDisplay(rawDigitsOrFormatted);
    if (iso === 'IE') return formatIrelandNationalPhoneDisplay(rawDigitsOrFormatted);
    if (iso === 'US' || iso === 'CA') return formatNanpNationalPhoneDisplay(rawDigitsOrFormatted);
    const d = sanitizeNationalPhoneDigits(iso, digitsOnly(rawDigitsOrFormatted));
    return d.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Removes a duplicate country calling code from the start of `raw` when it matches `countryIso`.
 * Roster `number` is stored as the national/local part only; the flag selector holds the dial code.
 */
function normalizeStudentPhoneLocalInput(raw, countryIso) {
    const c = getPhoneCountryByIso(countryIso);
    const dial = String(c?.dialCode || '').trim();
    let s = String(raw || '').trim();
    if (!s || !dial) return s;

    const dialEsc = dial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`^\\s*00\\s*${dialEsc}\\s*`, 'i'), '').trim();
    s = s.replace(new RegExp(`^\\s*${dialEsc}\\s*`, 'i'), '').trim();
    s = s.replace(/^\s*00\s*/, '').trim();

    const dialDigits = digitsOnly(dial);
    if (dialDigits) {
        s = stripLeadingCountryDigitsFromFormattedPhone(s, dialDigits);
    }
    return s.trim();
}

function getNationalPhoneDigitsForValidation(countryIso, rawLocalInput) {
    const iso = String(countryIso || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const normalized = normalizeStudentPhoneLocalInput(String(rawLocalInput || ''), iso);
    return sanitizeNationalPhoneDigits(iso, digitsOnly(normalized));
}

function syncPhoneInputWithCountrySelector(phoneInput, countrySelect) {
    if (!phoneInput || !countrySelect) return;
    const rawValue = String(phoneInput.value || '');
    const digits = digitsOnly(rawValue);
    if (!digits && !rawValue) return;
    if (digits !== rawValue) {
        phoneInput.value = digits;
    }
    if (!digits) return;
    const next = normalizeStudentPhoneLocalInput(digits, countrySelect.value);
    if (next !== phoneInput.value) phoneInput.value = digitsOnly(next);
}

function setPhoneCountrySelectInteraction(countrySelect, isInteractive = false) {
    if (!countrySelect) return;
    const effectiveInteractive = isPhoneCountrySelectorAlwaysInteractive(countrySelect) || isInteractive;
    const wrap = countrySelect.closest('.add-student-phone-country-wrap') || countrySelect.parentElement;
    if (effectiveInteractive) {
        countrySelect.removeAttribute('aria-hidden');
        countrySelect.removeAttribute('tabindex');
        countrySelect.setAttribute('aria-label', 'Country code');
        countrySelect.classList.add('phone-country-select--interactive');
        if (wrap) wrap.classList.add('phone-country-wrap--interactive');
        return;
    }
    countrySelect.setAttribute('aria-hidden', 'true');
    countrySelect.setAttribute('tabindex', '-1');
    countrySelect.setAttribute('aria-label', 'Country code (automatic)');
    countrySelect.classList.remove('phone-country-select--interactive');
    if (wrap) wrap.classList.remove('phone-country-wrap--interactive');
}

function autoDetectPhoneCountry(phoneInput, countrySelect, onCountryChanged) {
    if (!phoneInput || !countrySelect) return;
    const raw = String(phoneInput.value || '');
    const digits = digitsOnly(raw);
    const hasIntlPrefix = /^\s*(\+|00)/.test(raw);
    if (digits !== raw) {
        phoneInput.value = digits;
    }
    if (!digits) {
        phoneInput.dataset.phoneAllowNanpChoice = '0';
        setPhoneCountrySelectInteraction(countrySelect, false);
        return;
    }
    const keepNanpChoice = phoneInput.dataset.phoneAllowNanpChoice === '1'
        && (countrySelect.value === 'US' || countrySelect.value === 'CA');
    setPhoneCountrySelectInteraction(countrySelect, keepNanpChoice);
    if (!hasIntlPrefix) return;

    const detected = findPhoneCountryByDialPrefix(digits, true);
    if (!detected) return;
    const localDigits = digits.slice(detected.dialDigits.length);
    if (!localDigits) return;

    if (countrySelect.value !== detected.country.iso) {
        countrySelect.value = detected.country.iso;
        if (typeof onCountryChanged === 'function') onCountryChanged();
    }
    const allowNanpChoice = detected.dialDigits === '1';
    phoneInput.dataset.phoneAllowNanpChoice = allowNanpChoice ? '1' : '0';
    setPhoneCountrySelectInteraction(countrySelect, allowNanpChoice);
    phoneInput.value = localDigits;
}

function bindPhoneInputAutoCountry(phoneInput, countrySelect, onCountryChanged) {
    if (!phoneInput || !countrySelect) return;
    if (phoneInput.dataset.phoneAutoCountryBound === '1') return;
    phoneInput.dataset.phoneAutoCountryBound = '1';
    setPhoneCountrySelectInteraction(countrySelect);
    phoneInput.setAttribute('inputmode', 'numeric');
    phoneInput.addEventListener('input', () => autoDetectPhoneCountry(phoneInput, countrySelect, onCountryChanged));
    phoneInput.addEventListener('blur', () => autoDetectPhoneCountry(phoneInput, countrySelect, onCountryChanged));
    phoneInput.addEventListener('paste', () => {
        window.setTimeout(() => autoDetectPhoneCountry(phoneInput, countrySelect, onCountryChanged), 0);
    });
    countrySelect.addEventListener('change', () => {
        const selectedIso = String(countrySelect.value || '').trim().toUpperCase();
        const allowNanpChoice = phoneInput.dataset.phoneAllowNanpChoice === '1';
        if (allowNanpChoice && (selectedIso === 'US' || selectedIso === 'CA')) {
            setPhoneCountrySelectInteraction(countrySelect, true);
        } else {
            setPhoneCountrySelectInteraction(countrySelect, false);
        }
        if (typeof onCountryChanged === 'function') onCountryChanged();
    });
    if (isPhoneCountrySelectorAlwaysInteractive(countrySelect)) {
        setPhoneCountrySelectInteraction(countrySelect, true);
    }
}

function getTutorRosterNameForStudent(studentFullName) {
    const studentName = String(studentFullName || '').trim();
    if (!studentName) return '';
    let tutor = String(studentTeacherByName[studentName] || '').trim();
    if (!tutor) {
        const studentKey = studentName.toLowerCase();
        const mappedKey = Object.keys(studentTeacherByName).find(
            (key) => String(key || '').trim().toLowerCase() === studentKey
        );
        if (mappedKey) {
            tutor = String(studentTeacherByName[mappedKey] || '').trim();
        }
    }
    if (!tutor) return '';
    // If the assigned label does not exactly match a roster teacher, still allow student login
    // (session uses the student as the active profile; schedule keys are by student name).
    return canonicalTeacherNameOnRoster(tutor);
}

const STUDENT_PASSWORD_HASH_PREFIX = 'sha256$';

function normalizeUsername(value) {
    const raw = String(value || '');
    let normalized = raw;
    try {
        normalized = raw.normalize('NFD');
    } catch {
        // Keep original value in environments without Unicode normalization support.
        normalized = raw;
    }
    return normalized
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

function buildDefaultStudentUsername(firstRaw, lastRaw) {
    const parts = [firstRaw, lastRaw].map((s) => String(s || '').trim()).filter(Boolean);
    return buildCanonicalUsernameBaseFromFullName(parts.join(' '));
}

function buildCanonicalUsernameBaseFromFullName(fullNameRaw) {
    if (typeof TimeTableAuthMigrate !== 'undefined' && TimeTableAuthMigrate.buildCanonicalUsernameBaseFromFullName) {
        return TimeTableAuthMigrate.buildCanonicalUsernameBaseFromFullName(fullNameRaw);
    }
    const cleaned = String(fullNameRaw || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return '';
    const parts = cleaned.split(' ').filter(Boolean);
    const slug = parts.map((p) => normalizeUsername(p)).join('');
    if (!slug) return '';
    return `${slug}_`;
}

function buildDefaultStudentUsernameFromFullName(studentFullName) {
    return buildCanonicalUsernameBaseFromFullName(studentFullName);
}

function resolveAuthLoginTyped(raw) {
    const t = String(raw || '').trim();
    if (!t) return '';
    const hit = authLoginAliasesByKey[t.toLowerCase()];
    return hit ? String(hit).trim() : t;
}

function findStudentNameByLoginUsername(usernameRaw) {
    const trimmed = resolveAuthLoginTyped(String(usernameRaw || '').trim());
    if (!trimmed) return '';
    const key = normalizeUsername(trimmed);
    const lc = trimmed.toLowerCase();
    return (
        [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].find((name) => {
            const stored = String(studentUsernamesByName[name] || '').trim();
            if (!stored) return false;
            if (stored.toLowerCase() === lc) return true;
            return key && normalizeUsername(stored) === key;
        }) || ''
    );
}

/**
 * Same identity rules as login-screen.html / admin.html login: roster student username only.
 */
function findStudentNameByLoginIdentity(raw) {
    return findStudentNameByLoginUsername(raw);
}

function syncStudentUsernameFromNameFields(firstInput, lastInput, usernameInput) {
    if (!firstInput || !lastInput || !usernameInput) return;
    usernameInput.value = buildDefaultStudentUsername(firstInput.value, lastInput.value);
}

function bindAddStudentUsernameAutoSync(firstInput, lastInput, usernameInput) {
    if (!firstInput || !lastInput || !usernameInput) return;
    if (firstInput.dataset.usernameSyncBound !== '1') {
        firstInput.dataset.usernameSyncBound = '1';
        firstInput.addEventListener('input', () =>
            syncStudentUsernameFromNameFields(firstInput, lastInput, usernameInput)
        );
    }
    if (lastInput.dataset.usernameSyncBound !== '1') {
        lastInput.dataset.usernameSyncBound = '1';
        lastInput.addEventListener('input', () =>
            syncStudentUsernameFromNameFields(firstInput, lastInput, usernameInput)
        );
    }
}

function isStudentPasswordHashed(storedPasswordRaw) {
    return String(storedPasswordRaw || '').startsWith(STUDENT_PASSWORD_HASH_PREFIX);
}

async function hashStudentPassword(rawPassword) {
    const password = String(rawPassword || '');
    if (!password) return '';
    const hasCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined';
    if (!hasCrypto) return password;
    const encoded = new TextEncoder().encode(password);
    const digestBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    const digestBytes = Array.from(new Uint8Array(digestBuffer));
    const digestHex = digestBytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${STUDENT_PASSWORD_HASH_PREFIX}${digestHex}`;
}

function sanitizeTypedLoginPassword(raw) {
    return String(raw || '')
        .replace(/\u200b|\uFEFF|\u2060/g, '')
        .trim();
}

async function verifyStudentPassword(storedPasswordRaw, passwordRaw) {
    const stored = String(storedPasswordRaw || '').trim();
    const input = sanitizeTypedLoginPassword(passwordRaw);
    if (!stored || !input) return false;
    if (isStudentPasswordHashed(stored)) {
        const hashed = await hashStudentPassword(input);
        return hashed === stored;
    }
    // Plate-style passwords (@xxxNxNN) are validated case-insensitive when generating; match that here.
    const plateRx = /^@[a-z]{3}\d[a-z]\d{2}$/i;
    if (plateRx.test(stored) && plateRx.test(input)) {
        return stored.toLowerCase() === input.toLowerCase();
    }
    return input === stored;
}

function loadAdminAccountFromStorage() {
    try {
        const raw = localStorage.getItem(ADMIN_ACCOUNT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const username = String(parsed.username || '').trim();
        const passwordHash = String(parsed.passwordHash || '').trim();
        if (!username || !passwordHash) return null;
        return { username, passwordHash };
    } catch {
        return null;
    }
}

function saveAdminAccountToStorage(account) {
    try {
        localStorage.setItem(
            ADMIN_ACCOUNT_STORAGE_KEY,
            JSON.stringify({
                username: String(account?.username || DEFAULT_ADMIN_USERNAME).trim(),
                passwordHash: String(account?.passwordHash || '').trim()
            })
        );
    } catch (error) {
        console.error('Error saving admin account to localStorage:', error);
    }
}

function loadAdminAccountFromRoster(roster) {
    if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return null;
    const raw = roster.adminAccount;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const username = String(raw.username || '').trim();
    const passwordHash = String(raw.passwordHash || '').trim();
    if (!username || !passwordHash) return null;
    return { username, passwordHash };
}

async function ensureAdminAccountReady() {
    if (String(adminAccount?.username || '').trim() && String(adminAccount?.passwordHash || '').trim()) {
        saveAdminAccountToStorage(adminAccount);
        return;
    }
    const fromStorage = loadAdminAccountFromStorage();
    if (fromStorage) {
        adminAccount = {
            username: String(fromStorage.username || DEFAULT_ADMIN_USERNAME).trim() || DEFAULT_ADMIN_USERNAME,
            passwordHash: String(fromStorage.passwordHash || '').trim()
        };
        return;
    }
    const defaultHash = await hashStudentPassword(DEFAULT_ADMIN_PASSWORD);
    adminAccount = { username: DEFAULT_ADMIN_USERNAME, passwordHash: defaultHash };
    saveAdminAccountToStorage(adminAccount);
}

async function verifyAdminLogin(usernameRaw, passwordRaw) {
    const username = resolveAuthLoginTyped(String(usernameRaw || '').trim());
    const password = sanitizeTypedLoginPassword(passwordRaw);
    if (!username || !password) return { ok: false, error: '' };
    const expectedUsername = String(adminAccount.username || DEFAULT_ADMIN_USERNAME).trim();
    if (!expectedUsername || username.toLowerCase() !== expectedUsername.toLowerCase()) {
        return { ok: false, error: '' };
    }
    const okPassword = await verifyStudentPassword(adminAccount.passwordHash, password);
    if (!okPassword) return { ok: false, error: 'Incorrect admin password.' };
    return { ok: true };
}

/**
 * Student login: roster username + account password (same as the gate login page).
 * @returns {Promise<{ ok: true, studentName: string } | { ok: false, error: string }>}
 */
async function verifyStudentLogin(usernameRaw, passwordRaw) {
    const username = String(usernameRaw || '').trim();
    const password = sanitizeTypedLoginPassword(passwordRaw);
    if (!username) {
        return { ok: false, error: 'Student username is required to log in.' };
    }
    const studentName = findStudentNameByLoginIdentity(username);
    if (!studentName) {
        return { ok: false, error: 'No account matches that username.' };
    }
    const storedPassword = String(studentPasswordsByName[studentName] || '');
    if (!storedPassword) {
        return {
            ok: false,
            error: 'This student account has no password saved yet. Ask your teacher to update your profile.'
        };
    }
    const okPassword = await verifyStudentPassword(storedPassword, password);
    if (!okPassword) {
        return { ok: false, error: 'Incorrect password.' };
    }
    return { ok: true, studentName };
}

/**
 * If the user previously chose to save credentials, validate them against the roster
 * and restore a teacher or student session (same rules as the login form).
 * @returns {Promise<string|null>} profile key to select (teacher name or student full name), otherwise null
 */
async function tryRestoreSessionFromSavedCredentials() {
    try {
        if (sessionStorage.getItem(LOGIN_SESSION_SUPPRESS_KEY) === '1') return null;
        if (sessionStorage.getItem(ADMIN_LOGIN_SESSION_KEY) === 'true') {
            isAdminLoggedIn = true;
            loggedInStudentFullName = '';
            loggedInTeacherName = '';
            isTeacherLoggedIn = true;
            return DEFAULT_ADMIN_USERNAME;
        }
    } catch {
        /* sessionStorage may be unavailable in some environments */
    }
    const saved = loadSavedLoginCredentials();
    if (!saved) return null;
    const rawLogin = resolveAuthLoginTyped(String(saved.username || '').trim());
    const loginLc = rawLogin.toLowerCase();
    const password = sanitizeTypedLoginPassword(saved.password);
    if (!rawLogin || !password) return null;

    const adminLogin = await verifyAdminLogin(rawLogin, password);
    if (adminLogin.ok) {
        isAdminLoggedIn = true;
        loggedInStudentFullName = '';
        loggedInTeacherName = '';
        isTeacherLoggedIn = true;
        return DEFAULT_ADMIN_USERNAME;
    }

    const teacherNameByLogin = teachersList.find((name) => {
        const teacherLogin = String(teacherEmailsByName[name] || '').trim().toLowerCase();
        return teacherLogin && teacherLogin === loginLc;
    });
    if (teacherNameByLogin) {
        isAdminLoggedIn = false;
        if (password.length < 8) return null;
        const expectedPassword = String(teacherPasswordsByName[teacherNameByLogin] || '');
        if (!expectedPassword || !(await verifyStudentPassword(expectedPassword, password))) return null;
        loggedInStudentFullName = '';
        isTeacherLoggedIn = true;
        loggedInTeacherName = teacherNameByLogin;
        return teacherNameByLogin;
    }

    const staffEntry = gateStaffAccounts.find((entry) => {
        const u = String(entry.username || '').trim().toLowerCase();
        return u && u === loginLc;
    });
    if (staffEntry) {
        isAdminLoggedIn = false;
        if (password.length < 8) return null;
        const expectedPassword = String(staffEntry.password || '');
        if (!expectedPassword || !(await verifyStudentPassword(expectedPassword, password))) return null;
        loggedInStudentFullName = '';
        isTeacherLoggedIn = true;
        loggedInTeacherName = String(staffEntry.profileName || '').trim();
        return loggedInTeacherName;
    }

    const v = await verifyStudentLogin(rawLogin, password);
    if (v.ok) {
        isAdminLoggedIn = false;
        let tutor = getTutorRosterNameForStudent(v.studentName);
        if (!tutor && teachersList.length === 1) {
            tutor = String(teachersList[0] || '').trim();
        }
        loggedInStudentFullName = v.studentName;
        loggedInTeacherName = tutor;
        isTeacherLoggedIn = true;
        return v.studentName;
    }

    return null;
}

function isTeacherSelectionAllowed(name) {
    const requested = String(name || '').trim();
    if (!requested) return false;
    if (!isTeacherLoggedIn) return false;
    if (isAdminLoggedIn) return true;
    if (loggedInStudentFullName) {
        return requested.toLowerCase() === String(loggedInStudentFullName || '').trim().toLowerCase();
    }
    if (isGateStaffAccountSession() && getGateSessionAppRole() === 'class-supervisor') {
        const sup = String(loggedInTeacherName || '').trim();
        if (!sup) return false;
        if (requested.toLowerCase() === sup.toLowerCase()) return true;
        const supervisees = getClassSupervisorActiveSuperviseeTeacherNames();
        return supervisees.some((t) => t.toLowerCase() === requested.toLowerCase());
    }
    if (!loggedInTeacherName) return false;
    return requested.toLowerCase() === String(loggedInTeacherName || '').trim().toLowerCase();
}

function isLoggedInStudentCalendarReadOnly() {
    return !!String(loggedInStudentFullName || '').trim();
}

function getActiveTeacherProfileName() {
    if (!isTeacherLoggedIn) return '';
    if (isAdminLoggedIn) {
        return String(adminAccount.username || DEFAULT_ADMIN_USERNAME).trim();
    }
    const asStudent = String(loggedInStudentFullName || '').trim();
    if (asStudent) return asStudent;
    const logged = String(loggedInTeacherName || '').trim();
    if (logged) return logged;
    const current = String(currentTeacher || '').trim();
    if (current && isActiveTeacherName(current)) return current;
    return String(teachersList[0] || '').trim();
}

function getCurrentProfileKey() {
    const name = isTeacherLoggedIn ? getActiveTeacherProfileName() : 'guest';
    if (isAdminLoggedIn) return 'admin';
    return name.toLowerCase();
}

function hasEffectiveAdminSession() {
    return !!(
        isTeacherLoggedIn
        && isAdminLoggedIn
        && String(adminAccount?.username || '').trim()
    );
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

async function initRoster(preloadedRoster = null) {
    const cloudRoster = preloadedRoster || await loadRosterFromCloud();
    const saved = cloudRoster || loadRosterFromStorage();

    authLoginAliasesByKey = {};
    if (saved) {
        try {
            let migrated = false;
            if (typeof TimeTableAuthMigrate !== 'undefined' && TimeTableAuthMigrate.migrateRosterAuthFields) {
                migrated = !!TimeTableAuthMigrate.migrateRosterAuthFields(saved);
            }
            if (migrated) {
                try {
                    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(saved));
                } catch (error) {
                    console.error('Error persisting roster after auth migration:', error);
                }
                queueSaveRosterToCloud(saved);
            }
            const rawAliases =
                saved.authLoginAliases && typeof saved.authLoginAliases === 'object' && !Array.isArray(saved.authLoginAliases)
                    ? saved.authLoginAliases
                    : {};
            Object.keys(rawAliases).forEach((k) => {
                const key = String(k || '').trim().toLowerCase();
                const v = String(rawAliases[k] || '').trim();
                if (key && v) authLoginAliasesByKey[key] = v;
            });
        } catch (e) {
            console.warn('Auth username migration skipped:', e);
        }
    }

    const savedAdminAccount = loadAdminAccountFromRoster(saved);
    if (savedAdminAccount) {
        adminAccount = savedAdminAccount;
        saveAdminAccountToStorage(adminAccount);
    }
    if (!preloadedRoster && !cloudRoster && saved) {
        queueSaveRosterToCloud(saved);
    }
    if (!saved) {
        teachersList = [];
        privateStudentsList = [];
        speakonStudentsList = [];
        passportStudentsList = [];
        passportFollowupLinks = {};
        passportHeaderPageLink = '';
        studentSchoolByName = {};
        studentPhonesByName = {};
        studentTeacherByName = {};
        studentEmailsByName = {};
        studentUsernamesByName = {};
        studentPasswordsByName = {};
        studentCityByName = {};
        studentCountryByName = {};
        studentBirthDatesByName = {};
        studentAgesByName = {};
        studentLevelsByName = {};
        studentExternalFollowUpLinksByName = {};
        teacherEmailsByName = {};
        teacherPasswordsByName = {};
        gateStaffAccounts = [];
        supervisionLinks = [];
        teacherAppRolesByName = {};
        customSchoolsList = [];
        schoolExternalLinks = {};
        schoolThemeColors = {};
        schoolBillingModels = {};
        schoolBillingConfigs = {};
        calendarToolbarExternalLink = '';
        speakonStudentWeeklyClass = {};
        studentGoogleMeetLinksByName = {};
        googleMeetSharedLinkModeBySchoolKey = {};
        authLoginAliasesByKey = {};
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
        const number = normalizeStudentPhoneLocalInput(String(entry.number || ''), normalizedIso);
        if (!number || !digitsOnly(number)) return;
        studentPhonesByName[name] = { countryIso: normalizedIso, number };
    });
    const teachersRaw =
        saved.studentTeachers && typeof saved.studentTeachers === 'object' && !Array.isArray(saved.studentTeachers)
            ? { ...saved.studentTeachers }
            : {};
    studentTeacherByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const t = String(teachersRaw[name] || '').trim();
        if (t) studentTeacherByName[name] = t;
    });
    const studentEmailsRaw =
        saved.studentEmails && typeof saved.studentEmails === 'object' && !Array.isArray(saved.studentEmails)
            ? { ...saved.studentEmails }
            : {};
    studentEmailsByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const e = String(studentEmailsRaw[name] || '').trim();
        if (e) studentEmailsByName[name] = e;
    });
    const studentUsernamesRaw =
        saved.studentUsernames && typeof saved.studentUsernames === 'object' && !Array.isArray(saved.studentUsernames)
            ? { ...saved.studentUsernames }
            : {};
    studentUsernamesByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const fallbackUsername = buildDefaultStudentUsernameFromFullName(name);
        const u = String(studentUsernamesRaw[name] || fallbackUsername).trim();
        if (u) studentUsernamesByName[name] = u;
    });
    const studentPasswordsRaw =
        saved.studentPasswords && typeof saved.studentPasswords === 'object' && !Array.isArray(saved.studentPasswords)
            ? { ...saved.studentPasswords }
            : {};
    studentPasswordsByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const p = String(studentPasswordsRaw[name] || '').trim();
        if (p) studentPasswordsByName[name] = p;
    });
    const studentCitiesRaw =
        saved.studentCities && typeof saved.studentCities === 'object' && !Array.isArray(saved.studentCities)
            ? { ...saved.studentCities }
            : {};
    studentCityByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const c = String(studentCitiesRaw[name] || '').trim();
        if (c) studentCityByName[name] = c;
    });
    const studentCountriesRaw =
        saved.studentCountries && typeof saved.studentCountries === 'object' && !Array.isArray(saved.studentCountries)
            ? { ...saved.studentCountries }
            : {};
    studentCountryByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const c = String(studentCountriesRaw[name] || '').trim();
        if (c) {
            studentCountryByName[name] = c;
            return;
        }
        const phone = studentPhonesByName[name];
        if (!phone || typeof phone !== 'object') return;
        const iso = String(phone.countryIso || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
        const country = PHONE_COUNTRY_OPTIONS.find((item) => item.iso === iso);
        if (country?.name) studentCountryByName[name] = country.name;
    });
    const studentBirthDatesRaw =
        saved.studentBirthDates && typeof saved.studentBirthDates === 'object' && !Array.isArray(saved.studentBirthDates)
            ? { ...saved.studentBirthDates }
            : {};
    const studentAgesRaw =
        saved.studentAges && typeof saved.studentAges === 'object' && !Array.isArray(saved.studentAges)
            ? { ...saved.studentAges }
            : {};
    const studentLevelsRaw =
        saved.studentLevels && typeof saved.studentLevels === 'object' && !Array.isArray(saved.studentLevels)
            ? { ...saved.studentLevels }
            : {};
    const studentExternalFollowUpRaw =
        saved.studentExternalFollowUpLinks &&
        typeof saved.studentExternalFollowUpLinks === 'object' &&
        !Array.isArray(saved.studentExternalFollowUpLinks)
            ? { ...saved.studentExternalFollowUpLinks }
            : {};
    studentBirthDatesByName = {};
    studentAgesByName = {};
    studentLevelsByName = {};
    studentExternalFollowUpLinksByName = {};
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const birthDate = String(studentBirthDatesRaw[name] || '').trim();
        const age = String(studentAgesRaw[name] || '').trim();
        const level = String(studentLevelsRaw[name] || '').trim();
        if (birthDate) studentBirthDatesByName[name] = birthDate;
        if (age) studentAgesByName[name] = age;
        if (level) studentLevelsByName[name] = level;
        const extLinkRaw = String(studentExternalFollowUpRaw[name] || '').trim();
        if (extLinkRaw) {
            const parsedExt = parseStudentExternalFollowUpLinkInput(extLinkRaw);
            if (parsedExt.href) studentExternalFollowUpLinksByName[name] = parsedExt.href;
        }
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
    gateStaffAccounts = Array.isArray(saved.gateStaffAccounts)
        ? saved.gateStaffAccounts
              .map((entry) => ({
                  profileName: String(entry.profileName || '').trim(),
                  username: String(entry.username || '').trim(),
                  password: String(entry.password || ''),
                  appRole: String(entry.appRole || '').trim()
              }))
              .filter((entry) => entry.profileName && entry.username && entry.password && entry.appRole)
        : [];
    supervisionLinks = Array.isArray(saved.supervisionLinks)
        ? saved.supervisionLinks.filter((row) => row && typeof row === 'object' && String(row.id || '').trim())
        : [];
    const teacherAppRolesRaw =
        saved.teacherAppRoles && typeof saved.teacherAppRoles === 'object' && !Array.isArray(saved.teacherAppRoles)
            ? saved.teacherAppRoles
            : {};
    teacherAppRolesByName = {};
    teachersList.forEach((name) => {
        const r = String(teacherAppRolesRaw[name] || '').trim();
        if (r) teacherAppRolesByName[name] = r;
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
    const billingRaw =
        saved.schoolBillingModels && typeof saved.schoolBillingModels === 'object' && !Array.isArray(saved.schoolBillingModels)
            ? saved.schoolBillingModels
            : {};
    schoolBillingModels = {};
    Object.keys(billingRaw).forEach((key) => {
        const k = String(key || '').trim().toLowerCase();
        const v = String(billingRaw[key] || '').trim();
        if (!k || !v) return;
        schoolBillingModels[k] = v;
    });
    const billingConfigRaw =
        saved.schoolBillingConfigs && typeof saved.schoolBillingConfigs === 'object' && !Array.isArray(saved.schoolBillingConfigs)
            ? saved.schoolBillingConfigs
            : {};
    schoolBillingConfigs = {};
    Object.keys(billingConfigRaw).forEach((key) => {
        const k = String(key || '').trim().toLowerCase();
        const cfg = billingConfigRaw[key];
        if (!k || !cfg || typeof cfg !== 'object') return;
        schoolBillingConfigs[k] = { ...cfg };
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
    const asStudent = String(loggedInStudentFullName || '').trim();
    if (asStudent) {
        const school = String(getStudentSchoolName(asStudent) || '').trim();
        if (school) schools.add(school);
        return [...schools].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }
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

/** School dropdown for add/edit student: teachers only see their own schools (from assigned students + eligible custom schools). */
function getSchoolNamesForStudentSchoolSelect() {
    const asStudent = String(loggedInStudentFullName || '').trim();
    if (asStudent) {
        const school = String(getStudentSchoolName(asStudent) || '').trim();
        return school ? [school] : [];
    }
    const isScopedTeacher =
        isTeacherLoggedIn && !isAdminLoggedIn && String(loggedInTeacherName || '').trim();
    if (!isScopedTeacher) {
        return getAvailableSchoolNames();
    }
    const tLc = String(loggedInTeacherName || '').trim().toLowerCase();
    const tutorLc = (n) => String(studentTeacherByName[n] || '').trim().toLowerCase();
    const visible = new Set();
    getStudentNamesVisibleInNavigation().forEach((n) => {
        const s = String(getStudentSchoolName(n) || '').trim();
        if (s) visible.add(s);
    });
    customSchoolsList.forEach((raw) => {
        const s = String(raw || '').trim();
        if (!s) return;
        const sk = s.toLowerCase();
        const inSchool = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].filter(
            (n) => (getStudentSchoolName(n) || '').trim().toLowerCase() === sk
        );
        if (inSchool.length === 0) {
            visible.add(s);
        } else if (inSchool.every((n) => tutorLc(n) === tLc)) {
            visible.add(s);
        }
    });
    return [...visible].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

window.getSchoolNamesForStudentSchoolSelect = getSchoolNamesForStudentSchoolSelect;

function refreshAddStudentSchoolSelect(selectedSchool = '') {
    const schoolSelect = document.getElementById('addStudentGroupSelect');
    if (!schoolSelect) return;
    const selected = String(selectedSchool || '').trim();
    const options = getSchoolNamesForStudentSchoolSelect();
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

function refreshAddStudentTeacherSelect(selectedTeacher = '') {
    const sel = document.getElementById('addStudentMentor');
    if (!sel || sel.tagName !== 'SELECT') return;
    const want = String(selectedTeacher || sel.value || '').trim();
    const prevLower = want.toLowerCase();
    sel.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select a teacher';
    ph.disabled = true;
    ph.hidden = true;
    sel.appendChild(ph);
    teachersList.forEach((raw) => {
        const n = String(raw || '').trim();
        if (!n) return;
        const o = document.createElement('option');
        o.value = n;
        o.textContent = n;
        sel.appendChild(o);
    });
    const stored = String(want || '').trim();
    if (stored && !teachersList.some((t) => String(t || '').trim().toLowerCase() === stored.toLowerCase())) {
        const o = document.createElement('option');
        o.value = stored;
        o.textContent = stored;
        sel.appendChild(o);
    }
    const match = teachersList.find((t) => String(t || '').trim().toLowerCase() === prevLower)
        || (stored && stored.toLowerCase() === prevLower ? stored : null);
    const hasMatch = !!match;
    sel.value = hasMatch ? String(match) : '';
    ph.selected = !hasMatch;
}

/**
 * Teachers eligible for assignment in the modern Add Student modal. Matches sidebar: coordinators
 * (effective admin session) see all profiles; plain teachers see only themselves.
 */
/**
 * Teachers shown in mentor dropdowns (add/edit student): coordinators / effective admins see everyone;
 * plain teachers only see themselves (same rule as sidebar teacher list).
 */
function getTeachersForStudentMentorSelect() {
    if (String(loggedInStudentFullName || '').trim()) return [];
    const names = teachersList.map((t) => String(t || '').trim()).filter(Boolean);
    if (!names.length) return [];
    if (hasEffectiveAdminSession()) return [...names];
    if (isTeacherLoggedIn && String(loggedInTeacherName || '').trim()) {
        const lc = String(loggedInTeacherName || '').trim().toLowerCase();
        return names.filter((n) => n.toLowerCase() === lc);
    }
    return [...names];
}

/**
 * Shared mentor dropdown for modern add-student overlay and edit-student modal.
 * @param {'add'|'edit'} mode
 * @param {string} [preferredAssigned] Saved mentor name (edit); kept as option if absent from roster-eligible list.
 */
function fillStudentMentorSelect(sel, mode, preferredAssigned = '') {
    if (!sel || sel.tagName !== 'SELECT') return;
    const preferred = String(preferredAssigned || '').trim();
    let choices = [...getTeachersForStudentMentorSelect()];

    if (mode === 'edit' && preferred && !choices.some((n) => n.toLowerCase() === preferred.toLowerCase())) {
        choices.push(preferred);
    }

    sel.replaceChildren();

    if (choices.length === 0) {
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = 'No teacher profiles yet';
        ph.disabled = true;
        sel.appendChild(ph);
        sel.disabled = true;
        return;
    }

    if (choices.length === 1) {
        const only = choices[0];
        const o = document.createElement('option');
        o.value = only;
        o.textContent = only;
        sel.appendChild(o);
        sel.value = only;
        // Keep enabled so the selected mentor value stays readable reliably across browsers/forms.
        sel.disabled = false;
        return;
    }

    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select a teacher';
    ph.disabled = true;
    ph.hidden = true;
    sel.appendChild(ph);

    choices.forEach((n) => {
        const o = document.createElement('option');
        o.value = n;
        o.textContent = n;
        sel.appendChild(o);
    });

    sel.disabled = false;

    const preferredMatch = preferred
        ? choices.find((n) => n.toLowerCase() === preferred.toLowerCase()) || ''
        : '';

    if (mode === 'edit') {
        if (preferredMatch) {
            sel.value = preferredMatch;
        } else {
            ph.selected = true;
            sel.value = '';
        }
    } else {
        const logged = String(loggedInTeacherName || '').trim().toLowerCase();
        const pick = logged ? choices.find((n) => n.toLowerCase() === logged) || '' : '';
        if (pick) {
            sel.value = pick;
        } else {
            ph.selected = true;
            sel.value = '';
        }
    }
}

function refreshModernStudentTeacherSelect() {
    fillStudentMentorSelect(document.getElementById('studentModalTeacher'), 'add');
}

window.refreshModernStudentTeacherSelect = refreshModernStudentTeacherSelect;

function refreshEditStudentTeacherSelect(selectedTeacher = '') {
    fillStudentMentorSelect(document.getElementById('editStudentTeacher'), 'edit', selectedTeacher);
}

function syncAddStudentModalThemeFromSchoolTitle(schoolTitleRaw) {
    const schoolTitle = String(schoolTitleRaw || '').trim();
    const primaryInput = document.getElementById('addSchoolPrimaryColor');
    const secondaryInput = document.getElementById('addSchoolSecondaryColor');
    if (!primaryInput || !secondaryInput) return;
    if (!schoolTitle) {
        primaryInput.value = '#5c6bc0';
        secondaryInput.value = '#1e88e5';
        renderAddSchoolThemeSquares();
        return;
    }
    const th = getSchoolTheme(schoolTitle);
    primaryInput.value = th.primary || '#5c6bc0';
    secondaryInput.value = th.secondary || '#1e88e5';
    renderAddSchoolThemeSquares();
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
    loadStudentClassReportUploads();
}

function saveStudentClassReportRows() {
    try {
        localStorage.setItem(CLASS_REPORT_ROWS_KEY, JSON.stringify(studentClassReportRows));
    } catch (error) {
        console.error('Error saving class report rows:', error);
    }
}

function cloneQuestionListForMemory(qs) {
    return (Array.isArray(qs) ? qs : []).map((q, index) => ({
        id: String(q?.id || `q_${index}_${Date.now()}`).trim(),
        speaker: q?.speaker === 'student' ? 'student' : 'teacher',
        text: String(q?.text || q?.question || '')
    }));
}

function manifestStudentRecordToSkeletonFeed(students) {
    const out = {};
    if (!students || typeof students !== 'object') return out;
    Object.entries(students).forEach(([name, uploads]) => {
        const studentKey = String(name || '').trim();
        if (!studentKey || !Array.isArray(uploads)) return;
        const list = uploads
            .map((upload) => {
                if (!upload || typeof upload !== 'object' || upload.kind === 'question') return null;
                const id = String(upload.id || '').trim();
                if (!id) return null;
                return {
                    id,
                    name: String(upload.name || 'Uploaded file'),
                    type: String(upload.type || '').toLowerCase(),
                    dataUrl: '',
                    blobUrl: '',
                    url: '',
                    questions: cloneQuestionListForMemory(upload.questions),
                    relatedFiles: (Array.isArray(upload.relatedFiles) ? upload.relatedFiles : [])
                        .filter((rf) => rf && typeof rf === 'object' && rf.id)
                        .map((rf) => ({
                            id: String(rf.id).trim(),
                            name: String(rf.name || 'Related file'),
                            type: String(rf.type || '').toLowerCase(),
                            dataUrl: '',
                            blobUrl: '',
                            url: ''
                        }))
                };
            })
            .filter(Boolean);
        if (list.length) out[studentKey] = list;
    });
    return out;
}

function memoryToStudentManifestBuckets() {
    const students = {};
    Object.entries(studentClassReportUploadsByName || {}).forEach(([studentName, uploads]) => {
        const key = String(studentName || '').trim();
        if (!key || !Array.isArray(uploads)) return;
        const rows = uploads
            .map((upload) => {
                if (!upload || typeof upload !== 'object') return null;
                const id = String(upload.id || '').trim();
                if (!id) return null;
                return {
                    id,
                    name: String(upload.name || 'Uploaded file'),
                    type: String(upload.type || '').toLowerCase(),
                    questions: cloneQuestionListForMemory(upload.questions),
                    relatedFiles: (Array.isArray(upload.relatedFiles) ? upload.relatedFiles : []).map((rf) => ({
                        id: String(rf.id || '').trim(),
                        name: String(rf.name || 'Related file'),
                        type: String(rf.type || '').toLowerCase()
                    }))
                };
            })
            .filter(Boolean);
        if (rows.length) students[key] = rows;
    });
    return students;
}

function memoryToManifest() {
    return { students: memoryToStudentManifestBuckets() };
}

/** Match `coerceManifest` in `functions/api/class-report-uploads.js` (+ key order independence) so poll skips stay correct. */
const MANIFEST_FP_MAX_UPLOADS = 40;
const MANIFEST_FP_MAX_RELATED = 20;

function canonicalManifestFingerprintJSON(value) {
    if (value === null || value === undefined) return 'null';
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') return JSON.stringify(value);
    if (Array.isArray(value)) {
        return '[' + value.map((el) => canonicalManifestFingerprintJSON(el)).join(',') + ']';
    }
    if (t === 'object') {
        return (
            '{' +
            Object.keys(value)
                .sort()
                .map((key) => JSON.stringify(key) + ':' + canonicalManifestFingerprintJSON(value[key]))
                .join(',') +
            '}'
        );
    }
    return JSON.stringify(String(value));
}

/** Flatten manifest students to server-shaped rows for a stable fingerprint. */
function normalizeManifestBucketsForFingerprint(studentsRecord) {
    const out = {};
    Object.keys(studentsRecord || {})
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .forEach((studentKey) => {
            const key = String(studentKey || '').trim();
            const uploads = studentsRecord[key];
            if (!key || !Array.isArray(uploads)) return;
            const rows = uploads
                .slice(0, MANIFEST_FP_MAX_UPLOADS)
                .map((upload) => {
                    if (!upload || typeof upload !== 'object' || upload.kind === 'question') return null;
                    const id = String(upload.id || '').trim();
                    if (!id) return null;
                    const rfIn = Array.isArray(upload.relatedFiles) ? upload.relatedFiles : [];
                    const relatedFiles = rfIn.slice(0, MANIFEST_FP_MAX_RELATED).map((r) => {
                        if (!r || typeof r !== 'object') return null;
                        const rid = String(r.id || '').trim();
                        if (!rid) return null;
                        return {
                            id: rid,
                            name: String(r.name || 'Related file').slice(0, 380),
                            type: String(r.type || '').toLowerCase().slice(0, 120),
                        };
                    }).filter(Boolean);
                    const questionsRaw = Array.isArray(upload.questions) ? upload.questions : [];
                    const questions = questionsRaw.map((q, index) => ({
                        id: String(q?.id || `q_${id}_${index}`).slice(0, 140),
                        speaker: q?.speaker === 'student' ? 'student' : 'teacher',
                        text: String(q?.text || q?.question || '').slice(0, 8000),
                    }));
                    return {
                        id,
                        name: String(upload.name || 'Uploaded file').slice(0, 380),
                        type: String(upload.type || '').toLowerCase().slice(0, 120),
                        relatedFiles,
                        questions,
                    };
                })
                .filter(Boolean);
            if (rows.length) out[key] = rows;
        });
    return { students: out };
}

function stableStringifyManifestStudents(studentsRecord) {
    try {
        const normalized = normalizeManifestBucketsForFingerprint(studentsRecord);
        return canonicalManifestFingerprintJSON(normalized);
    } catch {
        return '';
    }
}

function bumpClassReportUploadsSyncFingerprint() {
    try {
        lastSyncedClassReportUploadsJson = stableStringifyManifestStudents(memoryToStudentManifestBuckets());
    } catch {
        lastSyncedClassReportUploadsJson = '';
    }
}

function revokeIfBlobLikeUrl(fileSlice) {
    if (!fileSlice) return;
    const cand = String(fileSlice.blobUrl || fileSlice.url || '').trim();
    if (cand.startsWith('blob:')) URL.revokeObjectURL(cand);
}

function revokeUploadDerivedUrls(upload) {
    if (!upload) return;
    revokeIfBlobLikeUrl(upload);
    (Array.isArray(upload.relatedFiles) ? upload.relatedFiles : []).forEach((rf) => revokeIfBlobLikeUrl(rf));
    (Array.isArray(upload.audioFiles) ? upload.audioFiles : []).forEach((a) => revokeIfBlobLikeUrl(a));
}

function revokeAllUrlsInStudentMap(map) {
    Object.values(map || {}).forEach((feed) =>
        (Array.isArray(feed) ? feed : []).forEach((u) => revokeUploadDerivedUrls(u))
    );
}

function collectManifestAssetIds(manifestStudents) {
    const ids = new Set();
    if (!manifestStudents || typeof manifestStudents !== 'object') return [];
    Object.values(manifestStudents).forEach((uploads) => {
        if (!Array.isArray(uploads)) return;
        uploads.forEach((upload) => {
            if (!upload || typeof upload !== 'object') return;
            if (upload.id) ids.add(String(upload.id));
            if (Array.isArray(upload.relatedFiles)) {
                upload.relatedFiles.forEach((rf) => {
                    if (rf?.id) ids.add(String(rf.id));
                });
            }
        });
    });
    return [...ids];
}

async function persistClassReportOfflineSnapshot(extra = {}) {
    if (typeof ClassReportUploadsStore === 'undefined') return;
    try {
        const manifest = memoryToManifest();
        const pkg = {
            lastUpdated:
                extra.remoteLastUpdated != null
                    ? String(extra.remoteLastUpdated)
                    : classReportUploadsCloudTimestamp || '',
            manifest
        };
        await ClassReportUploadsStore.metaPut('offlineSnapshot', pkg);
        bumpClassReportUploadsSyncFingerprint();
    } catch (e) {
        console.warn('persistClassReportOfflineSnapshot:', e);
    }
}

async function hydrateMapWithCachedBlobsOnly(map) {
    if (!map || typeof ClassReportUploadsStore === 'undefined') return;
    for (const feed of Object.values(map)) {
        if (!Array.isArray(feed)) continue;
        for (const upload of feed) {
            if (!upload) continue;
            const mainBlob = await ClassReportUploadsStore.getBlob(upload.id);
            if (mainBlob) {
                revokeIfBlobLikeUrl(upload);
                const url = URL.createObjectURL(mainBlob);
                upload.blobUrl = url;
                upload.url = url;
                upload.dataUrl = '';
            }
            for (const rf of upload.relatedFiles || []) {
                if (!rf?.id) continue;
                const rblob = await ClassReportUploadsStore.getBlob(rf.id);
                if (rblob) {
                    revokeIfBlobLikeUrl(rf);
                    const rurl = URL.createObjectURL(rblob);
                    rf.blobUrl = rurl;
                    rf.url = rurl;
                    rf.dataUrl = '';
                }
            }
        }
    }
}

async function applyServerAssetBundlesToMemory(map, assets) {
    if (!map || !assets || typeof assets !== 'object' || typeof ClassReportUploadsStore === 'undefined') return;
    for (const feed of Object.values(map)) {
        if (!Array.isArray(feed)) continue;
        for (const upload of feed) {
            const duMain = assets[upload.id];
            if (duMain) {
                const blob = await ClassReportUploadsStore.dataUrlToBlob(duMain);
                await ClassReportUploadsStore.putBlob(upload.id, blob);
                revokeIfBlobLikeUrl(upload);
                const url = URL.createObjectURL(blob);
                upload.blobUrl = url;
                upload.url = url;
                upload.dataUrl = '';
            }
            for (const rf of upload.relatedFiles || []) {
                if (!rf?.id) continue;
                const du = assets[rf.id];
                if (!du) continue;
                const rblob = await ClassReportUploadsStore.dataUrlToBlob(du);
                await ClassReportUploadsStore.putBlob(rf.id, rblob);
                revokeIfBlobLikeUrl(rf);
                const ru = URL.createObjectURL(rblob);
                rf.blobUrl = ru;
                rf.url = ru;
                rf.dataUrl = '';
            }
        }
    }
}

let lastRemoteManifestFingerprint = '';

let classReportUploadPushInFlight = 0;
/** Serialized cloud pulls so overlapping polls cannot run `applyRemoteManifestPayload` concurrently. */
let classReportUploadPullInFlight = false;

async function fetchClassReportUploadAssetsByIds(ids) {
    const idList = (Array.isArray(ids) ? ids : []).slice(0, 96);
    if (!idList.length) return {};
    const url = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
    if (!url) return {};
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
        cache: 'no-cache',
        body: JSON.stringify({ action: 'fetchAssets', ids: idList })
    });
    if (!res.ok) return {};
    const data = await res.json().catch(() => null);
    if (!data?.success || !data.assets || typeof data.assets !== 'object') return {};
    return data.assets;
}

async function applyRemoteManifestPayload(manifest, lastUpdated) {
    const studentsBucket = manifest && manifest.students && typeof manifest.students === 'object' ? manifest.students : {};
    const fpNew = stableStringifyManifestStudents(studentsBucket);

    revokeAllUrlsInStudentMap(studentClassReportUploadsByName);
    studentClassReportUploadsByName = manifestStudentRecordToSkeletonFeed(studentsBucket);
    await hydrateMapWithCachedBlobsOnly(studentClassReportUploadsByName);

    const needed = collectManifestAssetIds(studentsBucket);
    const have = new Set();

    Object.values(studentClassReportUploadsByName).forEach((feed) =>
        (Array.isArray(feed) ? feed : []).forEach((u) => {
            const mainOk = `${u.blobUrl || ''}`.startsWith('blob:') || `${u.dataUrl || ''}`.startsWith('data:');
            if (mainOk) have.add(u.id);
            (u.relatedFiles || []).forEach((rf) => {
                const ok = `${rf.blobUrl || ''}`.startsWith('blob:') || `${rf.dataUrl || ''}`.startsWith('data:');
                if (ok) have.add(rf.id);
            });
        })
    );

    let missing = needed.filter((id) => id && !have.has(id));

    while (missing.length > 0) {
        const chunk = missing.splice(0, 40);
        const bundle = await fetchClassReportUploadAssetsByIds(chunk);
        await applyServerAssetBundlesToMemory(studentClassReportUploadsByName, bundle);
    }

    if (lastUpdated) setClassReportUploadsCloudTimestamp(lastUpdated);

    await persistClassReportOfflineSnapshot({ remoteLastUpdated: lastUpdated });
    refreshVisibleStudentClassReportUploadFeed();
    lastSyncedClassReportUploadsJson = fpNew;
    lastRemoteManifestFingerprint = fpNew;
}

async function renameClassReportStudentBucketOnServer(fromStudent, toStudent) {
    const fromName = String(fromStudent || '').trim();
    const toName = String(toStudent || '').trim();
    if (!fromName || !toName || fromName === toName) return false;
    const url = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
    if (!url) return false;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
            body: JSON.stringify({
                action: 'renameStudentBucket',
                fromStudent: fromName,
                toStudent: toName
            })
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (data?.success && data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
        return !!data?.success;
    } catch (e) {
        console.warn('renameClassReportStudentBucketOnServer', e);
        return false;
    }
}

async function patchClassReportUploadQuestionsOnServer(studentKey, uploadId, questionsPayload) {
    try {
        const url = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
        if (!url) return false;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
            body: JSON.stringify({
                action: 'patchUploadMeta',
                student: String(studentKey || '').trim(),
                uploadId: String(uploadId || '').trim(),
                questions: Array.isArray(questionsPayload)
                    ? questionsPayload.map((q) => ({
                        id: q.id,
                        speaker: q.speaker === 'student' ? 'student' : 'teacher',
                        text: String(q.text || '')
                    }))
                    : []
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) return false;
        if (data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
        await persistClassReportOfflineSnapshot({ remoteLastUpdated: data.lastUpdated });
        return true;
    } catch (e) {
        console.warn('patchUploadMeta err', e);
        return false;
    }
}

const classReportQuestionPatchDebounceTimers = Object.create(null);

function debouncePatchClassReportQuestions(studentKey, uploadId) {
    if (!canEditFeed()) return;
    const sid = String(studentKey || '').trim();
    const uid = String(uploadId || '').trim();
    if (!sid || !uid) return;
    const k = `${sid}::${uid}`;
    window.clearTimeout(classReportQuestionPatchDebounceTimers[k]);
    classReportQuestionPatchDebounceTimers[k] = window.setTimeout(() => {
        delete classReportQuestionPatchDebounceTimers[k];
        const feed = getStudentClassReportUploadFeed(sid);
        const target = feed.find((x) => x && x.id === uid);
        if (!target) return;
        classReportUploadPushInFlight++;
        void (async () => {
            try {
                await patchClassReportUploadQuestionsOnServer(sid, uid, target.questions || []);
            } finally {
                classReportUploadPushInFlight--;
            }
        })();
    }, 260);
}

async function flushClassReportReplaceManifestFromMemory() {
    if (!canEditFeed()) return;
    classReportUploadPushInFlight++;
    try {
        const url = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
        if (!url) {
            console.warn('replaceManifest: page must be served over http(s)');
            return;
        }
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
            body: JSON.stringify({
                action: 'replaceManifest',
                manifest: memoryToManifest()
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
            console.warn('replaceManifest failed', data?.error || res.status);
            return;
        }
        if (data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
        await persistClassReportOfflineSnapshot({ remoteLastUpdated: data.lastUpdated });
        lastRemoteManifestFingerprint = stableStringifyManifestStudents(memoryToStudentManifestBuckets());
    } catch (e) {
        console.warn('replaceManifest', e);
    } finally {
        classReportUploadPushInFlight--;
    }
}

async function loadStudentClassReportUploads() {
    if (typeof ClassReportUploadsStore === 'undefined') {
        bumpClassReportUploadsSyncFingerprint();
        return studentClassReportUploadsByName;
    }
    try {
        const snap = await ClassReportUploadsStore.metaGet('offlineSnapshot');
        const rawManifest = snap && snap.manifest ? snap.manifest : null;
        const buckets = rawManifest && rawManifest.students ? rawManifest.students : null;
        if (buckets && typeof buckets === 'object') {
            const prevFp = lastSyncedClassReportUploadsJson;
            revokeAllUrlsInStudentMap(studentClassReportUploadsByName);
            studentClassReportUploadsByName = manifestStudentRecordToSkeletonFeed(buckets);
            await hydrateMapWithCachedBlobsOnly(studentClassReportUploadsByName);
            bumpClassReportUploadsSyncFingerprint();
            if (lastSyncedClassReportUploadsJson !== prevFp) refreshVisibleStudentClassReportUploadFeed();
            if (snap.lastUpdated && String(snap.lastUpdated).trim())
                maybeAdvanceClassReportUploadsCloudTsFromPoll(String(snap.lastUpdated));
        }
    } catch (e) {
        console.warn('loadStudentClassReportUploads cache hydrate', e);
    }
    bumpClassReportUploadsSyncFingerprint();
    return studentClassReportUploadsByName;
}



function studentClassReportPanelHasTypingFocus(panel) {
    const p = panel || document.getElementById('studentClassReportPanel');
    if (!p || p.hidden) return false;
    const ae = document.activeElement;
    if (!ae || !p.contains(ae)) return false;
    const tag = String(ae.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA') return true;
    if (tag === 'SELECT') return true;
    if (ae.isContentEditable || (ae.closest && ae.closest('[contenteditable="true"]'))) return true;
    if (tag === 'INPUT') {
        const typ = String(ae.type || '').toLowerCase();
        if (
            typ === 'checkbox'
            || typ === 'radio'
            || typ === 'button'
            || typ === 'submit'
            || typ === 'reset'
            || typ === 'hidden'
            || typ === 'file'
        ) {
            return false;
        }
        return true;
    }
    return false;
}

function attachClassReportFeedReflowAfterFocusLeavesPanel(panel) {
    if (!panel || panel.dataset.classReportReflowBlurBound === '1') return;
    panel.dataset.classReportReflowBlurBound = '1';
    const flush = () => {
        queueMicrotask(() => {
            if (!panel.isConnected) return;
            if (studentClassReportPanelHasTypingFocus(panel)) return;
            panel.removeEventListener('focusout', flush, true);
            panel._classReportFeedFocusFlush = null;
            panel.dataset.classReportReflowBlurBound = '';
            refreshVisibleStudentClassReportUploadFeed({ forceReflow: true });
        });
    };
    panel._classReportFeedFocusFlush = flush;
    panel.addEventListener('focusout', flush, true);
}

/** @param {{ forceReflow?: boolean }} [opts] */
function refreshVisibleStudentClassReportUploadFeed(opts = {}) {
    const panel = document.getElementById('studentClassReportPanel');
    if (!panel || panel.hidden) return;
    const forceReflow = opts.forceReflow === true;
    if (!forceReflow && studentClassReportPanelHasTypingFocus(panel)) {
        attachClassReportFeedReflowAfterFocusLeavesPanel(panel);
        return;
    }
    const prevFlush =
        typeof panel._classReportFeedFocusFlush === 'function' ? panel._classReportFeedFocusFlush : null;
    if (prevFlush) {
        panel.removeEventListener('focusout', prevFlush, true);
        panel._classReportFeedFocusFlush = null;
    }
    panel.dataset.classReportReflowBlurBound = '';
    const loggedStudent = String(loggedInStudentFullName || '').trim();
    let studentName = loggedStudent;
    if (!studentName) {
        studentName = String(panel.dataset.studentName || currentTeacher || '').trim();
    }
    if (!studentName) return;
    renderStudentClassReportUploadFeed(panel, studentName);
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

/**
 * Tutor "available" (green) belongs on the teacher profile only. Student grids may have picked it up
 * from the logged-in merge; strip it from stored / teacher-facing student views.
 */
function stripTeacherAvailabilityFromStudentScheduleCopy(sched) {
    const out = { ...sched };
    Object.keys(out).forEach((k) => {
        if (String(out[k] || '').trim().toLowerCase() === 'available') {
            delete out[k];
        }
    });
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

/** States authored on the teacher grid — must not be replaced by SpeakOn/student overlays when syncing to KV (matches `BOOKED_CLASS_SLOT_STATE` + tutor-only slots). */
function isTeacherExclusiveScheduleOverlayState(state) {
    const s = String(state || '').trim().toLowerCase();
    return s === 'available' || s === 'unavailable' || s === 'rescheduled' || s === 'booked';
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
        if (isTeacherExclusiveScheduleOverlayState(out[k])) return;
        out[k] = keyBest[k];
    });
    return out;
}

/** Which schedule keys should receive SpeakOn color sync for the current session (avoids recreating other teachers' grids). */
function getTeacherNamesForSpeakOnSync() {
    if (String(loggedInStudentFullName || '').trim()) {
        const tk = getTutorRosterNameForStudent(loggedInStudentFullName);
        return tk ? [tk] : [];
    }
    if (isAdminLoggedIn) {
        return teachersList.map((t) => String(t || '').trim()).filter(Boolean);
    }
    if (isTeacherLoggedIn && String(loggedInTeacherName || '').trim()) {
        return [String(loggedInTeacherName).trim()];
    }
    return teachersList.map((t) => String(t || '').trim()).filter(Boolean);
}

/** Recompute SpeakOn magenta/salmon on every teacher profile from student grids + roster. */
function syncSpeakOnWeeklyToAllTeacherSchedules() {
    getTeacherNamesForSpeakOnSync().forEach((tName) => {
        const raw = teacherSchedules[tName] ? { ...teacherSchedules[tName] } : {};
        const slotsOnly = getScheduleSlotMapWithoutMeta(raw);
        const unavailableMeta = getUnavailableStudentNamesMetaFromSchedule(raw);
        teacherSchedules[tName] = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(slotsOnly);
        if (Object.keys(unavailableMeta).length > 0) {
            teacherSchedules[tName][TEACHER_UNAVAILABLE_STUDENTS_META_KEY] = unavailableMeta;
        }
    });
    if (currentTeacher && isActiveTeacherName(currentTeacher)) {
        slotStates = getScheduleSlotMapWithoutMeta(teacherSchedules[currentTeacher]);
        if (document.getElementById('timeSlots')?.querySelector('.time-slot')) {
            refreshCalendarDisplay();
        }
    } else if (
        currentTeacher &&
        loggedInStudentFullName &&
        String(currentTeacher).trim().toLowerCase() === String(loggedInStudentFullName).trim().toLowerCase()
    ) {
        const tk = getTutorRosterNameForStudent(loggedInStudentFullName);
        if (tk) {
            slotStates = mergeStudentCalendarWithTutorFreeSlots(loggedInStudentFullName, tk);
            if (document.getElementById('timeSlots')?.querySelector('.time-slot')) {
                refreshCalendarDisplay();
            }
        }
    }
}

let calendarStudentPopoverOpen = false;
let calendarStudentNamesInCellsVisible = false;
let calendarLinkPopoverOpen = false;
let calendarLinkPopoverHideTimer = null;
let calendarNameVisibleSchoolKeys = new Set();
let calendarSchoolFilterDefaulted = false;
let calendarStudentPopoverHideTimer = null;
let calendarPromptPopoverOpen = false;
let calendarPromptSelectedDays = new Set();
let calendarPromptPopoverHideTimer = null;
let calendarPromptBackdropHideTimer = null;
let googleMeetLinksLayerHideTimer = null;

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
    if (isAdminLoggedIn) return true;
    ensureCalendarSchoolFilterSelection();
    if (!calendarStudentNamesInCellsVisible) return false;
    if (calendarNameVisibleSchoolKeys.size === 0) return false;
    return calendarNameVisibleSchoolKeys.has(getStudentSchoolKey(name));
}

function syncCalendarStudentNamesButtonState() {
    const btn = document.getElementById('calendarToolbarStudentsBtn');
    if (!btn) return;
    btn.classList.toggle('is-active', calendarStudentNamesInCellsVisible);
    btn.setAttribute('aria-pressed', calendarStudentNamesInCellsVisible ? 'true' : 'false');
}

function ensureCalendarSchoolFilterSelection() {
    if (calendarSchoolFilterDefaulted) {
        syncCalendarStudentNamesButtonState();
        return;
    }
    const schoolKeys = getAvailableSchoolNames()
        .map((schoolName) => schoolThemeKey(schoolName))
        .filter(Boolean);
    if (schoolKeys.length === 0) {
        calendarStudentNamesInCellsVisible = false;
        syncCalendarStudentNamesButtonState();
        return;
    }
    calendarNameVisibleSchoolKeys = new Set(schoolKeys);
    calendarStudentNamesInCellsVisible = true;
    calendarSchoolFilterDefaulted = true;
    syncCalendarStudentNamesButtonState();
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

function getSchoolManagedTeacherStateTokenForSlot(teacherName, day, hour) {
    if (!teacherName || !isActiveTeacherName(teacherName)) return '';
    const key = `${day}-${hour}`;
    const aggregated = applyAllSpeakOnStudentColorsToTeacherScheduleCopy({});
    const raw = String(aggregated[key] || '').trim().toLowerCase();
    if (!raw) return '';
    const resolved = resolveSchoolTokenInfoFromState(raw);
    if (resolved?.token) return resolved.token;
    return (parseSchoolStateToken(raw) || isLegacyOverlayState(raw)) ? raw : '';
}

function isSchoolManagedTeacherSlotLocked(day, hour) {
    return !!getSchoolManagedTeacherStateTokenForSlot(currentTeacher, day, hour);
}

function renderStudentNamesInSlot(slotEl, day, hour, state) {
    if (!slotEl) return;
    ensureCalendarSchoolFilterSelection();
    const assignedUnavailableName = getUnavailableAssignedStudentNameForCurrentTeacherSlot(day, hour, state);
    if (!calendarStudentNamesInCellsVisible && !assignedUnavailableName) {
        slotEl.textContent = '';
        slotEl.title = '';
        slotEl.classList.remove('time-slot--with-student-names');
        return;
    }
    const names = assignedUnavailableName ? [assignedUnavailableName] : getStudentNamesForTeacherSlot(day, hour, state);
    const label = names.join(', ');
    slotEl.textContent = '';
    if (label) {
        const wrap = document.createElement('span');
        wrap.className = 'time-slot-student-names';
        names.forEach((name, index) => {
            if (index > 0) {
                wrap.appendChild(document.createTextNode(', '));
            }
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'time-slot-student-chip';
            chip.dataset.studentId = buildGoogleMeetStudentId(name);
            chip.textContent = normalizeStudentDisplayName(name);
            chip.title = name;
            chip.setAttribute('aria-label', `Show ${name} in student list`);
            wrap.appendChild(chip);
        });
        slotEl.appendChild(wrap);
    }
    slotEl.title = label;
    slotEl.classList.toggle('time-slot--with-student-names', names.length > 0);
    if (names.length > 0) {
        queueCalendarStudentChipFitCheck(slotEl);
    }
}

/** Expand a collapsed Class Report school group (keeps `classReportCollapsedBySchool` in sync). */
function expandClassReportGroupIfCollapsed(groupEl) {
    if (!groupEl || !groupEl.classList.contains('collapsed')) return false;
    const key = String(groupEl.dataset.classReportSchoolKey || '').trim();
    if (key) {
        classReportCollapsedBySchool[key] = false;
    }
    const body = groupEl.querySelector('.class-report-group-body');
    const title = groupEl.querySelector('.class-report-group-title');
    title?.setAttribute('aria-expanded', 'true');
    groupEl.classList.remove('collapsed');
    if (body) {
        const prevTransition = body.style.transition;
        body.style.transition = 'none';
        body.style.maxHeight = '';
        body.style.opacity = '1';
        body.style.transform = 'translateY(0)';
        void body.offsetHeight;
        body.style.transition = prevTransition;
    }
    return true;
}

/** Teacher calendar: scroll Class Report list to the student and highlight the row (same look as row hover). */
function scrollSidebarStudentIntoViewFromCalendarChip(studentId) {
    const id = String(studentId || '').trim();
    if (!id || !currentTeacher || !isActiveTeacherName(currentTeacher)) return;

    const esc = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id.replace(/"/g, '\\"');
    const reportItem = document.querySelector(`.class-report-student-item[data-student-id="${esc}"]`);
    if (!reportItem) return;

    const reportGroup = reportItem.closest('.class-report-group');
    const hadToExpand = expandClassReportGroupIfCollapsed(reportGroup);

    const prefersReduce =
        typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const runScrollAndHighlight = () => {
        reportItem.scrollIntoView({
            behavior: prefersReduce ? 'auto' : 'smooth',
            block: 'center'
        });
        reportItem.classList.add('class-report-student-item--calendar-focus');
        window.setTimeout(() => {
            reportItem.classList.remove('class-report-student-item--calendar-focus');
        }, 1200);
    };

    if (hadToExpand) {
        requestAnimationFrame(() => {
            requestAnimationFrame(runScrollAndHighlight);
        });
    } else {
        runScrollAndHighlight();
    }
}

function getUnavailableAssignedStudentNameForCurrentTeacherSlot(day, hour, state) {
    const normalized = String(state || '').trim().toLowerCase();
    if (normalized !== 'unavailable' && normalized !== 'rescheduled' && normalized !== BOOKED_CLASS_SLOT_STATE) return '';
    const key = `${day}-${hour}`;
    if (loggedInStudentFullName) {
        return String(studentVisibleRescheduledNamesBySlot[key] || '').trim();
    }
    if (!currentTeacher || !isActiveTeacherName(currentTeacher)) return '';
    const byTeacher = teacherUnavailableStudentNamesByTeacher[currentTeacher];
    if (!byTeacher || typeof byTeacher !== 'object') return '';
    return String(byTeacher[key] || '').trim();
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

function isTeacherGreenCellContextMenuEnabled(day, hour) {
    if (!currentTeacher || !isActiveTeacherName(currentTeacher)) return false;
    if (isLoggedInStudentCalendarReadOnly()) return false;
    const state = String(getSlotState(day, hour) || '').trim().toLowerCase();
    return state === 'available';
}

/**
 * Book a green (available) tutor slot for a student: yellow `booked` cell + name in `__unavailableStudentNames`.
 * Returns false when the slot cannot be booked or the user may not edit.
 */
function teacherBookGreenSlotForStudent(day, hour, studentName) {
    if (isLoggedInStudentCalendarReadOnly()) {
        showAppMessage('View only — your teacher manages this schedule.');
        return false;
    }
    if (isGateViewingAlienTeacherGrid() && getGateSessionAppRole() !== 'class-supervisor') {
        showAppMessage('Only a class supervisor can book classes on this teacher schedule.');
        return false;
    }
    if (!currentTeacher || !isActiveTeacherName(currentTeacher)) return false;
    const nm = String(studentName || '').trim();
    if (!nm) return false;
    const slotKey = `${day}-${hour}`;
    const cur = String(getSlotState(day, hour) || '').trim().toLowerCase();
    if (cur !== 'available') {
        showAppMessage('This slot is already booked or not available.');
        return false;
    }
    if (isSchoolManagedTeacherSlotLocked(day, hour)) {
        showAppMessage('This class is managed by Schools and cannot be edited here.');
        return false;
    }
    if (!teacherUnavailableStudentNamesByTeacher[currentTeacher]) {
        teacherUnavailableStudentNamesByTeacher[currentTeacher] = {};
    }
    teacherUnavailableStudentNamesByTeacher[currentTeacher][slotKey] = nm;
    if (isGateViewingAlienTeacherGrid() && getGateSessionAppRole() === 'class-supervisor') {
        if (!supervisorSlotBookingsByTeacher[currentTeacher]) {
            supervisorSlotBookingsByTeacher[currentTeacher] = {};
        }
        supervisorSlotBookingsByTeacher[currentTeacher][slotKey] = true;
    }
    setSlotState(day, hour, BOOKED_CLASS_SLOT_STATE);
    return true;
}

function handleTeacherGreenContextMenuAction(action) {
    if (!currentSlot || !action) return;
    const { day, hour } = currentSlot;
    if (action === 'block') {
        setSlotState(day, hour, null);
        return;
    }
    if (action === 'reposition') {
        openStudentRepositionModal(day, hour);
        return;
    }
    if (action === 'book') {
        const selectedSchool = String(contextMenu?.dataset.selectedSchool || '').trim();
        if (!selectedSchool) {
            showAppMessage('Please choose a school first.');
            return;
        }
        showAppMessage(`Booking flow for ${selectedSchool} on ${day} at ${formatHour(hour)} will be added next.`);
        return;
    }
    if (action === 'book-school') {
        const selectedSchool = String(contextMenu?.dataset.selectedSchool || '').trim();
        if (!selectedSchool) {
            showAppMessage('Please choose a school first.');
            return;
        }
        showAppMessage(`Booking flow for ${selectedSchool} on ${day} at ${formatHour(hour)} will be added next.`);
        return;
    }
    if (action === 'set-class-reposition') {
        showBookClassStudentsSubmenuForAllStudents();
        return;
    }
    if (action === 'reserve') {
        showAppMessage(`Reserve flow for ${day} at ${formatHour(hour)} will be added next.`);
        return;
    }
    if (action === 'note') {
        showAppMessage(`Slot notes for ${day} at ${formatHour(hour)} will be added next.`);
        return;
    }
    if (action === 'clear') {
        setSlotState(day, hour, null);
        return;
    }
}

function applyStateVisualToSlot(slot, state) {
    if (!slot) return;
    slot.classList.remove('state-available', 'state-unavailable', 'state-school', 'state-booked');
    slot.style.removeProperty('--slot-school-bg');
    slot.style.removeProperty('--slot-school-border');
    slot.style.removeProperty('--slot-school-shadow');
    if (!state) return;
    const normalized = String(state || '').trim().toLowerCase();
    if (normalized === 'available') {
        slot.classList.add('state-available');
        return;
    }
    if (normalized === BOOKED_CLASS_SLOT_STATE) {
        slot.classList.add('state-booked');
        return;
    }
    if (normalized === 'unavailable' || normalized === 'rescheduled') {
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
        if (calendarStudentPopoverHideTimer) {
            clearTimeout(calendarStudentPopoverHideTimer);
            calendarStudentPopoverHideTimer = null;
        }
        pop.classList.remove('calendar-student-names-popover--enter');
        if (!pop.hidden) {
            pop.classList.add('calendar-student-names-popover--leave');
            calendarStudentPopoverHideTimer = window.setTimeout(() => {
                pop.hidden = true;
                pop.classList.remove('calendar-student-names-popover--leave');
                calendarStudentPopoverHideTimer = null;
            }, 190);
        } else {
            pop.hidden = true;
            pop.classList.remove('calendar-student-names-popover--leave');
        }
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
    if (calendarStudentPopoverHideTimer) {
        clearTimeout(calendarStudentPopoverHideTimer);
        calendarStudentPopoverHideTimer = null;
    }
    renderCalendarStudentNamesList();
    setCalendarStudentNamesInCellsVisible(calendarNameVisibleSchoolKeys.size > 0);
    closeCalendarPromptPopover();
    pop.classList.remove('calendar-student-names-popover--leave');
    pop.hidden = false;
    pop.classList.remove('calendar-student-names-popover--enter');
    void pop.offsetWidth;
    pop.classList.add('calendar-student-names-popover--enter');
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

function ensureCalendarPromptPopover() {
    let backdrop = document.getElementById('calendarPromptPopoverBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'calendarPromptPopoverBackdrop';
        backdrop.className = 'calendar-prompt-popover-backdrop';
        backdrop.hidden = true;
        document.body.appendChild(backdrop);
    }
    if (backdrop.dataset.bound !== '1') {
        backdrop.dataset.bound = '1';
        backdrop.addEventListener('click', () => closeCalendarPromptPopover());
    }
    let pop = document.getElementById('calendarPromptPopover');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'calendarPromptPopover';
        pop.className = 'calendar-prompt-popover';
        pop.hidden = true;
        pop.innerHTML =
            '<div class="calendar-prompt-popover-header">' +
            '  <div class="calendar-prompt-popover-header-icon" aria-hidden="true">💬</div>' +
            '  <div class="calendar-prompt-popover-header-copy">' +
            '    <h4 class="calendar-prompt-popover-title">Copy WhatsApp Message</h4>' +
            '    <p class="calendar-prompt-popover-hint">Select day(s) to generate and copy the class message.</p>' +
            '  </div>' +
            '  <button type="button" id="calendarPromptCloseIconBtn" class="calendar-prompt-close-icon-btn" aria-label="Close">×</button>' +
            '</div>' +
            '<div class="calendar-prompt-popover-body">' +
            '  <div class="calendar-prompt-day-block">' +
            '    <h5 class="calendar-prompt-section-title">1. Choose a day</h5>' +
            '    <p class="calendar-prompt-section-subtitle">Select one or more weekdays.</p>' +
            '    <ul id="calendarPromptDaysList" class="calendar-prompt-days-list"></ul>' +
            '  </div>' +
            '  <div class="calendar-prompt-lower-row">' +
            '    <div class="calendar-prompt-lower-row-content">' +
            '      <div class="calendar-prompt-preview-block">' +
            '        <div class="calendar-prompt-preview-head">' +
            '          <h5 class="calendar-prompt-section-title">2. Preview</h5>' +
            '          <span id="calendarPromptClassCount" class="calendar-prompt-class-count">0 classes</span>' +
            '        </div>' +
            '        <p class="calendar-prompt-section-subtitle">This is how the message will look.</p>' +
            '        <pre id="calendarPromptPreviewText" class="calendar-prompt-preview-text"></pre>' +
            '      </div>' +
            '      <div class="calendar-prompt-popover-footer">' +
            '        <p class="calendar-prompt-section-subtitle">Copy the message and paste it on WhatsApp.</p>' +
            '        <div class="calendar-prompt-popover-actions">' +
            '          <button type="button" id="calendarPromptCopyBtn" class="calendar-prompt-popover-btn calendar-prompt-popover-btn--copy">Copy to clipboard</button>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
        document.body.appendChild(pop);
    }
    if (pop.dataset.actionsBound !== '1') {
        pop.dataset.actionsBound = '1';
        const promptCopyBtn = pop.querySelector('#calendarPromptCopyBtn');
        const promptCloseBtn = pop.querySelector('#calendarPromptCloseIconBtn');
        const promptPreviewBtn = pop.querySelector('#calendarPromptPreviewBtn');
        promptCopyBtn?.addEventListener('click', () => copyWeeklyPromptFromCalendar());
        promptCloseBtn?.addEventListener('click', () => closeCalendarPromptPopover());
        promptPreviewBtn?.addEventListener('click', () => {
            const text = buildTeacherWeeklyPromptFromSelectedDays();
            if (!text) {
                showAppMessage('No scheduled classes found for selected days.');
                return;
            }
            showAppMessage(text);
        });
    }
}

function renderCalendarPromptDayOptions() {
    const list = document.getElementById('calendarPromptDaysList');
    if (!list) return;
    list.innerHTML = '';
    DAYS.forEach((dayName) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        
        li.className = 'calendar-prompt-day-item';
        label.className = 'calendar-prompt-day-option';
        label.classList.toggle('is-selected', input.checked);

        input.type = 'checkbox';
        input.checked = calendarPromptSelectedDays.has(dayName);
        input.dataset.day = dayName;
        input.addEventListener('change', () => {
            const day = String(input.dataset.day || '').trim();
            if (!day) return;
            if (input.checked) calendarPromptSelectedDays.add(day);
            else calendarPromptSelectedDays.delete(day);
            label.classList.toggle('is-selected', input.checked);
            updateCalendarPromptPreview();
        });

        const text = document.createElement('span');
        text.className = 'calendar-prompt-day-name';
        text.textContent = dayName;
        label.appendChild(input);
        label.appendChild(text);
        li.appendChild(label);
        list.appendChild(li);
    });
}

function closeCalendarPromptPopover() {
    const pop = document.getElementById('calendarPromptPopover');
    const backdrop = document.getElementById('calendarPromptPopoverBackdrop');
    const btn = document.getElementById('classReportWeeklyPromptBtn');
    if (backdrop) {
        backdrop.classList.remove('calendar-prompt-popover-backdrop--enter');
        backdrop.classList.add('calendar-prompt-popover-backdrop--leave');
        backdrop.hidden = false;
        if (calendarPromptBackdropHideTimer) {
            window.clearTimeout(calendarPromptBackdropHideTimer);
            calendarPromptBackdropHideTimer = null;
        }
        let finishedBackdrop = false;
        const finishBackdropHide = () => {
            if (finishedBackdrop) return;
            finishedBackdrop = true;
            backdrop.removeEventListener('animationend', finishBackdropHide);
            backdrop.hidden = true;
            backdrop.classList.remove('calendar-prompt-popover-backdrop--leave');
            calendarPromptBackdropHideTimer = null;
        };
        backdrop.addEventListener('animationend', finishBackdropHide);
        calendarPromptBackdropHideTimer = window.setTimeout(finishBackdropHide, 240);
    }
    if (pop) {
        pop.classList.remove('calendar-prompt-popover--enter');
        pop.classList.add('calendar-prompt-popover--leave');
        pop.hidden = false;
        if (calendarPromptPopoverHideTimer) {
            window.clearTimeout(calendarPromptPopoverHideTimer);
            calendarPromptPopoverHideTimer = null;
        }
        let finished = false;
        const finishHide = () => {
            if (finished) return;
            finished = true;
            pop.removeEventListener('animationend', finishHide);
            pop.hidden = true;
            pop.classList.remove('calendar-prompt-popover--leave');
            calendarPromptPopoverHideTimer = null;
        };
        pop.addEventListener('animationend', finishHide);
        calendarPromptPopoverHideTimer = window.setTimeout(finishHide, 260);
    }
    if (btn) btn.setAttribute('aria-expanded', 'false');
    calendarPromptPopoverOpen = false;
}

function getNextDateForWeekday(dayName, now = new Date()) {
    const todayIndex = now.getDay();
    const targetIndex = DAYS.findIndex((d) => d === dayName);
    if (targetIndex === -1) return null;
    const offset = (targetIndex - todayIndex + 7) % 7;
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
}

function getScheduledTeacherHoursForDay(dayName) {
    const entries = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        const state = String(getSlotState(dayName, hour) || '').trim().toLowerCase();
        if (!state || state === 'available') continue;
        entries.push({
            hour,
            isReposition: state === 'unavailable' || state === 'rescheduled' || state === BOOKED_CLASS_SLOT_STATE
        });
    }
    return entries;
}

function buildTeacherWeeklyPromptFromSelectedDays() {
    const selectedDays = DAYS.filter((d) => calendarPromptSelectedDays.has(d));
    if (selectedDays.length === 0) return '';
    const blocks = [];
    selectedDays.forEach((dayName) => {
        const entries = getScheduledTeacherHoursForDay(dayName);
        if (entries.length === 0) return;
        const date = getNextDateForWeekday(dayName);
        if (!date) return;
        const month = date.toLocaleString('en-US', { month: 'long' });
        const dayNum = date.getDate();
        const title = `*${month}, ${dayNum}${getOrdinalSuffix(dayNum)} — ${dayName}*`;
        const lines = [title];
        let prevHour = null;
        entries.forEach(({ hour, isReposition }) => {
            if (prevHour != null && hour - prevHour > 1) {
                lines.push('');
            }
            lines.push(`${formatHour(hour)} —${isReposition ? ' (reposition)' : ''}`);
            prevHour = hour;
        });
        blocks.push(lines.join('\n'));
    });
    return blocks.join('\n\n');
}

async function copyWeeklyPromptFromCalendar() {
    if (!currentTeacher) {
        showAppMessage('Please select a teacher first.');
        return;
    }
    if (calendarPromptSelectedDays.size === 0) {
        showAppMessage('Select at least one weekday.');
        return;
    }
    const text = buildTeacherWeeklyPromptFromSelectedDays();
    if (!text) {
        showAppMessage('No scheduled classes found for selected days.');
        return;
    }
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', 'true');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        showAppMessage('Weekly prompt copied.');
    } catch (error) {
        console.error('Error copying weekly prompt:', error);
        showAppMessage('Could not copy text. Please try again.');
    }
}

function updateCalendarPromptPreview() {
    const previewEl = document.getElementById('calendarPromptPreviewText');
    const countEl = document.getElementById('calendarPromptClassCount');
    if (!previewEl || !countEl) return;
    const selectedDays = DAYS.filter((d) => calendarPromptSelectedDays.has(d));
    const classCount = selectedDays.reduce((total, dayName) => total + getScheduledTeacherHoursForDay(dayName).length, 0);
    countEl.textContent = `${classCount} class${classCount === 1 ? '' : 'es'}`;
    const text = buildTeacherWeeklyPromptFromSelectedDays();
    previewEl.textContent = text || 'No classes scheduled for selected day(s).';
    animateCalendarPromptPreviewHeight(previewEl);
}

function animateCalendarPromptPreviewHeight(previewEl) {
    if (!previewEl) return;
    const styles = window.getComputedStyle(previewEl);
    const minHeight = Number.parseFloat(styles.minHeight) || 120;
    let maxHeight = Number.parseFloat(styles.maxHeight);
    if (!Number.isFinite(maxHeight)) maxHeight = 280;
    const startHeight = Math.max(minHeight, previewEl.getBoundingClientRect().height || minHeight);
    previewEl.style.height = 'auto';
    const contentHeight = previewEl.scrollHeight;
    const targetHeight = Math.max(minHeight, Math.min(contentHeight, maxHeight));
    previewEl.style.height = `${Math.round(startHeight)}px`;
    void previewEl.offsetHeight;
    previewEl.style.height = `${Math.round(targetHeight)}px`;
}

function toggleCalendarPromptPopover(anchorEl) {
    ensureCalendarPromptPopover();
    const pop = document.getElementById('calendarPromptPopover');
    const backdrop = document.getElementById('calendarPromptPopoverBackdrop');
    if (!pop) return;
    if (calendarPromptPopoverOpen) {
        closeCalendarPromptPopover();
        return;
    }
    renderCalendarPromptDayOptions();
    updateCalendarPromptPreview();
    closeCalendarStudentNamesPopover();
    closeCalendarLinkPopover();
    if (calendarPromptPopoverHideTimer) {
        window.clearTimeout(calendarPromptPopoverHideTimer);
        calendarPromptPopoverHideTimer = null;
    }
    if (calendarPromptBackdropHideTimer) {
        window.clearTimeout(calendarPromptBackdropHideTimer);
        calendarPromptBackdropHideTimer = null;
    }
    if (backdrop) {
        backdrop.hidden = false;
        backdrop.classList.remove('calendar-prompt-popover-backdrop--leave');
        backdrop.classList.remove('calendar-prompt-popover-backdrop--enter');
        void backdrop.offsetWidth;
        backdrop.classList.add('calendar-prompt-popover-backdrop--enter');
    }
    pop.hidden = false;
    pop.classList.remove('calendar-prompt-popover--leave');
    pop.classList.remove('calendar-prompt-popover--enter');
    void pop.offsetWidth;
    pop.classList.add('calendar-prompt-popover--enter');
    calendarPromptPopoverOpen = true;
    anchorEl?.setAttribute('aria-expanded', 'true');
    positionCalendarPromptPopover(anchorEl);
    requestAnimationFrame(() => positionCalendarPromptPopover(anchorEl));
}

function closeCalendarLinkPopover() {
    const pop = document.getElementById('calendarLinkPopover');
    if (calendarLinkPopoverHideTimer) {
        clearTimeout(calendarLinkPopoverHideTimer);
        calendarLinkPopoverHideTimer = null;
    }
    calendarLinkPopoverOpen = false;
    if (!pop) return;
    pop.classList.remove('calendar-link-popover--enter');
    if (!pop.hidden) {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            pop.hidden = true;
            pop.classList.remove('calendar-link-popover--leave');
            return;
        }
        pop.classList.add('calendar-link-popover--leave');
        calendarLinkPopoverHideTimer = window.setTimeout(() => {
            pop.hidden = true;
            pop.classList.remove('calendar-link-popover--leave');
            calendarLinkPopoverHideTimer = null;
        }, MODAL_CLOSE_ANIMATION_MS);
    } else {
        pop.classList.remove('calendar-link-popover--leave');
    }
}

function openCalendarLinkPopover(anchorEl) {
    const pop = document.getElementById('calendarLinkPopover');
    const input = document.getElementById('calendarLinkInput');
    if (!pop || !input) return;
    closeCalendarStudentNamesPopover();
    closeCalendarPromptPopover();
    if (calendarLinkPopoverHideTimer) {
        clearTimeout(calendarLinkPopoverHideTimer);
        calendarLinkPopoverHideTimer = null;
    }
    input.value = String(calendarToolbarExternalLink || '').trim();
    pop.hidden = false;
    pop.classList.remove('calendar-link-popover--leave');
    pop.classList.remove('calendar-link-popover--enter');
    void pop.offsetWidth;
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        pop.classList.add('calendar-link-popover--enter');
    }
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
        const promptPop = document.getElementById('calendarPromptPopover');
        const t = e.target;
        if (!pop || pop.hidden) return;
        if (pop.contains(t) || (linkPop && linkPop.contains(t)) || (promptPop && promptPop.contains(t))) return;
        const btn = document.getElementById('calendarToolbarStudentsBtn');
        if (btn && btn.contains(t)) return;
        closeCalendarStudentNamesPopover();
    });
    document.addEventListener('click', (e) => {
        const pop = document.getElementById('calendarLinkPopover');
        const promptPop = document.getElementById('calendarPromptPopover');
        const t = e.target;
        if (!pop || pop.hidden) return;
        if (pop.contains(t) || (promptPop && promptPop.contains(t))) return;
        const btn = document.getElementById('calendarToolbarCalendarBtn');
        if (btn && btn.contains(t)) return;
        closeCalendarLinkPopover();
    });
    document.addEventListener('click', (e) => {
        const pop = document.getElementById('calendarPromptPopover');
        const t = e.target;
        if (!pop || pop.hidden) return;
        if (pop.contains(t)) return;
        const btn = document.getElementById('classReportWeeklyPromptBtn');
        if (btn && btn.contains(t)) return;
        closeCalendarPromptPopover();
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
        const promptBtn = document.getElementById('classReportWeeklyPromptBtn');
        if (calendarPromptPopoverOpen && promptBtn) {
            positionCalendarPromptPopover(promptBtn);
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
    if (studentClassReportRows[oldName]) {
        studentClassReportRows[newName] = studentClassReportRows[oldName];
        delete studentClassReportRows[oldName];
        saveStudentClassReportRows();
    }
    if (studentClassReportUploadsByName[oldName]) {
        studentClassReportUploadsByName[newName] = studentClassReportUploadsByName[oldName];
        delete studentClassReportUploadsByName[oldName];
        void renameClassReportStudentBucketOnServer(oldName, newName).then(async (ok) => {
            if (ok && classReportUploadsCloudTimestamp)
                await persistClassReportOfflineSnapshot({ remoteLastUpdated: classReportUploadsCloudTimestamp });
            else await persistClassReportOfflineSnapshot();
        });
    }
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

/** Same external-link SVG as `.sidebar-section-title-passport-btn` offsite opener */
const STUDENT_EXTERNAL_FOLLOWUP_LINK_BTN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';

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

/** Share (Heroicons) — class supervisor “Share data” header control opens invite modal */
const SIDEBAR_SHARE_DATA_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clip-rule="evenodd" /></svg>';

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

/** Plus (filled) for sidebar Materials add */
const SIDEBAR_ADD_MATERIALS_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /></svg>';

const ADD_STUDENT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 13c.552 0 1.01-.452.9-.994a5.002 5.002 0 0 0-9.802 0c-.109.542.35.994.902.994h8ZM12.5 3.5a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1v-1a.75.75 0 0 1 .75-.75Z"/></svg>';

const CALENDAR_TOOLBAR_CALENDAR_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="calendar-toolbar-icon" aria-hidden="true">' +
    '<path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />' +
    '<path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" />' +
    '</svg>';
const CALENDAR_TOOLBAR_PROMPT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="calendar-toolbar-icon" aria-hidden="true">' +
    '<path fill-rule="evenodd" d="M3.25 4A2.75 2.75 0 0 1 6 1.25h8A2.75 2.75 0 0 1 16.75 4v12A2.75 2.75 0 0 1 14 18.75H6A2.75 2.75 0 0 1 3.25 16V4ZM6 2.75A1.25 1.25 0 0 0 4.75 4v12A1.25 1.25 0 0 0 6 17.25h8A1.25 1.25 0 0 0 15.25 16V4A1.25 1.25 0 0 0 14 2.75H6Zm1.25 2.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75ZM7 8a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 8Zm0 2.75A.75.75 0 0 1 7.75 10h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 2.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />' +
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
    const feedEditable = canEditFeed();

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
        pick.disabled = !feedEditable;

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
        sel.disabled = !feedEditable;
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
        sel.disabled = !feedEditable;
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
        sel.disabled = !feedEditable;
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
        sel.disabled = !feedEditable;
        td.appendChild(sel);
    } else if (field === 'classTopic') {
        td.classList.add('column-topic');
        if (!feedEditable) {
            const text = document.createElement('span');
            text.className = 'student-class-report-topic-readonly';
            text.textContent = String(merged.classTopic || '').trim();
            td.appendChild(text);
            tr.appendChild(td);
            return;
        }
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
        input.readOnly = !feedEditable;
        td.appendChild(input);
    }

    tr.appendChild(td);
}

function persistClassReportRowField(tr, el) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        return;
    }
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

function findClassReportUploadStorageKey(studentName) {
    const trimmed = String(studentName || '').trim();
    if (!trimmed) return '';
    const map = studentClassReportUploadsByName || {};
    if (Array.isArray(map[trimmed])) return trimmed;
    const lc = trimmed.toLowerCase();
    const hit = Object.keys(map).find((k) => String(k || '').trim().toLowerCase() === lc);
    return hit || trimmed;
}

function getStudentClassReportUploadFeed(studentName) {
    const rawKey = String(studentName || '').trim();
    if (!rawKey) return [];
    const key = findClassReportUploadStorageKey(rawKey);
    if (!Array.isArray(studentClassReportUploadsByName[key])) {
        studentClassReportUploadsByName[key] = [];
    }
    return studentClassReportUploadsByName[key];
}

function getStudentClassReportFileSrc(fileData) {
    const blobish = String(fileData?.blobUrl || '').trim();
    if (blobish) return blobish;
    return String(fileData?.dataUrl || fileData?.url || '');
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });
}

function isTextEditingElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest && el.closest('[contenteditable="true"]')) return true;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
        const type = String(el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio' || type === 'file' || type === 'button' || type === 'submit' || type === 'reset') {
            return false;
        }
        return true;
    }
    return false;
}

function pickFirstUsableFileFromClipboardData(clipboardData) {
    if (!clipboardData || !clipboardData.items || !clipboardData.items.length) return null;
    for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.kind !== 'file') continue;
        const f = item.getAsFile();
        if (f && f.size > 0) return f;
    }
    return null;
}

function classReportUploadAcceptsMimeOrName(file) {
    if (!file) return false;
    const type = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    return (
        type.startsWith('image/')
        || type === 'application/pdf'
        || name.endsWith('.pdf')
        || type === 'audio/mpeg'
        || name.endsWith('.mp3')
    );
}

async function appendClassReportUploadFromFile(panel, studentNameKey, file) {
    const key = String(studentNameKey || '').trim();
    if (!panel || !key || !file || !classReportUploadAcceptsMimeOrName(file)) return false;
    if (typeof ClassReportUploadsStore === 'undefined') return false;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mime = String(file.type || '').toLowerCase();
    await ClassReportUploadsStore.putBlob(id, file);
    const blobUrl = URL.createObjectURL(file);

    const feed = getStudentClassReportUploadFeed(key);
    feed.push({
        id,
        name: file.name || 'Uploaded file',
        type: mime,
        blobUrl,
        url: blobUrl,
        dataUrl: '',
        questions: [],
        relatedFiles: []
    });

    classReportUploadPushInFlight++;
    try {
        const apiUrl = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
        if (!apiUrl) {
            console.warn('Class report uploads need http(s) — file saved locally only.');
        } else {
            const mainB64 = await ClassReportUploadsStore.blobToPureBase64(file);
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
                body: JSON.stringify({
                    action: 'putUpload',
                    student: key,
                    mainBase64: mainB64,
                    upload: {
                        id,
                        name: file.name || 'Uploaded file',
                        type: mime,
                        questions: [],
                        relatedFiles: []
                    }
                })
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                console.error('Class report upload failed:', data?.error || res.status, data?.code || '');
                const msg =
                    data?.error ||
                    (res.status === 413 ? 'File is too large for cloud sync.' : 'Could not sync file.');
                alert(`${msg}`);
                return false;
            }
            if (data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
            await persistClassReportOfflineSnapshot({ remoteLastUpdated: data.lastUpdated });
            lastRemoteManifestFingerprint = stableStringifyManifestStudents(memoryToStudentManifestBuckets());
        }
    } finally {
        classReportUploadPushInFlight--;
    }

    const browseInput = panel.querySelector('#studentClassReportUploadInput');
    if (browseInput) browseInput.value = '';
    renderStudentClassReportUploadFeed(panel, key);
    return true;
}

function getFirstNameLabel(fullName, fallback = '') {
    const firstName = String(fullName || '').trim().split(/\s+/)[0] || String(fallback || '').trim();
    return firstName || 'Name';
}

function removeStudentClassReportUpload(studentName, uploadId) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot delete feed content.');
        return;
    }
    if (typeof ClassReportUploadsStore === 'undefined') return;
    const key = String(studentName || '').trim();
    const feed = getStudentClassReportUploadFeed(key);
    const index = feed.findIndex((item) => item && item.id === uploadId);
    if (index === -1) return;
    const [removed] = feed.splice(index, 1);
    revokeUploadDerivedUrls(removed);

    const delIds = [String(uploadId || '').trim()].filter(Boolean);
    if (Array.isArray(removed?.relatedFiles)) {
        removed.relatedFiles.forEach((rf) => {
            if (rf?.id) delIds.push(String(rf.id));
        });
    }
    void ClassReportUploadsStore.deleteManyBlobs(delIds);

    classReportUploadPushInFlight++;
    void (async () => {
        try {
            const apiUrl = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
            if (apiUrl) {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
                    body: JSON.stringify({
                        action: 'deleteUpload',
                        student: key,
                        uploadId: String(uploadId || '').trim()
                    })
                });
                const data = await res.json().catch(() => null);
                if (!res.ok || !data?.success) {
                    console.error('deleteUpload failed', data?.error);
                } else {
                    if (data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
                    await persistClassReportOfflineSnapshot({ remoteLastUpdated: data.lastUpdated });
                    lastRemoteManifestFingerprint = stableStringifyManifestStudents(memoryToStudentManifestBuckets());
                }
            } else {
                console.warn('deleteUpload skipped: serve app over http(s) for cloud sync');
            }
        } finally {
            classReportUploadPushInFlight--;
        }
        renderStudentClassReportUploadFeed(document.getElementById('studentClassReportPanel'), key);
    })();
}

async function addRelatedFileToStudentClassReportUpload(studentName, uploadId, file) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        return;
    }
    if (typeof ClassReportUploadsStore === 'undefined') return;
    const key = String(studentName || '').trim();
    if (!file) return;
    const feed = getStudentClassReportUploadFeed(key);
    const upload = feed.find((item) => item && item.id === uploadId);
    if (!upload) return;
    if (!Array.isArray(upload.relatedFiles)) {
        upload.relatedFiles = [];
    }
    const rid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const mime = String(file.type || '').toLowerCase();
    await ClassReportUploadsStore.putBlob(rid, file);
    const blobUrl = URL.createObjectURL(file);
    const relatedRow = {
        id: rid,
        name: file.name || 'Related file',
        type: mime,
        blobUrl,
        url: blobUrl,
        dataUrl: ''
    };
    upload.relatedFiles.push(relatedRow);

    classReportUploadPushInFlight++;
    try {
        const b64 = await ClassReportUploadsStore.blobToPureBase64(file);
        const apiUrl = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
        if (!apiUrl) {
            alert('Serve the app over http(s) to sync related files.');
            return;
        }
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
            body: JSON.stringify({
                action: 'addRelatedUpload',
                student: key,
                uploadId: String(uploadId || '').trim(),
                relatedBase64: b64,
                relatedFile: { id: rid, name: relatedRow.name, type: mime }
            })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
            console.error('addRelated failed', data?.error);
            alert('Could not attach related file to cloud.');
            return;
        }
        if (data.lastUpdated) setClassReportUploadsCloudTimestamp(data.lastUpdated);
        await persistClassReportOfflineSnapshot({ remoteLastUpdated: data.lastUpdated });
        lastRemoteManifestFingerprint = stableStringifyManifestStudents(memoryToStudentManifestBuckets());
    } finally {
        classReportUploadPushInFlight--;
    }
    renderStudentClassReportUploadFeed(document.getElementById('studentClassReportPanel'), key);
}

function addQuestionToLatestStudentClassReportUpload(studentName) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        return;
    }
    const key = String(studentName || '').trim();
    if (!key) return;
    const feed = getStudentClassReportUploadFeed(key);
    const latestUpload = [...feed].reverse().find((item) => item && item.kind !== 'question');
    if (!latestUpload) return;
    if (!Array.isArray(latestUpload.questions)) {
        latestUpload.questions = [];
    }
    if (latestUpload.questions.length === 0) {
        latestUpload.questions.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            speaker: 'teacher',
            text: ''
        });
    }
    void persistClassReportOfflineSnapshot();
    debouncePatchClassReportQuestions(key, latestUpload.id);
    renderStudentClassReportUploadFeed(document.getElementById('studentClassReportPanel'), key);
    requestAnimationFrame(() => {
        const panel = document.getElementById('studentClassReportPanel');
        const input = panel?.querySelector(
            `.student-class-report-file-card[data-upload-id="${latestUpload.id}"] .student-class-report-question-row:last-of-type input`
        );
        input?.focus();
    });
}

function addQuestionLineToStudentClassReportUpload(studentName, uploadId, afterQuestionId) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        return;
    }
    const key = String(studentName || '').trim();
    if (!key || !uploadId) return;
    const feed = getStudentClassReportUploadFeed(key);
    const upload = feed.find((item) => item && item.id === uploadId);
    if (!upload) return;
    if (!Array.isArray(upload.questions)) {
        upload.questions = [];
    }
    const currentIndex = upload.questions.findIndex((question) => question && question.id === afterQuestionId);
    const currentQuestion = currentIndex >= 0 ? upload.questions[currentIndex] : upload.questions[upload.questions.length - 1];
    const nextSpeaker = currentQuestion?.speaker === 'teacher' ? 'student' : 'teacher';
    const nextQuestion = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        speaker: nextSpeaker,
        text: ''
    };
    upload.questions.splice(currentIndex >= 0 ? currentIndex + 1 : upload.questions.length, 0, nextQuestion);
    void persistClassReportOfflineSnapshot();
    debouncePatchClassReportQuestions(key, upload.id);
    renderStudentClassReportUploadFeed(document.getElementById('studentClassReportPanel'), key);
    requestAnimationFrame(() => {
        const panel = document.getElementById('studentClassReportPanel');
        const input = panel?.querySelector(
            `.student-class-report-file-card[data-upload-id="${upload.id}"] .student-class-report-question-row[data-question-id="${nextQuestion.id}"] input`
        );
        input?.focus();
    });
}

function appendStudentClassReportFileContent(parentEl, fileData, compact = false) {
    if (!parentEl || !fileData) return;
    const type = String(fileData.type || '').toLowerCase();
    const name = String(fileData.name || '').toLowerCase();
    if (type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = compact
            ? 'student-class-report-file-preview-image student-class-report-file-preview-image--related'
            : 'student-class-report-file-preview-image';
        img.src = getStudentClassReportFileSrc(fileData);
        img.alt = fileData.name || 'Uploaded file preview';
        parentEl.appendChild(img);
    } else if (type.startsWith('audio/') || name.endsWith('.mp3')) {
        const audio = document.createElement('audio');
        audio.className = 'student-class-report-file-preview-audio';
        audio.src = getStudentClassReportFileSrc(fileData);
        audio.controls = true;
        audio.preload = 'metadata';
        parentEl.appendChild(audio);
    } else if (type === 'application/pdf' || name.endsWith('.pdf')) {
        const frame = document.createElement('iframe');
        frame.className = compact
            ? 'student-class-report-file-preview-pdf student-class-report-file-preview-pdf--related'
            : 'student-class-report-file-preview-pdf';
        frame.src = getStudentClassReportFileSrc(fileData);
        frame.title = fileData.name || 'Uploaded PDF preview';
        parentEl.appendChild(frame);
    } else {
        const unsupported = document.createElement('p');
        unsupported.className = 'student-class-report-file-preview-empty';
        unsupported.textContent = 'Preview is not available for this file type.';
        parentEl.appendChild(unsupported);
    }
}

function appendStudentClassReportUploadPreview(feedEl, upload, studentName) {
    if (!feedEl || !upload) return;
    const card = document.createElement('article');
    card.className = 'student-class-report-file-card';
    card.dataset.uploadId = upload.id || '';

    const meta = document.createElement('div');
    meta.className = 'student-class-report-file-card-meta';
    const name = document.createElement('span');
    name.className = 'student-class-report-file-card-name';
    name.textContent = upload.name || 'Uploaded file';
    const actions = document.createElement('div');
    actions.className = 'student-class-report-file-card-actions';
    meta.appendChild(name);
    if (canEditFeed()) {
        const relatedInput = document.createElement('input');
        relatedInput.type = 'file';
        relatedInput.accept = 'image/*,.pdf,audio/mpeg,.mp3';
        relatedInput.hidden = true;
        relatedInput.addEventListener('change', async () => {
            const file = relatedInput.files && relatedInput.files[0] ? relatedInput.files[0] : null;
            try {
                await addRelatedFileToStudentClassReportUpload(studentName, upload.id, file);
            } finally {
                relatedInput.value = '';
            }
        });
        const addRelatedBtn = document.createElement('button');
        addRelatedBtn.type = 'button';
        addRelatedBtn.className = 'student-class-report-file-add-btn';
        addRelatedBtn.setAttribute('aria-label', `Add related file to ${upload.name || 'uploaded file'}`);
        addRelatedBtn.title = 'Add related file';
        addRelatedBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>';
        addRelatedBtn.addEventListener('click', () => {
            relatedInput.click();
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'student-class-report-file-delete-btn';
        deleteBtn.setAttribute('aria-label', `Delete ${upload.name || 'uploaded file'}`);
        deleteBtn.title = 'Delete file';
        deleteBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 14h10l1-14"></path><path d="M9 7V4h6v3"></path></svg>';
        deleteBtn.addEventListener('click', () => {
            removeStudentClassReportUpload(studentName, upload.id);
        });
        actions.appendChild(relatedInput);
        actions.appendChild(addRelatedBtn);
        actions.appendChild(deleteBtn);
        meta.appendChild(actions);
    }
    card.appendChild(meta);

    if (canEditFeed()) {
        card.addEventListener('paste', async (e) => {
            const target = e.target;
            if (target && card.contains(target) && isTextEditingElement(target)) return;
            const file = pickFirstUsableFileFromClipboardData(e.clipboardData);
            if (!file || !classReportUploadAcceptsMimeOrName(file)) return;
            e.preventDefault();
            await addRelatedFileToStudentClassReportUpload(studentName, upload.id, file);
        });
    }

    appendStudentClassReportFileContent(card, upload);

    const relatedFiles = [
        ...(Array.isArray(upload.audioFiles) ? upload.audioFiles : []),
        ...(Array.isArray(upload.relatedFiles) ? upload.relatedFiles : [])
    ];
    if (relatedFiles.length > 0) {
        const relatedGroup = document.createElement('div');
        relatedGroup.className = 'student-class-report-card-related-group';
        relatedFiles.forEach((relatedFile) => {
            const relatedWrap = document.createElement('div');
            relatedWrap.className = 'student-class-report-card-related-item';
            const relatedName = document.createElement('span');
            relatedName.className = 'student-class-report-card-related-name';
            relatedName.textContent = relatedFile.name || 'Related file';
            relatedWrap.appendChild(relatedName);
            appendStudentClassReportFileContent(relatedWrap, relatedFile, true);
            relatedGroup.appendChild(relatedWrap);
        });
        card.appendChild(relatedGroup);
    }

    if (Array.isArray(upload.questions) && upload.questions.length > 0) {
        const questionGroup = document.createElement('div');
        questionGroup.className = 'student-class-report-card-question-group';
        const teacherLabel = getFirstNameLabel(getActiveTeacherProfileName() || loggedInTeacherName || currentTeacher, 'Teacher');
        const studentLabel = getFirstNameLabel(studentName, 'Student');
        upload.questions.forEach((question) => {
            const speaker = question?.speaker === 'student' ? 'student' : 'teacher';
            const questionRow = document.createElement('div');
            questionRow.className = `student-class-report-question-row student-class-report-question-row--${speaker}`;
            questionRow.dataset.questionId = question.id || '';

            const label = document.createElement('span');
            label.className = 'student-class-report-question-speaker';
            label.textContent = speaker === 'teacher' ? teacherLabel : studentLabel;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'student-class-report-question-input';
            input.placeholder = speaker === 'teacher' ? 'Write the question...' : 'Write the answer...';
            input.value = String(question.text || '');
            input.readOnly = !canEditFeed();
            input.addEventListener('input', () => {
                if (!canEditFeed()) {
                    console.warn('Permission denied: students cannot edit feed content.');
                    return;
                }
                question.text = input.value;
                debouncePatchClassReportQuestions(studentName, upload.id);
            });

            const addLineBtn = document.createElement('button');
            addLineBtn.type = 'button';
            addLineBtn.className = 'student-class-report-question-add-line-btn';
            addLineBtn.setAttribute('aria-label', 'Add next question line');
            addLineBtn.title = 'Add line';
            addLineBtn.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>';
            addLineBtn.addEventListener('click', () => {
                addQuestionLineToStudentClassReportUpload(studentName, upload.id, question.id);
            });
            addLineBtn.hidden = !canEditFeed();

            if (speaker === 'student') {
                questionRow.appendChild(input);
                questionRow.appendChild(label);
                questionRow.appendChild(addLineBtn);
            } else {
                questionRow.appendChild(label);
                questionRow.appendChild(input);
                questionRow.appendChild(addLineBtn);
            }
            questionGroup.appendChild(questionRow);
        });
        card.appendChild(questionGroup);
    }

    feedEl.appendChild(card);
}

function renderStudentClassReportUploadFeed(panel, studentName) {
    if (!panel) return;
    const uploadWrap = panel.querySelector('.student-class-report-upload-wrap');
    const uploadTrigger = panel.querySelector('.student-class-report-upload-area');
    const changeFileBtn = panel.querySelector('.student-class-report-change-file-btn');
    const feedEl = panel.querySelector('.student-class-report-file-preview');
    const feed = getStudentClassReportUploadFeed(studentName);

    let assignHint = panel.querySelector('.student-class-report-assign-hint');
    if (!assignHint) {
        assignHint = document.createElement('p');
        assignHint.className = 'student-class-report-assign-hint';
        assignHint.setAttribute('role', 'status');
        assignHint.hidden = true;
        panel.appendChild(assignHint);
    }
    assignHint.textContent = '';
    assignHint.hidden = true;

    if (feedEl) {
        feedEl.textContent = '';
        feed.forEach((upload) => appendStudentClassReportUploadPreview(feedEl, upload, studentName));
        feedEl.hidden = feed.length === 0;
    }
    const feedEditable = canEditFeed();
    if (uploadWrap) uploadWrap.hidden = !feedEditable || feed.length > 0;
    if (uploadTrigger) uploadTrigger.tabIndex = uploadWrap && !uploadWrap.hidden ? 0 : -1;
    if (changeFileBtn) changeFileBtn.hidden = !feedEditable || feed.length === 0;
    panel.classList.toggle('student-class-report-panel--with-file', feed.length > 0);
    bumpClassReportUploadsSyncFingerprint();
}

function ensureStudentClassReportPanelShell(studentName = '') {
    let panel = document.getElementById('studentClassReportPanel');
    if (!panel) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return false;
        panel = document.createElement('div');
        panel.id = 'studentClassReportPanel';
        panel.className = 'student-class-report-panel';
        panel.hidden = true;
        const adminPanel = document.getElementById('adminControlPanel');
        if (adminPanel && adminPanel.parentElement === mainContent) {
            mainContent.insertBefore(panel, adminPanel);
        } else {
            mainContent.appendChild(panel);
        }
    }
    panel.textContent = '';
    panel.dataset.studentName = String(studentName || '').trim();

    const uploadWrap = document.createElement('div');
    uploadWrap.className = 'student-class-report-upload-wrap';
    uploadWrap.hidden = !canEditFeed();

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'student-class-report-upload-area';
    uploadBtn.setAttribute('aria-label', 'Add file');

    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'studentClassReportUploadInput';
    input.accept = 'image/*,.pdf,audio/mpeg,.mp3';
    input.hidden = true;

    const icon = document.createElement('span');
    icon.className = 'student-class-report-upload-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 16.2a4.2 4.2 0 0 0-1.1-8.26 5.6 5.6 0 0 0-10.78 1.7A3.7 3.7 0 0 0 8 17h12Z"></path><path d="M12 17V9"></path><path d="m8.5 12.5 3.5-3.5 3.5 3.5"></path></svg>';

    const title = document.createElement('span');
    title.className = 'student-class-report-upload-title';
    title.textContent = 'Upload a file';

    const hint = document.createElement('span');
    hint.className = 'student-class-report-upload-hint';
    hint.textContent =
        'Use the button below: paste what is on the clipboard (Print Screen, Snipping Tool, or pick in Windows+V first), or browse for a file.';

    const action = document.createElement('span');
    action.className = 'student-class-report-upload-action';
    action.setAttribute('aria-hidden', 'true');
    action.textContent = 'Add file…';

    const selected = document.createElement('span');
    selected.className = 'student-class-report-upload-selected';
    selected.textContent = 'No file selected';

    const preview = document.createElement('div');
    preview.className = 'student-class-report-file-preview';
    preview.hidden = true;

    const changeFileBtn = document.createElement('button');
    changeFileBtn.type = 'button';
    changeFileBtn.className = 'student-class-report-change-file-btn';
    changeFileBtn.setAttribute('aria-label', 'Add file');
    changeFileBtn.title = 'Add file';
    changeFileBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"></path><path d="m7.5 8.5 4.5-4.5 4.5 4.5"></path><path d="M20 16v2.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5V16"></path></svg>';
    changeFileBtn.hidden = true;

    const floatingActions = document.createElement('div');
    floatingActions.className = 'student-class-report-floating-actions';

    const addQuestionBtn = document.createElement('button');
    addQuestionBtn.type = 'button';
    addQuestionBtn.className = 'student-class-report-add-question-btn';
    addQuestionBtn.setAttribute('aria-label', 'Add question');
    addQuestionBtn.title = 'Add question';
    addQuestionBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>';
    addQuestionBtn.addEventListener('click', () => {
        if (!canEditFeed()) {
            console.warn('Permission denied: students cannot edit feed content.');
            return;
        }
        const selectedStudent = String(panel.dataset.studentName || studentName || '').trim();
        addQuestionToLatestStudentClassReportUpload(selectedStudent);
    });
    addQuestionBtn.hidden = !canEditFeed();

    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!canEditFeed()) {
            console.warn('Permission denied: students cannot publish feed content.');
            return;
        }
        input.click();
    });

    changeFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canEditFeed()) {
            console.warn('Permission denied: students cannot publish feed content.');
            return;
        }
        input.click();
    });

    input.addEventListener('change', async () => {
        if (!canEditFeed()) {
            console.warn('Permission denied: students cannot publish feed content.');
            input.value = '';
            return;
        }
        const file = input.files && input.files[0] ? input.files[0] : null;
        selected.textContent = file ? file.name : 'No file selected';
        if (!file) return;
        const selectedStudent = String(panel.dataset.studentName || studentName || '').trim();
        const ok = await appendClassReportUploadFromFile(panel, selectedStudent, file);
        if (!ok) {
            input.value = '';
            selected.textContent = 'No file selected';
        }
    });

    panel.addEventListener('paste', async (e) => {
        if (panel.hidden || !canEditFeed()) return;
        const target = e.target;
        if (target && panel.contains(target) && isTextEditingElement(target)) return;
        const file = pickFirstUsableFileFromClipboardData(e.clipboardData);
        if (!file || !classReportUploadAcceptsMimeOrName(file)) return;
        e.preventDefault();
        const selectedStudent = String(panel.dataset.studentName || studentName || '').trim();
        if (!selectedStudent) return;
        await appendClassReportUploadFromFile(panel, selectedStudent, file);
    });

    uploadBtn.appendChild(icon);
    uploadBtn.appendChild(title);
    uploadBtn.appendChild(hint);
    uploadBtn.appendChild(action);
    uploadBtn.appendChild(selected);
    uploadWrap.appendChild(uploadBtn);
    uploadWrap.appendChild(input);
    floatingActions.appendChild(addQuestionBtn);
    floatingActions.appendChild(changeFileBtn);
    panel.appendChild(uploadWrap);
    panel.appendChild(floatingActions);
    panel.appendChild(preview);
    renderStudentClassReportUploadFeed(panel, studentName);
    return true;
}

function renderStudentClassReportTable(studentName) {
    ensureStudentClassReportPanelShell(studentName);
    const title = document.getElementById('studentClassReportTitle');
    const tbody = document.getElementById('studentClassReportBody');
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
        if (canEditFeed()) {
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
        }
        tr.appendChild(tdAct);

        tbody.appendChild(tr);
    });

}

function removeStudentClassReportRowAt(studentName, index) {
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot delete feed content.');
        return;
    }
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
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        return;
    }
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
    if (!canEditFeed()) {
        console.warn('Permission denied: students cannot edit feed content.');
        closeClassTopicModal();
        return;
    }
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
    addBtn.hidden = !canEditFeed();

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
            if (!canEditFeed()) {
                console.warn('Permission denied: students cannot publish feed content.');
                return;
            }
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

function isGateStaffAccountSession() {
    const p = String(loggedInTeacherName || '').trim();
    if (!p || !isTeacherLoggedIn || isAdminLoggedIn || loggedInStudentFullName) return false;
    return gateStaffAccounts.some(
        (e) => String(e.profileName || '').trim().toLowerCase() === p.toLowerCase()
    );
}

function getGateSessionAppRole() {
    const p = String(loggedInTeacherName || '').trim();
    if (!p) return '';
    const ent = gateStaffAccounts.find(
        (e) => String(e.profileName || '').trim().toLowerCase() === p.toLowerCase()
    );
    return String(ent?.appRole || '').trim();
}

function isGateViewingAlienTeacherGrid() {
    if (!isGateStaffAccountSession() || !String(currentTeacher || '').trim()) return false;
    return (
        String(currentTeacher || '').trim().toLowerCase() !==
        String(loggedInTeacherName || '').trim().toLowerCase()
    );
}

function getActiveSupervisionSuperiorListsForTeacher() {
    const classSupervisors = new Set();
    const coordinators = new Set();
    if (
        !isTeacherLoggedIn ||
        isAdminLoggedIn ||
        loggedInStudentFullName ||
        isGateStaffAccountSession()
    ) {
        return {
            classSupervisors: /** @type {string[]} */ ([]),
            coordinators: /** @type {string[]} */ ([])
        };
    }
    const me = String(loggedInTeacherName || '').trim().toLowerCase();
    supervisionLinks.forEach((row) => {
        if (!isSupervisionLinkActiveClient(row)) return;
        if (String(row?.teacherProfile || '').trim().toLowerCase() !== me) return;
        const sup = String(row?.superiorProfile || '').trim();
        if (!sup) return;
        const role = String(row?.superiorAppRole || '').trim();
        if (role === 'class-supervisor') classSupervisors.add(sup);
        else if (role === 'coordinator') coordinators.add(sup);
    });
    const sortNames = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    return {
        classSupervisors: [...classSupervisors].sort(sortNames),
        coordinators: [...coordinators].sort(sortNames)
    };
}

function shouldMaskSuperviseeScheduleAvailabilityOnly() {
    if (isAdminLoggedIn) return false;
    if (!isGateStaffAccountSession() || getGateSessionAppRole() !== 'class-supervisor') return false;
    const self = String(loggedInTeacherName || '').trim();
    const ct = String(currentTeacher || '').trim();
    if (!self || !ct || ct.toLowerCase() === self.toLowerCase()) return false;
    if (!isActiveTeacherName(ct)) return false;
    const supLc = self.toLowerCase();
    const teachLc = ct.toLowerCase();
    return supervisionLinks.some(
        (l) =>
            isSupervisionLinkActiveClient(l) &&
            String(l?.superiorProfile || '')
                .trim()
                .toLowerCase() === supLc &&
            String(l?.teacherProfile || '')
                .trim()
                .toLowerCase() === teachLc &&
            String(l?.superiorAppRole || '').trim() === 'class-supervisor'
    );
}

function getDisplaySlotState(day, hour) {
    const key = `${day}-${hour}`;
    const raw = slotStates[key] ?? null;
    if (isAdminLoggedIn) return raw;
    if (!shouldMaskSuperviseeScheduleAvailabilityOnly()) return raw;
    const low = String(raw || '').trim().toLowerCase();
    if (low === 'available') return raw;
    return null;
}

function isGateCoordinatorOrClassSupervisorSession() {
    const p = String(loggedInTeacherName || '').trim();
    if (!p || !isGateStaffAccountSession()) return false;
    const ent = gateStaffAccounts.find(
        (e) => String(e.profileName || '').trim().toLowerCase() === p.toLowerCase()
    );
    const r = String(ent?.appRole || '').trim();
    return r === 'coordinator' || r === 'class-supervisor';
}

function getSchoolTitlesForSupervisionShare() {
    const me = canonicalTeacherNameOnRoster(loggedInTeacherName);
    if (!me) return [];
    const meLc = me.toLowerCase();
    const out = new Set();
    for (const name of [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList]) {
        const asg = canonicalTeacherNameOnRoster(getStudentTeacherInfo(name));
        if (!asg || asg.toLowerCase() !== meLc) continue;
        const sch = String(getStudentSchoolName(name) || '').trim();
        if (sch) out.add(sch);
    }
    return [...out].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

let supervisionModalLinkId = '';

let supervisionPendingNoticeLinkRef = null;

function getSupervisionNoticeShownIdSet() {
    try {
        const raw = sessionStorage.getItem(SUPERVISION_NOTICE_SESSION_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr.map((x) => String(x || '').trim()).filter(Boolean) : []);
    } catch {
        return new Set();
    }
}

function markSupervisionNoticeShownForSession(linkId) {
    const id = String(linkId || '').trim();
    if (!id) return;
    const s = getSupervisionNoticeShownIdSet();
    s.add(id);
    try {
        sessionStorage.setItem(SUPERVISION_NOTICE_SESSION_KEY, JSON.stringify([...s]));
    } catch {
        /* ignore */
    }
}

function formatSupervisionInviterRoleTitle(superiorAppRole) {
    const r = String(superiorAppRole || '').trim();
    if (r === 'class-supervisor') return 'Class Supervisor';
    if (r === 'coordinator') return 'Coordinator';
    return 'Supervisor';
}

function formatSupervisionPendingNoticeBody(link) {
    const roleTitle = formatSupervisionInviterRoleTitle(link?.superiorAppRole);
    const name = String(link?.superiorProfile || '').trim() || 'Supervisor';
    return `${roleTitle} ${name} is requesting access to your school data. Do you want to share one of your schools?`;
}

function closeSupervisionPendingNoticeModal() {
    const modal = document.getElementById('supervisionPendingNoticeModal');
    if (modal?.classList.contains('is-open')) {
        closeModalWithAnimation(modal);
    } else if (modal) {
        modal.classList.remove('is-open', 'is-closing');
        modal.setAttribute('aria-hidden', 'true');
    }
    supervisionPendingNoticeLinkRef = null;
}

function openSupervisionPendingNoticeModal(link) {
    setupSupervisionPendingNoticeModal();
    const modal = document.getElementById('supervisionPendingNoticeModal');
    const body = document.getElementById('supervisionPendingNoticeModalBody');
    if (!modal || !body || !link) return;
    supervisionPendingNoticeLinkRef = link;
    body.textContent = formatSupervisionPendingNoticeBody(link);
    openModalWithAnimation(modal);
}

function setupSupervisionPendingNoticeModal() {
    if (document.body.dataset.supervisionPendingNoticeModalBound === '1') return;
    document.body.dataset.supervisionPendingNoticeModalBound = '1';
    const modal = document.getElementById('supervisionPendingNoticeModal');
    const backdrop = document.getElementById('supervisionPendingNoticeModalBackdrop');
    const decline = document.getElementById('supervisionPendingNoticeDeclineBtn');
    const accept = document.getElementById('supervisionPendingNoticeAcceptBtn');
    if (!modal || !backdrop || !decline || !accept) return;
    backdrop.addEventListener('click', () => closeSupervisionPendingNoticeModal());
    decline.addEventListener('click', () => {
        const l = supervisionPendingNoticeLinkRef;
        const id = l?.id ? String(l.id).trim() : '';
        closeSupervisionPendingNoticeModal();
        if (id) void postSupervisionRespond(id, 'decline');
    });
    accept.addEventListener('click', () => {
        const l = supervisionPendingNoticeLinkRef;
        if (!l) return;
        closeSupervisionPendingNoticeModal();
        openSupervisionAcceptModal(l);
    });
}

function maybeAutoShowSupervisionPendingNotice() {
    if (!isTeacherLoggedIn || loggedInStudentFullName || isGateStaffAccountSession()) return;
    const modal = document.getElementById('supervisionPendingNoticeModal');
    if (!modal) return;
    if (modal.classList.contains('is-open')) return;
    if (document.getElementById('supervisionModal')?.classList.contains('is-open')) return;
    if (document.getElementById('supervisionInviteModal')?.classList.contains('is-open')) return;
    if (!getTimetableApiAuthHeaders().Authorization) return;

    const meLc = String(loggedInTeacherName || '').trim().toLowerCase();
    const pending = supervisionLinks.filter(
        (l) => normalizeSupervisionStatusClient(l?.status) === 'pending' && String(l?.teacherProfile || '').trim().toLowerCase() === meLc
    );
    if (!pending.length) return;

    const shown = getSupervisionNoticeShownIdSet();
    const next = pending.find((l) => l && String(l.id || '').trim() && !shown.has(String(l.id).trim()));
    if (!next) return;

    markSupervisionNoticeShownForSession(next.id);
    openSupervisionPendingNoticeModal(next);
}

function closeSupervisionModal() {
    const modal = document.getElementById('supervisionModal');
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
    supervisionModalLinkId = '';
}

function closeSupervisionInviteModal() {
    const modal = document.getElementById('supervisionInviteModal');
    if (modal?.classList.contains('is-open')) {
        closeModalWithAnimation(modal);
    } else if (modal) {
        modal.classList.remove('is-open', 'is-closing');
        modal.setAttribute('aria-hidden', 'true');
    }
    const input = document.getElementById('supervisionInviteUsernameInput');
    if (input) input.value = '';
}

function openSupervisionInviteModal() {
    setupSupervisionInviteModal();
    const modal = document.getElementById('supervisionInviteModal');
    const input = document.getElementById('supervisionInviteUsernameInput');
    if (!modal || !input) return;
    input.value = '';
    openModalWithAnimation(modal);
    window.requestAnimationFrame(() => input.focus());
}

function setupSupervisionInviteModal() {
    if (document.body.dataset.supervisionInviteModalBound === '1') return;
    document.body.dataset.supervisionInviteModalBound = '1';
    const modal = document.getElementById('supervisionInviteModal');
    const backdrop = document.getElementById('supervisionInviteModalBackdrop');
    const cancel = document.getElementById('supervisionInviteModalCancelBtn');
    const send = document.getElementById('supervisionInviteModalSendBtn');
    const input = document.getElementById('supervisionInviteUsernameInput');
    if (!modal || !backdrop || !cancel || !send || !input) return;
    backdrop.addEventListener('click', () => closeSupervisionInviteModal());
    cancel.addEventListener('click', () => closeSupervisionInviteModal());
    send.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const field = document.getElementById('supervisionInviteUsernameInput');
        void postSupervisionInvite(field ? field.value : '');
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            void postSupervisionInvite(document.getElementById('supervisionInviteUsernameInput')?.value || '');
        }
    });
}

async function postSupervisionInvite(teacherUsername) {
    await refreshTimetableApiBearerTokenIfPossible();
    if (!getTimetableApiAuthHeaders().Authorization) {
        await refreshTimetableApiBearerTokenIfPossible();
    }
    const sendBtn = document.getElementById('supervisionInviteModalSendBtn');
    if (sendBtn) sendBtn.disabled = true;
    try {
        const url = absoluteHttpApiUrl('/api/supervision-invite');
        if (!url) {
            showAppMessage('Serve the app over HTTPS to send supervision invites.');
            return;
        }
        const headers = {
            'Content-Type': 'application/json',
            ...getTimetableApiAuthHeaders()
        };
        if (!headers.Authorization) {
            let msg =
                'No API token yet. Sign out, open the login page on this same site (not as a file), sign in again, then try Send.';
            if (loadSavedLoginCredentials()) {
                msg =
                    'Could not obtain an API token (login may be out of date). Sign out, sign in again on this site, then try Send.';
            }
            try {
                if (sessionStorage.getItem('timetable_api_auth_unconfigured') === '1') {
                    msg =
                        'API login is disabled on the server: add the TIMETABLE_AUTH_SECRET environment variable to your Cloudflare Pages project (and redeploy). See docs/CLOUDFLARE_SETUP.md.';
                }
            } catch {
                /* ignore */
            }
            showAppMessage(msg);
            return;
        }
        const u = String(teacherUsername || '').trim();
        if (!u) {
            showAppMessage("Enter the teacher's username.");
            return;
        }
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ teacherUsername: u })
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
            showAppMessage(data?.error || 'Invite failed.');
            return;
        }
        closeSupervisionInviteModal();
        showAppMessage('Invitation sent.');
        if (data.lastUpdated) rosterLastUpdateTimestamp = data.lastUpdated;
        else rosterLastUpdateTimestamp = null;
        void pollRosterUpdates();
    } catch (e) {
        console.warn(e);
        showAppMessage('Invite request failed.');
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function setupSupervisionModal() {
    if (document.body.dataset.supervisionModalBound === '1') return;
    document.body.dataset.supervisionModalBound = '1';
    const modal = document.getElementById('supervisionModal');
    const backdrop = document.getElementById('supervisionModalBackdrop');
    const cancel = document.getElementById('supervisionModalCancelBtn');
    const confirm = document.getElementById('supervisionModalConfirmBtn');
    if (!modal || !backdrop || !cancel || !confirm) return;
    backdrop.addEventListener('click', () => closeSupervisionModal());
    cancel.addEventListener('click', () => closeSupervisionModal());
    confirm.addEventListener('click', () => {
        const id = String(supervisionModalLinkId || '').trim();
        if (!id) return;
        const fieldset = document.getElementById('supervisionSchoolFieldset');
        const picked = fieldset?.querySelector('input[type="radio"][name="supervisionSchoolChoice"]:checked');
        const school = picked ? String(picked.value || '').trim() : '';
        if (!school) {
            showAppMessage('Select one school to share.');
            return;
        }
        void postSupervisionRespond(id, 'accept', [school]);
    });
}

function openSupervisionAcceptModal(link) {
    setupSupervisionModal();
    const modal = document.getElementById('supervisionModal');
    const fieldset = document.getElementById('supervisionSchoolFieldset');
    const hint = document.getElementById('supervisionModalHint');
    if (!modal || !fieldset || !hint) return;
    supervisionModalLinkId = String(link?.id || '').trim();
    hint.textContent = `${formatSupervisionInviterRoleTitle(link?.superiorAppRole)} ${String(link?.superiorProfile || '').trim() || 'Supervisor'} — choose one school to share.`;
    fieldset.innerHTML = '';
    const legend = document.createElement('legend');
    legend.textContent = 'School to share (choose one)';
    fieldset.appendChild(legend);
    const schools = getSchoolTitlesForSupervisionShare();
    if (schools.length === 0) {
        const p = document.createElement('p');
        p.className = 'supervision-modal-warn';
        p.textContent = 'You have no assigned students with a school. Assign students first.';
        fieldset.appendChild(p);
    }
    schools.forEach((sch, i) => {
        const safeId = `sup-sch-${Math.random().toString(36).slice(2, 10)}`;
        const lbl = document.createElement('label');
        lbl.className = 'supervision-school-label';
        const rb = document.createElement('input');
        rb.type = 'radio';
        rb.name = 'supervisionSchoolChoice';
        rb.value = sch;
        rb.id = safeId;
        if (i === 0) rb.checked = true;
        lbl.appendChild(rb);
        lbl.appendChild(document.createTextNode(` ${sch}`));
        fieldset.appendChild(lbl);
    });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

async function postSupervisionRespond(linkId, action, schoolTitles) {
    await refreshTimetableApiBearerTokenIfPossible();
    if (!getTimetableApiAuthHeaders().Authorization) {
        await refreshTimetableApiBearerTokenIfPossible();
    }
    const url = absoluteHttpApiUrl('/api/supervision-respond');
    if (!url) {
        showAppMessage('Serve the app over HTTPS to respond to invites.');
        return;
    }
    const headers = {
        'Content-Type': 'application/json',
        ...getTimetableApiAuthHeaders()
    };
    if (!headers.Authorization) {
        let msg =
            'No API token yet. Sign out, open the login page on this same site (not as a file), sign in again, then try again.';
        if (loadSavedLoginCredentials()) {
            msg =
                'Could not obtain an API token (login may be out of date). Sign out, sign in again on this site, then try again.';
        }
        try {
            if (sessionStorage.getItem('timetable_api_auth_unconfigured') === '1') {
                msg =
                    'API login is disabled on the server: add the TIMETABLE_AUTH_SECRET environment variable to your Cloudflare Pages project (and redeploy). See docs/CLOUDFLARE_SETUP.md.';
            }
        } catch {
            /* ignore */
        }
        showAppMessage(msg);
        return;
    }
    const body = {
        linkId: String(linkId || '').trim(),
        action: action === 'accept' ? 'accept' : 'decline'
    };
    if (action === 'accept' && Array.isArray(schoolTitles)) body.schoolTitles = schoolTitles;
    try {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
            showAppMessage(data?.error || 'Could not update invite.');
            return;
        }
        closeSupervisionModal();
        showAppMessage(action === 'accept' ? 'Supervision accepted.' : 'Invitation declined.');
        rosterLastUpdateTimestamp = null;
        void pollRosterUpdates();
    } catch (e) {
        console.warn(e);
        showAppMessage('Request failed.');
    }
}

function appendGateOnlyRoleSelfRow(container) {
    const self = String(loggedInTeacherName || '').trim();
    if (!self) return;
    const onRoster = teachersList.some((t) => String(t || '').trim().toLowerCase() === self.toLowerCase());
    if (onRoster) return;
    const row = document.createElement('div');
    row.className = 'teacher-item category-gate-role-self';
    row.dataset.teacher = self;
    const nameEl = document.createElement('span');
    nameEl.className = 'teacher-item-name';
    nameEl.textContent = self;
    row.appendChild(nameEl);
    row.addEventListener('click', (e) => {
        if (e.target.closest('.teacher-item-edit')) return;
        selectTeacher(self, { view: 'calendar' });
    });
    container.appendChild(row);
}

function renderTeacherSupervisionPendingInTeachersPane(teachersInner) {
    teachersInner.querySelectorAll('.sidebar-teachers-supervision-pending-wrap').forEach((n) => n.remove());
    if (!isTeacherLoggedIn || loggedInStudentFullName || isGateStaffAccountSession()) return;

    const meLc = String(loggedInTeacherName || '').trim().toLowerCase();
    const pendingForTeacher = supervisionLinks.filter(
        (l) => normalizeSupervisionStatusClient(l?.status) === 'pending' && String(l?.teacherProfile || '').trim().toLowerCase() === meLc
    );
    if (!pendingForTeacher.length) return;

    const hasBearer = !!getTimetableApiAuthHeaders().Authorization;

    const wrap = document.createElement('div');
    wrap.className = 'sidebar-category sidebar-teachers-supervision-pending-wrap';
    const title = document.createElement('div');
    title.className = 'sidebar-section-title';
    title.textContent = 'Invitations for you';
    wrap.appendChild(title);
    const body = document.createElement('div');
    body.className = 'sidebar-category-items';

    if (!hasBearer) {
        const note = document.createElement('p');
        note.className = 'class-report-empty';
        note.textContent = 'Enable API auth to accept from the server.';
        body.appendChild(note);
    }
    pendingForTeacher.forEach((l) => {
        const row = document.createElement('div');
        row.className = 'supervision-pending-row';
        const label = document.createElement('span');
        label.className = 'supervision-pending-label';
        label.textContent = `${l.superiorProfile} (${l.superiorAppRole || 'supervisor'})`;
        const accept = document.createElement('button');
        accept.type = 'button';
        accept.textContent = 'Accept…';
        accept.className = 'supervision-pending-btn';
        accept.disabled = !hasBearer;
        accept.addEventListener('click', () => openSupervisionAcceptModal(l));
        const decline = document.createElement('button');
        decline.type = 'button';
        decline.textContent = 'Decline';
        decline.className = 'supervision-pending-btn';
        decline.disabled = !hasBearer;
        decline.addEventListener('click', () => void postSupervisionRespond(l.id, 'decline'));
        row.appendChild(label);
        row.appendChild(accept);
        row.appendChild(decline);
        body.appendChild(row);
    });
    wrap.appendChild(body);
    teachersInner.prepend(wrap);
}

/**
 * Coordinator / Class Supervisor / Teacher Assistant sidebar panes (gate sessions) + teacher invitation strip in Teachers pane.
 */
function renderSupervisionRoleSidebarPanes({
    paneCoordinator,
    coordinatorInner,
    paneClassSupervisor,
    classSupervisorInner,
    paneTeacherAssistant,
    teacherAssistantInner,
    teachersInner
}) {
    coordinatorInner.innerHTML = '';
    classSupervisorInner.innerHTML = '';
    teacherAssistantInner.innerHTML = '';

    const isCoordSession =
        isTeacherLoggedIn && !loggedInStudentFullName && isGateStaffAccountSession() && getGateSessionAppRole() === 'coordinator';
    const isClassSupSession =
        isTeacherLoggedIn && !loggedInStudentFullName && isGateStaffAccountSession() && getGateSessionAppRole() === 'class-supervisor';
    const isAssistantSession =
        isTeacherLoggedIn && !loggedInStudentFullName && isGateStaffAccountSession() && getGateSessionAppRole() === 'assistant';

    paneCoordinator.hidden = !isCoordSession;
    paneClassSupervisor.hidden = !isClassSupSession;
    paneTeacherAssistant.hidden = !isAssistantSession;

    if (isCoordSession) {
        appendGateOnlyRoleSelfRow(coordinatorInner);
    }
    if (isClassSupSession) {
        appendGateOnlyRoleSelfRow(classSupervisorInner);
    }

    if (isAssistantSession) {
        appendGateOnlyRoleSelfRow(teacherAssistantInner);
        const note = document.createElement('p');
        note.className = 'class-report-empty';
        note.textContent =
            'Teacher assistants use the calendar from this profile; supervision invites are sent by coordinators and class supervisors.';
        teacherAssistantInner.appendChild(note);
    }

    renderTeacherSupervisionPendingInTeachersPane(teachersInner);
}

function saveRoster() {
    normalizeCustomSchoolsList();
    const rosterPayload = {
        teachers: teachersList,
        private: privateStudentsList,
        speakon: speakonStudentsList,
        passport: passportStudentsList,
        studentSchools: studentSchoolByName,
        teacherEmails: teacherEmailsByName,
        teacherPasswords: teacherPasswordsByName,
        gateStaffAccounts,
        teacherAppRoles: teacherAppRolesByName,
        customSchools: customSchoolsList,
        authLoginAliases: { ...authLoginAliasesByKey },
        schoolExternalLinks,
        schoolThemeColors,
        schoolBillingModels,
        schoolBillingConfigs,
        calendarToolbarExternalLink,
        passportLinks: passportFollowupLinks,
        passportHeaderPageLink,
        speakonWeeklyClass: speakonStudentWeeklyClass,
        studentPhones: studentPhonesByName,
        studentTeachers: studentTeacherByName,
        studentEmails: studentEmailsByName,
        studentUsernames: studentUsernamesByName,
        studentPasswords: studentPasswordsByName,
        studentCities: studentCityByName,
        studentCountries: studentCountryByName,
        studentBirthDates: studentBirthDatesByName,
        studentAges: studentAgesByName,
        studentLevels: studentLevelsByName,
        studentExternalFollowUpLinks: studentExternalFollowUpLinksByName,
        studentGoogleMeetLinks: studentGoogleMeetLinksByName,
        googleMeetSharedLinkModeBySchool: googleMeetSharedLinkModeBySchoolKey,
        adminAccount: {
            username: String(adminAccount?.username || DEFAULT_ADMIN_USERNAME).trim(),
            passwordHash: String(adminAccount?.passwordHash || '').trim()
        },
        supervisionLinks
    };
    try {
        localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(rosterPayload));
    } catch (error) {
        console.error('Error saving roster to localStorage:', error);
    }
    queueSaveRosterToCloud(rosterPayload);
}

// Store schedules for all teachers: { teacherName: { 'day-hour': state } }
const teacherSchedules = {};

// Current selected teacher
let currentTeacher = null;

// Store slot states for current teacher (working copy)
let slotStates = {};

// Left-click toggles only availability (no red step)
const STATE_CYCLE = [null, 'available'];
/** Tutor/teacher grid: booked class slot (yellow); assigned name in `__unavailableStudentNames` meta. */
const BOOKED_CLASS_SLOT_STATE = 'booked';

// Context menu
let contextMenu = null;
let currentSlot = null;
let currentContextMenuMode = 'school';
const teacherUnavailableStudentNamesByTeacher = {};
const TEACHER_UNAVAILABLE_STUDENTS_META_KEY = '__unavailableStudentNames';
let studentVisibleRescheduledNamesBySlot = {};
/** Session-only: slots booked by a class supervisor on another teacher's grid (for allowed clears). */
let supervisorSlotBookingsByTeacher = {};

function getScheduleSlotMapWithoutMeta(schedule) {
    const out = {};
    if (!schedule || typeof schedule !== 'object') return out;
    Object.entries(schedule).forEach(([key, value]) => {
        if (key === TEACHER_UNAVAILABLE_STUDENTS_META_KEY) return;
        out[key] = value;
    });
    return out;
}

function getUnavailableStudentNamesMetaFromSchedule(schedule) {
    if (!schedule || typeof schedule !== 'object') return {};
    const raw = schedule[TEACHER_UNAVAILABLE_STUDENTS_META_KEY];
    if (!raw || typeof raw !== 'object') return {};
    const cleaned = {};
    Object.entries(raw).forEach(([slotKey, studentName]) => {
        const key = String(slotKey || '').trim();
        const name = String(studentName || '').trim();
        if (!key || !name) return;
        cleaned[key] = name;
    });
    return cleaned;
}

function withUnavailableStudentNamesMeta(teacherName, schedule) {
    const next = { ...(schedule || {}) };
    if (!isActiveTeacherName(teacherName)) {
        delete next[TEACHER_UNAVAILABLE_STUDENTS_META_KEY];
        return next;
    }
    const byTeacher = teacherUnavailableStudentNamesByTeacher[teacherName];
    if (!byTeacher || typeof byTeacher !== 'object') {
        delete next[TEACHER_UNAVAILABLE_STUDENTS_META_KEY];
        return next;
    }
    const cleaned = {};
    Object.entries(byTeacher).forEach(([slotKey, studentName]) => {
        const key = String(slotKey || '').trim();
        const name = String(studentName || '').trim();
        if (!key || !name) return;
        cleaned[key] = name;
    });
    if (Object.keys(cleaned).length === 0) {
        delete next[TEACHER_UNAVAILABLE_STUDENTS_META_KEY];
        return next;
    }
    next[TEACHER_UNAVAILABLE_STUDENTS_META_KEY] = cleaned;
    return next;
}

// Cloudflare API endpoint
const API_ENDPOINT = '/api/schedules';

/**
 * Resolve a root-relative `/api/...` path on the site's http(s) origin.
 * From `file:///C:/folder/index.html`, paths like `/api/roster` become `file:///C:/api/...`,
 * which shows up as bogus "CORS" failures in DevTools Network.
 *
 * Returns null unless the document is loaded over http: or https: (serve via Cloudflare Pages
 * or a local dev server such as `wrangler pages dev`, not raw file:// ).
 */
function absoluteHttpApiUrl(pathnameAndSearch) {
    if (typeof location === 'undefined' || typeof window === 'undefined') return null;
    if (!/^https?:$/i.test(String(location.protocol || ''))) return null;
    const raw = String(pathnameAndSearch || '').trim();
    if (!raw.startsWith('/')) return null;
    try {
        return new URL(raw, window.location.origin).href;
    } catch {
        return null;
    }
}

// Polling interval for checking updates (in milliseconds)
const POLL_INTERVAL = 2000; // 2 seconds - faster polling for better sync
/** Class-report uploads KV sync runs on its own interval so feed updates feel snappier than schedule polling. */
const CLASS_REPORT_UPLOAD_CLOUD_POLL_MS = 600;

// Track if we're currently saving
let isSaving = false;

// Track last update timestamp to prevent unnecessary updates
let lastUpdateTimestamp = null;

// Debounce timer for saving
let saveTimer = null;
/** Schedules skipped `saveAllSchedules` calls while KV POST runs; flushed after `performSave` finishes. */
let schedulesCloudSavePending = false;

// Polling timer for checking updates
let pollTimer = null;
let classReportUploadCloudPollTimer = null;

// Track if status update is pending
let statusUpdateTimer = null;

// Roster cloud sync
let rosterSaveTimer = null;
let isSavingRoster = false;
let pendingRosterPayload = null;
let rosterLastUpdateTimestamp = null;

let classReportUploadsCloudTimestamp = null;
try {
    const bootTs = localStorage.getItem(CLASS_REPORT_UPLOADS_CLOUD_TS_STORAGE_KEY);
    if (bootTs && String(bootTs).trim()) {
        classReportUploadsCloudTimestamp = String(bootTs).trim();
    }
} catch {
    classReportUploadsCloudTimestamp = null;
}

function setClassReportUploadsCloudTimestamp(nextTs) {
    if (nextTs == null || !String(nextTs).trim()) return;
    const s = String(nextTs).trim();
    classReportUploadsCloudTimestamp = s;
    try {
        localStorage.setItem(CLASS_REPORT_UPLOADS_CLOUD_TS_STORAGE_KEY, s);
    } catch {
        /* private mode / quota */
    }
}

function maybeAdvanceClassReportUploadsCloudTsFromPoll(remoteTs) {
    if (!remoteTs || !String(remoteTs).trim()) return;
    const s = String(remoteTs).trim();
    const cur = classReportUploadsCloudTimestamp;
    if (!cur || String(s) > String(cur)) {
        setClassReportUploadsCloudTimestamp(s);
    }
}

async function saveRosterToCloud(rosterPayload) {
    if (!rosterPayload || typeof rosterPayload !== 'object') return;
    const rosterUrl = absoluteHttpApiUrl('/api/roster');
    if (!rosterUrl) return;
    if (isSavingRoster) {
        pendingRosterPayload = rosterPayload;
        return;
    }
    isSavingRoster = true;
    try {
        const isScopedTeacher =
            !isAdminLoggedIn &&
            isTeacherLoggedIn &&
            !loggedInStudentFullName &&
            String(loggedInTeacherName || '').trim();
        let rosterForRequest = rosterPayload;
        if (isScopedTeacher && isGateStaffAccountSession() && String(loggedInTeacherName || '').trim()) {
            rosterForRequest = { ...rosterPayload, teachers: [String(loggedInTeacherName || '').trim()] };
        }
        const payload = isScopedTeacher ? { roster: rosterForRequest, merge: true } : { roster: rosterPayload };
        const response = await fetch(rosterUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getTimetableApiAuthHeaders()
            },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            const data = await response.json();
            if (data?.lastUpdated) {
                rosterLastUpdateTimestamp = data.lastUpdated;
            }
        }
    } catch (error) {
        console.error('Error saving roster to cloud:', error);
    } finally {
        isSavingRoster = false;
        if (pendingRosterPayload) {
            const nextPayload = pendingRosterPayload;
            pendingRosterPayload = null;
            saveRosterToCloud(nextPayload);
        }
    }
}

function queueSaveRosterToCloud(rosterPayload) {
    if (rosterSaveTimer) {
        clearTimeout(rosterSaveTimer);
    }
    rosterSaveTimer = setTimeout(() => {
        saveRosterToCloud(rosterPayload);
    }, 350);
}

async function pollRosterUpdates() {
    if (isSavingRoster) return;
    const rosterPollBase = absoluteHttpApiUrl('/api/roster');
    if (!rosterPollBase) return;
    let rosterPollUrl;
    try {
        const u = new URL(rosterPollBase);
        u.searchParams.set('t', String(Date.now()));
        rosterPollUrl = u.href;
    } catch {
        rosterPollUrl = rosterPollBase + (rosterPollBase.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
    try {
        const response = await fetch(rosterPollUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getTimetableApiAuthHeaders()
            },
            cache: 'no-cache',
        });
        if (!response.ok) return;
        const data = await response.json().catch(() => null);
        if (!data?.success) return;

        const remoteTimestamp = data?.lastUpdated || null;
        if (!remoteTimestamp || remoteTimestamp === rosterLastUpdateTimestamp) return;

        if (!data.roster || typeof data.roster !== 'object') {
            console.warn('Roster poll: missing or invalid roster payload, skipping.');
            return;
        }

        let localRosterRaw = '';
        try {
            localRosterRaw = String(localStorage.getItem(ROSTER_STORAGE_KEY) || '');
        } catch (error) {
            console.error('Error reading local roster cache:', error);
        }
        const remoteRosterRaw = JSON.stringify(data.roster);

        /** Student feed can change when roster metadata changes without localStorage divergence. */
        const studentLoggedIn = String(loggedInStudentFullName || '').trim();

        if (localRosterRaw === remoteRosterRaw) {
            rosterLastUpdateTimestamp = remoteTimestamp;
            if (studentLoggedIn) void pollClassReportUploadsFromCloud();
            return;
        }

        await initRoster(data.roster);
        rosterLastUpdateTimestamp = remoteTimestamp;
        syncSpeakOnWeeklyToAllTeacherSchedules();
        renderSidebar();
        resyncSelectionAfterSidebarRender();
        if (studentLoggedIn) {
            void pollClassReportUploadsFromCloud();
        }
    } catch (error) {
        console.error('Roster polling error:', error);
    }
}

async function pollClassReportUploadsFromCloud() {
    if (classReportUploadPullInFlight) return;
    if (classReportUploadPushInFlight > 0) {
        return;
    }

    const baseApi = absoluteHttpApiUrl(CLASS_REPORT_UPLOADS_API_ENDPOINT);
    if (!baseApi) return;

    let pollUrl;
    try {
        const u = new URL(baseApi);
        u.searchParams.set('t', String(Date.now()));
        pollUrl = u.href;
    } catch {
        pollUrl =
            baseApi.indexOf('?') !== -1
                ? baseApi + '&t=' + Date.now()
                : baseApi + '?t=' + Date.now();
    }

    classReportUploadPullInFlight = true;
    try {
        const response = await fetch(pollUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...getTimetableApiAuthHeaders() },
            cache: 'no-cache',
        });
        if (!response.ok) return;
        const data = await response.json().catch(() => null);
        if (!data?.success) return;
        const ts = data.lastUpdated || null;
        let manifest =
            data.manifest && typeof data.manifest === 'object' && !Array.isArray(data.manifest)
                ? data.manifest
                : { students: {} };
        // Tolerate `{ StudentName: uploads[] }` payloads with no `students` key (not used by current GET).
        if (
            !Object.prototype.hasOwnProperty.call(manifest, 'students') &&
            typeof manifest === 'object' &&
            !Array.isArray(manifest)
        ) {
            const looksLikeBareBuckets = Object.values(manifest).every(
                (v) => v == null || Array.isArray(v)
            );
            if (looksLikeBareBuckets && Object.keys(manifest).length > 0) {
                manifest = { students: { ...manifest } };
            }
        }
        const buckets = manifest.students && typeof manifest.students === 'object' ? manifest.students : {};
        const fpRemote = stableStringifyManifestStudents(buckets);

        const storedTs = classReportUploadsCloudTimestamp;
        if (storedTs && ts && String(ts).trim() && String(ts) < String(storedTs)) {
            return;
        }

        if (fpRemote === lastSyncedClassReportUploadsJson) {
            maybeAdvanceClassReportUploadsCloudTsFromPoll(ts);
            return;
        }

        await applyRemoteManifestPayload(manifest, ts);
    } catch (error) {
        console.error('Class report uploads cloud poll error:', error);
    } finally {
        classReportUploadPullInFlight = false;
    }
}

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
        loadAllSchedulesLocal();
        const skipCloudClobberPendingUpload =
            isSchedulePendingCloudUpload() && Object.keys(teacherSchedules || {}).length > 0;

        const schedulesUrl = absoluteHttpApiUrl(API_ENDPOINT);
        if (!schedulesUrl) {
            updateSyncStatus(
                'local-only',
                '⚠ Open via http/https (Pages or local server) for cloud sync — localStorage only'
            );
            loadAllSchedulesLocal();
            startPolling();
            void pollClassReportUploadsFromCloud();
            return;
        }

        const response = await fetch(schedulesUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getTimetableApiAuthHeaders()
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            
                if (data.success) {
                if (data.schedules && !skipCloudClobberPendingUpload) {
                    Object.assign(teacherSchedules, data.schedules);
                    applyTeacherDataIsolationInMemory();
                }
                lastUpdateTimestamp = data.lastUpdated;

                // Start polling for updates
                startPolling();
                void pollClassReportUploadsFromCloud();

                updateSyncStatus('synced', '✓ Cloud sync active');
                if (skipCloudClobberPendingUpload) {
                    saveAllSchedules();
                }
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
                // Still poll roster + class-report feed — /api/schedules may be misconfigured while other APIs work
                startPolling();
                void pollClassReportUploadsFromCloud();
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
        // First schedule fetch failed (offline, DNS, regional routing); still sync roster + class report feed when possible
        startPolling();
        void pollClassReportUploadsFromCloud();
    }
}

/** When the tab wakes from background, timers may have been throttled — catch up roster + feed. */
function setupVisibilityCloudRefresh() {
    if (document.body.dataset.visibilityCloudRefresh === '1') return;
    document.body.dataset.visibilityCloudRefresh = '1';
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        void pollClassReportUploadsFromCloud();
        void pollRosterUpdates();
    });
}

// Start polling for updates from other devices
function startPolling() {
    // Clear any existing polling
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    if (classReportUploadCloudPollTimer) {
        clearInterval(classReportUploadCloudPollTimer);
        classReportUploadCloudPollTimer = null;
    }

    console.log(
        'Starting polling: schedules every',
        POLL_INTERVAL / 1000,
        's, class-report uploads every',
        CLASS_REPORT_UPLOAD_CLOUD_POLL_MS / 1000,
        's'
    );

    // Poll every few seconds for updates
    pollTimer = setInterval(async () => {
        if (!isSaving) {
            try {
                const schedBase = absoluteHttpApiUrl(API_ENDPOINT);
                if (!schedBase) {
                    return;
                }
                let schedPollUrl;
                try {
                    const u = new URL(schedBase);
                    u.searchParams.set('t', String(Date.now()));
                    schedPollUrl = u.href;
                } catch {
                    schedPollUrl = schedBase + (schedBase.includes('?') ? '&' : '?') + 't=' + Date.now();
                }
                const response = await fetch(schedPollUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getTimetableApiAuthHeaders()
                    },
                    cache: 'no-cache',
                });

                if (response.ok) {
                    const data = await response.json().catch(() => null);

                    if (data?.success) {
                        const schedules = data.schedules;
                        const hasScheduleMap =
                            schedules != null &&
                            typeof schedules === 'object' &&
                            !Array.isArray(schedules);

                        if (hasScheduleMap) {
                            const timestampChanged = data.lastUpdated && data.lastUpdated !== lastUpdateTimestamp;

                            const localSchedulesStr = JSON.stringify(teacherSchedules);
                            const remoteSchedulesStr = JSON.stringify(schedules);
                            const dataChanged = localSchedulesStr !== remoteSchedulesStr;

                            if (timestampChanged) {
                                console.log('Timestamp changed - checking for updates');

                                if (dataChanged) {
                                    if (isSchedulePendingCloudUpload()) {
                                        void saveAllSchedules();
                                    } else {
                                        console.log('Data changed - updating from cloud');
                                        Object.assign(teacherSchedules, schedules);
                                        applyTeacherDataIsolationInMemory();
                                        syncSpeakOnWeeklyToAllTeacherSchedules();

                                        updateSyncStatus('synced', '✓ Updated from cloud');
                                        setTimeout(() => {
                                            updateSyncStatus('synced', 'Cloud sync active');
                                        }, 2000);
                                    }
                                    lastUpdateTimestamp = data.lastUpdated;
                                } else {
                                    lastUpdateTimestamp = data.lastUpdated;
                                    console.log('Timestamp updated, data unchanged');
                                }
                            }
                        } else if (data.lastUpdated) {
                            lastUpdateTimestamp = data.lastUpdated;
                        }
                    }
                } else {
                    console.error('Polling failed with status:', response.status);
                }
            } catch (error) {
                // Silent error - don't show error for polling failures
                console.error('Polling error:', error);
            }
        }
        await pollRosterUpdates();
    }, POLL_INTERVAL);

    classReportUploadCloudPollTimer = window.setInterval(() => {
        void pollClassReportUploadsFromCloud();
    }, CLASS_REPORT_UPLOAD_CLOUD_POLL_MS);
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

function markSchedulePendingCloudUpload() {
    try {
        localStorage.setItem(SCHEDULE_PENDING_CLOUD_UPLOAD_KEY, '1');
    } catch (_) {
        /* quota / private mode */
    }
}

function clearSchedulePendingCloudUpload() {
    try {
        localStorage.removeItem(SCHEDULE_PENDING_CLOUD_UPLOAD_KEY);
    } catch (_) {
        /* ignore */
    }
}

function isSchedulePendingCloudUpload() {
    try {
        return localStorage.getItem(SCHEDULE_PENDING_CLOUD_UPLOAD_KEY) === '1';
    } catch {
        return false;
    }
}

// Save all schedules to Cloudflare KV or localStorage (with debouncing)
function saveAllSchedules() {
    if (isSaving) {
        schedulesCloudSavePending = true;
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

/** Cloud schedule POST: class supervisors may only submit keys the server merge accepts. */
function getSchedulesPayloadForCloudPost() {
    if (!isGateStaffAccountSession() || getGateSessionAppRole() !== 'class-supervisor') {
        return teacherSchedules;
    }
    const self = String(loggedInTeacherName || '').trim();
    const allowed = new Set();
    if (self) allowed.add(self);
    supervisionLinks.forEach((l) => {
        if (!isSupervisionLinkActiveClient(l)) return;
        if (String(l?.superiorProfile || '').trim().toLowerCase() !== self.toLowerCase()) return;
        if (String(l?.superiorAppRole || '').trim() !== 'class-supervisor') return;
        const tp = String(l?.teacherProfile || '').trim();
        if (tp) allowed.add(tp);
    });
    const out = {};
    for (const k of Object.keys(teacherSchedules)) {
        if (allowed.has(k)) out[k] = teacherSchedules[k];
    }
    return out;
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

        const postUrl = absoluteHttpApiUrl(API_ENDPOINT);
        if (!postUrl) {
            saveAllSchedulesLocal();
            updateSyncStatus('local-only', '⚠ Served from file — saved locally only');
            return;
        }

        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getTimetableApiAuthHeaders()
            },
            body: JSON.stringify({
                schedules: getSchedulesPayloadForCloudPost(),
            }),
        });

        if (response.ok) {
            const data = await response.json();

            if (data.success) {
                lastUpdateTimestamp = data.lastUpdated;
                console.log('Successfully saved to cloud. Timestamp:', data.lastUpdated);

                clearSchedulePendingCloudUpload();
                saveAllSchedulesLocal();

                statusUpdateTimer = setTimeout(() => {
                    updateSyncStatus('synced', '✓ Saved to cloud');

                    statusUpdateTimer = setTimeout(() => {
                        updateSyncStatus('synced', 'Cloud sync active');
                        statusUpdateTimer = null;
                    }, 1500);
                }, 300);
            } else {
                throw new Error(data.error || 'Save failed');
            }
        } else {
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

        let errorMessage = 'Save failed';
        if (
            error.message.includes('schedules_kv not configured') ||
            error.message.includes('KV_SCHEDULES not configured') ||
            error.message.includes('503')
        ) {
            errorMessage = 'KV not configured - check binding name is "schedules_kv"';
        } else if (error.message.includes('404')) {
            errorMessage = 'API not found - check function deployment';
        } else if (error.message) {
            errorMessage = error.message;
        }

        updateSyncStatus('local-only', `⚠ ${errorMessage} - using local storage`);

        saveAllSchedulesLocal();
    } finally {
        isSaving = false;
        if (schedulesCloudSavePending) {
            schedulesCloudSavePending = false;
            saveAllSchedules();
        }
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

/** Human-readable role under the sidebar profile name (matches gate / roster roles). */
function getSidebarProfileRoleLabel() {
    if (!isTeacherLoggedIn) return 'Guest';
    if (isAdminLoggedIn) return 'Admin';
    if (loggedInStudentFullName) return 'Student';
    if (isGateStaffAccountSession()) {
        const r = getGateSessionAppRole();
        if (r === 'coordinator') return 'Coordinator';
        if (r === 'class-supervisor') return 'Class Supervisor';
        if (r === 'assistant') return 'Teacher Assistant';
    }
    const tap = String(teacherAppRolesByName[loggedInTeacherName] || '').trim();
    if (tap === 'coordinator') return 'Coordinator';
    if (tap === 'class-supervisor') return 'Class Supervisor';
    if (tap === 'assistant') return 'Teacher Assistant';
    return 'Teacher';
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
    const displayRole = getSidebarProfileRoleLabel();

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

    function applySidebarAvatarFromFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showAppMessage('Please select or paste an image file.');
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
    }

    avatarBtn.addEventListener('paste', (e) => {
        if (!isTeacherLoggedIn) return;
        const file = pickFirstUsableFileFromClipboardData(e.clipboardData);
        if (!file) return;
        e.preventDefault();
        applySidebarAvatarFromFile(file);
    });

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        applySidebarAvatarFromFile(file);
    });
}

const SIDEBAR_CURSOR_TOOLTIP_ID = 'sidebarCursorTooltip';

function ensureSidebarCursorTooltip() {
    let el = document.getElementById(SIDEBAR_CURSOR_TOOLTIP_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = SIDEBAR_CURSOR_TOOLTIP_ID;
    el.className = 'sidebar-cursor-tooltip';
    el.setAttribute('role', 'tooltip');
    el.hidden = true;
    el.textContent = '';
    document.body.appendChild(el);
    return el;
}

/**
 * Tooltip top-left is anchored just past the pointer’s bottom-right from the hotspot (clientX/Y),
 * or past the button’s bottom-right on focus.
 */
function bindSidebarCursorTooltip(button, tipText) {
    const tip = ensureSidebarCursorTooltip();
    const CURSOR_BR_OFFSET_X = 10;
    const CURSOR_BR_OFFSET_Y = 12;
    const GAP = 4;
    const prepareTip = () => {
        tip.textContent = tipText;
        tip.removeAttribute('hidden');
        tip.style.position = 'fixed';
        tip.style.transform = 'none';
        tip.style.pointerEvents = 'none';
        tip.style.visibility = 'visible';
    };
    const positionTipFromPointerHotspot = (clientX, clientY) => {
        prepareTip();
        const ax = clientX + CURSOR_BR_OFFSET_X + GAP;
        const ay = clientY + CURSOR_BR_OFFSET_Y + GAP;
        tip.style.left = `${ax}px`;
        tip.style.top = `${ay}px`;
    };
    const positionTipFromAnchorPoint = (anchorRight, anchorBottom) => {
        prepareTip();
        tip.style.left = `${anchorRight + GAP}px`;
        tip.style.top = `${anchorBottom + GAP}px`;
    };
    const showAtFocus = () => {
        requestAnimationFrame(() => {
            const r = button.getBoundingClientRect();
            positionTipFromAnchorPoint(r.right, r.bottom);
        });
    };
    const hide = () => {
        tip.setAttribute('hidden', '');
        tip.style.left = '';
        tip.style.top = '';
        tip.style.transform = '';
        tip.style.visibility = '';
        tip.style.position = '';
        tip.style.pointerEvents = '';
    };
    button.addEventListener('mousemove', (e) => {
        positionTipFromPointerHotspot(e.clientX, e.clientY);
    });
    button.addEventListener('mouseleave', hide);
    button.addEventListener('focus', () => {
        showAtFocus();
    });
    button.addEventListener('blur', hide);
}

function performTeacherSessionLogout() {
    isTeacherLoggedIn = false;
    isAdminLoggedIn = false;
    loggedInTeacherName = '';
    loggedInStudentFullName = '';
    currentTeacher = null;
    clearSavedLoginCredentials();
    broadcastSessionLogoutToOtherTabs();
    clearTimetableApiBearerToken();
    supervisorSlotBookingsByTeacher = {};
    resetClassStartNotificationCache();
    notifyUpcomingClasses();
    try {
        sessionStorage.setItem(LOGIN_SESSION_SUPPRESS_KEY, '1');
        sessionStorage.removeItem(ADMIN_LOGIN_SESSION_KEY);
    } catch {
        /* ignore */
    }
    renderSidebar();
    setLoggedOutDashboard();
    window.location.href = 'login-screen.html';
}

function renderSidebar() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList) return;
    const sidebarMode = getSidebarRenderMode();
    const isStudentSidebar = sidebarMode === 'student';
    const sidebarRoot = teacherList.closest('.sidebar');
    sidebarRoot?.classList.toggle('is-logged-in', !!isTeacherLoggedIn);
    sidebarRoot?.classList.toggle('is-student-session', !!loggedInStudentFullName);
    sidebarRoot?.classList.toggle('is-admin-session', hasEffectiveAdminSession());
    renderSidebarHeaderProfile();

    const collapsedByTitle = {};
    teacherList.querySelectorAll('.sidebar-category').forEach((sec) => {
        const titleBtn = sec.querySelector('.sidebar-section-title');
        if (titleBtn) {
            collapsedByTitle[titleBtn.textContent.trim()] = sec.classList.contains('collapsed');
        }
    });

    teacherList.innerHTML = '';
    const sidebarMain = document.createElement('div');
    sidebarMain.className = 'sidebar-main';
    sidebarMain.hidden = !hasEffectiveAdminSession();

    const sidebarTop = document.createElement('div');
    sidebarTop.className = 'sidebar-top';

    const dashboardBtn = document.createElement('button');
    dashboardBtn.type = 'button';
    dashboardBtn.className = 'teacher-list-dashboard-btn';
    dashboardBtn.setAttribute('aria-label', 'Open dashboard');
    dashboardBtn.title = 'Dashboard';
    dashboardBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="teacher-list-dashboard-btn-icon" aria-hidden="true">' +
        '<path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />' +
        '</svg><span class="teacher-list-dashboard-btn-label">Dashboard</span>';
    dashboardBtn.hidden = !hasEffectiveAdminSession();
    dashboardBtn.addEventListener('click', () => {
        if (!hasEffectiveAdminSession()) return;
        setAdminDashboard();
    });
    sidebarTop.appendChild(dashboardBtn);
    const managementSection = document.createElement('section');
    managementSection.className = 'teacher-list-management';
    managementSection.hidden = !hasEffectiveAdminSession();
    managementSection.innerHTML = `
        <div class="management-section">
            <h3 class="management-section-title">— Management</h3>
            <div class="management-actions" id="teacherListManagementActions">
                <button type="button" class="teacher-btn" data-management-nav="teachers" aria-label="Teachers">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clip-rule="evenodd" />
                        <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                    </svg>
                    <span class="management-nav-btn-label">Teachers</span>
                </button>
                <button type="button" class="school-btn" data-management-nav="schools" aria-label="Schools">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd" />
                    </svg>
                    <span class="management-nav-btn-label">Schools</span>
                </button>
                <button type="button" class="student-btn" data-management-nav="students" aria-label="Students">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>
                    <span class="management-nav-btn-label">Students</span>
                </button>
                <button type="button" class="class-btn" data-management-nav="classes" aria-label="Classes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                        <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" />
                    </svg>
                    <span class="management-nav-btn-label">Classes</span>
                </button>
                <button type="button" class="payment-btn" data-management-nav="payments" aria-label="Payments">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                        <path fill-rule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clip-rule="evenodd" />
                        <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                    </svg>
                    <span class="management-nav-btn-label">Payments</span>
                </button>
            </div>
        </div>
    `;
    sidebarTop.appendChild(managementSection);

    const otherSection = document.createElement('section');
    otherSection.className = 'teacher-list-other';
    otherSection.hidden = !hasEffectiveAdminSession();
    otherSection.innerHTML = `
        <div class="other-section">
            <h3 class="other-section-title">— Other</h3>
            <div class="other-actions" id="teacherListOtherActions">
                <button type="button" class="report-btn" data-other-nav="report" aria-label="Report">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.04 16.5.5-1.5h6.42l.5 1.5H8.29Zm7.46-12a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Zm-3 2.25a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V9Zm-3 2.25a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z" clip-rule="evenodd" />
                    </svg>
                    <span class="management-nav-btn-label">Report</span>
                </button>
                <button type="button" class="settings-btn" data-other-nav="settings" aria-label="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd" />
                        <path d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                        <path fill-rule="evenodd" d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                    <span class="management-nav-btn-label">Settings</span>
                </button>
                <button type="button" class="audit-logs-btn" data-other-nav="audit-logs" aria-label="Audit logs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="management-nav-btn-icon" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                    <span class="management-nav-btn-label">Audit Logs</span>
                </button>
            </div>
        </div>
    `;
    sidebarTop.appendChild(otherSection);

    const sidebarBottom = document.createElement('div');
    sidebarBottom.className = 'sidebar-bottom';
    const adminLogoffBtn = document.createElement('button');
    adminLogoffBtn.type = 'button';
    adminLogoffBtn.id = 'sidebarAdminLogoffBtn';
    adminLogoffBtn.className = 'sidebar-admin-logoff-btn';
    adminLogoffBtn.setAttribute('aria-label', 'Log off');
    adminLogoffBtn.title = 'Log off';
    adminLogoffBtn.innerHTML =
        `${SIDEBAR_LOGOUT_TEACHER_SVG}<span class="sidebar-admin-logoff-btn-label">Log off</span>`;
    sidebarBottom.appendChild(adminLogoffBtn);

    sidebarMain.appendChild(sidebarTop);
    sidebarMain.appendChild(sidebarBottom);
    teacherList.appendChild(sidebarMain);

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
    addTeacherBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--teacher';
    addTeacherBtn.setAttribute('aria-label', 'Add teacher profile');
    addTeacherBtn.hidden = !hasEffectiveAdminSession();
    addTeacherBtn.innerHTML = SIDEBAR_ADD_TEACHER_SVG;
    addTeacherBtn.addEventListener('click', () => {
        if (!canManageRoster()) {
            denyStudentAction('Permission denied: students cannot add teacher profiles.');
            return;
        }
        window.openAddTeacherPopup?.();
    });
    bindSidebarCursorTooltip(addTeacherBtn, 'Add your Profile');
    const loginTeacherBtn = document.createElement('button');
    loginTeacherBtn.type = 'button';
    loginTeacherBtn.className = 'sidebar-add-btn sidebar-add-btn--with-text sidebar-section-add-btn sidebar-auth-btn';
    if (isTeacherLoggedIn) {
        loginTeacherBtn.classList.add('sidebar-auth-btn--logout');
        loginTeacherBtn.setAttribute('aria-label', 'Teacher logout');
        loginTeacherBtn.innerHTML = `${SIDEBAR_LOGOUT_TEACHER_SVG}<span class="sidebar-add-btn-label">Log Out</span>`;
        loginTeacherBtn.addEventListener('click', () => {
            performTeacherSessionLogout();
        });
    } else {
        loginTeacherBtn.classList.add('sidebar-auth-btn--login');
        loginTeacherBtn.setAttribute('aria-label', 'Admin login');
        loginTeacherBtn.innerHTML = `<span class="sidebar-add-btn-label">Log In</span>${SIDEBAR_LOGIN_TEACHER_SVG}`;
        loginTeacherBtn.addEventListener('click', () => {
            window.location.href = 'login-screen.html';
        });
    }
    bindSidebarCursorTooltip(loginTeacherBtn, isTeacherLoggedIn ? 'Log out' : 'Admin login');
    const teachersHeaderActions = document.createElement('div');
    teachersHeaderActions.className = 'sidebar-section-actions';
    teachersHeaderActions.appendChild(loginTeacherBtn);
    teachersHeaderActions.appendChild(addTeacherBtn);
    teachersHeader.appendChild(teachersHeaderLabel);
    teachersHeader.appendChild(teachersHeaderActions);
    const teachersInner = document.createElement('div');
    teachersInner.className = 'sidebar-pane-teachers-inner';
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
    addStudentEntryBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--student-entry';
    addStudentEntryBtn.setAttribute('aria-label', 'Add student');
    addStudentEntryBtn.innerHTML = ADD_STUDENT_SVG;
    addStudentEntryBtn.addEventListener('click', () => {
        if (!canManageRoster()) {
            denyStudentAction('Permission denied: students cannot add student profiles.');
            return;
        }
        if (typeof window.openNewAddStudentModal === 'function') {
            window.openNewAddStudentModal();
            return;
        }
        window.openAddStudentPopup?.();
    });
    bindSidebarCursorTooltip(addStudentEntryBtn, 'Add a student');
    const googleMeetBtn = document.createElement('button');
    googleMeetBtn.type = 'button';
    googleMeetBtn.id = 'googleMeetBtn';
    googleMeetBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--google-meet';
    googleMeetBtn.setAttribute('aria-label', 'Open Google Meet');
    googleMeetBtn.innerHTML = SIDEBAR_GOOGLE_MEET_SVG;
    googleMeetBtn.addEventListener('click', () => {
        if (!canEditFeed()) {
            denyStudentAction('Permission denied: students cannot manage feed content.');
            return;
        }
        openGoogleMeetLinksLayer();
    });
    bindSidebarCursorTooltip(googleMeetBtn, 'Open Google Meet');
    const addStudentBtn = document.createElement('button');
    addStudentBtn.type = 'button';
    addStudentBtn.id = 'addSchoolBtn';
    addStudentBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--school';
    addStudentBtn.setAttribute('aria-label', 'Add school');
    addStudentBtn.innerHTML = SIDEBAR_ADD_SCHOOL_SVG;
    addStudentBtn.addEventListener('click', () => {
        if (!canManageRoster()) {
            denyStudentAction('Permission denied: students cannot add schools.');
            return;
        }
        window.openAddSchoolPopup?.();
    });
    bindSidebarCursorTooltip(addStudentBtn, 'Add a school');
    addStudentBtn.hidden = !hasEffectiveAdminSession();
    if (isStudentSidebar) {
        addTeacherBtn.hidden = true;
        googleMeetBtn.hidden = true;
        addStudentEntryBtn.hidden = true;
        addStudentBtn.hidden = true;
    }
    const studentsHeaderActions = document.createElement('div');
    studentsHeaderActions.className = 'sidebar-section-actions';
    studentsHeaderActions.appendChild(addStudentEntryBtn);
    studentsHeaderActions.appendChild(addStudentBtn);
    studentsHeader.appendChild(studentsHeaderLabel);
    studentsHeader.appendChild(studentsHeaderActions);

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
    classReportDownloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    const classReportPromptBtn = document.createElement('button');
    classReportPromptBtn.type = 'button';
    classReportPromptBtn.className = 'sidebar-class-report-prompt-btn';
    classReportPromptBtn.id = 'classReportWeeklyPromptBtn';
    classReportPromptBtn.title = 'Copy weekly prompt';
    classReportPromptBtn.setAttribute('aria-label', 'Copy weekly prompt');
    classReportPromptBtn.setAttribute('aria-expanded', 'false');
    classReportPromptBtn.innerHTML = CALENDAR_TOOLBAR_PROMPT_SVG;
    classReportPromptBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleCalendarPromptPopover(classReportPromptBtn);
    });
    const classReportHeaderActions = document.createElement('div');
    classReportHeaderActions.className = 'sidebar-section-actions';
    if (isStudentSidebar) {
        classReportPromptBtn.hidden = true;
        classReportDownloadBtn.hidden = true;
    }
    classReportHeaderActions.appendChild(googleMeetBtn);
    classReportHeaderActions.appendChild(classReportPromptBtn);
    classReportHeaderActions.appendChild(classReportDownloadBtn);
    bindSidebarCursorTooltip(classReportDownloadBtn, 'Download class report (PDF)');
    bindSidebarCursorTooltip(classReportPromptBtn, 'Copy weekly prompt');
    classReportHeader.appendChild(classReportHeaderTitle);
    classReportHeader.appendChild(classReportHeaderActions);
    const classReportInner = document.createElement('div');
    classReportInner.className = 'sidebar-pane-class-report-inner';
    classReportInner.setAttribute('aria-label', 'Class report content');
    paneClassReport.appendChild(classReportHeader);
    paneClassReport.appendChild(classReportInner);

    const paneMaterials = document.createElement('div');
    paneMaterials.className = 'sidebar-pane sidebar-pane-materials';
    const materialsHeader = document.createElement('div');
    materialsHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const materialsHeaderTitle = document.createElement('span');
    materialsHeaderTitle.className = 'sidebar-section-header-label';
    materialsHeaderTitle.textContent = 'Materials';
    const addMaterialsBtn = document.createElement('button');
    addMaterialsBtn.type = 'button';
    addMaterialsBtn.id = 'addMaterialsBtn';
    addMaterialsBtn.className = 'sidebar-add-btn sidebar-section-add-btn sidebar-add-btn--materials';
    addMaterialsBtn.setAttribute('aria-label', 'Add material');
    addMaterialsBtn.innerHTML = SIDEBAR_ADD_MATERIALS_SVG;
    addMaterialsBtn.addEventListener('click', () => {
        if (!canManageRoster()) {
            denyStudentAction('Permission denied: students cannot add materials.');
            return;
        }
        showMaterialsMainView();
    });
    bindSidebarCursorTooltip(addMaterialsBtn, 'Add material');
    const materialsHeaderActions = document.createElement('div');
    materialsHeaderActions.className = 'sidebar-section-actions';
    materialsHeaderActions.appendChild(addMaterialsBtn);
    if (isStudentSidebar) {
        addMaterialsBtn.hidden = true;
    }
    materialsHeader.appendChild(materialsHeaderTitle);
    materialsHeader.appendChild(materialsHeaderActions);
    const materialsInner = document.createElement('div');
    materialsInner.className = 'sidebar-pane-materials-inner';
    materialsInner.setAttribute('aria-label', 'Materials');
    paneMaterials.appendChild(materialsHeader);
    paneMaterials.appendChild(materialsInner);

    const paneCoordinator = document.createElement('div');
    paneCoordinator.className = 'sidebar-pane sidebar-pane-coordinator';
    paneCoordinator.hidden = true;
    const coordinatorHeader = document.createElement('div');
    coordinatorHeader.className = 'sidebar-section-header';
    const coordinatorHeaderLabel = document.createElement('span');
    coordinatorHeaderLabel.className = 'sidebar-section-header-label';
    coordinatorHeaderLabel.textContent = 'Coordinator';
    coordinatorHeader.appendChild(coordinatorHeaderLabel);
    const coordinatorInner = document.createElement('div');
    coordinatorInner.className = 'sidebar-pane-coordinator-inner';
    paneCoordinator.appendChild(coordinatorHeader);
    paneCoordinator.appendChild(coordinatorInner);

    const paneClassSupervisor = document.createElement('div');
    paneClassSupervisor.className = 'sidebar-pane sidebar-pane-class-supervisor';
    paneClassSupervisor.hidden = true;
    const classSupervisorHeader = document.createElement('div');
    classSupervisorHeader.className = 'sidebar-section-header sidebar-section-header--with-action';
    const classSupervisorHeaderLabel = document.createElement('span');
    classSupervisorHeaderLabel.className = 'sidebar-section-header-label';
    classSupervisorHeaderLabel.textContent = 'Class Supervisor';
    const shareDataBtn = document.createElement('button');
    shareDataBtn.type = 'button';
    shareDataBtn.id = 'sidebarShareDataBtn';
    shareDataBtn.className = 'sidebar-add-btn sidebar-section-add-btn';
    shareDataBtn.setAttribute('aria-label', 'Share data');
    shareDataBtn.innerHTML = SIDEBAR_SHARE_DATA_SVG;
    const isClassSupervisorGateSession =
        isTeacherLoggedIn &&
        !loggedInStudentFullName &&
        isGateStaffAccountSession() &&
        getGateSessionAppRole() === 'class-supervisor';
    shareDataBtn.hidden = !isClassSupervisorGateSession;
    shareDataBtn.addEventListener('click', () => {
        openSupervisionInviteModal();
    });
    bindSidebarCursorTooltip(shareDataBtn, 'Invite teachers to share data');
    const classSupervisorHeaderActions = document.createElement('div');
    classSupervisorHeaderActions.className = 'sidebar-section-actions';
    classSupervisorHeaderActions.appendChild(shareDataBtn);
    classSupervisorHeader.appendChild(classSupervisorHeaderLabel);
    classSupervisorHeader.appendChild(classSupervisorHeaderActions);
    const classSupervisorInner = document.createElement('div');
    classSupervisorInner.className = 'sidebar-pane-class-supervisor-inner';
    paneClassSupervisor.appendChild(classSupervisorHeader);
    paneClassSupervisor.appendChild(classSupervisorInner);

    const paneTeacherAssistant = document.createElement('div');
    paneTeacherAssistant.className = 'sidebar-pane sidebar-pane-teacher-assistant';
    paneTeacherAssistant.hidden = true;
    const teacherAssistantHeader = document.createElement('div');
    teacherAssistantHeader.className = 'sidebar-section-header';
    const teacherAssistantHeaderLabel = document.createElement('span');
    teacherAssistantHeaderLabel.className = 'sidebar-section-header-label';
    teacherAssistantHeaderLabel.textContent = 'Teacher Assistant';
    teacherAssistantHeader.appendChild(teacherAssistantHeaderLabel);
    const teacherAssistantInner = document.createElement('div');
    teacherAssistantInner.className = 'sidebar-pane-teacher-assistant-inner';
    paneTeacherAssistant.appendChild(teacherAssistantHeader);
    paneTeacherAssistant.appendChild(teacherAssistantInner);

    teacherList.appendChild(paneCoordinator);
    teacherList.appendChild(paneClassSupervisor);
    teacherList.appendChild(paneTeachers);
    teacherList.appendChild(paneTeacherAssistant);
    teacherList.appendChild(paneStudents);
    teacherList.appendChild(paneClassReport);
    teacherList.appendChild(paneMaterials);
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

        const materialsEmpty = document.createElement('p');
        materialsEmpty.className = 'class-report-empty';
        materialsEmpty.textContent = 'No materials to show.';
        materialsInner.appendChild(materialsEmpty);

        return;
    }

    renderSupervisionRoleSidebarPanes({
        paneCoordinator,
        coordinatorInner,
        paneClassSupervisor,
        classSupervisorInner,
        paneTeacherAssistant,
        teacherAssistantInner,
        teachersInner,
    });

    const studentGroups = new Map();
    const rosterScopeStudents = getStudentNamesVisibleInNavigation();
    rosterScopeStudents.forEach((name) => {
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
        const scopedTeacher =
            isTeacherLoggedIn &&
            !isAdminLoggedIn &&
            !loggedInStudentFullName &&
            String(loggedInTeacherName || '').trim();
        if (
            scopedTeacher &&
            !rosterScopeStudents.some(
                (n) => (getStudentSchoolName(n) || 'HomeTeachers').trim().toLowerCase() === key
            )
        ) {
            return;
        }
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
        .filter((g) => !loggedInStudentFullName || g.names.length > 0)
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

    if (studentCategories.length === 0) {
        const schoolsPlaceholder = document.createElement('p');
        schoolsPlaceholder.className = 'class-report-empty';
        schoolsPlaceholder.textContent = 'No schools yet.';
        studentsInner.appendChild(schoolsPlaceholder);
    }

    const supLists = getActiveSupervisionSuperiorListsForTeacher();
    const supervisionCategories = [];
    if (supLists.coordinators.length > 0) {
        supervisionCategories.push({
            title: 'Coordinator',
            names: supLists.coordinators,
            itemClass: 'category-supervision-coord',
            deletable: false,
            parent: teachersInner,
            collapsible: true,
            initialExpanded: true,
            noCalendarSelect: true
        });
    }
    if (supLists.classSupervisors.length > 0) {
        supervisionCategories.push({
            title: 'Class Supervisor',
            names: supLists.classSupervisors,
            itemClass: 'category-supervision-cs',
            deletable: false,
            parent: teachersInner,
            collapsible: true,
            initialExpanded: true,
            noCalendarSelect: true
        });
    }

    let visibleTeachers = loggedInStudentFullName
        ? []
        : (isTeacherLoggedIn && loggedInTeacherName
            ? isGateStaffAccountSession()
                ? getGateSessionAppRole() === 'class-supervisor'
                    ? getClassSupervisorActiveSuperviseeTeacherNames()
                    : teachersList
                : teachersList.filter(
                      (name) =>
                          String(name || '').trim().toLowerCase() ===
                          String(loggedInTeacherName || '').trim().toLowerCase()
                  )
            : teachersList);
    if (isAdminLoggedIn && !loggedInStudentFullName) {
        const nmSet = new Set(visibleTeachers.map((n) => String(n || '').trim()).filter(Boolean));
        gateStaffAccounts.forEach((e) => {
            const g = String(e?.profileName || '').trim();
            if (g) nmSet.add(g);
        });
        visibleTeachers = [...nmSet].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    }
    const categories = [
        ...(loggedInStudentFullName ? [] : supervisionCategories),
        ...(loggedInStudentFullName
            ? []
            : [
                  {
                      title: 'Teachers',
                      names: visibleTeachers,
                      itemClass: 'category-teachers',
                      deletable: false,
                      parent: teachersInner,
                      collapsible: false
                  }
              ]),
        ...studentCategories
    ];

    categories.forEach((category) => {
        const isCollapsible = category.collapsible !== false;
        const defaultCollapsed =
            category.initialExpanded === true ? false : category.title === 'Teachers' ? false : true;
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
            if (!loggedInStudentFullName) {
                actions.appendChild(settingsBtn);
            }
            titleRow.appendChild(label);
            titleRow.appendChild(actions);
            section.appendChild(titleRow);
        } else if (isCollapsible) {
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'sidebar-section-title';
            if (category.deletable && !loggedInStudentFullName) {
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
            } else if (loggedInStudentFullName && category.schoolTheme) {
                const label = document.createElement('button');
                label.type = 'button';
                label.className = 'sidebar-section-title-text-trigger';
                label.textContent = category.title;
                label.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
                sectionTitle.appendChild(label);
            } else {
                sectionTitle.textContent = category.title;
            }
            section.appendChild(sectionTitle);
        } else {
            section.classList.add('sidebar-category-no-title');
        }

        const sectionItems = document.createElement('div');
        sectionItems.className = 'sidebar-category-items';
        const isSchoolSection = category.parent === studentsInner;
        sectionItems.classList.toggle('empty', !isSchoolSection && category.names.length === 0);

        category.names.forEach((name) => {
            if (!category.noCalendarSelect) {
                if (!teacherSchedules[name]) {
                    teacherSchedules[name] = {};
                }
            }

            const teacherItem = document.createElement('div');
            teacherItem.className = 'teacher-item';
            teacherItem.classList.add(category.itemClass);
            if (category.noCalendarSelect) {
                teacherItem.classList.add('teacher-item--supervision-readonly');
            }
            if (isSchoolSection) {
                teacherItem.classList.add('sidebar-student-row');
                teacherItem.dataset.studentId = buildGoogleMeetStudentId(name);
            }
            if (category.schoolTheme) {
                teacherItem.classList.add('teacher-item--school-theme');
                applySchoolThemeCssVars(teacherItem, category.title);
            }
            teacherItem.dataset.teacher = name;

            const nameEl = document.createElement('span');
            nameEl.className = 'teacher-item-name';
            nameEl.textContent = name;
            teacherItem.appendChild(nameEl);

            const allowEditRow = category.deletable && !loggedInStudentFullName;
            if (allowEditRow) {
                const followUpHref = getStudentExternalFollowUpLinkHref(name);

                const actionsWrap = document.createElement('span');
                actionsWrap.className = 'teacher-item-student-actions';

                if (followUpHref) {
                    const externalFollowUpBtn = document.createElement('button');
                    externalFollowUpBtn.type = 'button';
                    externalFollowUpBtn.className = 'student-external-link-btn sidebar-section-title-passport-btn';
                    externalFollowUpBtn.setAttribute('aria-label', 'Open external follow-up link');
                    externalFollowUpBtn.setAttribute('title', 'Open external follow-up link');
                    externalFollowUpBtn.setAttribute('data-student-name', name);
                    externalFollowUpBtn.innerHTML = STUDENT_EXTERNAL_FOLLOWUP_LINK_BTN_SVG;
                    actionsWrap.appendChild(externalFollowUpBtn);
                }

                const editBtn = document.createElement('button');
                editBtn.type = 'button';
                editBtn.className = 'teacher-item-edit';
                editBtn.setAttribute('aria-label', `Edit ${name}`);
                editBtn.setAttribute('title', `Edit ${name}`);
                editBtn.setAttribute('data-student-name', name);
                editBtn.setAttribute('data-roster-kind', category.rosterKey);
                editBtn.innerHTML = EDIT_ICON_SVG_SOLID;
                actionsWrap.appendChild(editBtn);

                teacherItem.appendChild(actionsWrap);
            }

            teacherItem.addEventListener('click', (e) => {
                if (category.noCalendarSelect) return;
                if (e.target.closest('.teacher-item-edit')) {
                    return;
                }
                if (e.target.closest('.student-external-link-btn')) {
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
            const sectionTitleEl = section.querySelector('.sidebar-section-title');
            const studentTextToggle = section.querySelector('.sidebar-section-title-text-trigger');
            const toggleCollapsed = () => {
                const willCollapse = !section.classList.contains('collapsed');
                setSidebarSectionCollapsed(section, willCollapse, true);
                if (studentTextToggle) {
                    studentTextToggle.setAttribute('aria-expanded', willCollapse ? 'false' : 'true');
                }
            };
            if (studentTextToggle) {
                studentTextToggle.addEventListener('click', toggleCollapsed);
            } else if (sectionTitleEl) {
                sectionTitleEl.addEventListener('click', toggleCollapsed);
            }
        }
    });

    const materialsPlaceholder = document.createElement('p');
    materialsPlaceholder.className = 'materials-placeholder';
    materialsPlaceholder.textContent = 'No materials linked yet.';
    materialsInner.appendChild(materialsPlaceholder);

    populateClassReportStudentLists(classReportInner);
    refreshAdminPanelIfShowingOverview();
    maybeAutoShowSupervisionPendingNotice();
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
        group.dataset.classReportSchoolKey = groupKey;
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
                li.dataset.studentId = buildGoogleMeetStudentId(name);
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
    const rosterScopeStudents = getStudentNamesVisibleInNavigation();
    rosterScopeStudents.forEach((name) => {
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
        const scopedTeacher =
            isTeacherLoggedIn &&
            !isAdminLoggedIn &&
            !loggedInStudentFullName &&
            String(loggedInTeacherName || '').trim();
        if (
            scopedTeacher &&
            !rosterScopeStudents.some(
                (n) => (getStudentSchoolName(n) || 'HomeTeachers').trim().toLowerCase() === key
            )
        ) {
            return;
        }
        if (!grouped.has(key)) {
            grouped.set(key, { title: school, names: [], kind: rosterKindFromSchoolName(school) });
        }
    });
    const classReportGroups = [...grouped.values()]
        .filter((g) => !loggedInStudentFullName || g.names.length > 0)
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    if (classReportGroups.length === 0) {
        const classReportPlaceholder = document.createElement('p');
        classReportPlaceholder.className = 'class-report-empty';
        classReportPlaceholder.textContent = 'No class report items yet.';
        wrap.appendChild(classReportPlaceholder);
    } else {
        classReportGroups.forEach((group) => {
            wrap.appendChild(makeGroup(group.title, group.names, group.kind, group.title.trim().toLowerCase()));
        });
    }
    container.appendChild(wrap);
}

function getAdminAccountRows() {
    const rows = [
        {
            role: 'Admin',
            name: String(adminAccount.username || DEFAULT_ADMIN_USERNAME).trim(),
            accountKey: '__admin__',
            email: String(adminAccount.username || DEFAULT_ADMIN_USERNAME).trim(),
            passwordLabel: 'Configured',
            info: 'Full platform access'
        }
    ];
    teachersList.forEach((name) => {
        rows.push({
            role: 'Teacher',
            name,
            accountKey: `teacher::${name}`,
            email: String(teacherEmailsByName[name] || '').trim(),
            passwordLabel: String(teacherPasswordsByName[name] || '').trim() ? 'Configured' : 'Not set',
            info: 'Teacher profile'
        });
    });
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const school = getStudentSchoolName(name) || 'Unassigned school';
        const rosterKind = rosterKindFromSchoolName(school);
        rows.push({
            role: 'Student',
            name,
            accountKey: `student::${name}`,
            email: String(studentEmailsByName[name] || '').trim(),
            passwordLabel: String(studentPasswordsByName[name] || '').trim() ? 'Configured' : 'Not set',
            info: school,
            rosterKind
        });
    });
    return rows;
}

/** Unique schools (from student assignments + custom schools) for admin overview. */
function getAdminSchoolSummaries() {
    const map = new Map();
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((rawName) => {
        const name = String(rawName || '').trim();
        if (!name) return;
        const school = String(getStudentSchoolName(name) || 'Unassigned').trim() || 'Unassigned';
        const k = school.toLowerCase();
        if (!map.has(k)) {
            map.set(k, { title: school, students: [] });
        }
        map.get(k).students.push(name);
    });
    customSchoolsList.forEach((raw) => {
        const school = String(raw || '').trim();
        if (!school) return;
        const k = school.toLowerCase();
        if (!map.has(k)) {
            map.set(k, { title: school, students: [] });
        }
    });
    return [...map.values()].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    );
}

function renderAdminBlankPanel() {
    const panel = document.getElementById('adminControlPanel');
    if (!panel || !hasEffectiveAdminSession()) return;
    panel.innerHTML = '<div class="admin-panel-blank" aria-hidden="true"></div>';
}

function refreshAdminPanelIfShowingOverview() {
    if (!hasEffectiveAdminSession()) return;
    const panel = document.getElementById('adminControlPanel');
    if (!panel || panel.hidden) return;
    if (panel.querySelector('.admin-dashboard')) {
        renderAdminOverviewPanel();
    }
}

function renderAdminOverviewPanel() {
    const panel = document.getElementById('adminControlPanel');
    if (!panel) return;
    if (!hasEffectiveAdminSession()) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
    }

    const teacherRows =
        teachersList.length === 0
            ? '<p class="admin-dashboard-empty">No teacher profiles yet.</p>'
            : teachersList
                  .map((raw) => {
                      const name = String(raw || '').trim();
                      if (!name) return '';
                      const loginUser = String(teacherEmailsByName[name] || '').trim();
                      const rawPw = String(teacherPasswordsByName[name] || '').trim();
                      const pwLabel = rawPw ? escapeHtmlAttr(rawPw) : '<em>Not set</em>';
                      return `<div class="admin-dashboard-item">
                        <span class="admin-dashboard-item-title">${escapeHtmlAttr(name)}</span>
                        <span class="admin-dashboard-item-meta">Username: ${loginUser ? escapeHtmlAttr(loginUser) : '<em>Not set</em>'}</span>
                        <span class="admin-dashboard-item-meta">Password: ${pwLabel}</span>
                        <button type="button" class="admin-dashboard-item-remove" data-admin-delete="1" data-admin-role="Teacher" data-admin-name="${escapeHtmlAttr(name)}" aria-label="Remove teacher account">
                            <div class="admin-dashboard-button-remove">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                      </div>`;
                  })
                  .join('');

    const gateRows =
        gateStaffAccounts.length === 0
            ? '<p class="admin-dashboard-empty">No coordinator or class supervisor profiles yet.</p>'
            : gateStaffAccounts
                  .map((e) => {
                      const name = String(e?.profileName || '').trim();
                      if (!name) return '';
                      const appRole = String(e?.appRole || '').trim();
                      const loginUser = String(e?.username || '').trim();
                      let dashRole = '';
                      let roleLabel = appRole;
                      if (appRole === 'coordinator') {
                          dashRole = 'GateCoordinator';
                          roleLabel = 'Coordinator';
                      } else if (appRole === 'class-supervisor') {
                          dashRole = 'GateClassSupervisor';
                          roleLabel = 'Class Supervisor';
                      } else {
                          return '';
                      }
                      const rawPw = String(e?.password || '').trim();
                      const pwLabel = rawPw ? escapeHtmlAttr(rawPw) : '<em>Not set</em>';
                      return `<div class="admin-dashboard-item">
                        <span class="admin-dashboard-item-title">${escapeHtmlAttr(name)}</span>
                        <span class="admin-dashboard-item-meta">${escapeHtmlAttr(roleLabel)}</span>
                        <span class="admin-dashboard-item-meta">Username: ${loginUser ? escapeHtmlAttr(loginUser) : '<em>Not set</em>'}</span>
                        <span class="admin-dashboard-item-meta">Password: ${pwLabel}</span>
                        <button type="button" class="admin-dashboard-item-remove" data-admin-delete="1" data-admin-role="${escapeHtmlAttr(dashRole)}" data-admin-name="${escapeHtmlAttr(name)}" aria-label="Remove gate staff account">
                            <div class="admin-dashboard-button-remove">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                      </div>`;
                  })
                  .filter(Boolean)
                  .join('');

    const schoolSummaries = getAdminSchoolSummaries();
    const schoolRows =
        schoolSummaries.length === 0
            ? '<p class="admin-dashboard-empty">No schools yet.</p>'
            : schoolSummaries
                  .map(({ title, students }) => {
                      const kind = rosterKindFromSchoolName(title) || 'private';
                      const list =
                          students.length === 0
                              ? '<em>No students linked</em>'
                              : students.map((n) => escapeHtmlAttr(n)).join(', ');
                      return `<div class="admin-dashboard-item">
                        <span class="admin-dashboard-item-title">${escapeHtmlAttr(title)}</span>
                        <span class="admin-dashboard-item-meta">Roster: ${escapeHtmlAttr(kind)}</span>
                        <span class="admin-dashboard-item-meta">Students (${students.length}): ${list}</span>
                        <button type="button" class="admin-dashboard-item-remove" data-admin-delete="1" data-admin-role="School" data-admin-name="${escapeHtmlAttr(title)}" aria-label="Remove school profile">
                            <div class="admin-dashboard-button-remove">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                      </div>`;
                  })
                  .join('');

    const allStudents = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList];
    const studentRows =
        allStudents.length === 0
            ? '<p class="admin-dashboard-empty">No students yet.</p>'
            : allStudents
                  .map((raw) => {
                      const name = String(raw || '').trim();
                      if (!name) return '';
                      const school = String(getStudentSchoolName(name) || '').trim() || '—';
                      const email = String(studentEmailsByName[name] || '').trim();
                      const loginUsername = String(studentUsernamesByName[name] || '').trim();
                      const tutor = String(studentTeacherByName[name] || '').trim();
                      const rk = getStudentRosterKind(name) || 'private';
                      const rawStudentPw = String(studentPasswordsByName[name] || '').trim();
                      const studentPwHtml = rawStudentPw ? escapeHtmlAttr(rawStudentPw) : '<em>Not set</em>';
                      return `<div class="admin-dashboard-item">
                        <span class="admin-dashboard-item-title">${escapeHtmlAttr(name)}</span>
                        <span class="admin-dashboard-item-meta">School: ${escapeHtmlAttr(school)}</span>
                        <span class="admin-dashboard-item-meta">Profile / roster: ${escapeHtmlAttr(rk)}</span>
                        <span class="admin-dashboard-item-meta">Username: ${loginUsername ? escapeHtmlAttr(loginUsername) : '<em>Not set</em>'}</span>
                        <span class="admin-dashboard-item-meta">Contact email: ${email ? escapeHtmlAttr(email) : '<em>Not set</em>'}</span>
                        <span class="admin-dashboard-item-meta">Password: ${studentPwHtml}</span>
                        <span class="admin-dashboard-item-meta">Assigned teacher: ${tutor ? escapeHtmlAttr(tutor) : '<em>None</em>'}</span>
                        <button type="button" class="admin-dashboard-item-remove" data-admin-delete="1" data-admin-role="Student" data-admin-name="${escapeHtmlAttr(name)}" aria-label="Remove student account">
                            <div class="admin-dashboard-button-remove">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                      </div>`;
                  })
                  .join('');

    panel.innerHTML = `
        <div class="admin-dashboard">
            <h2 class="admin-panel-title">Dashboard</h2>
            <p class="admin-panel-subtitle">Overview of teachers, schools, and students in your roster.</p>
            <div class="admin-dashboard-grid">
                <section class="admin-dashboard-category" aria-labelledby="admin-dash-teachers">
                    <h3 id="admin-dash-teachers" class="admin-dashboard-category-title">Teachers</h3>
                    <div class="admin-dashboard-category-body">${teacherRows}</div>
                </section>
                <section class="admin-dashboard-category" aria-labelledby="admin-dash-gate">
                    <h3 id="admin-dash-gate" class="admin-dashboard-category-title">Coordinators &amp; class supervisors</h3>
                    <div class="admin-dashboard-category-body">${gateRows}</div>
                </section>
                <section class="admin-dashboard-category" aria-labelledby="admin-dash-schools">
                    <h3 id="admin-dash-schools" class="admin-dashboard-category-title">Schools</h3>
                    <div class="admin-dashboard-category-body">${schoolRows}</div>
                </section>
                <section class="admin-dashboard-category" aria-labelledby="admin-dash-students">
                    <h3 id="admin-dash-students" class="admin-dashboard-category-title">Students</h3>
                    <div class="admin-dashboard-category-body">${studentRows}</div>
                </section>
            </div>
        </div>
    `;
}

async function saveAccountCredentialsFromAdmin(role, name, emailRaw, passwordRaw) {
    if (!hasEffectiveAdminSession()) {
        denyStudentAction('Permission denied: only admins can manage account credentials.');
        return false;
    }
    const email = String(emailRaw || '').trim();
    const password = String(passwordRaw || '').trim();
    if (role === 'Admin') {
        if (!email) {
            showAppMessage('Admin username is required.');
            return false;
        }
        if (password.length < 5) {
            showAppMessage('Admin password must have at least 5 characters.');
            return false;
        }
        const passwordHash = await hashStudentPassword(password);
        adminAccount = { username: email, passwordHash };
        saveAdminAccountToStorage(adminAccount);
        if (isAdminLoggedIn) {
            saveLoginCredentials(email, password);
        }
        saveRoster();
        showAppMessage('Admin credentials updated.');
        return true;
    }
    if (!name) return false;
    if (role !== 'Student' && !email) {
        showAppMessage('Teacher username is required.');
        return false;
    }
    if (password.length < 8) {
        showAppMessage('Password must have at least 8 characters.');
        return false;
    }
    if (!isPlatePasswordPatternValid(password)) {
        showAppMessage('Password must match @xxxnxnn (letters and numbers, case-insensitive).');
        return false;
    }
    if (email) {
        const emailLc = email.toLowerCase();
        const allStudentNames = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList];
        const emailConflictTeacher = teachersList.some((n) => {
            if (role === 'Teacher' && n === name) return false;
            return String(teacherEmailsByName[n] || '').trim().toLowerCase() === emailLc;
        });
        const emailConflictStudent = allStudentNames.some((n) => {
            if (role === 'Student' && n === name) return false;
            return String(studentEmailsByName[n] || '').trim().toLowerCase() === emailLc;
        });
        const usernameConflictStudent = allStudentNames.some((n) => {
            if (role === 'Student' && n === name) return false;
            return String(studentUsernamesByName[n] || '').trim().toLowerCase() === emailLc;
        });
        if (emailConflictTeacher || emailConflictStudent || usernameConflictStudent || emailLc === String(adminAccount.username || '').trim().toLowerCase()) {
            showAppMessage(role === 'Teacher' ? 'This username is already in use.' : 'This email or username is already in use.');
            return false;
        }
    }
    if (role === 'Teacher') {
        teacherEmailsByName[name] = email;
        teacherPasswordsByName[name] = password;
    } else if (role === 'Student') {
        if (email) studentEmailsByName[name] = email;
        else delete studentEmailsByName[name];
        studentPasswordsByName[name] = password;
    }
    saveRoster();
    showAppMessage(`${role} credentials updated.`);
    return true;
}

/**
 * Remove a gate staff login (coordinator or class supervisor).
 * Coordinator: only the gate account row (roster teachers, students, schedules, supervision links unchanged).
 * Class supervisor: account row, class-supervisor supervision links where they are the superior, and their
 * schedule blob when they are not also a roster teacher ("gate-only" schedule).
 */
function removeGateStaffAccountByProfile(profileNameRaw, expectedAppRole) {
    if (!hasEffectiveAdminSession()) {
        denyStudentAction('Permission denied: only admins can remove gate staff.');
        return;
    }
    const profileName = String(profileNameRaw || '').trim();
    if (!profileName) return;
    const plower = profileName.toLowerCase();
    const idx = gateStaffAccounts.findIndex(
        (e) => String(e?.profileName || '').trim().toLowerCase() === plower
    );
    if (idx === -1) {
        showAppMessage('Gate staff profile not found.');
        return;
    }
    const ent = gateStaffAccounts[idx];
    const appRole = String(ent?.appRole || '').trim();
    if (appRole !== expectedAppRole) {
        showAppMessage('That profile is not listed with this gate role.');
        return;
    }

    if (expectedAppRole === 'class-supervisor') {
        supervisionLinks = supervisionLinks.filter((l) => {
            if (String(l?.superiorProfile || '').trim().toLowerCase() !== plower) return true;
            return String(l?.superiorAppRole || '').trim() !== 'class-supervisor';
        });
    }

    gateStaffAccounts.splice(idx, 1);

    if (expectedAppRole === 'class-supervisor') {
        const onRosterTeacher = teachersList.some(
            (t) => String(t || '').trim().toLowerCase() === plower
        );
        if (!onRosterTeacher) {
            delete teacherSchedules[profileName];
        }
    }

    if (currentTeacher && String(currentTeacher || '').trim().toLowerCase() === plower) {
        currentTeacher = null;
        slotStates = {};
    }

    saveRoster();
    if (expectedAppRole === 'class-supervisor') {
        markSchedulePendingCloudUpload();
        syncSpeakOnWeeklyToAllTeacherSchedules();
        saveAllSchedulesLocal();
        saveAllSchedules();
    }
    renderSidebar();
    refreshAdminPanelIfShowingOverview();

    if (loggedInTeacherName && String(loggedInTeacherName || '').trim().toLowerCase() === plower) {
        performTeacherSessionLogout();
        return;
    }

    showAppMessage(
        expectedAppRole === 'coordinator'
            ? 'Coordinator profile removed. Supervision links and other roster data are unchanged.'
            : 'Class Supervisor removed; their class-supervisor supervision links and gate-only schedule data were cleared where applicable.'
    );
}

function removeAccountFromAdmin(role, name) {
    if (!hasEffectiveAdminSession()) {
        denyStudentAction('Permission denied: only admins can remove account records.');
        return;
    }
    if (role === 'Admin') {
        showAppMessage('The admin account cannot be deleted.');
        return;
    }
    if (role === 'School') {
        deleteSchoolFromSidebarConfirmed(name);
        showAppMessage('School removed. Students in that school were deleted; teachers were kept.');
        return;
    }
    if (role === 'GateCoordinator') {
        removeGateStaffAccountByProfile(name, 'coordinator');
        return;
    }
    if (role === 'GateClassSupervisor') {
        removeGateStaffAccountByProfile(name, 'class-supervisor');
        return;
    }
    if (role === 'Teacher') {
        const idx = teachersList.findIndex((t) => String(t || '').trim().toLowerCase() === String(name || '').trim().toLowerCase());
        if (idx === -1) return;
        const teacherName = teachersList[idx];
        const teacherLc = teacherName.trim().toLowerCase();

        const studentsOfTeacher = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].filter(
            (n) => String(studentTeacherByName[n] || '').trim().toLowerCase() === teacherLc
        );
        const removedNameSet = new Set(studentsOfTeacher.map((n) => n.trim().toLowerCase()));

        privateStudentsList = privateStudentsList.filter((n) => !removedNameSet.has(n.trim().toLowerCase()));
        speakonStudentsList = speakonStudentsList.filter((n) => !removedNameSet.has(n.trim().toLowerCase()));
        passportStudentsList = passportStudentsList.filter((n) => !removedNameSet.has(n.trim().toLowerCase()));

        studentsOfTeacher.forEach((nm) => {
            delete teacherSchedules[nm];
            delete speakonStudentWeeklyClass[nm];
            delete studentClassReportRows[nm];
            delete studentClassReportUploadsByName[nm];
            delete passportFollowupLinks[nm];
            delete studentExternalFollowUpLinksByName[nm];
            delete studentSchoolByName[nm];
            delete studentPhonesByName[nm];
            delete studentTeacherByName[nm];
            delete studentGoogleMeetLinksByName[nm];
            delete studentEmailsByName[nm];
            delete studentUsernamesByName[nm];
            delete studentPasswordsByName[nm];
            delete studentCityByName[nm];
            delete studentCountryByName[nm];
        });

        teachersList.splice(idx, 1);
        delete teacherEmailsByName[teacherName];
        delete teacherPasswordsByName[teacherName];
        delete teacherSchedules[teacherName];

        stripUnusedCustomSchoolProfiles();

        if (loggedInTeacherName && loggedInTeacherName.trim().toLowerCase() === teacherLc) {
            loggedInTeacherName = '';
        }
        const clearCalendarIfNamed = (n) => n && removedNameSet.has(String(n).trim().toLowerCase());
        if (clearCalendarIfNamed(currentTeacher)) {
            currentTeacher = null;
            slotStates = {};
        }

        saveRoster();
        saveStudentClassReportRows();
        void flushClassReportReplaceManifestFromMemory();
        syncSpeakOnWeeklyToAllTeacherSchedules();
        saveAllSchedulesLocal();
        saveAllSchedules();
        renderSidebar();
        if (currentTeacher) {
            resyncSelectionAfterSidebarRender();
        } else if (teachersList[0]) {
            selectTeacher(teachersList[0]);
        }
        showAppMessage('Teacher removed along with their students and unused school profiles.');
        return;
    } else if (role === 'Student') {
        const school = getStudentSchoolName(name);
        const kind = rosterKindFromSchoolName(school);
        removeStudentFromRoster(name, kind);
        showAppMessage('Student account removed.');
        return;
    }
    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();
    showAppMessage(`${role} account removed.`);
}

function setAdminDashboard() {
    if (!hasEffectiveAdminSession()) {
        setLoggedOutDashboard();
        return;
    }
    hideMaterialsMainView();
    const calendarWrapper = document.getElementById('calendarWrapper');
    const reportPanel = document.getElementById('studentClassReportPanel');
    const adminPanel = document.getElementById('adminControlPanel');
    if (calendarWrapper) calendarWrapper.hidden = true;
    if (reportPanel) reportPanel.hidden = true;
    if (adminPanel) {
        adminPanel.hidden = false;
        renderAdminOverviewPanel();
    }
}

function showAdminBlankMainPanel() {
    if (!hasEffectiveAdminSession()) {
        setLoggedOutDashboard();
        return;
    }
    hideMaterialsMainView();
    const calendarWrapper = document.getElementById('calendarWrapper');
    const reportPanel = document.getElementById('studentClassReportPanel');
    const adminPanel = document.getElementById('adminControlPanel');
    if (calendarWrapper) calendarWrapper.hidden = true;
    if (reportPanel) reportPanel.hidden = true;
    if (adminPanel) {
        adminPanel.hidden = false;
        renderAdminBlankPanel();
    }
}

function setLoggedOutDashboard() {
    hideMaterialsMainView();
    const calendarWrapper = document.getElementById('calendarWrapper');
    const reportPanel = document.getElementById('studentClassReportPanel');
    const adminPanel = document.getElementById('adminControlPanel');
    if (calendarWrapper) calendarWrapper.hidden = true;
    if (reportPanel) reportPanel.hidden = true;
    if (adminPanel) {
        adminPanel.hidden = true;
        adminPanel.innerHTML = '';
    }
    resetClassStartNotificationCache();
}

const MATERIALS_MAIN_IFRAME_SRC = 'materials/materials.html';

function hideMaterialsMainView() {
    const host = document.getElementById('materialsFrameHost');
    if (!host) return;
    host.classList.remove('materials-frame-host--open');
    host.setAttribute('aria-hidden', 'true');
}

function showMaterialsMainView() {
    const host = document.getElementById('materialsFrameHost');
    const iframe = document.getElementById('materialsFrame');
    if (!host || !iframe) return;

    const calendarWrapper = document.getElementById('calendarWrapper');
    const reportPanel = document.getElementById('studentClassReportPanel');
    const adminPanel = document.getElementById('adminControlPanel');
    if (calendarWrapper) calendarWrapper.hidden = true;
    if (reportPanel) reportPanel.hidden = true;
    if (adminPanel) adminPanel.hidden = true;

    host.classList.add('materials-frame-host--open');
    host.setAttribute('aria-hidden', 'false');

    if (!iframe.dataset.materialsSrcSet) {
        iframe.src = MATERIALS_MAIN_IFRAME_SRC;
        iframe.dataset.materialsSrcSet = '1';
    }
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
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot change school settings.');
        return;
    }
    const schoolTitle = String(displayTitle || '').trim();
    const schoolKey = schoolTitle.toLowerCase();
    if (!schoolTitle || !schoolKey) return;

    openSchoolSettingsModal(schoolTitle);
}

/** Drops custom school entries (and their per-school settings) when no student references that school. */
function stripUnusedCustomSchoolProfiles() {
    const used = new Set();
    [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].forEach((name) => {
        const k = (getStudentSchoolName(name) || '').trim().toLowerCase();
        if (k) used.add(k);
    });
    customSchoolsList = customSchoolsList.filter((school) => {
        const sk = String(school || '').trim().toLowerCase();
        if (!sk) return false;
        if (used.has(sk)) return true;
        delete schoolExternalLinks[sk];
        delete schoolThemeColors[sk];
        delete schoolBillingModels[sk];
        delete schoolBillingConfigs[sk];
        delete googleMeetSharedLinkModeBySchoolKey[sk];
        delete classReportCollapsedBySchool[sk];
        return false;
    });
}

function deleteSchoolFromSidebarConfirmed(displayTitle) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot delete schools.');
        return;
    }
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
        delete studentTeacherByName[name];
        delete studentGoogleMeetLinksByName[name];
        delete studentEmailsByName[name];
        delete studentUsernamesByName[name];
        delete studentPasswordsByName[name];
        delete studentCityByName[name];
        delete studentCountryByName[name];
        delete studentExternalFollowUpLinksByName[name];
    });

    customSchoolsList = customSchoolsList.filter((school) => String(school || '').trim().toLowerCase() !== schoolKey);
    delete schoolExternalLinks[schoolKey];
    delete schoolThemeColors[schoolKey];
    delete schoolBillingModels[schoolKey];
    delete schoolBillingConfigs[schoolKey];
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

    if (loggedInStudentFullName) {
        resyncSelectionAfterSidebarRender();
    } else {
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
}

function openDeleteSchoolModal(schoolTitle, studentCount = 0) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot delete schools.');
        return;
    }
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
}

let adminDashboardDeletePending = null;

function buildAdminDashboardDeleteMessage(role, name) {
    let confirmMsg = `Delete this ${String(role || '').toLowerCase()} account?\n\n${name}`;
    if (role === 'Teacher') {
        confirmMsg =
            `Delete teacher "${name}"?\n\nEvery student assigned to this teacher will be removed. Custom school profiles with no remaining students will be removed. Other teachers are kept.`;
    } else if (role === 'School') {
        confirmMsg = `Delete school "${name}"?\n\nAll students in this school will be removed. Teacher profiles are kept.`;
    } else if (role === 'Student') {
        confirmMsg = `Delete this student account?\n\n${name}\n\nSchools and teachers are kept.`;
    } else if (role === 'GateCoordinator') {
        confirmMsg = `Delete coordinator "${name}"?\n\nThis removes only their gate login profile. Teachers, students, schedules, and supervision links stay as they are.`;
    } else if (role === 'GateClassSupervisor') {
        confirmMsg = `Delete class supervisor "${name}"?\n\nThis removes their gate profile, class-supervisor supervision links, and their schedule row if they are not also a roster teacher. Teacher-managed data otherwise stays intact.`;
    }
    return confirmMsg;
}

function adminDashboardDeleteTitleForRole(role) {
    if (role === 'Teacher') return 'Delete teacher?';
    if (role === 'School') return 'Delete school?';
    if (role === 'Student') return 'Delete student?';
    if (role === 'GateCoordinator') return 'Delete coordinator?';
    if (role === 'GateClassSupervisor') return 'Delete class supervisor?';
    return 'Delete?';
}

function closeAdminDashboardDeleteModal() {
    const modal = document.getElementById('adminDashboardDeleteModal');
    adminDashboardDeletePending = null;
    closeModalWithAnimation(modal);
}

function setupAdminDashboardDeleteModal() {
    const modal = document.getElementById('adminDashboardDeleteModal');
    const cancelBtn = document.getElementById('adminDashboardDeleteModalCancel');
    const confirmBtn = document.getElementById('adminDashboardDeleteModalConfirm');
    const backdrop = document.getElementById('adminDashboardDeleteModalBackdrop');
    if (!modal || !confirmBtn || modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';
    cancelBtn?.addEventListener('click', () => closeAdminDashboardDeleteModal());
    backdrop?.addEventListener('click', () => closeAdminDashboardDeleteModal());
    confirmBtn.addEventListener('click', () => {
        const p = adminDashboardDeletePending;
        adminDashboardDeletePending = null;
        closeModalWithAnimation(modal);
        if (p && p.role && p.name) {
            removeAccountFromAdmin(p.role, p.name);
            renderAdminOverviewPanel();
        }
    });
}

function openAdminDashboardDeleteConfirm(role, name) {
    const modal = document.getElementById('adminDashboardDeleteModal');
    const titleEl = document.getElementById('adminDashboardDeleteModalTitle');
    const bodyEl = document.getElementById('adminDashboardDeleteModalBody');
    if (!modal || !titleEl || !bodyEl) {
        if (window.confirm(buildAdminDashboardDeleteMessage(role, name))) {
            removeAccountFromAdmin(role, name);
            renderAdminOverviewPanel();
        }
        return;
    }
    titleEl.textContent = adminDashboardDeleteTitleForRole(role);
    bodyEl.textContent = buildAdminDashboardDeleteMessage(role, name);
    bodyEl.style.whiteSpace = 'pre-line';
    adminDashboardDeletePending = { role, name };
    openModalWithAnimation(modal);
}

function openSchoolSettingsModal(schoolTitle) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot change school settings.');
        return;
    }
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
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot change school settings.');
        return;
    }
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
        if (Object.prototype.hasOwnProperty.call(schoolBillingModels, schoolKey)) {
            schoolBillingModels[nextSchoolKey] = String(schoolBillingModels[schoolKey] || '').trim();
            delete schoolBillingModels[schoolKey];
        }
        if (Object.prototype.hasOwnProperty.call(schoolBillingConfigs, schoolKey)) {
            schoolBillingConfigs[nextSchoolKey] = { ...(schoolBillingConfigs[schoolKey] || {}) };
            delete schoolBillingConfigs[schoolKey];
        }
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
    if (currentTeacher || loggedInStudentFullName) {
        resyncSelectionAfterSidebarRender();
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

window.showAppMessage = showAppMessage;

function setupAppMessageModal() {
    const modal = document.getElementById('appMessageModal');
    const okBtn = document.getElementById('appMessageModalOk');
    const backdrop = document.getElementById('appMessageModalBackdrop');
    if (!modal || !okBtn) return;
    okBtn.addEventListener('click', () => closeAppMessageModal());
    backdrop?.addEventListener('click', () => closeAppMessageModal());
}

function openStudentRepositionModal(day, hour) {
    const modal = document.getElementById('studentRepositionModal');
    const dayInput = document.getElementById('studentRepositionModalDay');
    const timeInput = document.getElementById('studentRepositionModalTime');
    if (!modal || !dayInput || !timeInput) return;
    dayInput.value = String(day || '').trim();
    timeInput.value = formatHour(hour);
    modal.dataset.repositionDay = String(day || '').trim();
    modal.dataset.repositionHour = String(hour);
    openModalWithAnimation(modal);
    window.setTimeout(() => dayInput.focus(), 0);
}

function closeStudentRepositionModal() {
    const modal = document.getElementById('studentRepositionModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
}

function parseRepositionHourInput(rawValue) {
    const raw = String(rawValue || '').trim();
    if (!raw) return Number.NaN;
    const numeric = Number.parseInt(raw, 10);
    if (Number.isFinite(numeric)) return numeric;
    const match = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*([ap]\.?m\.?)?$/i);
    if (!match) return Number.NaN;
    let hour = Number.parseInt(match[1], 10);
    const minute = Number.parseInt(match[2] || '0', 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute < 0 || minute > 59) return Number.NaN;
    const meridiem = String(match[3] || '').toLowerCase().replace(/\./g, '');
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return hour;
}

function normalizeRepositionDayInput(rawValue) {
    const raw = String(rawValue || '').trim().toLowerCase();
    if (!raw) return '';
    const matched = DAYS.find((d) => String(d || '').trim().toLowerCase() === raw);
    return matched ? String(matched) : '';
}

function submitStudentRepositionBooking() {
    const modal = document.getElementById('studentRepositionModal');
    const dayInput = document.getElementById('studentRepositionModalDay');
    const timeInput = document.getElementById('studentRepositionModalTime');
    if (!modal || !dayInput || !timeInput) return;

    const studentName = String(loggedInStudentFullName || '').trim();
    if (!studentName) {
        showAppMessage('Please log in as a student to schedule a reposition.');
        return;
    }

    const day = normalizeRepositionDayInput(dayInput.value) || normalizeRepositionDayInput(modal.dataset.repositionDay);
    const hour = parseRepositionHourInput(timeInput.value || modal.dataset.repositionHour);
    if (!day || !Number.isFinite(hour)) {
        showAppMessage('Please provide a valid day and time.');
        return;
    }
    if (hour < START_HOUR || hour >= END_HOUR) {
        showAppMessage(`Please choose a time between ${formatHour(START_HOUR)} and ${formatHour(END_HOUR - 1)}.`);
        return;
    }

    const tutorName = String(getTutorRosterNameForStudent(studentName) || '').trim();
    if (!tutorName) {
        showAppMessage('No tutor was found for your profile.');
        return;
    }

    const slotKey = `${day}-${hour}`;
    const tutorSlots = computeSlotStatesForProfile(tutorName);
    const currentState = String(tutorSlots[slotKey] || '').trim().toLowerCase();
    if (currentState !== 'available') {
        showAppMessage('This slot is no longer available. Please choose another time.');
        return;
    }

    if (!teacherUnavailableStudentNamesByTeacher[tutorName]) {
        teacherUnavailableStudentNamesByTeacher[tutorName] = getUnavailableStudentNamesMetaFromSchedule(teacherSchedules[tutorName]);
    }
    teacherUnavailableStudentNamesByTeacher[tutorName][slotKey] = studentName;

    const tutorRawSchedule = teacherSchedules[tutorName]
        ? getScheduleSlotMapWithoutMeta(teacherSchedules[tutorName])
        : {};
    tutorRawSchedule[slotKey] = BOOKED_CLASS_SLOT_STATE;
    teacherSchedules[tutorName] = withUnavailableStudentNamesMeta(tutorName, tutorRawSchedule);
    markSchedulePendingCloudUpload();
    saveAllSchedulesLocal();
    saveAllSchedules();

    if (currentTeacher && String(currentTeacher).trim().toLowerCase() === studentName.toLowerCase()) {
        loadTeacherSchedule(currentTeacher);
        refreshCalendarDisplay();
    }

    resetClassStartNotificationCache();
    notifyUpcomingClasses();
    closeStudentRepositionModal();
    showAppMessage(`Reposition booked for ${day} at ${formatHour(hour)}.`);
}

function setupStudentRepositionModal() {
    const modal = document.getElementById('studentRepositionModal');
    const closeBtn = document.getElementById('studentRepositionModalClose');
    const backdrop = document.getElementById('studentRepositionModalBackdrop');
    const scheduleBtn = document.getElementById('studentRepositionModalSchedule');
    const dayInput = document.getElementById('studentRepositionModalDay');
    const timeInput = document.getElementById('studentRepositionModalTime');
    if (!modal) return;
    closeBtn?.addEventListener('click', () => closeStudentRepositionModal());
    backdrop?.addEventListener('click', () => closeStudentRepositionModal());
    scheduleBtn?.addEventListener('click', () => submitStudentRepositionBooking());
    dayInput?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        submitStudentRepositionBooking();
    });
    timeInput?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        submitStudentRepositionBooking();
    });
}

function randomIntBelow(max) {
    const m = Math.max(1, Math.floor(Number(max)) || 1);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] % m;
    }
    return Math.floor(Math.random() * m);
}

function randomUppercaseLetterChar() {
    return String.fromCharCode(65 + randomIntBelow(26));
}

function randomDigitCharForPassword() {
    return String.fromCharCode(48 + randomIntBelow(10));
}

/** Add Student plate-style password: fixed `@` + 3 letters + 1 digit + 1 letter + 2 digits (8 chars). */
function generateAddStudentPlatePassword() {
    return `@${randomUppercaseLetterChar()}${randomUppercaseLetterChar()}${randomUppercaseLetterChar()}${randomDigitCharForPassword()}${randomUppercaseLetterChar()}${randomDigitCharForPassword()}${randomDigitCharForPassword()}`;
}

function isPlatePasswordPatternValid(passwordRaw) {
    return /^@[a-z]{3}\d[a-z]\d{2}$/i.test(String(passwordRaw || '').trim());
}

function bindPlatePasswordGenerateButton(buttonEl, inputEl) {
    if (!buttonEl || !inputEl) return;
    if (buttonEl.dataset.bound === '1') return;
    buttonEl.dataset.bound = '1';
    buttonEl.addEventListener('click', () => {
        inputEl.value = generateAddStudentPlatePassword();
        inputEl.focus();
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
    const addTeacherPwdInput = document.getElementById('addTeacherPassword');
    const addTeacherPwdGen = document.getElementById('addTeacherPasswordGenerate');
    bindPlatePasswordGenerateButton(addTeacherPwdGen, addTeacherPwdInput);
    const addStudentPwdInput = document.getElementById('addStudentPassword');
    const addStudentPwdGen = document.getElementById('addStudentPasswordGenerate');
    bindPlatePasswordGenerateButton(addStudentPwdGen, addStudentPwdInput);
}

// Initialize teachers sidebar
async function initTeachers() {
    await refreshTimetableApiBearerTokenIfPossible();
    await initRoster();
    await ensureAdminAccountReady();
    let restoredTeacher = null;
    if (await tryRestoreAdminFromBearerIfPossible()) {
        restoredTeacher = DEFAULT_ADMIN_USERNAME;
    } else {
        restoredTeacher = await tryRestoreSessionFromSavedCredentials();
    }
    if (isTeacherLoggedIn && loadSavedLoginCredentials()) {
        await refreshTimetableApiBearerTokenIfPossible();
    }
    applyTeacherDataIsolationInMemory();
    await loadAllSchedules();
    applyTeacherDataIsolationInMemory();
    syncSpeakOnWeeklyToAllTeacherSchedules();
    renderSidebar();
    setupTeacherListEditDelegation();
    setupSidebarAdminLogoffDelegation();
    setupAdminSidebarNavDelegation();

    if (!isTeacherLoggedIn) {
        setLoggedOutDashboard();
        return;
    }

    if (isAdminLoggedIn) {
        setAdminDashboard();
        return;
    }

    if (restoredTeacher || teachersList.length > 0 || String(loggedInTeacherName || '').trim()) {
        let initialTeacher = restoredTeacher;
        if (
            !initialTeacher &&
            isGateStaffAccountSession() &&
            getGateSessionAppRole() === 'class-supervisor'
        ) {
            const supervisees = getClassSupervisorActiveSuperviseeTeacherNames();
            initialTeacher = String(loggedInTeacherName || '').trim() || supervisees[0] || '';
        }
        if (!initialTeacher) {
            initialTeacher = loggedInTeacherName || teachersList[0] || '';
        }
        if (initialTeacher) {
            const restoredView = loggedInStudentFullName ? { view: 'classReport' } : { view: 'calendar' };
            selectTeacher(initialTeacher, restoredTeacher ? restoredView : undefined);
        }
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

    if (loggedInStudentFullName) {
        if (String(teacherName || '').trim().toLowerCase() !== String(loggedInStudentFullName).trim().toLowerCase()) {
            showAppMessage('You can only view your own schedule.');
            return;
        }
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

    let scheduleLoadKey = String(teacherName || '').trim();
    if (loggedInStudentFullName && !showClassReport) {
        // Student sessions: their class slots + tutor "available" (green); see mergeStudentCalendarWithTutorFreeSlots.
        scheduleLoadKey = String(loggedInStudentFullName).trim();
    }

    currentTeacher = scheduleLoadKey;
    resetClassStartNotificationCache();
    renderSidebarHeaderProfile();

    document.querySelectorAll('.teacher-item').forEach((item) => {
        item.classList.remove('active');
        if (loggedInStudentFullName) {
            const ds = String(item.dataset.teacher || '').trim().toLowerCase();
            if (ds === String(loggedInStudentFullName || '').trim().toLowerCase()) {
                item.classList.add('active');
            }
        } else if (item.dataset.teacher === teacherName) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.class-report-student-item').forEach((li) => {
        li.classList.toggle(
            'class-report-student-item--active',
            showClassReport && !!teacherName && li.dataset.studentName === teacherName
        );
    });

    loadTeacherSchedule(scheduleLoadKey);
    notifyUpcomingClasses();
    applyCalendarStatePaletteCssVars();
    refreshContextMenuTheme();

    const calendarWrapper = document.getElementById('calendarWrapper');
    let reportPanel = document.getElementById('studentClassReportPanel');
    const adminPanel = document.getElementById('adminControlPanel');

    hideMaterialsMainView();

    if (showClassReport) {
        if (calendarWrapper) calendarWrapper.hidden = true;
        renderStudentClassReportTable(teacherName);
        reportPanel = document.getElementById('studentClassReportPanel');
        if (reportPanel) reportPanel.hidden = false;
        if (adminPanel) adminPanel.hidden = true;
    } else {
        if (calendarWrapper) calendarWrapper.hidden = false;
        if (reportPanel) reportPanel.hidden = true;
        if (adminPanel) adminPanel.hidden = true;
        refreshCalendarDisplay();
    }
}

/** After `renderSidebar()`, re-apply selection: student sessions always use the roster name, not the tutor calendar key in `currentTeacher`. */
function resyncSelectionAfterSidebarRender() {
    if (!isTeacherLoggedIn) return;
    const reportPanel = document.getElementById('studentClassReportPanel');
    const classReportVisible = reportPanel && !reportPanel.hidden;
    const sidebarName = String(loggedInStudentFullName || currentTeacher || '').trim();
    if (!sidebarName) return;
    const opts =
        classReportVisible && isStudentName(sidebarName) ? { view: 'classReport' } : { view: 'calendar' };
    selectTeacher(sidebarName, opts);
}

function removeStudentFromRoster(name, rosterKey) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot delete student profiles.');
        return;
    }
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
    delete studentClassReportUploadsByName[removedName];
    delete passportFollowupLinks[removedName];
    delete studentExternalFollowUpLinksByName[removedName];
    delete studentSchoolByName[removedName];
    delete studentPhonesByName[removedName];
    delete studentTeacherByName[removedName];
    delete studentGoogleMeetLinksByName[removedName];
    delete studentEmailsByName[removedName];
    delete studentUsernamesByName[removedName];
    delete studentPasswordsByName[removedName];
    delete studentCityByName[removedName];
    delete studentCountryByName[removedName];
    saveStudentClassReportRows();
    void flushClassReportReplaceManifestFromMemory();
    syncSpeakOnWeeklyToAllTeacherSchedules();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();

    if (wasCurrent) {
        selectTeacher(teachersList[0]);
    } else {
        resyncSelectionAfterSidebarRender();
    }
}

function setupTeacherListEditDelegation() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList || teacherList.dataset.editDelegation === '1') {
        return;
    }
    teacherList.dataset.editDelegation = '1';
    teacherList.addEventListener('click', (e) => {
        if (loggedInStudentFullName) return;
        const extBtn = e.target.closest('.student-external-link-btn');
        if (extBtn && teacherList.contains(extBtn)) {
            e.preventDefault();
            e.stopPropagation();
            const nm = extBtn.getAttribute('data-student-name');
            const href = getStudentExternalFollowUpLinkHref(nm);
            if (!href) return;
            window.open(href, '_blank', 'noopener,noreferrer');
            return;
        }
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

function setupSidebarAdminLogoffDelegation() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList || teacherList.dataset.adminLogoffDelegation === '1') {
        return;
    }
    teacherList.dataset.adminLogoffDelegation = '1';
    teacherList.addEventListener('click', (e) => {
        const logoffBtn = e.target && e.target.closest && e.target.closest('.sidebar-admin-logoff-btn');
        if (!logoffBtn || !teacherList.contains(logoffBtn)) {
            return;
        }
        e.preventDefault();
        if (!hasEffectiveAdminSession()) {
            return;
        }
        performTeacherSessionLogout();
    });
}

function setupAdminSidebarNavDelegation() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList || teacherList.dataset.adminSidebarNav === '1') {
        return;
    }
    teacherList.dataset.adminSidebarNav = '1';
    teacherList.addEventListener('click', (e) => {
        const managementBtn = e.target && e.target.closest && e.target.closest('[data-management-nav]');
        const otherBtn = e.target && e.target.closest && e.target.closest('[data-other-nav]');
        if (!managementBtn && !otherBtn) {
            return;
        }
        if (!hasEffectiveAdminSession()) {
            return;
        }
        e.preventDefault();
        showAdminBlankMainPanel();
    });
}

/**
 * Split a stored display name into First name + last name.
 * The last whitespace-separated token is always the last name so compound
 * first names work ("Carolina Mayumi Nakadomari" → first "Carolina", last "Mayumi Nakadomari").
 */
function splitName(fullName) {
    const cleaned = String(fullName || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return { first: '', last: '' };
    const parts = cleaned.split(' ');
    if (parts.length === 1) {
        return { first: parts[0], last: '' };
    }
    return {
        first: parts.slice(0, -1).join(' '),
        last: parts[parts.length - 1]
    };
}

function normalizeStudentDisplayName(fullName) {
    return String(fullName || '').trim().replace(/\s+/g, ' ');
}

function isElementTextHorizontallyOverflowing(el) {
    if (!el) return false;
    return Math.ceil(el.scrollWidth) > Math.ceil(el.clientWidth) + 1;
}

function isCalendarChipOutsideSlotBounds(chip, slotEl) {
    if (!chip || !slotEl) return false;
    const chipRect = chip.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    return chipRect.left < slotRect.left - 1 || chipRect.right > slotRect.right + 1;
}

/** Short label for calendar chips when full name does not fit. */
function formatStudentDisplayNameForCalendarChip(fullName) {
    const cleaned = normalizeStudentDisplayName(fullName);
    if (!cleaned) return '';
    const parts = cleaned.split(' ');
    if (parts.length < 2) return cleaned;
    const last = parts[parts.length - 1];
    const initial = String(last).charAt(0);
    if (!initial) return cleaned;
    const first = parts.slice(0, -1).join(' ');
    return `${first} ${initial}.`;
}

function abbreviateOverflowingCalendarStudentChips(slotEl) {
    if (!slotEl) return;
    const chips = slotEl.querySelectorAll('.time-slot-student-chip');
    chips.forEach((chip) => {
        const fullName = String(chip.title || '').trim();
        if (!fullName) return;
        chip.textContent = normalizeStudentDisplayName(fullName);
        if (isElementTextHorizontallyOverflowing(chip) || isCalendarChipOutsideSlotBounds(chip, slotEl)) {
            chip.textContent = formatStudentDisplayNameForCalendarChip(fullName);
        }
    });
}

function queueCalendarStudentChipFitCheck(slotEl) {
    abbreviateOverflowingCalendarStudentChips(slotEl);
    requestAnimationFrame(() => abbreviateOverflowingCalendarStudentChips(slotEl));
}

function getStudentPhoneInfo(studentName) {
    const name = String(studentName || '').trim();
    const raw = name ? studentPhonesByName[name] : null;
    if (!raw || typeof raw !== 'object') {
        return { countryIso: DEFAULT_PHONE_COUNTRY_ISO, number: '' };
    }
    const iso = String(raw.countryIso || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const countryIso = PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso) ? iso : DEFAULT_PHONE_COUNTRY_ISO;
    const numberRaw = String(raw.number || '').trim();
    const number = numberRaw ? normalizeStudentPhoneLocalInput(numberRaw, countryIso) : '';
    return { countryIso, number };
}

function saveStudentPhoneInfo(studentName, countryIsoRaw, numberRaw) {
    const name = String(studentName || '').trim();
    if (!name) return;
    const trimmed = String(numberRaw || '').trim();
    if (!trimmed) {
        delete studentPhonesByName[name];
        return;
    }
    const iso = String(countryIsoRaw || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const countryIso = PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso) ? iso : DEFAULT_PHONE_COUNTRY_ISO;
    const number = normalizeStudentPhoneLocalInput(numberRaw, countryIso);
    const nd = sanitizeNationalPhoneDigits(countryIso, digitsOnly(number));
    if (!nd || !isPlausibleNationalPhoneDigits(countryIso, nd.length)) {
        delete studentPhonesByName[name];
        return;
    }
    studentPhonesByName[name] = { countryIso, number };
}

function getStudentTeacherInfo(studentName) {
    const name = String(studentName || '').trim();
    if (!name) return '';
    const direct = String(studentTeacherByName[name] || '').trim();
    if (direct) return direct;
    const keyLc = name.toLowerCase();
    const mappedKey = Object.keys(studentTeacherByName).find(
        (key) => String(key || '').trim().toLowerCase() === keyLc
    );
    return mappedKey ? String(studentTeacherByName[mappedKey] || '').trim() : '';
}

function saveStudentTeacherInfo(studentName, teacherRaw) {
    const name = String(studentName || '').trim();
    if (!name) return;
    const teacher = String(teacherRaw || '').trim();
    if (!teacher) {
        delete studentTeacherByName[name];
        return;
    }
    studentTeacherByName[name] = teacher;
}

/**
 * Mentor for a newly created student: only when explicitly chosen (legacy add form or future payload).
 * No default to the logged-in teacher or the single teacher profile — roster orgs assign many students without a tutor link.
 */
function resolveMentorTeacherForNewStudent(preferredRaw) {
    return String(preferredRaw ?? '').trim();
}

/**
 * Optional follow-up URL. Empty input -> { href: '', error: null }.
 * Non-empty: normalizes with https:// if no scheme; only http/https allowed.
 */
function parseStudentExternalFollowUpLinkInput(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
        return { href: '', error: null };
    }
    let candidate = trimmed;
    if (!/^https?:\/\//i.test(candidate)) {
        candidate = `https://${candidate}`;
    }
    try {
        const u = new URL(candidate);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            return { href: '', error: 'Only http:// and https:// links are allowed.' };
        }
        return { href: u.href, error: null };
    } catch {
        return { href: '', error: 'Please enter a valid link.' };
    }
}

window.parseStudentExternalFollowUpLinkInput = parseStudentExternalFollowUpLinkInput;

/** Opens in new tab — only truthy when a stored value parses as http/https. */
function getStudentExternalFollowUpLinkHref(studentName) {
    const displayName = String(studentName || '').trim();
    if (!displayName) return '';
    let raw = String(studentExternalFollowUpLinksByName[displayName] || '').trim();
    if (!raw) {
        const keyMatch = Object.keys(studentExternalFollowUpLinksByName).find(
            (k) => String(k || '').trim().toLowerCase() === displayName.toLowerCase()
        );
        if (keyMatch) raw = String(studentExternalFollowUpLinksByName[keyMatch] || '').trim();
    }
    if (!raw) return '';
    const parsed = parseStudentExternalFollowUpLinkInput(raw);
    return parsed.error || !parsed.href ? '' : parsed.href;
}

function saveStudentAccountExtras(studentName, extras) {
    const name = String(studentName || '').trim();
    if (!name) return;
    const email = String(extras?.email || '').trim();
    const username = String(extras?.username || '').trim();
    const password = String(extras?.password || '').trim();
    const city = String(extras?.city || '').trim();
    const country = String(extras?.country || '').trim();
    const birthDate = String(extras?.birthDate || '').trim();
    const age = String(extras?.age || '').trim();
    const level = String(extras?.level || '').trim();
    if (email) studentEmailsByName[name] = email;
    else delete studentEmailsByName[name];
    if (username) studentUsernamesByName[name] = username;
    else delete studentUsernamesByName[name];
    if (password) studentPasswordsByName[name] = password;
    else delete studentPasswordsByName[name];
    if (city) studentCityByName[name] = city;
    else delete studentCityByName[name];
    if (country) studentCountryByName[name] = country;
    else delete studentCountryByName[name];
    // Birth and age use one canonical key pair so save, edit, and reload stay aligned.
    if (birthDate) studentBirthDatesByName[name] = birthDate;
    else delete studentBirthDatesByName[name];
    if (age) studentAgesByName[name] = age;
    else delete studentAgesByName[name];
    if (level) studentLevelsByName[name] = level;
    else delete studentLevelsByName[name];

    if (extras && Object.prototype.hasOwnProperty.call(extras, 'externalFollowUpLink')) {
        const parsed = parseStudentExternalFollowUpLinkInput(String(extras.externalFollowUpLink ?? ''));
        if (parsed.href) studentExternalFollowUpLinksByName[name] = parsed.href;
        else delete studentExternalFollowUpLinksByName[name];
    }
}

function buildStudentWhatsappUrl(studentName, message = '') {
    const name = String(studentName || '').trim();
    if (!name) return '';
    const phoneInfo = getStudentPhoneInfo(name);
    const country = getPhoneCountryByIso(phoneInfo.countryIso);
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
        'Please click on the link above to join our class.',
        'Here is the link for our class.',
        'You can access the class using the link above.',
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
    const options = [...getSchoolNamesForStudentSchoolSelect()];
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
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot edit student profiles.');
        return;
    }
    const modal = document.getElementById('editStudentModal');
    const firstInput = document.getElementById('editStudentFirst');
    const lastInput = document.getElementById('editStudentLast');
    const phoneInput = document.getElementById('editStudentPhone');
    const phoneCountrySelect = document.getElementById('editStudentPhoneCountry');
    const schoolSelect = document.getElementById('editStudentSchool');
    const cityInput = document.getElementById('editStudentCity');
    const countryInput = document.getElementById('editStudentCountry');
    const emailInput = document.getElementById('editStudentEmail');
    const birthDateInput = document.getElementById('editStudentBirthDate');
    const ageInput = document.getElementById('editStudentAge');
    const levelInput = document.getElementById('editStudentLevel');
    const usernameInput = document.getElementById('editStudentUsername');
    const passwordInput = document.getElementById('editStudentPassword');
    const passportLinkInput = document.getElementById('editStudentPassportLink');
    const originalNameInput = document.getElementById('editStudentOriginalName');
    const originalCategoryInput = document.getElementById('editStudentOriginalCategory');
    if (!modal || !firstInput || !lastInput || !phoneInput || !phoneCountrySelect || !schoolSelect || !originalNameInput || !originalCategoryInput) {
        return;
    }

    const parsed = splitName(studentName);
    const currentSchool = getStudentSchoolName(studentName) || (rosterKey === 'passport' ? 'Passport' : (rosterKey === 'speakon' ? 'SpeakOn' : 'HomeTeachers'));
    firstInput.value = parsed.first;
    lastInput.value = parsed.last;
    if (countryInput) resetPhoneCountryDialSyncState(countryInput);
    const phone = getStudentPhoneInfo(studentName);
    phoneInput.value = phone.number;
    phoneCountrySelect.value = phone.countryIso;
    updateEditStudentPhonePlaceholder();
    if (cityInput) cityInput.value = String(studentCityByName[studentName] || '');
    if (countryInput) {
        const fallbackCountryName = PHONE_COUNTRY_OPTIONS.find((item) => item.iso === phone.countryIso)?.name || '';
        countryInput.value = String(studentCountryByName[studentName] || fallbackCountryName);
        countryInput.dataset.phoneDialIsoForCountry = String(phoneCountrySelect.value || '').trim().toUpperCase();
    }
    if (emailInput) emailInput.value = String(studentEmailsByName[studentName] || '');
    if (birthDateInput) birthDateInput.value = String(studentBirthDatesByName[studentName] || '');
    if (ageInput) ageInput.value = String(studentAgesByName[studentName] || '');
    syncEditStudentAgeFromBirthDate();
    if (levelInput) levelInput.value = String(studentLevelsByName[studentName] || '');
    if (usernameInput) usernameInput.value = String(studentUsernamesByName[studentName] || buildDefaultStudentUsernameFromFullName(studentName));
    if (passwordInput) passwordInput.value = '';
    if (passportLinkInput) passportLinkInput.value = String(passportFollowupLinks[studentName] || '');
    const externalFollowUpEl = document.getElementById('editStudentExternalFollowUpLink');
    if (externalFollowUpEl) externalFollowUpEl.value = String(studentExternalFollowUpLinksByName[studentName] || '');
    refreshEditStudentSchoolSelect(currentSchool);
    originalNameInput.value = studentName;
    originalCategoryInput.value = rosterKey;
    refreshEditStudentTeacherSelect(getStudentTeacherInfo(studentName));

    openModalWithAnimation(modal);
    firstInput.focus();
}

function closeEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    if (!modal) return;
    closeModalWithAnimation(modal);
}

function calculateStudentAgeFromBirthDate(value) {
    if (!value) return '';
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    if (age < 0) return '';
    return age > 60 ? '60+' : String(age);
}

function syncEditStudentAgeFromBirthDate() {
    const birthDateInput = document.getElementById('editStudentBirthDate');
    const ageInput = document.getElementById('editStudentAge');
    if (!ageInput) return;
    ageInput.value = calculateStudentAgeFromBirthDate(birthDateInput?.value || '');
}

function refreshClassReportAfterMeetLinkChange() {
    renderSidebar();
    if (currentTeacher || loggedInStudentFullName) {
        resyncSelectionAfterSidebarRender();
    }
}

async function upsertStudentFromEditForm(action = 'save') {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot edit student profiles.');
        return;
    }
    const originalName = document.getElementById('editStudentOriginalName')?.value || '';
    const originalKind = document.getElementById('editStudentOriginalCategory')?.value || '';
    const first = document.getElementById('editStudentFirst')?.value || '';
    const last = document.getElementById('editStudentLast')?.value || '';
    const phoneNumber = document.getElementById('editStudentPhone')?.value || '';
    const phoneCountryIso = document.getElementById('editStudentPhoneCountry')?.value || DEFAULT_PHONE_COUNTRY_ISO;
    const schoolName = document.getElementById('editStudentSchool')?.value || '';
    const city = String(document.getElementById('editStudentCity')?.value || '').trim();
    const country = String(document.getElementById('editStudentCountry')?.value || '').trim();
    const email = String(document.getElementById('editStudentEmail')?.value || '').trim();
    const username = String(document.getElementById('editStudentUsername')?.value || '').trim();
    const nextPasswordRaw = String(document.getElementById('editStudentPassword')?.value || '').trim();
    const passportLink = String(document.getElementById('editStudentPassportLink')?.value || '').trim();
    const nextSchool = String(schoolName || '').trim();
    const nextKind = rosterKindFromSchoolName(nextSchool);
    const birthDateValue = String(document.getElementById('editStudentBirthDate')?.value || '').trim();
    const ageRaw = String(document.getElementById('editStudentAge')?.value || '').trim();
    const levelValue = String(document.getElementById('editStudentLevel')?.value || '').trim();
    // Ensure calculated age is current before validation and save.
    syncEditStudentAgeFromBirthDate();
    const calculatedAgeRaw = String(document.getElementById('editStudentAge')?.value || ageRaw).trim();

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
        alert('Please enter First name and Last name.');
        return;
    }
    if (!nextSchool) {
        alert("Please select the school's name.");
        return;
    }
    if (!levelValue) {
        alert('Please select the student level.');
        document.getElementById('editStudentLevel')?.focus();
        return;
    }

    const mentorsAvailable = getTeachersForStudentMentorSelect();
    let mentorResolved = String(document.getElementById('editStudentTeacher')?.value || '').trim();
    if (mentorsAvailable.length === 0 && !mentorResolved) {
        alert('Add at least one teacher profile before saving student data.');
        document.getElementById('editStudentTeacher')?.focus();
        return;
    }
    if (!mentorResolved && mentorsAvailable.length === 1) {
        mentorResolved = mentorsAvailable[0];
    }
    if (mentorsAvailable.length > 1 && !mentorResolved) {
        alert('Please select a teacher.');
        document.getElementById('editStudentTeacher')?.focus();
        return;
    }

    if (birthDateValue) {
        const numericAge = calculatedAgeRaw === '60+' ? 61 : Number(calculatedAgeRaw);
        if (!Number.isFinite(numericAge) || numericAge < 18) {
            alert('Student age must be 18 or older.');
            document.getElementById('editStudentBirthDate')?.focus();
            return;
        }
    }
    if (!username) {
        alert('Student username is required for account login.');
        document.getElementById('editStudentUsername')?.focus();
        return;
    }
    if (email) {
        const emailLc = email.toLowerCase();
        const duplicateStudentEmail = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
            const sameAsOriginal = name.trim().toLowerCase() === originalName.trim().toLowerCase();
            return !sameAsOriginal && String(studentEmailsByName[name] || '').trim().toLowerCase() === emailLc;
        });
        if (duplicateStudentEmail) {
            alert('This student email is already in use.');
            document.getElementById('editStudentEmail')?.focus();
            return;
        }
        const duplicateTeacherEmail = teachersList.some((name) => String(teacherEmailsByName[name] || '').trim().toLowerCase() === emailLc);
        if (duplicateTeacherEmail) {
            alert('This email is already used by a teacher account.');
            document.getElementById('editStudentEmail')?.focus();
            return;
        }
    }
    const usernameLc = username.toLowerCase();
    const duplicateStudentUsername = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
        const sameAsOriginal = name.trim().toLowerCase() === originalName.trim().toLowerCase();
        return !sameAsOriginal && String(studentUsernamesByName[name] || '').trim().toLowerCase() === usernameLc;
    });
    if (duplicateStudentUsername) {
        alert('This student username is already in use.');
        document.getElementById('editStudentUsername')?.focus();
        return;
    }
    if (usernameLc === String(adminAccount.username || '').trim().toLowerCase()) {
        alert('This username is already used by the admin account.');
        document.getElementById('editStudentUsername')?.focus();
        return;
    }
    if (nextPasswordRaw && !isPlatePasswordPatternValid(nextPasswordRaw)) {
        alert('Password must match @xxxnxnn (letters and numbers, case-insensitive).');
        document.getElementById('editStudentPassword')?.focus();
        return;
    }

    const externalFollowUpParsed = parseStudentExternalFollowUpLinkInput(
        String(document.getElementById('editStudentExternalFollowUpLink')?.value ?? '').trim()
    );
    if (externalFollowUpParsed.error) {
        alert(externalFollowUpParsed.error);
        document.getElementById('editStudentExternalFollowUpLink')?.focus();
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
        if (Object.prototype.hasOwnProperty.call(studentEmailsByName, originalName)) {
            studentEmailsByName[fullName] = studentEmailsByName[originalName];
            delete studentEmailsByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentUsernamesByName, originalName)) {
            studentUsernamesByName[fullName] = studentUsernamesByName[originalName];
            delete studentUsernamesByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentPasswordsByName, originalName)) {
            studentPasswordsByName[fullName] = studentPasswordsByName[originalName];
            delete studentPasswordsByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentCityByName, originalName)) {
            studentCityByName[fullName] = studentCityByName[originalName];
            delete studentCityByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentCountryByName, originalName)) {
            studentCountryByName[fullName] = studentCountryByName[originalName];
            delete studentCountryByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentBirthDatesByName, originalName)) {
            studentBirthDatesByName[fullName] = studentBirthDatesByName[originalName];
            delete studentBirthDatesByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentAgesByName, originalName)) {
            studentAgesByName[fullName] = studentAgesByName[originalName];
            delete studentAgesByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentLevelsByName, originalName)) {
            studentLevelsByName[fullName] = studentLevelsByName[originalName];
            delete studentLevelsByName[originalName];
        }
        if (Object.prototype.hasOwnProperty.call(studentExternalFollowUpLinksByName, originalName)) {
            studentExternalFollowUpLinksByName[fullName] = studentExternalFollowUpLinksByName[originalName];
            delete studentExternalFollowUpLinksByName[originalName];
        }
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
    saveStudentTeacherInfo(fullName, mentorResolved);
    const existingPasswordHash =
        studentPasswordsByName[fullName]
        || studentPasswordsByName[originalName]
        || '';
    let nextPasswordStored = existingPasswordHash;
    if (nextPasswordRaw) {
        nextPasswordStored = String(nextPasswordRaw || '').trim();
    }
    const ageValue = String(document.getElementById('editStudentAge')?.value || calculatedAgeRaw).trim();
    saveStudentAccountExtras(fullName, {
        email,
        username,
        password: nextPasswordStored,
        city,
        country,
        birthDate: birthDateValue,
        age: ageValue,
        level: levelValue,
        externalFollowUpLink: externalFollowUpParsed.href
    });
    if (originalName !== fullName) {
        delete studentEmailsByName[originalName];
        delete studentUsernamesByName[originalName];
        delete studentPasswordsByName[originalName];
        delete studentCityByName[originalName];
        delete studentCountryByName[originalName];
        delete studentBirthDatesByName[originalName];
        delete studentAgesByName[originalName];
        delete studentLevelsByName[originalName];
        delete studentExternalFollowUpLinksByName[originalName];
    }
    if (nextKind === 'passport' && passportLink) {
        passportFollowupLinks[fullName] = passportLink;
    } else {
        delete passportFollowupLinks[fullName];
    }

    if (originalName !== fullName) {
        delete studentTeacherByName[originalName];
    }

    if (
        loggedInStudentFullName &&
        String(loggedInStudentFullName).trim().toLowerCase() === originalName.trim().toLowerCase()
    ) {
        loggedInStudentFullName = fullName;
    }

    if (currentTeacher && currentTeacher.trim().toLowerCase() === originalName.trim().toLowerCase()) {
        currentTeacher = fullName;
    }

    const classDayInput = document.getElementById('editStudentSpeakonClassDay');
    const classHourInput = document.getElementById('editStudentSpeakonClassHour');
    const extraDayInput = document.getElementById('editStudentSpeakonExtraDay');
    const extraHourInput = document.getElementById('editStudentSpeakonExtraHour');
    const hasScheduleInputs = !!(classDayInput && classHourInput && extraDayInput && extraHourInput);
    const shouldEditSpeakonSchedule = nextKind === 'speakon' && hasScheduleInputs;

    if (nextKind === 'speakon') {
        if (originalName !== fullName && speakonStudentWeeklyClass[originalName]) {
            speakonStudentWeeklyClass[fullName] = speakonStudentWeeklyClass[originalName];
            delete speakonStudentWeeklyClass[originalName];
        }
        if (shouldEditSpeakonSchedule) {
            const bucket = {
                classDay: String(classDayInput.value || '').trim(),
                classHour: String(classHourInput.value || '').trim(),
                extraDay: String(extraDayInput.value || '').trim(),
                extraHour: String(extraHourInput.value || '').trim()
            };
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
        }
    }

    if (shouldEditSpeakonSchedule) {
        if (teacherSchedules[fullName]) {
            teacherSchedules[fullName] = mergeSpeakonWeeklyClassIntoScheduleCopy(teacherSchedules[fullName], fullName);
        } else {
            teacherSchedules[fullName] = mergeSpeakonWeeklyClassIntoScheduleCopy({}, fullName);
        }
    }
    const reportPanelEl = document.getElementById('studentClassReportPanel');
    const classReportOpen = reportPanelEl && !reportPanelEl.hidden;
    if (loggedInStudentFullName) {
        if (classReportOpen && currentTeacher && currentTeacher.trim().toLowerCase() === fullName.trim().toLowerCase()) {
            const tk = getTutorRosterNameForStudent(loggedInStudentFullName);
            if (tk && fullName.trim().toLowerCase() === String(loggedInStudentFullName).trim().toLowerCase()) {
                slotStates = mergeStudentCalendarWithTutorFreeSlots(loggedInStudentFullName, tk);
            } else {
                slotStates = { ...teacherSchedules[fullName] };
            }
        }
    } else if (currentTeacher && currentTeacher.trim().toLowerCase() === fullName.trim().toLowerCase()) {
        slotStates = { ...teacherSchedules[fullName] };
    }

    syncSpeakOnWeeklyToAllTeacherSchedules();

    if (loggedInStudentFullName && !classReportOpen) {
        loadTeacherSchedule(String(loggedInStudentFullName).trim());
    }

    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();

    renderSidebar();
    if (currentTeacher || loggedInStudentFullName) {
        resyncSelectionAfterSidebarRender();
    } else {
        selectTeacher(teachersList[0] || fullName);
    }
    syncSpeakOnWeeklyToAllTeacherSchedules();
    saveAllSchedulesLocal();
    saveAllSchedules();
    const selfStudent = String(loggedInStudentFullName || '').trim();
    if (selfStudent && fullName.trim().toLowerCase() === selfStudent.toLowerCase()) {
        refreshVisibleStudentClassReportUploadFeed();
        void pollClassReportUploadsFromCloud();
    }
    closeEditStudentModal();
}

function setupEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    const form = document.getElementById('editStudentForm');
    const cancelBtn = document.getElementById('editStudentCancel');
    const closeBtn = document.getElementById('editStudentCloseBtn');
    const deleteBtn = document.getElementById('editStudentDelete');
    const backdrop = document.getElementById('editStudentModalBackdrop');
    const phoneCountrySelect = document.getElementById('editStudentPhoneCountry');
    const firstInput = document.getElementById('editStudentFirst');
    const lastInput = document.getElementById('editStudentLast');
    const usernameInput = document.getElementById('editStudentUsername');
    const passwordInput = document.getElementById('editStudentPassword');
    const passwordGenerateBtn = document.getElementById('editStudentPasswordGenerate');
    const birthDateInput = document.getElementById('editStudentBirthDate');
    if (!modal || !form) {
        return;
    }
    populateEditStudentPhoneCountrySelect();
    updateEditStudentPhonePlaceholder();
    bindEditStudentCountryPicker();
    bindPhoneInputAutoCountry(
        document.getElementById('editStudentPhone'),
        phoneCountrySelect,
        updateEditStudentPhonePlaceholder
    );

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeEditStudentModal());
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeEditStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeEditStudentModal());
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            await upsertStudentFromEditForm('delete');
        });
    }
    const syncEditStudentUsername = () =>
        syncStudentUsernameFromNameFields(firstInput, lastInput, usernameInput);
    firstInput?.addEventListener('input', syncEditStudentUsername);
    lastInput?.addEventListener('input', syncEditStudentUsername);
    if (passwordGenerateBtn && passwordInput && passwordGenerateBtn.dataset.bound !== '1') {
        bindPlatePasswordGenerateButton(passwordGenerateBtn, passwordInput);
    }
    birthDateInput?.addEventListener('input', syncEditStudentAgeFromBirthDate);
    syncEditStudentAgeFromBirthDate();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await upsertStudentFromEditForm('save');
    });
}

function addSchoolFromForm(schoolNameRaw, primaryColorRaw, secondaryColorRaw, billingModelRaw) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot add schools.');
        return;
    }
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
    const billingModel = normalizeSchoolBillingModel(billingModelRaw);
    if (!billingModel) {
        alert('Please select a billing model.');
        document.querySelector('#addSchoolBillingOptions .add-school-billing-option')?.focus();
        return;
    }
    const billingConfig = getAddSchoolBillingConfigFromForm(billingModel);
    if (!billingConfig) {
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
    schoolBillingModels[k] = billingModel;
    schoolBillingConfigs[k] = { ...billingConfig };

    customSchoolsList.push(schoolName);
    customSchoolsList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    saveRoster();
    refreshContextMenuTheme();
    renderSidebar();
    if (currentTeacher || loggedInStudentFullName) {
        resyncSelectionAfterSidebarRender();
    } else if (teachersList[0]) {
        selectTeacher(teachersList[0]);
    }

    closeAddStudentModal();
}

function isGateStaffLoginUsernameTaken(usernameLc) {
    const lc = String(usernameLc || '').trim().toLowerCase();
    if (!lc) return false;
    return gateStaffAccounts.some((e) => String(e.username || '').trim().toLowerCase() === lc);
}

function addTeacherFromForm(firstName, lastName, emailRaw, passwordRaw) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot add teacher profiles.');
        return;
    }
    const first = String(firstName || '').trim();
    const last = String(lastName || '').trim();
    const email = String(emailRaw || '').trim();
    const password = String(passwordRaw || '');
    if (!first || !last) {
        showAppMessage('Please enter First name and Last name.');
        return;
    }
    if (!email) {
        showAppMessage('Please enter a username.');
        return;
    }
    const phoneEl = document.getElementById('addTeacherPhone');
    const phoneVal = phoneEl ? String(phoneEl.value || '').trim() : '';
    const countrySel = document.getElementById('addTeacherPhoneCountry');
    const iso = String(countrySel?.value || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const phoneCountryIso = PHONE_COUNTRY_OPTIONS.some((c) => c.iso === iso) ? iso : DEFAULT_PHONE_COUNTRY_ISO;
    const phoneDigits = getNationalPhoneDigitsForValidation(phoneCountryIso, phoneVal);
    if (!phoneVal || !phoneDigits || !isPlausibleNationalPhoneDigits(phoneCountryIso, phoneDigits.length)) {
        showAppMessage('Please enter a valid phone number.');
        phoneEl?.focus();
        return;
    }
    if (password.length < 8) {
        showAppMessage('Password must have at least 8 characters.');
        return;
    }
    if (!isPlatePasswordPatternValid(password)) {
        showAppMessage('Password must match @xxxnxnn (letters and numbers, case-insensitive).');
        return;
    }
    const emailLc = email.toLowerCase();
    const adminR = String(adminAccount.username || '').trim().toLowerCase();
    if (adminR && emailLc === adminR) {
        showAppMessage('This username is already used by the admin account.');
        return;
    }
    const studentIdTaken = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
        return (
            String(studentEmailsByName[name] || '').trim().toLowerCase() === emailLc ||
            String(studentUsernamesByName[name] || '').trim().toLowerCase() === emailLc
        );
    });
    if (studentIdTaken) {
        showAppMessage('This username is already used by a student account.');
        return;
    }
    const teacherEmailTaken = teachersList.some((name) => {
        return String(teacherEmailsByName[name] || '').trim().toLowerCase() === emailLc;
    });
    if (teacherEmailTaken) {
        showAppMessage('This teacher username is already in use.');
        return;
    }
    if (isGateStaffLoginUsernameTaken(emailLc)) {
        showAppMessage('This username is already used by a staff account.');
        return;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ');
    const nameTaken =
        [...teachersList, ...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some(
            (n) => n.trim().toLowerCase() === fullName.toLowerCase()
        ) ||
        gateStaffAccounts.some((e) => String(e.profileName || '').trim().toLowerCase() === fullName.toLowerCase());
    if (nameTaken) {
        showAppMessage('That name is already in the list.');
        return;
    }

    teachersList.push(fullName);
    teachersList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    teacherEmailsByName[fullName] = email;
    teacherPasswordsByName[fullName] = password;
    teacherAppRolesByName[fullName] = 'teacher';
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

async function addStudentToSchoolFromForm(firstName, lastName, schoolNameRaw) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot add student profiles.');
        return;
    }
    const first = String(firstName || '').trim();
    const last = String(lastName || '').trim();
    const schoolName = String(schoolNameRaw || '').trim();
    if (!first || !last) {
        alert('Please enter First name and Last name.');
        return;
    }
    if (!schoolName) {
        alert("Please select the school's name.");
        return;
    }

    const emailEl = document.getElementById('addStudentEmail');
    const usernameEl = document.getElementById('addStudentUsername');
    const passwordEl = document.getElementById('addStudentPassword');
    const email = String(emailEl?.value || '').trim();
    const username = String(usernameEl?.value || '').trim();
    const password = String(passwordEl?.value || '').trim();
    const city = String(document.getElementById('addStudentCity')?.value || '').trim();
    const country = String(document.getElementById('addStudentCountry')?.value || '').trim();
    if (!username) {
        alert('Student username is required for account login.');
        usernameEl?.focus();
        return;
    }
    if (!password) {
        alert('Student password is required for account login.');
        passwordEl?.focus();
        return;
    }
    if (password.length < 8) {
        alert('Password must have at least 8 characters.');
        passwordEl?.focus();
        return;
    }
    if (!isPlatePasswordPatternValid(password)) {
        alert('Password must match @xxxnxnn (letters and numbers, case-insensitive).');
        passwordEl?.focus();
        return;
    }
    if (email && emailEl && typeof emailEl.checkValidity === 'function' && !emailEl.checkValidity()) {
        if (typeof emailEl.reportValidity === 'function') emailEl.reportValidity();
        return;
    }
    if (email) {
        const emailLc = email.toLowerCase();
        const studentEmailTaken = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
            return String(studentEmailsByName[name] || '').trim().toLowerCase() === emailLc;
        });
        if (studentEmailTaken) {
            alert('This student email is already in use.');
            emailEl?.focus();
            return;
        }
        const teacherEmailTaken = teachersList.some((name) => {
            return String(teacherEmailsByName[name] || '').trim().toLowerCase() === emailLc;
        });
        if (teacherEmailTaken) {
            alert('This email is already used by a teacher account.');
            emailEl?.focus();
            return;
        }
        if (isGateStaffLoginUsernameTaken(emailLc)) {
            alert('This email is already used by a staff account.');
            emailEl?.focus();
            return;
        }
    }
    const usernameLc = username.toLowerCase();
    const studentUsernameTaken = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
        return String(studentUsernamesByName[name] || '').trim().toLowerCase() === usernameLc;
    });
    if (studentUsernameTaken) {
        alert('This student username is already in use.');
        usernameEl?.focus();
        return;
    }
    if (usernameLc === String(adminAccount.username || '').trim().toLowerCase()) {
        alert('This username is already used by the admin account.');
        usernameEl?.focus();
        return;
    }
    if (isGateStaffLoginUsernameTaken(usernameLc)) {
        alert('This username is already used by a staff account.');
        usernameEl?.focus();
        return;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ');
    const nameTaken =
        [...teachersList, ...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some(
            (n) => n.trim().toLowerCase() === fullName.toLowerCase()
        ) ||
        gateStaffAccounts.some((e) => String(e.profileName || '').trim().toLowerCase() === fullName.toLowerCase());
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
    const addPhoneIsoRaw = String(addPhoneCountrySelect?.value || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    const addPhoneCountry = PHONE_COUNTRY_OPTIONS.some((c) => c.iso === addPhoneIsoRaw)
        ? addPhoneIsoRaw
        : DEFAULT_PHONE_COUNTRY_ISO;
    const addPhoneRawVal = String(addPhoneInput?.value || '').trim();
    if (addPhoneRawVal) {
        const addPd = getNationalPhoneDigitsForValidation(addPhoneCountry, addPhoneRawVal);
        if (!isPlausibleNationalPhoneDigits(addPhoneCountry, addPd.length)) {
            alert('Enter a valid phone number.');
            addPhoneInput?.focus();
            return;
        }
    }
    saveStudentPhoneInfo(fullName, addPhoneCountrySelect?.value || DEFAULT_PHONE_COUNTRY_ISO, addPhoneInput?.value || '');
    const addTeacherSelect = document.getElementById('addStudentMentor');
    saveStudentTeacherInfo(fullName, resolveMentorTeacherForNewStudent(addTeacherSelect?.value));
    saveStudentAccountExtras(fullName, { email, username, password, city, country });
    const schoolKey = schoolName.trim().toLowerCase();
    if (schoolKey) {
        const primaryEl = document.getElementById('addSchoolPrimaryColor');
        const secondaryEl = document.getElementById('addSchoolSecondaryColor');
        schoolThemeColors[schoolKey] = normalizeSchoolTheme(
            {
                primary: primaryEl?.value || '#5c6bc0',
                secondary: secondaryEl?.value || '#1e88e5'
            },
            schoolName
        );
    }
    if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }

    saveRoster();
    refreshContextMenuTheme();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();
    selectTeacher(fullName, { view: 'classReport' });
    closeAddStudentModal();
}

async function createStudentFromModernModal(studentData) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot create student profiles.');
        return false;
    }
    const first = String(studentData?.firstName || '').trim();
    const last = String(studentData?.lastName || '').trim();
    const schoolName = String(studentData?.school || '').trim();
    const level = String(studentData?.level || '').trim();
    const birthDate = String(studentData?.birthDate || '').trim();
    const age = String(studentData?.age || '').trim();
    if (!first || !last) {
        showAppMessage('Please enter First name and Last name.');
        return false;
    }
    if (!schoolName) {
        showAppMessage("Please select the school's name.");
        return false;
    }
    if (!level) {
        showAppMessage('Please select the student level.');
        return false;
    }

    let mentorPick = String(studentData?.mentorTeacher ?? '').trim();
    const mentorsAvailable = getTeachersForStudentMentorSelect();
    if (mentorsAvailable.length === 0) {
        showAppMessage('Add at least one teacher profile before creating students.');
        return false;
    }
    if (!mentorPick && mentorsAvailable.length === 1) {
        mentorPick = mentorsAvailable[0];
    }
    if (mentorsAvailable.length > 1 && !mentorPick) {
        showAppMessage('Please select a teacher.');
        return false;
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
    const nameTaken =
        [...teachersList, ...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some(
            (n) => n.trim().toLowerCase() === fullName.toLowerCase()
        ) ||
        gateStaffAccounts.some((e) => String(e.profileName || '').trim().toLowerCase() === fullName.toLowerCase());
    if (nameTaken) {
        showAppMessage('That name is already in the list.');
        return false;
    }
    const username = String(studentData?.username || buildDefaultStudentUsername(first, last)).trim();
    const password = String(studentData?.password || '').trim();
    if (!username) {
        showAppMessage('Student username is required for account login.');
        return false;
    }
    if (!password) {
        showAppMessage('Student password is required for account login.');
        return false;
    }
    const usernameLc = username.toLowerCase();
    const studentUsernameTaken = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList].some((name) => {
        return String(studentUsernamesByName[name] || '').trim().toLowerCase() === usernameLc;
    });
    if (studentUsernameTaken || usernameLc === String(adminAccount.username || '').trim().toLowerCase()) {
        showAppMessage('This student username is already in use.');
        return false;
    }
    if (isGateStaffLoginUsernameTaken(usernameLc)) {
        showAppMessage('This username is already used by a staff account.');
        return false;
    }

    const externalFollowUpParsed = parseStudentExternalFollowUpLinkInput(String(studentData?.externalFollowUpLink ?? '').trim());
    if (externalFollowUpParsed.error) {
        showAppMessage(externalFollowUpParsed.error);
        return false;
    }

    const rosterKey = rosterKindFromSchoolName(schoolName);
    const roster = rosterKey === 'passport'
        ? passportStudentsList
        : (rosterKey === 'speakon' ? speakonStudentsList : privateStudentsList);
    roster.push(fullName);
    roster.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    studentSchoolByName[fullName] = schoolName;

    saveStudentTeacherInfo(fullName, resolveMentorTeacherForNewStudent(mentorPick));

    const phoneIso = String(studentData?.phoneCountry?.flag || DEFAULT_PHONE_COUNTRY_ISO).trim().toUpperCase();
    saveStudentPhoneInfo(fullName, phoneIso, studentData?.phoneNumber || '');
    saveStudentAccountExtras(fullName, {
        username,
        password,
        birthDate,
        age,
        level,
        externalFollowUpLink: externalFollowUpParsed.href
    });
    if (!teacherSchedules[fullName]) {
        teacherSchedules[fullName] = {};
    }
    saveRoster();
    saveAllSchedulesLocal();
    saveAllSchedules();
    renderSidebar();
    selectTeacher(fullName, { view: 'classReport' });
    return true;
}

window.createStudentFromModernModal = createStudentFromModernModal;

function populateAddStudentPhoneCountrySelect() {
    ensurePhoneResidenceCountryDatalist();
    const countryOptions = getPreferredStudentPhoneCountryOptions();
    const selects = [
        document.getElementById('addStudentPhoneCountry'),
        document.getElementById('addTeacherPhoneCountry')
    ].filter(Boolean);
    if (selects.length === 0) return;

    selects.forEach((countrySelect) => {
        if (countrySelect.options.length > 0) return;
        countryOptions.forEach((country) => {
            const option = document.createElement('option');
            option.value = country.iso;
            option.textContent = country.flag;
            option.dataset.dialCode = country.dialCode;
            option.dataset.sample = country.sample;
            option.dataset.flagUrl = getPhoneCountryFlagImageSrc(country.iso);
            countrySelect.appendChild(option);
        });
        countrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
        setPhoneCountrySelectInteraction(countrySelect, true);
    });
}

function updateAddStudentPhonePlaceholder() {
    const countrySelect = document.getElementById('addStudentPhoneCountry');
    const phoneInput = document.getElementById('addStudentPhone');
    const flagImg = document.getElementById('addStudentPhoneCountryFlag');
    const dialCodeEl = document.getElementById('addStudentPhoneDialCode');
    if (!countrySelect || !phoneInput) return;

    const selected = getPhoneCountryByIso(countrySelect.value);
    if (!selected) return;
    phoneInput.placeholder = selected.sample;
    if (flagImg) {
        const flagUrl = getPhoneCountryFlagImageSrc(selected.iso);
        flagImg.src = flagUrl;
        flagImg.alt = `${selected.name} flag`;
        flagImg.onerror = null;
    }
    if (dialCodeEl) {
        dialCodeEl.textContent = selected.dialCode;
    }
    syncResidenceCountryInputToDialCode(document.getElementById('addStudentCountry'), countrySelect);
}

function populateEditStudentPhoneCountrySelect() {
    ensurePhoneResidenceCountryDatalist();
    const countryOptions = getPreferredStudentPhoneCountryOptions();
    const countrySelect = document.getElementById('editStudentPhoneCountry');
    if (!countrySelect) return;
    if (countrySelect.options.length > 0) return;

    countryOptions.forEach((country) => {
        const option = document.createElement('option');
        option.value = country.iso;
        option.textContent = country.flag;
        option.dataset.dialCode = country.dialCode;
        option.dataset.sample = country.sample;
        option.dataset.flagUrl = getPhoneCountryFlagImageSrc(country.iso);
        countrySelect.appendChild(option);
    });

    countrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
    setPhoneCountrySelectInteraction(countrySelect, true);
}

function updateEditStudentPhonePlaceholder() {
    const countrySelect = document.getElementById('editStudentPhoneCountry');
    const phoneInput = document.getElementById('editStudentPhone');
    const flagImg = document.getElementById('editStudentPhoneCountryFlag');
    const dialCodeEl = document.getElementById('editStudentPhoneDialCode');
    const countryInput = document.getElementById('editStudentCountry');
    if (!countrySelect || !phoneInput) return;

    const selected = getPhoneCountryByIso(countrySelect.value);
    if (!selected) return;
    phoneInput.placeholder = selected.sample;
    if (flagImg) {
        const flagUrl = getPhoneCountryFlagImageSrc(selected.iso);
        flagImg.src = flagUrl;
        flagImg.alt = `${selected.name} flag`;
        flagImg.onerror = null;
    }
    if (dialCodeEl) {
        dialCodeEl.textContent = selected.dialCode;
    }
    syncResidenceCountryInputToDialCode(countryInput, countrySelect);
}

function closeEditStudentCountryPickerMenu() {
    const menu = document.getElementById('editStudentCountryPickerMenu');
    const trigger = document.getElementById('editStudentCountryDisplay');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function bindEditStudentCountryPicker() {
    const trigger = document.getElementById('editStudentCountryDisplay');
    const menu = document.getElementById('editStudentCountryPickerMenu');
    const countrySelect = document.getElementById('editStudentPhoneCountry');
    const phoneInput = document.getElementById('editStudentPhone');
    if (!trigger || !menu || !countrySelect || !phoneInput) return;
    if (trigger.dataset.countryPickerBound === '1') return;
    trigger.dataset.countryPickerBound = '1';

    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const willOpen = menu.hidden;
        closeEditStudentCountryPickerMenu();
        if (willOpen) {
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
        }
    });

    menu.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('.country-picker-option') : null;
        if (!target) return;
        const iso = String(target.getAttribute('data-country-iso') || '').trim().toUpperCase();
        if (!iso || !PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso)) return;
        countrySelect.value = iso;
        phoneInput.dataset.phoneAllowNanpChoice = (iso === 'US' || iso === 'CA') ? '1' : '0';
        handleEditStudentPhoneCountryChanged();
        closeEditStudentCountryPickerMenu();
        phoneInput.focus();
    });
}

function handleAddStudentPhoneCountryChanged() {
    updateAddStudentPhonePlaceholder();
    syncPhoneInputWithCountrySelector(
        document.getElementById('addStudentPhone'),
        document.getElementById('addStudentPhoneCountry')
    );
}

function updateAddTeacherPhonePlaceholder() {
    const countrySelect = document.getElementById('addTeacherPhoneCountry');
    const phoneInput = document.getElementById('addTeacherPhone');
    const flagImg = document.getElementById('addTeacherPhoneCountryFlag');
    const dialCodeEl = document.getElementById('addTeacherPhoneDialCode');
    if (!countrySelect || !phoneInput) return;

    const selected = getPhoneCountryByIso(countrySelect.value);
    if (!selected) return;
    phoneInput.placeholder = selected.sample;
    if (flagImg) {
        const flagUrl = getPhoneCountryFlagImageSrc(selected.iso);
        flagImg.src = flagUrl;
        flagImg.alt = `${selected.name} flag`;
        flagImg.onerror = null;
    }
    if (dialCodeEl) {
        dialCodeEl.textContent = selected.dialCode;
    }
}

function closeAddTeacherCountryPickerMenu() {
    const menu = document.getElementById('addTeacherCountryPickerMenu');
    const trigger = document.getElementById('addTeacherCountryDisplay');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function bindAddTeacherCountryPicker() {
    const trigger = document.getElementById('addTeacherCountryDisplay');
    const menu = document.getElementById('addTeacherCountryPickerMenu');
    const countrySelect = document.getElementById('addTeacherPhoneCountry');
    const phoneInput = document.getElementById('addTeacherPhone');
    if (!trigger || !menu || !countrySelect || !phoneInput) return;
    if (trigger.dataset.countryPickerBound === '1') return;
    trigger.dataset.countryPickerBound = '1';

    trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const willOpen = menu.hidden;
        closeAddTeacherCountryPickerMenu();
        if (willOpen) {
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
        }
    });

    menu.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('.add-teacher-country-picker-option') : null;
        if (!target) return;
        const iso = String(target.getAttribute('data-country-iso') || '').trim().toUpperCase();
        if (!iso || !PHONE_COUNTRY_OPTIONS.some((country) => country.iso === iso)) return;
        countrySelect.value = iso;
        phoneInput.dataset.phoneAllowNanpChoice = (iso === 'US' || iso === 'CA') ? '1' : '0';
        handleAddTeacherPhoneCountryChanged();
        closeAddTeacherCountryPickerMenu();
        phoneInput.focus();
    });
}

function handleAddTeacherPhoneCountryChanged() {
    updateAddTeacherPhonePlaceholder();
    syncPhoneInputWithCountrySelector(
        document.getElementById('addTeacherPhone'),
        document.getElementById('addTeacherPhoneCountry')
    );
}

function handleEditStudentPhoneCountryChanged() {
    updateEditStudentPhonePlaceholder();
    syncPhoneInputWithCountrySelector(
        document.getElementById('editStudentPhone'),
        document.getElementById('editStudentPhoneCountry')
    );
}

function updateAddStudentPassportFieldVisibility() {
    const teacherNameRow = document.getElementById('addTeacherNameRow');
    const teacherHeaderRow = document.getElementById('addTeacherHeaderRow');
    const studentNameRow = document.getElementById('addStudentNameRow');
    const studentHeaderRow = document.getElementById('addStudentHeaderRow');
    const studentFields = document.getElementById('addStudentFields');
    const schoolFields = document.getElementById('addSchoolFields');
    const teacherFields = document.getElementById('addTeacherFields');
    const teacherFirstInput = document.getElementById('addTeacherFirst');
    const teacherLastInput = document.getElementById('addTeacherLast');
    const teacherPhoneInput = document.getElementById('addTeacherPhone');
    const studentFirstInput = document.getElementById('addStudentFirst');
    const studentLastInput = document.getElementById('addStudentLast');
    const studentPhoneInput = document.getElementById('addStudentPhone');
    const schoolWrap = document.getElementById('addStudentGroupWrap');
    const cityInput = document.getElementById('addStudentCity');
    const countryInput = document.getElementById('addStudentCountry');
    const teacherContactRow = document.getElementById('addTeacherContactRow');
    const studentContactRow = document.getElementById('addStudentContactRow');
    const contactCityWrap = document.getElementById('addStudentContactCityWrap');
    const contactCountryWrap = document.getElementById('addStudentContactCountryWrap');
    const accountWrap = document.getElementById('addStudentAccountWrap');
    const studentEmailInput = document.getElementById('addStudentEmail');
    const studentUsernameInput = document.getElementById('addStudentUsername');
    const studentPasswordInput = document.getElementById('addStudentPassword');
    const schoolInput = document.getElementById('addSchoolNameInput');
    const schoolSelect = document.getElementById('addStudentGroupSelect');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    const teacherPhoneCountrySelect = document.getElementById('addTeacherPhoneCountry');
    const teacherEmailWrap = document.getElementById('addTeacherEmailWrap');
    const teacherEmailInput = document.getElementById('addTeacherEmail');
    const teacherPasswordInput = document.getElementById('addTeacherPassword');
    const passportLinkWrap = document.getElementById('addStudentPassportLinkWrap');
    const passportLinkInput = document.getElementById('addStudentPassportLink');
    const teacherWrap = document.getElementById('addStudentMentorWrap');
    const teacherSelect = document.getElementById('addStudentMentor');
    const addStudentMentorRow = document.getElementById('addStudentMentorRow');
    const schoolReadonlyWrap = document.getElementById('addStudentSchoolReadonlyWrap');
    const schoolReadonlyText = document.getElementById('addStudentSchoolReadonly');
    const schoolFieldLabel = document.querySelector('.add-student-group-field-label');
    const addSchoolExternalWrap = document.getElementById('addSchoolExternalWrap');
    const addSchoolBillingModel = document.getElementById('addSchoolBillingModel');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const dialog = getAddModalDialogEl();
    const submitBtn = document.getElementById('addStudentFormSubmit');
    if (!dialog || !schoolInput || !schoolSelect) return;

    const isTeacherMode = addModalMode === 'teacher';
    const isStudentEntryMode = addModalMode === 'student-entry';
    const isStudentGlobalMode = addModalMode === 'student-global';
    const isAddSchoolMode = addModalMode === 'school';
    const showStudentFields = isStudentEntryMode || isStudentGlobalMode;
    const useNameFields = isTeacherMode || isStudentEntryMode;
    const useNameFieldsAny = useNameFields || isStudentGlobalMode;
    const modal = document.getElementById('addModal');

    if (modal) {
        modal.classList.toggle('add-modal--student', showStudentFields);
        modal.classList.toggle('add-modal--teacher', isTeacherMode);
        modal.classList.toggle('add-modal--school', isAddSchoolMode);
    }

    if (teacherContactRow) {
        teacherContactRow.classList.toggle('is-hidden', !isTeacherMode);
        teacherContactRow.setAttribute('aria-hidden', isTeacherMode ? 'false' : 'true');
    }

    if (studentContactRow) {
        studentContactRow.classList.toggle('is-hidden', !showStudentFields);
        studentContactRow.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (studentHeaderRow) {
        studentHeaderRow.classList.toggle('is-hidden', !showStudentFields);
        studentHeaderRow.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (teacherHeaderRow) {
        teacherHeaderRow.classList.toggle('is-hidden', !isTeacherMode);
        teacherHeaderRow.setAttribute('aria-hidden', isTeacherMode ? 'false' : 'true');
    }
    if (teacherFields) {
        teacherFields.classList.toggle('is-hidden', !isTeacherMode);
        teacherFields.setAttribute('aria-hidden', isTeacherMode ? 'false' : 'true');
    }
    if (contactCityWrap) {
        contactCityWrap.classList.toggle('is-hidden', !showStudentFields);
        contactCityWrap.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (contactCountryWrap) {
        contactCountryWrap.classList.toggle('is-hidden', !showStudentFields);
        contactCountryWrap.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (accountWrap) {
        accountWrap.classList.toggle('is-hidden', !showStudentFields);
        accountWrap.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (!showStudentFields) {
        if (studentEmailInput) studentEmailInput.value = '';
        if (studentUsernameInput) studentUsernameInput.value = buildDefaultStudentUsername('', '');
        if (studentPasswordInput) {
            studentPasswordInput.value = '';
        }
        if (cityInput) cityInput.value = '';
        if (countryInput) countryInput.value = '';
    }

    if (studentFields) {
        studentFields.classList.toggle('is-hidden', !showStudentFields);
        studentFields.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
    }
    if (schoolFields) {
        schoolFields.classList.toggle('is-hidden', !isAddSchoolMode);
        schoolFields.setAttribute('aria-hidden', isAddSchoolMode ? 'false' : 'true');
    }

    const showStudentTeacherField = isStudentEntryMode || isStudentGlobalMode;
    if (teacherWrap && teacherSelect) {
        teacherWrap.classList.toggle('is-hidden', !showStudentTeacherField);
        teacherWrap.setAttribute('aria-hidden', showStudentTeacherField ? 'false' : 'true');
        if (showStudentTeacherField) {
            refreshAddStudentTeacherSelect(teacherSelect.value);
        } else {
            teacherSelect.value = '';
        }
    }
    if (addStudentMentorRow) {
        addStudentMentorRow.classList.toggle('is-hidden', isTeacherMode);
        addStudentMentorRow.setAttribute('aria-hidden', isTeacherMode ? 'true' : 'false');
    }
    if (teacherNameRow && teacherFirstInput && teacherLastInput) {
        teacherNameRow.classList.toggle('is-hidden', !isTeacherMode);
        teacherNameRow.setAttribute('aria-hidden', isTeacherMode ? 'false' : 'true');
        teacherFirstInput.required = isTeacherMode;
        teacherLastInput.required = isTeacherMode;
        if (teacherPhoneInput) teacherPhoneInput.required = isTeacherMode;
        if (!isTeacherMode) {
            teacherFirstInput.value = '';
            teacherLastInput.value = '';
            if (teacherPhoneInput) teacherPhoneInput.value = '';
            if (teacherPhoneCountrySelect) {
                teacherPhoneCountrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
                updateAddTeacherPhonePlaceholder();
            }
        }
    }
    if (studentNameRow && studentFirstInput && studentLastInput) {
        studentNameRow.classList.toggle('is-hidden', !showStudentFields);
        studentNameRow.setAttribute('aria-hidden', showStudentFields ? 'false' : 'true');
        studentFirstInput.required = showStudentFields;
        studentLastInput.required = showStudentFields;
        if (!showStudentFields) {
            studentFirstInput.value = '';
            studentLastInput.value = '';
            if (studentPhoneInput) studentPhoneInput.value = '';
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
    const showLocationRow = isStudentGlobalMode;
    if (schoolWrap) {
        schoolWrap.classList.toggle('is-hidden', !showLocationRow);
        schoolWrap.setAttribute('aria-hidden', showLocationRow ? 'false' : 'true');
    }
    if (!showLocationRow) {
        if (schoolReadonlyWrap) {
            schoolReadonlyWrap.classList.add('is-hidden');
            schoolReadonlyWrap.setAttribute('aria-hidden', 'true');
        }
        if (schoolReadonlyText) schoolReadonlyText.textContent = '';
    }

    const useSchoolSelect = isStudentGlobalMode;
    const showSchoolReadonly = isStudentEntryMode;

    if (schoolReadonlyWrap && schoolReadonlyText) {
        if (showSchoolReadonly && addStudentTargetSchool) {
            schoolReadonlyText.textContent = addStudentTargetSchool;
            schoolReadonlyWrap.classList.remove('is-hidden');
            schoolReadonlyWrap.setAttribute('aria-hidden', 'false');
        } else {
            schoolReadonlyWrap.classList.add('is-hidden');
            schoolReadonlyWrap.setAttribute('aria-hidden', 'true');
            schoolReadonlyText.textContent = '';
        }
    }
    if (schoolFieldLabel) {
        schoolFieldLabel.classList.toggle('is-hidden', showSchoolReadonly);
        schoolFieldLabel.setAttribute('aria-hidden', showSchoolReadonly ? 'true' : 'false');
    }

    if (schoolInput) {
        schoolInput.required = isAddSchoolMode;
        schoolInput.classList.toggle('is-hidden', !isAddSchoolMode);
        schoolInput.setAttribute('aria-hidden', isAddSchoolMode ? 'false' : 'true');
        if (!isAddSchoolMode) schoolInput.value = '';
    }
    if (schoolSelect) {
        schoolSelect.classList.toggle('is-hidden', !useSchoolSelect);
        schoolSelect.setAttribute('aria-hidden', useSchoolSelect ? 'false' : 'true');
        schoolSelect.required = useSchoolSelect;
        if (!useSchoolSelect) {
            schoolSelect.value = '';
        } else {
            refreshAddStudentSchoolSelect(schoolSelect.value);
            syncAddStudentModalThemeFromSchoolTitle(schoolSelect.value);
        }
    }

    if (isStudentEntryMode && addStudentTargetSchool) {
        syncAddStudentModalThemeFromSchoolTitle(addStudentTargetSchool);
    }

    if (addSchoolExternalWrap) {
        addSchoolExternalWrap.classList.toggle('is-hidden', !isAddSchoolMode);
        addSchoolExternalWrap.setAttribute('aria-hidden', isAddSchoolMode ? 'false' : 'true');
    }
    if (!isAddSchoolMode) {
        if (addSchoolExternalCheckbox) addSchoolExternalCheckbox.checked = false;
        if (addSchoolExternalPanel) {
            addSchoolExternalPanel.classList.add('is-collapsed');
            addSchoolExternalPanel.setAttribute('aria-hidden', 'true');
        }
        if (addSchoolExternalUrl) addSchoolExternalUrl.value = '';
        if (addSchoolBillingModel) {
            addSchoolBillingModel.value = '';
            addSchoolBillingModel.required = false;
        }
        closeAddSchoolColorPopup();
        updateAddSchoolBillingExplainer();
    }
    if (isAddSchoolMode && addSchoolBillingModel) {
        addSchoolBillingModel.required = true;
    }

    if (passportLinkWrap && passportLinkInput) {
        const showPassportLink = showStudentFields;
        passportLinkWrap.classList.toggle('is-visible', showPassportLink);
        passportLinkWrap.setAttribute('aria-hidden', showPassportLink ? 'false' : 'true');
        passportLinkInput.required = false;
        if (!showPassportLink) {
            passportLinkInput.value = '';
        }
    }
    dialog.classList.toggle('add-modal-dialog--expanded', isTeacherMode);

    if (submitBtn) {
        submitBtn.textContent = isTeacherMode ? 'Add teacher' : ((isStudentEntryMode || isStudentGlobalMode) ? 'Add student' : 'Add school');
    }
    if (phoneCountrySelect && useNameFieldsAny) {
        updateAddStudentPhonePlaceholder();
    }
    renderAddSchoolThemeSquares();
    updateAddSchoolBillingExplainer();
}

function openAddStudentModal(mode = 'school') {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot manage roster records.');
        return;
    }
    ensureAddPopupProvidersRendered();
    populateAddStudentPhoneCountrySelect();
    const modal = document.getElementById('addModal');
    const teacherFirstInput = document.getElementById('addTeacherFirst');
    const teacherLastInput = document.getElementById('addTeacherLast');
    const teacherPhoneInput = document.getElementById('addTeacherPhone');
    const studentFirstInput = document.getElementById('addStudentFirst');
    const studentLastInput = document.getElementById('addStudentLast');
    const studentPhoneInput = document.getElementById('addStudentPhone');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    const teacherPhoneCountrySelect = document.getElementById('addTeacherPhoneCountry');
    const schoolInput = document.getElementById('addSchoolNameInput');
    const schoolSelect = document.getElementById('addStudentGroupSelect');
    const cityInput = document.getElementById('addStudentCity');
    const countryInput = document.getElementById('addStudentCountry');
    const studentPasswordInput = document.getElementById('addStudentPassword');
    const passportLinkInput = document.getElementById('addStudentPassportLink');
    const teacherEmailInput = document.getElementById('addTeacherEmail');
    const teacherPasswordInput = document.getElementById('addTeacherPassword');
    const teacherPasswordGenerateBtn = document.getElementById('addTeacherPasswordGenerate');
    const teacherPasswordToggleBtn = document.getElementById('addTeacherPasswordToggle');
    const studentUsernameInput = document.getElementById('addStudentUsername');
    const studentPasswordGenerateBtn = document.getElementById('addStudentPasswordGenerate');
    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const addSchoolBillingModel = document.getElementById('addSchoolBillingModel');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    if (!modal || !schoolInput) {
        return;
    }
    bindAddStudentUsernameAutoSync(studentFirstInput, studentLastInput, studentUsernameInput);
    bindPhoneInputAutoCountry(studentPhoneInput, phoneCountrySelect, updateAddStudentPhonePlaceholder);
    bindPhoneInputAutoCountry(teacherPhoneInput, teacherPhoneCountrySelect, updateAddTeacherPhonePlaceholder);
    bindAddTeacherCountryPicker();
    bindPlatePasswordGenerateButton(teacherPasswordGenerateBtn, teacherPasswordInput);
    bindPlatePasswordGenerateButton(studentPasswordGenerateBtn, studentPasswordInput);

    const normalizedMode = getCanonicalAddModalMode(mode);
    const preservedEntrySchool = normalizedMode === 'student-entry' ? String(addStudentTargetSchool || '').trim() : '';
    addModalMode =
        normalizedMode === 'teacher'
            ? 'teacher'
            : (normalizedMode === 'student-entry' ? 'student-entry' : (normalizedMode === 'student-global' ? 'student-global' : 'school'));
    addStudentTargetSchool = addModalMode === 'student-entry' ? preservedEntrySchool : '';
    if (addModalMode === 'teacher' && (!teacherFirstInput || !teacherLastInput)) {
        return;
    }
    if (teacherFirstInput) teacherFirstInput.value = '';
    if (teacherLastInput) teacherLastInput.value = '';
    if (studentFirstInput) studentFirstInput.value = '';
    if (studentLastInput) studentLastInput.value = '';
    if (studentPhoneInput) studentPhoneInput.value = '';
    if (teacherPhoneInput) teacherPhoneInput.value = '';
    if (phoneCountrySelect) phoneCountrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
    if (teacherPhoneCountrySelect) teacherPhoneCountrySelect.value = DEFAULT_PHONE_COUNTRY_ISO;
    updateAddStudentPhonePlaceholder();
    updateAddTeacherPhonePlaceholder();
    const addTeacherSelect = document.getElementById('addStudentMentor');
    if (addTeacherSelect) {
        refreshAddStudentTeacherSelect('');
    }
    schoolInput.value = '';
    if (cityInput) cityInput.value = '';
    if (countryInput) {
        countryInput.value = '';
        resetPhoneCountryDialSyncState(countryInput);
    }
    const addTeacherCityInput = document.getElementById('addTeacherCity');
    if (addTeacherCityInput) addTeacherCityInput.value = '';
    const studentEmailInput = document.getElementById('addStudentEmail');
    if (studentEmailInput) studentEmailInput.value = '';
    if (studentUsernameInput) studentUsernameInput.value = buildDefaultStudentUsername('', '');
    if (studentPasswordInput) {
        studentPasswordInput.value = '';
    }
    if (schoolSelect) {
        refreshAddStudentSchoolSelect();
        schoolSelect.value = '';
    }
    if (passportLinkInput) passportLinkInput.value = '';
    if (teacherEmailInput) teacherEmailInput.value = '';
    if (teacherPasswordInput) {
        teacherPasswordInput.value = '';
        teacherPasswordInput.type = 'text';
        setPasswordToggleVisual(teacherPasswordInput, teacherPasswordToggleBtn);
    }
    const teacherTeachingTypeInput = document.getElementById('addTeacherTeachingType');
    if (teacherTeachingTypeInput) teacherTeachingTypeInput.value = 'both';
    document.querySelectorAll('.add-teacher-segmented .add-teacher-segmented-btn').forEach((btn) => {
        const isBoth = String(btn.getAttribute('data-teaching-type') || '').trim() === 'both';
        btn.classList.toggle('is-active', isBoth);
        btn.setAttribute('aria-pressed', isBoth ? 'true' : 'false');
    });
    const teacherPhotoInput = document.getElementById('addTeacherPhotoInput');
    if (teacherPhotoInput) teacherPhotoInput.value = '';
    const teacherUploadMain = document.getElementById('addTeacherUploadMain');
    const teacherUploadSub = document.getElementById('addTeacherUploadSub');
    if (teacherUploadMain) teacherUploadMain.textContent = 'Click to upload';
    if (teacherUploadSub) teacherUploadSub.textContent = 'JPG, PNG up to 2MB';
    if (addSchoolExternalCheckbox) addSchoolExternalCheckbox.checked = false;
    if (addSchoolExternalPanel) {
        addSchoolExternalPanel.classList.add('is-collapsed');
        addSchoolExternalPanel.setAttribute('aria-hidden', 'true');
    }
    if (addSchoolExternalUrl) addSchoolExternalUrl.value = '';
    if (addSchoolBillingModel) addSchoolBillingModel.value = '';
    if (addSchoolPrimaryColor) addSchoolPrimaryColor.value = '#5c6bc0';
    if (addSchoolSecondaryColor) addSchoolSecondaryColor.value = '#1e88e5';
    renderAddSchoolThemeSquares();
    updateAddSchoolBillingExplainer();
    closeAddSchoolColorPopup();
    updateAddStudentPhonePlaceholder();
    updateAddTeacherPhonePlaceholder();
    syncStudentUsernameFromNameFields(studentFirstInput, studentLastInput, studentUsernameInput);
    updateAddStudentPassportFieldVisibility();

    openModalWithAnimation(modal);
    if (addModalMode === 'teacher' && teacherFirstInput) {
        teacherFirstInput.focus();
    } else if ((addModalMode === 'student-entry' || addModalMode === 'student-global') && studentFirstInput) {
        studentFirstInput.focus();
    } else {
        if (addModalMode === 'student-global') {
            schoolSelect?.focus();
        } else {
            schoolInput.focus();
        }
    }
}

window.requestAddPopupMode = (mode) => {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot manage roster records.');
        return;
    }
    openAddStudentModal(mode);
};

function openAddStudentModalForSchool(schoolTitle) {
    if (!canManageRoster()) {
        denyStudentAction('Permission denied: students cannot add student profiles.');
        return;
    }
    const school = String(schoolTitle || '').trim();
    if (!school) return;
    addStudentTargetSchool = school;
    openAddStudentModal('student-entry');
}

function getStudentNamesForSchool(schoolTitle) {
    const schoolKey = String(schoolTitle || '').trim().toLowerCase();
    if (!schoolKey) return [];
    let names = [...privateStudentsList, ...speakonStudentsList, ...passportStudentsList]
        .filter((name) => (getStudentSchoolName(name) || '').trim().toLowerCase() === schoolKey)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const asStudent = String(loggedInStudentFullName || '').trim();
    if (asStudent) {
        const me = asStudent.toLowerCase();
        names = names.filter((n) => n.trim().toLowerCase() === me);
    }
    return names;
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

function closeGoogleMeetStudentLinkPopover(immediate = false) {
    googleMeetLinkPopoverStudent = '';
    const pop = document.getElementById('googleMeetStudentLinkPopover');
    if (!pop) return;
    const finishHidden = () => {
        pop.hidden = true;
        pop.setAttribute('aria-hidden', 'true');
        pop.classList.remove('google-meet-student-link-popover--leave');
        googleMeetStudentLinkPopoverHideTimer = null;
    };
    if (googleMeetStudentLinkPopoverHideTimer) {
        clearTimeout(googleMeetStudentLinkPopoverHideTimer);
        googleMeetStudentLinkPopoverHideTimer = null;
    }
    pop.classList.remove('google-meet-student-link-popover--enter');
    if (immediate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        finishHidden();
        return;
    }
    if (!pop.hidden) {
        pop.classList.add('google-meet-student-link-popover--leave');
        googleMeetStudentLinkPopoverHideTimer = window.setTimeout(finishHidden, MODAL_CLOSE_ANIMATION_MS);
    } else {
        finishHidden();
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
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot manage Google Meet links.');
        return;
    }
    closeGoogleMeetStudentLinkPopover(true);
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
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot manage Google Meet links.');
        return;
    }
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

function openGoogleMeetLinksLayer() {
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot manage Google Meet links.');
        return;
    }
    const layer = document.getElementById('googleMeetLinksLayer');
    if (!layer) return;
    updateGoogleMeetLinksPopupStats();
    renderGoogleMeetLinksStudentsRows();
    if (googleMeetLinksLayerHideTimer) {
        window.clearTimeout(googleMeetLinksLayerHideTimer);
        googleMeetLinksLayerHideTimer = null;
    }
    const popup = layer.querySelector('.google-meet-popup');
    const backdrop = layer.querySelector('.google-meet-links-layer-backdrop');
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
    if (popup) {
        popup.classList.remove('google-meet-popup--leave');
        popup.classList.remove('google-meet-popup--enter');
        void popup.offsetWidth;
        popup.classList.add('google-meet-popup--enter');
    }
    if (backdrop) {
        backdrop.classList.remove('google-meet-links-layer-backdrop--leave');
        backdrop.classList.remove('google-meet-links-layer-backdrop--enter');
        void backdrop.offsetWidth;
        backdrop.classList.add('google-meet-links-layer-backdrop--enter');
    }
}

function closeGoogleMeetLinksLayer() {
    const layer = document.getElementById('googleMeetLinksLayer');
    if (!layer) return;
    const popup = layer.querySelector('.google-meet-popup');
    const backdrop = layer.querySelector('.google-meet-links-layer-backdrop');
    if (popup) {
        popup.classList.remove('google-meet-popup--enter');
        popup.classList.add('google-meet-popup--leave');
    }
    if (backdrop) {
        backdrop.classList.remove('google-meet-links-layer-backdrop--enter');
        backdrop.classList.add('google-meet-links-layer-backdrop--leave');
    }
    if (googleMeetLinksLayerHideTimer) {
        window.clearTimeout(googleMeetLinksLayerHideTimer);
    }
    closeGoogleMeetAddLinkDialog();
    googleMeetLinksLayerHideTimer = window.setTimeout(() => {
        layer.hidden = true;
        layer.setAttribute('aria-hidden', 'true');
        popup?.classList.remove('google-meet-popup--leave');
        backdrop?.classList.remove('google-meet-links-layer-backdrop--leave');
        googleMeetLinksLayerHideTimer = null;
    }, 240);
}

function updateGoogleMeetLinksPopupStats() {
    const totalStudentsEl = document.querySelector('.google-meet-popup .card-total-students .meet-stat-value');
    const savedEl = document.querySelector('.google-meet-popup .card-links-saved .meet-stat-value');
    const savedSubEl = document.querySelector('.google-meet-popup .card-links-saved .meet-stat-sub');
    const missingEl = document.querySelector('.google-meet-popup .card-links-missing .meet-stat-value');
    const missingSubEl = document.querySelector('.google-meet-popup .card-links-missing .meet-stat-sub');
    const sharedEl = document.querySelector('.google-meet-popup .card-invalid-links .meet-stat-value');
    const sharedSubEl = document.querySelector('.google-meet-popup .card-invalid-links .meet-stat-sub');
    if (!totalStudentsEl) return;
    const registeredNames = getAllRosterStudentNamesSorted();
    const total = registeredNames.length;
    let saved = 0;
    const validLinkBuckets = new Map();
    registeredNames.forEach((name) => {
        const rawLink = getGoogleMeetLinkForStudent(name);
        if (!rawLink) return;
        if (!isPlausibleGoogleMeetUrl(rawLink)) return;
        saved += 1;
        const normalized = normalizeGoogleMeetUrl(rawLink).toLowerCase();
        validLinkBuckets.set(normalized, (validLinkBuckets.get(normalized) || 0) + 1);
    });
    let sharedStudents = 0;
    validLinkBuckets.forEach((count) => {
        if (count > 1) sharedStudents += count;
    });
    const missing = Math.max(0, total - saved);
    const savedPct = total > 0 ? Math.round((saved / total) * 100) : 0;
    totalStudentsEl.textContent = String(total);
    if (savedEl) savedEl.textContent = String(saved);
    if (savedSubEl) savedSubEl.textContent = `${savedPct}% of students`;
    if (missingEl) missingEl.textContent = String(missing);
    if (missingSubEl) missingSubEl.textContent = missing > 0 ? 'Needs attention' : 'All set';
    if (sharedEl) sharedEl.textContent = String(sharedStudents);
    if (sharedSubEl) sharedSubEl.textContent = 'Students sharing the same link';
}

function getGoogleMeetLinkForStudent(studentName) {
    const exact = String(studentGoogleMeetLinksByName[studentName] || '').trim();
    if (exact) return exact;
    const target = String(studentName || '').trim().toLowerCase();
    if (!target) return '';
    for (const [name, link] of Object.entries(studentGoogleMeetLinksByName)) {
        if (String(name || '').trim().toLowerCase() === target) {
            return String(link || '').trim();
        }
    }
    return '';
}

function removeGoogleMeetLinkForStudent(studentName) {
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot remove Google Meet links.');
        return;
    }
    const target = String(studentName || '').trim().toLowerCase();
    if (!target) return;
    delete studentGoogleMeetLinksByName[studentName];
    for (const key of Object.keys(studentGoogleMeetLinksByName)) {
        if (String(key || '').trim().toLowerCase() === target) {
            delete studentGoogleMeetLinksByName[key];
        }
    }
}

function getGoogleMeetLinkStateForStudent(studentName) {
    const rawLink = getGoogleMeetLinkForStudent(studentName);
    const hasLink = !!rawLink;
    const isValidLink = hasLink && isPlausibleGoogleMeetUrl(rawLink);
    const state = isValidLink ? 'saved' : (hasLink ? 'invalid' : 'missing');
    return { state, rawLink, hasLink, isValidLink };
}

function buildGoogleMeetStudentId(studentName) {
    return `student-${encodeURIComponent(String(studentName || '').trim().toLowerCase())}`;
}

function getGoogleMeetStudentNameFromId(studentId) {
    const id = String(studentId || '').trim();
    if (!id) return '';
    return String(googleMeetLinksStudentNameById[id] || '').trim();
}

function closeGoogleMeetAddLinkDialog() {
    const dialog = document.getElementById('googleMeetLinksAddDialog');
    if (googleMeetLinksAddDialogHideTimer) {
        clearTimeout(googleMeetLinksAddDialogHideTimer);
        googleMeetLinksAddDialogHideTimer = null;
    }
    if (dialog && !dialog.hidden) {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            dialog.classList.remove('meet-links-add-dialog--enter', 'meet-links-add-dialog--leave');
            dialog.hidden = true;
            dialog.setAttribute('aria-hidden', 'true');
        } else {
            dialog.classList.remove('meet-links-add-dialog--enter');
            dialog.classList.add('meet-links-add-dialog--leave');
            googleMeetLinksAddDialogHideTimer = window.setTimeout(() => {
                dialog.classList.remove('meet-links-add-dialog--leave');
                dialog.hidden = true;
                dialog.setAttribute('aria-hidden', 'true');
                googleMeetLinksAddDialogHideTimer = null;
            }, 170);
        }
    }
    googleMeetLinksAddDialogStudentId = '';
    googleMeetLinksAddDialogAnchor = null;
}

function ensureGoogleMeetAddLinkDialog() {
    let dialog = document.getElementById('googleMeetLinksAddDialog');
    const layer = document.getElementById('googleMeetLinksLayer');
    const host = layer || document.body;
    if (dialog) {
        if (dialog.parentElement !== host) {
            host.appendChild(dialog);
        }
        return dialog;
    }
    dialog = document.createElement('div');
    dialog.id = 'googleMeetLinksAddDialog';
    dialog.className = 'meet-links-add-dialog';
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'false');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.innerHTML = `
        <p class="meet-links-add-dialog-title">Paste Google Meet link</p>
        <label class="meet-links-add-dialog-field">
            <input type="url" class="meet-links-add-dialog-input" placeholder="https://meet.google.com/..." autocomplete="off" />
        </label>
        <div class="meet-links-add-dialog-actions">
            <button type="button" class="meet-links-add-dialog-btn meet-links-add-dialog-btn--cancel">Cancel</button>
            <button type="button" class="meet-links-add-dialog-btn meet-links-add-dialog-btn--save"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM565-275q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg><span>Save</span></button>
        </div>
    `;
    dialog.addEventListener('click', (e) => e.stopPropagation());
    host.appendChild(dialog);
    return dialog;
}

function positionGoogleMeetAddLinkDialog(dialog, x, y) {
    if (!dialog) return;
    const viewportPad = 8;
    const offset = 8;
    dialog.style.position = 'fixed';
    dialog.style.left = `${Math.round(x + offset)}px`;
    dialog.style.top = `${Math.round(y + offset)}px`;
    const width = dialog.offsetWidth || 280;
    const height = dialog.offsetHeight || 152;
    const maxLeft = Math.max(viewportPad, window.innerWidth - width - viewportPad);
    const maxTop = Math.max(viewportPad, window.innerHeight - height - viewportPad);
    const left = Math.min(Math.max(viewportPad, x + offset), maxLeft);
    const top = Math.min(Math.max(viewportPad, y + offset), maxTop);
    dialog.style.left = `${Math.round(left)}px`;
    dialog.style.top = `${Math.round(top)}px`;
}

function openGoogleMeetAddLinkDialog(event, studentId, anchorButton, initialLink = '') {
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot manage Google Meet links.');
        return;
    }
    const dialog = ensureGoogleMeetAddLinkDialog();
    const input = dialog.querySelector('.meet-links-add-dialog-input');
    if (!input) return;
    closeGoogleMeetAddLinkDialog();
    googleMeetLinksAddDialogStudentId = String(studentId || '').trim();
    googleMeetLinksAddDialogAnchor = anchorButton || null;
    const studentName = getGoogleMeetStudentNameFromId(googleMeetLinksAddDialogStudentId);
    if (!studentName) return;
    input.value = String(initialLink || '').trim();
    input.setAttribute('aria-label', `Google Meet link for ${studentName}`);
    if (googleMeetLinksAddDialogHideTimer) {
        clearTimeout(googleMeetLinksAddDialogHideTimer);
        googleMeetLinksAddDialogHideTimer = null;
    }
    dialog.classList.remove('meet-links-add-dialog--leave', 'meet-links-add-dialog--enter');
    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');
    positionGoogleMeetAddLinkDialog(dialog, event.clientX, event.clientY);
    requestAnimationFrame(() => {
        positionGoogleMeetAddLinkDialog(dialog, event.clientX, event.clientY);
        if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            dialog.classList.add('meet-links-add-dialog--enter');
        }
        input.focus();
        if (input.value && typeof input.select === 'function') {
            input.select();
        }
    });
}

function getVisibleMeetLinksRowCheckboxes() {
    return Array.from(document.querySelectorAll('#meetLinksStudentsBody .meet-links-checkbox'));
}

function getSelectedGoogleMeetStudentIds() {
    return getVisibleMeetLinksRowCheckboxes()
        .filter((cb) => cb.checked)
        .map((cb) => String(cb.closest('.meet-links-row')?.dataset.studentId || '').trim())
        .filter(Boolean);
}

function syncMeetLinksBulkRemoveButton() {
    const removeBtn = document.getElementById('meetLinksRemoveSelected');
    if (!removeBtn) return;
    removeBtn.disabled = getSelectedGoogleMeetStudentIds().length === 0;
}

function syncMeetLinksSelectAllCheckbox() {
    const selectAll = document.getElementById('meetLinksSelectAll');
    if (!selectAll) return;
    const rowCheckboxes = getVisibleMeetLinksRowCheckboxes();
    const total = rowCheckboxes.length;
    const checked = rowCheckboxes.filter((cb) => cb.checked).length;
    selectAll.indeterminate = checked > 0 && checked < total;
    selectAll.checked = total > 0 && checked === total;
    syncMeetLinksBulkRemoveButton();
}

function setAllVisibleMeetLinksRowsSelected(checked) {
    getVisibleMeetLinksRowCheckboxes().forEach((cb) => {
        cb.checked = !!checked;
    });
    syncMeetLinksSelectAllCheckbox();
}

function removeGoogleMeetLinksForSelectedStudents() {
    if (!canEditFeed()) {
        denyStudentAction('Permission denied: students cannot remove Google Meet links.');
        return 0;
    }
    const selectedIds = getSelectedGoogleMeetStudentIds();
    if (selectedIds.length === 0) return 0;
    let removed = 0;
    selectedIds.forEach((studentId) => {
        const studentName = getGoogleMeetStudentNameFromId(studentId);
        if (!studentName) return;
        const hadLink = !!getGoogleMeetLinkForStudent(studentName);
        if (!hadLink) return;
        removeGoogleMeetLinkForStudent(studentName);
        removed += 1;
    });
    if (removed > 0) {
        saveRoster();
        refreshClassReportAfterMeetLinkChange();
    }
    return removed;
}

function renderGoogleMeetLinksStudentsRows() {
    const layer = document.getElementById('googleMeetLinksLayer');
    const listBody = document.getElementById('meetLinksStudentsBody');
    if (!listBody || !layer) return;
    listBody.innerHTML = '';
    const searchInput = layer.querySelector('.meet-links-search-input');
    const statusSelect = layer.querySelector('.meet-links-status-select');
    const searchTerm = String(searchInput?.value || '').trim().toLowerCase();
    const selectedStatus = String(statusSelect?.value || '').trim().toLowerCase();
    const names = getAllRosterStudentNamesSorted();
    const filteredNames = names.filter((studentName) => {
        const { state } = getGoogleMeetLinkStateForStudent(studentName);
        const matchesSearch = !searchTerm || studentName.toLowerCase().includes(searchTerm);
        const matchesStatus = !selectedStatus || state === selectedStatus;
        return matchesSearch && matchesStatus;
    });
    if (filteredNames.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'meet-links-row';
        empty.innerHTML = `
            <div class="meet-links-cell" style="grid-column: 1 / -1; justify-content: center; color: #8b93a8; font-weight: 600;">
                No students match current filters
            </div>
        `;
        listBody.appendChild(empty);
        syncMeetLinksSelectAllCheckbox();
        return;
    }
    googleMeetLinksStudentNameById = {};
    filteredNames.forEach((studentName) => {
        const { state, rawLink, hasLink, isValidLink } = getGoogleMeetLinkStateForStudent(studentName);
        const studentId = buildGoogleMeetStudentId(studentName);
        googleMeetLinksStudentNameById[studentId] = studentName;
        const rowStateClass = state === 'saved' ? 'meet-links-row--saved' : (state === 'invalid' ? 'meet-links-row--invalid' : 'meet-links-row--missing');
        const statusClass = state === 'saved' ? 'meet-links-status--saved' : (state === 'invalid' ? 'meet-links-status--invalid' : 'meet-links-status--missing');
        const statusLabel = state === 'saved' ? 'Saved' : (state === 'invalid' ? 'Invalid' : 'Missing');
        const initials = String(studentName || '')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || '')
            .join('');
        const row = document.createElement('div');
        row.className = `meet-links-row ${rowStateClass}`;
        row.setAttribute('role', 'row');
        const linkMarkup = isValidLink
            ? `
                <span class="meet-links-link-icon" aria-hidden="true">
                    <img src="icon/google-meet.png" alt="Google Meet" />
                </span>
                <span class="meet-links-url">${rawLink}</span>
                <button type="button" class="meet-links-open-external" aria-label="Open Meet in new tab">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
            `
            : (hasLink
                ? `<span class="meet-links-url">${rawLink}</span>`
                : `<button type="button" class="meet-links-add-link-btn" data-student-id="${studentId}">Add link</button>`);
        row.innerHTML = `
            <div class="meet-links-cell meet-links-cell--check">
                <label class="meet-links-checkbox-label">
                    <input type="checkbox" class="meet-links-checkbox" aria-label="Select student" />
                    <span class="meet-links-checkbox-ui" aria-hidden="true"></span>
                </label>
            </div>
            <div class="meet-links-cell meet-links-cell--student">
                <span class="meet-links-avatar" aria-hidden="true">${initials}</span>
                <span class="meet-links-student-name"></span>
            </div>
            <div class="meet-links-cell meet-links-cell--link">
                ${linkMarkup}
            </div>
            <div class="meet-links-cell meet-links-cell--status">
                <span class="meet-links-status ${statusClass}"><span class="meet-links-status-dot"></span>${statusLabel}</span>
            </div>
            <div class="meet-links-cell meet-links-cell--actions">
                <button type="button" class="meet-links-icon-btn meet-links-icon-btn--edit" aria-label="Edit link" data-student-id="${studentId}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button type="button" class="meet-links-icon-btn meet-links-icon-btn--delete" aria-label="Delete link" data-student-id="${studentId}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M19.892 4.09a3.75 3.75 0 0 0-5.303 0l-4.5 4.5c-.074.074-.144.15-.21.229l4.965 4.966a3.75 3.75 0 0 0-1.986-4.428.75.75 0 0 1 .646-1.353 5.253 5.253 0 0 1 2.502 6.944l5.515 5.515a.75.75 0 0 1-1.061 1.06l-18-18.001A.75.75 0 0 1 3.521 2.46l5.294 5.295a5.31 5.31 0 0 1 .213-.227l4.5-4.5a5.25 5.25 0 1 1 7.425 7.425l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.756-1.757a3.75 3.75 0 0 0 0-5.304ZM5.846 11.773a.75.75 0 0 1 0 1.06l-1.757 1.758a3.75 3.75 0 0 0 5.303 5.304l3.129-3.13a.75.75 0 1 1 1.06 1.061l-3.128 3.13a5.25 5.25 0 1 1-7.425-7.426l1.757-1.757a.75.75 0 0 1 1.061 0Zm2.401.26a.75.75 0 0 1 .957.458c.18.512.474.992.885 1.403.31.311.661.555 1.035.733a.75.75 0 0 1-.647 1.354 5.244 5.244 0 0 1-1.449-1.026 5.232 5.232 0 0 1-1.24-1.965.75.75 0 0 1 .46-.957Z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
        row.dataset.studentId = studentId;
        const nameEl = row.querySelector('.meet-links-student-name');
        if (nameEl) nameEl.textContent = studentName;
        const rowCheckbox = row.querySelector('.meet-links-checkbox');
        rowCheckbox?.addEventListener('change', () => syncMeetLinksSelectAllCheckbox());
        const actionCell = row.querySelector('.meet-links-cell--actions');
        const checkboxCell = row.querySelector('.meet-links-cell--check');
        if (!canEditFeed()) {
            actionCell?.remove();
            checkboxCell?.remove();
        }
        listBody.appendChild(row);
    });
    syncMeetLinksSelectAllCheckbox();
}

function closeGoogleMeetModal() {
    const modal = document.getElementById('googleMeetModal');
    if (!modal) {
        return;
    }
    hideGoogleMeetContextMessage(true);
    closeGoogleMeetStudentLinkPopover();
    closeGoogleMeetAddLinkDialog();
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
    const meetLinksLayer = document.getElementById('googleMeetLinksLayer');
    const meetLinksBackdrop = meetLinksLayer?.querySelector('.google-meet-links-layer-backdrop');
    const meetLinksSearch = meetLinksLayer?.querySelector('.meet-links-search-input');
    const meetLinksStatus = meetLinksLayer?.querySelector('.meet-links-status-select');
    const meetLinksStatusIcon = meetLinksLayer?.querySelector('.status-filter-icon');
    const meetLinksSelectAll = meetLinksLayer?.querySelector('#meetLinksSelectAll');
    const meetLinksRemoveSelected = meetLinksLayer?.querySelector('#meetLinksRemoveSelected');

    if (!modal || !form || !schoolToggle || !listWrap) {
        return;
    }

    backdrop?.addEventListener('click', closeGoogleMeetModal);
    meetLinksBackdrop?.addEventListener('click', closeGoogleMeetLinksLayer);
    if (meetLinksLayer && meetLinksLayer.dataset.controlsBound !== '1') {
        meetLinksLayer.dataset.controlsBound = '1';
        meetLinksSearch?.addEventListener('input', () => renderGoogleMeetLinksStudentsRows());
        meetLinksStatus?.addEventListener('change', () => renderGoogleMeetLinksStudentsRows());
        meetLinksSelectAll?.addEventListener('change', () => {
            setAllVisibleMeetLinksRowsSelected(meetLinksSelectAll.checked);
        });
        meetLinksRemoveSelected?.addEventListener('click', () => {
            if (!canEditFeed()) {
                denyStudentAction('Permission denied: students cannot remove Google Meet links.');
                return;
            }
            const selectedCount = getSelectedGoogleMeetStudentIds().length;
            if (selectedCount === 0) return;
            const ok = window.confirm(`Remove Google Meet link from ${selectedCount} selected student(s)?`);
            if (!ok) return;
            const removed = removeGoogleMeetLinksForSelectedStudents();
            renderGoogleMeetLinksStudentsRows();
            updateGoogleMeetLinksPopupStats();
            if (removed > 0) {
                showGoogleMeetContextMessage(
                    removed === 1 ? 'Meet link removed.' : `${removed} Meet links removed.`,
                    meetLinksRemoveSelected
                );
            }
        });
        meetLinksStatusIcon?.addEventListener('click', () => {
            if (!meetLinksStatus) return;
            meetLinksStatus.value = '';
            renderGoogleMeetLinksStudentsRows();
            meetLinksStatus.focus();
        });
        meetLinksLayer.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const addLinkBtn = target.closest('.meet-links-add-link-btn');
            if (addLinkBtn) {
                if (!canEditFeed()) {
                    denyStudentAction('Permission denied: students cannot manage Google Meet links.');
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const studentId = String(addLinkBtn.getAttribute('data-student-id') || '').trim();
                if (!studentId) return;
                openGoogleMeetAddLinkDialog(e, studentId, addLinkBtn);
                return;
            }
            const editBtn = target.closest('.meet-links-icon-btn--edit');
            if (editBtn) {
                if (!canEditFeed()) {
                    denyStudentAction('Permission denied: students cannot manage Google Meet links.');
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const studentId = String(
                    editBtn.getAttribute('data-student-id') ||
                    editBtn.closest('.meet-links-row')?.getAttribute('data-student-id') ||
                    ''
                ).trim();
                const studentName = getGoogleMeetStudentNameFromId(studentId);
                if (!studentId || !studentName) return;
                const existingLink = getGoogleMeetLinkForStudent(studentName);
                openGoogleMeetAddLinkDialog(e, studentId, editBtn, existingLink);
                return;
            }
            const deleteBtn = target.closest('.meet-links-icon-btn--delete');
            if (deleteBtn) {
                if (!canEditFeed()) {
                    denyStudentAction('Permission denied: students cannot remove Google Meet links.');
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const studentId = String(
                    deleteBtn.getAttribute('data-student-id') ||
                    deleteBtn.closest('.meet-links-row')?.getAttribute('data-student-id') ||
                    ''
                ).trim();
                const studentName = getGoogleMeetStudentNameFromId(studentId);
                if (!studentId || !studentName) return;
                removeGoogleMeetLinkForStudent(studentName);
                saveRoster();
                refreshClassReportAfterMeetLinkChange();
                renderGoogleMeetLinksStudentsRows();
                updateGoogleMeetLinksPopupStats();
                showGoogleMeetContextMessage('Meet link removed.', deleteBtn);
            }
        });
        meetLinksLayer.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const dialog = document.getElementById('googleMeetLinksAddDialog');
            if (!dialog || dialog.hidden) return;
            e.preventDefault();
            closeGoogleMeetAddLinkDialog();
        });
        meetLinksLayer.addEventListener('pointerdown', (e) => {
            const dialog = document.getElementById('googleMeetLinksAddDialog');
            if (!dialog || dialog.hidden) return;
            const target = e.target;
            if (!(target instanceof Node)) return;
            if (!dialog.contains(target)) {
                closeGoogleMeetAddLinkDialog();
            }
        }, true);
    }
    const addDialog = ensureGoogleMeetAddLinkDialog();
    if (addDialog.dataset.controlsBound !== '1') {
        addDialog.dataset.controlsBound = '1';
        const addDialogInput = addDialog.querySelector('.meet-links-add-dialog-input');
        const addDialogCancel = addDialog.querySelector('.meet-links-add-dialog-btn--cancel');
        const addDialogSave = addDialog.querySelector('.meet-links-add-dialog-btn--save');
        addDialogCancel?.addEventListener('click', (e) => {
            e.preventDefault();
            closeGoogleMeetAddLinkDialog();
        });
        addDialogSave?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!canEditFeed()) {
                denyStudentAction('Permission denied: students cannot manage Google Meet links.');
                return;
            }
            const studentId = String(googleMeetLinksAddDialogStudentId || '').trim();
            const studentName = getGoogleMeetStudentNameFromId(studentId);
            if (!studentId || !studentName) {
                closeGoogleMeetAddLinkDialog();
                return;
            }
            const raw = String(addDialogInput?.value || '').trim();
            if (!raw) {
                showAppMessage('Enter a Google Meet link before saving.');
                addDialogInput?.focus();
                return;
            }
            if (!isPlausibleGoogleMeetUrl(raw)) {
                showAppMessage('Enter a valid Google Meet link (e.g. meet.google.com or meet.app).');
                addDialogInput?.focus();
                return;
            }
            studentGoogleMeetLinksByName[studentName] = normalizeGoogleMeetUrl(raw);
            saveRoster();
            refreshClassReportAfterMeetLinkChange();
            closeGoogleMeetAddLinkDialog();
            renderGoogleMeetLinksStudentsRows();
            updateGoogleMeetLinksPopupStats();
            showGoogleMeetContextMessage('Meet link saved.', googleMeetLinksAddDialogAnchor);
        });
        addDialogInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addDialogSave?.click();
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closeGoogleMeetAddLinkDialog();
            }
        });
    }
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
        if (!canEditFeed()) {
            sharedSchoolCheckbox.checked = !sharedSchoolCheckbox.checked;
            denyStudentAction('Permission denied: students cannot manage Google Meet links.');
            return;
        }
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
        if (!canEditFeed()) {
            denyStudentAction('Permission denied: students cannot manage Google Meet links.');
            return;
        }
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
        refreshClassReportAfterMeetLinkChange();
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
        if (!canEditFeed()) {
            denyStudentAction('Permission denied: students cannot manage Google Meet links.');
            return;
        }
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
        refreshClassReportAfterMeetLinkChange();
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
        if (!canEditFeed()) {
            denyStudentAction('Permission denied: students cannot start or manage Google Meet sessions.');
            return;
        }
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
    const modal = document.getElementById('addModal');
    if (!modal) {
        return;
    }
    closeAddSchoolColorPopup();
    const addSchoolBillingModel = document.getElementById('addSchoolBillingModel');
    if (addSchoolBillingModel) {
        addSchoolBillingModel.value = '';
        updateAddSchoolBillingExplainer();
    }
    closeModalWithAnimation(modal);
}

function setupAddStudentModal() {
    ensureAddPopupProvidersRendered();
    const modal = document.getElementById('addModal');
    const form = document.getElementById('addStudentForm');
    const cancelBtn = document.getElementById('addStudentCancel');
    const teacherHeaderCancelBtn = document.getElementById('addTeacherHeaderCancel');
    const backdrop = document.getElementById('addModalBackdrop');
    const schoolInput = document.getElementById('addSchoolNameInput');
    const studentFirstInput = document.getElementById('addStudentFirst');
    const studentLastInput = document.getElementById('addStudentLast');
    const studentUsernameInput = document.getElementById('addStudentUsername');
    const phoneCountrySelect = document.getElementById('addStudentPhoneCountry');
    const teacherPhoneCountrySelect = document.getElementById('addTeacherPhoneCountry');

    if (!modal || !form) {
        return;
    }

    populateAddStudentPhoneCountrySelect();
    updateAddStudentPhonePlaceholder();
    updateAddTeacherPhonePlaceholder();
    bindPhoneInputAutoCountry(
        document.getElementById('addStudentPhone'),
        phoneCountrySelect,
        updateAddStudentPhonePlaceholder
    );
    bindPhoneInputAutoCountry(
        document.getElementById('addTeacherPhone'),
        teacherPhoneCountrySelect,
        updateAddTeacherPhonePlaceholder
    );

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeAddStudentModal());
    }
    if (teacherHeaderCancelBtn) {
        teacherHeaderCancelBtn.addEventListener('click', () => closeAddStudentModal());
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => closeAddStudentModal());
    }
    schoolInput?.addEventListener('input', updateAddStudentPassportFieldVisibility);
    bindAddStudentUsernameAutoSync(studentFirstInput, studentLastInput, studentUsernameInput);
    if (modal.dataset.teacherUiBound !== '1') {
        modal.dataset.teacherUiBound = '1';
        modal.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const billingOption = target.closest('.add-school-billing-option');
            if (billingOption) {
                const billingOptsWrap = document.getElementById('addSchoolBillingOptions');
                if (billingOptsWrap?.contains(billingOption)) {
                    e.stopPropagation();
                    const value = String(billingOption.getAttribute('data-billing-model') || '').trim();
                    const modelInput = document.getElementById('addSchoolBillingModel');
                    if (modelInput) modelInput.value = value;
                    updateAddSchoolBillingExplainer();
                    billingOption.focus();
                    return;
                }
            }
            const teachBtn = target.closest('.add-teacher-segmented-btn');
            if (teachBtn) {
                const wrap = teachBtn.closest('.add-teacher-segmented');
                if (!wrap) return;
                const nextType = String(teachBtn.getAttribute('data-teaching-type') || '').trim() || 'both';
                const hiddenInput = document.getElementById('addTeacherTeachingType');
                if (hiddenInput) hiddenInput.value = nextType;
                wrap.querySelectorAll('.add-teacher-segmented-btn').forEach((btn) => {
                    const active = btn === teachBtn;
                    btn.classList.toggle('is-active', active);
                    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
                });
                return;
            }
            const uploadBtn = target.closest('.add-teacher-upload-dropzone');
            if (uploadBtn) {
                const fileInput = document.getElementById('addTeacherPhotoInput');
                fileInput?.click();
            }
        });
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const kdTarget = e.target;
            if (!(kdTarget instanceof Element)) return;
            const billingOption = kdTarget.closest('.add-school-billing-option');
            if (!billingOption) return;
            const billingOptsWrap = document.getElementById('addSchoolBillingOptions');
            if (!billingOptsWrap?.contains(billingOption)) return;
            e.preventDefault();
            const value = String(billingOption.getAttribute('data-billing-model') || '').trim();
            const modelInput = document.getElementById('addSchoolBillingModel');
            if (modelInput) modelInput.value = value;
            updateAddSchoolBillingExplainer();
            billingOption.focus();
        });
        modal.addEventListener('change', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLInputElement)) return;
            if (target.id !== 'addTeacherPhotoInput') return;
            const main = document.getElementById('addTeacherUploadMain');
            const sub = document.getElementById('addTeacherUploadSub');
            const file = target.files && target.files[0] ? target.files[0] : null;
            if (!file) {
                if (main) main.textContent = 'Click to upload';
                if (sub) sub.textContent = 'JPG, PNG up to 2MB';
                return;
            }
            if (main) main.textContent = file.name;
            if (sub) sub.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB selected`;
        });
    }
    const schoolSelectEl = document.getElementById('addStudentGroupSelect');
    schoolSelectEl?.addEventListener('change', () => {
        if (addModalMode !== 'student-global') return;
        syncAddStudentModalThemeFromSchoolTitle(schoolSelectEl.value);
    });
    const addSchoolExternalCheckbox = document.getElementById('addSchoolExternalCheckbox');
    const addSchoolExternalPanel = document.getElementById('addSchoolExternalPanel');
    const addSchoolExternalUrl = document.getElementById('addSchoolExternalUrl');
    const addSchoolExternalOffsite = document.getElementById('addSchoolExternalOffsite');
    const addSchoolPrimaryColor = document.getElementById('addSchoolPrimaryColor');
    const addSchoolSecondaryColor = document.getElementById('addSchoolSecondaryColor');
    const addSchoolPrimaryColorCheckbox = document.getElementById('addSchoolPrimaryColorCheckbox');
    const addSchoolSecondaryColorCheckbox = document.getElementById('addSchoolSecondaryColorCheckbox');
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
    addSchoolPrimaryColorCheckbox?.addEventListener('change', () => {
        addSchoolPrimaryColorCheckbox.checked = true;
        if (addSchoolPrimarySquare) {
            openAddSchoolColorPopup('primary', addSchoolPrimarySquare);
        }
    });
    addSchoolSecondaryColorCheckbox?.addEventListener('change', () => {
        addSchoolSecondaryColorCheckbox.checked = true;
        if (addSchoolSecondarySquare) {
            openAddSchoolColorPopup('secondary', addSchoolSecondarySquare);
        }
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!canManageRoster()) {
            denyStudentAction('Permission denied: students cannot manage roster records.');
            return;
        }
        if (addModalMode === 'teacher') {
            const teacherValidityEls = [
                document.getElementById('addTeacherFirst'),
                document.getElementById('addTeacherLast'),
                document.getElementById('addTeacherEmail'),
                document.getElementById('addTeacherPhone'),
                document.getElementById('addTeacherPassword')
            ].filter(Boolean);
            for (let i = 0; i < teacherValidityEls.length; i++) {
                const el = teacherValidityEls[i];
                if (typeof el.checkValidity === 'function' && !el.checkValidity()) {
                    el.reportValidity();
                    return;
                }
            }
            const first = document.getElementById('addTeacherFirst')?.value || '';
            const last = document.getElementById('addTeacherLast')?.value || '';
            const email = document.getElementById('addTeacherEmail')?.value || '';
            const password = document.getElementById('addTeacherPassword')?.value || '';
            addTeacherFromForm(first, last, email, password);
            return;
        }
        const first = document.getElementById('addStudentFirst')?.value || '';
        const last = document.getElementById('addStudentLast')?.value || '';
        if (addModalMode === 'student-entry') {
            await addStudentToSchoolFromForm(first, last, addStudentTargetSchool);
            return;
        }
        if (addModalMode === 'student-global') {
            const schoolName = document.getElementById('addStudentGroupSelect')?.value || '';
            await addStudentToSchoolFromForm(first, last, schoolName);
            return;
        }
        const school = document.getElementById('addSchoolNameInput').value;
        addSchoolFromForm(
            school,
            addSchoolPrimaryColor?.value || '#5c6bc0',
            addSchoolSecondaryColor?.value || '#1e88e5',
            normalizeSchoolBillingModel(addSchoolBillingModel?.value || '')
        );
    });
}

// Save current schedule to teacherSchedules
function saveTeacherSchedule(teacherName) {
    if (!teacherName) return;
    const copy = { ...slotStates };
    if (isActiveTeacherName(teacherName)) {
        const nextTeacherSlots = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(copy);
        teacherSchedules[teacherName] = withUnavailableStudentNamesMeta(teacherName, nextTeacherSlots);
    } else {
        let next = mergeSpeakonWeeklyClassIntoScheduleCopy(copy, teacherName);
        if (isStudentName(teacherName)) {
            next = stripTeacherAvailabilityFromStudentScheduleCopy(next);
        }
        teacherSchedules[teacherName] = next;
        syncSpeakOnWeeklyToAllTeacherSchedules();
    }
    markSchedulePendingCloudUpload();
    saveAllSchedulesLocal();
    const flushCloud =
        isGateViewingAlienTeacherGrid() && getGateSessionAppRole() === 'class-supervisor';
    if (flushCloud) {
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
        }
        void performSave();
    } else {
        saveAllSchedules();
    }
}

/**
 * Processed slot map for a roster name (teacher profile or student), without mutating globals.
 */
function computeSlotStatesForProfile(name) {
    const raw = teacherSchedules[name] ? getScheduleSlotMapWithoutMeta(teacherSchedules[name]) : {};
    if (isActiveTeacherName(name)) {
        return applyAllSpeakOnStudentColorsToTeacherScheduleCopy(raw);
    }
    return mergeSpeakonWeeklyClassIntoScheduleCopy(raw, name);
}

/**
 * Student calendar view: their class/extra cells (school colors) plus tutor "available" (green) where they have no class.
 */
function mergeStudentCalendarWithTutorFreeSlots(studentName, tutorKey) {
    const stu = stripTeacherAvailabilityFromStudentScheduleCopy(computeSlotStatesForProfile(studentName));
    const tutSchedule = teacherSchedules[tutorKey] ? { ...teacherSchedules[tutorKey] } : {};
    const tut = computeSlotStatesForProfile(tutorKey);
    const tutorUnavailableMeta = getUnavailableStudentNamesMetaFromSchedule(tutSchedule);
    const merged = {};
    const visibleRescheduledNames = {};
    DAYS.forEach((day) => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const key = `${day}-${hour}`;
            const s = stu[key];
            const t = tut[key];
            const sLow = s != null ? String(s).trim().toLowerCase() : '';
            const tLow = t != null ? String(t).trim().toLowerCase() : '';
            const rescheduledStudentName = String(tutorUnavailableMeta[key] || '').trim();
            if ((tLow === 'unavailable' || tLow === 'rescheduled') && rescheduledStudentName) {
                // Student view should always display all rescheduled slots globally.
                merged[key] = 'rescheduled';
                visibleRescheduledNames[key] = rescheduledStudentName;
            } else if (tLow === BOOKED_CLASS_SLOT_STATE) {
                merged[key] = BOOKED_CLASS_SLOT_STATE;
                const nm = String(tutorUnavailableMeta[key] || '').trim();
                if (nm) visibleRescheduledNames[key] = nm;
            } else if (sLow && sLow !== 'available') {
                merged[key] = s;
            } else if (tLow === 'available') {
                merged[key] = 'available';
            } else if (s) {
                merged[key] = s;
            } else {
                merged[key] = null;
            }
        }
    });
    studentVisibleRescheduledNamesBySlot = visibleRescheduledNames;
    return merged;
}

// Load schedule from teacherSchedules
function loadTeacherSchedule(teacherName) {
    const rawSchedule = teacherSchedules[teacherName] ? { ...teacherSchedules[teacherName] } : {};
    const raw = getScheduleSlotMapWithoutMeta(rawSchedule);
    const unavailableMeta = getUnavailableStudentNamesMetaFromSchedule(rawSchedule);
    studentVisibleRescheduledNamesBySlot = {};
    if (
        loggedInStudentFullName &&
        String(teacherName || '').trim().toLowerCase() === String(loggedInStudentFullName).trim().toLowerCase()
    ) {
        const tutorKey = getTutorRosterNameForStudent(loggedInStudentFullName);
        if (tutorKey) {
            slotStates = mergeStudentCalendarWithTutorFreeSlots(loggedInStudentFullName, tutorKey);
            return;
        }
    }
    if (isActiveTeacherName(teacherName)) {
        teacherUnavailableStudentNamesByTeacher[teacherName] = unavailableMeta;
        slotStates = applyAllSpeakOnStudentColorsToTeacherScheduleCopy(raw);
        teacherSchedules[teacherName] = withUnavailableStudentNamesMeta(teacherName, { ...slotStates });
    } else {
        slotStates = mergeSpeakonWeeklyClassIntoScheduleCopy(raw, teacherName);
        if (isStudentName(teacherName)) {
            slotStates = stripTeacherAvailabilityFromStudentScheduleCopy(slotStates);
        }
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
        closeCalendarPromptPopover();
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

    const dayHeaders = document.querySelectorAll('.calendar-grid .day-header');
    dayHeaders.forEach((header, idx) => {
        header.dataset.day = DAYS[idx] || '';
    });

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

            // Left click: student name chip scrolls sidebar; otherwise cycle slot state
            slot.addEventListener('click', (e) => {
                if (e.button !== 0 && e.button != null) return;
                const chip = e.target.closest('.time-slot-student-chip');
                if (chip && slot.contains(chip)) {
                    const sid = String(chip.dataset.studentId || '').trim();
                    if (sid) {
                        e.preventDefault();
                        e.stopPropagation();
                        scrollSidebarStudentIntoViewFromCalendarChip(sid);
                    }
                    return;
                }
                cycleSlotState(day, hour);
            });

            // Right click: show context menu
            slot.addEventListener('contextmenu', (e) => {
                const hasSchoolMenu = isCustomContextMenuEnabledForCurrentSelection();
                const hasTeacherGreenMenu = isTeacherGreenCellContextMenuEnabled(day, hour);
                if (!hasSchoolMenu && !hasTeacherGreenMenu) {
                    hideContextMenu();
                    return;
                }
                e.preventDefault();
                showContextMenu(e, day, hour, hasTeacherGreenMenu ? 'teacher-green' : 'school');
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
        e.stopPropagation();
        const submenuTrigger = e.target.closest('.context-menu-chevron-btn--trigger');
        if (submenuTrigger && contextMenu.contains(submenuTrigger)) {
            contextMenu.classList.add('context-menu--book-submenu-open');
            requestAnimationFrame(() => {
                positionSchoolSubmenu();
                updateStudentListScrollIndicators();
            });
            refreshStudentListScrollIndicatorsAfterLayout();
            return;
        }
        const studentItem = e.target.closest('.context-submenu-student-item');
        if (studentItem && contextMenu.contains(studentItem)) {
            const list = studentItem.closest('.context-students-submenu-list');
            list?.querySelectorAll('.context-submenu-student-item.is-selected').forEach((el) => el.classList.remove('is-selected'));
            studentItem.classList.add('is-selected');
            contextMenu.dataset.selectedStudent = String(studentItem.dataset.student || '').trim();
            if (currentContextMenuMode === 'teacher-green' && currentSlot && currentTeacher) {
                const selectedStudentName = String(studentItem.dataset.student || '').trim();
                if (selectedStudentName && teacherBookGreenSlotForStudent(currentSlot.day, currentSlot.hour, selectedStudentName)) {
                    hideContextMenu();
                }
                return;
            }
        }
        const item = e.target.closest('.context-menu-item, .context-submenu-item');
        if (!item || !contextMenu.contains(item)) return;
        const selectedSchool = String(item.dataset.school || '').trim();
        if (selectedSchool) {
            contextMenu.dataset.selectedSchool = selectedSchool;
        }
        if (item.classList.contains('context-submenu-item--has-students') && selectedSchool) {
            showBookClassStudentsSubmenu(selectedSchool);
            return;
        }
        const action = String(item.dataset.action || '').trim();
        if (currentContextMenuMode === 'teacher-green' && action) {
            handleTeacherGreenContextMenuAction(action);
            if (action === 'book-school') {
                hideContextMenu();
                return;
            }
            if (action === 'set-class-reposition') {
                return;
            }
            hideContextMenu();
            return;
        }
        if (currentContextMenuMode === 'teacher-green') return;
        const color = item.dataset.color;
        if (!currentSlot || typeof color === 'undefined') {
            hideContextMenu();
            return;
        }
        setSlotState(currentSlot.day, currentSlot.hour, color || null);
        hideContextMenu();
    });
    contextMenu?.addEventListener('scroll', (e) => {
        const t = e.target;
        if (!t || !t.closest) return;
        const listEl = t.closest('.context-students-submenu-list');
        if (!listEl || !contextMenu.contains(listEl)) return;
        updateStudentListScrollIndicators();
    }, true);
    if (document.body.dataset.bookSubmenuPositionBound !== '1') {
        document.body.dataset.bookSubmenuPositionBound = '1';
        window.addEventListener('resize', () => {
            positionSchoolSubmenu();
            positionIndependentStudentsSubmenu();
            updateStudentListScrollIndicators();
            updateCurrentTimeIndicator();
        });
    }
    refreshTodayCalendarHighlight();
    scheduleNextTodayCalendarHighlightRefresh();
    initCurrentTimeIndicator();
}

function refreshTodayCalendarHighlight() {
    const dayHeaders = document.querySelectorAll('.calendar-grid .day-header');
    dayHeaders.forEach((header) => header.classList.remove('today'));
    document.querySelectorAll('.time-slot.today-column').forEach((slot) => {
        slot.classList.remove('today-column');
    });
    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex];
    if (!todayName) return;
    const todayHeader = document.querySelector(`.calendar-grid .day-header[data-day="${todayName}"]`);
    if (todayHeader) {
        todayHeader.classList.add('today');
    }
    document.querySelectorAll(`.time-slot[data-day="${todayName}"]`).forEach((slot) => {
        slot.classList.add('today-column');
    });
}

function scheduleNextTodayCalendarHighlightRefresh() {
    if (calendarTodayRefreshTimer) {
        clearTimeout(calendarTodayRefreshTimer);
        calendarTodayRefreshTimer = null;
    }
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delayMs = Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000);
    calendarTodayRefreshTimer = window.setTimeout(() => {
        refreshTodayCalendarHighlight();
        resetClassStartNotificationCache();
        notifyUpcomingClasses();
        scheduleNextTodayCalendarHighlightRefresh();
    }, delayMs);
}

function ensureCurrentTimeIndicatorElement() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer) return null;
    let indicator = document.getElementById('currentTimeIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'currentTimeIndicator';
        indicator.className = 'current-time-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        const dot = document.createElement('span');
        dot.className = 'current-time-indicator-dot';
        indicator.appendChild(dot);
        timeSlotsContainer.appendChild(indicator);
    }
    return indicator;
}

function updateCurrentTimeIndicator() {
    const indicator = ensureCurrentTimeIndicatorElement();
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!indicator || !timeSlotsContainer) return;
    timeSlotsContainer.querySelectorAll('.time-slot.current-time-cell').forEach((slot) => {
        slot.classList.remove('current-time-cell');
    });
    const firstDay = DAYS[0];
    const lastDay = DAYS[DAYS.length - 1];
    const firstSlot = timeSlotsContainer.querySelector(`.time-slot[data-day="${firstDay}"][data-hour="${START_HOUR}"]`);
    const lastSlot = timeSlotsContainer.querySelector(`.time-slot[data-day="${lastDay}"][data-hour="${END_HOUR - 1}"]`);
    if (!firstSlot || !lastSlot) {
        indicator.hidden = true;
        return;
    }

    const now = new Date();
    const minutesFromMidnight = (now.getHours() * 60) + now.getMinutes() + (now.getSeconds() / 60);
    const startMinutes = START_HOUR * 60;
    const endMinutes = END_HOUR * 60;
    const totalMinutes = endMinutes - startMinutes;
    if (totalMinutes <= 0) {
        indicator.hidden = true;
        return;
    }

    const inRange = minutesFromMidnight >= startMinutes && minutesFromMidnight < endMinutes;
    indicator.hidden = !inRange;
    if (!inRange) return;

    const progress = (minutesFromMidnight - startMinutes) / totalMinutes;
    const startY = firstSlot.offsetTop;
    const endY = lastSlot.offsetTop + lastSlot.offsetHeight;
    const top = startY + ((endY - startY) * progress);
    const left = firstSlot.offsetLeft;
    const width = Math.max(0, timeSlotsContainer.clientWidth - left);

    indicator.style.top = `${top}px`;
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;

    const todayName = DAYS[now.getDay()];
    const currentHour = now.getHours();
    const currentSlot = timeSlotsContainer.querySelector(
        `.time-slot[data-day="${todayName}"][data-hour="${currentHour}"]`
    );
    if (currentSlot) {
        currentSlot.classList.add('current-time-cell');
    }
}

function initCurrentTimeIndicator() {
    ensureCurrentTimeIndicatorElement();
    updateCurrentTimeIndicator();
    if (currentTimeIndicatorTimer) {
        clearInterval(currentTimeIndicatorTimer);
        currentTimeIndicatorTimer = null;
    }
    currentTimeIndicatorTimer = window.setInterval(updateCurrentTimeIndicator, 30000);
    startClassStartNotificationTimer();
}

function resetClassStartNotificationCache() {
    classStartNotifiedKeys.clear();
    studentClassStartNotifiedKeys.clear();
}

function getNextDateForDayAndHour(dayName, hour, now = new Date()) {
    const targetDayIndex = DAYS.findIndex((d) => String(d || '').trim() === String(dayName || '').trim());
    const targetHour = Number.parseInt(String(hour), 10);
    if (targetDayIndex < 0 || !Number.isFinite(targetHour)) return null;
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setHours(targetHour, 0, 0, 0);
    const diff = targetDayIndex - now.getDay();
    const addDays = diff < 0 ? diff + 7 : diff;
    next.setDate(now.getDate() + addDays);
    if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + 7);
    }
    return next;
}

function isClassLikeSlotState(state) {
    const normalized = String(state || '').trim().toLowerCase();
    if (
        !normalized ||
        normalized === 'available' ||
        normalized === 'unavailable' ||
        normalized === 'rescheduled' ||
        normalized === BOOKED_CLASS_SLOT_STATE
    ) {
        return false;
    }
    return !!resolveSchoolTokenInfoFromState(normalized);
}

function getUpcomingClassSlotsForSelectedTeacher(now = new Date()) {
    if (!currentTeacher || !isActiveTeacherName(currentTeacher) || loggedInStudentFullName) return [];
    const items = [];
    DAYS.forEach((day) => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const state = getSlotState(day, hour);
            if (!isClassLikeSlotState(state)) continue;
            const startsAt = getNextDateForDayAndHour(day, hour, now);
            if (!startsAt) continue;
            items.push({ day, hour, startsAt, state });
        }
    });
    return items;
}

function getUpcomingClassSlotsForLoggedInStudent(now = new Date()) {
    const studentName = String(loggedInStudentFullName || '').trim();
    if (!studentName) return [];
    const items = [];
    DAYS.forEach((day) => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const state = getSlotState(day, hour);
            if (!isClassLikeSlotState(state)) continue;
            const startsAt = getNextDateForDayAndHour(day, hour, now);
            if (!startsAt) continue;
            items.push({ day, hour, startsAt, state, studentName });
        }
    });
    return items;
}

function maybeRequestNotificationPermission() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'default') return;
    if (classStartNotificationPermissionRequested) return;
    classStartNotificationPermissionRequested = true;
    Notification.requestPermission().catch(() => {});
}

function notifyUpcomingClasses() {
    if (typeof Notification === 'undefined') return;
    const now = new Date();
    const upcomingTeacher = getUpcomingClassSlotsForSelectedTeacher(now);
    const upcomingStudent = getUpcomingClassSlotsForLoggedInStudent(now);
    if (upcomingTeacher.length === 0 && upcomingStudent.length === 0) return;
    if (Notification.permission === 'default') {
        maybeRequestNotificationPermission();
        return;
    }
    if (Notification.permission !== 'granted') return;
    const leadMs = CLASS_START_NOTIFY_LEAD_MINUTES * 60 * 1000;
    const toleranceMs = 60 * 1000;
    const onTimeToleranceMs = 60 * 1000;
    upcomingTeacher.forEach(({ day, hour, startsAt }) => {
        const diffMs = startsAt.getTime() - now.getTime();
        const dateKey = `${startsAt.getFullYear()}-${startsAt.getMonth() + 1}-${startsAt.getDate()}`;
        const teacherKeyBase = `teacher|${String(currentTeacher || '').trim().toLowerCase()}|${dateKey}|${day}|${hour}`;
        const inLeadWindow = diffMs > 0 && diffMs <= leadMs + toleranceMs && diffMs >= leadMs - toleranceMs;
        if (inLeadWindow) {
            const notifyKey = `${teacherKeyBase}|lead5`;
            if (!classStartNotifiedKeys.has(notifyKey)) {
                classStartNotifiedKeys.add(notifyKey);
                const title = 'Class starts soon';
                const body = `${currentTeacher}: ${day} at ${formatHour(hour)} starts in ${CLASS_START_NOTIFY_LEAD_MINUTES} minutes.`;
                try {
                    new Notification(title, { body, tag: notifyKey });
                } catch {
                    // Ignore notification constructor errors (browser policy / unsupported context).
                }
            }
        }
        const inOnTimeWindow = Math.abs(diffMs) <= onTimeToleranceMs;
        if (inOnTimeWindow) {
            const notifyKey = `${teacherKeyBase}|onTime`;
            if (!classStartNotifiedKeys.has(notifyKey)) {
                classStartNotifiedKeys.add(notifyKey);
                const title = 'Class starts now';
                const body = `${currentTeacher}: ${day} at ${formatHour(hour)} is starting now.`;
                try {
                    new Notification(title, { body, tag: notifyKey });
                } catch {
                    // Ignore notification constructor errors (browser policy / unsupported context).
                }
            }
        }
    });
    upcomingStudent.forEach(({ day, hour, startsAt, studentName }) => {
        const diffMs = startsAt.getTime() - now.getTime();
        const dateKey = `${startsAt.getFullYear()}-${startsAt.getMonth() + 1}-${startsAt.getDate()}`;
        const studentKeyBase = `student|${String(studentName || '').trim().toLowerCase()}|${dateKey}|${day}|${hour}`;
        const inLeadWindow = diffMs > 0 && diffMs <= leadMs + toleranceMs && diffMs >= leadMs - toleranceMs;
        if (inLeadWindow) {
            const notifyKey = `${studentKeyBase}|lead5`;
            if (!studentClassStartNotifiedKeys.has(notifyKey)) {
                studentClassStartNotifiedKeys.add(notifyKey);
                const title = 'Your class starts soon';
                const body = `${day} at ${formatHour(hour)} starts in ${CLASS_START_NOTIFY_LEAD_MINUTES} minutes.`;
                try {
                    new Notification(title, { body, tag: notifyKey });
                } catch {
                    // Ignore notification constructor errors (browser policy / unsupported context).
                }
            }
        }
        const inOnTimeWindow = Math.abs(diffMs) <= onTimeToleranceMs;
        if (inOnTimeWindow) {
            const notifyKey = `${studentKeyBase}|onTime`;
            if (!studentClassStartNotifiedKeys.has(notifyKey)) {
                studentClassStartNotifiedKeys.add(notifyKey);
                const title = 'Your class starts now';
                const body = `${day} at ${formatHour(hour)} is starting now.`;
                try {
                    new Notification(title, { body, tag: notifyKey });
                } catch {
                    // Ignore notification constructor errors (browser policy / unsupported context).
                }
            }
        }
    });
}

function startClassStartNotificationTimer() {
    if (classStartNotificationTimer) {
        clearInterval(classStartNotificationTimer);
        classStartNotificationTimer = null;
    }
    notifyUpcomingClasses();
    classStartNotificationTimer = window.setInterval(notifyUpcomingClasses, 30000);
}

// Refresh calendar display based on current slotStates
function refreshCalendarDisplay() {
    refreshTodayCalendarHighlight();
    updateCurrentTimeIndicator();
    DAYS.forEach(day => {
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            const key = `${day}-${hour}`;
            const state = getDisplaySlotState(day, hour);
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                applyStateVisualToSlot(slot, state);
                renderStudentNamesInSlot(slot, day, hour, state);
            }
        }
    });
    notifyUpcomingClasses();
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
    if (isLoggedInStudentCalendarReadOnly()) {
        showAppMessage('View only — your teacher manages this schedule.');
        return;
    }

    const key = `${day}-${hour}`;
    const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
    
    if (!slot) return;

    if (isGateViewingAlienTeacherGrid()) {
        const role = getGateSessionAppRole();
        if (role !== 'coordinator' && role !== 'class-supervisor') {
            showAppMessage('You cannot edit this teacher schedule.');
            return;
        }
        if (role === 'coordinator') {
            showAppMessage('Coordinators cannot edit this teacher schedule.');
            return;
        }
        if (role === 'class-supervisor') {
            const nextLow = String(state || '').trim().toLowerCase();
            const cur = slotStates[key];
            const curLow = String(cur || '').trim().toLowerCase();
            const managedToken = getSchoolManagedTeacherStateTokenForSlot(currentTeacher, day, hour);

            if (!state || nextLow === '' || nextLow === 'null') {
                if (managedToken) {
                    showAppMessage('This class is managed by Schools. Only the teacher can change it here.');
                    return;
                }
                if (curLow === BOOKED_CLASS_SLOT_STATE) {
                    if (!supervisorSlotBookingsByTeacher[currentTeacher]?.[key]) {
                        showAppMessage('Only the teacher can cancel this booking.');
                        return;
                    }
                } else {
                    showAppMessage('Only the teacher can change availability.');
                    return;
                }
            } else if (nextLow === BOOKED_CLASS_SLOT_STATE) {
                if (curLow !== 'available') {
                    showAppMessage('You can only book a free (green) slot.');
                    return;
                }
            } else {
                const resolvedNext = resolveSchoolTokenInfoFromState(state);
                const nextTok = String(resolvedNext?.token || nextLow || '').trim().toLowerCase();
                const managedLow = String(managedToken || '').trim().toLowerCase();
                if (!managedToken || nextTok !== managedLow) {
                    showAppMessage('Only the teacher can change this slot.');
                    return;
                }
            }
        }
    }

    if (isActiveTeacherName(currentTeacher)) {
        const managedToken = getSchoolManagedTeacherStateTokenForSlot(currentTeacher, day, hour);
        if (managedToken) {
            const normalizedNext = String(state || '').trim().toLowerCase();
            const resolvedNext = resolveSchoolTokenInfoFromState(normalizedNext);
            const normalizedManaged = String(managedToken || '').trim().toLowerCase();
            const normalizedResolvedNext = String(resolvedNext?.token || normalizedNext || '').trim().toLowerCase();
            if (normalizedResolvedNext !== normalizedManaged) {
                showAppMessage('This class is managed by Schools and cannot be edited here.');
                return;
            }
        }
    }

    const normalizedState = String(state || '').trim().toLowerCase();
    if (
        normalizedState !== 'unavailable' &&
        normalizedState !== 'rescheduled' &&
        normalizedState !== BOOKED_CLASS_SLOT_STATE
    ) {
        const byTeacher = teacherUnavailableStudentNamesByTeacher[currentTeacher];
        if (byTeacher && Object.prototype.hasOwnProperty.call(byTeacher, key)) {
            delete byTeacher[key];
        }
        const supMap = supervisorSlotBookingsByTeacher[currentTeacher];
        if (supMap && Object.prototype.hasOwnProperty.call(supMap, key)) {
            delete supMap[key];
        }
    }
    
    if (state) {
        slotStates[key] = state;
    } else {
        slotStates[key] = null;
    }
    const displayForUi = getDisplaySlotState(day, hour);
    applyStateVisualToSlot(slot, displayForUi);
    renderStudentNamesInSlot(slot, day, hour, displayForUi);
    
    // Save to teacher schedule and localStorage
    saveTeacherSchedule(currentTeacher);
    resetClassStartNotificationCache();
    notifyUpcomingClasses();
    
}

// Cycle through states on left click: null <-> available
function cycleSlotState(day, hour) {
    if (!currentTeacher) return;
    if (isLoggedInStudentCalendarReadOnly()) {
        const st = getSlotState(day, hour);
        if (String(st || '').trim().toLowerCase() === 'available') {
            openStudentRepositionModal(day, hour);
        }
        return;
    }
    if (isGateViewingAlienTeacherGrid()) {
        showAppMessage('Only the teacher adjusts availability here. Use the menu to book a class when allowed.');
        return;
    }
    if (isSchoolManagedTeacherSlotLocked(day, hour)) {
        showAppMessage('This class is managed by Schools and cannot be edited here.');
        return;
    }

    const currentState = getSlotState(day, hour);
    const currentIndex = STATE_CYCLE.indexOf(currentState);
    const nextState = currentIndex === -1
        ? 'available'
        : STATE_CYCLE[(currentIndex + 1) % STATE_CYCLE.length];
    
    setSlotState(day, hour, nextState);
}

// Show context menu on right click
function showContextMenu(event, day, hour, mode = 'school') {
    if (!currentTeacher) return;
    
    currentSlot = { day, hour };
    currentContextMenuMode = mode;
    refreshContextMenuTheme();
    contextMenu.classList.add('show');

    // Anchor menu top-left to cursor bottom-right.
    const cursorOffset = 15; // previous 8px + requested extra 7px
    const pointerX = Number.isFinite(event.clientX) ? event.clientX : 0;
    const pointerY = Number.isFinite(event.clientY) ? event.clientY : 0;
    let targetLeft = pointerX + cursorOffset;
    let targetTop = pointerY + cursorOffset;
    contextMenu.style.left = `${targetLeft}px`;
    contextMenu.style.top = `${targetTop}px`;

    // Keep the menu inside the viewport.
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        targetLeft = Math.max(0, pointerX - rect.width - cursorOffset);
    }
    if (rect.bottom > window.innerHeight) {
        targetTop = Math.max(0, pointerY - rect.height - cursorOffset);
    }
    contextMenu.style.left = `${targetLeft}px`;
    contextMenu.style.top = `${targetTop}px`;
    updateBookSubmenuDirectionCue();
}

// Hide context menu
function hideContextMenu() {
    if (contextMenu) {
        contextMenu.classList.remove('show');
        contextMenu.classList.remove('context-menu--book-submenu-open');
        contextMenu.classList.remove('context-menu--book-submenu-expanded');
        contextMenu.classList.remove('context-menu--book-submenu-left');
        const schoolSubmenu = contextMenu.querySelector('.context-submenu');
        if (schoolSubmenu) {
            schoolSubmenu.classList.remove('context-submenu--to-left', 'context-submenu--align-bottom');
        }
        const studentsMenu = contextMenu.querySelector('.context-students-submenu');
        if (studentsMenu) {
            studentsMenu.hidden = true;
            studentsMenu.classList.remove('context-students-submenu--to-left');
            studentsMenu.style.removeProperty('left');
            studentsMenu.style.removeProperty('top');
        }
    }
    currentSlot = null;
    currentContextMenuMode = 'school';
}

function updateStudentListScrollIndicators() {
    if (!contextMenu) return;
    const listEl = contextMenu.querySelector('.context-students-submenu-list');
    const upEl = contextMenu.querySelector('.context-students-submenu-scroll-indicator--up');
    const downEl = contextMenu.querySelector('.context-students-submenu-scroll-indicator--down');
    if (!listEl || !upEl || !downEl) return;
    const hasUp = listEl.scrollTop > 0;
    const hasDown = (listEl.scrollTop + listEl.clientHeight) < listEl.scrollHeight;
    upEl.hidden = !hasUp;
    downEl.hidden = !hasDown;
}

function updateBookSubmenuDirectionCue() {
    if (!contextMenu) return;
    const wrap = contextMenu.querySelector('.context-menu-item-with-submenu');
    const submenu = contextMenu.querySelector('.context-submenu');
    if (!wrap || !submenu) {
        contextMenu.classList.remove('context-menu--book-submenu-left');
        return;
    }
    const viewportPad = 12;
    const gap = 5;
    const wrapRect = wrap.getBoundingClientRect();
    const wasOpen = contextMenu.classList.contains('context-menu--book-submenu-open');
    if (!wasOpen) {
        contextMenu.classList.add('context-menu--book-submenu-open');
        submenu.style.visibility = 'hidden';
    }
    const submenuRect = submenu.getBoundingClientRect();
    const rightFits = (wrapRect.right + gap + submenuRect.width) <= (window.innerWidth - viewportPad);
    const leftFits = (wrapRect.left - gap - submenuRect.width) >= viewportPad;
    contextMenu.classList.toggle('context-menu--book-submenu-left', !rightFits && leftFits);
    if (!wasOpen) {
        submenu.style.removeProperty('visibility');
        contextMenu.classList.remove('context-menu--book-submenu-open');
    }
}

function positionSchoolSubmenu() {
    if (!contextMenu || !contextMenu.classList.contains('context-menu--book-submenu-open')) return;
    const wrap = contextMenu.querySelector('.context-menu-item-with-submenu');
    const submenu = contextMenu.querySelector('.context-submenu');
    if (!wrap || !submenu) return;

    const viewportPad = 12;
    const minBottomOffset = 20;
    const gap = 5;
    submenu.classList.remove('context-submenu--to-left', 'context-submenu--align-bottom');
    contextMenu.classList.remove('context-menu--book-submenu-left');

    const wrapRect = wrap.getBoundingClientRect();
    let submenuRect = submenu.getBoundingClientRect();

    const rightFits = (wrapRect.right + gap + submenuRect.width) <= (window.innerWidth - viewportPad);
    const leftFits = (wrapRect.left - gap - submenuRect.width) >= viewportPad;
    updateBookSubmenuDirectionCue();
    if (!rightFits && leftFits) {
        submenu.classList.add('context-submenu--to-left');
        submenuRect = submenu.getBoundingClientRect();
    }

    const maxBottomEdge = window.innerHeight - minBottomOffset;
    if (wrapRect.top + submenuRect.height > maxBottomEdge) {
        submenu.classList.add('context-submenu--align-bottom');
    }
}

function positionIndependentStudentsSubmenu() {
    if (!contextMenu || !contextMenu.classList.contains('context-menu--book-submenu-expanded')) return;
    const schoolSubmenu = contextMenu.querySelector('.context-submenu');
    const studentsMenu = contextMenu.querySelector('.context-students-submenu');
    if (!schoolSubmenu || !studentsMenu || studentsMenu.hidden) return;

    const viewportPad = 12;
    const minBottomOffset = 20;
    const gap = -4;
    const schoolRect = schoolSubmenu.getBoundingClientRect();
    studentsMenu.classList.remove('context-students-submenu--to-left');

    // Measure submenu with neutral placement first.
    studentsMenu.style.left = `${viewportPad}px`;
    studentsMenu.style.top = `${viewportPad}px`;

    const studentsRect = studentsMenu.getBoundingClientRect();
    const maxLeft = Math.max(viewportPad, window.innerWidth - studentsRect.width - viewportPad);
    const maxTop = Math.max(viewportPad, window.innerHeight - studentsRect.height - minBottomOffset);
    const schoolOpensLeft = schoolSubmenu.classList.contains('context-submenu--to-left');
    const preferRightLeft = schoolRect.right + gap;
    const preferLeftLeft = schoolRect.left - studentsRect.width - gap;
    let nextLeft = schoolOpensLeft ? preferLeftLeft : preferRightLeft;
    if (schoolOpensLeft) {
        studentsMenu.classList.add('context-students-submenu--to-left');
    }
    nextLeft = Math.max(viewportPad, Math.min(nextLeft, maxLeft));

    // Keep a consistent anchor, but always preserve safe top/bottom margins.
    let nextTop = schoolRect.top;
    nextTop = Math.max(viewportPad, Math.min(nextTop, maxTop));

    studentsMenu.style.left = `${nextLeft}px`;
    studentsMenu.style.top = `${nextTop}px`;
}

function refreshStudentListScrollIndicatorsAfterLayout() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            positionSchoolSubmenu();
            positionIndependentStudentsSubmenu();
            updateStudentListScrollIndicators();
        });
    });
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

function escapeHtmlAttr(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function showBookClassStudentsSubmenu(schoolTitle) {
    if (!contextMenu) return;
    const studentsMenu = contextMenu.querySelector('.context-students-submenu');
    const titleEl = contextMenu.querySelector('.context-students-submenu-title');
    const listEl = contextMenu.querySelector('.context-students-submenu-list');
    if (!studentsMenu || !titleEl || !listEl) return;
    const school = String(schoolTitle || '').trim();
    const schoolButtons = contextMenu.querySelectorAll('.context-submenu-item[data-school]');
    schoolButtons.forEach((btn) => {
        const isSelected = String(btn.dataset.school || '').trim().toLowerCase() === school.toLowerCase();
        btn.classList.toggle('is-selected', !!school && isSelected);
    });
    if (!school) {
        listEl.innerHTML = '';
        studentsMenu.hidden = true;
        contextMenu.classList.remove('context-menu--book-submenu-expanded');
        updateStudentListScrollIndicators();
        return;
    }
    const names = getStudentNamesForSchool(school);
    titleEl.textContent = school;
    if (names.length === 0) {
        listEl.innerHTML = '<div class="context-submenu-empty">No students found</div>';
    } else {
        listEl.innerHTML = names
            .map((name) => {
                const safe = escapeHtmlAttr(String(name || '').trim());
                return `<button type="button" class="context-submenu-student-item" data-student="${safe}">${safe}</button>`;
            })
            .join('');
    }
    studentsMenu.hidden = false;
    contextMenu.classList.add('context-menu--book-submenu-expanded');
    requestAnimationFrame(() => {
        positionIndependentStudentsSubmenu();
        updateStudentListScrollIndicators();
    });
    refreshStudentListScrollIndicatorsAfterLayout();
}

function showBookClassStudentsSubmenuForAllStudents() {
    if (!contextMenu) return;
    const studentsMenu = contextMenu.querySelector('.context-students-submenu');
    const titleEl = contextMenu.querySelector('.context-students-submenu-title');
    const listEl = contextMenu.querySelector('.context-students-submenu-list');
    if (!studentsMenu || !titleEl || !listEl) return;
    delete contextMenu.dataset.selectedSchool;
    const schoolButtons = contextMenu.querySelectorAll('.context-submenu-item[data-school]');
    schoolButtons.forEach((btn) => btn.classList.remove('is-selected'));
    const names = getAllRosterStudentNamesSorted();
    titleEl.textContent = 'All students';
    if (names.length === 0) {
        listEl.innerHTML = '<div class="context-submenu-empty">No students found</div>';
    } else {
        listEl.innerHTML = names
            .map((name) => {
                const safe = escapeHtmlAttr(String(name || '').trim());
                return `<button type="button" class="context-submenu-student-item" data-student="${safe}">${safe}</button>`;
            })
            .join('');
    }
    studentsMenu.hidden = false;
    contextMenu.classList.add('context-menu--book-submenu-expanded');
    requestAnimationFrame(() => {
        positionIndependentStudentsSubmenu();
        updateStudentListScrollIndicators();
    });
    refreshStudentListScrollIndicatorsAfterLayout();
}

function refreshContextMenuTheme() {
    if (!contextMenu) return;
    contextMenu.classList.remove('context-menu--book-submenu-open');
    contextMenu.classList.remove('context-menu--book-submenu-expanded');
    contextMenu.classList.remove('context-menu--book-submenu-left');
    delete contextMenu.dataset.selectedStudent;
    if (currentContextMenuMode === 'teacher-green') {
        delete contextMenu.dataset.selectedSchool;
        const schools = getAvailableSchoolNames();
        const schoolItems = schools.length
            ? schools
                .map((schoolName, index) => {
                    const safe = escapeHtmlAttr(String(schoolName || '').trim());
                    const delay = ((index + 1) * 0.1).toFixed(2);
                    const hasStudents = getStudentNamesForSchool(schoolName).length > 0;
                    const chevron = hasStudents
                        ? '<span class="context-submenu-item-chevron" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-submenu-item-chevron-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></span>'
                        : '';
                    return `<button type="button" class="context-submenu-item${hasStudents ? ' context-submenu-item--has-students' : ''}" style="--submenu-delay:${delay}s" data-action="book-school" data-school="${safe}"><span class="context-submenu-item-label">${safe}</span>${chevron}</button>`;
                })
                .join('')
            : '<div class="context-submenu-empty">No schools available</div>';
        contextMenu.innerHTML = `
            <div class="context-menu-group">
                <div class="context-menu-group-title">Schedule</div>
                <div class="context-menu-item-with-submenu">
                    <button type="button" class="context-menu-item context-menu-item--stacked context-menu-item--has-submenu context-menu-item--chevron-row">
                        <span class="context-menu-label">Book class (Reposition)</span>
                        <span class="context-menu-chevron-btn context-menu-chevron-btn--trigger" role="button" tabindex="0" aria-label="Open schools submenu to pick a student">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-menu-chevron-icon context-menu-chevron-icon--right">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-menu-chevron-icon context-menu-chevron-icon--left">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </span>
                    </button>
                    <div class="context-submenu" role="menu" aria-label="Schools">
                        <div class="context-submenu-col context-submenu-col--school-options">
                            ${schoolItems}
                        </div>
                    </div>
                    <div class="context-students-submenu" hidden>
                        <div class="context-students-submenu-title"></div>
                        <div class="context-students-submenu-scroll-indicator context-students-submenu-scroll-indicator--up" hidden aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-students-submenu-scroll-indicator-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        </div>
                        <div class="context-students-submenu-list"></div>
                        <div class="context-students-submenu-scroll-indicator context-students-submenu-scroll-indicator--down" hidden aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-students-submenu-scroll-indicator-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                </div>
                <button type="button" class="context-menu-item context-menu-item--stacked context-menu-item--chevron-row" data-action="set-class-reposition">
                    <span class="context-menu-label">All students…</span>
                    <span class="context-menu-chevron-btn" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-menu-chevron-icon context-menu-chevron-icon--right">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="context-menu-chevron-icon context-menu-chevron-icon--left">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </span>
                </button>
            </div>
            <div class="context-menu-group context-menu-group--separated">
                <div class="context-menu-group-title">Slot Management</div>
                <button type="button" class="context-menu-item context-menu-item--stacked" data-action="clear">
                    <span class="context-menu-label">Clear</span>
                </button>
            </div>
        `;
        return;
    }
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
    if (isLoggedInStudentCalendarReadOnly()) {
        showAppMessage('View only — your teacher manages this schedule.');
        return;
    }
    if (isGateViewingAlienTeacherGrid()) {
        showAppMessage('Only the teacher can change availability in bulk here.');
        return;
    }

    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                if (isSchoolManagedTeacherSlotLocked(day, hour)) {
                    return;
                }
                slotStates[key] = 'available';
                applyStateVisualToSlot(slot, 'available');
                renderStudentNamesInSlot(slot, day, hour, 'available');
                const byTeacher = teacherUnavailableStudentNamesByTeacher[currentTeacher];
                if (byTeacher && Object.prototype.hasOwnProperty.call(byTeacher, key)) {
                    delete byTeacher[key];
                }
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
}

// Clear all selections
function clearAll() {
    if (!currentTeacher) return;
    if (isLoggedInStudentCalendarReadOnly()) {
        showAppMessage('View only — your teacher manages this schedule.');
        return;
    }
    if (isGateViewingAlienTeacherGrid()) {
        showAppMessage('Only the teacher can change availability in bulk here.');
        return;
    }

    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        DAYS.forEach(day => {
            const key = `${day}-${hour}`;
            const slot = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
            
            if (slot) {
                const currentState = String(slotStates[key] || '').trim().toLowerCase();
                if (currentState !== 'available') {
                    return;
                }
                slotStates[key] = null;
                applyStateVisualToSlot(slot, null);
                renderStudentNamesInSlot(slot, day, hour, null);
            }
        });
    }
    
    // Save once after all changes
    saveTeacherSchedule(currentTeacher);
}

// Export schedule as text
function exportSchedule() {
    if (!currentTeacher) {
        alert('Please select a teacher first.');
        return;
    }
    if (isLoggedInStudentCalendarReadOnly()) {
        showAppMessage('Export is only available when you are signed in as a teacher.');
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
function setupAdminControlPanel() {
    const panel = document.getElementById('adminControlPanel');
    if (!panel || panel.dataset.bound === '1') return;
    panel.dataset.bound = '1';
    panel.addEventListener('click', async (e) => {
        if (!hasEffectiveAdminSession()) {
            panel.hidden = true;
            panel.innerHTML = '';
            return;
        }
        const saveBtn = e.target.closest('[data-admin-save]');
        if (saveBtn) {
            if (!hasEffectiveAdminSession()) {
                showAppMessage('Only the admin can manage accounts here.');
                return;
            }
            const role = String(saveBtn.getAttribute('data-admin-role') || '').trim();
            const name = String(saveBtn.getAttribute('data-admin-name') || '').trim();
            const key = String(saveBtn.getAttribute('data-admin-save') || '').trim();
            const emailInput = panel.querySelector(`[data-admin-input-email="${escapeHtmlAttr(key)}"]`);
            const passwordInput = panel.querySelector(`[data-admin-input-password="${escapeHtmlAttr(key)}"]`);
            const nextEmail = String(emailInput?.value || '').trim();
            const nextPassword = String(passwordInput?.value || '').trim();
            const saved = await saveAccountCredentialsFromAdmin(role, name, nextEmail, nextPassword);
            if (saved) {
                renderAdminOverviewPanel();
                renderSidebar();
            }
            return;
        }
        const deleteBtn = e.target.closest('[data-admin-delete]');
        const editBtn = e.target.closest('[data-admin-edit]');
        if (editBtn) {
            if (!hasEffectiveAdminSession()) {
                showAppMessage('Only the admin can manage accounts here.');
                return;
            }
            const name = String(editBtn.getAttribute('data-admin-name') || '').trim();
            const rosterKind = String(editBtn.getAttribute('data-admin-roster-kind') || '').trim();
            if (!name || !rosterKind) return;
            openEditStudentModal(name, rosterKind);
            return;
        }
        if (deleteBtn) {
            if (!hasEffectiveAdminSession()) {
                showAppMessage('Only the admin can manage accounts here.');
                return;
            }
            const role = String(deleteBtn.getAttribute('data-admin-role') || '').trim();
            const name = String(deleteBtn.getAttribute('data-admin-name') || '').trim();
            if (!role || !name) return;
            openAdminDashboardDeleteConfirm(role, name);
            return;
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initCrossTabLogoutBroadcastListener();
    const isAdminPage = document.body?.dataset.page === 'admin';
    if (isAdminPage) {
        let allow = false;
        if (window.TimeTableAuthVerifyGate) {
            allow = await window.TimeTableAuthVerifyGate.timetableEnsureAdminApiAccess({
                adminSessionKey: ADMIN_LOGIN_SESSION_KEY,
                loginPath: 'login-screen.html'
            });
        } else {
            try {
                allow = sessionStorage.getItem(ADMIN_LOGIN_SESSION_KEY) === 'true';
            } catch {
                allow = false;
            }
            if (!allow) {
                window.location.href = 'login-screen.html';
            }
        }
        if (!allow) {
            return;
        }

        await initTeachers();
        setupAppMessageModal();
        setupVisibilityCloudRefresh();
        setupAdminDashboardDeleteModal();
        setupAdminControlPanel();
        document.getElementById('adminPageLogoff')?.addEventListener('click', () => {
            performTeacherSessionLogout();
        });
        return;
    }

    await initTeachers();
    setupAppMessageModal();
    setupSupervisionModal();
    setupSupervisionInviteModal();
    setupSupervisionPendingNoticeModal();
    setupStudentRepositionModal();
    setupGlobalEscapeToDismissOverlays();
    setupGlobalPointerDownToDismissOverlays();
    setupVisibilityCloudRefresh();
    setupPasswordToggles();
    setupSidebarProfileAvatarUpload();
    initCalendar();
    if (currentTeacher) {
        refreshCalendarDisplay();
    }
    setupAdminControlPanel();
    setupAddStudentModal();
    setupGoogleMeetModal();
    setupEditStudentModal();
    setupSchoolSettingsModal();
    setupDeleteSchoolModal();
    setupAdminDashboardDeleteModal();
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
    if (classReportUploadCloudPollTimer) {
        clearInterval(classReportUploadCloudPollTimer);
    }
});