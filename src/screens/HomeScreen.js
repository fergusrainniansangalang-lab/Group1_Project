import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Plus, CheckCircle2, Calendar, List as ListIcon, Settings, Search } from 'lucide-react-native';
import { theme } from '../styles/theme';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import FilterTabs from '../components/FilterTabs';
import { taskStorage } from '../services/taskStorage';
import { generateId } from '../utils/taskUtils';

const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // "Category" filter: All / Active / Completed
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Uncontrolled ref
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadSavedTasks();
  }, []);

  const loadSavedTasks = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const savedTasks = await taskStorage.loadTasks();
      
      if (savedTasks.length === 0) {
        const sampleTasks = [
          { id: generateId(), title: 'Review Q4 Design System', description: 'High', completed: false, createdAt: Date.now() },
          { id: generateId() + '1', title: 'Sync with engineering team', description: '14:00', completed: false, createdAt: Date.now() },
          { id: generateId() + '2', title: 'Update typography tokens', description: '', completed: false, createdAt: Date.now() },
          { id: generateId() + '3', title: 'Approve final wireframes', description: '', completed: true, createdAt: Date.now() },
        ];
        setTasks(sampleTasks);
        await taskStorage.saveTasks(sampleTasks);
      } else {
        setTasks(savedTasks);
      }
    } catch (error) {
      setErrorMsg('We couldn\'t load your saved tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const persistTasks = async (updatedTasks) => {
    try {
      await taskStorage.saveTasks(updatedTasks);
    } catch (error) {
      Alert.alert('Error', 'Failed to save tasks.');
    }
  };

  const handleSaveTask = (taskData) => {
    let updatedTasks;
    
    if (editingTask) {
      const taskIndex = tasks.findIndex(t => t.id === editingTask.id);
      if (taskIndex !== -1) {
        updatedTasks = [...tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          title: taskData.title,
          description: taskData.description,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
        };
      }
    } else {
      const newTask = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        completed: false,
        createdAt: Date.now(),
      };
      // Add to beginning of active tasks
      updatedTasks = [newTask, ...tasks];
    }

    if (updatedTasks) {
      setTasks(updatedTasks);
      persistTasks(updatedTasks);
      
      // Mock notification scheduling
      if (taskData.startDate) {
        const timeStr = new Date(taskData.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        Alert.alert('Notification Set', `A reminder has been scheduled for ${timeStr}`);
      }
    }
    
    setIsModalVisible(false);
    setEditingTask(null);
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  };

  const handleEditTask = (taskToEdit) => {
    const task = tasks.find(t => t.id === taskToEdit.id);
    if (task) {
      setEditingTask(task);
      setIsModalVisible(true);
    }
  };

  const openSearch = () => {
    setShowSearch(!showSearch);
    setSearchQuery('');
    // Use ref to focus if we just opened it
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    if (selectedFilter === 'Active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (selectedFilter === 'Completed') {
      filtered = filtered.filter(task => task.completed);
    }

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Simple search recommendations, styled like our filter categories:
  // suggest a few existing task titles the user can tap to search by.
  const getSearchSuggestions = () => {
    const uniqueTitles = [...new Set(tasks.map(task => task.title))];
    return uniqueTitles.slice(0, 5);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Today</Text>
          <Text style={styles.dateText}>Mon, Oct 24</Text>
        </View>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/100?img=33' }} 
          style={styles.avatar} 
        />
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Search size={18} color={theme.colors.textMuted} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              searchInputRef.current?.clear();
            }}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showSearch && searchQuery.length === 0 && getSearchSuggestions().length > 0 && (
        <View style={styles.suggestionsContainer}>
          {getSearchSuggestions().map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => setSearchQuery(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.filterTabsContainer}>
        <FilterTabs selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <TaskList 
            tasks={getFilteredTasks()}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
          />
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.bottomSection}
        pointerEvents="box-none"
      >
        <View style={styles.navBarContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
              <CheckCircle2 color={theme.colors.primary} size={28} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Calendar color={theme.colors.textMuted} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={openSearch}>
              <ListIcon color={theme.colors.textMuted} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Settings color={theme.colors.textMuted} size={24} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.fabInline}
            onPress={() => {
              setEditingTask(null);
              setIsModalVisible(true);
            }}
          >
            <Plus color={theme.colors.surface} size={28} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AddTaskModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        onDelete={handleDeleteTask}
        initialTitle=""
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxl, // Added top padding to push app down
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 40,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  clearText: {
    color: theme.colors.textMuted,
    padding: 4,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  suggestionChip: {
    backgroundColor: theme.colors.tagTimeBg,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  suggestionText: {
    ...theme.typography.caption,
    color: theme.colors.tagTimeText,
  },
  filterTabsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.body,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xxl : 40,
    paddingTop: theme.spacing.sm,
  },
  navBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  fabInline: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
  },
  navItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
});

export default HomeScreen;
