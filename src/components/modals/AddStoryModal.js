// @file    AddStoryModal.js
// @folder  src/components/modals/
// @about   Modal for creating a new story with text and an optional photo.
//
// What this file does:
// - Lets the user pick a background color/gradient for their story card.
// - Supports adding a caption and attaching a photo from the gallery or camera.
// - Assembles the story object and calls the parent's onSave callback on submit.
// - Handles image permission requests via imagePickerHelper.

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePickerHelper';

const PRESET_STORY_IMAGES = [
  {
    label: 'Sunset 🌅',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    label: 'Coding 💻',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  },
  {
    label: 'Nature 🌲',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
  },
  {
    label: 'Cafe ☕',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
  },
];

export const AddStoryModal = ({
  isOpen,
  onClose,
  onAddStory,
  user,
  isDark = true,
}) => {
  const [selectedImage, setSelectedImage] = useState(PRESET_STORY_IMAGES[0].url);
  const [caption, setCaption] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const overlayBg = 'rgba(0, 0, 0, 0.75)';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const inputBg = isDark ? '#3A3B3C' : '#F0F2F5';
  const buttonBg = isDark ? '#3A3B3C' : '#E4E6EB';

  const authorName = user?.name || 'Alex Morgan';
  const authorAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

  const handlePickGallery = async () => {
    setIsLoadingImage(true);
    try {
      const asset = await pickImageFromGallery();
      if (asset?.uri) {
        setSelectedImage(asset.uri);
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsLoadingImage(true);
    try {
      const asset = await takePhotoWithCamera();
      if (asset?.uri) {
        setSelectedImage(asset.uri);
      }
    } catch (err) {
      console.warn('Camera take error:', err);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleShare = () => {
    if (!selectedImage) return;

    onAddStory({
      image: selectedImage,
      caption: caption.trim(),
    });

    setCaption('');
    setSelectedImage(PRESET_STORY_IMAGES[0].url);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: overlayBg,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: cardBg,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            maxHeight: '90%',
            paddingBottom: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: border,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ fontSize: 16, color: subTextColor, fontWeight: 'bold' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>
              Create story
            </Text>

            <TouchableOpacity
              onPress={handleShare}
              disabled={!selectedImage || isLoadingImage}
              style={{
                backgroundColor: selectedImage ? '#1877F2' : buttonBg,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: selectedImage ? '#FFFFFF' : subTextColor,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {/* User Info & Audience */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Image
                source={{ uri: authorAvatar }}
                style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }}
              />
              <View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
                  {authorName}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 2,
                    backgroundColor: buttonBg,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 11, color: subTextColor }}>
                    🌍 Public · Visible to all users
                  </Text>
                </View>
              </View>
            </View>

            {/* Story Image Preview */}
            <View
              style={{
                width: '100%',
                height: 280,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: isDark ? '#18191A' : '#E4E6EB',
                marginBottom: 14,
                position: 'relative',
                borderWidth: 1,
                borderColor: border,
              }}
            >
              {isLoadingImage ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="#1877F2" />
                  <Text style={{ color: subTextColor, fontSize: 12, marginTop: 8 }}>
                    Loading photo...
                  </Text>
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />

                  {/* Caption banner overlay */}
                  {Boolean(caption) && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      >
                        {caption}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Caption Input */}
            <View
              style={{
                backgroundColor: inputBg,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption to your story..."
                placeholderTextColor={subTextColor}
                style={{
                  color: textColor,
                  fontSize: 14,
                  padding: 0,
                }}
              />
            </View>

            {/* Photo Source Buttons */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: subTextColor,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}
            >
              Select Photo Source
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <TouchableOpacity
                onPress={handlePickGallery}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: buttonBg,
                  paddingVertical: 10,
                  borderRadius: 10,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>🖼️</Text>
                <Text style={{ color: textColor, fontWeight: '700', fontSize: 13 }}>
                  Device Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTakePhoto}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: buttonBg,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>📸</Text>
                <Text style={{ color: textColor, fontWeight: '700', fontSize: 13 }}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>

            {/* Aesthetic presets */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: subTextColor,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}
            >
              Or Choose a Preset Photo
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              {PRESET_STORY_IMAGES.map((preset) => {
                const isSelected = selectedImage === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    onPress={() => setSelectedImage(preset.url)}
                    style={{
                      marginRight: 10,
                      alignItems: 'center',
                      borderRadius: 10,
                      overflow: 'hidden',
                      borderWidth: isSelected ? 2.5 : 1,
                      borderColor: isSelected ? '#1877F2' : border,
                    }}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={{ width: 80, height: 80, resizeMode: 'cover' }}
                    />
                    <View
                      style={{
                        backgroundColor: cardBg,
                        width: '100%',
                        paddingVertical: 4,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected ? '#1877F2' : textColor,
                        }}
                      >
                        {preset.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
