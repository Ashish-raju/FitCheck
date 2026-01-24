import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get these from: Firebase Console -> Project Settings -> General -> Your apps -> SDK Setup/Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPondZnMTKKSB-ynrDkw9EJYWSmcjN1PM",
    authDomain: "invisible-wardrobe.firebaseapp.com",
    projectId: "invisible-wardrobe",
    storageBucket: "invisible-wardrobe.firebasestorage.app",
    messagingSenderId: "1039868372386",
    appId: "1:1039868372386:web:40f6a9aa05fa2b847ffefb",
    measurementId: "G-BGJ7R8WJ7W"
};

// Initialize Firebase App via Compat (ensures component registration)
const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Initialize Auth with persistence for React Native via Modular API
let auth;
try {
    // We try modular initialization as the primary
    auth = initializeAuth(app as any, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (e) {
    // Fallback to existing auth if already initialized
    auth = getAuth(app as any);
}

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = auth;
export const FIREBASE_DB = getFirestore(app as any);
export const FIREBASE_STORAGE = getStorage(app as any);
