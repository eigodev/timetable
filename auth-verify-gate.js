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

    /**
     * @param {{ adminSessionKey?: string, loginPath?: string }} [opts]
     * @returns {Promise<boolean>} true if this browsing context may proceed (admin)
     */
    async function timetableEnsureAdminApiAccess(opts) {
        const adminSessionKey = String(opts?.adminSessionKey || '').trim();
        const loginPath = String(opts?.loginPath || 'login-screen.html').trim() || 'login-screen.html';
        const headers = { 'Content-Type': 'application/json', ...timetableBearerAuthHeaders() };

        try {
            const res = await fetch('/api/auth-verify?t=' + Date.now(), {
                method: 'GET',
                headers,
                cache: 'no-cache',
            });
            const data = await res.json().catch(() => null);

            if (data && data.legacy === true) {
                try {
                    if (adminSessionKey && sessionStorage.getItem(adminSessionKey) === 'true') {
                        return true;
                    }
                } catch {
                    /* ignore */
                }
                global.location.href = loginPath;
                return false;
            }

            if (res.ok && data && data.success && data.role === 'admin') {
                return true;
            }

            global.location.href = loginPath;
            return false;
        } catch {
            global.location.href = loginPath;
            return false;
        }
    }

    global.TimeTableAuthVerifyGate = {
        timetableBearerAuthHeaders,
        timetableEnsureAdminApiAccess,
        API_BEARER_TOKEN_STORAGE_KEY,
    };
})(typeof window !== 'undefined' ? window : globalThis);
