// @file    storage.js
// @folder  src/services/
// @about   AsyncStorage helpers for user session, profile, and account persistence.
//
// What this file does:
// - Defines storage key constants to prevent typo-related bugs.
// - Saves and retrieves the current user session and profile data.
// - Manages a list of recently signed-in accounts for the login screen switcher.
// - Provides a clear-all utility for logout/cache-reset flows.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
  TASKS: '@todo_tasks',
  USER_SESSION: '@user_session',
  USER_PROFILE: '@user_profile',
  RECENT_ACCOUNTS: '@recent_accounts',
  THEME_PREFERENCE: '@theme_preference',
};

// Default Task Structure
export const DEFAULT_TASKS = [
  {
    id: '1',
    title: 'Complete Mobile App Design',
    description: 'Design onboarding, login, and todo screens in Figma',
    category: 'Work',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and Fruits',
    category: 'Personal',
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

// No default accounts — only accounts that have been signed in are stored
export const DEFAULT_RECENT_ACCOUNTS = [];

// Helper Functions
export const getStoredTasks = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  } catch (e) {
    console.error('Error reading tasks:', e);
    return [];
  }
};

export const saveStoredTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

export const getStoredUser = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading user profile:', e);
    return null;
  }
};

export const saveStoredUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
};

export const getRecentAccounts = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_ACCOUNTS);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (e) {
    console.error('Error loading recent accounts:', e);
    return [];
  }
};

export const saveRecentAccount = async (account) => {
  try {
    const current = await getRecentAccounts();
    const filtered = current.filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    const updated = [
      {
        id: account.id || Date.now().toString(),
        name: account.name || 'User',
        email: account.email,
        avatar: account.avatar || null,
        avatarColor: account.avatarColor || '#0866FF',
        badge: '1',
        lastActive: 'Active now',
      },
      ...filtered,
    ].slice(0, 4); // Keep up to 4 recent accounts
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_ACCOUNTS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving recent account:', e);
    return [];
  }
};

export const removeRecentAccount = async (email) => {
  try {
    const current = await getRecentAccounts();
    const updated = current.filter(
      (a) => a.email.toLowerCase() !== email.toLowerCase()
    );
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_ACCOUNTS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error removing recent account:', e);
    return [];
  }
};

export const getThemePreference = async () => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    return val || 'dark';
  } catch (e) {
    return 'dark';
  }
};

export const saveThemePreference = async (theme) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  } catch (e) {
    console.error('Error saving theme preference:', e);
  }
};