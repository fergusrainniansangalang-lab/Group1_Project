const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
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

async function testDatabase() {
  console.log('📡 Connecting to Firebase project:', firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const testDocRef = doc(db, 'connection_test', 'my_first_doc');

  try {
    console.log('✍️  Writing a test document to collection "connection_test"...');
    await setDoc(testDocRef, {
      message: 'Hello from React Native & Antigravity!',
      status: 'active',
      testedAt: new Date().toISOString(),
    });
    console.log('✅ Document successfully written to Firestore!');

    console.log('📖 Reading it back...');
    const snapshot = await getDoc(testDocRef);
    if (snapshot.exists()) {
      console.log('🎉 Verified! Document data in Firestore:', snapshot.data());
    }
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log('⚠️ Security Rules Note: Read/write blocked. Make sure Firestore rules are set to test mode or allow read/write.');
    } else {
      console.error('❌ Error:', error.message || error);
    }
  }
}

testDatabase().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
