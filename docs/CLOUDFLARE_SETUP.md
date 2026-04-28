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
   - **Variable name**: `KV_SCHEDULES`
   - **KV namespace**: Select the namespace you created (`SCHEDULES_KV`)
7. Click **Save**

## Step 3: Deploy Your Project

1. Make sure the `functions/api/schedules.js` file is in your project
2. Commit and push to your Git repository connected to Cloudflare Pages
3. Cloudflare will automatically deploy your changes

The API endpoint will be available at: `https://your-domain.pages.dev/api/schedules`

## Step 4: Verify It's Working

1. Open your deployed site
2. Open browser console (F12)
3. Make some changes to schedules
4. Check the console for any errors
5. The sync status should show "✓ Cloud sync active"

## How It Works

- **GET /api/schedules**: Retrieves all schedules from KV storage
- **POST /api/schedules**: Saves schedules to KV storage
- The app polls every 3 seconds for updates from other devices
- Changes are automatically synced across all devices

## Troubleshooting

- **"Offline mode" status**: Check that KV namespace is properly bound in Pages settings
- **API errors**: Verify the Functions file is in `functions/api/schedules.js`
- **No sync**: Check browser console for CORS or API errors
- **Data not persisting**: Verify KV namespace binding name matches `KV_SCHEDULES` exactly

## File Structure

Your project should have:
```
timetable/
├── functions/
│   └── api/
│       └── schedules.js  ← This file handles API requests
├── index.html
├── script.js
└── style.css
```

## KV Storage Limits

Cloudflare KV is free tier includes:
- 100,000 read operations per day
- 1,000 write operations per day
- 1 GB storage

For production use, consider upgrading if you exceed these limits.

