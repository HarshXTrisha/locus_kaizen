# 🎯 Quick Setup Card - Google Cloud Console

## 🚨 **URGENT: Complete These Steps First**

Your Google Sign-In won't work until you complete the Google Cloud Console setup.

## ⚡ **Essential Steps (5 minutes):**

### **1. Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/
- Select project: `locus-8b4e8`

### **2. Create OAuth Client ID**
- Go to: **APIs & Services** → **Credentials**
- Click: **+ CREATE CREDENTIALS** → **OAuth client ID**
- Choose: **Web application**
- Add origins: `http://localhost:3000`
- Copy the Client ID

### **3. Configure Firebase**
- Go to: https://console.firebase.google.com/
- Select project: `locus-8b4e8`
- Go to: **Authentication** → **Sign-in method**
- Enable **Google** provider
- Paste your Client ID

### **4. Add Domains**
- In Firebase: **Authentication** → **Settings**
- Add to **Authorized domains**:
  - `localhost`
  - `locus-8b4e8.firebaseapp.com`

## 🧪 **Test Immediately:**
```bash
npm run dev
# Open: http://localhost:3000/login
# Click: "Sign In with Google"
```

## 📞 **If Stuck:**
- Check the full guide: `GOOGLE_CLOUD_SETUP.md`
- Share any error messages
- Screenshots help!

**Complete these steps and your Google Sign-In will work! 🚀**
