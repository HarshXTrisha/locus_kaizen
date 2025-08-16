# 🚀 Vercel Deployment - Google Sign-In Setup

## 🚨 **Issue: You're Using Vercel, Not Localhost!**

Your Google Sign-In is failing because the configuration is set for localhost, but you're deploying on Vercel.

## 🔧 **Required Configuration Updates:**

### **Step 1: Update Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `locus-8b4e8`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
5. **Update Authorized JavaScript origins** to include:
   ```
   https://locus-kaizen.vercel.app
   https://locus-kaizen-git-main.vercel.app
   https://locus-kaizen-git-master.vercel.app
   ```
6. **Update Authorized redirect URIs** to include:
   ```
   https://locus-kaizen.vercel.app
   https://locus-kaizen-git-main.vercel.app
   https://locus-kaizen-git-master.vercel.app
   ```

### **Step 2: Update Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `locus-8b4e8`
3. Go to **Authentication** → **Settings**
4. **Add to Authorized domains**:
   ```
   locus-kaizen.vercel.app
   locus-kaizen-git-main.vercel.app
   locus-kaizen-git-master.vercel.app
   ```

### **Step 3: Verify Firebase Google Provider**
1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. **Verify these settings**:
   - ✅ **Enabled**: ON
   - ✅ **Web client ID**: `5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com`
   - ✅ **Web client secret**: Empty

## 🧪 **Testing on Vercel:**

### **Step 1: Deploy to Vercel**
```bash
# Push your changes to GitHub
git add .
git commit -m "Update configuration for Vercel deployment"
git push origin master
```

### **Step 2: Test on Vercel**
1. Go to your Vercel deployment: `https://locus-kaizen.vercel.app`
2. Navigate to `/login`
3. Click "Sign In with Google"
4. Check for any errors

### **Step 3: Debug on Vercel**
1. Open browser to your Vercel URL
2. Press F12 → Console tab
3. Try signing in
4. Look for error messages

## 🐛 **Common Vercel Issues:**

### **Issue 1: "Unauthorized domain"**
**Solution:**
- Add your Vercel domain to Firebase authorized domains
- Add your Vercel domain to Google Cloud OAuth origins

### **Issue 2: "Redirect URI mismatch"**
**Solution:**
- Add all Vercel URLs to Google Cloud OAuth redirect URIs
- Include both main domain and git branch domains

### **Issue 3: "Invalid client"**
**Solution:**
- Verify Client ID matches exactly in Firebase
- Check that OAuth client is configured for web application

## 📋 **Complete Domain List to Add:**

### **Google Cloud Console - Authorized JavaScript origins:**
```
https://locus-kaizen.vercel.app
https://locus-kaizen-git-main.vercel.app
https://locus-kaizen-git-master.vercel.app
```

### **Google Cloud Console - Authorized redirect URIs:**
```
https://locus-kaizen.vercel.app
https://locus-kaizen-git-main.vercel.app
https://locus-kaizen-git-master.vercel.app
```

### **Firebase Console - Authorized domains:**
```
locus-kaizen.vercel.app
locus-kaizen-git-main.vercel.app
locus-kaizen-git-master.vercel.app
```

## 🚀 **Quick Fix:**

1. **Update Google Cloud Console** with Vercel domains
2. **Update Firebase Console** with Vercel domains
3. **Deploy to Vercel** with updated configuration
4. **Test on Vercel** (not localhost)

## 📞 **What to Check:**

After updating the domains:
1. **Deploy to Vercel**
2. **Test on**: `https://locus-kaizen.vercel.app/login`
3. **Check console** for any errors
4. **Share error messages** if issues persist

**The key issue was that you're using Vercel, not localhost! Update the domains and it should work! 🎯**
