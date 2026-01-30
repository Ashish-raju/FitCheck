# FitCheck APK Build Guide

Complete guide for building standalone Android APK files from the FitCheck React Native/Expo project.

## 📝 Overview

This guide covers three methods for building APKs:
1. **Local Gradle Build** - Full control, requires Android Studio
2. **Expo Export** - Simpler, good for quick testing
3. **EAS Build** (Future) - Cloud-based, production-ready

## 🎯 Target Configuration

- **Minimum SDK**: Android 10 (API 29)
- **Target SDK**: Android 14 (API 34)
- **Compile SDK**: Android 14 (API 34)
- **Architecture**: arm64-v8a, armeabi-v7a

## 📦 Method 1: Local Gradle Build (Recommended)

### Prerequisites

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK Platform 34
   - Install Android SDK Build-Tools 34.0.0+

2. **Set Environment Variables** (Windows)
   ```powershell
   # Add to System Environment Variables
   ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
   
   # Add to Path
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %JAVA_HOME%\bin
   ```

3. **Verify Installation**
   ```bash
   adb version
   java -version
   javac -version
   ```

### Step-by-Step Build Process

#### 1. Generate Native Android Project

First time only, or after major Expo SDK updates:

```bash
# Clean any existing android directory
rm -rf android

# Generate fresh Android project
npx expo prebuild --platform android --clean
```

This creates the `android/` directory with native code.

#### 2. Configure Signing (Optional for Debug)

For **release** builds, create a keystore:

```bash
# Generate keystore
keytool -genkey -v -keystore fitcheck-release-key.keystore -alias fitcheck-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Move keystore to android/app/
mv fitcheck-release-key.keystore android/app/
```

Create `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=fitcheck-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=fitcheck-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

#### 3. Build Debug APK

```bash
cd android
./gradlew assembleDebug
cd ..
```

**Output**: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 4. Build Release APK

```bash
cd android
./gradlew assembleRelease
cd ..
```

**Output**: `android/app/build/outputs/apk/release/app-release.apk`

### Gradle Build Options

```bash
# Clean build
./gradlew clean

# Build with verbose logging
./gradlew assembleDebug --info

# Build specific variant
./gradlew assembleDebug
./gradlew assembleRelease

# Bundle (AAB) for Play Store
./gradlew bundleRelease
```

## 📦 Method 2: Expo Export

Simpler method, good for quick APK generation:

```bash
# Export Android bundle
npx expo export:android
```

This creates an optimized bundle but doesn't produce a standalone APK. You'll need Method 1 to actually build the APK.

## 🚀 Installation & Testing

### Install via ADB

```bash
# Ensure device is connected
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or force reinstall
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Uninstall if needed
adb uninstall com.ashish_raju1605.FirewallHost
```

### Manual Installation

1. Copy APK to phone via USB or cloud
2. Tap APK file on phone
3. Enable "Install from Unknown Sources" if prompted
4. Tap "Install"

### Launch App

```bash
# Launch via ADB
adb shell am start -n com.ashish_raju1605.FirewallHost/.MainActivity

# Or just tap the app icon on device
```

## 🐛 Debugging Built APK

### View Logs

```bash
# Real-time logs
adb logcat | grep -E "FitCheck|InventoryStore|Database|ReactNativeJS"

# Clear logs first
adb logcat -c

# Save logs to file
adb logcat > fitcheck-logs.txt
```

### Common Build Errors

#### Error: SDK Location Not Found

**Solution**: Create `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
```

#### Error: Gradle Version Mismatch

**Solution**: Update `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-bin.zip
```

#### Error: Build Tools Not Found

**Solution**: Install via Android Studio SDK Manager:
- Android SDK Build-Tools 34.0.0
- Android SDK Platform 34

#### Error: Out of Memory

**Solution**: Increase Gradle memory in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

#### Error: Execution failed for ':app:mergeDebugResources'

**Solution**: Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

## 📊 Build Optimization

### Reduce APK Size

1. **Enable ProGuard** (Release builds):
   In `android/app/build.gradle`:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
       }
   }
   ```

2. **Split APKs by Architecture**:
   ```gradle
   android {
       splits {
           abi {
               enable true
               reset()
               include "armeabi-v7a", "arm64-v8a"
               universalApk false
           }
       }
   }
   ```

3. **Remove unused resources**:
   ```gradle
   buildTypes {
       release {
           shrinkResources true
       }
   }
   ```

### Improve Build Speed

1. **Gradle Daemon**:
   ```properties
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

2. **Use Build Cache**:
   ```bash
   ./gradlew assembleDebug --build-cache
   ```

## 🔐 Signing for Production

### Generate Release Keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore fitcheck-release-key.keystore \
  -alias fitcheck-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important**: Store keystore and passwords securely! If lost, you cannot update your app on Play Store.

### Verify Signature

```bash
# Check APK signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk

# View keystore info
keytool -list -v -keystore android/app/fitcheck-release-key.keystore
```

## 📈 Build Variants

Create different app variants (dev/staging/production):

In `android/app/build.gradle`:

```gradle
android {
    flavorDimensions "version"
    productFlavors {
        dev {
            dimension "version"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
        }
        staging {
            dimension "version"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
        }
        production {
            dimension "version"
        }
    }
}
```

Build specific variant:
```bash
./gradlew assembleDevDebug
./gradlew assembleStagingRelease
./gradlew assembleProductionRelease
```

## 🎯 Checklist Before Release

- [ ] Update version in `app.json`
- [ ] Update `versionCode` in `android/app/build.gradle`
- [ ] Test on real device
- [ ] Test in airplane mode (offline functionality)
- [ ] Test data persistence (kill app, restart)
- [ ] Check app size (<50MB target)
- [ ] Verify all permissions work
- [ ] Test on Android 10, 11, 12, 13, 14
- [ ] Run ProGuard and test thoroughly
- [ ] Sign with release keystore
- [ ] Backup keystore securely

## 🚀 Distribution

### Direct APK Distribution

Good for beta testing:
1. Upload APK to cloud storage
2. Share download link
3. Users install directly

### Google Play Store (Future)

Requires AAB (Android App Bundle):

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## 📱 Testing Checklist

After building APK, test:

- [ ] App installs successfully
- [ ] No crashes on launch
- [ ] Database initializes
- [ ] Upload garment from camera
- [ ] Upload garment from gallery
- [ ] Generate outfit
- [ ] Save outfit
- [ ] Mark item as worn
- [ ] View insights
- [ ] Create travel pack
- [ ] All 4 tabs accessible
- [ ] Airplane mode works
- [ ] App restart preserves data

## 🆘 Support

If build fails:

1. **Clean everything**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   rm -rf node_modules
   npm install
   npm run prebuild
   ```

2. **Check logs**:
   ```bash
   ./gradlew assembleDebug --stacktrace --info
   ```

3. **Verify environment**:
   ```bash
   npx expo-doctor
   ```

---

**Happy Building! 🚀**
