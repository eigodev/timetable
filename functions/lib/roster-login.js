import { verifyStoredPassword } from './password-verify.js';

/** Hardcoded emergency / default admin only; must match client + script.js. Not stored in roster. */
const BUILTIN_ADMIN_USERNAME = '@Admin';
const BUILTIN_ADMIN_PASSWORD = 'admin';

function normalizeAdminAccount(account) {
  if (!account || typeof account !== 'object' || Array.isArray(account)) return null;
  const username = String(account.username || '').trim();
  const passwordHash = String(account.passwordHash || '').trim();
  if (!username || !passwordHash) return null;
  return { username, passwordHash };
}

function normalizeStudentLoginUsernameKey(value) {
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

function studentGateLoginAccountMatches(typedRaw, accountUsernameRaw) {
  const typed = String(typedRaw || '').trim();
  const acc = String(accountUsernameRaw || '').trim();
  if (!typed || !acc) return false;
  if (typed.toLowerCase() === acc.toLowerCase()) return true;
  const a = normalizeStudentLoginUsernameKey(acc);
  const b = normalizeStudentLoginUsernameKey(typed);
  return !!a && a === b;
}

function resolveAuthLoginTypedFromRoster(roster, raw) {
  const t = String(raw || '').trim();
  if (!t || !roster || !roster.authLoginAliases) return t;
  const map = roster.authLoginAliases;
  if (!map || typeof map !== 'object') return t;
  const hit = map[t.toLowerCase()];
  return hit ? String(hit).trim() : t;
}

function getRosterAuthAccounts(roster) {
  if (!roster || typeof roster !== 'object') return [];
  const accounts = [];
  const teacherLogins = roster.teacherEmails && typeof roster.teacherEmails === 'object' ? roster.teacherEmails : {};
  const teacherPasswords = roster.teacherPasswords && typeof roster.teacherPasswords === 'object' ? roster.teacherPasswords : {};
  const teachers = Array.isArray(roster.teachers) ? roster.teachers : [];
  teachers.forEach((name) => {
    const username = String(teacherLogins[name] || '').trim();
    const passwordHash = String(teacherPasswords[name] || '').trim();
    if (username && passwordHash) {
      accounts.push({
        kind: 'teacher',
        profileName: String(name || '').trim(),
        username,
        passwordHash,
      });
    }
  });

  const studentUsernames = roster.studentUsernames && typeof roster.studentUsernames === 'object' ? roster.studentUsernames : {};
  const studentPasswords = roster.studentPasswords && typeof roster.studentPasswords === 'object' ? roster.studentPasswords : {};
  [
    ...(Array.isArray(roster.private) ? roster.private : []),
    ...(Array.isArray(roster.speakon) ? roster.speakon : []),
    ...(Array.isArray(roster.passport) ? roster.passport : []),
  ].forEach((name) => {
    const passwordHash = String(studentPasswords[name] || '').trim();
    if (!passwordHash) return;
    const username = String(studentUsernames[name] || '').trim();
    if (username) {
      accounts.push({
        kind: 'student',
        profileName: String(name || '').trim(),
        username,
        passwordHash,
      });
    }
  });

  const gateStaff = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];
  gateStaff.forEach((entry) => {
    const username = String(entry.username || '').trim();
    const passwordHash = String(entry.password || '').trim();
    const profileName = String(entry.profileName || '').trim();
    if (!username || !passwordHash || !profileName) return;
    accounts.push({
      kind: 'gate',
      profileName,
      username,
      passwordHash,
    });
  });
  return accounts;
}

/**
 * @returns {Promise<null | { role: string, profile: string, resolvedUsername: string }>}
 */
export async function rosterLoginLookup(roster, usernameTyped, passwordTyped) {
  const usernameRaw = String(usernameTyped || '').trim();
  const password = String(passwordTyped || '')
    .replace(/\u200b|\uFEFF|\u2060/g, '')
    .trim();
  if (!usernameRaw || !password) return null;

  if (usernameRaw.toLowerCase() === BUILTIN_ADMIN_USERNAME.toLowerCase() && password === BUILTIN_ADMIN_PASSWORD) {
    return {
      role: 'admin',
      profile: BUILTIN_ADMIN_USERNAME,
      resolvedUsername: BUILTIN_ADMIN_USERNAME,
    };
  }

  const usernameEff = resolveAuthLoginTypedFromRoster(roster, usernameRaw);
  const storedAccount = normalizeAdminAccount(roster?.adminAccount);
  if (storedAccount) {
    if (usernameEff.toLowerCase() === storedAccount.username.toLowerCase()) {
      const okPw = await verifyStoredPassword(storedAccount.passwordHash, password);
      return okPw
        ? { role: 'admin', profile: storedAccount.username, resolvedUsername: storedAccount.username }
        : null;
    }
  }

  const accounts = getRosterAuthAccounts(roster);
  const match = accounts.find((a) => studentGateLoginAccountMatches(usernameEff, a.username));
  if (match) {
    const okPw = await verifyStoredPassword(match.passwordHash, password);
    if (!okPw) return null;
    if (match.kind === 'teacher') {
      return { role: 'teacher', profile: match.profileName, resolvedUsername: match.username };
    }
    if (match.kind === 'student') {
      return { role: 'student', profile: match.profileName, resolvedUsername: match.username };
    }
    if (match.kind === 'gate') {
      return { role: 'gate', profile: match.profileName, resolvedUsername: match.username };
    }
  }

  return null;
}
