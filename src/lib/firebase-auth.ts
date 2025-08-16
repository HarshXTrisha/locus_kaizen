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
import { googleConfig } from './config';

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  
  const provider = new GoogleAuthProvider();
  
  // Add custom parameters for better OAuth flow
  provider.setCustomParameters({
    prompt: googleConfig.prompt
  });
  
  // Add scopes from config
  googleConfig.scopes.forEach(scope => {
    provider.addScope(scope);
  });
  
  try {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error("Error during Google sign-in:", error);
    
    // Provide more specific error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for sign-in. Please contact support.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw new Error(`Sign-in failed: ${error.message || 'Unknown error occurred'}`);
    }
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
