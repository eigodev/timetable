const STORED_DEFAULT_ADMIN_USERNAME = '@Admin';
const STORED_DEFAULT_ADMIN_PASSWORD = 'admin';

function normalizeUsername(value) {
  const raw = String(value || '');
  let normalized = raw;
  try {
    normalized = raw.normalize('NFD');
  } catch {
    normalized = raw;
  }
  return normalized
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** First token + last token only (handles middle names): "Maria Clara Souza" → mariasouza_ */
function buildCanonicalUsernameBaseFromFullName(fullNameRaw) {
  const cleaned = String(fullNameRaw || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  const first = normalizeUsername(parts[0]);
  const last =
    parts.length === 1
      ? ''
      : normalizeUsername(parts[parts.length - 1]);
  const slug = `${first}${last}`;
  if (!slug) return '';
  return `${slug}_`;
}

function pickNextAvailableUsername(baseWithTrailingUnderscore, takenLowercaseSet) {
  const base = String(baseWithTrailingUnderscore || '').trim();
  if (!base) return '';
  const root = base.endsWith('_') ? base.slice(0, -1) : base;
  const primary = base.endsWith('_') ? base : `${root}_`;
  const tryAdd = (s) => {
    const lc = s.toLowerCase();
    if (takenLowercaseSet.has(lc)) return false;
    takenLowercaseSet.add(lc);
    return true;
  };
  if (tryAdd(primary)) return primary;
  let n = 1;
  while (n < 100000) {
    const candidate = `${root}_${n}`;
    if (tryAdd(candidate)) return candidate;
    n += 1;
  }
  return `${root}_${Date.now()}`;
}

function lowerKey(s) {
  return String(s || '').trim().toLowerCase();
}

/**
 * Email-shaped or empty logins → canonical first+last+_ usernames; gate staff included.
 * Lowercases usernames; extends authLoginAliases so old emails still work at sign-in.
 * Ensures roster.adminAccount exists for dashboard (@Admin / plaintext default when missing).
 * @returns {Promise<boolean>} true if roster was mutated (caller should KV.put)
 */
export async function migrateRosterAuthInPlace(roster) {
  if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return false;

  let dirty = false;

  const aliases =
    roster.authLoginAliases && typeof roster.authLoginAliases === 'object' && !Array.isArray(roster.authLoginAliases)
      ? { ...roster.authLoginAliases }
      : {};

  const teacherEmails = { ...(typeof roster.teacherEmails === 'object' && roster.teacherEmails ? roster.teacherEmails : {}) };
  const teacherPasswords =
    typeof roster.teacherPasswords === 'object' && roster.teacherPasswords ? roster.teacherPasswords : {};
  const studentUsernames = {
    ...(typeof roster.studentUsernames === 'object' && roster.studentUsernames ? roster.studentUsernames : {}),
  };
  const studentPasswords =
    typeof roster.studentPasswords === 'object' && roster.studentPasswords ? roster.studentPasswords : {};

  const teachers = Array.isArray(roster.teachers) ? [...roster.teachers] : [];
  const studentNames = [
    ...(Array.isArray(roster.private) ? roster.private : []),
    ...(Array.isArray(roster.speakon) ? roster.speakon : []),
    ...(Array.isArray(roster.passport) ? roster.passport : []),
  ];
  const gateStaffAccounts = Array.isArray(roster.gateStaffAccounts)
    ? roster.gateStaffAccounts.map((e) => (e && typeof e === 'object' ? { ...e } : {}))
    : [];

  const taken = new Set();

  const reserve = (u) => {
    const s = String(u || '').trim().toLowerCase();
    if (s) taken.add(s);
  };

  teachers.forEach((name) => {
    const L = String(teacherEmails[name] || '').trim();
    if (L) reserve(L);
  });
  studentNames.forEach((name) => {
    const L = String(studentUsernames[name] || '').trim();
    if (L) reserve(L);
  });
  gateStaffAccounts.forEach((entry) => {
    const L = String(entry?.username || '').trim();
    if (L) reserve(L);
  });

  if (roster.adminAccount && typeof roster.adminAccount === 'object' && roster.adminAccount.username) {
    reserve(roster.adminAccount.username);
  }
  reserve(STORED_DEFAULT_ADMIN_USERNAME);

  teachers
    .slice()
    .sort((a, b) => String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' }))
    .forEach((name) => {
      const n = String(name || '').trim();
      if (!n) return;
      const pw = String(teacherPasswords[n] || '').trim();
      if (!pw) return;
      let curWas = String(teacherEmails[n] || '').trim();
      const base = buildCanonicalUsernameBaseFromFullName(n) || `${normalizeUsername(n)}_`;
      const scratch = new Set(taken);
      const curLcPre = lowerKey(curWas);
      if (curLcPre && !curWas.includes('@')) scratch.delete(curLcPre);
      const neu = pickNextAvailableUsername(base || 'profile_', scratch);
      if (!neu) return;
      if (teacherEmails[n] !== neu) {
        teacherEmails[n] = neu;
        dirty = true;
      }
      if (lowerKey(curWas) && lowerKey(curWas) !== lowerKey(neu)) {
        aliases[lowerKey(curWas)] = neu;
      }
      reserve(neu);
    });

  studentNames
    .slice()
    .sort((a, b) => String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' }))
    .forEach((name) => {
    const n = String(name || '').trim();
    if (!n) return;
    const pw = String(studentPasswords[n] || '').trim();
    if (!pw) return;
    const curWas = String(studentUsernames[n] || '').trim();
    const base = buildCanonicalUsernameBaseFromFullName(n) || `${normalizeUsername(n)}_`;
    const scratch = new Set(taken);
    const curLcPre = lowerKey(curWas);
    if (curLcPre && !curWas.includes('@')) scratch.delete(curLcPre);
    const neu = pickNextAvailableUsername(base || 'profile_', scratch);
    if (!neu) return;
    if (studentUsernames[n] !== neu) {
      studentUsernames[n] = neu;
      dirty = true;
    }
    if (lowerKey(curWas) && lowerKey(curWas) !== lowerKey(neu)) {
      aliases[lowerKey(curWas)] = neu;
    }
    reserve(neu);
  });

  gateStaffAccounts
    .map((_, idx) => idx)
    .sort((ai, bi) => {
      const a = gateStaffAccounts[ai]?.profileName;
      const b = gateStaffAccounts[bi]?.profileName;
      return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
    })
    .forEach((idx) => {
      const entry = gateStaffAccounts[idx];
      const profileName = String(entry.profileName || '').trim();
      const pw = String(entry.password || '').trim();
      if (!profileName || !pw) return;
      const curWas = String(entry.username || '').trim();
      const base = buildCanonicalUsernameBaseFromFullName(profileName) || `${normalizeUsername(profileName)}_`;
      const scratch = new Set(taken);
      const curLcPre = lowerKey(curWas);
      if (curLcPre && !curWas.includes('@')) scratch.delete(curLcPre);
      const neu = pickNextAvailableUsername(base || 'profile_', scratch);
      if (!neu) return;
      if (gateStaffAccounts[idx].username !== neu) {
        gateStaffAccounts[idx].username = neu;
        dirty = true;
      }
      if (lowerKey(curWas) && lowerKey(curWas) !== lowerKey(neu)) {
        aliases[lowerKey(curWas)] = neu;
      }
      reserve(neu);
    });

  if (roster.adminAccount && typeof roster.adminAccount === 'object' && roster.adminAccount.username) {
    const au = String(roster.adminAccount.username || '').trim();
    if (au.toLowerCase() === '@admin' || au === '@Admin' || au === 'admin_') {
      if (au !== STORED_DEFAULT_ADMIN_USERNAME) {
        aliases[lowerKey(au)] = STORED_DEFAULT_ADMIN_USERNAME;
        roster.adminAccount = { ...roster.adminAccount, username: STORED_DEFAULT_ADMIN_USERNAME };
        dirty = true;
      }
    } else if (au.includes('@')) {
      let base = buildCanonicalUsernameBaseFromFullName('admin');
      if (!base) base = 'admin_';
      const neu = pickNextAvailableUsername(base, taken);
      const auLc = lowerKey(au);
      const neuLc = lowerKey(neu);
      if (auLc !== neuLc) {
        aliases[auLc] = neu;
      }
      roster.adminAccount = { ...roster.adminAccount, username: neu };
      dirty = true;
    }
  }

  let adminObj = roster.adminAccount && typeof roster.adminAccount === 'object' ? { ...roster.adminAccount } : {};
  let adminU = String(adminObj.username || '').trim();
  let adminH = String(adminObj.passwordHash || '').trim();

  if (!adminH) {
    /** Plain credential for dashboard + roster-login verifyStoredPassword plaintext path */
    adminObj.passwordHash = STORED_DEFAULT_ADMIN_PASSWORD;
    adminH = adminObj.passwordHash;
    dirty = true;
  }
  if (!adminU) {
    adminObj.username = STORED_DEFAULT_ADMIN_USERNAME;
    adminU = STORED_DEFAULT_ADMIN_USERNAME;
    dirty = true;
  } else if (adminU.toLowerCase() === '@admin' && adminU !== STORED_DEFAULT_ADMIN_USERNAME) {
    aliases[lowerKey(adminU)] = STORED_DEFAULT_ADMIN_USERNAME;
    adminObj.username = STORED_DEFAULT_ADMIN_USERNAME;
    dirty = true;
  }

  roster.adminAccount = adminObj;
  roster.teacherEmails = teacherEmails;
  roster.studentUsernames = studentUsernames;
  roster.gateStaffAccounts = gateStaffAccounts;
  roster.authLoginAliases = aliases;

  return dirty;
}

/**
 * Runs {@link migrateRosterAuthInPlace} and persists to KV when the roster changed.
 * @param {any} KV
 * @param {Record<string, unknown>} roster
 * @returns {Promise<Record<string, unknown>>}
 */
export async function migrateAndPersistRosterKv(KV, roster) {
  if (!roster || typeof roster !== 'object' || Array.isArray(roster)) {
    return roster;
  }
  let dirty = false;
  try {
    dirty = await migrateRosterAuthInPlace(roster);
  } catch (e) {
    console.error('[migrateRosterAuthInPlace]', e?.message || String(e));
    return roster;
  }
  if (dirty && KV && typeof KV.put === 'function') {
    try {
      await KV.put('all_roster', JSON.stringify(roster));
      await KV.put('roster_last_updated', new Date().toISOString());
    } catch (e) {
      console.error('[migrateAndPersistRosterKv] KV.put', e?.message || String(e));
    }
  }
  return roster;
}
