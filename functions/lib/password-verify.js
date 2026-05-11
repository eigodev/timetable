const PASSWORD_HASH_PREFIX = 'sha256$';

function sanitizeLoginPasswordTyped(raw) {
  return String(raw || '')
    .replace(/\u200b|\uFEFF|\u2060/g, '')
    .trim();
}

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(String(password || ''));
  const digestBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const digestBytes = Array.from(new Uint8Array(digestBuffer));
  const digestHex = digestBytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${PASSWORD_HASH_PREFIX}${digestHex}`;
}

/**
 * Same rules as client login-screen verifyPassword.
 * @param {string} storedPasswordRaw
 * @param {string} passwordRaw
 */
export async function verifyStoredPassword(storedPasswordRaw, passwordRaw) {
  const storedPassword = String(storedPasswordRaw || '').trim();
  const typedPassword = sanitizeLoginPasswordTyped(passwordRaw);
  if (!storedPassword || !typedPassword) return false;
  if (!storedPassword.startsWith(PASSWORD_HASH_PREFIX)) {
    const plateRx = /^@[a-z]{3}\d[a-z]\d{2}$/i;
    if (plateRx.test(storedPassword) && plateRx.test(typedPassword)) {
      return storedPassword.toLowerCase() === typedPassword.toLowerCase();
    }
    return typedPassword === storedPassword;
  }
  return (await hashPassword(typedPassword)) === storedPassword;
}
