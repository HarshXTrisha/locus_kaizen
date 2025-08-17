import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig, validateConfig } from './config';

// Initialize Firebase only on client side
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;
let isInitialized = false;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Using existing Firebase app');
    } else {
      // Validate configuration first
      if (!validateConfig()) {
        throw new Error('Firebase configuration is invalid');
      }

      console.log('🚀 Initializing Firebase...');
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    }

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Initialize analytics only if measurement ID is available
    if (firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } catch (analyticsError) {
        console.warn('⚠️ Firebase Analytics initialization failed:', analyticsError);
      }
    }
    
    isInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

// Initialize immediately if we're on the client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export a function to ensure Firebase is initialized
export function ensureFirebaseInitialized() {
  if (!isInitialized && typeof window !== 'undefined') {
    initializeFirebase();
  }
  return { app, auth, db, storage, analytics };
}

export { auth, db, storage, analytics };
