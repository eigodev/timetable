/**
 * Cloudflare KV daily put/get quota helpers.
 */

export function isKvQuotaExceededError(error) {
  const msg = error instanceof Error ? error.message : String(error || '');
  return /limit exceeded/i.test(msg);
}

/**
 * PUT only when the serialized value differs from KV (saves daily write quota).
 * @returns {Promise<boolean>} true when a write occurred
 */
export async function kvPutTextIfChanged(KV, key, nextText) {
  const next = String(nextText ?? '');
  let cur = '';
  try {
    cur = (await KV.get(key, 'text')) || '';
  } catch {
    cur = '';
  }
  if (cur === next) return false;
  await KV.put(key, next);
  return true;
}

/**
 * @param {any} KV
 * @param {string} key
 * @param {unknown} nextValue
 * @returns {Promise<boolean>}
 */
export async function kvPutJsonIfChanged(KV, key, nextValue) {
  return kvPutTextIfChanged(KV, key, JSON.stringify(nextValue));
}

export function kvQuotaExceededResponse(corsHeaders, kind = 'put') {
  const label = kind === 'get' ? 'read' : 'write';
  return new Response(
    JSON.stringify({
      success: false,
      error: `KV ${label} limit exceeded for the day. Cloud sync will resume after the quota resets.`,
      kvQuotaExceeded: true,
    }),
    {
      status: 429,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    }
  );
}
