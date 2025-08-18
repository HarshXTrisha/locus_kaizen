import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Service account configuration
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "locus-8b4e8",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@locus-8b4e8.iam.gserviceaccount.com",
};

// Initialize Firebase Admin with singleton pattern
let adminApp: any = null;
let adminAuth: any = null;
let adminDb: any = null;
let adminStorage: any = null;
let isInitialized = false;

function initializeFirebaseAdmin() {
  // Prevent multiple initializations
  if (isInitialized) {
    return { adminApp, adminAuth, adminDb, adminStorage };
  }

  // Check if already initialized by another instance
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    isInitialized = true;
    return { adminApp, adminAuth, adminDb, adminStorage };
  }

  // Initialize new instance
  try {
    // Validate required environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
    }

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Initializing Firebase Admin SDK...');
    }
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'locus-8b4e8.firebasestorage.app'
    });
    
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    
    isInitialized = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Firebase Admin SDK initialization error:', error);
      console.log('⚠️ Firebase Admin SDK will not be available');
    }
    
    // Don't throw error, just return null values
    return { adminApp: null, adminAuth: null, adminDb: null, adminStorage: null };
  }

  return { adminApp, adminAuth, adminDb, adminStorage };
}

// Initialize on module load
const { adminApp: app, adminAuth: auth, adminDb: db, adminStorage: storage } = initializeFirebaseAdmin();

export { auth as adminAuth, db as adminDb, storage as adminStorage };
