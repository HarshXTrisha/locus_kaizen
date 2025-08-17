import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Service account configuration
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "locus-8b4e8",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpca6vMU4xq1Uc\nisjipFoM7n/dBWSt1JeZ8xp5xlV703OM0v2fJO6nmHYZENrB2g9nsR8zbR0D68zb\nDBIW2xvYGMhGl/W95YAiakyMqy5kK1+TLZysUycFZOIdckWtWFAFcTqt/pfDNCMe\nn7MPYRasytebjIJtti0ttHnEOdqijEAW2jIpRsTk5dytgU9LuM9Kwz3nwBxotJgC\nKwe7YdidcupgSGgTZGwEdj9E0sm9eYH1cgmWIiBltDmJe2K4nCKHmyDXF52lS9gk\ngJJ0JqObP2FKdlo8OiwXVzhw6Zxu41s1UWA87CP8hCaUaudClHecSZx/iE/vxnZx\nvEL/nWNvAgMBAAECggEABSiSkpaj9IGDzehfAix1GEbH92GZ1YN9c9xKWt7mbPf/\neEoo1NmUK4KPuX3+gL9oG2HxgMWRtqhkRnXRKPuy3KxTvr1ZCrPzUGpclyZIEqQR\n8UPA22XS2O4xOvwVV93sr42609+X4wNgglWG244vZP2oQomVXdgN4970yg2IerXF\nfEpgy2opbD/bpt0C0hox0gLvpU0KWF2iuR4iD9y8EPI99DHcxX7/04myMXav9pml\n4u5Qq6bj8z/jJ6bMcgw70RC6Sb7Z3entJCUR8GlE9MFX5Ve2YxtGlP34a3dBltXa\nqo60ln220571U+lA8hfNsq86gmS5TsYdmdBGLknFmQKBgQDXiv9ZPmUFeYWrj0EA\nmcnp0zwmcv8kV2ef44Cs+DWLmpGuKTKRJcNfnAqS7OuP709Z2ICQXPSdVsIzoa+o\nwKdF2BYAnZxMaDo2sBptHpDQumeD1VA7JmqLl2nS5g4jgsMNgzf92+aNCvduy+0j\nxqTsksQkMA3I3KMtFrFf+Y9wGwKBgQDJP5kzUgNQyZymWMezz7jmWayx99glIjR2\nYl9vGBrTMYt3sc6wzzbZS5bI2qpgNuovRU+6FP4cqVJ1qd0MISNiuvOLAqQQe/qB\nMXzkdv0lqGg4+3gEbooKrpWUk2z0xotyfa2TB5MwwT1fApBjBWwEoouUojVEdBXQ\nCul7AmvXPQKBgQCuximZnsthbhFidE18BDfCXyM19idGu4zuDBZpqvYYFiSseQFk\nyp8qZqf4TR4RXzYTn0dYR9edwRzFqwR5rIW2T6o/o416M0WI1LEI7DD23z9SmeRt\nog/g0szfUuYCC2TIDy+Wq/m9QjgyYi8OxGM05SkgQsrapXW2+OCo9v5FIwKBgC9L\nvQtsmM7hsuj9MGG3zbKFHKrunmOLuFyiHd+UAKnlmOtWZEb1S+SheRxXF3dpMHxP\ng78ts9K0kGaKtyJkn1ZSrW3b/wbIvESkhr+Cn1e8TlIl9zzDZbnA8fJq+05DYv5T\nPvmw7AynPW8YwSokWhB0yuzxeidOSNoN1nVMSl/ZAoGAU+HTEUn8IFd8uyhM7C33\nG82MTOW4E6h1J7ekNshk5rG8AZ9MfcjFJ/c48GfclDzaEkV+kGLeYkM8xGmtKxwJ\nb4haB1xe8nrUdjkue10HfKJFj62yYuL+6Z6nYVtunoBhY+S+1e9nrzSQ5wEcxPtt\n4MzhpKeLEG7DIQPtsum2LQ8=\n-----END PRIVATE KEY-----\n",
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
    throw error;
  }
} else {
  adminApp = getApps()[0];
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
  adminStorage = getStorage(adminApp);
}

export { adminAuth, adminDb, adminStorage };
