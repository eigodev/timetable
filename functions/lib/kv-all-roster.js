/**
 * Safe reads for `all_roster` / `roster_last_updated` — avoids worker exceptions from
 * malformed KV JSON or runtime quirks on `get(key, type)`.
 */

/**
 * @param {any} KV
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function kvGetAllRoster(KV) {
  if (!KV || typeof KV.get !== 'function') return null;
  try {
    const parsed = await KV.get('all_roster', { type: 'json' });
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return /** @type {Record<string, unknown>} */ (parsed);
    }
  } catch (e) {
    console.error('[kvGetAllRoster] json read', e?.message || String(e));
  }
  try {
    const raw = await KV.get('all_roster', { type: 'text' });
    if (!raw || !String(raw).trim()) return null;
    const parsed = JSON.parse(String(raw));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return /** @type {Record<string, unknown>} */ (parsed);
    }
  } catch (e) {
    console.error('[kvGetAllRoster] text fallback', e?.message || String(e));
  }
  return null;
}

/**
 * @param {any} KV
 * @returns {Promise<string | null>}
 */
export async function kvGetRosterLastUpdated(KV) {
  if (!KV || typeof KV.get !== 'function') return null;
  try {
    const t = await KV.get('roster_last_updated', { type: 'text' });
    return t != null && String(t).trim() ? String(t).trim() : null;
  } catch (e) {
    console.error('[kvGetRosterLastUpdated]', e?.message || String(e));
    return null;
  }
}
