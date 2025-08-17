import { auth, db, storage, ensureFirebaseInitialized } from './firebase';

/**
 * Safely get Firebase Auth instance
 */
export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available on the client side');
  }
  
  const { auth: firebaseAuth } = ensureFirebaseInitialized();
  
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not initialized');
  }
  
  return firebaseAuth;
}

/**
 * Safely get Firebase Firestore instance
 */
export function getFirebaseDb() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore is only available on the client side');
  }
  
  const { db: firebaseDb } = ensureFirebaseInitialized();
  
  if (!firebaseDb) {
    throw new Error('Firebase Firestore is not initialized');
  }
  
  return firebaseDb;
}

/**
 * Safely get Firebase Storage instance
 */
export function getFirebaseStorage() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Storage is only available on the client side');
  }
  
  const { storage: firebaseStorage } = ensureFirebaseInitialized();
  
  if (!firebaseStorage) {
    throw new Error('Firebase Storage is not initialized');
  }
  
  return firebaseStorage;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized() {
  return typeof window !== 'undefined' && auth !== null;
}
