# Environment Variables Setup Guide for QuestAI

This guide covers all required environment variables for the QuestAI platform.

## Required Environment Variables

### 1. Firebase Configuration (Client-side)

```env
# Firebase Web App Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google OAuth (Optional - for Google Sign-in)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Microsoft OAuth (Optional - for Microsoft Sign-in)
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

### 2. Firebase Admin SDK (Server-side)

```env
# Firebase Admin SDK Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 3. Database Configuration

```env
# MongoDB Connection (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/questai
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/questai

# Redis Configuration (if using Redis)
REDIS_URL=redis://localhost:6379
```

### 4. Application Configuration

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_TRACKING_ID=your-ga-tracking-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Setup Instructions

### Step 1: Firebase Configuration

1. **Get Firebase Web Config**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the config values

2. **Get Firebase Admin SDK**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the values from the JSON file

### Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure authorized origins and redirect URIs
6. Copy the Client ID

### Step 3: Microsoft OAuth Setup

1. Follow the [Microsoft Authentication Setup Guide](./MICROSOFT_AUTH_SETUP.md)
2. Get the Client ID from Azure App Registration

### Step 4: Environment File Setup

1. Create `.env.local` file in the root directory:

```bash
# Copy the template
cp .env.example .env.local

# Edit the file with your values
nano .env.local
```

2. Add all required environment variables

3. For production, add these to your hosting platform:
   - **Vercel**: Project Settings > Environment Variables
   - **Netlify**: Site Settings > Environment Variables
   - **Firebase Hosting**: Use Firebase Functions or external management

## Troubleshooting

### Common Issues

#### 1. Firebase Admin SDK Not Working

**Symptoms**:
- Error: "Firebase Admin SDK not initialized"
- API routes returning 500 errors
- Authentication middleware failing

**Solutions**:
1. Check `FIREBASE_PRIVATE_KEY` format:
   ```env
   # Correct format (with quotes and \n)
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```

2. Verify service account email:
   ```env
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

3. Check project ID matches:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   ```

#### 2. OAuth Authentication Failing

**Symptoms**:
- "Unauthorized domain" errors
- Redirect URI mismatch errors
- Popup blocked errors

**Solutions**:
1. Add domains to Firebase authorized domains
2. Check redirect URIs in OAuth providers
3. Ensure HTTPS in production

#### 3. Build Errors

**Symptoms**:
- "Dynamic server usage" errors
- Static generation failures

**Solutions**:
1. API routes using headers are now marked as dynamic
2. Check for any remaining static generation issues

### Testing Environment Variables

1. **Test Firebase Admin SDK**:
   ```bash
   curl http://localhost:3000/api/test-admin
   ```

2. **Test Authentication**:
   - Visit `/login` page
   - Try signing in with Google/Microsoft

3. **Test API Routes**:
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test database connection
   curl http://localhost:3000/api/test-db-connection
   ```

## Security Best Practices

1. **Never commit `.env.local`**:
   - Add to `.gitignore`
   - Use `.env.example` for templates

2. **Use different values for development/production**:
   - Development: Use test Firebase project
   - Production: Use production Firebase project

3. **Rotate secrets regularly**:
   - Firebase service account keys
   - OAuth client secrets

4. **Limit OAuth scopes**:
   - Only request necessary permissions
   - Use minimal scopes for authentication

## Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase Web API Key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth Domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase Project ID | `my-project-123` |
| `FIREBASE_PRIVATE_KEY` | ✅ | Admin SDK Private Key | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Admin SDK Client Email | `firebase-adminsdk-...@project.iam.gserviceaccount.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID | `123456789-...apps.googleusercontent.com` |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | ❌ | Microsoft OAuth Client ID | `12345678-1234-1234-1234-123456789012` |
| `MONGODB_URI` | ❌ | MongoDB Connection String | `mongodb://localhost:27017/questai` |
| `NEXT_PUBLIC_APP_URL` | ❌ | Application URL | `http://localhost:3000` |

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test individual components using the test endpoints
4. Check browser console and server logs for detailed error messages
5. Ensure Firebase project settings match your configuration
