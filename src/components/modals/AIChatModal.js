// @file    AIChatModal.js
// @folder  src/components/modals/
// @about   Fullscreen conversational AI chat modal powered by Gemini.
//
// What this file does:
// - Renders a chat-bubble thread between the user and the Meta AI assistant.
// - Streams responses token-by-token from the Gemini API via aiClient.
// - Enforces daily quota limits and shows a friendly limit-reached message.
// - Provides quick-action prompt chips for common questions about the user's feed.

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { AI } from '../../config/env';
import { checkDailyQuota } from '../../services/aiClient';

const SUGGESTED_PROMPTS = [
  'Summarize recent posts on the feed',
  'What work tasks are currently completed?',
  'Give me engaging post ideas for today',
  'Who posted recently and what about?',
];

export const AIChatModal = ({
  visible,
  onClose,
  chat,
  isDark,
}) => {
  const [inputText, setInputText] = useState('');
  const [quotaInfo, setQuotaInfo] = useState({ remaining: 20, count: 0 });
  const scrollViewRef = useRef(null);

  const {
    messages,
    streamingText,
    loading,
    error,
    sendMessage,
    stop,
    retry,
    clearChat,
  } = chat;

  const bg = isDark ? '#18191A' : '#F0F2F5';
  const headerBg = isDark ? '#242526' : '#FFFFFF';
  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const inputBg = isDark ? '#3A3B3C' : '#E4E6EB';
  const accent = '#1877F2';

  // Refresh quota info when modal opens
  useEffect(() => {
    if (visible) {
      checkDailyQuota().then(setQuotaInfo);
    }
  }, [visible, messages.length]);

  // Scroll to bottom when messages or streaming text updates
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingText, visible]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptPress = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: bg }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? 48 : 16,
            paddingBottom: 12,
            paddingHorizontal: 16,
            backgroundColor: headerBg,
            borderBottomWidth: 1,
            borderBottomColor: border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: isDark ? '#1C2733' : '#EBF5FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ fontSize: 20 }}>✨</Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: textColor }}>
                  Meta AI
                </Text>
                <View
                  style={{
                    marginLeft: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 8,
                    backgroundColor: accent,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700' }}>
                    Gemini
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: subTextColor }}>
                {AI.mode === 'proxy'
                  ? 'Connected via Secure Proxy'
                  : AI.mode === 'direct'
                  ? 'Direct Development Mode'
                  : 'Unconfigured'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={clearChat}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: inputBg,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 11, color: subTextColor, fontWeight: '600' }}>
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: inputBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: textColor, fontWeight: 'bold' }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Quota Counter Banner (Almanac Guide Step 8) */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            backgroundColor: isDark ? '#202122' : '#E7F3FF',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: border,
          }}
        >
          <Text style={{ fontSize: 11, color: subTextColor }}>
            Daily Device Quota (Almanac Guardrail):
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: accent }}>
            {quotaInfo.remaining} / 20 queries remaining
          </Text>
        </View>

        {/* Message Thread */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <View
                key={m.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: isUser ? accent : cardBg,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 18,
                    borderBottomRightRadius: isUser ? 4 : 18,
                    borderBottomLeftRadius: isUser ? 18 : 4,
                    borderWidth: isUser ? 0 : 1,
                    borderColor: border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: isUser ? '#FFFFFF' : textColor,
                    }}
                  >
                    {m.content}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: subTextColor,
                    marginTop: 3,
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {m.time}
                </Text>
              </View>
            );
          })}

          {/* Streaming Bubble */}
          {loading && streamingText ? (
            <View
              style={{
                alignSelf: 'flex-start',
                maxWidth: '82%',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: cardBg,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: accent,
                }}
              >
                <Text style={{ fontSize: 14, lineHeight: 20, color: textColor }}>
                  {streamingText}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: accent, marginTop: 3 }}>
                streaming answer...
              </Text>
            </View>
          ) : null}

          {/* Loading Indicator */}
          {loading && !streamingText ? (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: cardBg,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: border,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="small" color={accent} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: subTextColor }}>
                Meta AI is thinking...
              </Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {error ? (
            <View
              style={{
                backgroundColor: isDark ? '#3E1F24' : '#FDE8E8',
                padding: 12,
                borderRadius: 12,
                marginVertical: 8,
                borderWidth: 1,
                borderColor: '#E41E3F',
              }}
            >
              <Text style={{ fontSize: 12, color: '#E41E3F', marginBottom: 6 }}>
                {error}
              </Text>
              <TouchableOpacity onPress={retry}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: accent }}>
                  ↻ Retry request
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Suggested Prompts pills */}
          {!loading && (
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: subTextColor,
                  marginBottom: 8,
                }}
              >
                SUGGESTED QUESTIONS
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handlePromptPress(prompt)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#242526' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: border,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: accent, fontWeight: '500' }}>
                      {prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: headerBg,
            borderTopWidth: 1,
            borderTopColor: border,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <TouchableOpacity
              onPress={stop}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 18,
                backgroundColor: '#E41E3F',
                marginRight: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
                ■ Stop
              </Text>
            </TouchableOpacity>
          ) : null}

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Meta AI about feed, posts, tasks..."
            placeholderTextColor={subTextColor}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
            style={{
              flex: 1,
              backgroundColor: inputBg,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              color: textColor,
              fontSize: 14,
              maxHeight: 100,
            }}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: inputText.trim() && !loading ? accent : inputBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                color: inputText.trim() && !loading ? '#FFFFFF' : subTextColor,
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

