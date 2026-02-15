import 'dotenv/config'; // Ensure .env is loaded

export default {
    expo: {
        name: "Fit Check",
        slug: "fit-check",
        version: "0.7.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#0A0A0B"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.ashishraju.fitcheck"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            package: "com.ashish_raju1605.FirewallHost",
            versionCode: 2,
            permissions: [
                "CAMERA",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE",
                "READ_MEDIA_IMAGES"
            ],
            minSdkVersion: 29,
            targetSdkVersion: 34,
            compileSdkVersion: 34
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            [
                "expo-camera",
                {
                    "cameraPermission": "Allow FitCheck to access your camera to capture clothing photos"
                }
            ],
            [
                "expo-image-picker",
                {
                    "photosPermission": "Allow FitCheck to access your photos to upload clothing items"
                }
            ]
        ],
        extra: {
            // Securely read from environment variables
            googleVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || process.env.GOOGLE_VISION_API_KEY,
            openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
            eas: {
                "projectId": "fit-check-android"
            }
        }
    }
};
