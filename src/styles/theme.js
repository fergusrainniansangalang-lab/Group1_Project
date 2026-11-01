// @file    theme.js
// @folder  src/styles/
// @about   Centralized color palette and style constants for the app.
//
// What this file does:
// - Defines the primary Facebook blue, background colors, and text colors.
// - Provides separate light and dark mode color sets for consistent theming.
// - Exported as the `theme` object so any component can use colors without hardcoding hex values.

export const theme = {
  colors: {
    primary: '#1877F2',
    primaryHover: '#166FE5',
    bgLight: '#F0F2F5',
    bgDark: '#18191A',
    cardLight: '#FFFFFF',
    cardDark: '#242526',
    textLight: '#050505',
    textDark: '#E4E6EB',
    textMutedLight: '#65676B',
    textMutedDark: '#B0B3B8',
    borderLight: '#CED0D4',
    borderDark: '#3E4042',
    accent: '#42B72A',
  }
};