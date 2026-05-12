import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { kvGetAllRoster } from '../lib/kv-all-roster.js';
import { migrateAndPersistRosterKv } from '../lib/roster-auth-migrate.js';
import { coerceSupervisionLink, getSupervisionLinksArray, isSupervisorInviterAppRole } from '../lib/supervision-links.js';

const corsHeaders = (extra = {}) =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extra,
  });

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
    return new Response(JSON.stringify({ success: false, error: 'Only coordinators and class supervisors may cancel' }), {
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
  const linkId = String(body?.linkId || '').trim();
  if (!linkId) {
    return new Response(JSON.stringify({ success: false, error: 'linkId required' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let roster = await kvGetAllRoster(KV);
  if (!roster || typeof roster !== 'object') {
    return new Response(JSON.stringify({ success: false, error: 'Roster not found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
  roster = await migrateAndPersistRosterKv(KV, roster);

  const rawList = Array.isArray(roster.supervisionLinks) ? roster.supervisionLinks : [];
  const idx = rawList.findIndex((r) => String(r?.id || '').trim() === linkId);
  if (idx === -1) {
    return new Response(JSON.stringify({ success: false, error: 'Invite not found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const cur = coerceSupervisionLink(rawList[idx]);
  if (!cur || String(cur.superiorProfile || '').trim() !== profile) {
    return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (cur.status !== 'pending') {
    return new Response(JSON.stringify({ success: false, error: 'Only pending invitations can be cancelled' }), {
      status: 409,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const respondedAt = new Date().toISOString();
  const updated = {
    ...rawList[idx],
    status: 'revoked',
    respondedAt,
    cancelledBySuperior: true,
  };

  const coerced = coerceSupervisionLink(updated);
  if (!coerced) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid link data' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const next = JSON.parse(JSON.stringify(roster));
  const nextLinks = Array.isArray(next.supervisionLinks) ? [...next.supervisionLinks] : [];
  nextLinks[idx] = coerced;
  next.supervisionLinks = nextLinks;

  const timestamp = new Date().toISOString();
  await KV.put('all_roster', JSON.stringify(next));
  await KV.put('roster_last_updated', timestamp);

  return new Response(JSON.stringify({ success: true, lastUpdated: timestamp, link: coerced }), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
