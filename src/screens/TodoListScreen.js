// @file    TodoListScreen.js
// @folder  src/screens/
// @about   Personal post-stream screen showing only the current user's posts.
//
// What this file does:
// - Filters the global posts array to show only the logged-in user's posts.
// - Renders a header banner with a live post count badge.
// - Provides a quick-compose bar that opens the AddTaskModal.
// - Maps each user post through the TaskItem feed card component.

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { TaskItem } from '../components/feed/TaskItem';

export const TodoListScreen = ({
  posts,
  onToggleComplete,
  onDelete,
  onEdit,
  onReact,
  onAddComment,
  onShare,
  onOpenAddModal,
  isDark,
  user,
}) => {
  const currentUserName = user?.name || 'Alex Morgan';
  const userAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

  const userPosts = posts.filter(
    (p) =>
      p.author === currentUserName ||
      p.author === 'You' ||
      p.author === 'Alex Morgan' ||
      !p.author
  );

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const inputBg = isDark ? '#3A3B3C' : '#F0F2F5';

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
      {/* Header Banner */}
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: border,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: textColor, marginRight: 8 }}>
              My Posts
            </Text>
            <View
              style={{
                backgroundColor: '#1877F2',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 }}>
                {userPosts.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onOpenAddModal}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#1877F2',
              borderRadius: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
              + Create Post
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: subTextColor }}>
          Showing all updates, thoughts, and tasks posted by you ({currentUserName}).
        </Text>
      </View>

      {/* Quick Composer */}
      <View
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: border,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: userAvatar }}
          style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
        />
        <TouchableOpacity
          onPress={onOpenAddModal}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: inputBg,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Text style={{ fontSize: 13, color: subTextColor }}>
            Post an update to your stream...
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Posts List */}
      {userPosts.length === 0 ? (
        <View
          style={{
            padding: 32,
            alignItems: 'center',
            backgroundColor: cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 8 }}>📝</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
            No posts created yet
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: subTextColor,
              textAlign: 'center',
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            Your activity stream is empty. Share what you're working on with the community!
          </Text>
          <TouchableOpacity
            onPress={onOpenAddModal}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#1877F2',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>
              Write your first post
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        userPosts.map((post) => (
          <TaskItem
            key={post.id}
            post={post}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onReact={onReact}
            onAddComment={onAddComment}
            onShare={onShare}
            isDark={isDark}
            user={user}
          />
        ))
      )}
    </View>
  );
};