module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-native-community|@react-native-async-storage|@react-navigation|react-native-image-picker|firebase|@firebase)/)',
  ],
};
