'use client';
import {
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Sign in with Google
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


// Sign out
export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth ? auth.currentUser : null;
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.error('Firebase Auth is not initialized');
    return () => {};
  }
  return onFirebaseAuthStateChanged(auth, callback);
};
