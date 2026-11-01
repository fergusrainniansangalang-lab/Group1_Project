// @file    firebase.js
// @folder  src/services/
// @about   Firebase app initialization for the Harbor (harbor-rn-2026) project.
//
// What this file does:
// - Initializes the Firebase app with the Harbor project credentials.
// - Exports the Auth instance for Firebase Authentication operations.
// - Exports the Firestore instance (db) for all database read/write operations.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration — values come from .env (via process.env or app.config.js)
// To set up: copy .env.example → .env and fill in your Firebase project keys.
const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY            || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN        || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID         || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID|| process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID             || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.FIREBASE_MEASUREMENT_ID     || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;