// Lazy Firebase initialization to reduce initial bundle size
let firebaseApp: any = null;
let firebaseAuth: any = null;
let firebaseDb: any = null;
let firebaseStorage: any = null;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: "locus-8b4e8.firebaseapp.com",
  projectId: "locus-8b4e8",
  storageBucket: "locus-8b4e8.firebasestorage.app",
  messagingSenderId: "5682995815",
  appId: "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: "G-GXSXV4NNE8"
};

// Initialize Firebase only when needed
export const initializeFirebase = async () => {
  if (firebaseApp) return firebaseApp;

  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  const { getStorage } = await import('firebase/storage');

  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);

  return firebaseApp;
};

// Lazy getters for Firebase services
export const getAuth = async () => {
  if (!firebaseAuth) await initializeFirebase();
  return firebaseAuth;
};

export const getDb = async () => {
  if (!firebaseDb) await initializeFirebase();
  return firebaseDb;
};

export const getStorage = async () => {
  if (!firebaseStorage) await initializeFirebase();
  return firebaseStorage;
};

// Preload Firebase for critical paths
export const preloadFirebase = () => {
  if (typeof window !== 'undefined') {
    // Preload Firebase when user shows intent to use auth features
    const preload = () => initializeFirebase();
    
    // Preload on user interaction
    document.addEventListener('click', preload, { once: true });
    document.addEventListener('focus', preload, { once: true });
  }
};
