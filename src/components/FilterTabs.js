import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const FilterTabs = ({ selectedFilter, onSelectFilter }) => {
  const tabs = ['All', 'Active', 'Completed'];

  return (
    <View style={styles.container}>
      {/* ARRAY + MAP: Create filter tabs dynamically */}
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            selectedFilter === tab && styles.activeTab
          ]}
          onPress={() => onSelectFilter(tab)}
        >
          <Text
            style={[
              styles.tabText,
              selectedFilter === tab && styles.activeTabText
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.primary,
  },
});

export default FilterTabs;
