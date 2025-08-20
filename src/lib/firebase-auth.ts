'use client';
import {
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';
import { googleConfig, microsoftConfig } from './config';

// Check if popup is likely to be blocked
const isPopupBlocked = () => {
  // Check for common popup blockers
  if (typeof window === 'undefined') return false;
  
  // Check if we're in an iframe
  if (window.self !== window.top) return true;
  
  // Check for strict security policies
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && userAgent.includes('headless')) return true;
  
  return false;
};

// Sign in with Google using popup or redirect
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
  
  // Check if popup is likely to be blocked
  if (isPopupBlocked()) {
    console.log('🔄 Popup likely blocked, using redirect method...');
    return signInWithGoogleRedirect();
  }
  
  try {
    console.log('📡 Attempting popup sign-in...');
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error("Error during Google popup sign-in:", error);
    
    // If popup fails due to COOP policy or other blocking, try redirect
    if (error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/popup-blocked' ||
        error.message?.includes('Cross-Origin-Opener-Policy') ||
        error.message?.includes('message port closed')) {
      console.log('🔄 Popup failed, trying redirect method...');
      return signInWithGoogleRedirect();
    }
    
    // For other errors, throw them
    throw error;
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
    console.log('🔄 Initiating redirect sign-in...');
    await signInWithRedirect(auth, provider);
    // This will redirect the user, so we won't reach the return statement
    throw new Error('Redirect initiated');
  } catch (error: any) {
    console.error("Error during Google redirect sign-in:", error);
    throw error;
  }
};

// Sign in with Microsoft using popup or redirect
export const signInWithMicrosoft = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  
  const provider = new OAuthProvider('microsoft.com');
  
  // Add custom parameters for better OAuth flow
  provider.setCustomParameters({
    prompt: microsoftConfig.prompt
  });
  
  // Add scopes from config
  microsoftConfig.scopes.forEach(scope => {
    provider.addScope(scope);
  });
  
  // Check if popup is likely to be blocked
  if (isPopupBlocked()) {
    console.log('🔄 Popup likely blocked, using redirect method...');
    return signInWithMicrosoftRedirect();
  }
  
  try {
    console.log('📡 Attempting Microsoft popup sign-in...');
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error("Error during Microsoft popup sign-in:", error);
    
    // If popup fails due to COOP policy or other blocking, try redirect
    if (error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/popup-blocked' ||
        error.message?.includes('Cross-Origin-Opener-Policy') ||
        error.message?.includes('message port closed')) {
      console.log('🔄 Popup failed, trying redirect method...');
      return signInWithMicrosoftRedirect();
    }
    
    // For other errors, throw them
    throw error;
  }
};

// Sign in with Microsoft using redirect (fallback method)
export const signInWithMicrosoftRedirect = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  
  const provider = new OAuthProvider('microsoft.com');
  
  // Add custom parameters for better OAuth flow
  provider.setCustomParameters({
    prompt: microsoftConfig.prompt
  });
  
  // Add scopes from config
  microsoftConfig.scopes.forEach(scope => {
    provider.addScope(scope);
  });
  
  try {
    console.log('🔄 Initiating Microsoft redirect sign-in...');
    await signInWithRedirect(auth, provider);
    // This will redirect the user, so we won't reach the return statement
    throw new Error('Redirect initiated');
  } catch (error: any) {
    console.error("Error during Microsoft redirect sign-in:", error);
    throw error;
  }
};

// Get redirect result (call this after page load) - updated to handle both providers
export const getSignInResult = async (): Promise<UserCredential | null> => {
  if (!auth) {
    return null;
  }
  
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Redirect sign-in successful:', result);
    }
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
