// @file    LoginPage.js
// @folder  src/screens/
// @about   Authentication screen handling sign-in and recent account switching.
//
// What this file does:
// - Renders an email/password login form with show/hide password toggle.
// - Loads recently signed-in accounts from AsyncStorage for quick re-login.
// - Validates credentials via Firebase Auth and stores the session on success.
// - Opens the FacebookCreateUser registration flow in a slide-up modal.
// - Persists a "Remember Me" preference so returning users stay signed in.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FacebookCreateUser } from '../components/common/FacebookCreateUser';
import { getRecentAccounts, saveRecentAccount, removeRecentAccount } from '../services/storage';
import { validateEmail, signInUser } from '../services/authService';

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [recentAccounts, setRecentAccounts] = useState([]);

  // Load only previously signed-in accounts from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await getRecentAccounts();
        if (stored && Array.isArray(stored) && stored.length > 0) {
          setRecentAccounts(stored);
        }
      } catch (err) {
        console.warn('Error loading recent accounts:', err);
      }
    })();
  }, []);

  const handleLoginSubmit = async () => {
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both your email and password.');
      return;
    }

    // Validate email domain (@gmail.com or @letran.edu.ph)
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setLoginError(emailCheck.message);
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = await signInUser(email.trim(), password);

      const loggedUser = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.name,
        avatar: firebaseUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        initial: (firebaseUser.name || firebaseUser.email).charAt(0).toUpperCase(),
      };

      if (rememberMe) {
        saveRecentAccount(loggedUser);
      }
      onLogin(loggedUser);
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.';
      if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
        setLoginError('No account found with this email. Please sign up first.');
      } else if (msg.includes('auth/wrong-password')) {
        setLoginError('Incorrect password. Please try again.');
      } else if (msg.includes('auth/too-many-requests')) {
        setLoginError('Too many failed attempts. Please try again later.');
      } else {
        setLoginError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (account) => {
    // Quick login pre-fills the email — user still needs to enter password
    setEmail(account.email || '');
    setLoginError('Please enter your password to sign in.');
  };

  const handleRemoveAccount = async (id, accountEmail) => {
    setRecentAccounts((prev) => prev.filter((acc) => acc.id !== id));
    if (accountEmail) {
      await removeRecentAccount(accountEmail);
    }
  };

  const handleCreatedUser = async (newUser) => {
    setIsSignUpOpen(false);

    // Save newly created user to recent accounts
    const formattedAccount = {
      id: newUser.id,
      name: newUser.name,
      initial: newUser.initial || newUser.name.charAt(0).toUpperCase(),
      email: newUser.email,
      avatar: newUser.avatar,
      bg: '#00A400',
      badge: 'New',
      lastActive: 'Just registered',
    };

    setRecentAccounts((prev) => [formattedAccount, ...prev.filter((a) => a.email !== newUser.email)]);
    await saveRecentAccount(formattedAccount);

    // Log user in
    onLogin(newUser);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#18191A' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: 16, paddingBottom: 50 }}
        style={{ backgroundColor: '#18191A', flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Header section with Facebook branding */}
      <View style={{ alignItems: 'center', paddingTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: '#1877F2',
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              shadowColor: '#1877F2',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 28, marginTop: -2 }}>
              f
            </Text>
          </View>
          <Text
            style={{
              fontSize: 34,
              fontWeight: '900',
              color: '#1877F2',
              letterSpacing: -1.2,
            }}
          >
            facebook
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            backgroundColor: '#242526',
            borderWidth: 1,
            borderColor: '#3E4042',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>
            ✨ Social Feed & Task Management
          </Text>
        </View>

        <Text
          style={{
            fontSize: 12.5,
            color: '#9CA3AF',
            textAlign: 'center',
            paddingHorizontal: 16,
            lineHeight: 18,
          }}
        >
          Connect with friends, share actual photos, and manage daily tasks in one place.
        </Text>
      </View>

      {/* Main Login Form Section */}
      <View style={{ width: '100%', maxWidth: 380, alignSelf: 'center', marginVertical: 20 }}>
        {/* Recent logins carousel */}
        {recentAccounts.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#E5E7EB' }}>
                  Recent logins
                </Text>
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                  Click your picture or add an account
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsSignUpOpen(true)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: 'rgba(66, 183, 42, 0.15)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#42B72A',
                }}
              >
                <Text style={{ color: '#42B72A', fontSize: 11, fontWeight: '700' }}>
                  + Add User
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {recentAccounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => handleQuickLogin(acc)}
                  activeOpacity={0.85}
                  style={{
                    width: 112,
                    height: 146,
                    backgroundColor: '#242526',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#3E4042',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    marginRight: 10,
                    position: 'relative',
                  }}
                >
                  {/* Remove Account (X) */}
                  <TouchableOpacity
                    onPress={() => handleRemoveAccount(acc.id, acc.email)}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    <Text style={{ color: '#D1D5DB', fontSize: 10, fontWeight: 'bold' }}>
                      ✕
                    </Text>
                  </TouchableOpacity>

                  {/* Avatar or Initial */}
                  <View style={{ marginTop: 10, alignItems: 'center' }}>
                    {acc.avatar ? (
                      <Image
                        source={{ uri: acc.avatar }}
                        style={{ width: 54, height: 54, borderRadius: 27 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 54,
                          height: 54,
                          backgroundColor: acc.bg || '#1877F2',
                          borderRadius: 27,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 20 }}>
                          {acc.initial}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ alignItems: 'center', width: '100%' }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#E5E7EB',
                        textAlign: 'center',
                      }}
                    >
                      {acc.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#60A5FA', marginTop: 2, fontWeight: '600' }}>
                      ✓ 1-Tap Log In
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Add New Account Card in Carousel */}
              <TouchableOpacity
                onPress={() => setIsSignUpOpen(true)}
                activeOpacity={0.85}
                style={{
                  width: 112,
                  height: 146,
                  backgroundColor: '#242526',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#3E4042',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 10,
                  marginRight: 10,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(24, 119, 242, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: '#1877F2', fontSize: 22, fontWeight: 'bold' }}>+</Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#1877F2',
                    textAlign: 'center',
                  }}
                >
                  Create User
                </Text>
                <Text style={{ fontSize: 9.5, color: '#9CA3AF', marginTop: 2 }}>
                  Sign up new
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Facebook Login Card */}
        <View
          style={{
            backgroundColor: '#242526',
            borderWidth: 1,
            borderColor: '#3E4042',
            padding: 20,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontWeight: '800',
              fontSize: 17,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Log in to Facebook
          </Text>

          {loginError ? (
            <View
              style={{
                padding: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: '#EF4444',
                borderWidth: 1,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#F87171', fontSize: 11.5, textAlign: 'center', fontWeight: '600' }}>
                ⚠️ {loginError}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={{ marginBottom: 14 }}>
            <TextInput
              placeholder="Email address (@gmail.com or @letran.edu.ph)"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={{
                width: '100%',
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: '#18191A',
                borderWidth: 1,
                borderColor: '#3E4042',
                borderRadius: 10,
                fontSize: 13,
                color: '#FFFFFF',
              }}
            />
            <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 4, marginLeft: 4 }}>
              Only @gmail.com and @letran.edu.ph emails are accepted
            </Text>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 14, position: 'relative' }}>
            <TextInput
              secureTextEntry={!showPassword}
              placeholder="Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              style={{
                width: '100%',
                paddingVertical: 12,
                paddingHorizontal: 14,
                paddingRight: 55,
                backgroundColor: '#18191A',
                borderWidth: 1,
                borderColor: '#3E4042',
                borderRadius: 10,
                fontSize: 13,
                color: '#FFFFFF',
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: 12 }}
            >
              <Text style={{ fontSize: 12, color: '#1877F2', fontWeight: '600' }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remember Me Switch */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#374151', true: '#1877F2' }}
              />
              <Text style={{ fontSize: 12, color: '#D1D5DB', marginLeft: 8 }}>
                Remember credentials
              </Text>
            </View>
          </View>

          {/* Log In Button */}
          <TouchableOpacity
            onPress={handleLoginSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              width: '100%',
              paddingVertical: 13,
              backgroundColor: isLoading ? '#1060C0' : '#1877F2',
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
                  Signing in...
                </Text>
              </>
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
                Log In
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgotten password */}
          <TouchableOpacity
            onPress={() => setLoginError('Please use one of the quick accounts above or create a new user.')}
            style={{ alignItems: 'center', marginVertical: 6 }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1877F2' }}>
              Forgotten password?
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#3E4042' }} />
            <Text
              style={{
                paddingHorizontal: 12,
                fontSize: 11,
                color: '#6B7280',
                textTransform: 'uppercase',
                fontWeight: '700',
              }}
            >
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#3E4042' }} />
          </View>

          {/* Authentic Facebook Create New Account Button */}
          <TouchableOpacity
            onPress={() => setIsSignUpOpen(true)}
            activeOpacity={0.85}
            style={{
              width: '85%',
              alignSelf: 'center',
              paddingVertical: 12,
              backgroundColor: '#00A400',
              borderRadius: 8,
              alignItems: 'center',
              shadowColor: '#00A400',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
              Create new account
            </Text>
          </TouchableOpacity>
        </View>


      </View>

      {/* Footer Branding */}
      <View style={{ paddingBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: '#6B7280' }}>
          Meta © 2026 • Facebook Original Flow
        </Text>
      </View>
      </ScrollView>

      {/* The Authentic Original Facebook Create User Modal */}
      <FacebookCreateUser
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUp={handleCreatedUser}
        isDark={true}
      />
    </KeyboardAvoidingView>
  );
};