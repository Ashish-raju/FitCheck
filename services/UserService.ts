import { FIREBASE_DB, FIREBASE_AUTH } from '../system/firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: any;
    updatedAt: any;
    preferences?: {
        maxUses?: number;
        stylePreferences?: string[];
    };
}

export class UserService {
    private static instance: UserService;

    private constructor() { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Create a new user profile
     */
    public async createProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        try {
            const profileData: UserProfile = {
                uid,
                email: data.email || '',
                displayName: data.displayName || '',
                photoURL: data.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: data.preferences || {},
            };

            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .set(profileData);

            console.log('[UserService] Profile created:', uid);
        } catch (error) {
            console.error('[UserService] Failed to create profile:', error);
            throw error;
        }
    }

    /**
     * Get user profile
     */
    public async getProfile(uid: string): Promise<UserProfile | null> {
        try {
            const doc = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .get();

            if (!doc.exists) {
                return null;
            }

            return doc.data() as UserProfile;
        } catch (error) {
            console.error('[UserService] Failed to get profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    public async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .update(updateData);

            console.log('[UserService] Profile updated:', uid);
        } catch (error) {
            console.error('[UserService] Failed to update profile:', error);
            throw error;
        }
    }

    /**
     * Subscribe to profile changes
     */
    public subscribeToProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
        const unsubscribe = FIREBASE_DB
            .collection('users')
            .doc(uid)
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        callback(doc.data() as UserProfile);
                    } else {
                        callback(null);
                    }
                },
                (error) => {
                    console.error('[UserService] Subscription error:', error);
                    callback(null);
                }
            );

        return unsubscribe;
    }
}
