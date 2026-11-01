// @file    TaskList.js
// @folder  src/components/feed/
// @about   Scrollable list container that renders an array of TaskItem cards.
//
// What this file does:
// - Accepts a filtered array of posts and maps each one to a TaskItem component.
// - Shows an empty-state illustration and call-to-action when no posts exist.
// - Passes all interaction callbacks (toggle, delete, edit, react, comment, share) down to each card.

import React from 'react';
import { View, Text } from 'react-native';
import { TaskItem } from './TaskItem';

export const TaskList = ({ posts, onToggleComplete, onDelete, onReact, onAddComment, isDark }) => {
  if (posts.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 14 }}>No posts or tasks found.</Text>
      </View>
    );
  }

  return (
    <View style={{}}>
      {posts.map((post) => (
        <TaskItem
          key={post.id}
          post={post}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onReact={onReact}
          onAddComment={onAddComment}
          isDark={isDark}
        />
      ))}
    </View>
  );
};