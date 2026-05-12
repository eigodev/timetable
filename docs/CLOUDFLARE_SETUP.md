# Cloudflare KV Setup Instructions

This application uses Cloudflare Pages Functions with KV storage to sync data across all devices.

## Prerequisites

- A Cloudflare account
- Your site deployed on Cloudflare Pages
- Cloudflare KV namespace created

## Step 1: Create KV Namespace

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** > **KV**
3. Click **Create a namespace**
4. Name it: `SCHEDULES_KV` (or any name you prefer)
5. Click **Add**

## Step 2: Bind KV to Your Pages Project

1. Go to **Workers & Pages** > **Pages**
2. Select your **timetable** project
3. Go to **Settings** tab
4. Scroll down to **Functions** section
5. Under **KV namespace bindings**, click **Add binding**
6. Set:
   - **Variable name**: `schedules_kv` (must match this exact name — the Functions code reads `env.schedules_kv`)
   - **KV namespace**: Select the namespace you created (`SCHEDULES_KV`)
7. Click **Save**

### Optional: API authentication (recommended for production)

To require signed bearer tokens on `/api/roster`, `/api/schedules`, `/api/class-report-uploads/*`, and related routes:

1. In **Settings** > **Environment variables** (production and preview as needed), add a **secret**:
   - **Name**: `TIMETABLE_AUTH_SECRET`
   - **Value**: a long random string (keep it private)

2. Redeploy so Functions pick up the secret.

**Behavior:**

- **Secret set (multi-tenant secured):** Clients must call `POST /api/auth-login` with JSON `{ "username", "password" }` (same credentials as the web login). The response includes a `token`; send `Authorization: Bearer <token>` on subsequent API requests. The server filters roster, schedules, and class-report payloads **by the signed-in role and profile** (teacher tenant = roster profile name). Signup can use `POST /api/roster-signup` when the secret is set; if that endpoint returns **503** (secret not configured), the client may fall back to the older local merge flow.

- **Strict production mode:** Set environment variable `TIMETABLE_REQUIRE_AUTH` to `1` (or `true`). Then **`TIMETABLE_AUTH_SECRET` must also be set** — otherwise roster, schedules, and class-report APIs return **503** (`AUTH_NOT_CONFIGURED`). This blocks legacy unauthenticated access so every request is authorized and tenant-scoped.

Teachers and students receive only their permitted rows; admins keep full read/write on roster and schedules. School-scoped settings (themes, external links, billing maps, Meet modes), org-wide toolbar/passport header links, login-alias maps, SpeakOn weeklies, and passport links are stripped or filtered server-side for non-admin actors.

### Supervision invites (coordinator / class supervisor → teacher)

Sending and accepting supervision invites uses `POST /api/supervision-invite` and `POST /api/supervision-respond`, which require a valid bearer token from `POST /api/auth-login`. **If `TIMETABLE_AUTH_SECRET` is not set**, auth-login returns **503**, no token is stored, and the app will not send invites.

Checklist:

1. **KV binding** `schedules_kv` is attached to the Pages project (see Step 2).
2. **Secret** `TIMETABLE_AUTH_SECRET` is set (Production and Preview if you use both), then redeploy.
3. **Serve the app over HTTP(S)** from the same origin as `/api/*` (open the deployed Pages URL or use `wrangler pages dev` with `.dev.vars`; opening `index.html` as a `file://` URL will not call the API correctly).
4. **Coordinator or class supervisor** signs in on the **login page** so the app can store the token (and saved credentials for refresh). Inviters must use gate accounts with `appRole` `coordinator` or `class-supervisor` in `gateStaffAccounts`.
5. **Invite field** must be the teacher’s **login username** exactly as in roster `teacherEmails` for that teacher (case-insensitive match on the server).
6. **Teacher sees the invite** after they sign in on the hosted app: their scoped roster includes `supervisionLinks` with `status: pending` for their profile.

## Step 3: Deploy Your Project

1. Make sure the `functions/api/*.js` files are in your project (e.g. `schedules.js`, `roster.js`, `auth-login.js`)
2. Commit and push to your Git repository connected to Cloudflare Pages
3. Cloudflare will automatically deploy your changes

Example API base URL: `https://your-domain.pages.dev/api/schedules`

## Step 4: Verify It's Working

1. Open your deployed site
2. Open browser console (F12)
3. Make some changes to schedules
4. Check the console for any errors
5. The sync status should show "✓ Cloud sync active"

## How It Works

- **GET /api/schedules**: Retrieves schedules from KV (scoped by role when `TIMETABLE_AUTH_SECRET` is set)
- **POST /api/schedules**: Saves schedules to KV (teachers merge their own key; admin can replace)
- **GET/POST /api/roster**: Roster sync (filtered or merged per role when auth is enabled)
- **POST /api/auth-login**: Issues bearer token when auth secret is configured
- The app polls for updates from other devices
- Changes are synced across devices according to server-enforced rules

## Troubleshooting

- **"Offline mode" status**: Check that KV is bound with variable name **`schedules_kv`**
- **401 on API after enabling auth**: Ensure the client logs in via `/api/auth-login` and sends `Authorization: Bearer …` on roster/schedules/class-report requests
- **Supervision invites fail or the app says API login is disabled**: Confirm `TIMETABLE_AUTH_SECRET` is set for the environment you are using, redeploy, and sign in again from the hosted site (not `file://`). For local dev, copy `.dev.vars.example` to `.dev.vars` and run `wrangler pages dev`. See the supervision checklist above.
- **API errors**: Verify the Functions files are under `functions/api/`
- **No sync**: Check browser console for CORS or API errors
- **Data not persisting**: Verify the KV binding name is **`schedules_kv`** exactly

## File Structure

Your project should include:

```
timetable/
├── functions/
│   └── api/
│       ├── schedules.js
│       ├── roster.js
│       ├── auth-login.js
│       └── ...
├── index.html
├── script.js
└── style.css
```

## KV Storage Limits

Cloudflare KV free tier includes:

- 100,000 read operations per day
- 1,000 write operations per day
- 1 GB storage

For production use, consider upgrading if you exceed these limits.
