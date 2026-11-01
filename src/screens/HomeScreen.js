// @file    HomeScreen.js
// @folder  src/screens/
// @about   Main Facebook feed screen showing stories, posts, and the AI briefing card.
//
// What this file does:
// - Renders the primary Facebook feed: pinned post composer, stories carousel, and post list.
// - Shows the AI Feed Digest card (AIBriefingCard) powered by useFeedBriefing hook.
// - Applies category filter pills (All/Work/Personal/Ideas) and live search filtering.
// - Passes all post interaction callbacks (react, comment, share, edit, delete) to TaskList.

import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { TaskItem } from '../components/feed/TaskItem';
import { AIBriefingCard } from '../components/feed/AIBriefingCard';

const STORIES = [
  {
    id: 1,
    name: 'Add to Story',
    isCreate: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  },
  {
    id: 3,
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  },
  {
    id: 4,
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
  },
];

export const HomeScreen = ({
  posts,
  stories = [],
  activeTab,
  setActiveTab,
  searchQuery,
  onToggleComplete,
  onDelete,
  onEdit,
  onReact,
  onAddComment,
  onShare,
  onOpenAddModal,
  onOpenAddStory,
  onViewStory,
  isDark,
  user,
  briefing,
  briefingLoading,
  briefingError,
  onRefreshBriefing,
  onOpenAIChat,
}) => {
  const authorName = user?.name || 'Alex Morgan';
  const authorAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const border = isDark ? '#3E4042' : '#CED0D4';
  const inputBg = isDark ? '#3A3B3C' : '#F0F2F5';

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeTab === 'All' ? true : post.category === activeTab;
    const trimmedQuery = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = trimmedQuery
      ? post.content?.toLowerCase().includes(trimmedQuery) ||
        post.author?.toLowerCase().includes(trimmedQuery)
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={{ paddingBottom: 24 }}>
      {/* Pinned Facebook Post Composer Widget */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: cardBg,
          borderBottomWidth: 1,
          borderBottomColor: border,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: authorAvatar }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />

          <TouchableOpacity
            onPress={onOpenAddModal}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 24,
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text style={{ fontSize: 13, color: subTextColor }}>
              What's on your mind, {authorName.split(' ')[0]}?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Facebook Stories Carousel */}
      <View
        style={{
          backgroundColor: cardBg,
          paddingVertical: 12,
          paddingLeft: 16,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: border,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Create Story Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onOpenAddStory || onOpenAddModal}
            style={{
              width: 100,
              height: 160,
              borderRadius: 12,
              marginRight: 10,
              overflow: 'hidden',
              backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
              position: 'relative',
            }}
          >
            <Image
              source={{ uri: authorAvatar }}
              style={{ width: '100%', height: 110, resizeMode: 'cover' }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: cardBg,
                height: 54,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#1877F2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: -16,
                  borderWidth: 2,
                  borderColor: cardBg,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                  +
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: textColor,
                }}
              >
                Create story
              </Text>
            </View>
          </TouchableOpacity>

          {/* Public Stories List */}
          {stories.map((story) => (
            <TouchableOpacity
              key={story.id}
              activeOpacity={0.9}
              onPress={() => onViewStory && onViewStory(story)}
              style={{
                width: 100,
                height: 160,
                borderRadius: 12,
                marginRight: 10,
                overflow: 'hidden',
                backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: story.image }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />

              {/* Author Avatar Badge in top-left */}
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#1877F2',
                  overflow: 'hidden',
                  backgroundColor: '#1877F2',
                }}
              >
                <Image
                  source={{ uri: story.avatar || authorAvatar }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>

              {/* Author Name at bottom */}
              <Text
                numberOfLines={2}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  right: 8,
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textShadowColor: 'rgba(0,0,0,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {story.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Filter Tabs */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Work', 'Personal', 'Ideas'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor:
                  activeTab === tab
                    ? '#1877F2'
                    : isDark
                    ? '#242526'
                    : '#FFFFFF',
                marginRight: 8,
                borderWidth: 1,
                borderColor: activeTab === tab ? '#1877F2' : border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: activeTab === tab ? '#FFFFFF' : textColor,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meta AI Feed Digest Card (Almanac Guide Step 6 & 7) */}
      {briefing && (
        <AIBriefingCard
          briefing={briefing}
          loading={briefingLoading}
          error={briefingError}
          onRefresh={onRefreshBriefing}
          onOpenChat={onOpenAIChat}
          isDark={isDark}
        />
      )}

      {/* Feed Post List */}
      <View style={{ paddingHorizontal: 16 }}>
        {filteredPosts.length === 0 ? (
          <View
            style={{
              padding: 32,
              alignItems: 'center',
              backgroundColor: cardBg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📰</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>
              No posts found
            </Text>
            <Text style={{ fontSize: 12, color: subTextColor, marginTop: 4 }}>
              Try changing your filter or search query.
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
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
    </View>
  );
};
