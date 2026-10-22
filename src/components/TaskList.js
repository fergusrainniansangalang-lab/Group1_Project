import React, { useMemo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import TaskItem from './TaskItem';
import { theme } from './styles/theme';

const TaskList = ({ tasks, onToggle, onEdit }) => {
  // We use useMemo to optimize and format data for the FlatList
  const processedData = useMemo(() => {
    const active = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    
    const data = [...active];
    
    if (completed.length > 0) {
      data.push({ id: 'completed-header-section', isHeader: true, title: 'Completed' });
      data.push(...completed);
    }
    
    return data;
  }, [tasks]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No tasks yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first task and start getting things done.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={processedData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        if (item.isHeader) {
          return <Text style={styles.sectionHeader}>{item.title}</Text>;
        }
        return (
          <TaskItem
            task={item}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        );
      }}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 150, // Space for bottom navigation and floating input
  },
  sectionHeader: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'none',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

export default TaskList;
