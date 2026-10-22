import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../styles/theme';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  // UNCONTROLLED VARIABLE (useRef):
  // Provides access to the native input without controlling its value through React state.
  // We use it here to focus or clear the input directly.
  const searchInputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.clear(); // Using the uncontrolled ref to call a native method
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        ref={searchInputRef}
        style={styles.input}
        placeholder="Search tasks..."
        placeholderTextColor={theme.colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  icon: {
    marginRight: theme.spacing.sm,
    fontSize: 16,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});

export default SearchBar;
