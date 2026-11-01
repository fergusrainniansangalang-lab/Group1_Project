// @file    taskStorage.js
// @folder  src/services/
// @about   AsyncStorage persistence layer for posts, stories, and app state.
//
// What this file does:
// - Saves and loads the full posts array to/from AsyncStorage on each session.
// - Persists stories so they survive app restarts.
// - Stores and retrieves general app state (e.g., active tab, theme preference).
// - Provides a clearAll() helper to reset the app's local cache on logout.

import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTS_STORAGE_KEY = '@g1work_posts';
const APP_STATE_KEY = '@g1work_app_state';

// Default seed data for first-time launch
const DEFAULT_POSTS = [
  {
    id: 1,
    author: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    time: '2 hrs ago',
    content: 'Just finished setting up our new project dashboard! Check out the stats component and leave feedback below.',
    media: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    mediaType: 'image',
    category: 'Work',
    completed: false,
    reactions: { like: 12, love: 5, laugh: 0 },
    shares: 3,
    userReaction: null,
    comments: [
      { id: 101, author: 'Sarah Jenkins', text: 'Looks incredible! Fantastic work.', time: '1 hr ago' }
    ]
  },
  {
    id: 2,
    author: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    time: '5 hrs ago',
    content: 'Quick video breakdown on React Native state management and clean UI architecture!',
    media: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    mediaType: 'image',
    category: 'Personal',
    completed: true,
    reactions: { like: 24, love: 18, laugh: 2 },
    shares: 8,
    userReaction: 'love',
    comments: [
      { id: 102, author: 'Alex Morgan', text: 'Super clear breakdown, thanks David!', time: '3 hrs ago' }
    ]
  },
  {
    id: 3,
    author: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    time: 'Yesterday at 3:45 PM',
    content: 'Beautiful sunset from the office terrace today. Always take a moment to breathe and enjoy the view! 🌇',
    media: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    mediaType: 'image',
    category: 'Personal',
    completed: false,
    reactions: { like: 45, love: 32, laugh: 1 },
    shares: 12,
    userReaction: null,
    comments: [
      { id: 103, author: 'David Chen', text: 'Incredible colors! 🌅', time: 'Yesterday' }
    ]
  }
];

// In-memory cache (keeps synchronous getPosts/savePosts working)
let memoryPosts = [...DEFAULT_POSTS];
let isLoadedFromStorage = false;

export const taskStorage = {
  /**
   * Synchronous getter — returns the in-memory cache.
   * Call loadPosts() first on app startup to hydrate from AsyncStorage.
   */
  getPosts: () => {
    return memoryPosts;
  },

  /**
   * Synchronous setter — updates the in-memory cache.
   * Also triggers an async write to AsyncStorage.
   */
  savePosts: (posts) => {
    memoryPosts = posts;
    // Fire-and-forget persist
    taskStorage.persistPosts(posts);
  },

  /**
   * Async: Load posts from device storage into the in-memory cache.
   * Returns the loaded posts. If nothing is stored, seeds with defaults.
   */
  loadPosts: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      if (jsonValue !== null) {
        const parsed = JSON.parse(jsonValue);
        if (Array.isArray(parsed)) {
          memoryPosts = parsed;
          isLoadedFromStorage = true;
          return parsed;
        }
      }
      // First launch — seed with defaults and persist them
      memoryPosts = [...DEFAULT_POSTS];
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(memoryPosts));
      isLoadedFromStorage = true;
      return memoryPosts;
    } catch (e) {
      console.warn('Error loading posts from storage:', e);
      return memoryPosts;
    }
  },

  /**
   * Async: Persist posts to device storage.
   */
  persistPosts: async (posts) => {
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Error persisting posts to storage:', e);
    }
  },

  /**
   * Returns true if posts have already been loaded from storage.
   */
  isHydrated: () => isLoadedFromStorage,

  /**
   * Async: Load stories from device storage.
   */
  loadStories: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@g1work_stories');
      if (jsonValue !== null) {
        const parsed = JSON.parse(jsonValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [
        {
          id: 'story_1',
          authorId: 'system_sarah',
          name: 'Sarah Jenkins',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
          caption: 'Beach weekend getaway! 🌊',
          time: '2h ago',
        },
        {
          id: 'story_2',
          authorId: 'system_david',
          name: 'David Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
          caption: 'Late night coding vibes 💻',
          time: '4h ago',
        },
        {
          id: 'story_3',
          authorId: 'system_maya',
          name: 'Maya Lin',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
          caption: 'Mountain hike completed! 🏔️',
          time: '7h ago',
        },
      ];
    } catch (e) {
      console.warn('Error loading stories from storage:', e);
      return [];
    }
  },

  /**
   * Async: Save stories to device storage.
   */
  saveStories: async (stories) => {
    try {
      await AsyncStorage.setItem('@g1work_stories', JSON.stringify(stories));
    } catch (e) {
      console.warn('Error saving stories to storage:', e);
    }
  },

  /**
   * Async: Save general app state (active screen, active tab, theme, etc.)
   */
  saveAppState: async (state) => {
    try {
      await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving app state:', e);
    }
  },

  /**
   * Async: Load general app state.
   */
  loadAppState: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(APP_STATE_KEY);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
    } catch (e) {
      console.warn('Error loading app state:', e);
    }
    return null;
  },
};