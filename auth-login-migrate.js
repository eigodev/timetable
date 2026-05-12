/**
 * Canonical login usernames: all name tokens (lowercase, diacritics stripped),
 * concatenated, plus "_" — e.g. "Maria   Clara Souza" → "mariaclarasouza_".
 * Collisions: "johnsmith_", "johnsmith_1", "johnsmith_2", …
 *
 * Migrates email-shaped stored logins to canonical usernames and records
 * authLoginAliases so legacy values still resolve at sign-in.
 */
(function authLoginMigrateFactory(global) {
    'use strict';

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

    function buildCanonicalUsernameBaseFromFullName(fullNameRaw) {
        const cleaned = String(fullNameRaw || '').trim().replace(/\s+/g, ' ');
        if (!cleaned) return '';
        const parts = cleaned.split(' ').filter(Boolean);
        const slug = parts.map((p) => normalizeUsername(p)).join('');
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

    function migrateRosterAuthFields(roster) {
        if (!roster || typeof roster !== 'object' || Array.isArray(roster)) return false;

        const aliases =
            roster.authLoginAliases && typeof roster.authLoginAliases === 'object' && !Array.isArray(roster.authLoginAliases)
                ? { ...roster.authLoginAliases }
                : {};

        const teacherEmails = { ...(typeof roster.teacherEmails === 'object' && roster.teacherEmails ? roster.teacherEmails : {}) };
        const teacherPasswords =
            typeof roster.teacherPasswords === 'object' && roster.teacherPasswords ? roster.teacherPasswords : {};
        const studentUsernames = {
            ...(typeof roster.studentUsernames === 'object' && roster.studentUsernames ? roster.studentUsernames : {})
        };
        const studentPasswords =
            typeof roster.studentPasswords === 'object' && roster.studentPasswords ? roster.studentPasswords : {};

        const teachers = Array.isArray(roster.teachers) ? [...roster.teachers] : [];
        const studentNames = [
            ...(Array.isArray(roster.private) ? roster.private : []),
            ...(Array.isArray(roster.speakon) ? roster.speakon : []),
            ...(Array.isArray(roster.passport) ? roster.passport : [])
        ];
        const gateStaffAccounts = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];

        const taken = new Set();
        const adminRaw = roster.adminAccount && typeof roster.adminAccount === 'object' ? roster.adminAccount.username : '';
        const adminU = String(adminRaw || '@Admin').trim().toLowerCase();
        if (adminU) taken.add(adminU);

        teachers.forEach((name) => {
            const L = String(teacherEmails[name] || '').trim();
            if (L && !L.includes('@')) taken.add(L.toLowerCase());
        });
        studentNames.forEach((name) => {
            const L = String(studentUsernames[name] || '').trim();
            if (L && !L.includes('@')) taken.add(L.toLowerCase());
        });
        gateStaffAccounts.forEach((entry) => {
            const L = String(entry && entry.username ? entry.username : '').trim();
            if (L && !L.includes('@')) taken.add(L.toLowerCase());
        });

        let dirty = false;

        teachers
            .slice()
            .sort((a, b) => String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' }))
            .forEach((name) => {
                const n = String(name || '').trim();
                if (!n) return;
                const pw = String(teacherPasswords[n] || '').trim();
                if (!pw) return;
                const cur = String(teacherEmails[n] || '').trim();
                if (cur && !cur.includes('@')) return;
                const base = buildCanonicalUsernameBaseFromFullName(n);
                if (!base) return;
                const neu = pickNextAvailableUsername(base, taken);
                const curLc = lowerKey(cur);
                const neuLc = lowerKey(neu);
                if (cur && curLc !== neuLc) {
                    aliases[curLc] = neu;
                }
                if (cur !== neu) dirty = true;
                teacherEmails[n] = neu;
            });

        studentNames.forEach((name) => {
            const n = String(name || '').trim();
            if (!n) return;
            const pw = String(studentPasswords[n] || '').trim();
            if (!pw) return;
            const cur = String(studentUsernames[n] || '').trim();
            if (cur && !cur.includes('@')) return;
            const base = buildCanonicalUsernameBaseFromFullName(n);
            if (!base) return;
            const neu = pickNextAvailableUsername(base, taken);
            const curLc = lowerKey(cur);
            const neuLc = lowerKey(neu);
            if (cur && curLc !== neuLc) {
                aliases[curLc] = neu;
            }
            if (cur !== neu) dirty = true;
            studentUsernames[n] = neu;
        });

        if (roster.adminAccount && typeof roster.adminAccount === 'object' && roster.adminAccount.username) {
            const au = String(roster.adminAccount.username || '').trim();
            if (au === '@Admin') {
                /* Reserved built-in admin username — do not rewrite. */
            } else if (au.includes('@')) {
                const base = buildCanonicalUsernameBaseFromFullName('admin') || 'admin';
                const neu = pickNextAvailableUsername(base, taken);
                const auLc = lowerKey(au);
                const neuLc = lowerKey(neu);
                if (auLc !== neuLc) {
                    aliases[auLc] = neu;
                }
                roster.adminAccount = { ...roster.adminAccount, username: neu };
                try {
                    localStorage.setItem('timetable_admin_account', JSON.stringify(roster.adminAccount));
                } catch {
                    /* ignore */
                }
                dirty = true;
            }
        }

        roster.teacherEmails = teacherEmails;
        roster.studentUsernames = studentUsernames;
        roster.authLoginAliases = aliases;

        return dirty;
    }

    function resolveAuthLoginTypedFromRoster(roster, raw) {
        const t = String(raw || '').trim();
        if (!t || !roster || !roster.authLoginAliases) return t;
        const map = roster.authLoginAliases;
        if (!map || typeof map !== 'object') return t;
        const hit = map[t.toLowerCase()];
        return hit ? String(hit).trim() : t;
    }

    global.TimeTableAuthMigrate = {
        normalizeUsername,
        buildCanonicalUsernameBaseFromFullName,
        pickNextAvailableUsername,
        migrateRosterAuthFields,
        resolveAuthLoginTypedFromRoster
    };
})(typeof window !== 'undefined' ? window : globalThis);
