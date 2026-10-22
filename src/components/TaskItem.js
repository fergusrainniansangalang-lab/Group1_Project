import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { theme } from '../styles/theme';
import { formatTaskDuration } from '../utils/taskUtils';

const TaskItem = ({ task, onToggle, onEdit }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, task.completed && styles.cardCompleted]} 
      onPress={() => onToggle(task.id)}
      onLongPress={() => onEdit(task)}
    >
      <View style={styles.leftContent}>
        {task.completed ? (
          <CheckCircle2 color={theme.colors.success} size={24} strokeWidth={2.5} />
        ) : (
          <Circle color={theme.colors.textMuted} size={24} strokeWidth={2} />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, task.completed && styles.titleCompleted]}>
            {task.title}
          </Text>
          {!task.completed && task.description ? (
            <Text style={styles.descriptionText}>{task.description}</Text>
          ) : null}
        </View>
      </View>
      
      {task.startDate && task.endDate ? (
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDateText}>
            {formatTaskDuration(task.startDate, task.endDate)}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardCompleted: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textCompleted,
  },
  descriptionText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dueDateContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.tagTimeBg,
    marginLeft: theme.spacing.sm,
  },
  dueDateText: {
    ...theme.typography.caption,
    color: theme.colors.tagTimeText,
  },
});

export default TaskItem;
