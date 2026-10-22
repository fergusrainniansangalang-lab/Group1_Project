import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { getStoredUser, getStoredTasks } from './storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
  });

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userData = await getStoredUser();

    if (userData) {
      setUser(userData);
    }

    const taskData = await getStoredTasks();
    setTasks(taskData);
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const remainingTasks = tasks.length - completedTasks;

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.greeting}>
        Your account
      </Text>

      <Text style={styles.title}>
        Profile
      </Text>

      {/* Profile Information */}
      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {user.name}
          </Text>

          <Text style={styles.email}>
            {user.email}
          </Text>
        </View>

      </View>

      {/* Task Summary */}
      <Text style={styles.sectionTitle}>
        Task Summary
      </Text>

      <View style={styles.statsCard}>

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {tasks.length}
          </Text>

          <Text style={styles.statLabel}>
            Total Tasks
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={[styles.statNumber, styles.completed]}>
            {completedTasks}
          </Text>

          <Text style={styles.statLabel}>
            Completed
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={[styles.statNumber, styles.remaining]}>
            {remainingTasks}
          </Text>

          <Text style={styles.statLabel}>
            Remaining
          </Text>
        </View>

      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Sign Out
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F7FF',
    paddingHorizontal: 32,
    paddingTop: 55,
  },

  greeting: {
    fontSize: 13,
    color: '#7B8794',
    marginBottom: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,

    elevation: 3,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#DCE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  userInfo: {
    flex: 1,
  },

  name: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 5,
  },

  email: {
    fontSize: 13,
    color: '#8995A7',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 12,
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
  },

  completed: {
    color: '#10B981',
  },

  remaining: {
    color: '#6366F1',
  },

  statLabel: {
    fontSize: 10,
    color: '#8995A7',
    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#E5EAF1',
  },

  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    elevation: 1,
  },

  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 'bold',
  },
});