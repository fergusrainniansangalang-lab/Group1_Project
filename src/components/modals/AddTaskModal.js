// @file    AddTaskModal.js
// @folder  src/components/modals/
// @about   Full-screen modal for composing and editing a post or task.
//
// What this file does:
// - Provides a rich composer with text input, emoji picker, and optional image attachment.
// - Integrates AI "Polish my post" feature via the Gemini streaming client.
// - Supports both creating a new post and editing an existing one.
// - Validates input and calls the parent's onSave callback with the assembled post object.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  pickImageFromGallery,
  takePhotoWithCamera,
} from '../../utils/imagePickerHelper';
import { streamMessage } from '../../services/aiClient';
import { POST_POLISH_SYSTEM } from '../../services/aiContext';

const PRESET_PHOTOS = [
  {
    label: 'Workspace',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
  },
  {
    label: 'Sunset',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
  },
  {
    label: 'Coding',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  },
  {
    label: 'Coffee',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
  },
];

export const AddTaskModal = ({
  isOpen,
  onClose,
  onAddPost,
  postToEdit,
  isDark = true,
  user,
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFileName, setMediaFileName] = useState('');
  const [category, setCategory] = useState('Work');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState('');
  const [polishError, setPolishError] = useState('');
  const polishStreamRef = React.useRef(null);

  const [contentInput, setContentInput] = useState(null);

  const isEditMode = Boolean(postToEdit);

  useEffect(() => {
    if (isOpen) {
      setPolishedText('');
      setPolishError('');
      setIsPolishing(false);
      if (postToEdit) {
        setContent(postToEdit.content || '');
        setMediaUrl(postToEdit.media || '');
        setMediaFileName(postToEdit.media ? 'Attached image' : '');
        setCategory(postToEdit.category || 'Work');
        setShowUrlInput(Boolean(postToEdit.media && postToEdit.media.startsWith('http')));
      } else {
        setContent('');
        setMediaUrl('');
        setMediaFileName('');
        setCategory('Work');
        setShowUrlInput(false);
        setShowPresets(false);
      }

      const timer = setTimeout(() => {
        contentInput?.blur();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, postToEdit, contentInput]);

  const handlePickFromGallery = async () => {
    setIsLoadingImage(true);
    try {
      const asset = await pickImageFromGallery();
      if (asset?.uri) {
        setMediaUrl(asset.uri);
        setMediaFileName(asset.fileName || 'Photo from device library');
        setShowUrlInput(false);
      }
    } catch (err) {
      console.warn('Error picking image from gallery:', err);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsLoadingImage(true);
    try {
      const asset = await takePhotoWithCamera();
      if (asset?.uri) {
        setMediaUrl(asset.uri);
        setMediaFileName('Photo captured from camera');
        setShowUrlInput(false);
      }
    } catch (err) {
      console.warn('Error taking photo:', err);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    setMediaFileName('');
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl.trim()) return;

    onAddPost({
      id: postToEdit?.id,
      content: content.trim(),
      media: mediaUrl.trim() || null,
      mediaType: 'image',
      category,
    });

    setContent('');
    setMediaUrl('');
    setMediaFileName('');
    onClose();
  };

  const handlePolishWithAI = () => {
    if (!content.trim() || isPolishing) return;
    setPolishError('');
    setIsPolishing(true);
    setPolishedText('');

    if (polishStreamRef.current) {
      polishStreamRef.current.abort();
    }

    polishStreamRef.current = streamMessage({
      system: POST_POLISH_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Please polish this post draft to make it engaging and clean:\n"${content}"`,
        },
      ],
      maxTokens: 300,
      onDelta: (chunk, fullText) => {
        setPolishedText(fullText);
      },
      onDone: (finalText) => {
        setPolishedText(finalText);
        setIsPolishing(false);
        polishStreamRef.current = null;
      },
      onError: (err) => {
        setPolishError(err.message || 'Could not polish post.');
        setIsPolishing(false);
        polishStreamRef.current = null;
      },
    });
  };

  const handleApplyPolishedText = () => {
    if (polishedText) {
      setContent(polishedText);
      setPolishedText('');
    }
  };

  const muted = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const fieldBg = isDark ? '#3A3B3C' : '#F0F2F5';
  const foreground = isDark ? '#E4E6EB' : '#050505';
  const authorName = user?.name || 'Alex Morgan';
  const authorAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

  const canSubmit = content.trim().length > 0 || mediaUrl.trim().length > 0;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        contentInput?.blur();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.65)',
          padding: 14,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 540,
            maxHeight: '92%',
            borderRadius: 16,
            backgroundColor: cardBg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: border,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: muted }}>
                ✕
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontWeight: '700',
                fontSize: 16,
                color: foreground,
              }}
            >
              {isEditMode ? 'Edit post' : 'Create post'}
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 6,
                backgroundColor: canSubmit ? '#1877F2' : isDark ? '#3A3B3C' : '#E4E6EB',
              }}
            >
              <Text
                style={{
                  color: canSubmit ? '#FFFFFF' : muted,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {isEditMode ? 'Save' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 16 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <Image
                source={{ uri: authorAvatar }}
                style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
              />
              <View>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: foreground,
                    marginBottom: 2,
                  }}
                >
                  {authorName}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: fieldBg,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 11, color: muted }}>Public 🌐 ▾</Text>
                </View>
              </View>
            </View>

            {/* Main Post Composer Text Input */}
            <TextInput
              ref={setContentInput}
              multiline
              numberOfLines={4}
              placeholder={`What's on your mind, ${authorName.split(' ')[0]}?`}
              placeholderTextColor={muted}
              value={content}
              onChangeText={setContent}
              autoFocus={false}
              blurOnSubmit={false}
              style={{
                width: '100%',
                fontSize: 16,
                textAlignVertical: 'top',
                color: foreground,
                minHeight: 90,
                padding: 0,
              }}
              accessibilityLabel="Post content"
            />

            {/* AI Post Assistant Bar (Almanac Guide Step 7.6) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginTop: 6,
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={handlePolishWithAI}
                disabled={!content.trim() || isPolishing}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: content.trim() && !isPolishing ? '#1877F2' : fieldBg,
                  opacity: content.trim() ? 1 : 0.6,
                }}
              >
                {isPolishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : (
                  <Text style={{ marginRight: 4, fontSize: 13 }}>✨</Text>
                )}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: content.trim() && !isPolishing ? '#FFFFFF' : muted,
                  }}
                >
                  {isPolishing ? 'Polishing...' : 'Polish with AI'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI Polished Suggestion Preview Card */}
            {(isPolishing || polishedText || polishError) ? (
              <View
                style={{
                  backgroundColor: fieldBg,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#2D4B73' : '#BBDEFB',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1877F2' }}>
                    ✨ AI Suggestion
                  </Text>
                  {polishedText && !isPolishing && (
                    <TouchableOpacity onPress={() => setPolishedText('')}>
                      <Text style={{ fontSize: 11, color: muted }}>Dismiss</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {polishError ? (
                  <Text style={{ fontSize: 12, color: '#E41E3F' }}>{polishError}</Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 13, lineHeight: 18, color: foreground }}>
                      {polishedText || 'Generating polished version...'}
                    </Text>

                    {polishedText && !isPolishing && (
                      <TouchableOpacity
                        onPress={handleApplyPolishedText}
                        style={{
                          marginTop: 8,
                          alignSelf: 'flex-start',
                          backgroundColor: '#1877F2',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
                          ✓ Use this draft
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            ) : null}

            {/* Loading indicator when processing photo */}
            {isLoadingImage && (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: fieldBg,
                  borderRadius: 12,
                  marginVertical: 10,
                }}
              >
                <ActivityIndicator size="small" color="#1877F2" />
                <Text style={{ fontSize: 12, color: muted, marginTop: 8 }}>
                  Loading image from device...
                </Text>
              </View>
            )}

            {/* Media Preview if attached */}
            {mediaUrl && !isLoadingImage ? (
              <View
                style={{
                  position: 'relative',
                  marginTop: 10,
                  marginBottom: 14,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: border,
                  backgroundColor: '#000000',
                }}
              >
                <Image
                  source={{ uri: mediaUrl }}
                  style={{ width: '100%', height: 230, resizeMode: 'cover' }}
                />

                {/* Top Actions: Remove & Change */}
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    flexDirection: 'row',
                  }}
                >
                  <TouchableOpacity
                    onPress={handlePickFromGallery}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 14,
                      marginRight: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                      🔄 Change
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRemoveMedia}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom info banner */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, marginRight: 6 }}>📷</Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', flex: 1 }}
                  >
                    {mediaFileName || 'Actual image attached'}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* When NO image is attached: Dedicated Facebook Add Photos Card */}
            {!mediaUrl && !isLoadingImage ? (
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: border,
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 14,
                  backgroundColor: isDark ? 'rgba(58, 59, 60, 0.4)' : '#F7F8FA',
                  marginBottom: 14,
                }}
              >
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: 'rgba(69, 189, 98, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>🖼️</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: foreground }}>
                    Add Photos / Videos
                  </Text>
                  <Text style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                    Upload actual images from your device or take a live photo
                  </Text>
                </View>

                {/* Primary Photo Selection Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  {/* Pick from Gallery Button */}
                  <TouchableOpacity
                    onPress={handlePickFromGallery}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 9,
                      paddingHorizontal: 10,
                      backgroundColor: '#1877F2',
                      borderRadius: 8,
                      marginRight: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>📁</Text>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                      Device Gallery
                    </Text>
                  </TouchableOpacity>

                  {/* Take Photo Button */}
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 9,
                      paddingHorizontal: 10,
                      backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>📸</Text>
                    <Text style={{ color: foreground, fontWeight: '700', fontSize: 12 }}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Secondary: URL or Preset Toggles */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: border,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowUrlInput(!showUrlInput)}
                    style={{ paddingHorizontal: 10, paddingVertical: 4 }}
                  >
                    <Text style={{ fontSize: 11, color: '#1877F2', fontWeight: '600' }}>
                      🔗 Paste image link
                    </Text>
                  </TouchableOpacity>

                  <Text style={{ color: muted, fontSize: 11 }}>•</Text>

                  <TouchableOpacity
                    onPress={() => setShowPresets(!showPresets)}
                    style={{ paddingHorizontal: 10, paddingVertical: 4 }}
                  >
                    <Text style={{ fontSize: 11, color: '#1877F2', fontWeight: '600' }}>
                      🎨 Sample photos
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Custom URL Input (Toggleable) */}
            {showUrlInput ? (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 11, color: muted, marginBottom: 4, fontWeight: '600' }}>
                  Direct Image URL:
                </Text>
                <TextInput
                  placeholder="https://example.com/photo.jpg"
                  placeholderTextColor={muted}
                  value={mediaUrl}
                  onChangeText={(val) => {
                    setMediaUrl(val);
                    setMediaFileName(val ? 'Web URL image' : '');
                  }}
                  autoFocus={false}
                  style={{
                    width: '100%',
                    padding: 9,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    fontSize: 13,
                    backgroundColor: fieldBg,
                    color: foreground,
                  }}
                />
              </View>
            ) : null}

            {/* Sample Photos Selector (Expandable) */}
            {showPresets ? (
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: muted,
                    marginBottom: 8,
                  }}
                >
                  Choose sample photo:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PRESET_PHOTOS.map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setMediaUrl(preset.url);
                        setMediaFileName(`Sample: ${preset.label}`);
                      }}
                      style={{
                        marginRight: 8,
                        borderRadius: 8,
                        overflow: 'hidden',
                        borderWidth: mediaUrl === preset.url ? 2 : 1,
                        borderColor: mediaUrl === preset.url ? '#1877F2' : border,
                      }}
                    >
                      <Image
                        source={{ uri: preset.url }}
                        style={{ width: 70, height: 50, resizeMode: 'cover' }}
                      />
                      <View
                        style={{
                          paddingVertical: 2,
                          backgroundColor: cardBg,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10, color: foreground }}>
                          {preset.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Category / Tag Selector */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: muted,
                  marginBottom: 8,
                }}
              >
                Category:
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {['Work', 'Personal', 'Ideas'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor:
                        category === cat
                          ? '#1877F2'
                          : fieldBg,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: category === cat ? '#FFFFFF' : foreground,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add to Your Post Facebook-style Toolbar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: border,
                backgroundColor: cardBg,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: foreground }}>
                Add to your post
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Photo / Gallery Action */}
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    alignItems: 'center',
                  }}
                  accessibilityLabel="Attach photo from gallery"
                >
                  <Text style={{ fontSize: 20 }}>🖼️</Text>
                </TouchableOpacity>

                {/* Camera Action */}
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    alignItems: 'center',
                  }}
                  accessibilityLabel="Take photo with camera"
                >
                  <Text style={{ fontSize: 20 }}>📸</Text>
                </TouchableOpacity>

                {/* URL Action */}
                <TouchableOpacity
                  onPress={() => setShowUrlInput(!showUrlInput)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    alignItems: 'center',
                  }}
                  accessibilityLabel="Add web link"
                >
                  <Text style={{ fontSize: 20 }}>🔗</Text>
                </TouchableOpacity>

                {/* Tag / Feeling / Location Icons */}
                <TouchableOpacity style={{ paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 20 }}>🏷️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 20 }}>😊</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 20 }}>📍</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%',
                paddingVertical: 12,
                backgroundColor: canSubmit ? '#1877F2' : isDark ? '#3A3B3C' : '#E4E6EB',
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: canSubmit ? '#FFFFFF' : muted,
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                {isEditMode ? 'Save Changes' : 'Post'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};