import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { migrateAndPersistRosterKv } from '../lib/roster-auth-migrate.js';
import {
  coerceSupervisionLink,
  isSupervisorInviterAppRole,
  getSupervisionLinksArray,
  blocksDuplicateSupervisionInviteStatus,
} from '../lib/supervision-links.js';

const corsHeaders = (extra = {}) =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extra,
  });

function resolveAuthLoginTypedFromRoster(roster, raw) {
  const t = String(raw || '').trim();
  if (!t || !roster?.authLoginAliases || typeof roster.authLoginAliases !== 'object') return t;
  const hit = roster.authLoginAliases[t.toLowerCase()];
  return hit ? String(hit).trim() : t;
}

function teacherProfileFromUsername(roster, usernameRaw) {
  const resolved = resolveAuthLoginTypedFromRoster(roster, usernameRaw);
  const want = String(resolved || '').trim().toLowerCase();
  if (!want) return '';
  const emails = roster?.teacherEmails && typeof roster.teacherEmails === 'object' ? roster.teacherEmails : {};
  for (const name of Object.keys(emails)) {
    if (String(emails[name] || '').trim().toLowerCase() === want) return String(name || '').trim();
  }
  return '';
}

function hasBlockingLink(links, superiorProfile, teacherProfile) {
  const sup = String(superiorProfile || '').trim();
  const teach = String(teacherProfile || '').trim();
  for (const row of links) {
    if (String(row.superiorProfile || '').trim() !== sup) continue;
    if (String(row.teacherProfile || '').trim() !== teach) continue;
    if (blocksDuplicateSupervisionInviteStatus(row.status)) return true;
  }
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.schedules_kv;
  const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (!KV) {
    return new Response(JSON.stringify({ success: false, error: 'schedules_kv not configured' }), {
      status: 503,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const strictBlock = rejectIfStrictAuthUnconfigured(env, () => ({
    ...corsHeaders(),
    'Content-Type': 'application/json',
  }));
  if (strictBlock) return strictBlock;

  const auth = await resolveRequestAuth(request, secret || null);
  if (auth.legacy || auth.error) {
    return (
      auth.error ||
      new Response(JSON.stringify({ success: false, error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    );
  }

  const role = auth.payload.role;
  const profile = String(auth.payload.profile || '').trim();
  const gateAppRole = String(auth.payload.gateAppRole || '').trim();

  if (role !== 'gate' || !isSupervisorInviterAppRole(gateAppRole)) {
    return new Response(JSON.stringify({ success: false, error: 'Only coordinators and class supervisors may invite' }), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const teacherProfileRaw = String(body?.teacherProfile || '').trim();
  const teacherUsername = String(body?.teacherUsername || '').trim();

  if (!teacherProfileRaw && !teacherUsername) {
    return new Response(JSON.stringify({ success: false, error: 'Teacher username is required' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let roster = await KV.get('all_roster', 'json');
  if (!roster || typeof roster !== 'object') {
    return new Response(JSON.stringify({ success: false, error: 'Roster not found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
  roster = await migrateAndPersistRosterKv(KV, roster);

  let teacherProfile = teacherProfileRaw;
  if (!teacherProfile && teacherUsername) {
    teacherProfile = teacherProfileFromUsername(roster, teacherUsername);
  }

  if (!teacherProfile) {
    return new Response(
      JSON.stringify({ success: false, error: 'No teacher account uses that username. Check spelling and try again.' }),
      {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  }

  const teachers = Array.isArray(roster.teachers) ? roster.teachers : [];
  if (!teachers.some((n) => String(n || '').trim() === teacherProfile)) {
    return new Response(JSON.stringify({ success: false, error: 'Unknown teacher' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (teacherProfile.toLowerCase() === profile.toLowerCase()) {
    return new Response(JSON.stringify({ success: false, error: 'Cannot invite yourself' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const links = getSupervisionLinksArray(roster);
  if (hasBlockingLink(links, profile, teacherProfile)) {
    return new Response(JSON.stringify({ success: false, error: 'Invite or active link already exists' }), {
      status: 409,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const row = coerceSupervisionLink({
    id,
    superiorProfile: profile,
    superiorAppRole: gateAppRole,
    teacherProfile,
    schoolTitles: [],
    status: 'pending',
    createdAt,
    expiresAt,
  });

  const next = JSON.parse(JSON.stringify(roster));
  const rawList = Array.isArray(next.supervisionLinks) ? [...next.supervisionLinks] : [];
  rawList.push(row);
  next.supervisionLinks = rawList;

  const timestamp = new Date().toISOString();
  await KV.put('all_roster', JSON.stringify(next));
  await KV.put('roster_last_updated', timestamp);

  return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, link: row }), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
