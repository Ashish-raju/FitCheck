import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Fit Check',
    slug: 'fit-check',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#0A0A0B',
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.fitcheck.app',
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
        edgeToEdgeEnabled: true,
        package: 'com.ashish_raju1605.FirewallHost',
    },
    web: {
        favicon: './assets/favicon.png',
    },
    extra: {
        firebase: firebaseConfig,
        eas: {
            projectId: process.env.EAS_PROJECT_ID || '',
        },
    },
    plugins: [
        'expo-font',
        'expo-camera',
        'expo-image-picker',
    ],
});
