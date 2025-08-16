# 🔧 Google Sign-In Fix Guide

## 🚨 **Current Issue: Google Sign-In Not Working**

### ✅ **What I've Fixed:**

1. **Updated Firebase Configuration**: Centralized config in `src/lib/config.ts`
2. **Enhanced Google OAuth**: Added proper scopes and parameters
3. **Better Error Handling**: More specific error messages
4. **Configuration Structure**: Cleaner, more maintainable setup

### 🔧 **Required Firebase Console Setup:**

#### **Step 1: Enable Google Sign-In in Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `locus-8b4e8`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Add your **Web Client ID**: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`

#### **Step 2: Configure Authorized Domains**
1. In Firebase Console → **Authentication** → **Settings**
2. Add these domains to **Authorized domains**:
   - `localhost` (for development)
   - `locus-8b4e8.firebaseapp.com`
   - Your production domain (when deployed)

#### **Step 3: Google Cloud Console Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `locus-8b4e8`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
5. Add these **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://locus-8b4e8.firebaseapp.com`
   - Your production URL (when deployed)

### 🧪 **Testing Steps:**

#### **Step 1: Test Local Development**
```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000/login
# Try Google Sign-In
```

#### **Step 2: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Try signing in
4. Look for any error messages

#### **Step 3: Check Network Tab**
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try signing in
4. Look for failed requests to Google/Firebase

### 🐛 **Common Issues & Solutions:**

#### **Issue 1: "Popup blocked" Error**
**Solution:**
- Allow popups for `localhost:3000`
- Check browser popup blocker settings
- Try in incognito/private mode

#### **Issue 2: "Unauthorized domain" Error**
**Solution:**
- Add `localhost` to Firebase authorized domains
- Add `localhost:3000` to Google OAuth origins
- Check domain spelling in both consoles

#### **Issue 3: "Network request failed" Error**
**Solution:**
- Check internet connection
- Verify Firebase project is active
- Check if Google services are accessible

#### **Issue 4: "Client ID mismatch" Error**
**Solution:**
- Verify Google Client ID in Firebase Console
- Check OAuth consent screen configuration
- Ensure same project ID in both consoles

### 🔍 **Debug Information:**

#### **Your Current Configuration:**
```javascript
// Firebase Config
{
  apiKey: "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: "locus-8b4e8.firebaseapp.com",
  projectId: "locus-8b4e8",
  storageBucket: "locus-8b4e8.firebasestorage.app",
  messagingSenderId: "5682995815",
  appId: "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: "G-GXSXV4NNE8"
}

// Google OAuth Client ID
5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com
```

#### **Required URLs to Add:**
- **Firebase Authorized Domains:**
  - `localhost`
  - `locus-8b4e8.firebaseapp.com`

- **Google OAuth Origins:**
  - `http://localhost:3000`
  - `https://locus-8b4e8.firebaseapp.com`

### 🚀 **Next Steps:**

1. **Follow the Firebase Console setup** (Steps 1-3 above)
2. **Test the sign-in** on localhost:3000
3. **Check browser console** for any errors
4. **Share specific error messages** if issues persist

### 📞 **If Still Having Issues:**

Please provide:
1. **Exact error message** from browser console
2. **Screenshot** of the error
3. **Browser** you're using (Chrome, Firefox, etc.)
4. **Whether you've completed** the Firebase Console setup

### ✅ **Expected Behavior After Fix:**

1. Click "Sign In with Google" button
2. Google popup opens
3. Select Google account
4. Successfully signed in
5. Redirected to dashboard
6. No console errors

**Let me know what happens when you test this! 🚀**
