/**
 * When TIMETABLE_REQUIRE_AUTH is truthy, operators must set TIMETABLE_AUTH_SECRET so all
 * data APIs require bearer tokens (no legacy unauthenticated multi-tenant reads/writes).
 */
export function requireStrictAuth(env) {
  const v = String(env?.TIMETABLE_REQUIRE_AUTH || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * @param {object} env
 * @param {() => Record<string, string>} headersFn — CORS + Content-Type headers only
 * @returns {Response | null}
 */
export function rejectIfStrictAuthUnconfigured(env, headersFn) {
  if (!requireStrictAuth(env)) return null;
  if (String(env?.TIMETABLE_AUTH_SECRET || '').trim()) return null;
  return new Response(
    JSON.stringify({
      success: false,
      error:
        'TIMETABLE_REQUIRE_AUTH is enabled but TIMETABLE_AUTH_SECRET is not set. Multi-tenant deployments require a configured auth secret.',
      code: 'AUTH_NOT_CONFIGURED',
    }),
    { status: 503, headers: headersFn() }
  );
}
