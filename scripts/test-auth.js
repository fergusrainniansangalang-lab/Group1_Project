const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Auto-load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

async function testAuth() {
  console.log('Testing Firebase Auth for project:', firebaseConfig.projectId);
  console.log('Using API key:', firebaseConfig.apiKey);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  try {
    const testEmail = `testuser_${Date.now()}@gmail.com`;
    console.log(`⏳ Attempting to register test user (${testEmail})...`);
    const cred = await createUserWithEmailAndPassword(auth, testEmail, 'Password123!');
    console.log('✅ Auth sign-up SUCCESS! Created user with UID:', cred.user.uid);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('✅ Auth API key is VALID! (Email was already registered)');
    } else {
      console.log('❌ Auth error code:', err.code);
      console.log('❌ Auth error message:', err.message);
    }
  }
}

testAuth().then(() => process.exit(0)).catch(() => process.exit(1));
