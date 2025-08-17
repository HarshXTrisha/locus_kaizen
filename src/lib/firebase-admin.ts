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

// Initialize Firebase Admin
let adminApp: any = null;
let adminAuth: any = null;
let adminDb: any = null;
let adminStorage: any = null;

if (!getApps().length) {
  try {
    console.log('🚀 Initializing Firebase Admin SDK...');
    
    // Check if we have the required environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ FIREBASE_PRIVATE_KEY environment variable is not set');
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
    }
    
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: 'locus-8b4e8.firebasestorage.app'
    });
    
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    // Don't throw error, just log it and continue
    console.log('⚠️ Firebase Admin SDK will not be available');
  }
} else {
  adminApp = getApps()[0];
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
  adminStorage = getStorage(adminApp);
}

export { adminAuth, adminDb, adminStorage };
