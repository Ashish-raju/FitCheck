import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import Constants from 'expo-constants';

// Get Firebase config from app.config.ts extra field
const firebaseConfig = Constants.expoConfig?.extra?.firebase || {
    apiKey: "AIzaSyBPondZnMTKKSB-ynrDkw9EJYWSmcjN1PM",
    authDomain: "invisible-wardrobe.firebaseapp.com",
    projectId: "invisible-wardrobe",
    storageBucket: "invisible-wardrobe.firebasestorage.app",
    messagingSenderId: "1039868372386",
    appId: "1:1039868372386:web:40f6a9aa05fa2b847ffefb",
    measurementId: "G-BGJ7R8WJ7W"
};

// Development mode check
const __DEV__ = process.env.NODE_ENV === 'development';
const USE_EMULATORS = __DEV__ && false; // Set to true to use local emulators

// Initialize Firebase App
const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Get services
const auth = firebase.auth(app);
const db = firebase.firestore(app);
const storage = firebase.storage(app);

// Enable persistence for auth (automatic with compat SDK)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Connect to emulators in development (if enabled)
if (USE_EMULATORS) {
    const EMULATOR_HOST = 'localhost'; // Change to your machine IP for physical device testing

    try {
        auth.useEmulator(`http://${EMULATOR_HOST}:9099`);
        db.useEmulator(EMULATOR_HOST, 8080);
        storage.useEmulator(EMULATOR_HOST, 9199);
        console.log('[Firebase] Connected to emulators');
    } catch (e) {
        console.warn('[Firebase] Emulator connection failed:', e);
    }
}

console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = auth;
export const FIREBASE_DB = db;
export const FIREBASE_STORAGE = storage;
