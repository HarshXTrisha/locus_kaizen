# Firebase Admin SDK Setup Guide

## Overview
Your Firebase service account JSON file has been integrated into the project. This setup enables server-side Firebase operations using the Admin SDK.

## What's Been Done
1. ✅ Created `src/lib/firebase-admin.ts` - Firebase Admin SDK configuration
2. ✅ Updated service account credentials to use environment variables
3. ✅ Firebase Admin SDK package is already installed

## Next Steps

### 1. Create Environment Variables File
Create a `.env.local` file in your project root with the following content:

```env
# Firebase Service Account Credentials
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpca6vMU4xq1Uc\nisjipFoM7n/dBWSt1JeZ8xp5xlV703OM0v2fJO6nmHYZENrB2g9nsR8zbR0D68zb\nDBIW2xvYGMhGl/W95YAiakyMqy5kK1+TLZysUycFZOIdckWtWFAFcTqt/pfDNCMe\nn7MPYRasytebjIJtti0ttHnEOdqijEAW2jIpRsTk5dytgU9LuM9Kwz3nwBxotJgC\nKwe7YdidcupgSGgTZGwEdj9E0sm9eYH1cgmWIiBltDmJe2K4nCKHmyDXF52lS9gk\ngJJ0JqObP2FKdlo8OiwXVzhw6Zxu41s1UWA87CP8hCaUaudClHecSZx/iE/vxnZx\nvEL/nWNvAgMBAAECggEABSiSkpaj9IGDzehfAix1GEbH92GZ1YN9c9xKWt7mbPf/\neEoo1NmUK4KPuX3+gL9oG2HxgMWRtqhkRnXRKPuy3KxTvr1ZCrPzUGpclyZIEqQR\n8UPA22XS2O4xOvwVV93sr42609+X4wNgglWG244vZP2oQomVXdgN4970yg2IerXF\nfEpgy2opbD/bpt0C0hox0gLvpU0KWF2iuR4iD9y8EPI99DHcxX7/04myMXav9pml\n4u5Qq6bj8z/jJ6bMcgw70RC6Sb7Z3entJCUR8GlE9MFX5Ve2YxtGlP34a3dBltXa\nqo60ln220571U+lA8hfNsq86gmS5TsYdmdBGLknFmQKBgQDXiv9ZPmUFeYWrj0EA\nmcnp0zwmcv8kV2ef44Cs+DWLmpGuKTKRJcNfnAqS7OuP709Z2ICQXPSdVsIzoa+o\nwKdF2BYAnZxMaDo2sBptHpDQumeD1VA7JmqLl2nS5g4jgsMNgzf92+aNCvduy+0j\nxqTsksQkMA3I3KMtFrFf+Y9wGwKBgQDJP5kzUgNQyZymWMezz7jmWayx99glIjR2\nYl9vGBrTMYt3sc6wzzbZS5bI2qpgNuovRU+6FP4cqVJ1qd0MISNiuvOLAqQQe/qB\nMXzkdv0lqGg4+3gEbooKrpWUk2z0xotyfa2TB5MwwT1fApBjBWwEoouUojVEdBXQ\nCul7AmvXPQKBgQCuximZnsthbhFidE18BDfCXyM19idGu4zuDBZpqvYYFiSseQFk\nyp8qZqf4TR4RXzYTn0dYR9edwRzFqwR5rIW2T6o/o416M0WI1LEI7DD23z9SmeRt\nog/g0szfUuYCC2TIDy+Wq/m9QjgyYi8OxGM05SkgQsrapXW2+OCo9v5FIwKBgC9L\nvQtsmM7hsuj9MGG3zbKFHKrunmOLuFyiHd+UAKnlmOtWZEb1S+SheRxXF3dpMHxP\ng78ts9K0kGaKtyJkn1ZSrW3b/wbIvESkhr+Cn1e8TlIl9zzDZbnA8fJq+05DYv5T\nPvmw7AynPW8YwSokWhB0yuzxeidOSNoN1nVMSl/ZAoGAU+HTEUn8IFd8uyhM7C33\nG82MTOW4E6h1J7ekNshk5rG8AZ9MfcjFJ/c48GfclDzaEkV+kGLeYkM8xGmtKxwJ\nb4haB1xe8nrUdjkue10HfKJFj62yYuL+6Z6nYVtunoBhY+S+1e9nrzSQ5wEcxPtt\n4MzhpKeLEG7DIQPtsum2LQ8=\n-----END PRIVATE KEY-----\n"

# Firebase Service Account Details
FIREBASE_PROJECT_ID="locus-8b4e8"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@locus-8b4e8.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY_ID="2096cdc34633b5f4ffb7ae503a23385f1ff06991"
```

### 2. Secure the Service Account File
- Move the service account JSON file to a secure location outside your project
- **IMPORTANT**: Never commit the service account file to version control
- The file is already in your `.gitignore` to prevent accidental commits

### 3. Usage Examples

#### In API Routes
```typescript
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';

// Example: Verify user token
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Access user data
    const userRecord = await adminAuth.getUser(decodedToken.uid);
    
    return Response.json({ user: userRecord });
  } catch (error) {
    return Response.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
```

#### In Server Components
```typescript
import { adminDb } from '@/lib/firebase-admin';

export default async function ServerComponent() {
  const snapshot = await adminDb.collection('users').get();
  const users = snapshot.docs.map(doc => doc.data());
  
  return <div>{/* Render users */}</div>;
}
```

## Security Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Service Account Permissions**: Only grant necessary permissions to the service account
3. **Token Verification**: Always verify Firebase ID tokens on the server side
4. **Error Handling**: Implement proper error handling for authentication failures
5. **Logging**: Monitor and log authentication attempts

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK initialization error"**
   - Check that environment variables are properly set
   - Verify the private key format (should include `\n` for line breaks)

2. **"Permission denied" errors**
   - Verify the service account has the necessary permissions in Firebase Console
   - Check that the project ID matches your Firebase project

3. **"Invalid private key" errors**
   - Ensure the private key is properly formatted with `\n` characters
   - Check that the key hasn't been corrupted during copy/paste

### Testing the Setup

You can test the Firebase Admin SDK setup by creating a simple API route:

```typescript
// app/api/test-admin/route.ts
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // This will throw an error if the service account is invalid
    const listUsersResult = await adminAuth.listUsers(1);
    return Response.json({ 
      success: true, 
      message: 'Firebase Admin SDK is working correctly' 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

## Next Steps

Once you've set up the environment variables, you can:

1. Use Firebase Admin SDK in your API routes for server-side operations
2. Implement secure user authentication and authorization
3. Perform server-side data operations with full admin privileges
4. Set up custom claims for user roles and permissions

The Firebase Admin SDK is now ready to use in your application!
