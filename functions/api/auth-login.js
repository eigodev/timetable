import { signAuthToken } from '../lib/auth-token.js';
import { kvGetAllRoster } from '../lib/kv-all-roster.js';
import { migrateAndPersistRosterKv } from '../lib/roster-auth-migrate.js';
import { rosterLoginLookup } from '../lib/roster-login.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
      JSON.stringify({
        success: false,
        error: 'TIMETABLE_AUTH_SECRET is not set on the worker; API tokens are disabled.',
      }),
      { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  if (!KV) {
    return new Response(
      JSON.stringify({ success: false, error: 'schedules_kv not configured' }),
      { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'username and password required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    let roster = await kvGetAllRoster(KV);
    if (!roster || typeof roster !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Roster not initialized' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    roster = await migrateAndPersistRosterKv(KV, roster);

    const hit = await rosterLoginLookup(roster, username, password);
    if (!hit) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const profile = String(hit.profile || '').trim();
    const resolvedUsername = String(hit.resolvedUsername || profile || '').trim();
    if (!profile || !hit.role) {
      return new Response(JSON.stringify({ success: false, error: 'Malformed roster account' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const tokenRole = hit.role === 'gate' ? 'gate' : hit.role;
    let gateAppRole = '';
    if (hit.role === 'gate') {
      const gs = Array.isArray(roster.gateStaffAccounts) ? roster.gateStaffAccounts : [];
      const ent = gs.find((e) => String(e?.profileName || '').trim() === profile);
      gateAppRole = String(ent?.appRole || '').trim();
    }
    const tokenPayload = {
      v: 1,
      role: tokenRole,
      profile,
      u: resolvedUsername,
      exp,
      ...(gateAppRole ? { gateAppRole } : {}),
    };
    let token;
    try {
      token = await signAuthToken(tokenPayload, secret);
    } catch (signErr) {
      console.error('[auth-login] signAuthToken', signErr?.message || String(signErr));
      return new Response(JSON.stringify({ success: false, error: 'Token signing failed' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        token,
        role: hit.role,
        profile,
        resolvedUsername,
        expiresAtEpochSec: exp,
        ...(gateAppRole ? { gateAppRole } : {}),
      }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e || 'error');
    return new Response(JSON.stringify({ success: false, error: msg || 'error' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
