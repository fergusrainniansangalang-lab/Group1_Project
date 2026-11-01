// @file    authService.js
// @folder  src/services/
// @about   Firebase Authentication service layer for all auth operations.
//
// What this file does:
// - signUpUser()        — creates a new account with email and password.
// - signInUser()        — authenticates an existing account.
// - signOutUser()       — signs the current user out.
// - updateUserProfile() — updates displayName and photoURL in Firebase Auth.
// - validateEmail()     — reusable email format checker used across the app.

/**
 * Firebase Authentication Service
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

// Allowed email domains for validation
const ALLOWED_DOMAINS = ['gmail.com', 'letran.edu.ph'];

/**
 * Validate that the email ends with an allowed domain.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Please enter your email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  // Must contain @
  if (!trimmed.includes('@')) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  const domain = trimmed.split('@').pop();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return {
      valid: false,
      message: `Only @gmail.com and @letran.edu.ph email addresses are allowed.`,
    };
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  return { valid: true, message: '' };
};

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @param {string} photoURL - profile picture URL
 * @returns {Promise<object>} The created user object
 */
export const signUpUser = async (email, password, displayName, photoURL) => {
  const validation = validateEmail(email);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Set the display name and photo URL on the Firebase Auth profile
  await updateProfile(user, {
    displayName: displayName || email.split('@')[0],
    photoURL: photoURL || null,
  });

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || displayName,
    avatar: user.photoURL || photoURL,
  };
};

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The signed-in user object
 */
export const signInUser = async (email, password) => {
  const validation = validateEmail(email);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (!password || !password.trim()) {
    throw new Error('Please enter your password.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || email.split('@')[0],
    avatar: user.photoURL || null,
  };
};

/**
 * Sign out the current user.
 */
export const signOutUser = async () => {
  await signOut(auth);
};

/**
 * Update the current user's profile (display name, photo).
 * This only updates the CURRENT user's Firebase Auth profile.
 * @param {object} updates - { displayName, photoURL }
 */
export const updateUserProfile = async (updates) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently signed in.');
  }

  await updateProfile(currentUser, {
    displayName: updates.displayName ?? currentUser.displayName,
    photoURL: updates.photoURL ?? currentUser.photoURL,
  });

  return {
    uid: currentUser.uid,
    email: currentUser.email,
    name: currentUser.displayName,
    avatar: currentUser.photoURL,
  };
};

/**
 * Subscribe to auth state changes.
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        avatar: firebaseUser.photoURL || null,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Get the currently signed-in user (sync check).
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || user.email.split('@')[0],
    avatar: user.photoURL || null,
  };
};
