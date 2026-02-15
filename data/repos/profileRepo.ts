import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_DB } from '../../system/firebase/firebaseConfig';
import { WardrobeRepo } from './wardrobeRepo';
import { OutfitsRepo } from './outfitsRepo';
import { Piece } from '../../truth/types';

// Re-export types for backward compatibility
import { UserProfile, UserPreferences, SkinTone, ColorPalette, DerivedStats, WardrobeInsights } from '../../truth/types';
export { UserProfile, UserPreferences, SkinTone, ColorPalette, DerivedStats, WardrobeInsights };

/**
 * ProfileRepo - Single source of truth for user profile data and computed stats
 * 
 * Features:
 * - User profile CRUD
 * - Computed stats (wardrobeCount, outfitsCount, streak)
 * - Wardrobe insights and analytics
 * - Body data and color palette management
 */

interface CachedData<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class ProfileRepo {
    private static cache = new Map<string, CachedData<any>>();

    /**
     * Get user profile
     */
    static async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const cacheKey = `profile_${userId}`;
            const cached = this.getFromCache<UserProfile>(cacheKey);

            if (cached) {
                console.log('[ProfileRepo] Cache hit for getProfile');
                return cached;
            }

            if (userId.startsWith('demo_')) {
                const localProfile = await AsyncStorage.getItem(`profile_blob_${userId}`);
                if (localProfile) {
                    const profile = JSON.parse(localProfile);
                    this.setCache(cacheKey, profile);
                    return profile;
                }
                return null;
            }

            const doc = await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('profile')
                .doc('data')
                .get();

            if (!doc.exists) {
                console.warn('[ProfileRepo] Profile not found for user:', userId);
                return null;
            }

            const profile = doc.data() as UserProfile;
            this.setCache(cacheKey, profile);
            return profile;
        } catch (error) {
            console.error('[ProfileRepo] Failed to get profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, patch: Partial<UserProfile>): Promise<void> {
        try {
            if (userId.startsWith('demo_')) {
                const existing = await this.getProfile(userId) || {};
                const updated = { ...existing, ...patch, updatedAt: new Date() };
                await AsyncStorage.setItem(`profile_blob_${userId}`, JSON.stringify(updated));
                this.invalidateCache(userId);
                console.log('[ProfileRepo] Profile updated locally for:', userId);
                return;
            }

            await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('profile')
                .doc('data')
                .set({
                    ...patch,
                    updatedAt: new Date()
                }, { merge: true });

            this.invalidateCache(userId);
            console.log('[ProfileRepo] Profile updated for user:', userId);
        } catch (error) {
            console.error('[ProfileRepo] Failed to update profile:', error);
            throw error;
        }
    }

    /**
     * Get computed stats
     */
    static async getStats(userId: string): Promise<DerivedStats> {
        const cacheKey = `stats_${userId}`;
        const cached = this.getFromCache<DerivedStats>(cacheKey);

        if (cached) {
            console.log('[ProfileRepo] Cache hit for getStats');
            return cached;
        }

        try {
            // Compute real stats from data sources
            const [wardrobeCount, outfitsSavedCount] = await Promise.all([
                WardrobeRepo.getCount(userId),
                OutfitsRepo.getCount(userId)
            ]);

            // Get streak from seal history
            const streakCount = await this.computeStreak(userId);

            // Get most worn color
            const mostWornColor = await this.computeMostWornColor(userId);

            // Get last sealed timestamp
            const lastSealedAt = await this.getLastSealedTimestamp(userId);

            const stats: DerivedStats = {
                wardrobeCount,
                outfitsSavedCount,
                streakCount,
                mostWornColor,
                lastSealedAt
            };

            this.setCache(cacheKey, stats);
            return stats;
        } catch (error) {
            console.error('[ProfileRepo] Failed to get stats:', error);
            // Return defaults on error
            return {
                wardrobeCount: 0,
                outfitsSavedCount: 0,
                streakCount: 0
            };
        }
    }

    /**
     * Get wardrobe insights
     */
    static async getInsights(userId: string): Promise<WardrobeInsights> {
        const cacheKey = `insights_${userId}`;
        const cached = this.getFromCache<WardrobeInsights>(cacheKey);

        if (cached) {
            console.log('[ProfileRepo] Cache hit for getInsights');
            return cached;
        }

        try {
            const garments = await WardrobeRepo.listGarments(userId, {});

            // Compute underused items (low wear count relative to age)
            const underusedItems = garments
                .filter(g => {
                    const wearCount = g.wearHistory?.length || 0;
                    const ageInDays = g.dateAdded ? (Date.now() - g.dateAdded) / (1000 * 60 * 60 * 24) : 0;
                    return ageInDays > 30 && wearCount < 3;
                })
                .slice(0, 8);

            // Compute versatile items (high wear count, appears in multiple outfits)
            const versatileItems = garments
                .filter(g => (g.wearHistory?.length || 0) > 5)
                .sort((a, b) => (b.wearHistory?.length || 0) - (a.wearHistory?.length || 0))
                .slice(0, 8);

            // Color distribution
            const colorMap = new Map<string, number>();
            garments.forEach(g => {
                if (g.color) {
                    colorMap.set(g.color, (colorMap.get(g.color) || 0) + 1);
                }
            });
            const colorDistribution = Array.from(colorMap.entries())
                .map(([color, count]) => ({ color, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Health score (placeholder logic - can be enhanced)
            const coverage = this.computeCoverage(garments);
            const diversity = colorDistribution.length / 10 * 100; // More colors = more diversity
            const freshness = (garments.filter(g => {
                const ageInDays = g.dateAdded ? (Date.now() - g.dateAdded) / (1000 * 60 * 60 * 24) : 999;
                return ageInDays < 90;
            }).length / garments.length) * 100;

            const healthScore = Math.round((coverage + diversity + freshness) / 3);

            const insights: WardrobeInsights = {
                underusedItems,
                versatileItems,
                colorDistribution,
                healthScore,
                healthBreakdown: {
                    coverage: Math.round(coverage),
                    diversity: Math.round(diversity),
                    freshness: Math.round(freshness)
                }
            };

            this.setCache(cacheKey, insights);
            return insights;
        } catch (error) {
            console.error('[ProfileRepo] Failed to get insights:', error);
            // Return empty insights on error
            return {
                underusedItems: [],
                versatileItems: [],
                colorDistribution: [],
                healthScore: 0
            };
        }
    }

    /**
     * Update body data
     */
    static async updateBodyData(userId: string, data: {
        bodyType?: UserProfile['bodyType'];
        skinTone?: SkinTone;
        measurements?: any;
    }): Promise<void> {
        await this.updateProfile(userId, data);
    }

    /**
     * Update color palette
     */
    static async updatePalette(userId: string, palette: ColorPalette): Promise<void> {
        await this.updateProfile(userId, { palette });
    }

    /**
     * Update preferences
     */
    static async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
        const profile = await this.getProfile(userId);
        const updatedPrefs = {
            ...profile?.preferences,
            ...prefs
        };
        await this.updateProfile(userId, { preferences: updatedPrefs });
    }

    // ==================== Helper Methods ====================

    /**
     * Compute streak from seal history
     */
    private static async computeStreak(userId: string): Promise<number> {
        if (userId.startsWith('demo_')) return 5; // Fake streak for demo

        try {
            // Query seal history from Firestore
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('sealHistory')
                .orderBy('timestamp', 'desc')
                .limit(30)
                .get();

            if (snapshot.empty) {
                return 0;
            }

            // Check for consecutive days
            const seals = snapshot.docs.map(doc => doc.data().timestamp);
            let streak = 1;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < seals.length - 1; i++) {
                const currentDate = new Date(seals[i]);
                const prevDate = new Date(seals[i + 1]);
                currentDate.setHours(0, 0, 0, 0);
                prevDate.setHours(0, 0, 0, 0);

                const diffInDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

                if (diffInDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }

            return streak;
        } catch (error) {
            console.error('[ProfileRepo] Failed to compute streak:', error);
            return 0;
        }
    }

    /**
     * Compute most worn color
     */
    private static async computeMostWornColor(userId: string): Promise<string | undefined> {
        try {
            const garments = await WardrobeRepo.listGarments(userId, {});
            const colorWearCount = new Map<string, number>();

            garments.forEach(g => {
                if (g.color) {
                    const wearCount = g.wearHistory?.length || 0;
                    colorWearCount.set(g.color, (colorWearCount.get(g.color) || 0) + wearCount);
                }
            });

            if (colorWearCount.size === 0) {
                return undefined;
            }

            const [mostWornColor] = Array.from(colorWearCount.entries())
                .sort((a, b) => b[1] - a[1]);

            return mostWornColor[0];
        } catch (error) {
            console.error('[ProfileRepo] Failed to compute most worn color:', error);
            return undefined;
        }
    }

    /**
     * Get last sealed timestamp
     */
    private static async getLastSealedTimestamp(userId: string): Promise<number | undefined> {
        if (userId.startsWith('demo_')) return Date.now() - 86400000; // Yesterday

        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('sealHistory')
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();

            if (snapshot.empty) {
                return undefined;
            }

            return snapshot.docs[0].data().timestamp;
        } catch (error) {
            console.error('[ProfileRepo] Failed to get last sealed timestamp:', error);
            return undefined;
        }
    }

    /**
     * Compute wardrobe coverage (has basics in each category)
     */
    private static computeCoverage(garments: Piece[]): number {
        const requiredCategories = ['Top', 'Bottom', 'Shoes', 'Outerwear'];
        const presentCategories = new Set(garments.map(g => g.category).filter(Boolean) as string[]);

        const coverage = requiredCategories.filter(cat => presentCategories.has(cat as any)).length;
        return (coverage / requiredCategories.length) * 100;
    }

    // ==================== Cache Management ====================

    private static getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    private static setCache<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private static invalidateCache(userId: string): void {
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
            if (key.includes(userId)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log('[ProfileRepo] Cache invalidated for user:', userId);
    }

    static clearCache(): void {
        this.cache.clear();
        console.log('[ProfileRepo] All cache cleared');
    }
}
