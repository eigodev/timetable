/** @typedef {'pending' | 'active' | 'revoked' | 'declined'} SupervisionStatus */

export const SUPERVISION_STATUSES = /** @type {const} */ (['pending', 'active', 'revoked', 'declined']);

export const SUPERVISOR_INVITER_APP_ROLES = /** @type {const} */ (['coordinator', 'class-supervisor']);

const INVITER_SET = new Set(SUPERVISOR_INVITER_APP_ROLES);

export function normSchoolTitleKey(title) {
  return String(title || '').trim().toLowerCase();
}

export function isSupervisorInviterAppRole(role) {
  return INVITER_SET.has(String(role || '').trim());
}

/**
 * Status transitions: pending → active | declined; active → revoked; declined/revoked terminal.
 * @param {SupervisionStatus} from
 * @param {SupervisionStatus} to
 */
export function isValidSupervisionStatusTransition(from, to) {
  const a = String(from || '').trim();
  const b = String(to || '').trim();
  if (!SUPERVISION_STATUSES.includes(a) || !SUPERVISION_STATUSES.includes(b)) return false;
  if (a === 'pending') return b === 'active' || b === 'declined';
  if (a === 'active') return b === 'revoked';
  return false;
}

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
export function coerceSupervisionLink(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const id = String(raw.id || '').trim();
  const superiorProfile = String(raw.superiorProfile || '').trim();
  const superiorAppRole = String(raw.superiorAppRole || '').trim();
  const teacherProfile = String(raw.teacherProfile || '').trim();
  const status = String(raw.status || '').trim();
  const schoolTitles = Array.isArray(raw.schoolTitles) ? raw.schoolTitles.map((s) => String(s || '').trim()).filter(Boolean) : [];
  if (!id || !superiorProfile || !teacherProfile || !SUPERVISION_STATUSES.includes(status)) return null;
  if (!INVITER_SET.has(superiorAppRole)) return null;
  const createdAt = String(raw.createdAt || '').trim();
  const respondedAt = String(raw.respondedAt || '').trim();
  return {
    id,
    superiorProfile,
    superiorAppRole,
    teacherProfile,
    schoolTitles,
    status,
    ...(createdAt ? { createdAt } : {}),
    ...(respondedAt ? { respondedAt } : {}),
  };
}

/**
 * @param {unknown} roster
 * @returns {object[]}
 */
export function getSupervisionLinksArray(roster) {
  const arr = roster?.supervisionLinks;
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const row of arr) {
    const c = coerceSupervisionLink(row);
    if (c) out.push(c);
  }
  return out;
}

/**
 * Students visible to a superior via active school-scoped supervision (assigned students only).
 * @param {object} roster - full roster
 * @param {string} superiorProfile
 * @returns {Set<string>}
 */
export function studentsVisibleViaSupervision(roster, superiorProfile) {
  const sup = String(superiorProfile || '').trim();
  const out = new Set();
  if (!sup || !roster) return out;
  const stMap = roster.studentTeachers && typeof roster.studentTeachers === 'object' ? roster.studentTeachers : {};
  const schMap = roster.studentSchools && typeof roster.studentSchools === 'object' ? roster.studentSchools : {};
  const privateL = Array.isArray(roster.private) ? roster.private : [];
  const speakonL = Array.isArray(roster.speakon) ? roster.speakon : [];
  const passportL = Array.isArray(roster.passport) ? roster.passport : [];
  const allNames = [...privateL, ...speakonL, ...passportL].map((n) => String(n || '').trim()).filter(Boolean);

  function tutorFor(nm) {
    const direct = String(stMap[nm] || '').trim();
    if (direct) return direct;
    const nlc = nm.toLowerCase();
    const key = Object.keys(stMap).find((k) => String(k || '').trim().toLowerCase() === nlc);
    return key ? String(stMap[key] || '').trim() : '';
  }

  for (const link of getSupervisionLinksArray(roster)) {
    if (String(link.superiorProfile || '').trim() !== sup) continue;
    if (link.status !== 'active') continue;
    const teacherProf = String(link.teacherProfile || '').trim();
    const schoolKeys = new Set((link.schoolTitles || []).map(normSchoolTitleKey));
    if (!teacherProf || schoolKeys.size === 0) continue;
    for (const name of allNames) {
      const tutor = tutorFor(name);
      if (!tutor || tutor.toLowerCase() !== teacherProf.toLowerCase()) continue;
      const sch = String(schMap[name] || '').trim();
      if (!sch) continue;
      if (schoolKeys.has(normSchoolTitleKey(sch))) out.add(name);
    }
  }
  return out;
}

/**
 * Teacher profile names whose schedules a gate superior may read (active links only).
 * @param {object} roster
 * @param {string} superiorProfile
 * @returns {Set<string>}
 */
export function supervisedTeacherProfilesForSuperior(roster, superiorProfile) {
  const sup = String(superiorProfile || '').trim();
  const out = new Set();
  if (!sup) return out;
  for (const link of getSupervisionLinksArray(roster)) {
    if (String(link.superiorProfile || '').trim() !== sup) continue;
    if (link.status !== 'active') continue;
    const tp = String(link.teacherProfile || '').trim();
    if (tp) out.add(tp);
  }
  return out;
}

/**
 * Supervisees whose active link was created by a Class Supervisor (inviter role), for schedule merge rights.
 * @param {object} roster
 * @param {string} superiorProfile
 * @returns {Set<string>}
 */
export function supervisedTeacherProfilesForClassSupervisor(roster, superiorProfile) {
  const sup = String(superiorProfile || '').trim();
  const out = new Set();
  if (!sup) return out;
  for (const link of getSupervisionLinksArray(roster)) {
    if (String(link.superiorProfile || '').trim() !== sup) continue;
    if (link.status !== 'active') continue;
    if (String(link.superiorAppRole || '').trim() !== 'class-supervisor') continue;
    const tp = String(link.teacherProfile || '').trim();
    if (tp) out.add(tp);
  }
  return out;
}

/**
 * @param {object[]} links
 * @param {{ role: string, profile: string }} actor
 */
export function filterSupervisionLinksForActor(links, actor) {
  const role = String(actor?.role || '').trim();
  const profile = String(actor?.profile || '').trim();
  const arr = Array.isArray(links) ? links : [];
  if (role === 'admin') return arr.map((x) => ({ ...x }));
  if (role === 'teacher') {
    return arr.filter((l) => String(l?.teacherProfile || '').trim() === profile);
  }
  if (role === 'gate') {
    return arr.filter((l) => String(l?.superiorProfile || '').trim() === profile);
  }
  return [];
}
