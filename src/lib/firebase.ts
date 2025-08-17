import { initializeApp } from 'firebase/app';
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

if (typeof window !== 'undefined') {
  try {
    // Validate configuration first
    if (!validateConfig()) {
      throw new Error('Firebase configuration is invalid');
    }

    console.log('🚀 Initializing Firebase...');
    app = initializeApp(firebaseConfig);
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
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
}

export { auth, db, storage, analytics };
