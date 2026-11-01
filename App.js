// @file    App.js
// @folder  / (project root)
// @about   Root application component — entry point for the Facebook clone.
//
// What this file does:
// - Manages top-level state: user session, posts, stories, active screen, and dark mode.
// - Handles app initialization: loads the stored user and posts from Firestore on startup.
// - Controls navigation between Onboarding, Login, Feed, My Posts, and Profile screens.
// - Wires all modal open/close state (AddTaskModal, AddStoryModal, StoryViewerModal, AIChatModal).
// - Syncs post and story mutations (create, edit, delete, react, comment) to Firestore.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { taskStorage } from './src/services/taskStorage';
import { SearchBar } from './src/components/common/SearchBar';
import { AddTaskModal } from './src/components/modals/AddTaskModal';
import { AddStoryModal } from './src/components/modals/AddStoryModal';
import { StoryViewerModal } from './src/components/modals/StoryViewerModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { TodoListScreen } from './src/screens/TodoListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Onboarding } from './src/screens/Onboarding';
import { LoginPage } from './src/screens/LoginPage';
import {
  saveStoredUser,
  getStoredUser,
  saveRecentAccount,
} from './src/services/storage';
import {
  createPost,
  getAllPosts,
  saveUserProfile,
  createStory,
  getAllStories,
  updateAuthorOnPosts,
  updateAuthorOnStories,
} from './src/services/firestoreService';
import { updateUserProfile, signOutUser } from './src/services/authService';
import { AIChatModal } from './src/components/modals/AIChatModal';
import { useFeedBriefing } from './src/hooks/useFeedBriefing';
import { useFeedChat } from './src/hooks/useFeedChat';

export default function App() {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeScreen, setActiveScreen] = useState('feed');
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Almanac Guide Steps 6, 7 & 8: AI Briefing and Chat hooks
  const briefingHook = useFeedBriefing(posts, stories, user);
  const chatHook = useFeedChat(posts, stories, user);

  const searchInputRef = useRef(null);

  const openAddModal = () => {
    setEditingPost(null);
    searchInputRef.current?.blur();
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    searchInputRef.current?.blur();
    setIsModalOpen(true);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Hydrate all persisted state on app startup
  useEffect(() => {
    (async () => {
      try {
        // Restore user session
        const storedUser = await getStoredUser();
        if (storedUser) {
          setUser((current) => current || storedUser);
        }

        // Restore posts from device storage
        const loadedPosts = await taskStorage.loadPosts();
        if (loadedPosts && loadedPosts.length > 0) {
          setPosts(loadedPosts);
        }

        // Restore stories from device storage
        const loadedStories = await taskStorage.loadStories();
        if (loadedStories && loadedStories.length > 0) {
          setStories(loadedStories);
        }

        // Restore app state (theme, active screen, active tab)
        const savedAppState = await taskStorage.loadAppState();
        if (savedAppState) {
          if (savedAppState.isDark !== undefined) setIsDark(savedAppState.isDark);
          if (savedAppState.activeScreen) setActiveScreen(savedAppState.activeScreen);
          if (savedAppState.activeTab) setActiveTab(savedAppState.activeTab);
        }

        // Try syncing latest public posts and stories from Firestore
        try {
          const firestorePosts = await getAllPosts();
          if (firestorePosts && firestorePosts.length > 0) {
            setPosts(firestorePosts);
          }
        } catch (e) {
          // offline / mock fallback
        }

        try {
          const firestoreStories = await getAllStories();
          if (firestoreStories && firestoreStories.length > 0) {
            setStories(firestoreStories);
          }
        } catch (e) {
          // offline / mock fallback
        }
      } catch (err) {
        // ignore — will use defaults
      } finally {
        setIsAppReady(true);
      }
    })();
  }, []);

  // When user profile changes, update author/avatar on their posts and stories
  useEffect(() => {
    if (user?.name && (posts.length > 0 || stories.length > 0)) {
      setPosts((prev) =>
        prev.map((post) => {
          const isUserPost =
            (post.authorId && post.authorId === user.uid) ||
            (!post.authorId && post.author === user.name);
          if (isUserPost) {
            return {
              ...post,
              author: user.name,
              avatar: user.avatar || post.avatar,
            };
          }
          return post;
        })
      );

      setStories((prev) =>
        prev.map((story) => {
          if (story.authorId && story.authorId === user.uid) {
            return {
              ...story,
              name: user.name,
              avatar: user.avatar || story.avatar,
            };
          }
          return story;
        })
      );
    }
  }, [user?.name, user?.avatar, user?.uid]);

  // Persist posts whenever they change
  useEffect(() => {
    if (
      isAppReady &&
      posts.length > 0 &&
      taskStorage &&
      typeof taskStorage.savePosts === 'function'
    ) {
      taskStorage.savePosts(posts);
    }
  }, [posts, isAppReady]);

  // Persist stories whenever they change
  useEffect(() => {
    if (isAppReady && stories.length > 0 && taskStorage) {
      taskStorage.saveStories(stories);
    }
  }, [stories, isAppReady]);

  // Persist app state (theme, screen, tab) whenever they change
  useEffect(() => {
    if (isAppReady) {
      taskStorage.saveAppState({
        isDark,
        activeScreen,
        activeTab,
      });
    }
  }, [isDark, activeScreen, activeTab, isAppReady]);

  const handleToggleComplete = (id) => {
    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? { ...post, completed: !post.completed }
          : post
      )
    );
  };

  const handleDeletePost = (id) => {
    setPosts((previous) => previous.filter((post) => post.id !== id));
    showToast('Post removed successfully.');
  };

  const handleReact = (id, reactionType) => {
    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== id) return post;

        const isSame = post.userReaction === reactionType;
        const newReaction = isSame ? null : reactionType;
        const updatedReactions = { ...post.reactions };

        if (post.userReaction) {
          updatedReactions[post.userReaction] = Math.max(
            0,
            (updatedReactions[post.userReaction] || 0) - 1
          );
        }

        if (newReaction) {
          updatedReactions[newReaction] =
            (updatedReactions[newReaction] || 0) + 1;
        }

        return {
          ...post,
          userReaction: newReaction,
          reactions: updatedReactions,
        };
      })
    );
  };

  const handleAddComment = (id, text) => {
    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== id) return post;

        const newComment = {
          id: Date.now(),
          author: user ? user.name : 'Alex Morgan',
          text,
          time: 'Just now',
        };

        return {
          ...post,
          comments: [...(post.comments || []), newComment],
        };
      })
    );
    showToast('Comment added!');
  };

  const handleSharePost = (id) => {
    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== id) return post;
        return {
          ...post,
          shares: (post.shares || 0) + 1,
        };
      })
    );
    showToast('Post shared to your Feed! ↗️');
  };

  const handleSavePost = async (postData) => {
    if (editingPost) {
      setPosts((previous) =>
        previous.map((p) =>
          p.id === editingPost.id
            ? {
              ...p,
              content: postData.content,
              media: postData.media,
              category: postData.category,
              author: user ? user.name : p.author,
              avatar: user?.avatar || p.avatar,
            }
            : p
        )
      );
      showToast('Post updated successfully!');
      setEditingPost(null);
    } else {
      const newPost = {
        id: Date.now(),
        authorId: user?.uid || (user ? user.id : 'default_author'),
        author: user ? user.name : 'Alex Morgan',
        avatar:
          user?.avatar ||
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        time: 'Just now',
        content: postData.content,
        media: postData.media,
        mediaType: postData.mediaType || 'image',
        category: postData.category || 'Work',
        completed: false,
        reactions: { like: 0, love: 0 },
        shares: 0,
        userReaction: null,
        comments: [],
      };
      setPosts((previous) => [newPost, ...previous]);
      showToast('Your post has been published to public feed!');

      // Sync post to Firestore
      try {
        if (user?.uid) {
          const created = await createPost(postData, user);
          if (created?.id) {
            newPost.id = created.id;
          }
        }
      } catch (err) {
        console.warn('Post saved locally, Firestore offline:', err);
      }
    }
  };

  const handleAddStory = async (storyData) => {
    const newStory = {
      id: 'story_' + Date.now(),
      authorId: user?.uid || (user ? user.id : 'default_author'),
      name: user ? user.name : 'Alex Morgan',
      avatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      image: storyData.image,
      caption: storyData.caption,
      time: 'Just now',
    };

    setStories((prev) => [newStory, ...prev]);
    showToast('Your story has been shared to public feed! 🌟');

    // Sync story to Firestore
    try {
      if (user?.uid) {
        const created = await createStory(storyData, user);
        if (created?.id) {
          newStory.id = created.id;
        }
      }
    } catch (err) {
      console.warn('Story saved locally, Firestore offline:', err);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    setUser(updatedUser);

    // Update ONLY posts authored by THIS user (strict profile isolation)
    setPosts((previous) =>
      previous.map((post) => {
        const isUserPost =
          (post.authorId && post.authorId === updatedUser.uid) ||
          (!post.authorId && (post.author === user?.name || post.author === updatedUser.name));
        if (isUserPost) {
          return {
            ...post,
            author: updatedUser.name,
            avatar: updatedUser.avatar,
          };
        }
        return post;
      })
    );

    // Update ONLY stories authored by THIS user (strict profile isolation)
    setStories((previous) =>
      previous.map((story) => {
        if (story.authorId && story.authorId === updatedUser.uid) {
          return {
            ...story,
            name: updatedUser.name,
            avatar: updatedUser.avatar,
          };
        }
        return story;
      })
    );

    saveStoredUser(updatedUser);
    saveRecentAccount(updatedUser);

    // Sync profile updates to Firestore and Firebase Auth
    try {
      if (updatedUser.uid) {
        await saveUserProfile(updatedUser.uid, updatedUser);
        await updateUserProfile({
          displayName: updatedUser.name,
          photoURL: updatedUser.avatar,
        });
        await updateAuthorOnPosts(updatedUser.uid, updatedUser.name, updatedUser.avatar);
        await updateAuthorOnStories(updatedUser.uid, updatedUser.name, updatedUser.avatar);
      }
    } catch (err) {
      console.warn('Profile saved locally, Firestore offline:', err);
    }

    showToast('Profile updated across all screens!');
  };

  // Show loading screen while hydrating persisted state
  if (!isAppReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#18191A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1877F2', marginBottom: 8 }}>
          facebook
        </Text>
        <Text style={{ fontSize: 13, color: '#B0B3B8' }}>Loading your data...</Text>
      </View>
    );
  }

  if (isOnboarding) {
    return <Onboarding onComplete={() => setIsOnboarding(false)} />;
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={(userData) => {
          setUser(userData);
          saveStoredUser(userData);
          if (userData?.name) {
            setPosts((previous) =>
              previous.map((post) => {
                if (
                  post.author === userData.name ||
                  post.author === 'You' ||
                  post.author === 'Alex Morgan'
                ) {
                  return {
                    ...post,
                    author: userData.name,
                    avatar: userData.avatar || post.avatar,
                  };
                }
                return post;
              })
            );
          }
        }}
      />
    );
  }

  // Design Guidelines Color Scheme:
  // #1877F2 (FB Blue), #F0F2F5 (Background), #FFFFFF (Card surface)
  const bgColor = isDark ? '#18191A' : '#F0F2F5';
  const headerBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const borderColor = isDark ? '#3E4042' : '#CED0D4';
  const iconBg = isDark ? '#3A3B3C' : '#E4E6EB';

  const isFeed = activeScreen === 'feed' || activeScreen === 'home';
  const isProfile = activeScreen === 'profile';
  const isMyPosts = activeScreen === 'myPosts' || activeScreen === 'todos';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* 1. Header: Facebook brand logo, mock search bar, and notification icons */}
      <View
        style={{
          paddingTop: 44,
          paddingHorizontal: 16,
          paddingBottom: 8,
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Facebook brand logo */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: '#1877F2',
              letterSpacing: -1.2,
            }}
          >
            facebook
          </Text>

          {/* Action & Notification Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Create Post (+) Shortcut */}
            <TouchableOpacity
              onPress={openAddModal}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: iconBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor }}>
                +
              </Text>
            </TouchableOpacity>

            {/* Notification Bell with Badge */}
            <TouchableOpacity
              onPress={() => setShowNotificationsModal(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: iconBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                position: 'relative',
              }}
            >
              <Text style={{ fontSize: 16 }}>🔔</Text>
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#E41E3F',
                  borderRadius: 9,
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: headerBg,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
                  3
                </Text>
              </View>
            </TouchableOpacity>

            {/* Meta AI Header Shortcut */}
            <TouchableOpacity
              onPress={() => setIsAIChatOpen(true)}
              accessibilityLabel="Open Meta AI Assistant"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? '#1C2733' : '#EBF5FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                borderWidth: 1,
                borderColor: '#1877F2',
              }}
            >
              <Text style={{ fontSize: 16 }}>✨</Text>
            </TouchableOpacity>


            {/* Dark / Light Toggle */}
            <TouchableOpacity
              onPress={() => setIsDark((prev) => !prev)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: iconBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {/* Profile Avatar Quick Shortcut */}
            <TouchableOpacity
              onPress={() => setActiveScreen('profile')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                overflow: 'hidden',
                borderWidth: activeScreen === 'profile' ? 2 : 1,
                borderColor: activeScreen === 'profile' ? '#1877F2' : borderColor,
              }}
            >
              <Image
                source={{
                  uri:
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mock Search Bar */}
        <View style={{ marginTop: 8 }}>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isDark={isDark}
            inputRef={searchInputRef}
          />
        </View>
      </View>

      {/* Tab Navigation: Quick switcher between Feed, Profile, and My Posts */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        {[
          { id: 'feed', icon: '🏠', label: 'Feed', isActive: isFeed },
          { id: 'ai', icon: '✨', label: 'Meta AI', isActive: isAIChatOpen },
          { id: 'profile', icon: '👤', label: 'Profile', isActive: isProfile },
          { id: 'myPosts', icon: '📋', label: 'My Posts', isActive: isMyPosts },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => {
              if (tab.id === 'ai') {
                setIsAIChatOpen(true);
              } else {
                setActiveScreen(tab.id);
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderBottomWidth: tab.isActive ? 3 : 0,
              borderBottomColor: '#1877F2',
            }}
          >
            {tab.id === 'profile' && user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: tab.isActive ? 2 : 1,
                  borderColor: tab.isActive ? '#1877F2' : subTextColor,
                }}
              />
            ) : (
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            )}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: tab.isActive ? '#1877F2' : subTextColor,
                marginTop: 2,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toast Notification Banner */}
      {toastMessage ? (
        <View
          style={{
            position: 'absolute',
            top: 150,
            left: 20,
            right: 20,
            backgroundColor: '#1877F2',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 20,
            zIndex: 999,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>
            {toastMessage}
          </Text>
        </View>
      ) : null}

      {/* Main Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {isFeed && (
            <HomeScreen
              posts={posts}
              stories={stories}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeletePost}
              onEdit={openEditModal}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onShare={handleSharePost}
              onOpenAddModal={openAddModal}
              onOpenAddStory={() => setIsStoryModalOpen(true)}
              onViewStory={(story) => setViewingStory(story)}
              isDark={isDark}
              user={user}
              briefing={briefingHook.briefing}
              briefingLoading={briefingHook.loading}
              briefingError={briefingHook.error}
              onRefreshBriefing={briefingHook.refresh}
              onOpenAIChat={() => setIsAIChatOpen(true)}
            />
          )}

          {isProfile && (
            <ProfileScreen
              user={user}
              posts={posts}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeletePost}
              onEdit={openEditModal}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onShare={handleSharePost}
              onOpenAddModal={openAddModal}
              isDark={isDark}
              onLogout={async () => {
                try {
                  await signOutUser();
                } catch (e) {
                  // offline fallback
                }
                setUser(null);
                saveStoredUser(null);
              }}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {isMyPosts && (
            <TodoListScreen
              posts={posts}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeletePost}
              onEdit={openEditModal}
              onReact={handleReact}
              onAddComment={handleAddComment}
              onShare={handleSharePost}
              onOpenAddModal={openAddModal}
              isDark={isDark}
              user={user}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post Creation & Edit Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onAddPost={handleSavePost}
        postToEdit={editingPost}
        isDark={isDark}
        user={user}
      />

      {/* Story Creation Modal */}
      <AddStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onAddStory={handleAddStory}
        user={user}
        isDark={isDark}
      />

      {/* Fullscreen Story Viewer Modal */}
      <StoryViewerModal
        story={viewingStory}
        isOpen={Boolean(viewingStory)}
        onClose={() => setViewingStory(null)}
      />

      {/* Facebook Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: headerBg,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: textColor }}>
                Notifications
              </Text>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <Text style={{ fontSize: 16, color: subTextColor, fontWeight: 'bold' }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {[
              {
                id: 1,
                icon: '❤️',
                text: 'Sarah Jenkins loved your post: "Just finished setting up our new dashboard!"',
                time: '15m ago',
              },
              {
                id: 2,
                icon: '💬',
                text: 'David Chen commented: "Looks incredible! Fantastic work."',
                time: '1h ago',
              },
              {
                id: 3,
                icon: '↗️',
                text: 'Maya Lin shared your post to her activity stream.',
                time: '2h ago',
              },
            ].map((n) => (
              <View
                key={n.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#3A3B3C' : '#F0F2F5',
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: textColor, lineHeight: 18 }}>
                    {n.text}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#1877F2', marginTop: 2, fontWeight: '600' }}>
                    {n.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Meta AI Chat Assistant Modal (Almanac Guide Ask Sheet) */}
      <AIChatModal
        visible={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        chat={chatHook}
        isDark={isDark}
      />
    </View>
  );
}
