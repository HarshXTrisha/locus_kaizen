# 🚀 Google Cloud Console Setup Guide

## 🚨 **Issue: Google Cloud Console Not Set Up**

Your Google Sign-In is failing because the Google Cloud Console hasn't been configured yet. Let's fix this step by step.

## 📋 **Prerequisites:**

- Google account with access to Google Cloud Console
- Firebase project already created (`locus-8b4e8`)

## 🔧 **Step-by-Step Google Cloud Console Setup:**

### **Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project: `locus-8b4e8`
   - If you don't see it, click "Select a project" and search for "locus-8b4e8"

### **Step 2: Enable Google+ API (if needed)**
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press **Enable** if not already enabled

### **Step 3: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: `Locus`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. On **Scopes** page, click **Save and Continue**
6. On **Test users** page, add your email as a test user
7. Click **Save and Continue**

### **Step 4: Create OAuth 2.0 Client ID**
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application** as the application type
4. Fill in the details:
   - **Name**: `Locus Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://locus-8b4e8.firebaseapp.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000
     https://locus-8b4e8.firebaseapp.com
     ```
5. Click **Create**
6. **Copy the Client ID** that appears (it should match: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`)

### **Step 5: Configure Firebase with Google Client ID**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `locus-8b4e8`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. **Enable** Google sign-in
6. In the **Web SDK configuration** section:
   - **Web client ID**: Paste your OAuth client ID from Step 4: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
   - **Web client secret**: Leave empty (not needed for Firebase)
7. Click **Save**

### **Step 6: Add Authorized Domains**
1. In Firebase Console, go to **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add these domains:
   ```
   localhost
   locus-8b4e8.firebaseapp.com
   ```

## 🧪 **Testing Your Setup:**

### **Step 1: Start Development Server**
```bash
npm run dev
```

### **Step 2: Test Google Sign-In**
1. Open browser to `http://localhost:3000/login`
2. Click "Sign In with Google"
3. You should see Google's OAuth popup
4. Select your Google account
5. Grant permissions when prompted

### **Step 3: Check for Success**
- You should be redirected to `/dashboard`
- No console errors should appear
- User data should be loaded

## 🐛 **Common Issues & Solutions:**

### **Issue 1: "Error: redirect_uri_mismatch"**
**Solution:**
- Check that `http://localhost:3000` is in your OAuth client's authorized redirect URIs
- Make sure there are no trailing slashes

### **Issue 2: "Error: invalid_client"**
**Solution:**
- Verify the Client ID in Firebase matches your OAuth client ID
- Check that the OAuth client is configured for "Web application"

### **Issue 3: "Error: access_denied"**
**Solution:**
- Make sure your email is added as a test user in OAuth consent screen
- Check that the app is not in "Testing" mode with restricted access

### **Issue 4: "Error: popup_closed_by_user"**
**Solution:**
- Allow popups for localhost:3000
- Try in incognito/private mode
- Check browser popup blocker settings

## 🔍 **Verification Checklist:**

- [ ] Google Cloud Console project selected: `locus-8b4e8`
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created for Web application
- [ ] Authorized JavaScript origins include `http://localhost:3000`
- [ ] Firebase Google provider enabled
- [ ] Firebase Web client ID matches OAuth client ID: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
- [ ] Firebase authorized domains include `localhost`
- [ ] Test user added to OAuth consent screen

## 📞 **If You're Still Having Issues:**

Please provide:
1. **Screenshot** of your OAuth client configuration
2. **Screenshot** of your Firebase Google provider settings
3. **Exact error message** from browser console
4. **Step where you're getting stuck**

## 🚀 **Expected Result:**

After completing this setup:
1. Google Sign-In button works
2. OAuth popup opens
3. User can select Google account
4. Successful authentication
5. Redirect to dashboard
6. User data loaded

**Let me know once you've completed the Google Cloud Console setup! 🎯**
