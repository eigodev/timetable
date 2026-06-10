import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { kvGetAllRoster, kvGetRosterLastUpdated } from '../lib/kv-all-roster.js';
import { migrateAndPersistRosterKv, migrateRosterAuthInPlace } from '../lib/roster-auth-migrate.js';
import { pruneAndPersistSchedulesForRosterKv, sanitizeRosterForAdminPersist } from '../lib/roster-admin-sanitize.js';
import { filterRosterForActor, mergeTeacherRosterPatch } from '../lib/roster-scope.js';

const corsHeaders = (extra = {}) =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
    ...extra,
  });

export async function onRequest(context) {
  const { request, env } = context;
  const KV = env.schedules_kv;
  const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (!KV) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'schedules_kv not configured. Bind KV namespace as "schedules_kv".',
      }),
      { status: 503, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }

  const strictBlock = rejectIfStrictAuthUnconfigured(env, () => ({
    ...corsHeaders(),
    'Content-Type': 'application/json',
  }));
  if (strictBlock) return strictBlock;

  try {
    const auth = await resolveRequestAuth(request, secret || null);
    if (!auth.legacy && auth.error) {
      return auth.error;
    }

    if (request.method === 'GET') {
      if (!auth.legacy) {
        let rosterFull = await kvGetAllRoster(KV);
        if (rosterFull && typeof rosterFull === 'object') {
          rosterFull = await migrateAndPersistRosterKv(KV, rosterFull);
        }
        const lastUpdated = await kvGetRosterLastUpdated(KV);
        const actor = { role: auth.payload.role, profile: auth.payload.profile };
        const roster = filterRosterForActor(rosterFull || {}, actor);
        return new Response(
          JSON.stringify({
            success: true,
            roster: roster || null,
            lastUpdated: lastUpdated || null,
          }),
          { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        );
      }
      let roster = await kvGetAllRoster(KV);
      if (roster && typeof roster === 'object') {
        roster = await migrateAndPersistRosterKv(KV, roster);
      }
      const lastUpdated = await kvGetRosterLastUpdated(KV);
      return new Response(
        JSON.stringify({
          success: true,
          roster: roster || null,
          lastUpdated: lastUpdated || null,
        }),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const { roster: incoming, merge } = body || {};
      if (!incoming || typeof incoming !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'Roster data required' }), {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      const timestamp = new Date().toISOString();

      if (!auth.legacy) {
        const role = auth.payload.role;
        const profile = auth.payload.profile;

        if (role === 'admin') {
          await migrateRosterAuthInPlace(incoming);
          sanitizeRosterForAdminPersist(incoming);
          await KV.put('all_roster', JSON.stringify(incoming));
          await KV.put('roster_last_updated', timestamp);
          await pruneAndPersistSchedulesForRosterKv(KV, incoming);
          return new Response(
            JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Roster saved successfully' }),
            { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }

        if (role === 'teacher' || role === 'gate') {
          if (!merge) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Teachers must set merge: true and send a scoped roster patch',
              }),
              { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
            );
          }
          const baseRaw = await kvGetAllRoster(KV);
          const base = baseRaw && typeof baseRaw === 'object' ? baseRaw : {};
          await migrateAndPersistRosterKv(KV, base);
          let merged;
          try {
            merged = mergeTeacherRosterPatch(base, incoming, profile);
          } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message || 'Merge rejected' }), {
              status: 403,
              headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
            });
          }
          sanitizeRosterForAdminPersist(merged);
          await KV.put('all_roster', JSON.stringify(merged));
          await KV.put('roster_last_updated', timestamp);
          await pruneAndPersistSchedulesForRosterKv(KV, merged);
          return new Response(
            JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Roster merged successfully' }),
            { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }

        return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      await migrateRosterAuthInPlace(incoming);
      sanitizeRosterForAdminPersist(incoming);
      await KV.put('all_roster', JSON.stringify(incoming));
      await KV.put('roster_last_updated', timestamp);
      await pruneAndPersistSchedulesForRosterKv(KV, incoming);
      return new Response(
        JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Roster saved successfully' }),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error || 'Internal server error');
    return new Response(JSON.stringify({ success: false, error: msg || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
}
