// @file    AIBriefingCard.js
// @folder  src/components/feed/
// @about   Collapsible AI digest card shown at the top of the feed.
//
// What this file does:
// - Displays a daily AI-generated briefing summary of the user's feed activity.
// - Shows a loading spinner while the briefing is being fetched from Gemini.
// - Provides a refresh button and a "Chat with AI" button to open AIChatModal.
// - Collapses/expands the card body to save screen space.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AI } from '../../config/env';

export const AIBriefingCard = ({
  briefing,
  loading,
  error,
  onRefresh,
  onOpenChat,
  isDark,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const highlightBg = isDark ? '#1C2733' : '#EBF5FF';
  const accent = '#1877F2';

  const modeBadge =
    AI.mode === 'proxy'
      ? '🔒 Proxy'
      : AI.mode === 'direct'
      ? '⚡ Direct (Dev)'
      : '⚠️ Unconfigured';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? '#2D4B73' : '#BBDEFB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Top Banner */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: highlightBg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: collapsed ? 0 : 1,
          borderBottomColor: border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>✨</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: accent,
            }}
          >
            Meta AI Feed Digest
          </Text>
          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 10,
              backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: '600', color: subTextColor }}>
              {modeBadge}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={loading}
            style={{ paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <Text style={{ fontSize: 12, color: accent, fontWeight: '600' }}>
                ↻ Refresh
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCollapsed(!collapsed)}
            style={{ paddingHorizontal: 4 }}
          >
            <Text style={{ fontSize: 13, color: subTextColor }}>
              {collapsed ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Body */}
      {!collapsed && (
        <View style={{ padding: 14 }}>
          {error ? (
            <View>
              <Text style={{ fontSize: 12, color: '#E41E3F', marginBottom: 6 }}>
                {error}
              </Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={{ fontSize: 12, color: accent, fontWeight: 'bold' }}>
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {briefing.headline ? (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: textColor,
                    marginBottom: 6,
                  }}
                >
                  {briefing.headline}
                </Text>
              ) : null}

              {briefing.body ? (
                <Text
                  style={{
                    fontSize: 12.5,
                    lineHeight: 18,
                    color: subTextColor,
                    marginBottom: briefing.advisories?.length ? 8 : 10,
                  }}
                >
                  {briefing.body}
                </Text>
              ) : loading ? (
                <Text style={{ fontSize: 12, color: subTextColor, fontStyle: 'italic' }}>
                  Analyzing recent feed updates with Gemini...
                </Text>
              ) : null}

              {/* Advisories / Key items */}
              {briefing.advisories && briefing.advisories.length > 0 ? (
                <View style={{ marginBottom: 10 }}>
                  {briefing.advisories.map((adv, idx) => (
                    <Text
                      key={idx}
                      style={{
                        fontSize: 12,
                        color: textColor,
                        lineHeight: 17,
                        marginBottom: 2,
                      }}
                    >
                      • {adv}
                    </Text>
                  ))}
                </View>
              ) : null}

              {/* Action row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: 4,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: border,
                }}
              >
                <TouchableOpacity
                  onPress={onOpenChat}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: accent,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                    Ask Meta AI 💬
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

