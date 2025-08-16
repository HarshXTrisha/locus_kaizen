import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';

// User Settings interface (for user-facing operations)
export interface UserSettings {
  userId: string;
  // Profile settings
  displayName: string;
  bio: string;
  avatar: string;
  timezone: string;
  language: string;
  
  // Notification settings
  emailNotifications: {
    newQuizzes: boolean;
    quizResults: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  
  // Quiz preferences
  quizPreferences: {
    defaultTimeLimit: number;
    defaultPassingScore: number;
    showTimer: boolean;
    allowReview: boolean;
    randomizeQuestions: boolean;
  };
  
  // Privacy settings
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showResults: boolean;
    allowAnalytics: boolean;
  };
  
  // Theme settings
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Database Settings interface (for Firestore operations)
interface DatabaseSettings {
  userId: string;
  displayName: string;
  bio: string;
  avatar: string;
  timezone: string;
  language: string;
  emailNotifications: {
    newQuizzes: boolean;
    quizResults: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  quizPreferences: {
    defaultTimeLimit: number;
    defaultPassingScore: number;
    showTimer: boolean;
    allowReview: boolean;
    randomizeQuestions: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showResults: boolean;
    allowAnalytics: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  createdAt?: FieldValue;
  updatedAt: FieldValue;
}

// Default settings
export const defaultSettings: Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  displayName: '',
  bio: '',
  avatar: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: 'en',
  
  emailNotifications: {
    newQuizzes: true,
    quizResults: true,
    systemUpdates: true,
    marketing: false,
  },
  
  quizPreferences: {
    defaultTimeLimit: 60,
    defaultPassingScore: 70,
    showTimer: true,
    allowReview: true,
    randomizeQuestions: false,
  },
  
  privacy: {
    profileVisibility: 'public',
    showResults: true,
    allowAnalytics: true,
  },
  
  theme: {
    mode: 'auto',
    primaryColor: '#20C997',
    fontSize: 'medium',
  },
};

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'userSettings', userId));
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        userId: settingsDoc.id,
        displayName: data.displayName || defaultSettings.displayName,
        bio: data.bio || defaultSettings.bio,
        avatar: data.avatar || defaultSettings.avatar,
        timezone: data.timezone || defaultSettings.timezone,
        language: data.language || defaultSettings.language,
        emailNotifications: {
          ...defaultSettings.emailNotifications,
          ...data.emailNotifications,
        },
        quizPreferences: {
          ...defaultSettings.quizPreferences,
          ...data.quizPreferences,
        },
        privacy: {
          ...defaultSettings.privacy,
          ...data.privacy,
        },
        theme: {
          ...defaultSettings.theme,
          ...data.theme,
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting user settings:', error);
    throw new Error('Failed to get user settings');
  }
}

/**
 * Create or update user settings
 */
export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  try {
    const existingSettings = await getUserSettings(userId);
    
    // Create database settings object with proper FieldValue types
    const settingsData: DatabaseSettings = {
      userId,
      displayName: (existingSettings || defaultSettings).displayName,
      bio: (existingSettings || defaultSettings).bio,
      avatar: (existingSettings || defaultSettings).avatar,
      timezone: (existingSettings || defaultSettings).timezone,
      language: (existingSettings || defaultSettings).language,
      emailNotifications: {
        ...(existingSettings || defaultSettings).emailNotifications,
        ...settings.emailNotifications,
      },
      quizPreferences: {
        ...(existingSettings || defaultSettings).quizPreferences,
        ...settings.quizPreferences,
      },
      privacy: {
        ...(existingSettings || defaultSettings).privacy,
        ...settings.privacy,
      },
      theme: {
        ...(existingSettings || defaultSettings).theme,
        ...settings.theme,
      },
      updatedAt: serverTimestamp(),
    };
    
    if (!existingSettings) {
      settingsData.createdAt = serverTimestamp();
    }
    
    await setDoc(doc(db, 'userSettings', userId), settingsData);
    console.log('✅ User settings saved successfully');
  } catch (error) {
    console.error('❌ Error saving user settings:', error);
    throw new Error('Failed to save user settings');
  }
}

/**
 * Update specific setting fields
 */
export async function updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    
    // Filter out Date fields and only update non-timestamp fields
    const { createdAt, updatedAt, userId: _, ...updateFields } = updates;
    
    await updateDoc(settingsRef, {
      ...updateFields,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User settings updated successfully');
  } catch (error) {
    console.error('❌ Error updating user settings:', error);
    throw new Error('Failed to update user settings');
  }
}

/**
 * Initialize user settings with defaults
 */
export async function initializeUserSettings(userId: string, userData: { displayName?: string; email?: string }): Promise<void> {
  try {
    const existingSettings = await getUserSettings(userId);
    
    if (!existingSettings) {
      const initialSettings: UserSettings = {
        userId,
        displayName: userData.displayName || '',
        bio: '',
        avatar: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en',
        emailNotifications: defaultSettings.emailNotifications,
        quizPreferences: defaultSettings.quizPreferences,
        privacy: defaultSettings.privacy,
        theme: defaultSettings.theme,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await saveUserSettings(userId, initialSettings);
      console.log('✅ User settings initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing user settings:', error);
    throw new Error('Failed to initialize user settings');
  }
}
