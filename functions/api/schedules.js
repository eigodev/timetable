import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { kvGetAllRoster } from '../lib/kv-all-roster.js';
import { isKvQuotaExceededError, kvPutJsonIfChanged, kvPutTextIfChanged, kvQuotaExceededResponse } from '../lib/kv-safe.js';
import { filterSchedulesForActor, mergeSchedulesForTeacher, mergeSchedulesForClassSupervisor } from '../lib/roster-scope.js';

const corsHeaders = (extra = {}) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  ...extra,
});

async function persistSchedulesIfChanged(KV, schedules, timestamp) {
  const changed = await kvPutJsonIfChanged(KV, 'all_schedules', schedules);
  if (changed) {
    await kvPutTextIfChanged(KV, 'last_updated', timestamp);
  }
  return changed;
}

export async function onRequest(context) {
  const { request, env } = context;
  const KV_SCHEDULES = env.schedules_kv;
  const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  if (!KV_SCHEDULES) {
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
      const schedules = (await KV_SCHEDULES.get('all_schedules', 'json')) || {};
      const lastUpdated = await KV_SCHEDULES.get('last_updated', 'text');
      let out = schedules;
      if (!auth.legacy) {
        const actor = { role: auth.payload.role, profile: auth.payload.profile };
        if (actor.role === 'student' && actor.profile) {
          const fullRoster = (await kvGetAllRoster(KV_SCHEDULES)) || {};
          const tutor = String(fullRoster?.studentTeachers?.[actor.profile] || '').trim();
          const studentOut = {};
          if (schedules[actor.profile] != null) {
            studentOut[actor.profile] = schedules[actor.profile];
          }
          if (tutor && schedules[tutor] != null) {
            studentOut[tutor] = schedules[tutor];
          }
          return new Response(
            JSON.stringify({
              success: true,
              schedules: studentOut,
              lastUpdated: lastUpdated || null,
            }),
            { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }
        const fullRoster = (await kvGetAllRoster(KV_SCHEDULES)) || {};
        out = filterSchedulesForActor(schedules, actor, fullRoster);
      }
      return new Response(
        JSON.stringify({
          success: true,
          schedules: out || {},
          lastUpdated: lastUpdated || null,
        }),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const { schedules } = body || {};
      if (!schedules || typeof schedules !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'Schedules data required' }), {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      const timestamp = new Date().toISOString();

      if (!auth.legacy) {
        const role = auth.payload.role;
        const profile = auth.payload.profile;
        if (role === 'admin') {
          await persistSchedulesIfChanged(KV_SCHEDULES, schedules, timestamp);
          return new Response(
            JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Schedules saved successfully' }),
            { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }
        if (role === 'teacher' || role === 'gate') {
          const base = (await KV_SCHEDULES.get('all_schedules', 'json')) || {};
          const rosterFull = (await kvGetAllRoster(KV_SCHEDULES)) || {};
          console.log('[schedules-api] POST merge', {
            role,
            profile,
            incomingKeys: Object.keys(schedules || {}),
          });
          let merged;
          try {
            if (role === 'gate' && String(auth.payload.gateAppRole || '').trim() === 'class-supervisor') {
              merged = mergeSchedulesForClassSupervisor(base, schedules, profile, rosterFull);
            } else {
              merged = mergeSchedulesForTeacher(base, schedules, profile, rosterFull);
            }
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e || 'Forbidden');
            return new Response(JSON.stringify({ success: false, error: msg || 'Forbidden' }), {
              status: 403,
              headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
            });
          }
          await persistSchedulesIfChanged(KV_SCHEDULES, merged, timestamp);
          return new Response(
            JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Schedules saved successfully' }),
            { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      await persistSchedulesIfChanged(KV_SCHEDULES, schedules, timestamp);
      return new Response(
        JSON.stringify({ success: true, lastUpdated: timestamp, message: 'Schedules saved successfully' }),
        { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  } catch (error) {
    if (isKvQuotaExceededError(error)) {
      const kind = String(error?.message || '').toLowerCase().includes('get') ? 'get' : 'put';
      return kvQuotaExceededResponse(corsHeaders, kind);
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
}
