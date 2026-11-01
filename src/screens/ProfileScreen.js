// @file    ProfileScreen.js
// @folder  src/screens/
// @about   User profile page showing cover photo, avatar, bio, details, and personal post timeline.
//
// What this file does:
// - Displays user identity: cover photo, profile avatar, display name, and bio.
// - Provides an edit profile modal: pick/capture avatars and cover photos or choose presets.
// - Shows a public details section: work, education, city, hometown, relationship, joined date.
// - Renders a filtered post timeline showing only posts authored by the current user.
// - Includes a settings modal with dark mode toggle, cache clear, and sign-out options.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TaskItem } from '../components/feed/TaskItem';
import { pickImageFromGallery, takePhotoWithCamera } from '../utils/imagePickerHelper';

const PREVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
];

const PRESET_AVATARS = [
  { label: 'Alex', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { label: 'David', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { label: 'Sarah', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  { label: 'Maya', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200' },
  { label: 'Minimal', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
  { label: 'Creator', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200' },
];

const PRESET_COVERS = [
  { label: 'Mountain', url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200' },
  { label: 'Workspace', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200' },
  { label: 'Neon Cyber', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200' },
  { label: 'Sunset Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200' },
];

export const ProfileScreen = ({
  user,
  posts,
  onToggleComplete,
  onDelete,
  onEdit,
  onReact,
  onAddComment,
  onShare,
  onOpenAddModal,
  isDark = true,
  onLogout,
  onUpdateUser,
}) => {
  const currentUserName = user?.name || 'Alex Morgan';
  const userAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';
  const userCover =
    user?.coverPhoto ||
    'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200';

  const userDetails = {
    work: user?.details?.work || 'Works at Meta / TaskFlow Systems',
    education: user?.details?.education || 'Studied Computer Science at Stanford University',
    city: user?.details?.city || 'Lives in San Francisco, California',
    hometown: user?.details?.hometown || 'From Seattle, Washington',
    relationship: user?.details?.relationship || 'Single',
    joined: user?.details?.joined || 'Joined October 2026',
    followers: user?.details?.followers || 'Followed by 1,280 people',
  };

  const [bio, setBio] = useState(
    user?.bio || 'Software Developer & Task Master 💻 | Turning ideas into code ✨'
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);

  // Modals
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showViewAvatar, setShowViewAvatar] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);

  // Edit profile form state
  const [editNameInput, setEditNameInput] = useState(currentUserName);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Public details edit state
  const [editWork, setEditWork] = useState(userDetails.work);
  const [editEducation, setEditEducation] = useState(userDetails.education);
  const [editCity, setEditCity] = useState(userDetails.city);
  const [editHometown, setEditHometown] = useState(userDetails.hometown);
  const [editRelationship, setEditRelationship] = useState(userDetails.relationship);

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const buttonBg = isDark ? '#3A3B3C' : '#E4E6EB';
  const inputBg = isDark ? '#3A3B3C' : '#F0F2F5';

  const userPosts = posts.filter(
    (p) =>
      p.author === currentUserName ||
      p.author === 'You' ||
      p.author === 'Alex Morgan' ||
      !p.author
  );

  const handleSaveBio = () => {
    setBio(bioInput);
    setIsEditingBio(false);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        bio: bioInput,
      });
    }
  };

  const handleUpdateAvatar = (newUri) => {
    setShowAvatarMenu(false);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        avatar: newUri,
      });
    }
  };

  const handlePickAvatarGallery = async () => {
    setIsLoadingPhoto(true);
    try {
      const asset = await pickImageFromGallery();
      if (asset?.uri) {
        handleUpdateAvatar(asset.uri);
      }
    } catch (e) {
      console.warn('Pick avatar error:', e);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleTakeAvatarCamera = async () => {
    setIsLoadingPhoto(true);
    try {
      const asset = await takePhotoWithCamera();
      if (asset?.uri) {
        handleUpdateAvatar(asset.uri);
      }
    } catch (e) {
      console.warn('Camera avatar error:', e);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleUpdateCover = (newUri) => {
    setShowCoverMenu(false);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        coverPhoto: newUri,
      });
    }
  };

  const handlePickCoverGallery = async () => {
    setIsLoadingPhoto(true);
    try {
      const asset = await pickImageFromGallery();
      if (asset?.uri) {
        handleUpdateCover(asset.uri);
      }
    } catch (e) {
      console.warn('Pick cover error:', e);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleTakeCoverCamera = async () => {
    setIsLoadingPhoto(true);
    try {
      const asset = await takePhotoWithCamera();
      if (asset?.uri) {
        handleUpdateCover(asset.uri);
      }
    } catch (e) {
      console.warn('Camera cover error:', e);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleSaveFullProfile = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name: editNameInput.trim() || currentUserName,
        bio: bioInput.trim() || bio,
      });
    }
    setBio(bioInput);
    setShowEditProfileModal(false);
  };

  const handleOpenEditDetails = () => {
    setEditWork(userDetails.work);
    setEditEducation(userDetails.education);
    setEditCity(userDetails.city);
    setEditHometown(userDetails.hometown);
    setEditRelationship(userDetails.relationship);
    setShowEditDetailsModal(true);
  };

  const handleSavePublicDetails = () => {
    const updatedDetails = {
      ...userDetails,
      work: editWork.trim() || userDetails.work,
      education: editEducation.trim() || userDetails.education,
      city: editCity.trim() || userDetails.city,
      hometown: editHometown.trim() || userDetails.hometown,
      relationship: editRelationship.trim() || userDetails.relationship,
    };

    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        details: updatedDetails,
      });
    }

    setShowEditDetailsModal(false);
  };

  return (
    <View style={{ paddingBottom: 40 }}>
      {/* Cover Photo & Avatar Header */}
      <View style={{ backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: border, paddingBottom: 16 }}>
        {/* Cover Photo */}
        <View style={{ height: 180, width: '100%', position: 'relative' }}>
          <Image
            source={{ uri: userCover }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />

          {/* Edit Cover Photo Badge */}
          <TouchableOpacity
            onPress={() => setShowCoverMenu(true)}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ fontSize: 13, marginRight: 4 }}>📷</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
              Edit Cover
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar (Overlapping) with Camera Trigger */}
        <View style={{ paddingHorizontal: 16, marginTop: -45, marginBottom: 8 }}>
          <View style={{ position: 'relative', width: 96, height: 96 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowAvatarMenu(true)}
              style={{ width: 96, height: 96, borderRadius: 48 }}
            >
              <Image
                source={{ uri: userAvatar }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 4,
                  borderColor: cardBg,
                  resizeMode: 'cover',
                }}
              />
            </TouchableOpacity>

            {/* Camera badge overlay */}
            <TouchableOpacity
              onPress={() => setShowAvatarMenu(true)}
              activeOpacity={0.85}
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: cardBg,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 15 }}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Details */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: textColor }}>
            {currentUserName}
          </Text>
          <Text style={{ fontSize: 13, color: subTextColor, marginTop: 2 }}>
            ({userDetails.relationship}) · Software Developer & Creator
          </Text>

          {/* Bio Section */}
          <View style={{ marginTop: 8 }}>
            {isEditingBio ? (
              <View style={{ marginTop: 4 }}>
                <TextInput
                  value={bioInput}
                  onChangeText={setBioInput}
                  multiline
                  style={{
                    backgroundColor: inputBg,
                    color: textColor,
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    fontSize: 13,
                  }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setIsEditingBio(false)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: buttonBg,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: textColor, fontSize: 12, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveBio}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: '#1877F2',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingBio(true)}>
                <Text style={{ fontSize: 13, color: textColor, lineHeight: 18 }}>
                  {bio}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons: Add to Story & Edit Profile & Logout */}
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <TouchableOpacity
              onPress={onOpenAddModal}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 9,
                backgroundColor: '#1877F2',
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginRight: 4 }}>+</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                Add to Story
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEditNameInput(currentUserName);
                setBioInput(bio);
                setShowEditProfileModal(true);
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 9,
                backgroundColor: buttonBg,
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 13, marginRight: 4 }}>✏️</Text>
              <Text style={{ color: textColor, fontSize: 13, fontWeight: '700' }}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLogout}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 9,
                backgroundColor: buttonBg,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Public Details Card */}
      <View
        style={{
          marginTop: 10,
          padding: 16,
          backgroundColor: cardBg,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: textColor, marginBottom: 12 }}>
          Details
        </Text>

        {[
          { icon: '💼', text: userDetails.work },
          { icon: '🎓', text: userDetails.education },
          { icon: '🏠', text: userDetails.city },
          { icon: '📍', text: userDetails.hometown },
          { icon: '❤️', text: userDetails.relationship },
          { icon: '🕒', text: userDetails.joined },
          { icon: '👥', text: userDetails.followers },
        ].map((item, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, width: 28 }}>{item.icon}</Text>
            <Text style={{ fontSize: 13, color: textColor, flex: 1 }}>{item.text}</Text>
          </View>
        ))}

        {/* Change / Edit Public Details Button */}
        <TouchableOpacity
          onPress={handleOpenEditDetails}
          style={{
            marginTop: 6,
            paddingVertical: 9,
            backgroundColor: isDark ? 'rgba(24, 119, 242, 0.15)' : '#E7F3FF',
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? '#1877F2' : '#C7E0FF',
          }}
        >
          <Text style={{ color: '#1877F2', fontWeight: '700', fontSize: 13 }}>
            Edit public details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Photos Preview Card */}
      <View
        style={{
          marginTop: 10,
          padding: 16,
          backgroundColor: cardBg,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>
              Photos
            </Text>
            <Text style={{ fontSize: 11, color: subTextColor }}>{PREVIEW_PHOTOS.length} uploaded</Text>
          </View>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, color: '#1877F2', fontWeight: '600' }}>
              See all photos
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3x2 Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {PREVIEW_PHOTOS.map((photo, i) => (
            <View
              key={i}
              style={{
                width: '32%',
                height: 100,
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 8,
              }}
            >
              <Image
                source={{ uri: photo }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* User's Activity Stream / Posts on Profile */}
      <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>
            Your Posts ({userPosts.length})
          </Text>
          <TouchableOpacity onPress={onOpenAddModal}>
            <Text style={{ fontSize: 13, color: '#1877F2', fontWeight: '600' }}>
              + Create Post
            </Text>
          </TouchableOpacity>
        </View>

        {userPosts.length === 0 ? (
          <View
            style={{
              padding: 24,
              borderRadius: 12,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: border,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              You haven't posted any updates yet.
            </Text>
          </View>
        ) : (
          userPosts.map((post) => (
            <TaskItem
              key={post.id}
              post={post}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onReact={onReact}
              onAddComment={onAddComment}
              onShare={onShare}
              isDark={isDark}
              user={user}
            />
          ))
        )}
      </View>

      {/* 1. Update Profile Picture Action Sheet Modal */}
      <Modal
        visible={showAvatarMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAvatarMenu(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: subTextColor,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: textColor,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Update Profile Picture
            </Text>

            {isLoadingPhoto && (
              <View style={{ padding: 12, alignItems: 'center' }}>
                <ActivityIndicator color="#1877F2" size="small" />
                <Text style={{ color: subTextColor, fontSize: 12, marginTop: 6 }}>
                  Loading image from device...
                </Text>
              </View>
            )}

            {/* Option: Choose from Device Gallery */}
            <TouchableOpacity
              onPress={handlePickAvatarGallery}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(24, 119, 242, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>📁</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  Choose from Gallery
                </Text>
                <Text style={{ fontSize: 12, color: subTextColor }}>
                  Select an actual photo from your device
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option: Take Photo with Camera */}
            <TouchableOpacity
              onPress={handleTakeAvatarCamera}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(66, 183, 42, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>📸</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  Take New Photo
                </Text>
                <Text style={{ fontSize: 12, color: subTextColor }}>
                  Use device camera to snap a picture
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option: View Current Profile Picture */}
            <TouchableOpacity
              onPress={() => {
                setShowAvatarMenu(false);
                setShowViewAvatar(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: buttonBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>🔍</Text>
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  View Profile Picture
                </Text>
                <Text style={{ fontSize: 12, color: subTextColor }}>
                  View your current picture full screen
                </Text>
              </View>
            </TouchableOpacity>

            {/* Preset Avatars Grid */}
            <View style={{ marginTop: 14, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: subTextColor, marginBottom: 8 }}>
                Or select an avatar:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESET_AVATARS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleUpdateAvatar(item.url)}
                    style={{
                      marginRight: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        borderWidth: userAvatar === item.url ? 2 : 1,
                        borderColor: userAvatar === item.url ? '#1877F2' : border,
                      }}
                    />
                    <Text style={{ fontSize: 10, color: textColor, marginTop: 4 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowAvatarMenu(false)}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: buttonBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 2. Update Cover Photo Modal */}
      <Modal
        visible={showCoverMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoverMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCoverMenu(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: subTextColor,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: textColor,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Update Cover Photo
            </Text>

            {/* Choose from Gallery */}
            <TouchableOpacity
              onPress={handlePickCoverGallery}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 12 }}>📁</Text>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  Upload from Gallery
                </Text>
                <Text style={{ fontSize: 12, color: subTextColor }}>
                  Select an actual cover photo from device
                </Text>
              </View>
            </TouchableOpacity>

            {/* Take Photo with Camera */}
            <TouchableOpacity
              onPress={handleTakeCoverCamera}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 12 }}>📸</Text>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  Take Photo with Camera
                </Text>
                <Text style={{ fontSize: 12, color: subTextColor }}>
                  Capture a new cover photo
                </Text>
              </View>
            </TouchableOpacity>

            {/* Preset Covers */}
            <View style={{ marginTop: 14, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: subTextColor, marginBottom: 8 }}>
                Or select a preset cover:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESET_COVERS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleUpdateCover(item.url)}
                    style={{
                      marginRight: 10,
                      borderRadius: 8,
                      overflow: 'hidden',
                      borderWidth: userCover === item.url ? 2 : 1,
                      borderColor: userCover === item.url ? '#1877F2' : border,
                    }}
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={{ width: 90, height: 50, resizeMode: 'cover' }}
                    />
                    <View style={{ paddingVertical: 2, backgroundColor: cardBg, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9.5, color: textColor }}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowCoverMenu(false)}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: buttonBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. View Full-Screen Profile Picture Modal */}
      <Modal
        visible={showViewAvatar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowViewAvatar(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => setShowViewAvatar(false)}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: userAvatar }}
            style={{ width: 280, height: 280, borderRadius: 140, borderWidth: 3, borderColor: '#FFFFFF' }}
          />

          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>
            {currentUserName}
          </Text>

          <TouchableOpacity
            onPress={() => {
              setShowViewAvatar(false);
              setShowAvatarMenu(true);
            }}
            style={{
              marginTop: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: '#1877F2',
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>📷</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>
              Change Picture
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 4. Facebook Edit Profile Modal (with KeyboardAvoidingView) */}
      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 14,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '88%',
              backgroundColor: cardBg,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <Text style={{ color: subTextColor, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
              <Text style={{ color: textColor, fontSize: 16, fontWeight: 'bold' }}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSaveFullProfile}>
                <Text style={{ color: '#1877F2', fontSize: 15, fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ padding: 16 }}
              contentContainerStyle={{ paddingBottom: 60 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {/* Profile Picture Section */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: textColor }}>
                    Profile picture
                  </Text>
                  <TouchableOpacity onPress={() => setShowAvatarMenu(true)}>
                    <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setShowAvatarMenu(true)}>
                    <Image
                      source={{ uri: userAvatar }}
                      style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#1877F2' }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cover Photo Section */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: textColor }}>
                    Cover photo
                  </Text>
                  <TouchableOpacity onPress={() => setShowCoverMenu(true)}>
                    <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setShowCoverMenu(true)}
                  style={{ height: 110, borderRadius: 8, overflow: 'hidden' }}
                >
                  <Image source={{ uri: userCover }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                </TouchableOpacity>
              </View>

              {/* Display Name Section */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
                  Display Name
                </Text>
                <TextInput
                  value={editNameInput}
                  onChangeText={setEditNameInput}
                  placeholder="Your full name"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Bio Section */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
                  Bio
                </Text>
                <TextInput
                  value={bioInput}
                  onChangeText={setBioInput}
                  multiline
                  numberOfLines={3}
                  placeholder="Describe who you are..."
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                    minHeight: 70,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              {/* Public Details Shortcut inside Edit Profile */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: textColor }}>
                    Public Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowEditProfileModal(false);
                      handleOpenEditDetails();
                    }}
                  >
                    <Text style={{ color: '#1877F2', fontSize: 13, fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: inputBg,
                    borderWidth: 1,
                    borderColor: border,
                  }}
                >
                  <Text style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
                    💼 {userDetails.work}
                  </Text>
                  <Text style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
                    🏠 {userDetails.city}
                  </Text>
                  <Text style={{ fontSize: 12, color: textColor }}>
                    ❤️ {userDetails.relationship}
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSaveFullProfile}
                style={{
                  width: '100%',
                  paddingVertical: 12,
                  backgroundColor: '#1877F2',
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                  Save All Changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 5. Edit Public Details Modal (with KeyboardAvoidingView) */}
      <Modal
        visible={showEditDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditDetailsModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 14,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '90%',
              backgroundColor: cardBg,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: border,
              }}
            >
              <TouchableOpacity onPress={() => setShowEditDetailsModal(false)}>
                <Text style={{ color: subTextColor, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
              <Text style={{ color: textColor, fontSize: 16, fontWeight: '800' }}>
                Edit Public Details
              </Text>
              <TouchableOpacity onPress={handleSavePublicDetails}>
                <Text style={{ color: '#1877F2', fontSize: 15, fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ padding: 16 }}
              contentContainerStyle={{ paddingBottom: 110 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <Text style={{ fontSize: 12, color: subTextColor, marginBottom: 16 }}>
                Customize the public details shown on your profile. These details are visible to everyone.
              </Text>

              {/* 1. Workplace */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>💼</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                    Workplace / Job
                  </Text>
                </View>
                <TextInput
                  value={editWork}
                  onChangeText={setEditWork}
                  placeholder="e.g. Software Engineer at Meta"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>

              {/* 2. Education */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>🎓</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                    Education / School
                  </Text>
                </View>
                <TextInput
                  value={editEducation}
                  onChangeText={setEditEducation}
                  placeholder="e.g. Studied CS at Stanford University"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>

              {/* 3. Current City */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>🏠</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                    Current City
                  </Text>
                </View>
                <TextInput
                  value={editCity}
                  onChangeText={setEditCity}
                  placeholder="e.g. Lives in San Francisco, California"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>

              {/* 4. Hometown */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>📍</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                    Hometown
                  </Text>
                </View>
                <TextInput
                  value={editHometown}
                  onChangeText={setEditHometown}
                  placeholder="e.g. From Seattle, Washington"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>

              {/* 5. Relationship Status */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>❤️</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                    Relationship Status
                  </Text>
                </View>

                {/* Quick Relationship Selectors */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                  {['Single', 'In a relationship', 'Engaged', 'Married'].map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => setEditRelationship(rel)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: editRelationship === rel ? '#1877F2' : inputBg,
                        borderWidth: 1,
                        borderColor: editRelationship === rel ? '#1877F2' : border,
                        marginRight: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: editRelationship === rel ? '#FFFFFF' : textColor,
                        }}
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={editRelationship}
                  onChangeText={setEditRelationship}
                  placeholder="e.g. Single / In a relationship"
                  placeholderTextColor={subTextColor}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
              </View>

              {/* Submit Save Button */}
              <TouchableOpacity
                onPress={handleSavePublicDetails}
                style={{
                  width: '100%',
                  paddingVertical: 13,
                  backgroundColor: '#1877F2',
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 20,
                  shadowColor: '#1877F2',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
                  Save Public Details
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};