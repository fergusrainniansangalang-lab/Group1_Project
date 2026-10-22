# Building the Android APK for TaskFlow

This guide explains how to generate a release APK for the TaskFlow React Native application.

## 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18+)
* Java Development Kit (JDK 17 or compatible version)
* Android Studio (with Android SDK installed)
* Appropriate environment variables configured (`ANDROID_HOME`, `JAVA_HOME`).

## 2. Install dependencies
Open your terminal in the root of the project and run:
```bash
npm install
```

## 3. Start Metro
In one terminal window, start the Metro bundler to ensure the packager runs correctly:
```bash
npm start
```

## 4. Test the application
Before building, ensure the application works properly on an emulator or a connected device:
```bash
npm run android
```

## 5. Build debug APK
If you want to build a debug version for testing:
```bash
# Windows
cd android
gradlew.bat assembleDebug

# macOS / Linux
cd android
./gradlew assembleDebug
```
The Debug APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 6. Build release APK
To create a production-ready Release APK (unaligned/unsigned or signed depending on your keystore config):

```bash
# Windows
cd android
gradlew.bat assembleRelease

# macOS / Linux
cd android
./gradlew assembleRelease
```

## 7. Locate the APK
Once the build completes successfully, your APK will be available here:
`android/app/build/outputs/apk/release/app-release.apk`

## 8. Install APK on Android device
You can install the release APK directly to a connected Android device using adb:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```
