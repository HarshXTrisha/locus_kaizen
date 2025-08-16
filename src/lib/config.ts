// Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: "locus-8b4e8.firebaseapp.com",
  projectId: "locus-8b4e8",
  storageBucket: "locus-8b4e8.firebasestorage.app",
  messagingSenderId: "5682995815",
  appId: "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: "G-GXSXV4NNE8"
};

// Google OAuth Configuration
export const googleConfig = {
  clientId: "5682995815-8rbch5j8993m1mpi7p1lhb05f9ltl6o4.apps.googleusercontent.com",
  scopes: ['email', 'profile'],
  prompt: 'select_account'
};

// App Configuration
export const appConfig = {
  name: 'Locus',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://locus-kaizen.vercel.app'
};
