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
  const { setUser: setStoreUser, setAuthenticated, setLoading: setStoreLoading, addNotification } = useAppStore();

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 AuthProvider: Auth state changed:', user ? 'User logged in' : 'User logged out');
      
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
        
        console.log('🔐 AuthProvider: Setting user in store:', appUser.firstName);
        setStoreUser(appUser);
        setAuthenticated(true);
        
        // Add welcome notification
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Welcome back!',
          message: `Great to see you again, ${appUser.firstName || 'User'}! Ready to continue your learning journey?`,
          createdAt: new Date(),
          read: false
        });
      } else {
        console.log('🔐 AuthProvider: Clearing user from store');
        setStoreUser(null);
        setAuthenticated(false);
      }
      
      setStoreLoading(false);
    }, (error) => {
      console.error('🔐 AuthProvider: Auth state error:', error);
      setLoading(false);
      setStoreLoading(false);
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, [setStoreUser, setAuthenticated, setStoreLoading, addNotification]);

  const signOut = async () => {
    try {
      console.log('🔐 AuthProvider: Signing out...');
      await auth.signOut();
      console.log('🔐 AuthProvider: Sign out successful');
    } catch (error) {
      console.error('🔐 AuthProvider: Sign out error:', error);
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
