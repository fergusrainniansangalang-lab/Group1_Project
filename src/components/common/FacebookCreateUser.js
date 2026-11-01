// @file    FacebookCreateUser.js
// @folder  src/components/common/
// @about   Multi-step account registration modal for new users.
//
// What this file does:
// - Guides the user through a Facebook-style sign-up: name, email/password, birthday, gender.
// - Validates all fields and calls Firebase Auth (signUpUser) to create the account.
// - Saves the new user's profile to Firestore via firestoreService.
// - Supports profile avatar selection from the gallery or preset avatar options.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePickerHelper';
import { validateEmail, signUpUser } from '../../services/authService';
import { saveUserProfile } from '../../services/firestoreService';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => String(currentYear - 13 - i));

const DEFAULT_AVATARS = [
  { label: 'Blue', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
  { label: 'Amber', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { label: 'Green', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { label: 'Purple', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
];

export const FacebookCreateUser = ({
  isOpen,
  onClose,
  onSignUp,
  isDark = true,
}) => {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [birthMonth, setBirthMonth] = useState('Jun');
  const [birthDay, setBirthDay] = useState('15');
  const [birthYear, setBirthYear] = useState('2000');

  const [gender, setGender] = useState('Female');
  const [pronoun, setPronoun] = useState('She');
  const [customGender, setCustomGender] = useState('');

  const [avatarUri, setAvatarUri] = useState(DEFAULT_AVATARS[0].url);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [error, setError] = useState('');
  const [infoModal, setInfoModal] = useState(null); // 'birthday' | 'gender' | null
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Palette
  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const screenBg = isDark ? '#18191A' : '#F0F2F5';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CCD0D5';
  const inputBg = isDark ? '#18191A' : '#FFFFFF';
  const pillBg = isDark ? '#3A3B3C' : '#F0F2F5';

  const handlePickAvatarGallery = async () => {
    setIsPickingPhoto(true);
    try {
      const asset = await pickImageFromGallery();
      if (asset?.uri) {
        setAvatarUri(asset.uri);
        setAvatarFileName(asset.fileName || 'Selected from gallery');
      }
    } catch (err) {
      console.warn('Avatar pick error:', err);
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleTakeAvatarCamera = async () => {
    setIsPickingPhoto(true);
    try {
      const asset = await takePhotoWithCamera();
      if (asset?.uri) {
        setAvatarUri(asset.uri);
        setAvatarFileName('Photo captured from camera');
      }
    } catch (err) {
      console.warn('Avatar camera error:', err);
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleValidateAndSubmit = async () => {
    setError('');

    const cleanFirst = firstName.trim();
    const cleanLast = surname.trim();
    const cleanContact = emailOrPhone.trim();
    const cleanPass = password.trim();

    if (!cleanFirst) {
      setError('What is your first name?');
      return;
    }
    if (!cleanLast) {
      setError('What is your surname?');
      return;
    }
    if (!cleanContact) {
      setError('Please enter your email address (@gmail.com or @letran.edu.ph).');
      return;
    }

    // Validate email domain
    const emailCheck = validateEmail(cleanContact);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      return;
    }

    if (cleanPass.length < 6) {
      setError('Enter a combination of at least 6 numbers, letters, and punctuation marks.');
      return;
    }

    const age = currentYear - parseInt(birthYear, 10);
    if (age < 13) {
      setError('You must be at least 13 years old to create a Facebook account.');
      return;
    }

    const fullName = `${cleanFirst} ${cleanLast}`;

    setIsSubmitting(true);
    try {
      // Create Firebase Auth account
      const firebaseUser = await signUpUser(
        cleanContact,
        cleanPass,
        fullName,
        avatarUri
      );

      // Save user profile to Firestore
      await saveUserProfile(firebaseUser.uid, {
        email: cleanContact,
        name: fullName,
        avatar: avatarUri,
        bio: '',
        coverPhoto: '',
        details: {
          birthday: `${birthMonth} ${birthDay}, ${birthYear}`,
          gender,
          joined: 'Just now',
        },
      });

      const newUser = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: fullName,
        firstName: cleanFirst,
        surname: cleanLast,
        email: cleanContact,
        birthday: `${birthMonth} ${birthDay}, ${birthYear}`,
        birthMonth,
        birthDay,
        birthYear,
        gender,
        pronoun: gender === 'Custom' ? pronoun : gender === 'Female' ? 'She' : 'He',
        customGender: gender === 'Custom' ? customGender : '',
        avatar: avatarUri,
        avatarFileName,
        initial: cleanFirst.charAt(0).toUpperCase(),
        joinedDate: 'Just now',
      };

      onSignUp(newUser);
    } catch (err) {
      const msg = err.message || 'Sign up failed. Please try again.';
      if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Please log in instead.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 12,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 480,
            maxHeight: '94%',
            borderRadius: 16,
            backgroundColor: cardBg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
            overflow: 'hidden',
          }}
        >
          {/* Modal Header: Exact Facebook Sign Up Style */}
          <View
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: textColor,
                  letterSpacing: -0.5,
                }}
              >
                Sign Up
              </Text>
              <Text style={{ fontSize: 13, color: subTextColor, marginTop: 2 }}>
                It's quick and easy.
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: subTextColor }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 16 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {/* Error Banner */}
            {error ? (
              <View
                style={{
                  padding: 10,
                  backgroundColor: '#FDE8E8',
                  borderColor: '#F87171',
                  borderWidth: 1,
                  borderRadius: 8,
                  marginBottom: 14,
                }}
              >
                <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '600' }}>
                  ⚠️ {error}
                </Text>
              </View>
            ) : null}

            {/* Profile Avatar Picker */}
            <View
              style={{
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: avatarUri }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    borderWidth: 2,
                    borderColor: '#1877F2',
                  }}
                />
                <TouchableOpacity
                  onPress={handlePickAvatarGallery}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#1877F2',
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: cardBg,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>📷</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '700', color: textColor, marginTop: 6 }}>
                Profile Picture
              </Text>
              <Text style={{ fontSize: 11, color: subTextColor, marginTop: 1 }}>
                {avatarFileName || 'Default Facebook avatar'}
              </Text>

              {/* Action Buttons for Avatar */}
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handlePickAvatarGallery}
                  disabled={isPickingPhoto}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    backgroundColor: pillBg,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: textColor }}>
                    🖼️ Choose Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTakeAvatarCamera}
                  disabled={isPickingPhoto}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    backgroundColor: pillBg,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: textColor }}>
                    📸 Take Selfie
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Names Row (First name & Surname side by side) */}
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  placeholder="First name"
                  placeholderTextColor={subTextColor}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Surname"
                  placeholderTextColor={subTextColor}
                  value={surname}
                  onChangeText={setSurname}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 12 }}>
              <TextInput
                placeholder="Email address (@gmail.com or @letran.edu.ph)"
                placeholderTextColor={subTextColor}
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: border,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: 13,
                }}
              />
              <Text style={{ fontSize: 10, color: subTextColor, marginTop: 3, marginLeft: 4 }}>
                Only @gmail.com and @letran.edu.ph emails are accepted
              </Text>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 14, position: 'relative' }}>
              <TextInput
                secureTextEntry={!showPassword}
                placeholder="New password"
                placeholderTextColor={subTextColor}
                value={password}
                onChangeText={setPassword}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  paddingRight: 50,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: border,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: 13,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  padding: 2,
                }}
              >
                <Text style={{ fontSize: 12, color: '#1877F2', fontWeight: '600' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Birthday Section */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: subTextColor, fontWeight: '600' }}>
                  Date of birth
                </Text>
                <TouchableOpacity
                  onPress={() => setInfoModal('birthday')}
                  style={{ marginLeft: 6 }}
                >
                  <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: 'bold' }}>
                    ❓
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month / Day / Year Quick Selectors */}
              <View style={{ flexDirection: 'row' }}>
                {/* Month */}
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={{ fontSize: 10, color: subTextColor, marginBottom: 2 }}>Month</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{
                      borderWidth: 1,
                      borderColor: border,
                      borderRadius: 6,
                      backgroundColor: inputBg,
                      padding: 4,
                    }}
                  >
                    {MONTHS.map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setBirthMonth(m)}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 5,
                          borderRadius: 4,
                          backgroundColor: birthMonth === m ? '#1877F2' : 'transparent',
                          marginRight: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: birthMonth === m ? '#FFFFFF' : textColor,
                          }}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Day */}
                <View style={{ width: 85, marginRight: 6 }}>
                  <Text style={{ fontSize: 10, color: subTextColor, marginBottom: 2 }}>Day</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{
                      borderWidth: 1,
                      borderColor: border,
                      borderRadius: 6,
                      backgroundColor: inputBg,
                      padding: 4,
                    }}
                  >
                    {DAYS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setBirthDay(d)}
                        style={{
                          paddingHorizontal: 7,
                          paddingVertical: 5,
                          borderRadius: 4,
                          backgroundColor: birthDay === d ? '#1877F2' : 'transparent',
                          marginRight: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: birthDay === d ? '#FFFFFF' : textColor,
                          }}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year */}
                <View style={{ width: 95 }}>
                  <Text style={{ fontSize: 10, color: subTextColor, marginBottom: 2 }}>Year</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{
                      borderWidth: 1,
                      borderColor: border,
                      borderRadius: 6,
                      backgroundColor: inputBg,
                      padding: 4,
                    }}
                  >
                    {YEARS.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => setBirthYear(y)}
                        style={{
                          paddingHorizontal: 7,
                          paddingVertical: 5,
                          borderRadius: 4,
                          backgroundColor: birthYear === y ? '#1877F2' : 'transparent',
                          marginRight: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: birthYear === y ? '#FFFFFF' : textColor,
                          }}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Text style={{ fontSize: 11, color: '#1877F2', marginTop: 4, fontWeight: '500' }}>
                Selected: {birthMonth} {birthDay}, {birthYear} ({currentYear - parseInt(birthYear, 10)} years old)
              </Text>
            </View>

            {/* Gender Section */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: subTextColor, fontWeight: '600' }}>
                  Gender
                </Text>
                <TouchableOpacity
                  onPress={() => setInfoModal('gender')}
                  style={{ marginLeft: 6 }}
                >
                  <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: 'bold' }}>
                    ❓
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Three Radio Cards (Female, Male, Custom) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {['Female', 'Male', 'Custom'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: gender === g ? '#1877F2' : border,
                      backgroundColor: inputBg,
                      marginHorizontal: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>
                      {g}
                    </Text>
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        borderWidth: 1.5,
                        borderColor: gender === g ? '#1877F2' : subTextColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {gender === g ? (
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 3.5,
                            backgroundColor: '#1877F2',
                          }}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Pronoun options if Custom */}
              {gender === 'Custom' ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 11, color: subTextColor, marginBottom: 4 }}>
                    Select your pronoun
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    {['She', 'He', 'They'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPronoun(p)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: pronoun === p ? '#1877F2' : pillBg,
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: pronoun === p ? '#FFFFFF' : textColor,
                          }}
                        >
                          {p}: "Wish {p === 'She' ? 'her' : p === 'He' ? 'him' : 'them'} a happy birthday!"
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {/* Facebook Terms and Policy Disclaimer */}
            <View style={{ marginVertical: 12 }}>
              <Text style={{ fontSize: 10.5, color: subTextColor, lineHeight: 15 }}>
                People who use our service may have uploaded your contact information to Facebook.{' '}
                <Text style={{ color: '#1877F2' }}>Learn more.</Text>
              </Text>
              <Text style={{ fontSize: 10.5, color: subTextColor, lineHeight: 15, marginTop: 6 }}>
                By clicking <Text style={{ fontWeight: 'bold' }}>Sign Up</Text>, you agree to our{' '}
                <Text style={{ color: '#1877F2' }}>Terms</Text>,{' '}
                <Text style={{ color: '#1877F2' }}>Privacy Policy</Text> and{' '}
                <Text style={{ color: '#1877F2' }}>Cookies Policy</Text>. You may receive SMS Notifications from us and can opt out any time.
              </Text>
            </View>

            {/* Authentic Facebook Sign Up Green Button */}
            <TouchableOpacity
              onPress={handleValidateAndSubmit}
              disabled={isSubmitting}
              style={{
                width: '75%',
                alignSelf: 'center',
                paddingVertical: 12,
                backgroundColor: isSubmitting ? '#007800' : '#00A400',
                borderRadius: 6,
                alignItems: 'center',
                marginTop: 6,
                marginBottom: 12,
                shadowColor: '#00A400',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>
                    Creating Account...
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={onClose}
              style={{ alignSelf: 'center', paddingVertical: 8, marginBottom: 10 }}
            >
              <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: '600' }}>
                Already have an account?
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Info Tooltip Dialog */}
        <Modal
          visible={Boolean(infoModal)}
          transparent
          animationType="fade"
          onRequestClose={() => setInfoModal(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setInfoModal(null)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                padding: 20,
                width: '100%',
                maxWidth: 360,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
                {infoModal === 'birthday' ? 'Birthday' : 'Gender'}
              </Text>
              <Text style={{ fontSize: 12, color: subTextColor, lineHeight: 18, marginBottom: 16 }}>
                {infoModal === 'birthday'
                  ? 'Providing your birthday helps make sure that you get the right Facebook experience for your age. If you want to change who sees this, go to the About section of your profile.'
                  : 'You can change who sees your gender on your profile later. Select Custom to choose another gender, or if you would rather not say.'}
              </Text>
              <TouchableOpacity
                onPress={() => setInfoModal(null)}
                style={{
                  alignSelf: 'flex-end',
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  backgroundColor: '#1877F2',
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};
