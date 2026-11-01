// @file    TaskStats.js
// @folder  src/components/feed/
// @about   Stats bar showing total, pending, and completed post counts.
//
// What this file does:
// - Calculates aggregate statistics from the posts array using taskUtils.
// - Renders a three-column stat card (Total / Pending / Completed).
// - Adapts colors for dark and light mode themes.

import React from 'react';
import { View, Text } from 'react-native';
import { taskUtils } from '../../utils/taskUtils';

export const TaskStats = ({ posts, isDark }) => {
  const stats = taskUtils.calculateStats(posts);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 16, backgroundColor: isDark ? '#1F2937' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Total</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginTop: 2 }}>{stats.total}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Pending</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B', marginTop: 2 }}>{stats.pending}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Done</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#22C55E', marginTop: 2 }}>{stats.completed}</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Reactions</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EC4899', marginTop: 2 }}>{stats.totalReactions}</Text>
      </View>
    </View>
  );
};