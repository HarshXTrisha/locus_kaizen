'use client';
import {
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';
import { googleConfig } from './config';

// Sign in with Google using popup
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
    
    // If popup fails due to COOP policy, try redirect
    if (error.code === 'auth/popup-closed-by-user' || 
        error.message?.includes('Cross-Origin-Opener-Policy') ||
        error.message?.includes('message port closed')) {
      console.log('🔄 Popup blocked, trying redirect method...');
      return signInWithGoogleRedirect();
    }
    
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

// Sign in with Google using redirect (fallback method)
export const signInWithGoogleRedirect = async (): Promise<UserCredential> => {
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
    await signInWithRedirect(auth, provider);
    // This will redirect the user, so we won't reach the return statement
    throw new Error('Redirect initiated');
  } catch (error: any) {
    console.error("Error during Google redirect sign-in:", error);
    throw error;
  }
};

// Get redirect result (call this after page load)
export const getGoogleSignInResult = async (): Promise<UserCredential | null> => {
  if (!auth) {
    return null;
  }
  
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Error getting redirect result:", error);
    return null;
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
