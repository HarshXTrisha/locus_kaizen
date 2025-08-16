# Firebase Setup Documentation

## Overview
This project has been configured with Firebase using the provided configuration. The setup includes authentication, Firestore database, storage, and analytics.

## Files Created

### 1. `src/lib/firebase.ts`
Main Firebase configuration file that initializes the Firebase app and exports the necessary services:
- `auth` - Firebase Authentication
- `db` - Firestore Database
- `storage` - Firebase Storage
- `analytics` - Firebase Analytics (client-side only)

### 2. `src/lib/firebase-auth.ts`
Utility functions for Firebase Authentication:
- `signInWithEmail(email, password)` - Sign in with email and password
- `createUserWithEmail(email, password)` - Create new user account
- `signOutUser()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get current authenticated user
- `onAuthStateChanged(callback)` - Listen to authentication state changes

### 3. `src/components/auth/LoginFormWithFirebase.tsx`
Example component showing how to integrate Firebase authentication with your existing UI components.

## Usage Examples

### Basic Authentication
```typescript
import { signInWithEmail, getCurrentUser } from '@/lib/firebase-auth';

// Sign in
try {
  const userCredential = await signInWithEmail('user@example.com', 'password');
  console.log('User signed in:', userCredential.user);
} catch (error) {
  console.error('Sign in error:', error);
}

// Get current user
const user = getCurrentUser();
if (user) {
  console.log('Current user:', user.email);
}
```

### Using Firestore Database
```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Add a document
const addDocument = async () => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name: 'John Doe',
      email: 'john@example.com'
    });
    console.log('Document written with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
  }
};

// Get documents
const getDocuments = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
  });
};
```

### Using Firebase Storage
```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload a file
const uploadFile = async (file: File) => {
  const storageRef = ref(storage, 'uploads/' + file.name);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
```

## Environment Variables (Optional)
For better security, you can move the Firebase configuration to environment variables. Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=locus-8b4e8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=locus-8b4e8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=locus-8b4e8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=5682995815
NEXT_PUBLIC_FIREBASE_APP_ID=1:5682995815:web:eb32cee9007c4674e2aac2
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-GXSXV4NNE8
```

Then update `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

## Next Steps
1. Update your existing auth components to use the Firebase authentication functions
2. Set up Firestore security rules in your Firebase console
3. Configure Firebase Storage rules if you plan to use file uploads
4. Set up Firebase Analytics events for better user tracking

## Security Notes
- The Firebase configuration is safe to expose in client-side code
- Always implement proper security rules in your Firebase console
- Use environment variables for sensitive configuration in production
- Implement proper error handling for all Firebase operations
