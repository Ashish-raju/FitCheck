import { FIREBASE_DB, FIREBASE_AUTH } from '../system/firebase/firebaseConfig';
import { UserProfileMeta } from '../engine/types';
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
        // New preferences
        comfortPrefs?: string[];
        fitPrefs?: string[];
        problemAreas?: string[];
    };
    // Profile Fields
    gender?: string;
    city?: string;
    height?: number; // in cm
    weight?: number; // in kg
    bodyType?: string;
    bodyConfidence?: number; // 0-10

    // Body Intelligence
    skinTone?: {
        undertone: string; // 'cool', 'warm', 'neutral'
        depth: string; // 'fair', 'medium', 'dark'
        contrast: string; // 'high', 'low'
    };
    palette?: {
        best: string[];
        avoid: string[];
    };
    /**
     * STYLIST ENGINE METADATA (New Engine)
     */
    stylistMeta?: UserProfileMeta;
}

export interface DerivedStats {
    wardrobeCount: number;
    outfitsSavedCount: number;
    streakCount: number;
    mostWornColor: string;
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

    /**
     * Get derived stats
     */
    public async getDerivedStats(uid: string): Promise<DerivedStats> {
        try {
            // 1. Get Wardrobe Data
            // Note: In a production app with thousands of items, we'd use aggregation queries or cloud functions.
            // For now, client-side aggregation is acceptable.
            const wardrobeSnapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .get();

            const wardrobeCount = wardrobeSnapshot.size;

            // Calculate most worn color
            const colorCounts: Record<string, number> = {};
            wardrobeSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.color) {
                    colorCounts[data.color] = (colorCounts[data.color] || 0) + 1;
                }
            });

            let mostWornColor = '#000000'; // Default
            let maxCount = 0;
            Object.entries(colorCounts).forEach(([color, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostWornColor = color;
                }
            });

            // 2. Get Outfits Data
            const outfitsSnapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('outfits')
                .get();

            const outfitsSavedCount = outfitsSnapshot.size;

            // 3. Streak (Mock implementation for now, or fetch from a 'stats' doc if it exists)
            // Real implementation would look at 'history' or 'logs' collection
            const streakCount = 3;

            return {
                wardrobeCount,
                outfitsSavedCount,
                streakCount,
                mostWornColor
            };
        } catch (error) {
            console.error('[UserService] Failed to derive stats:', error);
            // Return safe defaults
            return {
                wardrobeCount: 0,
                outfitsSavedCount: 0,
                streakCount: 0,
                mostWornColor: '#000000'
            };
        }
    }

    /**
     * Store new skin analysis payload
     */
    public async updateSkinAnalysis(uid: string, analysis: any): Promise<void> {
        return this.updateProfile(uid, {
            skinTone: analysis.skinTone,
            palette: analysis.palette
        });
    }

    /**
     * Store new body analysis payload
     */
    public async updateBodyAnalysis(uid: string, analysis: any): Promise<void> {
        return this.updateProfile(uid, {
            bodyType: analysis.bodyType,
            // other body metrics
        });
    }

    /**
     * Save Stylist Engine Metadata (Phase 3)
     */
    public async saveUserMeta(uid: string, meta: UserProfileMeta): Promise<void> {
        return this.updateProfile(uid, {
            stylistMeta: meta
        });
    }

    /**
     * Export user data appropriately
     */
    public async exportUserData(uid: string): Promise<any> {
        try {
            const profile = await this.getProfile(uid);
            const stats = await this.getDerivedStats(uid);

            // Get all wardrobe items
            const wardrobeSnapshot = await FIREBASE_DB.collection('users').doc(uid).collection('wardrobe').get();
            const wardrobe = wardrobeSnapshot.docs.map(doc => doc.data());

            // Get all outfits
            const outfitsSnapshot = await FIREBASE_DB.collection('users').doc(uid).collection('outfits').get();
            const outfits = outfitsSnapshot.docs.map(doc => doc.data());

            return {
                profile,
                stats,
                wardrobe,
                outfits,
                exportedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('[UserService] Failed to export data:', error);
            throw error;
        }
    }

    /**
     * Reset personalization (Clear weights & prefs)
     */
    public async resetPersonalization(uid: string): Promise<void> {
        try {
            await this.updateProfile(uid, {
                preferences: { // Clear prefs
                    stylePreferences: [],
                    comfortPrefs: [],
                    fitPrefs: [],
                    problemAreas: []
                },
                // Reset body model references
                bodyType: undefined,
                bodyConfidence: undefined,
                // Reset skin tone references
                skinTone: undefined,
                palette: undefined
            });
            console.log('[UserService] Personalization reset for:', uid);
        } catch (error) {
            console.error('[UserService] Failed to reset personalization:', error);
            throw error;
        }
    }

    /**
     * Delete account (Soft delete / Flagging)
     */
    public async deleteAccount(uid: string): Promise<void> {
        try {
            // Hard delete typically requires Cloud Functions to clean up subcollections.
            // For now, we'll mark as deleted.
            await this.updateProfile(uid, {
                // @ts-ignore - 'isDeleted' might not be in the stricter interface yet, but Firestore accepts it.
                isDeleted: true,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp()
            } as any);
            console.log('[UserService] Account marked for deletion:', uid);
        } catch (error) {
            console.error('[UserService] Failed to delete account:', error);
            throw error;
        }
    }
}
