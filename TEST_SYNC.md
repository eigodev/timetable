# Testing Cross-Device Sync

To verify that cross-device sync is working:

## Step 1: Verify KV is Configured

1. Open your site on any device
2. Open browser console (F12 → Console tab)
3. You should see: "Starting polling for updates every 2 seconds"
4. If you see "KV not configured", follow CLOUDFLARE_SETUP.md

## Step 2: Test Saving

1. Make a change to a schedule (click a time slot)
2. Watch the console - you should see:
   - "Saving schedules to cloud..."
   - "Successfully saved to cloud. Timestamp: [date]"
3. Watch the status - it should show "✓ Saved" then "Cloud sync active"

## Step 3: Test Sync on Another Device

1. Open the site on another device (phone, laptop, etc.)
2. Wait 2-3 seconds (polling interval)
3. Open browser console on the second device
4. You should see:
   - "Timestamp changed - checking for updates"
   - "Data changed - updating from cloud"
5. The changes from the first device should appear

## Debugging

### If changes don't sync:

1. **Check browser console** on both devices for errors
2. **Verify API is working**:
   - Go to: `https://your-domain.pages.dev/api/schedules`
   - Should return JSON with schedules
3. **Check Cloudflare logs**:
   - Dashboard → Workers & Pages → Pages → Your project → Logs
   - Look for any errors in the function execution
4. **Verify KV binding**:
   - Dashboard → Your project → Settings → Functions
   - KV namespace binding should show `KV_SCHEDULES`

### Common Issues:

- **"KV not configured"**: KV namespace not bound - see CLOUDFLARE_SETUP.md
- **"API not found"**: Function not deployed - check `functions/api/schedules.js` exists
- **"404 error"**: Function path wrong - should be `/api/schedules`
- **Changes not appearing**: 
  - Check console logs show polling is working
  - Verify both devices are hitting the same Cloudflare endpoint
  - Make sure both devices have internet connection

### Manual API Test:

You can test the API directly:

**Get schedules:**
```bash
curl https://your-domain.pages.dev/api/schedules
```

**Save schedules (example):**
```bash
curl -X POST https://your-domain.pages.dev/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"schedules":{"Teacher1":{"Monday-8":"available"}}}'
```

## Expected Behavior

- ✅ Status shows "Cloud sync active" when connected
- ✅ Console shows polling every 2 seconds
- ✅ Saves show "✓ Saved" confirmation
- ✅ Changes appear on other devices within 2-4 seconds
- ✅ Console shows "Updated from cloud" when receiving changes

