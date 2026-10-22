import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Plus,
  X,
  Check,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';

import {
  saveStoredUser,
  getStoredUser,
  getRecentAccounts,
  saveRecentAccount,
  removeRecentAccount,
  getThemePreference,
  saveThemePreference,
} from './storage';

const { width } = Dimensions.get('window');

// Crisp vector Facebook circular 'f' logo
const FacebookLogo = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="20" r="20" fill="#0866FF" />
    <Path
      d="M27.2 20.8h-4.3v14.4h-5.9V20.8h-2.8v-5.1h2.8v-3.3c0-3.9 2.3-6 5.8-6 1.7 0 3.1.1 3.5.2v4.1h-2.4c-1.9 0-2.3.9-2.3 2.2v2.8h4.6l-.8 5.1z"
      fill="#FFFFFF"
    />
  </Svg>
);

// Meta Infinity Logo
const MetaLogo = ({ size = 20, color = '#65676B' }) => (
  <Svg width={size * 1.8} height={size} viewBox="0 0 36 20">
    <Path
      d="M10.2 3.6C6.1 3.6 3 6.6 3 10s3.1 6.4 7.2 6.4c3.2 0 5.6-2 7.2-4.4.6-.9 1.1-1.7 1.6-2.4-1-1.6-2.2-3.3-3.6-4.6-1.5-1.1-3.2-1.4-5.2-1.4zm15.6 0c-2 0-3.7.3-5.2 1.4-1.4 1.3-2.6 3-3.6 4.6.5.7 1 1.5 1.6 2.4 1.6 2.4 4 4.4 7.2 4.4 4.1 0 7.2-3 7.2-6.4s-3.1-6.4-7.2-6.4zm-15.6 2.4c1.4 0 2.6.4 3.6 1.3 1.2 1 2.2 2.5 3.1 3.8-.9 1.3-1.9 2.8-3.1 3.8-1 .9-2.2 1.3-3.6 1.3-2.6 0-4.6-1.8-4.6-4s2-4 4.6-4zm15.6 0c2.6 0 4.6 1.8 4.6 4s-2 4-4.6 4c-1.4 0-2.6-.4-3.6-1.3-1.2-1-2.2-2.5-3.1-3.8.9-1.3 1.9-2.8 3.1-3.8 1-.9 2.2-1.3 3.6-1.3z"
      fill={color}
    />
  </Svg>
);

export default function LoginPage({ navigation }) {
  // Theme state: 'dark' (Meta Slate) or 'light' (Classic Facebook)
  const [themeMode, setThemeMode] = useState('dark');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Recent accounts state
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Modals state
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  // Registration modal inputs
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGender, setRegGender] = useState('Personal');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password inputs
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotResult, setForgotResult] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Refs for focusing
  const passwordInputRef = useRef(null);

  // Load preferences and recent accounts on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const savedTheme = await getThemePreference();
      setThemeMode(savedTheme || 'dark');

      const accounts = await getRecentAccounts();
      setRecentAccounts(accounts);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    await saveThemePreference(nextTheme);
  };

  // Regular login submission
  const handleLogin = async (overrideIdentifier, overridePassword, userDisplayName) => {
    setErrorMessage('');
    const idToUse = overrideIdentifier !== undefined ? overrideIdentifier : identifier.trim();
    const pwToUse = overridePassword !== undefined ? overridePassword : password;

    if (!idToUse) {
      setErrorMessage('Please enter your mobile number or email address.');
      return;
    }

    if (!pwToUse && overridePassword === undefined) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate quick secure authentication handshake
      await new Promise((resolve) => setTimeout(resolve, 600));

      const derivedName =
        userDisplayName ||
        (idToUse.includes('@')
          ? idToUse.split('@')[0].replace(/[._]/g, ' ')
          : idToUse);

      const formattedName = derivedName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const userProfile = {
        name: formattedName,
        email: idToUse.includes('@') ? idToUse : `${idToUse}@phone.meta`,
        avatarColor: '#0866FF',
        lastLogin: new Date().toISOString(),
      };

      // Save user session
      await saveStoredUser(userProfile);

      // Save to recent accounts if remember me is enabled
      if (rememberMe) {
        const updatedAccounts = await saveRecentAccount(userProfile);
        setRecentAccounts(updatedAccounts);
      }

      // Navigate to main notepad & tasks
      navigation.replace('MainTabs');
    } catch (e) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Tap Login via recent account
  const handleRecentAccountLogin = async (account) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const userProfile = {
        name: account.name,
        email: account.email,
        avatarColor: account.avatarColor || '#0866FF',
        lastLogin: new Date().toISOString(),
      };

      await saveStoredUser(userProfile);
      await saveRecentAccount(userProfile);

      navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert('Login Failed', 'Could not authenticate recent account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove recent account
  const handleRemoveAccount = async (emailToRemove) => {
    const updated = await removeRecentAccount(emailToRemove);
    setRecentAccounts(updated);
  };

  // Instant Facebook Social Login Demo
  const handleFacebookSocialLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const fbUser = {
        name: 'Mark Zuckerberg',
        email: 'zuck@meta.com',
        avatarColor: '#0866FF',
        badge: 'Verified',
        lastLogin: new Date().toISOString(),
      };
      await saveStoredUser(fbUser);
      await saveRecentAccount(fbUser);
      navigation.replace('MainTabs');
    } finally {
      setIsLoading(false);
    }
  };

  // Guest explore mode
  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const guestUser = {
        name: 'Guest Explorer',
        email: 'guest@taskflow.local',
        avatarColor: '#10B981',
        lastLogin: new Date().toISOString(),
      };
      await saveStoredUser(guestUser);
      navigation.replace('MainTabs');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler
  const handleCreateAccountSubmit = async () => {
    if (!regFirstName.trim()) {
      Alert.alert('Required Field', "What's your name?");
      return;
    }
    if (!regIdentifier.trim()) {
      Alert.alert(
        'Required Field',
        "You'll use this when you log in and if you ever need to reset your password."
      );
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      Alert.alert('Invalid Password', 'Enter a combination of at least six numbers, letters and punctuation marks.');
      return;
    }

    setRegLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const fullName = `${regFirstName.trim()} ${regLastName.trim()}`.trim();
      const newUser = {
        name: fullName,
        email: regIdentifier.includes('@')
          ? regIdentifier.trim()
          : `${regIdentifier.trim()}@mobile.meta`,
        avatarColor: '#42B72A',
        category: regGender,
        lastLogin: new Date().toISOString(),
      };

      await saveStoredUser(newUser);
      await saveRecentAccount(newUser);

      setShowCreateAccountModal(false);
      Alert.alert(
        'Welcome to Facebook TaskFlow!',
        `Your account has been created, ${regFirstName}! Accessing your notepad...`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace('MainTabs'),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Unable to create account right now.');
    } finally {
      setRegLoading(false);
    }
  };

  // Forgot password search handler
  const handleForgotSearch = async () => {
    if (!forgotIdentifier.trim()) {
      Alert.alert('Missing Info', 'Please enter your email or mobile phone number.');
      return;
    }

    setForgotLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setForgotResult({
        name: forgotIdentifier.includes('@')
          ? forgotIdentifier.split('@')[0].toUpperCase()
          : 'Verified Account',
        target: forgotIdentifier,
        code: Math.floor(100000 + Math.random() * 900000),
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSimulatedReset = () => {
    Alert.alert(
      'Security Code Sent!',
      `A 6-digit confirmation code (${forgotResult.code}) has been sent to ${forgotResult.target}. Use password "facebook123" to log in.`,
      [
        {
          text: 'Fill & Log In',
          onPress: () => {
            setIdentifier(forgotResult.target);
            setPassword('facebook123');
            setShowForgotModal(false);
            setForgotResult(null);
          },
        },
      ]
    );
  };

  // Color palette based on theme mode
  const isDark = themeMode === 'dark';
  const colors = {
    bg: isDark ? '#0F172A' : '#F0F2F5',
    cardBg: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#1C1E21',
    textMuted: isDark ? '#94A3B8' : '#65676B',
    border: isDark ? '#334155' : '#CCD0D5',
    inputBg: isDark ? '#0F172A' : '#FFFFFF',
    inputBorder: isDark ? '#334155' : '#CCD0D5',
    inputBorderFocused: '#0866FF',
    fbBlue: '#0866FF',
    fbBluePressed: '#0052CC',
    fbGreen: '#42B72A',
    fbGreenPressed: '#36A420',
    divider: isDark ? '#334155' : '#DADDE1',
    recentCardBg: isDark ? '#1E293B' : '#FFFFFF',
    recentCardBorder: isDark ? '#334155' : '#E4E6EB',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar: Language & Theme Switcher */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.langChip, { borderColor: colors.border }]}
              onPress={() => setShowLanguageModal(true)}
              activeOpacity={0.7}
            >
              <Globe size={14} color={colors.textMuted} />
              <Text style={[styles.langChipText, { color: colors.textMuted }]}>
                {selectedLanguage}
              </Text>
            </TouchableOpacity>

            <View style={styles.topRightControls}>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  { backgroundColor: isDark ? '#334155' : '#E4E6EB' },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
              >
                {isDark ? (
                  <Sun size={16} color="#FBBF24" />
                ) : (
                  <Moon size={16} color="#1E293B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Facebook Header Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoRow}>
              <FacebookLogo size={42} />
              <Text style={styles.fbWordmark}>facebook</Text>
            </View>

            <View style={styles.suiteBadge}>
              <Sparkles size={13} color="#0866FF" />
              <Text style={styles.suiteBadgeText}>TaskFlow & Notepad Edition</Text>
            </View>

            <Text style={[styles.tagline, { color: colors.textMuted }]}>
              Connect your thoughts, manage daily tasks, and organize your world.
            </Text>
          </View>

          {/* Facebook's Signature Feature: Recent Logins (1-Tap Account Switcher) */}
          {recentAccounts.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeaderRow}>
                <Text style={[styles.recentTitle, { color: colors.text }]}>
                  Recent logins
                </Text>
                <Text style={[styles.recentSubtitle, { color: colors.textMuted }]}>
                  Click your picture or add an account
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentCardsContainer}
              >
                {recentAccounts.map((acc) => (
                  <View
                    key={acc.email}
                    style={[
                      styles.recentCard,
                      {
                        backgroundColor: colors.recentCardBg,
                        borderColor: colors.recentCardBorder,
                      },
                    ]}
                  >
                    {/* Remove account button */}
                    <TouchableOpacity
                      style={styles.recentRemoveBtn}
                      onPress={() => handleRemoveAccount(acc.email)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Account Tap Target */}
                    <TouchableOpacity
                      style={styles.recentCardTouch}
                      onPress={() => handleRecentAccountLogin(acc)}
                      activeOpacity={0.75}
                      disabled={isLoading}
                    >
                      <View
                        style={[
                          styles.recentAvatar,
                          { backgroundColor: acc.avatarColor || '#0866FF' },
                        ]}
                      >
                        <Text style={styles.recentAvatarText}>
                          {(acc.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                        <View style={styles.onlineBadge} />
                      </View>

                      <Text
                        style={[styles.recentName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {acc.name || 'User'}
                      </Text>

                      <View style={styles.oneTapPill}>
                        <Check size={11} color="#0866FF" />
                        <Text style={styles.oneTapPillText}>1-Tap Login</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add / Switch Account Card */}
                <TouchableOpacity
                  style={[
                    styles.recentAddCard,
                    {
                      backgroundColor: isDark ? '#1E293B88' : '#F0F2F5',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setIdentifier('');
                    setPassword('');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentAddCircle}>
                    <Plus size={22} color="#0866FF" />
                  </View>
                  <Text style={[styles.recentAddText, { color: '#0866FF' }]}>
                    Add Account
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Main Credentials Login Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: isDark ? '#000000' : '#8B949E',
              },
            ]}
          >
            <Text style={[styles.cardHeaderTitle, { color: colors.text }]}>
              Log in to TaskFlow
            </Text>

            {/* Error banner if validation fails */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Identifier (Email / Phone) Input */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Mobile number or email address"
                  placeholderTextColor={colors.textMuted}
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
                {identifier.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setIdentifier('')}
                    style={styles.clearBtn}
                  >
                    <X size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => handleLogin()}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me / Auto-Save Switch */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxActive,
                  { borderColor: rememberMe ? '#0866FF' : colors.border },
                ]}
              >
                {rememberMe && <Check size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.rememberText, { color: colors.textMuted }]}>
                Remember my login credentials on this device
              </Text>
            </TouchableOpacity>

            {/* Primary Log In Button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.fbBlue },
                isLoading && styles.btnDisabled,
              ]}
              onPress={() => handleLogin()}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Forgotten Password Link */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => {
                setForgotIdentifier(identifier);
                setShowForgotModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotBtnText}>Forgotten password?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            {/* Secondary CTA: Create New Account (Iconic Facebook Green Button) */}
            <TouchableOpacity
              style={[styles.createAccountBtn, { backgroundColor: colors.fbGreen }]}
              onPress={() => setShowCreateAccountModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.createAccountBtnText}>Create new account</Text>
            </TouchableOpacity>

            {/* Quick Demo Access Options */}
            <View style={styles.quickOptionsContainer}>
              <TouchableOpacity
                style={[styles.socialFbBtn, { borderColor: colors.border }]}
                onPress={handleFacebookSocialLogin}
                activeOpacity={0.75}
              >
                <FacebookLogo size={22} />
                <Text style={[styles.socialFbBtnText, { color: colors.text }]}>
                  Continue with Facebook Demo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestLink}
                onPress={handleGuestLogin}
                activeOpacity={0.7}
              >
                <Text style={[styles.guestLinkText, { color: colors.textMuted }]}>
                  Explore as Guest • Skip Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick link to view Onboarding Tour */}
          <TouchableOpacity
            style={styles.tourLink}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
          >
            <Sparkles size={14} color="#0866FF" />
            <Text style={styles.tourLinkText}>New user? View product tour</Text>
            <ArrowRight size={14} color="#0866FF" />
          </TouchableOpacity>

          {/* Meta Security & Privacy Assurance */}
          <View style={styles.securityBadge}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={[styles.securityText, { color: colors.textMuted }]}>
              256-Bit Encrypted Local Storage • Meta Verified Security
            </Text>
          </View>

          {/* Footer with Meta branding and links */}
          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <MetaLogo size={16} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>Meta</Text>
            </View>

            <View style={styles.footerLinksRow}>
              {['About', 'Help', 'More', 'Privacy', 'Terms', 'Cookies'].map(
                (item, index) => (
                  <Text
                    key={item}
                    style={[styles.footerLinkText, { color: colors.textMuted }]}
                  >
                    {item}
                    {index < 5 ? '  •  ' : ''}
                  </Text>
                )
              )}
            </View>

            <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
              Meta Platforms, Inc. © 2026 • TaskFlow Edition
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ============================================================== */}
      {/* MODAL 1: Create New Account (Facebook Registration Sheet) */}
      {/* ============================================================== */}
      <Modal
        visible={showCreateAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAccountModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Sign Up
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  It's quick and easy.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowCreateAccountModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.modalDivider, { backgroundColor: colors.divider }]}
            />

            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Name Row (First name & Surname) */}
              <View style={styles.nameRow}>
                <TextInput
                  style={[
                    styles.modalInputHalf,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  placeholder="First name"
                  placeholderTextColor={colors.textMuted}
                  value={regFirstName}
                  onChangeText={setRegFirstName}
                />
                <TextInput
                  style={[
                    styles.modalInputHalf,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Surname"
                  placeholderTextColor={colors.textMuted}
                  value={regLastName}
                  onChangeText={setRegLastName}
                />
              </View>

              {/* Identifier Input */}
              <TextInput
                style={[
                  styles.modalInputFull,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="Mobile number or email address"
                placeholderTextColor={colors.textMuted}
                value={regIdentifier}
                onChangeText={setRegIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password Input */}
              <TextInput
                style={[
                  styles.modalInputFull,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="New password (min. 6 characters)"
                placeholderTextColor={colors.textMuted}
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry={true}
              />

              {/* Account Category Selector */}
              <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>
                Account Purpose / Workspace
              </Text>
              <View style={styles.categoryRow}>
                {['Personal', 'Work', 'Student'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        borderColor:
                          regGender === cat ? '#0866FF' : colors.border,
                        backgroundColor:
                          regGender === cat
                            ? isDark
                              ? '#0866FF22'
                              : '#E7F3FF'
                            : colors.inputBg,
                      },
                    ]}
                    onPress={() => setRegGender(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color:
                            regGender === cat ? '#0866FF' : colors.textMuted,
                          fontWeight: regGender === cat ? '700' : '500',
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Legal Disclaimer */}
              <Text style={[styles.legalText, { color: colors.textMuted }]}>
                By clicking Sign Up, you agree to our Terms, Privacy Policy and
                Cookies Policy. You may receive SMS or notification reminders.
              </Text>

              {/* Sign Up CTA */}
              <TouchableOpacity
                style={[
                  styles.modalSignUpBtn,
                  { backgroundColor: colors.fbGreen },
                ]}
                onPress={handleCreateAccountSubmit}
                disabled={regLoading}
                activeOpacity={0.85}
              >
                {regLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSignUpBtnText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: Forgotten Password (Find Your Account) */}
      {/* ============================================================== */}
      <Modal
        visible={showForgotModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowForgotModal(false);
          setForgotResult(null);
        }}
      >
        <SafeAreaView style={styles.modalOverlayCenter}>
          <View
            style={[
              styles.centerModalCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.centerModalHeader}>
              <Text style={[styles.centerModalTitle, { color: colors.text }]}>
                Find Your Account
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowForgotModal(false);
                  setForgotResult(null);
                }}
              >
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.modalDivider, { backgroundColor: colors.divider }]}
            />

            <View style={styles.centerModalBody}>
              {!forgotResult ? (
                <>
                  <Text style={[styles.forgotDesc, { color: colors.textMuted }]}>
                    Please enter your email address or mobile number to search for
                    your account.
                  </Text>

                  <TextInput
                    style={[
                      styles.modalInputFull,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                        marginVertical: 12,
                      },
                    ]}
                    placeholder="Email address or mobile number"
                    placeholderTextColor={colors.textMuted}
                    value={forgotIdentifier}
                    onChangeText={setForgotIdentifier}
                    autoCapitalize="none"
                  />

                  <View style={styles.centerModalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.centerModalBtnCancel,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => setShowForgotModal(false)}
                    >
                      <Text
                        style={[
                          styles.centerModalBtnTextCancel,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.centerModalBtnSearch,
                        { backgroundColor: '#0866FF' },
                      ]}
                      onPress={handleForgotSearch}
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.centerModalBtnTextSearch}>
                          Search
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.resultContainer}>
                  <View style={styles.resultAvatar}>
                    <User size={30} color="#0866FF" />
                  </View>
                  <Text style={[styles.resultName, { color: colors.text }]}>
                    {forgotResult.name}
                  </Text>
                  <Text
                    style={[styles.resultTarget, { color: colors.textMuted }]}
                  >
                    Matching: {forgotResult.target}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      {
                        backgroundColor: '#0866FF',
                        width: '100%',
                        marginTop: 16,
                      },
                    ]}
                    onPress={handleSimulatedReset}
                  >
                    <Text style={styles.primaryBtnText}>
                      Send Code via Email
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: Language Selector */}
      {/* ============================================================== */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                maxHeight: 380,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Language
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View
              style={[styles.modalDivider, { backgroundColor: colors.divider }]}
            />

            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {[
                'English (US)',
                'Español',
                'Français (France)',
                'Deutsch',
                '日本語',
                'Português (Brasil)',
                'Italiano',
                '한국어',
                'Filipino',
              ].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langOptionRow,
                    {
                      backgroundColor:
                        selectedLanguage === lang
                          ? isDark
                            ? '#0866FF22'
                            : '#E7F3FF'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.langOptionText,
                      {
                        color:
                          selectedLanguage === lang
                            ? '#0866FF'
                            : colors.text,
                        fontWeight:
                          selectedLanguage === lang ? '700' : '500',
                      },
                    ]}
                  >
                    {lang}
                  </Text>
                  {selectedLanguage === lang && (
                    <Check size={18} color="#0866FF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Top Bar
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Branding Section
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  fbWordmark: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0866FF',
    letterSpacing: -1.2,
  },
  suiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0866FF15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
  },
  suiteBadgeText: {
    color: '#0866FF',
    fontSize: 12,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },

  // Recent Logins Section
  recentSection: {
    width: '100%',
    marginBottom: 20,
  },
  recentHeaderRow: {
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  recentSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  recentCardsContainer: {
    paddingVertical: 4,
    gap: 12,
  },
  recentCard: {
    width: 125,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#65676B99',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  recentCardTouch: {
    alignItems: 'center',
    width: '100%',
  },
  recentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  recentAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  oneTapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0866FF15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  oneTapPillText: {
    color: '#0866FF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Add Account Card
  recentAddCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  recentAddCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0866FF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentAddText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Main Card
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  eyeBtn: {
    padding: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0866FF',
  },
  rememberText: {
    fontSize: 12,
    flex: 1,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0866FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  forgotBtnText: {
    color: '#0866FF',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  createAccountBtn: {
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#42B72A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createAccountBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Quick options
  quickOptionsContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#33415533',
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  socialFbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  socialFbBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  guestLink: {
    paddingVertical: 4,
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Tour link
  tourLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
    paddingVertical: 8,
  },
  tourLinkText: {
    color: '#0866FF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Security assurance
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Footer
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  footerLinkText: {
    fontSize: 11,
  },
  copyrightText: {
    fontSize: 10,
  },

  // Bottom Modal Sheet (Create Account)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalDivider: {
    height: 1,
    width: '100%',
  },
  modalBody: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalInputHalf: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalInputFull: {
    width: '100%',
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  categoryChip: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
  },
  legalText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 18,
  },
  modalSignUpBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  modalSignUpBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  // Centered Modal (Forgotten Password)
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  centerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  centerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerModalBody: {
    padding: 18,
  },
  forgotDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  centerModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  centerModalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  centerModalBtnTextCancel: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerModalBtnSearch: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  centerModalBtnTextSearch: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resultAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0866FF15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultTarget: {
    fontSize: 13,
  },

  // Language Modal Row
  langOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  langOptionText: {
    fontSize: 15,
  },
});