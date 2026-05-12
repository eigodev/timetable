import { rejectIfStrictAuthUnconfigured } from '../lib/auth-policy.js';
import { resolveRequestAuth } from '../lib/auth-token.js';

const cors = (extra = {}) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  ...extra,
});

/**
 * Stateless session check: validates Bearer JWT (HMAC) server-side.
 * No IP, device, or cookie binding — only signature + expiry.
 * When TIMETABLE_AUTH_SECRET is unset, returns legacy mode (client roster verification only).
 */
export async function onRequest(context) {
  const { request, env } = context;
  const secret = String(env.TIMETABLE_AUTH_SECRET || '').trim();

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors() });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: cors() });
  }

  if (!secret) {
    return new Response(
      JSON.stringify({
        success: true,
        legacy: true,
        valid: false,
        message: 'TIMETABLE_AUTH_SECRET not set; authorization uses legacy client checks only.',
      }),
      { status: 200, headers: { ...cors(), 'Content-Type': 'application/json' } }
    );
  }

  const strictBlock = rejectIfStrictAuthUnconfigured(env, () => ({
    ...cors(),
    'Content-Type': 'application/json',
  }));
  if (strictBlock) return strictBlock;

  const auth = await resolveRequestAuth(request, secret);
  if (auth.error) return auth.error;

  const p = auth.payload;
  return new Response(
    JSON.stringify({
      success: true,
      legacy: false,
      valid: true,
      role: p.role,
      profile: p.profile,
      resolvedUsername: String(p.u || p.profile || '').trim(),
      exp: typeof p.exp === 'number' ? p.exp : null,
      ...(p.gateAppRole ? { gateAppRole: p.gateAppRole } : {}),
    }),
    { status: 200, headers: { ...cors(), 'Content-Type': 'application/json' } }
  );
}
