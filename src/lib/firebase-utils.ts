import { getAuth, getFirestore, getStorage } from 'firebase/app';
import { auth, db, storage } from './firebase';

/**
 * Safely get Firebase Auth instance
 */
export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available on the client side');
  }
  
  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }
  
  return auth;
}

/**
 * Safely get Firebase Firestore instance
 */
export function getFirebaseDb() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore is only available on the client side');
  }
  
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  
  return db;
}

/**
 * Safely get Firebase Storage instance
 */
export function getFirebaseStorage() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Storage is only available on the client side');
  }
  
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }
  
  return storage;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized() {
  return typeof window !== 'undefined' && auth !== null;
}
