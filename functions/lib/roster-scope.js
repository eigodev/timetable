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

/** @param {string} teacherProfile */
export function studentsAssignedToTeacher(roster, teacherProfile) {
  const tutor = String(teacherProfile || '').trim();
  if (!tutor) return new Set();
  const st = roster?.studentTeachers && typeof roster.studentTeachers === 'object' ? roster.studentTeachers : {};
  const out = new Set();
  for (const name of allRosterStudentNames(roster)) {
    if (String(st[name] || '').trim() === tutor) out.add(name);
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
    return r;
  }

  if (role === 'teacher' || role === 'gate') {
    const tp = profile;
    const assigned = studentsAssignedToTeacher(roster, tp);
    const inTeachers = (Array.isArray(roster.teachers) ? roster.teachers : []).some(
      (n) => String(n || '').trim() === tp
    );
    const teacherRow = inTeachers ? [tp] : isGateProfile(roster, tp) ? [tp] : [];

    const r = JSON.parse(JSON.stringify(roster));
    const allowedStudents = new Set(assigned);

    const keepStudent = (name) => allowedStudents.has(String(name || '').trim());
    r.private = (Array.isArray(r.private) ? r.private : []).filter(keepStudent);
    r.speakon = (Array.isArray(r.speakon) ? r.speakon : []).filter(keepStudent);
    r.passport = (Array.isArray(r.passport) ? r.passport : []).filter(keepStudent);

    r.teachers = [...teacherRow].sort(sortNames);

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
    r.customSchools = cs.filter((s) => schoolsNeeded.has(String(s || '').trim()));

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
      if (assign !== profile) {
        throw new Error(`Student ${name} must be assigned to you`);
      }
      if (!setNext.has(name)) {
        next.push(name);
        setNext.add(name);
      }
    }
    out[kind] = next.sort(sortNames);
  }

  const allowedAfter = studentsAssignedToTeacher(
    {
      ...out,
      private: out.private,
      speakon: out.speakon,
      passport: out.passport,
      studentTeachers: { ...stBase, ...stPatch },
    },
    profile
  );

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
    const permittedSchools = new Set();
    for (const n of allowedAfter) {
      const sch = String(out.studentSchools?.[n] || '').trim();
      if (sch) permittedSchools.add(sch);
    }
    const safeAdds = csPatch.map(String).filter((s) => s && permittedSchools.has(String(s).trim()));
    const merged = new Set(
      [...(Array.isArray(out.customSchools) ? out.customSchools : []), ...safeAdds].map(String)
    );
    out.customSchools = [...merged].filter(Boolean).sort(sortNames);
  }

  const namesInRoster = new Set(allRosterStudentNames(out));
  for (const k of Object.keys(out.studentTeachers || {})) {
    if (!namesInRoster.has(k)) delete out.studentTeachers[k];
  }

  return out;
}

export function mergeSchedulesForTeacher(baseSchedules, incomingSchedules, teacherProfile) {
  const profile = String(teacherProfile || '').trim();
  if (!profile) throw new Error('Missing teacher profile');
  const base = baseSchedules && typeof baseSchedules === 'object' ? { ...baseSchedules } : {};
  const inc = incomingSchedules && typeof incomingSchedules === 'object' ? incomingSchedules : {};
  for (const k of Object.keys(inc)) {
    if (String(k || '').trim() !== profile) {
      throw new Error('Cannot modify another teacher schedule');
    }
  }
  if (Object.prototype.hasOwnProperty.call(inc, profile)) {
    base[profile] = inc[profile];
  }
  return base;
}

export function filterSchedulesForActor(schedules, actor) {
  if (!schedules || typeof schedules !== 'object') return {};
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  if (role === 'admin') return { ...schedules };
  if ((role === 'teacher' || role === 'gate') && profile) {
    const slot = schedules[profile];
    return slot !== undefined ? { [profile]: slot } : {};
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
    const st = fullRoster.studentTeachers && fullRoster.studentTeachers[sn];
    return String(st || '').trim() === profile;
  }
  return false;
}
