# Google Authentication Setup for Locus

This document explains how Google Authentication is implemented in the Locus quiz management platform.

## Overview

Locus uses Firebase Authentication with Google Sign-In as the exclusive authentication method. This provides a secure, user-friendly experience without requiring users to remember additional passwords.

## Features

- ✅ **Google Sign-In Only**: Single sign-in method using Google accounts
- ✅ **Automatic User Creation**: New users are automatically created on first sign-in
- ✅ **Secure Authentication**: Leverages Google's robust security infrastructure
- ✅ **User Profile Integration**: Automatically imports user profile data from Google
- ✅ **Session Management**: Persistent sessions with automatic token refresh

## Implementation

### Firebase Configuration

The Firebase app is configured in `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: "locus-8b4e8.firebaseapp.com",
  projectId: "locus-8b4e8",
  storageBucket: "locus-8b4e8.firebasestorage.app",
  messagingSenderId: "5682995815",
  appId: "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: "G-GXSXV4NNE8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Authentication Utilities

Google sign-in functionality is implemented in `src/lib/firebase-auth.ts`:

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};
```

### Login Form

The login form (`src/components/auth/LoginForm.tsx`) provides a single Google sign-in button:

```typescript
const handleGoogleSignIn = async () => {
  setIsLoading(true);
  try {
    await signInWithGoogle();
    showSuccess('Signed In!', 'You have successfully signed in with Google.');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  } catch (error) {
    showError('Sign In Failed', 'Could not sign in with Google. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### Authentication Context

The `AuthProvider` (`src/lib/auth-context.tsx`) manages authentication state:

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
    
    if (user) {
      // Convert Firebase user to our app user format
      const appUser = {
        id: user.uid,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: user.photoURL || undefined,
        createdAt: new Date(user.metadata.creationTime || Date.now()),
        lastLogin: new Date(user.metadata.lastSignInTime || Date.now()),
      };
      
      setStoreUser(appUser);
      setAuthenticated(true);
      showSuccess('Welcome Back!', `Hello ${appUser.firstName}!`, 3000);
    } else {
      setStoreUser(null);
      setAuthenticated(false);
    }
  });

  return () => unsubscribe();
}, []);
```

## User Experience

### Sign-In Flow

1. User clicks "Sign In with Google" button
2. Google popup opens for authentication
3. User selects their Google account
4. User is automatically redirected to dashboard
5. Success notification is shown

### User Data

When a user signs in with Google, the following data is automatically imported:

- **Email**: User's Google email address
- **Name**: Full name from Google profile
- **Avatar**: Profile picture from Google
- **User ID**: Unique Firebase UID
- **Timestamps**: Account creation and last login times

### Session Management

- Sessions persist across browser sessions
- Automatic token refresh handled by Firebase
- Users stay signed in until they explicitly sign out
- Sign out clears all session data

## Security Benefits

- **No Password Storage**: No passwords are stored in our system
- **Google Security**: Leverages Google's advanced security measures
- **Two-Factor Authentication**: Inherits user's Google 2FA settings
- **Account Recovery**: Handled entirely by Google
- **Session Security**: Secure token-based authentication

## Testing

To test the Google authentication:

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Click "Sign In with Google"
4. Complete Google authentication
5. Verify redirect to dashboard
6. Check user data in the application

## Troubleshooting

### Common Issues

1. **Popup Blocked**: Ensure popups are allowed for the domain
2. **Network Issues**: Check internet connection and Firebase configuration
3. **Domain Not Authorized**: Verify domain is added to Firebase Auth settings

### Error Handling

The application includes comprehensive error handling:

- Network errors are caught and displayed to users
- Authentication failures show user-friendly messages
- Loading states prevent multiple sign-in attempts
- Graceful fallbacks for edge cases

## Configuration

### Firebase Console Setup

1. Enable Google Sign-In in Firebase Console
2. Add authorized domains
3. Configure OAuth consent screen
4. Set up redirect URLs

### Environment Variables

Ensure Firebase configuration is properly set in your environment:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## Future Enhancements

Potential improvements for the authentication system:

- **Additional Providers**: Support for GitHub, Microsoft, etc.
- **Role-Based Access**: Different user roles and permissions
- **Advanced Analytics**: Track authentication patterns
- **Custom Claims**: Additional user metadata
- **Multi-Tenant Support**: Organization-based access control
