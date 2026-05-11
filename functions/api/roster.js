import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { filterRosterForActor, mergeTeacherRosterPatch } from '../lib/roster-scope.js';

const corsHeaders = (extra = {}) =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        const rosterFull = await KV.get('all_roster', 'json');
        const lastUpdated = await KV.get('roster_last_updated', 'text');
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
      const roster = await KV.get('all_roster', 'json');
      const lastUpdated = await KV.get('roster_last_updated', 'text');
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
          await KV.put('all_roster', JSON.stringify(incoming));
          await KV.put('roster_last_updated', timestamp);
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
          const baseRaw = await KV.get('all_roster', 'json');
          const base = baseRaw && typeof baseRaw === 'object' ? baseRaw : {};
          let merged;
          try {
            merged = mergeTeacherRosterPatch(base, incoming, profile);
          } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message || 'Merge rejected' }), {
              status: 403,
              headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
            });
          }
          await KV.put('all_roster', JSON.stringify(merged));
          await KV.put('roster_last_updated', timestamp);
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

      await KV.put('all_roster', JSON.stringify(incoming));
      await KV.put('roster_last_updated', timestamp);
      return new Response(
        JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Roster saved successfully' }),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
}
