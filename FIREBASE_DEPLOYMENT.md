# Firebase Deployment Guide

## 🔥 Fix Firebase Permission Issues

The "Missing or insufficient permissions" errors are caused by Firestore security rules not being deployed to Firebase. Follow these steps to fix:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not already done)
```bash
firebase init
```
- Select "Firestore" and "Storage"
- Choose your project: `locus-8b4e8`
- Use existing rules files

### 4. Deploy Firestore Rules
```bash
npm run deploy:rules
```

Or manually:
```bash
firebase deploy --only firestore:rules,storage
```

### 5. Verify Deployment
Check the Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/project/locus-8b4e8)
2. Navigate to Firestore Database → Rules
3. Verify the rules are updated

### 6. Test the Application
After deploying the rules, the permission errors should be resolved.

## 🔧 Alternative: Temporary Rules for Testing

If you want to temporarily allow all access for testing:

```javascript
// In firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Warning**: Only use this for testing, not production!

## 📝 Current Rules

The current rules allow:
- Authenticated users to read/write their own quizzes
- Authenticated users to read/write their own quiz results
- Proper user isolation and security

## 🚀 After Deployment

Your application should work without permission errors:
- ✅ Dashboard will load quizzes and results
- ✅ Upload page will create quizzes successfully
- ✅ All Firebase operations will work properly
