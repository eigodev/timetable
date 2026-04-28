# Firebase Setup Instructions

To enable cross-device synchronization, you need to set up a Firebase project and configure it in the application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development) or production mode
4. Choose a location for your database (select the closest to your users)
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. If you don't have a web app, click the web icon (`</>`) to add one
5. Register your app (give it a nickname like "TimeTable App")
6. Copy the Firebase configuration object

## Step 4: Update index.html

1. Open `index.html`
2. Find the `firebaseConfig` object (around line 15-21)
3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Set Firestore Security Rules (Important!)

1. In Firebase Console, go to "Firestore Database" > "Rules"
2. For development/testing, you can use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /timetable_schedules/{document=**} {
      allow read, write: if true;  // Allows all access (use only for testing!)
    }
  }
}
```

3. For production, set proper security rules to restrict access
4. Click "Publish"

## Step 6: Test the Application

1. Open your `index.html` file in a browser
2. Open browser console (F12) to check for any Firebase errors
3. Make changes to schedules
4. Open the same page on another device/browser
5. Changes should sync in real-time!

## Troubleshooting

- **"Firebase not configured"**: Check that you've replaced all placeholder values in `firebaseConfig`
- **Permission errors**: Make sure Firestore rules allow read/write access
- **No sync happening**: Check browser console for errors, verify your Firebase project ID is correct
- **Fallback to localStorage**: If Firebase isn't configured, the app will automatically use localStorage (single-device only)

## Security Note

The test mode rules above allow anyone with your Firebase config to read/write data. For production:
- Implement proper authentication
- Set up Firestore security rules to restrict access to authorized users only
- Consider using Firebase Authentication for user management

