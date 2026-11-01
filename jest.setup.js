/* eslint-env jest */

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-user-uid',
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
      },
    })
  ),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        uid: 'test-user-uid',
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
      },
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // unsubscribe
  }),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => false,
      data: () => ({}),
    })
  ),
  getDocs: jest.fn(() =>
    Promise.resolve({
      docs: [],
    })
  ),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-doc-id' })),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
}));
