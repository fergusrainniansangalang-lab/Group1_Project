import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function Onboarding({ navigation }) {
  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>

        <View style={styles.iconContainer}>
          <Text style={styles.logoEmoji}>📋</Text>
        </View>

        <Text style={styles.title}>
          Welcome to TaskMaster
        </Text>

        <Text style={styles.subtitle}>
          Organize your daily tasks, stay focused, and boost your productivity effortlessly.
        </Text>

      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.replace('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkHighlight}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  logoEmoji: {
    fontSize: 48,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },

  buttonContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },

  button: {
    backgroundColor: '#0866FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  loginLinkText: {
    color: '#94A3B8',
    fontSize: 14,
  },

  loginLinkHighlight: {
    color: '#0866FF',
    fontWeight: '700',
  },
});