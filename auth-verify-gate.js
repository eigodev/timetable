/**
 * Shared client helpers for stateless Bearer auth (no sessionStorage coupling for strict mode).
 * Admin/UI gates call GET /api/auth-verify; APIs already enforce JWT independently.
 */
(function timetableAuthVerifyGate(global) {
    const API_BEARER_TOKEN_STORAGE_KEY = 'timetable_api_bearer_token';

    function timetableBearerAuthHeaders() {
        try {
            let t = localStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
            if (!t || !String(t).trim()) {
                t = sessionStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
            }
            if (t && String(t).trim()) {
                return { Authorization: `Bearer ${String(t).trim()}` };
            }
        } catch {
            /* ignore */
        }
        return {};
    }

    function readStoredBearerTokenUnsafe() {
        try {
            let t = localStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
            if (!t || !String(t).trim()) {
                t = sessionStorage.getItem(API_BEARER_TOKEN_STORAGE_KEY);
            }
            return String(t || '').trim();
        } catch {
            return '';
        }
    }

    /** Decode JWT payload segment only (UI gating). APIs still verify signature server-side. */
    function unsafeJwtPayloadFromStoredBearer() {
        try {
            const t = readStoredBearerTokenUnsafe();
            if (!t) return null;
            const payloadB64 = t.split('.')[0];
            if (!payloadB64) return null;
            let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) b64 += '=';
            const p = JSON.parse(atob(b64));
            return p && typeof p === 'object' ? p : null;
        } catch {
            return null;
        }
    }

    /** Decode role from JWT payload segment only (UI gating). APIs still verify signature server-side. */
    function unsafeJwtRoleFromStoredBearer() {
        const p = unsafeJwtPayloadFromStoredBearer();
        const role = p && p.role != null ? String(p.role).trim() : '';
        return role || null;
    }

    function adminSessionAllow(adminSessionKey) {
        if (!adminSessionKey) return false;
        try {
            return sessionStorage.getItem(adminSessionKey) === 'true';
        } catch {
            return false;
        }
    }

    /**
     * @param {{ adminSessionKey?: string, loginPath?: string }} [opts]
     * @returns {Promise<boolean>} true if this browsing context may proceed (admin)
     */
    async function timetableEnsureAdminApiAccess(opts) {
        const adminSessionKey = String(opts?.adminSessionKey || '').trim();
        const loginPath = String(opts?.loginPath || 'login-screen.html').trim() || 'login-screen.html';
        const headers = { 'Content-Type': 'application/json', ...timetableBearerAuthHeaders() };

        const fail = () => {
            global.location.href = loginPath;
            return false;
        };

        try {
            const res = await fetch('/api/auth-verify?t=' + Date.now(), {
                method: 'GET',
                headers,
                cache: 'no-cache',
            });
            const data = await res.json().catch(() => null);

            if (data && data.legacy === true) {
                if (adminSessionAllow(adminSessionKey)) return true;
                return fail();
            }

            if (res.ok && data && data.success) {
                if (data.role === 'admin') {
                    return true;
                }
                return fail();
            }

            /* No valid server verify (401, 5xx, etc.): allow if admin login flag or stored admin JWT payload. */
            if (
                adminSessionAllow(adminSessionKey) ||
                unsafeJwtRoleFromStoredBearer() === 'admin'
            ) {
                return true;
            }

            return fail();
        } catch {
            if (adminSessionAllow(adminSessionKey) || unsafeJwtRoleFromStoredBearer() === 'admin') {
                return true;
            }
            return fail();
        }
    }

    global.TimeTableAuthVerifyGate = {
        timetableBearerAuthHeaders,
        timetableEnsureAdminApiAccess,
        unsafeJwtPayloadFromStoredBearer,
        unsafeJwtRoleFromStoredBearer,
        API_BEARER_TOKEN_STORAGE_KEY,
    };
})(typeof window !== 'undefined' ? window : globalThis);
