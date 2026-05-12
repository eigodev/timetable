import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';
import { migrateAndPersistRosterKv } from '../lib/roster-auth-migrate.js';
import {
  coerceSupervisionLink,
  isValidSupervisionStatusTransition,
  normSchoolTitleKey,
  isSupervisionInvitePastExpiry,
} from '../lib/supervision-links.js';
import { studentsAssignedToTeacher } from '../lib/roster-scope.js';

const corsHeaders = (extra = {}) =>
  ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extra,
  });

/** Schools the teacher may grant: from assigned students' school labels. */
function permittedSchoolTitlesForTeacher(roster, teacherProfile) {
  const tp = String(teacherProfile || '').trim();
  const out = new Set();
  if (!tp) return out;
  const schools = roster?.studentSchools && typeof roster.studentSchools === 'object' ? roster.studentSchools : {};
  for (const stu of studentsAssignedToTeacher(roster, tp)) {
    const sch = String(schools[stu] || '').trim();
    if (sch) out.add(sch);
  }
  return out;
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

  if (role !== 'teacher') {
    return new Response(JSON.stringify({ success: false, error: 'Only teachers may respond' }), {
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
  const action = String(body?.action || '').trim().toLowerCase();
  const schoolTitlesIn = Array.isArray(body?.schoolTitles) ? body.schoolTitles : null;

  if (!linkId || (action !== 'accept' && action !== 'decline')) {
    return new Response(JSON.stringify({ success: false, error: 'linkId and action accept|decline required' }), {
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

  const rawList = Array.isArray(roster.supervisionLinks) ? roster.supervisionLinks : [];
  const idx = rawList.findIndex((r) => String(r?.id || '').trim() === linkId);
  if (idx === -1) {
    return new Response(JSON.stringify({ success: false, error: 'Invite not found' }), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const cur = coerceSupervisionLink(rawList[idx]);
  if (!cur || String(cur.teacherProfile || '').trim() !== profile) {
    return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (cur.status !== 'pending') {
    return new Response(JSON.stringify({ success: false, error: 'This invite is no longer pending' }), {
      status: 409,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (isSupervisionInvitePastExpiry(cur)) {
    const ts = new Date().toISOString();
    const expiredPatch = {
      ...rawList[idx],
      status: 'expired',
      respondedAt: ts,
    };
    const expiredCoerced = coerceSupervisionLink(expiredPatch);
    const nextExpired = JSON.parse(JSON.stringify(roster));
    const nextLinksExp = Array.isArray(nextExpired.supervisionLinks) ? [...nextExpired.supervisionLinks] : [];
    nextLinksExp[idx] = expiredCoerced || expiredPatch;
    nextExpired.supervisionLinks = nextLinksExp;
    await KV.put('all_roster', JSON.stringify(nextExpired));
    await KV.put('roster_last_updated', ts);
    return new Response(JSON.stringify({ success: false, error: 'This invitation has expired' }), {
      status: 409,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const nextStatus = action === 'accept' ? 'active' : 'declined';
  if (!isValidSupervisionStatusTransition('pending', nextStatus)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid transition' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let schoolTitles = [];
  if (action === 'accept') {
    if (!schoolTitlesIn || schoolTitlesIn.length !== 1) {
      return new Response(JSON.stringify({ success: false, error: 'Select exactly one school to share' }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
    const permitted = permittedSchoolTitlesForTeacher(roster, profile);
    const permittedLc = new Set([...permitted].map(normSchoolTitleKey));
    schoolTitles = schoolTitlesIn.map((s) => String(s || '').trim()).filter(Boolean);
    const ok = schoolTitles.length === 1 && schoolTitles.every((t) => permittedLc.has(normSchoolTitleKey(t)));
    if (!ok) {
      return new Response(JSON.stringify({ success: false, error: 'That school is not one you own for your assigned students' }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  const respondedAt = new Date().toISOString();
  const updated = {
    ...rawList[idx],
    status: nextStatus,
    ...(action === 'accept' ? { schoolTitles } : {}),
    respondedAt,
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
