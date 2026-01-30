# FitCheck - Personal AI Stylist App

A standalone, offline-first Android application for personal wardrobe management, outfit suggestions, and style insights.

## ✨ Features

- **📸 Wardrobe Management**: Capture or upload clothing items with automatic categorization
- **🎨 AI Stylist Engine**: Local, on-device outfit generation based on context, weather, and preferences
- **👔 Outfit Builder**: Manual outfit creation with visual canvas
- **📊 Style Insights**: Body intelligence, color palette analysis, and wardrobe analytics
- **✈️ Travel Packer**: Generate packing lists based on trip details
- **💾 Offline-First**: All features work without internet connection
- **🗄️ SQLite Storage**: Robust local data persistence

## 🎯 Philosophy

> **"If the phone is in airplane mode, the app must still work."**

FitCheck is built to be completely self-contained with zero dependency on external APIs or backends. Everything runs on-device.

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Android Studio**: Latest stable version (for local builds)
- **Java Development Kit** (JDK): v17 or higher
- **Windows/macOS/Linux**: Any platform that supports React Native

### For APK Building

- Android SDK Platform 34 (Android 14)
- Android SDK Build Tools 34.0.0+
- Android SDK Platform Tools

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd "c:/Users/YourUser/path/to/project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npx expo-doctor
   ```

## 💻 Local Development

### Start Development Server

```bash
npm start
```

This will open the Expo Dev Tools. You can then:

- Press `a` to run on Android emulator
- Scan QR code with Expo Go app on physical device

### Run on Android

```bash
npm run android
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run with coverage
npm run test:all

# Watch mode
npm run test:watch
```

## 📦 Building APK

### Method 1: Local Build (Recommended for Quick Testing)

**Prerequisites**: Android Studio and Android SDK installed

1. **Generate Android project files** (first time only)
   ```bash
   npm run prebuild
   ```

2. **Build debug APK**
   ```bash
   npm run build:android:debug
   ```

   The APK will be located at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Build release APK**
   ```bash
   npm run build:android:release
   ```

   The APK will be located at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Method 2: Expo Export (Simpler but less control)

```bash
npm run build:android:local
```

### Installing the APK

#### On Physical Device

1. **Enable USB Debugging** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Install via ADB**:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

#### Alternative: Transfer APK File

1. Copy the APK file to your phone
2. Open the APK file on your phone
3. Allow installation from unknown sources if prompted
4. Install the app

## 🗄️ Database Architecture

FitCheck uses SQLite for robust, offline-first data storage:

### Tables

- **garments**: Clothing items with full DNA (color, pattern, fabric, formality, season)
- **outfits**: Saved outfit combinations with scores and context
- **user_profile**: Body type, skin tone, preferences, and vetoes
- **wear_logs**: History of when items/outfits were worn
- **travel_packs**: Saved packing lists for trips
- **feedback_events**: User feedback for ML learning

### Migration from AsyncStorage

On first launch after update, the app automatically migrates existing data from AsyncStorage to SQLite. No user action required.

## 🧪 Testing Offline Mode

1. **Enable Airplane Mode** on your device
2. Launch FitCheck
3. Verify all features work:
   - Upload garment from local photos ✓
   - Generate outfit ✓
   - Save outfit ✓
   - View profile insights ✓

## 📁 Project Structure

```
├── android/              # Native Android project
├── assets/               # Images, icons, mock data
├── database/             # SQLite schema and repositories
│   ├── schema.ts         # Table definitions
│   ├── connection.ts     # DB connection manager
│   ├── migrations.ts     # AsyncStorage → SQLite migration
│   └── repositories/     # Data access layer
├── engine/               # Stylist AI engine
│   ├── core/             # Garment DNA extraction
│   ├── outfit/           # Outfit generation
│   ├── scoring/          # Outfit scoring
│   └── rules/            # Style rules
├── services/             # Business logic services
├── state/                # State management (Zustand)
├── ui/                   # React components
│   ├── closet/           # Wardrobe screens
│   ├── outfits/          # Outfit screens
│   ├── profile/          # Profile & insights screens
│   └── ritual/           # Home screen
└── truth/                # Type definitions
```

## 🎨 UI Architecture  

- **Minimalistic Design**: Clean, purple-violet gradient theme
- **Smooth Animations**: 60fps interactions with React Native Reanimated
- **4 Main Tabs**:
  1. Home - Outfit reveal and stats
  2. Closet - Wardrobe management
  3. Outfits - Saved combinations
  4. Profile - Insights and analytics

## 🔧 Troubleshooting

### Build Issues

**Problem**: Gradle build fails
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleDebug
```

**Problem**: "SDK location not found"
- Create `android/local.properties`:
  ```
  sdk.dir=C\:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
  ```

**Problem**: Metro bundler cache issues
```bash
npm start -- --clear
```

### Database Issues

**Problem**: App crashes on startup
- Check logs: `adb logcat | grep FitCheck`
- Database initialization errors usually show in logs

**Problem**: Data not persisting
- Verify migrations ran successfully
- Check `[InventoryStore]` logs in console

### Permissions Issues

**Problem**: Camera/photos not working
- Check app permissions in Android settings
- Reinstall app if permissions were denied

## 🔐 Privacy & Data

- **100% Local**: All data stored on-device in SQLite
- **No Tracking**: No analytics or telemetry
- **No Internet Required**: App works completely offline
- **Optional Cloud Sync**: Firebase integration available but disabled by default

## 🎯 Performance Targets

- **App Size**: <50MB
- **Memory Usage**: <200MB during normal operation
- **Outfit Generation**: <3 seconds for 50+ items
- **UI Frame Rate**: 60fps for all animations
- **Startup Time**: <2 seconds cold start

## 📝 Version History

### v1.0.0 (Current)
- ✅ SQLite database integration
- ✅ Offline-first architecture
- ✅ Complete stylist engine
- ✅ 4-tab navigation
- ✅ Image capture and upload
- ✅ Outfit generation and scoring
- ✅ Travel pack generator
- ✅ Profile insights

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

Private project - All rights reserved

## 🙋 Support

For issues or questions, check the logs:
```bash
# Android device logs
adb logcat | grep -E "FitCheck|InventoryStore|Database|Engine"

# Metro bundler logs
npm start
```

---

**Built with ❤️ using React Native, Expo, and SQLite**
