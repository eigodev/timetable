import {
  filterSupervisionLinksForActor,
  getSupervisionLinksArray,
  studentsVisibleViaSupervision,
  supervisedTeacherProfilesForSuperior,
  supervisedTeacherProfilesForClassSupervisor,
} from './supervision-links.js';

function sortNames(a, b) {
  return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

export function allRosterStudentNames(roster) {
  return [
    ...(Array.isArray(roster?.private) ? roster.private : []),
    ...(Array.isArray(roster?.speakon) ? roster.speakon : []),
    ...(Array.isArray(roster?.passport) ? roster.passport : []),
  ]
    .map((n) => String(n || '').trim())
    .filter(Boolean);
}

function tutorValueForStudent(st, studentName) {
  const nm = String(studentName || '').trim();
  if (!nm || !st || typeof st !== 'object') return '';
  const direct = String(st[nm] || '').trim();
  if (direct) return direct;
  const nlc = nm.toLowerCase();
  const key = Object.keys(st).find((k) => String(k || '').trim().toLowerCase() === nlc);
  return key ? String(st[key] || '').trim() : '';
}

/** Students with no mentor in `studentTeachers` (visible to all teachers; matches app navigation rules). */
function rosterStudentNamesWithNoTutor(roster) {
  const st = roster?.studentTeachers && typeof roster.studentTeachers === 'object' ? roster.studentTeachers : {};
  const out = new Set();
  for (const name of allRosterStudentNames(roster)) {
    const nm = String(name || '').trim();
    if (!nm) continue;
    if (!tutorValueForStudent(st, nm)) out.add(nm);
  }
  return out;
}

/** @param {string} teacherProfile */
export function studentsAssignedToTeacher(roster, teacherProfile) {
  const tutor = String(teacherProfile || '').trim();
  if (!tutor) return new Set();
  const tutorLc = tutor.toLowerCase();
  const st = roster?.studentTeachers && typeof roster.studentTeachers === 'object' ? roster.studentTeachers : {};
  const out = new Set();
  for (const name of allRosterStudentNames(roster)) {
    const val = tutorValueForStudent(st, name);
    if (val && val.toLowerCase() === tutorLc) out.add(name);
  }
  return out;
}

function isGateProfile(roster, profile) {
  const p = String(profile || '').trim();
  if (!p) return false;
  const list = Array.isArray(roster?.gateStaffAccounts) ? roster.gateStaffAccounts : [];
  return list.some((e) => String(e?.profileName || '').trim() === p);
}

function filterMapByKeys(map, allowed) {
  const src = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  const out = {};
  for (const [k, v] of Object.entries(src)) {
    if (allowed.has(String(k || '').trim())) out[k] = v;
  }
  return out;
}

function normSchoolTitleKey(title) {
  return String(title || '').trim().toLowerCase();
}

function studentNamesInSchoolRoster(roster, schoolTitle) {
  const sk = normSchoolTitleKey(schoolTitle);
  if (!sk) return [];
  const st = roster?.studentSchools && typeof roster.studentSchools === 'object' ? roster.studentSchools : {};
  return allRosterStudentNames(roster).filter((n) => normSchoolTitleKey(st[String(n)]) === sk);
}

/** Match client `getCustomSchoolsVisibleInSession`: empty custom schools are shared; otherwise tutor must own every student in that school (unassigned students are shared). */
function customSchoolVisibleToTeacher(fullRoster, schoolTitle, teacherProfile) {
  const profile = String(teacherProfile || '').trim();
  if (!profile) return false;
  const inSchool = studentNamesInSchoolRoster(fullRoster, schoolTitle);
  if (!inSchool.length) return true;
  const st =
    fullRoster?.studentTeachers && typeof fullRoster.studentTeachers === 'object'
      ? fullRoster.studentTeachers
      : {};
  const profileLc = profile.toLowerCase();
  return inSchool.every((n) => {
    const assigned = tutorValueForStudent(st, n);
    if (!String(assigned || '').trim()) return true;
    return assigned.toLowerCase() === profileLc;
  });
}

/** School-scoped maps (themes, external URLs, billing, Meet modes) use school title as key. */
function filterMapBySchoolTitles(map, schoolTitles) {
  const allow = new Set([...schoolTitles].map((t) => normSchoolTitleKey(t)));
  const src = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  const out = {};
  for (const [k, v] of Object.entries(src)) {
    if (allow.has(normSchoolTitleKey(k))) out[k] = v;
  }
  return out;
}

function collectAuthAliasTargetsForActor(roster, role, profile) {
  const targets = new Set();
  const pf = String(profile || '').trim();
  if (!pf) return targets;
  if (role === 'student') {
    const u = String(roster.studentUsernames?.[pf] || '').trim().toLowerCase();
    if (u) targets.add(u);
    const e = String(roster.studentEmails?.[pf] || '').trim().toLowerCase();
    if (e) targets.add(e);
    return targets;
  }
  if (role === 'teacher' || role === 'gate') {
    const u = String(roster.teacherEmails?.[pf] || '').trim().toLowerCase();
    if (u) targets.add(u);
    const gs = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];
    for (const entry of gs) {
      if (String(entry?.profileName || '').trim() === pf) {
        const gu = String(entry?.username || '').trim().toLowerCase();
        if (gu) targets.add(gu);
      }
    }
    for (const stu of studentsAssignedToTeacher(roster, pf)) {
      const su = String(roster.studentUsernames?.[stu] || '').trim().toLowerCase();
      if (su) targets.add(su);
      const se = String(roster.studentEmails?.[stu] || '').trim().toLowerCase();
      if (se) targets.add(se);
    }
    for (const stu of rosterStudentNamesWithNoTutor(roster)) {
      const su = String(roster.studentUsernames?.[stu] || '').trim().toLowerCase();
      if (su) targets.add(su);
      const se = String(roster.studentEmails?.[stu] || '').trim().toLowerCase();
      if (se) targets.add(se);
    }
  }
  return targets;
}

/**
 * Alias map values are canonical login strings; hide other users' mappings.
 */
function filterAuthLoginAliases(roster, actor) {
  const raw = roster.authLoginAliases && typeof roster.authLoginAliases === 'object' ? roster.authLoginAliases : {};
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  if (role === 'admin') return { ...raw };
  const allowedTargets = collectAuthAliasTargetsForActor(roster, role, profile);
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const val = String(v || '').trim().toLowerCase();
    if (val && allowedTargets.has(val)) out[k] = v;
  }
  return out;
}

/**
 * Admin: full roster. Teacher/gate: subset. Student: one row.
 * @param {object} roster
 * @param {{ role: string, profile: string }} actor
 */
export function filterRosterForActor(roster, actor) {
  if (!roster || typeof roster !== 'object') return roster;
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  if (role === 'admin') {
    return JSON.parse(JSON.stringify(roster));
  }
  if (role === 'student') {
    const st = profile;
    const allowed = new Set(st ? [st] : []);
    const r = JSON.parse(JSON.stringify(roster));
    const isMember = (name) => allowed.has(String(name || '').trim());
    r.private = (Array.isArray(r.private) ? r.private : []).filter(isMember);
    r.speakon = (Array.isArray(r.speakon) ? r.speakon : []).filter(isMember);
    r.passport = (Array.isArray(r.passport) ? r.passport : []).filter(isMember);
    r.teachers = [];
    r.teacherEmails = {};
    r.teacherPasswords = {};
    r.gateStaffAccounts = [];
    r.adminAccount = { username: '', passwordHash: '' };
    r.studentSchools = filterMapByKeys(r.studentSchools, allowed);
    r.studentPhones = filterMapByKeys(r.studentPhones, allowed);
    r.studentTeachers = filterMapByKeys(r.studentTeachers, allowed);
    r.studentEmails = filterMapByKeys(r.studentEmails, allowed);
    r.studentUsernames = filterMapByKeys(r.studentUsernames, allowed);
    r.studentPasswords = filterMapByKeys(r.studentPasswords, allowed);
    r.studentCities = filterMapByKeys(r.studentCities, allowed);
    r.studentCountries = filterMapByKeys(r.studentCountries, allowed);
    r.studentBirthDates = filterMapByKeys(r.studentBirthDates, allowed);
    r.studentAges = filterMapByKeys(r.studentAges, allowed);
    r.studentLevels = filterMapByKeys(r.studentLevels, allowed);
    r.studentExternalFollowUpLinks = filterMapByKeys(r.studentExternalFollowUpLinks, allowed);
    r.studentGoogleMeetLinks = filterMapByKeys(r.studentGoogleMeetLinks, allowed);
    r.teacherAppRoles = {};
    const studentSchoolTitles = new Set();
    for (const n of allowed) {
      const sch = String(r.studentSchools?.[n] || '').trim();
      if (sch) studentSchoolTitles.add(sch);
    }
    r.schoolExternalLinks = filterMapBySchoolTitles(r.schoolExternalLinks, studentSchoolTitles);
    r.schoolThemeColors = filterMapBySchoolTitles(r.schoolThemeColors, studentSchoolTitles);
    r.schoolBillingModels = filterMapBySchoolTitles(r.schoolBillingModels, studentSchoolTitles);
    r.schoolBillingConfigs = filterMapBySchoolTitles(r.schoolBillingConfigs, studentSchoolTitles);
    r.googleMeetSharedLinkModeBySchool = filterMapBySchoolTitles(
      r.googleMeetSharedLinkModeBySchool && typeof r.googleMeetSharedLinkModeBySchool === 'object'
        ? r.googleMeetSharedLinkModeBySchool
        : {},
      studentSchoolTitles
    );
    const swc =
      r.speakonWeeklyClass && typeof r.speakonWeeklyClass === 'object' ? r.speakonWeeklyClass : {};
    r.speakonWeeklyClass = filterMapByKeys(swc, allowed);
    const pl = r.passportLinks && typeof r.passportLinks === 'object' ? r.passportLinks : {};
    r.passportLinks = filterMapByKeys(pl, allowed);
    r.passportHeaderPageLink = '';
    r.calendarToolbarExternalLink = '';
    r.authLoginAliases = filterAuthLoginAliases(roster, actor);
    r.customSchools = (Array.isArray(r.customSchools) ? r.customSchools : []).filter((s) =>
      studentSchoolTitles.has(String(s || '').trim())
    );
    r.supervisionLinks = [];
    return r;
  }

  if (role === 'teacher' || role === 'gate') {
    const tp = profile;
    const inTeachers = (Array.isArray(roster.teachers) ? roster.teachers : []).some(
      (n) => String(n || '').trim() === tp
    );
    const teacherRow = inTeachers ? [tp] : isGateProfile(roster, tp) ? [tp] : [];

    const r = JSON.parse(JSON.stringify(roster));
    const allowedStudents = new Set(studentsAssignedToTeacher(roster, tp));
    for (const n of rosterStudentNamesWithNoTutor(roster)) allowedStudents.add(n);
    if (role === 'gate') {
      for (const s of studentsVisibleViaSupervision(roster, tp)) allowedStudents.add(s);
    }

    const keepStudent = (name) => allowedStudents.has(String(name || '').trim());
    r.private = (Array.isArray(r.private) ? r.private : []).filter(keepStudent);
    r.speakon = (Array.isArray(r.speakon) ? r.speakon : []).filter(keepStudent);
    r.passport = (Array.isArray(r.passport) ? r.passport : []).filter(keepStudent);

    const teacherRowSet = new Set(teacherRow.map((x) => String(x || '').trim()).filter(Boolean));
    if (role === 'gate') {
      for (const tname of supervisedTeacherProfilesForSuperior(roster, tp)) teacherRowSet.add(String(tname || '').trim());
    }
    r.teachers = [...teacherRowSet].sort(sortNames);

    const te =
      r.teacherEmails && typeof r.teacherEmails === 'object' ? { ...r.teacherEmails } : {};
    const tpw =
      r.teacherPasswords && typeof r.teacherPasswords === 'object' ? { ...r.teacherPasswords } : {};
    r.teacherEmails = {};
    r.teacherPasswords = {};
    if (tp) {
      if (te[tp]) r.teacherEmails[tp] = te[tp];
      if (tpw[tp]) r.teacherPasswords[tp] = tpw[tp];
    }

    const tar =
      r.teacherAppRoles && typeof r.teacherAppRoles === 'object' ? { ...r.teacherAppRoles } : {};
    r.teacherAppRoles = {};
    if (tp && tar[tp]) r.teacherAppRoles[tp] = tar[tp];

    const gs = Array.isArray(r.gateStaffAccounts) ? r.gateStaffAccounts : [];
    r.gateStaffAccounts = gs.filter((e) => String(e?.profileName || '').trim() === tp);

    r.adminAccount = { username: '', passwordHash: '' };

    r.studentSchools = filterMapByKeys(r.studentSchools, allowedStudents);
    r.studentPhones = filterMapByKeys(r.studentPhones, allowedStudents);
    r.studentTeachers = filterMapByKeys(r.studentTeachers, allowedStudents);
    r.studentEmails = filterMapByKeys(r.studentEmails, allowedStudents);
    r.studentUsernames = filterMapByKeys(r.studentUsernames, allowedStudents);
    r.studentPasswords = filterMapByKeys(r.studentPasswords, allowedStudents);
    r.studentCities = filterMapByKeys(r.studentCities, allowedStudents);
    r.studentCountries = filterMapByKeys(r.studentCountries, allowedStudents);
    r.studentBirthDates = filterMapByKeys(r.studentBirthDates, allowedStudents);
    r.studentAges = filterMapByKeys(r.studentAges, allowedStudents);
    r.studentLevels = filterMapByKeys(r.studentLevels, allowedStudents);
    r.studentExternalFollowUpLinks = filterMapByKeys(r.studentExternalFollowUpLinks, allowedStudents);
    r.studentGoogleMeetLinks = filterMapByKeys(r.studentGoogleMeetLinks, allowedStudents);

    const schoolsNeeded = new Set();
    for (const n of allowedStudents) {
      const sch = String(r.studentSchools?.[n] || '').trim();
      if (sch) schoolsNeeded.add(sch);
    }
    const cs = Array.isArray(r.customSchools) ? r.customSchools : [];
    r.customSchools = cs.filter((s) => customSchoolVisibleToTeacher(roster, s, tp));
    for (const s of r.customSchools) {
      const title = String(s || '').trim();
      if (title) schoolsNeeded.add(title);
    }

    r.schoolExternalLinks = filterMapBySchoolTitles(r.schoolExternalLinks, schoolsNeeded);
    r.schoolThemeColors = filterMapBySchoolTitles(r.schoolThemeColors, schoolsNeeded);
    r.schoolBillingModels = filterMapBySchoolTitles(r.schoolBillingModels, schoolsNeeded);
    r.schoolBillingConfigs = filterMapBySchoolTitles(r.schoolBillingConfigs, schoolsNeeded);
    r.googleMeetSharedLinkModeBySchool = filterMapBySchoolTitles(
      r.googleMeetSharedLinkModeBySchool && typeof r.googleMeetSharedLinkModeBySchool === 'object'
        ? r.googleMeetSharedLinkModeBySchool
        : {},
      schoolsNeeded
    );
    const swcT =
      r.speakonWeeklyClass && typeof r.speakonWeeklyClass === 'object' ? r.speakonWeeklyClass : {};
    r.speakonWeeklyClass = filterMapByKeys(swcT, allowedStudents);
    const plT = r.passportLinks && typeof r.passportLinks === 'object' ? r.passportLinks : {};
    r.passportLinks = filterMapByKeys(plT, allowedStudents);
    r.passportHeaderPageLink = '';
    r.calendarToolbarExternalLink = '';
    r.authLoginAliases = filterAuthLoginAliases(roster, actor);
    const rawLinks = getSupervisionLinksArray(roster);
    r.supervisionLinks = filterSupervisionLinksForActor(rawLinks, actor);
    return r;
  }

  return JSON.parse(JSON.stringify(roster));
}

/**
 * @param {object} base
 * @param {object} patch
 * @param {string} teacherProfile
 */
export function mergeTeacherRosterPatch(base, patch, teacherProfile) {
  const profile = String(teacherProfile || '').trim();
  if (!base || typeof base !== 'object' || !patch || typeof patch !== 'object' || !profile) {
    throw new Error('Invalid merge arguments');
  }
  const out = JSON.parse(JSON.stringify(base));
  const pt = Array.isArray(patch.teachers) ? patch.teachers.map((x) => String(x || '').trim()).filter(Boolean) : [];
  if (pt.length > 1 || (pt.length === 1 && pt[0] !== profile)) {
    throw new Error('Teachers list may only include the signed-in profile');
  }

  const teP = patch.teacherEmails && typeof patch.teacherEmails === 'object' ? patch.teacherEmails : {};
  for (const k of Object.keys(teP)) {
    if (String(k || '').trim() !== profile) throw new Error('Cannot change another teacher login');
  }
  const pwP = patch.teacherPasswords && typeof patch.teacherPasswords === 'object' ? patch.teacherPasswords : {};
  for (const k of Object.keys(pwP)) {
    if (String(k || '').trim() !== profile) throw new Error('Cannot change another teacher password');
  }

  const stBase = out.studentTeachers && typeof out.studentTeachers === 'object' ? out.studentTeachers : {};
  const stPatch = patch.studentTeachers && typeof patch.studentTeachers === 'object' ? patch.studentTeachers : {};

  const patchLists = {
    private: Array.isArray(patch.private) ? patch.private.map((x) => String(x || '').trim()).filter(Boolean) : [],
    speakon: Array.isArray(patch.speakon) ? patch.speakon.map((x) => String(x || '').trim()).filter(Boolean) : [],
    passport: Array.isArray(patch.passport) ? patch.passport.map((x) => String(x || '').trim()).filter(Boolean) : [],
  };

  for (const kind of ['private', 'speakon', 'passport']) {
    const namesInPatch = new Set(patchLists[kind]);
    const cur = Array.isArray(out[kind]) ? [...out[kind]].map((x) => String(x || '').trim()).filter(Boolean) : [];
    const next = cur.filter((name) => {
      const assigned = String(stBase[name] || stPatch[name] || '').trim();
      if (assigned === profile) return namesInPatch.has(name);
      return true;
    });
    const setNext = new Set(next);
    for (const name of patchLists[kind]) {
      const assign = String(stPatch[name] || stBase[name] || '').trim();
      if (!namesInPatch.has(name)) continue;
      if (assign && assign !== profile) {
        throw new Error(`Student ${name} must be assigned to you`);
      }
      if (!setNext.has(name)) {
        next.push(name);
        setNext.add(name);
      }
    }
    out[kind] = next.sort(sortNames);
  }

  const rosterForAllowed = {
    ...out,
    private: out.private,
    speakon: out.speakon,
    passport: out.passport,
    studentTeachers: { ...stBase, ...stPatch },
  };
  const allowedAfter = new Set(studentsAssignedToTeacher(rosterForAllowed, profile));
  for (const n of rosterStudentNamesWithNoTutor(rosterForAllowed)) allowedAfter.add(n);

  for (const name of allRosterStudentNames(patch)) {
    if (!allowedAfter.has(name)) continue;
    const paths = [
      'studentSchools',
      'studentPhones',
      'studentTeachers',
      'studentEmails',
      'studentUsernames',
      'studentPasswords',
      'studentCities',
      'studentCountries',
      'studentBirthDates',
      'studentAges',
      'studentLevels',
      'studentExternalFollowUpLinks',
      'studentGoogleMeetLinks',
    ];
    for (const p of paths) {
      if (!patch[p] || typeof patch[p] !== 'object') continue;
      if (Object.prototype.hasOwnProperty.call(patch[p], name)) {
        if (!out[p]) out[p] = {};
        const assign = String(stPatch[name] || '').trim();
        if (assign && assign !== profile) throw new Error('Cannot assign student to another teacher');
        out[p][name] = patch[p][name];
      }
    }
  }

  if (!out.teacherEmails) out.teacherEmails = {};
  if (!out.teacherPasswords) out.teacherPasswords = {};
  if (teP[profile] !== undefined) out.teacherEmails[profile] = teP[profile];
  if (pwP[profile] !== undefined) out.teacherPasswords[profile] = pwP[profile];

  if (patch.teacherAppRoles && typeof patch.teacherAppRoles === 'object' && patch.teacherAppRoles[profile] !== undefined) {
    if (!out.teacherAppRoles) out.teacherAppRoles = {};
    out.teacherAppRoles[profile] = patch.teacherAppRoles[profile];
  }

  if (patch.gateStaffAccounts && Array.isArray(patch.gateStaffAccounts)) {
    const mine = patch.gateStaffAccounts.filter((e) => String(e?.profileName || '').trim() === profile);
    const gsOut = Array.isArray(out.gateStaffAccounts) ? [...out.gateStaffAccounts] : [];
    const withoutMine = gsOut.filter((e) => String(e?.profileName || '').trim() !== profile);
    out.gateStaffAccounts = [...withoutMine, ...mine];
  }

  const csPatch = Array.isArray(patch.customSchools) ? patch.customSchools : null;
  if (csPatch) {
    const safeAdds = csPatch
      .map((s) => String(s || '').trim())
      .filter((s) => s && customSchoolVisibleToTeacher(base, s, profile));
    const merged = new Set(
      [...(Array.isArray(out.customSchools) ? out.customSchools : []), ...safeAdds]
        .map((s) => String(s || '').trim())
        .filter(Boolean)
    );
    out.customSchools = [...merged].filter(Boolean).sort(sortNames);
  }

  /** Schools the teacher controls = schools with allowed students + visible custom schools (including empty/new). */
  const permittedSchoolTitles = new Set();
  for (const n of allowedAfter) {
    const sch = String(out.studentSchools?.[n] || '').trim();
    if (sch) permittedSchoolTitles.add(sch);
  }
  for (const s of Array.isArray(out.customSchools) ? out.customSchools : []) {
    const title = String(s || '').trim();
    if (title && customSchoolVisibleToTeacher(base, title, profile)) {
      permittedSchoolTitles.add(title);
    }
  }
  const permittedSchoolKeys = new Set([...permittedSchoolTitles].map((t) => normSchoolTitleKey(t)));

  /**
   * Teachers' saved roster includes their permitted schools' metadata (external URL, theme,
   * billing model / config, shared-Meet mode). Without merging those keys here the server
   * silently dropped the change, so the sidebar offsite button kept opening the old link
   * after the next cloud poll or refresh.
   */
  const schoolScopedPaths = [
    'schoolExternalLinks',
    'schoolThemeColors',
    'schoolBillingModels',
    'schoolBillingConfigs',
    'googleMeetSharedLinkModeBySchool',
  ];
  for (const p of schoolScopedPaths) {
    const patchMap = patch[p] && typeof patch[p] === 'object' && !Array.isArray(patch[p]) ? patch[p] : null;
    const outMap = out[p] && typeof out[p] === 'object' && !Array.isArray(out[p]) ? out[p] : null;
    if (outMap) {
      for (const k of Object.keys(outMap)) {
        if (!permittedSchoolKeys.has(normSchoolTitleKey(k))) continue;
        if (!patchMap || !Object.prototype.hasOwnProperty.call(patchMap, k)) {
          delete outMap[k];
        }
      }
    }
    if (patchMap) {
      if (!out[p]) out[p] = {};
      for (const [k, v] of Object.entries(patchMap)) {
        if (permittedSchoolKeys.has(normSchoolTitleKey(k))) {
          out[p][k] = v;
        }
      }
    }
  }

  const namesInRoster = new Set(allRosterStudentNames(out));
  for (const k of Object.keys(out.studentTeachers || {})) {
    if (!namesInRoster.has(k)) delete out.studentTeachers[k];
  }

  return out;
}

const SCHEDULE_UNAVAILABLE_META_KEY = '__unavailableStudentNames';
const SCHEDULE_AVAILABILITY_META_KEY = '__availabilitySlots';

function scheduleSlotMapFromObject(schedule) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) return {};
  const out = {};
  for (const [k, v] of Object.entries(schedule)) {
    if (k === SCHEDULE_UNAVAILABLE_META_KEY) continue;
    if (k === SCHEDULE_AVAILABILITY_META_KEY) continue;
    out[k] = v;
  }
  return out;
}

function normalizedScheduleSlotState(state) {
  if (state == null) return '';
  return String(state).trim().toLowerCase();
}

function isClearingScheduleSlotState(state) {
  const s = normalizedScheduleSlotState(state);
  return !s || s === 'null';
}

/** Scheduled classes, bookings, and school tokens must not be wiped by availability-only sync payloads. */
function isProtectedScheduleSlotState(state) {
  const s = normalizedScheduleSlotState(state);
  if (!s || s === 'null' || s === 'available') return false;
  if (s === 'booked' || s === 'unavailable' || s === 'rescheduled') return true;
  if (/^school::.+::(class|extra|reposition)$/.test(s)) return true;
  if (['navy', 'cyan', 'magenta', 'salmon', 'special'].includes(s)) return true;
  return true;
}

/**
 * Slot-level merge: missing incoming keys keep base slots; protected base slots cannot be
 * wiped by empty/clearing payloads (aligned with client mergeScheduleSlotMapsClient).
 */
function mergeScheduleSlotMaps(baseSlots, incomingSlots, logContext = {}) {
  const base = baseSlots && typeof baseSlots === 'object' ? baseSlots : {};
  const inc = incomingSlots && typeof incomingSlots === 'object' ? incomingSlots : {};
  const merged = { ...base };
  const preserved = [];

  for (const [slotKey, incValue] of Object.entries(inc)) {
    const key = String(slotKey || '').trim();
    if (!key) continue;
    const baseValue = base[key];
    const baseProtected = isProtectedScheduleSlotState(baseValue);
    const incClearing = isClearingScheduleSlotState(incValue);

    if (baseProtected && incClearing) {
      if (incValue == null || normalizedScheduleSlotState(incValue) === 'null') {
        if (/^school::.+::reposition$/.test(normalizedScheduleSlotState(baseValue))) {
          delete merged[key];
          continue;
        }
      }
      preserved.push({ slotKey: key, baseValue, incoming: incValue });
      continue;
    }

    if (incClearing) {
      delete merged[key];
    } else {
      merged[key] = incValue;
    }
  }

  if (preserved.length > 0 && logContext.profile) {
    console.log('[schedule-merge] preserved protected class slots', {
      profile: logContext.profile,
      count: preserved.length,
      slots: preserved.slice(0, 20),
    });
  }
  return merged;
}

function mergeUnavailableStudentNamesMeta(baseMeta, incMeta, mergedSlots) {
  const base = baseMeta && typeof baseMeta === 'object' ? baseMeta : {};
  const inc = incMeta && typeof incMeta === 'object' ? incMeta : {};
  const out = { ...base };
  for (const [slotKey, studentName] of Object.entries(inc)) {
    const key = String(slotKey || '').trim();
    const name = String(studentName || '').trim();
    if (!key) continue;
    if (!name) {
      delete out[key];
      continue;
    }
    out[key] = name;
  }
  const pruned = {};
  for (const [slotKey, studentName] of Object.entries(out)) {
    const st = normalizedScheduleSlotState(mergedSlots[slotKey]);
    if (st === 'booked' || st === 'unavailable' || st === 'rescheduled') {
      pruned[slotKey] = studentName;
    }
  }
  return pruned;
}

function mergeAvailabilitySlotsMeta(baseMeta, incMeta) {
  const base = baseMeta && typeof baseMeta === 'object' ? baseMeta : {};
  const inc = incMeta && typeof incMeta === 'object' ? incMeta : {};
  const out = { ...base };
  for (const [slotKey, flag] of Object.entries(inc)) {
    const key = String(slotKey || '').trim();
    if (!key) continue;
    if (flag) out[key] = true;
    else delete out[key];
  }
  return out;
}

function mergeSingleScheduleRecord(baseSchedule, incomingSchedule, logContext = {}) {
  const base = baseSchedule && typeof baseSchedule === 'object' ? baseSchedule : {};
  const inc = incomingSchedule && typeof incomingSchedule === 'object' ? incomingSchedule : {};
  const mergedSlots = mergeScheduleSlotMaps(
    scheduleSlotMapFromObject(base),
    scheduleSlotMapFromObject(inc),
    logContext
  );
  const mergedMeta = mergeUnavailableStudentNamesMeta(
    base[SCHEDULE_UNAVAILABLE_META_KEY],
    inc[SCHEDULE_UNAVAILABLE_META_KEY],
    mergedSlots
  );
  const mergedAvail = mergeAvailabilitySlotsMeta(
    base[SCHEDULE_AVAILABILITY_META_KEY],
    inc[SCHEDULE_AVAILABILITY_META_KEY]
  );
  const out = { ...mergedSlots };
  if (Object.keys(mergedMeta).length > 0) {
    out[SCHEDULE_UNAVAILABLE_META_KEY] = mergedMeta;
  }
  if (Object.keys(mergedAvail).length > 0) {
    out[SCHEDULE_AVAILABILITY_META_KEY] = mergedAvail;
  }
  return out;
}

export function mergeSchedulesForTeacher(baseSchedules, incomingSchedules, teacherProfile, fullRoster) {
  const profile = String(teacherProfile || '').trim();
  if (!profile) throw new Error('Missing teacher profile');
  const base = baseSchedules && typeof baseSchedules === 'object' ? { ...baseSchedules } : {};
  const inc = incomingSchedules && typeof incomingSchedules === 'object' ? incomingSchedules : {};
  const allowed = new Set([profile]);
  if (fullRoster && typeof fullRoster === 'object') {
    for (const stu of studentsAssignedToTeacher(fullRoster, profile)) {
      allowed.add(stu);
    }
    for (const stu of rosterStudentNamesWithNoTutor(fullRoster)) {
      allowed.add(stu);
    }
  }
  for (const k of Object.keys(inc)) {
    const key = String(k || '').trim();
    if (!key) continue;
    if (!allowed.has(key)) {
      throw new Error('Cannot modify this schedule');
    }
    base[key] = mergeSingleScheduleRecord(base[key], inc[key], { profile: key });
  }
  return base;
}

/**
 * Class Supervisor may merge their own schedule key and supervisees' keys (class-supervisor invitations only).
 * @param {object} baseSchedules
 * @param {object} incomingSchedules
 * @param {string} gateProfile
 * @param {object} fullRoster
 */
export function mergeSchedulesForClassSupervisor(baseSchedules, incomingSchedules, gateProfile, fullRoster) {
  const profile = String(gateProfile || '').trim();
  if (!profile) throw new Error('Missing gate profile');
  if (!fullRoster || typeof fullRoster !== 'object') throw new Error('Roster required');
  const base = baseSchedules && typeof baseSchedules === 'object' ? { ...baseSchedules } : {};
  const inc = incomingSchedules && typeof incomingSchedules === 'object' ? incomingSchedules : {};
  const allowed = new Set([profile]);
  for (const tp of supervisedTeacherProfilesForClassSupervisor(fullRoster, profile)) {
    allowed.add(tp);
  }
  for (const k of Object.keys(inc)) {
    const key = String(k || '').trim();
    if (!key) continue;
    if (!allowed.has(key)) {
      throw new Error('Cannot modify this schedule');
    }
    base[key] = mergeSingleScheduleRecord(base[key], inc[key], { profile: key });
  }
  return base;
}

/**
 * Schedule keys a teacher/gate actor may read — mirrors client `getSchedulesPayloadForCloudPost`
 * and `mergeSchedulesForTeacher` (teacher grid + assigned student grids + unassigned students).
 * @param {object} [fullRoster]
 * @param {string} profile
 * @param {string} role
 * @returns {Set<string>}
 */
function scheduleKeysVisibleToTeacherGateActor(fullRoster, profile, role) {
  const keys = new Set();
  const tp = String(profile || '').trim();
  if (!tp) return keys;

  const addTeacherBundle = (teacherProfile) => {
    const t = String(teacherProfile || '').trim();
    if (!t) return;
    keys.add(t);
    if (!fullRoster || typeof fullRoster !== 'object') return;
    for (const stu of studentsAssignedToTeacher(fullRoster, t)) keys.add(stu);
    for (const stu of rosterStudentNamesWithNoTutor(fullRoster)) keys.add(stu);
  };

  addTeacherBundle(tp);
  if (role === 'gate' && fullRoster && typeof fullRoster === 'object') {
    for (const tname of supervisedTeacherProfilesForSuperior(fullRoster, tp)) {
      addTeacherBundle(tname);
    }
  }
  return keys;
}

/**
 * @param {object} schedules
 * @param {{ role: string, profile: string }} actor
 * @param {object} [fullRoster] — required for gate supervision (merged teacher schedules)
 */
export function filterSchedulesForActor(schedules, actor, fullRoster) {
  if (!schedules || typeof schedules !== 'object') return {};
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  if (role === 'admin') return { ...schedules };
  if ((role === 'teacher' || role === 'gate') && profile) {
    const out = {};
    for (const key of scheduleKeysVisibleToTeacherGateActor(fullRoster, profile, role)) {
      if (schedules[key] !== undefined) out[key] = schedules[key];
    }
    return out;
  }
  if (role === 'student' && profile) {
    return {};
  }
  return {};
}

/**
 * Uses full (unfiltered) roster from KV for tutor assignment checks.
 * @param {object} fullRoster
 * @param {string} studentName
 * @param {{ role: string, profile: string }} actor
 */
export function isStudentVisibleToActor(fullRoster, studentName, actor) {
  const sn = String(studentName || '').trim();
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  if (!sn || !fullRoster) return false;
  if (role === 'admin') return true;
  if (role === 'student') return sn === profile;
  if (role === 'teacher' || role === 'gate') {
    const stMap = fullRoster.studentTeachers && typeof fullRoster.studentTeachers === 'object' ? fullRoster.studentTeachers : {};
    const assigned = tutorValueForStudent(stMap, sn);
    if (!String(assigned || '').trim()) return true;
    if (assigned.toLowerCase() === profile.toLowerCase()) return true;
    if (role === 'gate' && studentsVisibleViaSupervision(fullRoster, profile).has(sn)) return true;
    return false;
  }
  return false;
}
