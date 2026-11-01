// @file    FilterTabs.js
// @folder  src/components/feed/
// @about   Horizontal tab bar for filtering the post feed by status.
//
// What this file does:
// - Renders "All", "Pending", and "Completed" filter tabs.
// - Highlights the active tab with a blue underline indicator.
// - Calls the onSelect callback so the parent can filter the posts array.

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export const FilterTabs = ({ activeTab, setActiveTab, isDark }) => {
  const tabs = ['All', 'Pending', 'Completed', 'Work', 'Personal'];
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#E5E7EB', marginBottom: 16, paddingBottom: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: isActive ? '#2563EB' : isDark ? '#1F2937' : '#E5E7EB'
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isActive ? '#FFFFFF' : isDark ? '#D1D5DB' : '#374151' }}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};