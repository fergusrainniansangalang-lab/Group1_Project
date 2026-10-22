import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

import { getStoredTasks, saveStoredTasks, getStoredUser } from './storage';
import AddTaskModal from './AddTaskModal';

export default function TodoListScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load tasks when the screen opens
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTasks = await getStoredTasks();
    setTasks(loadedTasks);
    const user = await getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleSaveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    await saveStoredTasks(updatedTasks);
  };

  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed }
        : t
    );

    handleSaveTasks(updated);
  };

  const deleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = tasks.filter(
              (t) => t.id !== id
            );

            handleSaveTasks(updated);
          },
        },
      ]
    );
  };

  const handleAddTask = (newTask) => {
    const updated = [newTask, ...tasks];
    handleSaveTasks(updated);
  };

  // Filter tasks based on search and category
  const filteredTasks = tasks.filter((task) => {
    const title = task.title || '';
    const description = task.description || '';

    const matchesSearch =
      title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      task.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>

      {/* User Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>TaskFlow • Facebook Edition</Text>
          <Text style={styles.headerTitle}>
            Hello, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Explorer'} 👋
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAvatar}
          onPress={() => navigation?.navigate?.('Profile')}
          activeOpacity={0.75}
        >
          <Text style={styles.headerAvatarText}>
            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search tasks..."
        placeholderTextColor="#64748B"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Work', 'Personal', 'Urgent'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterTab,
              selectedCategory === cat &&
                styles.activeFilterTab,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat &&
                  styles.activeFilterText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>

            {/* Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleTask(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed &&
                    styles.checkboxChecked,
                ]}
              >
                {item.completed && (
                  <Text style={styles.checkmark}>
                    ✓
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Task Information */}
            <View style={styles.taskTextContainer}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed &&
                    styles.completedText,
                ]}
              >
                {item.title}
              </Text>

              {item.description ? (
                <Text style={styles.taskDesc}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>
                🗑️
              </Text>
            </TouchableOpacity>

          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks found.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddTask={handleAddTask}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },

  headerSubtitle: {
    color: '#0866FF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0866FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },

  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  searchBar: {
  backgroundColor: '#1E293B',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  color: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#26364F',
  marginTop: 14,
  marginBottom: 12,
},

  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },

  activeFilterTab: {
    backgroundColor: '#2563EB',
  },

  filterText: {
    color: '#94A3B8',
    fontSize: 13,
  },

  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  checkboxContainer: {
    marginRight: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  taskTextContainer: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },

  taskDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },

  badgeText: {
    color: '#38BDF8',
    fontSize: 11,
  },

  deleteBtn: {
    padding: 6,
  },

  deleteText: {
    fontSize: 16,
  },

  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
});