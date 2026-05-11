const enc = new TextEncoder();

function utf8ToBase64url(str) {
  const bytes = enc.encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToUtf8(b64url) {
  let b64 = String(b64url || '').replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function base64urlToBytes(s) {
  let b64 = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64url(buf) {
  const u8 = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let bin = '';
  u8.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * @param {{ v: number, role: string, profile: string, u?: string, exp?: number }} payloadObj
 * @param {string} secret
 */
export async function signAuthToken(payloadObj, secret) {
  const secretStr = String(secret || '').trim();
  if (!secretStr) throw new Error('Missing signing secret');
  const payloadB64 = utf8ToBase64url(JSON.stringify(payloadObj));
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = bytesToBase64url(sigBuf);
  return `${payloadB64}.${sigB64}`;
}

/**
 * @returns {Promise<null | { v:number, role:string, profile:string, u?:string, exp?:number }>}
 */
export async function verifyAuthToken(token, secret) {
  const secretStr = String(secret || '').trim();
  if (!secretStr) return null;
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;
  let sigBytes;
  try {
    sigBytes = base64urlToBytes(sigB64);
  } catch {
    return null;
  }
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  let ok;
  try {
    ok = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
  } catch {
    return null;
  }
  if (!ok) return null;
  let payload;
  try {
    payload = JSON.parse(base64urlToUtf8(payloadB64));
  } catch {
    return null;
  }
  if (!payload || payload.v !== 1 || !payload.role || !payload.profile) return null;
  if (payload.exp && Number(payload.exp) < Date.now() / 1000) return null;
  return payload;
}

/**
 * @param {Request} request
 * @param {string|undefined} secret
 * @returns {Promise<{ legacy: true } | { legacy: false, error: Response } | { legacy: false, payload: object }>}
 */
export async function resolveRequestAuth(request, secret) {
  const s = String(secret || '').trim();
  if (!s) {
    return { legacy: true };
  }
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  const raw = String(request.headers.get('Authorization') || '').trim();
  const m = /^Bearer\s+(\S+)/i.exec(raw);
  if (!m) {
    return {
      legacy: false,
      error: new Response(JSON.stringify({ success: false, error: 'Authorization Bearer token required' }), {
        status: 401,
        headers: jsonHeaders,
      }),
    };
  }
  const payload = await verifyAuthToken(m[1], s);
  if (!payload) {
    return {
      legacy: false,
      error: new Response(JSON.stringify({ success: false, error: 'Invalid or expired token' }), {
        status: 401,
        headers: jsonHeaders,
      }),
    };
  }
  return { legacy: false, payload };
}
