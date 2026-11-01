// @file    imagePickerHelper.js
// @folder  src/utils/
// @about   Cross-platform image picker and camera access helper.
//
// What this file does:
// - Requests Android camera/gallery permissions using PermissionsAndroid.
// - Wraps react-native-image-picker to open the device gallery (pickImageFromGallery).
// - Wraps react-native-image-picker to open the device camera (takePhotoWithCamera).
// - Falls back gracefully if the native module is unavailable (Expo/web environments).

import { Platform, PermissionsAndroid, Alert } from 'react-native';

let RNImagePicker = null;
try {
  RNImagePicker = require('react-native-image-picker');
} catch (e) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('react-native-image-picker could not be loaded synchronously:', e);
  }
}

/**
 * Request camera permission on Android
 */
export const requestCameraPermission = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Facebook needs access to your camera to take photos for your posts.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

/**
 * Web fallback for image file selection using HTML5 file input
 */
const pickImageWeb = (useCamera = false) => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) {
      input.capture = 'environment';
    }
    input.style.display = 'none';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve({
          uri: event.target.result,
          fileName: file.name,
          fileSize: file.size,
          type: file.type,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      try {
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      } catch (err) {
        // ignore
      }
    }, 1000);
  });
};

/**
 * Pick an image from device gallery / photo library
 */
export const pickImageFromGallery = async () => {
  // If running in browser / web context
  if (Platform.OS === 'web' || (typeof document !== 'undefined' && document.createElement)) {
    return pickImageWeb(false);
  }

  if (RNImagePicker && typeof RNImagePicker.launchImageLibrary === 'function') {
    try {
      const result = await RNImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        return null;
      }
      if (result.errorCode) {
        console.warn('Image picker error:', result.errorMessage);
        Alert.alert('Notice', result.errorMessage || 'Failed to select image');
        return null;
      }
      if (result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
    } catch (e) {
      console.warn('launchImageLibrary error:', e);
      if (typeof document !== 'undefined') {
        return pickImageWeb(false);
      }
    }
  } else if (typeof document !== 'undefined') {
    return pickImageWeb(false);
  }
  return null;
};

/**
 * Capture a photo using device camera
 */
export const takePhotoWithCamera = async () => {
  if (Platform.OS === 'web' || (typeof document !== 'undefined' && document.createElement)) {
    return pickImageWeb(true);
  }

  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
    return null;
  }

  if (RNImagePicker && typeof RNImagePicker.launchCamera === 'function') {
    try {
      const result = await RNImagePicker.launchCamera({
        mediaType: 'photo',
        quality: 0.85,
        saveToPhotos: true,
        includeBase64: false,
      });

      if (result.didCancel) {
        return null;
      }
      if (result.errorCode) {
        console.warn('Camera error:', result.errorMessage);
        Alert.alert('Notice', result.errorMessage || 'Failed to capture photo');
        return null;
      }
      if (result.assets && result.assets.length > 0) {
        return result.assets[0];
      }
    } catch (e) {
      console.warn('launchCamera error:', e);
      if (typeof document !== 'undefined') {
        return pickImageWeb(true);
      }
    }
  } else if (typeof document !== 'undefined') {
    return pickImageWeb(true);
  }
  return null;
};
