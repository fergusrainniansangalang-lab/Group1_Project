import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import Onboarding from './src/components/Onboarding';
import LoginPage from './src/components/LoginPage';
import TodoListScreen from './src/components/TodoListScreen';
import ProfileScreen from './src/components/ProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');

  const navigation = {
    navigate: (screenName) => {
      setCurrentScreen(screenName);
    },

    replace: (screenName) => {
      setCurrentScreen(screenName);
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {

      case 'Onboarding':
        return <Onboarding navigation={navigation} />;

      case 'Login':
        return <LoginPage navigation={navigation} />;

      case 'TodoList':
      case 'MainTabs':
        return <TodoListScreen navigation={navigation} />;

      case 'Profile':
        return <ProfileScreen navigation={navigation} />;

      default:
        return <TodoListScreen navigation={navigation} />;
    }
  };

  const showBottomNav =
    currentScreen === 'TodoList' ||
    currentScreen === 'MainTabs' ||
    currentScreen === 'Profile';

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {showBottomNav && (
        <View style={styles.bottomNav}>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('TodoList')}
          >
            <Text
              style={[
                styles.navText,
                (currentScreen === 'TodoList' ||
                  currentScreen === 'MainTabs') &&
                  styles.activeNavText,
              ]}
            >
              Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('Profile')}
          >
            <Text
              style={[
                styles.navText,
                currentScreen === 'Profile' &&
                  styles.activeNavText,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>

        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  screenContainer: {
    flex: 1,
  },

  bottomNav: {
    height: 65,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },

  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },

  activeNavText: {
    color: '#38BDF8',
  },
});