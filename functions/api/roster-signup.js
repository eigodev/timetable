import { migrateAndPersistRosterKv } from '../lib/roster-auth-migrate.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ALLOWED = new Set(['coordinator', 'class-supervisor', 'teacher', 'assistant']);

function isPlate(pw) {
  return /^@[a-z]{3}\d[a-z]\d{2}$/i.test(String(pw || '').trim());
}

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.schedules_kv;
  const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors });
  }

  if (!secret) {
    return new Response(
      JSON.stringify({ success: false, error: 'TIMETABLE_AUTH_SECRET not set; use local signup or enable auth' }),
      { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  if (!KV) {
    return new Response(JSON.stringify({ success: false, error: 'schedules_kv not configured' }), {
      status: 503,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => null);
    const first = String(body?.first || body?.firstName || '').trim();
    const last = String(body?.last || body?.lastName || '').trim();
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');
    const appRole = String(body?.appRole || body?.role || '').trim();

    if (!first || !last || !username || !password || !appRole || !ALLOWED.has(appRole)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid signup payload' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    if (password.length < 8 || !isPlate(password)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid password format' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
    let roster = (await KV.get('all_roster', 'json')) || {};
    roster = await migrateAndPersistRosterKv(KV, roster);

    const adminU = String(roster?.adminAccount?.username || '').trim().toLowerCase();
    const usernameLc = username.toLowerCase();
    if (usernameLc === '@admin') {
      return new Response(JSON.stringify({ success: false, error: 'Username reserved' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    if (adminU && usernameLc === adminU) {
      return new Response(JSON.stringify({ success: false, error: 'Username taken' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const teachers = Array.isArray(roster.teachers) ? roster.teachers : [];
    const te = roster.teacherEmails && typeof roster.teacherEmails === 'object' ? roster.teacherEmails : {};
    for (const n of teachers) {
      if (String(te[n] || '').trim().toLowerCase() === usernameLc) {
        return new Response(JSON.stringify({ success: false, error: 'Username taken' }), {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const gate = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];
    for (const e of gate) {
      if (String(e?.username || '').trim().toLowerCase() === usernameLc) {
        return new Response(JSON.stringify({ success: false, error: 'Username taken' }), {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const studentNames = [
      ...(Array.isArray(roster.private) ? roster.private : []),
      ...(Array.isArray(roster.speakon) ? roster.speakon : []),
      ...(Array.isArray(roster.passport) ? roster.passport : []),
    ];
    const su = roster.studentUsernames && typeof roster.studentUsernames === 'object' ? roster.studentUsernames : {};
    const se = roster.studentEmails && typeof roster.studentEmails === 'object' ? roster.studentEmails : {};
    for (const n of studentNames) {
      if (
        String(su[n] || '').trim().toLowerCase() === usernameLc ||
        String(se[n] || '').trim().toLowerCase() === usernameLc
      ) {
        return new Response(JSON.stringify({ success: false, error: 'Username taken' }), {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const nameLc = fullName.toLowerCase();
    if (teachers.some((n) => String(n || '').trim().toLowerCase() === nameLc)) {
      return new Response(JSON.stringify({ success: false, error: 'Name already registered' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    if (studentNames.some((n) => String(n || '').trim().toLowerCase() === nameLc)) {
      return new Response(JSON.stringify({ success: false, error: 'Name already registered' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    if (gate.some((e) => String(e?.profileName || '').trim().toLowerCase() === nameLc)) {
      return new Response(JSON.stringify({ success: false, error: 'Name already registered' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const next = JSON.parse(JSON.stringify(roster));
    if (appRole === 'teacher') {
      const tl = Array.isArray(next.teachers) ? [...next.teachers] : [];
      tl.push(fullName);
      tl.sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
      next.teachers = tl;
      if (!next.teacherEmails || typeof next.teacherEmails !== 'object') next.teacherEmails = {};
      if (!next.teacherPasswords || typeof next.teacherPasswords !== 'object') next.teacherPasswords = {};
      next.teacherEmails[fullName] = username;
      next.teacherPasswords[fullName] = password;
      if (!next.teacherAppRoles || typeof next.teacherAppRoles !== 'object') next.teacherAppRoles = {};
      next.teacherAppRoles[fullName] = 'teacher';
    } else {
      const gs = Array.isArray(next.gateStaffAccounts) ? [...next.gateStaffAccounts] : [];
      gs.push({ profileName: fullName, username, password, appRole });
      next.gateStaffAccounts = gs;
    }

    const timestamp = new Date().toISOString();
    await KV.put('all_roster', JSON.stringify(next));
    await KV.put('roster_last_updated', timestamp);

    return new Response(
      JSON.stringify({ success: true, lastUpdated: timestamp, profile: fullName, username }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message || 'error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
