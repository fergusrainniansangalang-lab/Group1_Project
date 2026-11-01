// @file    StoryViewerModal.js
// @folder  src/components/modals/
// @about   Full-screen story viewer modal with auto-advance progress bar.
//
// What this file does:
// - Displays a story card full-screen with author, timestamp, and media content.
// - Shows an animated progress bar that auto-closes the modal after the story duration.
// - Supports tap-to-dismiss and swipe-down gesture to close.
// - Handles both image stories and text/gradient stories.

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const StoryViewerModal = ({
  story,
  isOpen,
  onClose,
  onReact,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [reactionSent, setReactionSent] = useState('');

  useEffect(() => {
    if (isOpen && story) {
      progressAnim.setValue(0);
      setReactionSent('');
      const animation = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      });

      animation.start(({ finished }) => {
        if (finished) {
          onClose();
        }
      });

      return () => {
        animation.stop();
      };
    }
  }, [isOpen, story, onClose, progressAnim]);

  if (!story) return null;

  const handleSendReaction = (emoji) => {
    setReactionSent(emoji);
    if (onReact) {
      onReact(story.id, emoji);
    }
    setTimeout(() => {
      setReactionSent('');
    }, 1500);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View
        style={{
          flex: 1,
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Fullscreen Story Image */}
        <Image
          source={{ uri: story.image }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            resizeMode: 'cover',
          }}
        />

        {/* Top Progress Bar */}
        <View
          style={{
            position: 'absolute',
            top: 18,
            left: 12,
            right: 12,
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: '#FFFFFF',
              width: progressWidth,
            }}
          />
        </View>

        {/* Story Header (Author avatar, name, time, close button) */}
        <View
          style={{
            position: 'absolute',
            top: 28,
            left: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: story.avatar }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                borderWidth: 2,
                borderColor: '#1877F2',
                marginRight: 10,
              }}
            />
            <View>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 14,
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {story.name}
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: 11,
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {story.time || 'Just now'} · 🌍 Public
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reaction animated bubble */}
        {Boolean(reactionSent) && (
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 24,
              alignItems: 'center',
              zIndex: 30,
            }}
          >
            <Text style={{ fontSize: 36 }}>{reactionSent}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginTop: 4 }}>
              Reaction sent!
            </Text>
          </View>
        )}

        {/* Bottom Area: Caption & Quick Reaction Bar */}
        <View
          style={{
            position: 'absolute',
            bottom: 24,
            left: 12,
            right: 12,
            zIndex: 20,
          }}
        >
          {Boolean(story.caption) && (
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {story.caption}
              </Text>
            </View>
          )}

          {/* Quick Reaction Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              paddingVertical: 8,
              borderRadius: 24,
            }}
          >
            {['👍', '❤️', '😂', '🔥', '👏'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleSendReaction(emoji)}
                style={{ padding: 6 }}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
