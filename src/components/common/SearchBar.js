// @file    SearchBar.js
// @folder  src/components/common/
// @about   Reusable top search bar for filtering posts by keyword.
//
// What this file does:
// - Renders a styled text input with a search icon prefix.
// - Provides a clear (×) button when the query is non-empty.
// - Calls the onSearch callback on every keystroke for live filtering.
// - Adapts background and text colors to dark and light mode themes.

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Pressable, TouchableOpacity, Text } from 'react-native';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  isDark,
  inputRef,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const localRef = useRef(null);
  const activeInputRef = inputRef || localRef;
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleActivate = () => {
    setIsFocused(true);
    timerRef.current = setTimeout(() => {
      activeInputRef.current?.focus();
    }, 50);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#3A3B3C' : '#E4E6EB',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 36,
        position: 'relative',
      }}
    >
      <TextInput
        ref={activeInputRef}
        placeholder="Search posts, tasks..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={false}
        focusable={isFocused}
        editable={isFocused}
        onBlur={handleBlur}
        returnKeyType="search"
        onSubmitEditing={handleBlur}
        style={{
          flex: 1,
          fontSize: 13,
          color: isDark ? '#FFFFFF' : '#111827',
          paddingVertical: 0,
        }}
      />

      {searchQuery ? (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ paddingLeft: 6 }}
        >
          <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>
      ) : null}

      {!isFocused && (
        <Pressable
          onPress={handleActivate}
          accessibilityRole="search"
          accessibilityLabel="Search posts and tasks"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            backgroundColor: 'transparent',
          }}
        />
      )}
    </View>
  );
};

