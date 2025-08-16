# 🔍 Debug Checklist - Google Sign-In Popup Issue

## 🚨 **Issue: Popup Opens Then Closes Immediately**

Your popup is opening but closing right away, which indicates a configuration mismatch.

## 📋 **Step-by-Step Debugging:**

### **1. Check Browser Console (F12)**
1. Open browser to `http://localhost:3000/login`
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Click "Sign In with Google"
5. Look for error messages with these patterns:
   - `❌ Google sign in error:`
   - `❌ Error code:`
   - `❌ Error message:`

### **2. Verify Firebase Configuration**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `locus-8b4e8`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. **Check these settings:**
   - ✅ **Enabled**: Should be ON
   - ✅ **Web client ID**: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
   - ✅ **Web client secret**: Should be empty

### **3. Verify Authorized Domains**
1. In Firebase Console → **Authentication** → **Settings**
2. Check **Authorized domains** list:
   - ✅ `localhost`
   - ✅ `locus-8b4e8.firebaseapp.com`

### **4. Verify Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `locus-8b4e8`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. **Check these settings:**
   - ✅ **Application type**: Web application
   - ✅ **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://locus-8b4e8.firebaseapp.com`
   - ✅ **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `https://locus-8b4e8.firebaseapp.com`

### **5. Check OAuth Consent Screen**
1. In Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. **Check these settings:**
   - ✅ **User type**: External
   - ✅ **Test users**: Your email should be added
   - ✅ **Publishing status**: Testing (or Published)

## 🐛 **Common Error Codes & Solutions:**

### **Error: `auth/popup-closed-by-user`**
- **Cause**: User closed popup or popup blocked
- **Solution**: Allow popups for localhost:3000

### **Error: `auth/unauthorized-domain`**
- **Cause**: Domain not in Firebase authorized domains
- **Solution**: Add `localhost` to Firebase authorized domains

### **Error: `auth/invalid-client`**
- **Cause**: Client ID mismatch between Firebase and Google Cloud
- **Solution**: Verify Client ID matches exactly

### **Error: `auth/redirect-uri-mismatch`**
- **Cause**: Redirect URI not in Google Cloud OAuth settings
- **Solution**: Add `http://localhost:3000` to authorized redirect URIs

### **Error: `auth/network-request-failed`**
- **Cause**: Network connectivity issues
- **Solution**: Check internet connection

## 🔧 **Quick Fixes to Try:**

### **Fix 1: Clear Browser Cache**
1. Press Ctrl+Shift+Delete
2. Clear browsing data
3. Try again

### **Fix 2: Try Incognito Mode**
1. Open incognito/private window
2. Go to `http://localhost:3000/login`
3. Try sign-in

### **Fix 3: Allow Popups**
1. Click the popup blocker icon in browser
2. Allow popups for localhost:3000

### **Fix 4: Check Network Tab**
1. Open F12 → Network tab
2. Try sign-in
3. Look for failed requests to Google/Firebase

## 📞 **What to Share:**

When you find the error, please share:
1. **Exact error message** from console
2. **Error code** (e.g., `auth/unauthorized-domain`)
3. **Screenshot** of the error
4. **Which step** in the checklist failed

## 🎯 **Expected Result:**

After fixing the configuration:
1. Click "Sign In with Google"
2. Popup opens and stays open
3. Google account selection appears
4. Successful authentication
5. Redirect to dashboard

**Follow this checklist and let me know what error you find! 🔍**
