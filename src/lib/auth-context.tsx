'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAppStore } from './store';
import { showSuccess, showError } from '@/components/common/NotificationSystem';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser, setAuthenticated, setLoading: setStoreLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Convert Firebase user to our app user format
        const appUser = {
          id: user.uid,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: user.photoURL || undefined,
          createdAt: new Date(user.metadata.creationTime || Date.now()),
          lastLogin: new Date(user.metadata.lastSignInTime || Date.now()),
        };
        
        setStoreUser(appUser);
        setAuthenticated(true);
        showSuccess('Welcome Back!', `Hello ${appUser.firstName}!`, 3000);
      } else {
        setStoreUser(null);
        setAuthenticated(false);
      }
      
      setStoreLoading(false);
    });

    return () => unsubscribe();
  }, [setStoreUser, setAuthenticated, setStoreLoading]);

  const signOut = async () => {
    try {
      await auth.signOut();
      showSuccess('Signed Out', 'You have been successfully signed out.', 3000);
    } catch (error) {
      showError('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
