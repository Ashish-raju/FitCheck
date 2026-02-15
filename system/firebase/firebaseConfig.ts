import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import Constants from 'expo-constants';

// Get Firebase config from App Config (env vars)
const appConfig = Constants.expoConfig?.extra?.firebase;

const isValidConfig =
    appConfig &&
    appConfig.apiKey && appConfig.apiKey.length > 0 &&
    appConfig.authDomain && appConfig.authDomain.length > 0 &&
    appConfig.projectId && appConfig.projectId.length > 0 &&
    appConfig.appId && appConfig.appId.length > 0;

if (isValidConfig) {
    console.log('[FirebaseConfig] 🟢 Using Environment Configuration');
    console.log(`[FirebaseConfig] Project: ${appConfig.projectId}`);
} else {
    console.log('[FirebaseConfig] 🟡 Environment Config Invalid or Missing - Using Fallback');
}

// Fallback Configuration (Known Good)
const fallbackConfig = {
    apiKey: "AIzaSyBPondZnMTKKSB-ynrDkw9EJYWSmcjN1PM",
    authDomain: "invisible-wardrobe.firebaseapp.com",
    projectId: "invisible-wardrobe",
    storageBucket: "invisible-wardrobe.firebasestorage.app",
    messagingSenderId: "1039868372386",
    appId: "1:1039868372386:web:40f6a9aa05fa2b847ffefb",
    measurementId: "G-BGJ7R8WJ7W"
};

// Use explicit configuration
const firebaseConfig = isValidConfig ? appConfig : fallbackConfig;

// Initialize Firebase App
let app: firebase.app.App;

if (firebase.apps.length > 0) {
    app = firebase.app(); // Use default
    console.log('[FirebaseConfig] ♻️  Reusing existing Firebase App instance');
} else {
    app = firebase.initializeApp(firebaseConfig);
    console.log('[FirebaseConfig] 🚀 Initialized new Firebase App instance');
}

// Get services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Emulators
const __DEV__ = process.env.NODE_ENV === 'development';
const USE_EMULATORS = __DEV__ && false; // Set true to enable

if (USE_EMULATORS) {
    const EMULATOR_HOST = 'localhost';
    try {
        auth.useEmulator(`http://${EMULATOR_HOST}:9099`);
        db.useEmulator(EMULATOR_HOST, 8080);
        storage.useEmulator(EMULATOR_HOST, 9199);
        console.log('[FirebaseConfig] Connected to emulators');
    } catch (e) {
        console.warn('[FirebaseConfig] Emulator connection failed:', e);
    }
}

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = auth;
export const FIREBASE_DB = db;
export const FIREBASE_STORAGE = storage;
