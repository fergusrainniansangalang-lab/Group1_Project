// @file    TaskItem.js
// @folder  src/components/feed/
// @about   Individual post/task card component for the social feed.
//
// What this file does:
// - Renders a full Facebook-style post card: author avatar, name, timestamp, content, and optional image.
// - Provides react (like/love/haha/etc.), comment, share, delete, and edit action buttons.
// - Displays an inline comment thread with an input box to add new comments.
// - Handles completion toggle so tasks can be marked done directly from the feed.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export const TaskItem = ({
  post,
  onToggleComplete,
  onDelete,
  onEdit,
  onReact,
  onAddComment,
  onShare,
  isDark,
  user,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  const currentUserName = user?.name || 'Alex Morgan';
  const isAuthor =
    post.author === currentUserName ||
    post.author === 'You' ||
    post.author === 'Alex Morgan';
  const displayAuthor = isAuthor && user?.name ? user.name : post.author;

  const cardBg = isDark ? '#242526' : '#FFFFFF';
  const textColor = isDark ? '#E4E6EB' : '#050505';
  const subTextColor = isDark ? '#B0B3B8' : '#65676B';
  const borderColor = isDark ? '#3E4042' : '#CED0D4';
  const dividerColor = isDark ? '#3E4042' : '#E4E6EB';
  const inputBg = isDark ? '#3A3B3C' : '#F0F2F5';

  const totalReactions = Object.values(post.reactions || {}).reduce(
    (acc, val) => acc + (typeof val === 'number' ? val : 0),
    0
  );
  const commentCount = post.comments?.length || 0;
  const shareCount = post.shares || 0;

  return (
    <View
      style={{
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: cardBg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Image
            source={{
              uri:
                isAuthor && user?.avatar
                  ? user.avatar
                  : post.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                  color: textColor,
                  marginRight: 6,
                }}
              >
                {displayAuthor}
              </Text>
              {post.category ? (
                <View
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 6,
                    backgroundColor:
                      post.category === 'Work'
                        ? 'rgba(24, 119, 242, 0.15)'
                        : 'rgba(168, 85, 247, 0.15)',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: post.category === 'Work' ? '#1877F2' : '#A855F7',
                    }}
                  >
                    {post.category}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ fontSize: 11, color: subTextColor }}>
                {post.time || 'Just now'} · 🌐
              </Text>
              {post.completed ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: '#22C55E',
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  ✓ Completed
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Action Menu Trigger (3 dots) */}
        <TouchableOpacity
          onPress={() => setShowActionMenu(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 6 }}
        >
          <Text style={{ fontSize: 18, color: subTextColor, fontWeight: 'bold' }}>
            ⋯
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Text Content */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text
          style={{
            fontSize: 14,
            color: textColor,
            lineHeight: 20,
            textDecorationLine: post.completed ? 'line-through' : 'none',
          }}
        >
          {post.content}
        </Text>
      </View>

      {/* Post Media Attachment */}
      {post.media ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowImageModal(true)}
          style={{
            backgroundColor: '#000000',
            width: '100%',
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Image
            source={{ uri: post.media }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
              🔍 View Full Photo
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Reactions & Stats Summary Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#1877F2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: -4,
              zIndex: 2,
            }}
          >
            <Text style={{ fontSize: 9 }}>👍</Text>
          </View>
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#FA3E3E',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6,
              zIndex: 1,
            }}
          >
            <Text style={{ fontSize: 9 }}>❤️</Text>
          </View>
          <Text style={{ fontSize: 12, color: subTextColor }}>
            {totalReactions > 0 ? totalReactions : 'Be the first to react'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowCommentModal(true)}>
            <Text style={{ fontSize: 12, color: subTextColor, marginRight: 8 }}>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: subTextColor }}>
            · {shareCount} {shareCount === 1 ? 'share' : 'shares'}
          </Text>
        </View>
      </View>

      {/* Action Buttons Row (Like, Comment, Share) */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          paddingVertical: 4,
          paddingHorizontal: 8,
        }}
      >
        {/* Like Button */}
        <TouchableOpacity
          onPress={() => onReact(post.id, 'like')}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 15, marginRight: 6 }}>
            {post.userReaction === 'love' ? '❤️' : '👍'}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color:
                post.userReaction === 'like'
                  ? '#1877F2'
                  : post.userReaction === 'love'
                  ? '#FA3E3E'
                  : subTextColor,
            }}
          >
            {post.userReaction === 'love' ? 'Love' : 'Like'}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={() => setShowCommentModal(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 15, marginRight: 6 }}>💬</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor }}>
            Comment
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShareClick}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 15, marginRight: 6 }}>↗️</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor }}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Sheet / 3-Dots Menu Modal */}
      <Modal visible={showActionMenu} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              paddingBottom: 24,
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

            {isAuthor && onEdit ? (
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenu(false);
                  onEdit(post);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: dividerColor,
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 12 }}>✏️</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
                    Edit Post
                  </Text>
                  <Text style={{ fontSize: 11, color: subTextColor }}>
                    Change text, image, or category
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {onToggleComplete ? (
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenu(false);
                  onToggleComplete(post.id);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: dividerColor,
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 12 }}>
                  {post.completed ? '↩️' : '✅'}
                </Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
                    {post.completed ? 'Mark as Incomplete' : 'Mark as Done'}
                  </Text>
                  <Text style={{ fontSize: 11, color: subTextColor }}>
                    Toggle task status
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {isAuthor ? (
              <TouchableOpacity
                onPress={() => {
                  setShowActionMenu(false);
                  onDelete(post.id);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 12 }}>🗑️</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>
                    Delete Post
                  </Text>
                  <Text style={{ fontSize: 11, color: subTextColor }}>
                    Remove this post from your feed
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowActionMenu(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 12 }}>🔖</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: textColor }}>
                    Save Post
                  </Text>
                  <Text style={{ fontSize: 11, color: subTextColor }}>
                    Add this to your saved items
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setShowActionMenu(false)}
              style={{
                marginTop: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: inputBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: textColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Comment Bottom Sheet Modal */}
      <Modal visible={showCommentModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '80%',
              padding: 16,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: dividerColor,
                paddingBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }}>
                Comments ({commentCount})
              </Text>
              <TouchableOpacity
                onPress={() => setShowCommentModal(false)}
                style={{ padding: 4 }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: subTextColor }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <ScrollView
              style={{ maxHeight: 240, marginBottom: 12 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {commentCount === 0 ? (
                <Text
                  style={{
                    color: subTextColor,
                    fontSize: 12,
                    textAlign: 'center',
                    marginVertical: 20,
                  }}
                >
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                post.comments?.map((comment) => {
                  const isCommentAuthor =
                    comment.author === currentUserName ||
                    comment.author === 'Alex Morgan' ||
                    comment.author === 'You';
                  const displayCommentAuthor =
                    isCommentAuthor && user?.name ? user.name : comment.author;

                  return (
                    <View
                      key={comment.id}
                      style={{
                        marginBottom: 10,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          overflow: 'hidden',
                          backgroundColor: '#1877F2',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}
                      >
                        {isCommentAuthor && user?.avatar ? (
                          <Image
                            source={{ uri: user.avatar }}
                            style={{ width: 32, height: 32 }}
                          />
                        ) : (
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>
                            {(displayCommentAuthor || 'U').charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 14,
                          backgroundColor: inputBg,
                          maxWidth: '85%',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 12,
                            color: textColor,
                            marginBottom: 2,
                          }}
                        >
                          {displayCommentAuthor}
                        </Text>
                        <Text style={{ fontSize: 13, color: textColor }}>
                          {comment.text}
                        </Text>
                        <Text style={{ fontSize: 10, color: subTextColor, marginTop: 4 }}>
                          {comment.time || 'Just now'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Input Toolbar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: dividerColor,
              }}
            >
              <TextInput
                placeholder={`Write a comment...`}
                placeholderTextColor={subTextColor}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleCommentSubmit}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  fontSize: 13,
                  backgroundColor: inputBg,
                  color: textColor,
                  marginRight: 8,
                }}
              />

              <TouchableOpacity
                onPress={handleCommentSubmit}
                style={{
                  padding: 8,
                  backgroundColor: '#1877F2',
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: '#FFFFFF' }}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      {post.media ? (
        <Modal
          visible={showImageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.92)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              style={{
                position: 'absolute',
                top: 40,
                right: 20,
                zIndex: 20,
                backgroundColor: 'rgba(255,255,255,0.25)',
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            {/* Post Author Info Header */}
            <View
              style={{
                position: 'absolute',
                top: 40,
                left: 20,
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 15,
              }}
            >
              <Image
                source={{
                  uri:
                    isAuthor && user?.avatar
                      ? user.avatar
                      : post.avatar ||
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                }}
                style={{ width: 34, height: 34, borderRadius: 17, marginRight: 10 }}
              />
              <View>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>
                  {post.author}
                </Text>
                <Text style={{ color: '#D1D5DB', fontSize: 11 }}>
                  {post.time || 'Photo'}
                </Text>
              </View>
            </View>

            <Image
              source={{ uri: post.media }}
              style={{ width: '96%', height: '75%', resizeMode: 'contain' }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
};