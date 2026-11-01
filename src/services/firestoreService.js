// @file    firestoreService.js
// @folder  src/services/
// @about   Firestore database service layer for posts, stories, and user profiles.
//
// What this file does:
// - createPost() / getAllPosts()           — create and fetch posts from Firestore.
// - createStory() / getAllStories()        — create and fetch stories from Firestore.
// - saveUserProfile() / getUserProfile()   — read and write user profile documents.
// - updateAuthorOnPosts() / updateAuthorOnStories() — batch-update author info after profile edits.

/**
 * Firestore Service — Normalized Database
 *
 * Collections:
 *
 *   users/{uid}
 *     - uid: string (matches Firebase Auth UID)
 *     - email: string
 *     - name: string
 *     - avatar: string (profile picture URL)
 *     - bio: string
 *     - coverPhoto: string
 *     - details: { work, education, city, hometown, relationship, joined, followers }
 *     - createdAt: timestamp
 *     - updatedAt: timestamp
 *
 *   posts/{postId}
 *     - id: string
 *     - authorId: string (references users/{uid})
 *     - authorName: string (denormalized for display performance)
 *     - authorAvatar: string (denormalized for display performance)
 *     - content: string
 *     - media: string|null
 *     - mediaType: string
 *     - category: string ('Work' | 'Personal' | 'Ideas')
 *     - completed: boolean
 *     - reactions: { like: number, love: number, laugh: number }
 *     - shares: number
 *     - createdAt: timestamp
 *     - updatedAt: timestamp
 *
 *   posts/{postId}/comments/{commentId}
 *     - id: string
 *     - authorId: string (references users/{uid})
 *     - authorName: string
 *     - text: string
 *     - createdAt: timestamp
 *
 *   posts/{postId}/userReactions/{uid}
 *     - reactionType: string ('like' | 'love' | 'laugh' | null)
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── USER OPERATIONS ────────────────────────────────────────

/**
 * Create or update a user profile document in Firestore.
 * Only writes to the current user's own document (uid-keyed).
 */
export const saveUserProfile = async (uid, userData) => {
  if (!uid) throw new Error('User ID is required.');

  const userRef = doc(db, 'users', uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, {
      uid,
      email: userData.email || '',
      name: userData.name || '',
      avatar: userData.avatar || '',
      bio: userData.bio || '',
      coverPhoto: userData.coverPhoto || '',
      details: userData.details || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Get a user profile by UID.
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;

  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...snapshot.data() };
};

// ─── POST OPERATIONS ────────────────────────────────────────

/**
 * Create a new post in Firestore.
 * The authorId ties the post to the user who created it.
 */
export const createPost = async (postData, user) => {
  if (!user?.uid) throw new Error('User must be signed in to create a post.');

  const postsRef = collection(db, 'posts');
  const newPost = {
    authorId: user.uid,
    authorName: user.name || user.email?.split('@')[0] || 'Unknown',
    authorAvatar: user.avatar || '',
    content: postData.content || '',
    media: postData.media || null,
    mediaType: postData.mediaType || 'image',
    category: postData.category || 'Work',
    completed: false,
    reactions: { like: 0, love: 0, laugh: 0 },
    shares: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(postsRef, newPost);
  return { id: docRef.id, ...newPost, time: 'Just now' };
};

/**
 * Get all posts, ordered by creation time (newest first).
 */
export const getAllPosts = async () => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const posts = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Load comments subcollection
    const commentsRef = collection(db, 'posts', docSnap.id, 'comments');
    const commentsSnap = await getDocs(query(commentsRef, orderBy('createdAt', 'asc')));
    const comments = commentsSnap.docs.map((c) => ({ id: c.id, ...c.data() }));

    posts.push({
      id: docSnap.id,
      ...data,
      comments,
      time: formatTimestamp(data.createdAt),
      userReaction: null, // Will be resolved per-user
    });
  }

  return posts;
};

/**
 * Get posts by a specific user.
 */
export const getUserPosts = async (uid) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('authorId', '==', uid), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    time: formatTimestamp(docSnap.data().createdAt),
  }));
};

/**
 * Update a post. Only the author (matching authorId) should call this.
 */
export const updatePost = async (postId, updates, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) throw new Error('Post not found.');

  const postData = postSnap.data();
  if (postData.authorId !== userId) {
    throw new Error('You can only edit your own posts.');
  }

  await updateDoc(postRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a post. Only the author should call this.
 */
export const deletePost = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) throw new Error('Post not found.');

  const postData = postSnap.data();
  if (postData.authorId !== userId) {
    throw new Error('You can only delete your own posts.');
  }

  await deleteDoc(postRef);
};

/**
 * Toggle completion status of a post.
 */
export const togglePostComplete = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return;

  const current = postSnap.data().completed || false;
  await updateDoc(postRef, { completed: !current, updatedAt: serverTimestamp() });
};

// ─── COMMENT OPERATIONS ─────────────────────────────────────

/**
 * Add a comment to a post. Stored in a normalized subcollection.
 */
export const addComment = async (postId, commentData, user) => {
  if (!user?.uid) throw new Error('Must be signed in to comment.');

  const commentsRef = collection(db, 'posts', postId, 'comments');
  const newComment = {
    authorId: user.uid,
    authorName: user.name || 'Unknown',
    text: commentData.text,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(commentsRef, newComment);
  return { id: docRef.id, ...newComment, time: 'Just now' };
};

// ─── REACTION OPERATIONS ────────────────────────────────────

/**
 * React to a post. Each user's reaction is stored in a subcollection
 * to ensure isolation (user A's reaction doesn't affect user B's).
 */
export const reactToPost = async (postId, reactionType, userId) => {
  const reactionRef = doc(db, 'posts', postId, 'userReactions', userId);
  const postRef = doc(db, 'posts', postId);

  const existingSnap = await getDoc(reactionRef);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;

  const postData = postSnap.data();
  const reactions = { ...postData.reactions };
  const oldReaction = existingSnap.exists() ? existingSnap.data().reactionType : null;

  // Remove old reaction count
  if (oldReaction && reactions[oldReaction] !== undefined) {
    reactions[oldReaction] = Math.max(0, reactions[oldReaction] - 1);
  }

  const isSame = oldReaction === reactionType;
  const newReaction = isSame ? null : reactionType;

  // Add new reaction count
  if (newReaction && reactions[newReaction] !== undefined) {
    reactions[newReaction] += 1;
  }

  // Batch write for atomicity
  const batch = writeBatch(db);

  if (newReaction) {
    batch.set(reactionRef, { reactionType: newReaction });
  } else if (existingSnap.exists()) {
    batch.delete(reactionRef);
  }

  batch.update(postRef, { reactions });
  await batch.commit();

  return { newReaction, reactions };
};

/**
 * Get the current user's reaction on a post.
 */
export const getUserReaction = async (postId, userId) => {
  if (!userId) return null;

  const reactionRef = doc(db, 'posts', postId, 'userReactions', userId);
  const snap = await getDoc(reactionRef);

  return snap.exists() ? snap.data().reactionType : null;
};

// ─── SHARE OPERATIONS ───────────────────────────────────────

/**
 * Increment share count on a post.
 */
export const sharePost = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return;

  const currentShares = postSnap.data().shares || 0;
  await updateDoc(postRef, { shares: currentShares + 1 });
};

// ─── BATCH: Update author info across all their posts ───────

/**
 * When a user updates their profile, update the denormalized
 * author name/avatar on all their posts.
 * This ONLY updates posts belonging to the given userId.
 */
export const updateAuthorOnPosts = async (userId, newName, newAvatar) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('authorId', '==', userId));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      authorName: newName,
      authorAvatar: newAvatar,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

// ─── STORY OPERATIONS ────────────────────────────────────────

/**
 * Create a new public story in Firestore.
 */
export const createStory = async (storyData, user) => {
  if (!user?.uid) throw new Error('User must be signed in to create a story.');

  const storiesRef = collection(db, 'stories');
  const newStory = {
    authorId: user.uid,
    name: user.name || user.email?.split('@')[0] || 'Unknown',
    avatar: user.avatar || '',
    image: storyData.image || '',
    caption: storyData.caption || '',
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(storiesRef, newStory);
  return { id: docRef.id, ...newStory, time: 'Just now' };
};

/**
 * Get all public stories, ordered by creation time.
 */
export const getAllStories = async () => {
  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    time: formatTimestamp(docSnap.data().createdAt),
  }));
};

/**
 * Update author info across their stories when profile is updated.
 */
export const updateAuthorOnStories = async (userId, newName, newAvatar) => {
  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, where('authorId', '==', userId));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      name: newName,
      avatar: newAvatar,
    });
  });

  await batch.commit();
};

// ─── HELPERS ────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp to a human-readable relative time.
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return 'Just now';

  const now = new Date();
  const date = timestamp.toDate();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};
