import { coerceSupervisionLink } from './supervision-links.js';
import { kvPutJsonIfChanged, kvPutTextIfChanged } from './kv-safe.js';

/** @typedef {Record<string, unknown>} RosterLike */

function lower(s) {
  return String(s || '').trim().toLowerCase();
}

function teacherProfileSet(roster) {
  const out = new Set();
  const arr = Array.isArray(roster?.teachers) ? roster.teachers : [];
  for (const t of arr) {
    const n = String(t || '').trim();
    if (n) out.add(lower(n));
  }
  return out;
}

/** @param {unknown} roster */
export function rosterGateStaffTuples(roster) {
  const list = Array.isArray(roster?.gateStaffAccounts) ? roster.gateStaffAccounts : [];
  const tuples = [];
  for (const e of list) {
    if (!e || typeof e !== 'object') continue;
    const profileName = String(e.profileName || '').trim();
    const appRole = String(e.appRole || '').trim();
    if (!profileName || !appRole) continue;
    tuples.push({ profileName, appRole });
  }
  return tuples;
}

/** @param {unknown} roster */
function gateStaffKeySet(roster) {
  const out = new Set();
  for (const { profileName, appRole } of rosterGateStaffTuples(roster)) {
    out.add(`${lower(profileName)}::${appRole}`);
  }
  return out;
}

/**
 * Drops supervision links referencing missing teachers or missing gate supervisors.
 * @param {RosterLike} roster
 */
export function sanitizeSupervisionLinksInRoster(roster) {
  if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return roster;
  const arr = roster.supervisionLinks;
  if (!Array.isArray(arr)) return roster;
  const teachers = teacherProfileSet(roster);
  const gateKeys = gateStaffKeySet(roster);

  roster.supervisionLinks = arr.filter((raw) => {
    const c = coerceSupervisionLink(raw);
    if (!c) return false;
    if (!teachers.has(lower(c.teacherProfile))) return false;
    const supKey = `${lower(c.superiorProfile)}::${String(c.superiorAppRole || '').trim()}`;
    return gateKeys.has(supKey);
  });
  return roster;
}

/**
 * Remove alias mappings whose canonical target is not a username in use anymore.
 * @param {RosterLike} roster
 */
export function sanitizeAuthLoginAliases(roster) {
  if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return roster;

  const canonical = new Set();

  const add = (u) => {
    const s = String(u || '').trim().toLowerCase();
    if (s) canonical.add(s);
  };

  const adminU = roster?.adminAccount?.username ? String(roster.adminAccount.username).trim() : '';
  if (adminU) add(adminU);

  const te = roster.teacherEmails && typeof roster.teacherEmails === 'object' ? roster.teacherEmails : {};
  for (const name of Array.isArray(roster.teachers) ? roster.teachers : []) {
    add(te[String(name)]);
  }

  const su =
    roster.studentUsernames && typeof roster.studentUsernames === 'object'
      ? roster.studentUsernames
      : {};

  const students = [
    ...(Array.isArray(roster.private) ? roster.private : []),
    ...(Array.isArray(roster.speakon) ? roster.speakon : []),
    ...(Array.isArray(roster.passport) ? roster.passport : []),
  ];
  for (const st of students) {
    add(su[String(st)]);
  }

  const gs = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];
  for (const e of gs) {
    if (e && typeof e === 'object') add(e.username);
  }

  add('@Admin');

  const rawAliases =
    roster.authLoginAliases && typeof roster.authLoginAliases === 'object' && !Array.isArray(roster.authLoginAliases)
      ? roster.authLoginAliases
      : {};
  const out = { ...rawAliases };
  for (const [key, target] of Object.entries(out)) {
    const t = String(target || '').trim().toLowerCase();
    if (!key || !t) {
      delete out[key];
      continue;
    }
    if (!canonical.has(t)) delete out[key];
  }
  roster.authLoginAliases = out;
  return roster;
}

/**
 * @param {RosterLike} roster
 */
export function sanitizeRosterForAdminPersist(roster) {
  sanitizeSupervisionLinksInRoster(roster);
  sanitizeAuthLoginAliases(roster);
  return roster;
}

const META_KEY = '__unavailableStudentNames';
const BOOKED_LC = 'booked';

function rosterStudentLcSet(roster) {
  const out = new Set();
  const add = (n) => {
    const s = lower(n);
    if (s) out.add(s);
  };
  for (const nm of [...(Array.isArray(roster.private) ? roster.private : [])]) add(nm);
  for (const nm of [...(Array.isArray(roster.speakon) ? roster.speakon : [])]) add(nm);
  for (const nm of [...(Array.isArray(roster.passport) ? roster.passport : [])]) add(nm);
  return out;
}

/** KV schedule keys mirror roster teacher profiles + gate class-supervisor profiles when present. */
function allowedScheduleTeacherKeys(roster) {
  const allowed = new Set();
  const addExact = (n) => {
    const s = String(n || '').trim();
    if (s) allowed.add(s);
  };
  for (const n of Array.isArray(roster?.teachers) ? roster.teachers : []) addExact(n);

  const gs = Array.isArray(roster?.gateStaffAccounts) ? roster.gateStaffAccounts : [];
  for (const e of gs) {
    if (!e || typeof e !== 'object') continue;
    if (String(e.appRole || '').trim() !== 'class-supervisor') continue;
    addExact(String(e.profileName || '').trim());
  }
  return allowed;
}

/**
 * Prune orphan booked slots and meta rows that reference dropped students.
 * @param {Record<string, unknown>} map
 * @param {Set<string>} studentLcSet
 */
export function pruneOneScheduleMap(map, studentLcSet) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return map;
  const metaRaw = map[META_KEY];
  /** @type {Record<string, string>} */
  const meta =
    metaRaw && typeof metaRaw === 'object' && !Array.isArray(metaRaw) ? { ...metaRaw } : {};

  /** @type {Record<string, unknown>} */
  const out = {};

  Object.entries(map).forEach(([slotKey, value]) => {
    if (!slotKey || slotKey === META_KEY) return;
    const stLc =
      typeof value === 'string'
        ? value.trim().toLowerCase()
        : String(value == null ? '' : value).trim().toLowerCase();
    const linkedNameRaw = typeof meta[slotKey] === 'string' ? String(meta[slotKey] || '').trim() : '';

    if (
      typeof value === 'string' &&
      stLc === BOOKED_LC &&
      linkedNameRaw &&
      !studentLcSet.has(lower(linkedNameRaw))
    ) {
      delete meta[slotKey];
      return;
    }
    /** Other states may still carry stale student refs in meta; drop unknown students. */
    if (linkedNameRaw && linkedNameRaw.length && !studentLcSet.has(lower(linkedNameRaw))) {
      delete meta[slotKey];
    }
    out[slotKey] = value;
  });

  if (Object.keys(meta).length > 0) {
    out[META_KEY] = meta;
  }
  return out;
}

export function sanitizeSchedulesObjectForRoster(schedulesRaw, roster) {
  const schedules =
    schedulesRaw && typeof schedulesRaw === 'object' && !Array.isArray(schedulesRaw) ? schedulesRaw : {};
  const allowed = allowedScheduleTeacherKeys(roster);
  const studentLc = rosterStudentLcSet(roster);

  /** @type {Record<string, unknown>} */
  const out = {};

  Object.entries(schedules).forEach(([teacherKey, blob]) => {
    const tk = String(teacherKey || '').trim();
    if (!tk || !allowed.has(tk)) return;
    if (blob == null || typeof blob !== 'object' || Array.isArray(blob)) {
      out[tk] = blob;
      return;
    }
    out[tk] = pruneOneScheduleMap({ ...blob }, studentLc);
  });

  return out;
}

/**
 * Persist schedules pruned against the authoritative roster snapshot.
 * @param {any} KV
 * @param {RosterLike} roster
 */
export async function pruneAndPersistSchedulesForRosterKv(KV, roster) {
  if (!KV || typeof KV.get !== 'function' || typeof KV.put !== 'function') return;

  /** @type {Record<string, unknown>} */
  let cur = {};
  try {
    const j = await KV.get('all_schedules', 'json');
    cur = j && typeof j === 'object' && !Array.isArray(j) ? /** @type {Record<string, unknown>} */ (j) : {};
  } catch {
    cur = {};
  }

  const pruned = sanitizeSchedulesObjectForRoster(cur, roster);

  const schedulesChanged = await kvPutJsonIfChanged(KV, 'all_schedules', pruned);
  if (schedulesChanged) {
    await kvPutTextIfChanged(KV, 'last_updated', new Date().toISOString());
  }
}
