import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import { Piece, PieceID } from '../../truth/types';
import { InventoryStore } from '../../state/inventory/inventoryStore';

/**
 * OutfitsRepo - Single source of truth for outfit data
 * 
 * Features:
 * - Firestore-backed with local cache
 * - Background sync for offline support
 * - Dynamic occasion extraction
 * - Optimistic updates
 */

export type Occasion = 'Office' | 'Formal' | 'Party' | 'Traditional' | 'Sportswear' | 'Swimwear' | 'Casual' | 'Date' | 'Travel';

export interface Outfit {
    id: string;
    userId: string;
    items: PieceID[]; // References to garments
    occasion: Occasion;
    score: number;
    scoreBreakdown?: {
        harmony: number;
        silhouette: number;
        layering: number;
        occasion: number;
        novelty: number;
    };
    source: 'sealed' | 'manual';
    isFavorite: boolean;
    name: string;
    createdAt: number;
    lastWorn?: number;
    timesWorn?: number;
    imageUri?: string; // Captured canvas image
    canvasState?: any; // Saved positions/scales/rotations
}

export interface CreateOutfitPayload {
    name: string;
    items: PieceID[];
    occasion: Occasion;
    score?: number;
    scoreBreakdown?: Outfit['scoreBreakdown'];
    source?: 'sealed' | 'manual';
    imageUri?: string;
    canvasState?: any;
}

interface ListOutfitsOptions {
    occasion?: string;
    isFavorite?: boolean;
    limit?: number;
}

const LOCAL_STORAGE_KEY = '@fit_check_outfits_v2';

export class OutfitsRepo {
    private static localCache: Record<string, Outfit> = {};
    private static isInitialized = false;

    /**
     * Initialize - loads from Firestore and syncs to local cache
     */
    static async initialize(userId: string): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Try to load from local storage first (instant)
            const localData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
            if (localData) {
                this.localCache = JSON.parse(localData);
                console.log('[OutfitsRepo] Loaded from local cache:', Object.keys(this.localCache).length);
            }

            // Then sync with Firestore (background)
            await this.syncFromFirestore(userId);

            this.isInitialized = true;
        } catch (error) {
            console.error('[OutfitsRepo] Initialize failed:', error);
        }
    }

    /**
     * Sync from Firestore to local cache
     */
    private static async syncFromFirestore(userId: string): Promise<void> {
        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('outfits')
                .get();

            const outfits: Record<string, Outfit> = {};
            snapshot.forEach(doc => {
                outfits[doc.id] = doc.data() as Outfit;
            });

            this.localCache = outfits;
            await this.saveToLocalStorage();

            console.log('[OutfitsRepo] Synced from Firestore:', Object.keys(outfits).length);
        } catch (error) {
            console.error('[OutfitsRepo] Sync from Firestore failed:', error);
        }
    }

    /**
     * Save local cache to AsyncStorage
     */
    private static async saveToLocalStorage(): Promise<void> {
        try {
            await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
        } catch (error) {
            console.error('[OutfitsRepo] Failed to save to local storage:', error);
        }
    }

    /**
     * List outfits with optional filtering
     */
    static async listOutfits(userId: string, options: ListOutfitsOptions = {}): Promise<Outfit[]> {
        await this.initialize(userId);

        let outfits = Object.values(this.localCache)
            .filter(o => o.userId === userId);

        // Apply filters
        if (options.occasion) {
            outfits = outfits.filter(o => o.occasion === options.occasion);
        }

        if (options.isFavorite !== undefined) {
            outfits = outfits.filter(o => o.isFavorite === options.isFavorite);
        }

        // Sort by createdAt descending
        outfits.sort((a, b) => b.createdAt - a.createdAt);

        // Apply limit
        if (options.limit) {
            outfits = outfits.slice(0, options.limit);
        }

        return outfits;
    }

    /**
     * Get a single outfit by ID
     */
    static async getOutfit(userId: string, outfitId: string): Promise<Outfit | null> {
        await this.initialize(userId);

        const outfit = this.localCache[outfitId];
        if (!outfit || outfit.userId !== userId) {
            return null;
        }

        return outfit;
    }

    /**
     * Create a new outfit
     */
    static async createOutfit(userId: string, payload: CreateOutfitPayload): Promise<Outfit> {
        await this.initialize(userId);

        const outfitId = `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const outfit: Outfit = {
            id: outfitId,
            userId,
            name: payload.name,
            items: payload.items,
            occasion: payload.occasion,
            score: payload.score || 0,
            scoreBreakdown: payload.scoreBreakdown,
            source: payload.source || 'manual',
            isFavorite: false,
            createdAt: Date.now(),
            imageUri: payload.imageUri,
            canvasState: payload.canvasState
        };

        // Update local cache immediately (optimistic)
        this.localCache[outfitId] = outfit;
        await this.saveToLocalStorage();

        // Background sync to Firestore
        this.syncToFirestore(userId, outfit).catch(err => {
            console.error('[OutfitsRepo] Failed to sync outfit to Firestore:', err);
        });

        console.log('[OutfitsRepo] Outfit created:', outfitId);
        return outfit;
    }

    /**
     * Update an outfit
     */
    static async updateOutfit(userId: string, outfitId: string, patch: Partial<Outfit>): Promise<void> {
        await this.initialize(userId);

        const outfit = this.localCache[outfitId];
        if (!outfit || outfit.userId !== userId) {
            throw new Error('Outfit not found');
        }

        // Update local cache
        this.localCache[outfitId] = { ...outfit, ...patch };
        await this.saveToLocalStorage();

        // Background sync to Firestore
        this.syncToFirestore(userId, this.localCache[outfitId]).catch(err => {
            console.error('[OutfitsRepo] Failed to sync outfit update to Firestore:', err);
        });

        console.log('[OutfitsRepo] Outfit updated:', outfitId);
    }

    /**
     * Delete an outfit
     */
    static async deleteOutfit(userId: string, outfitId: string): Promise<void> {
        await this.initialize(userId);

        // Remove from local cache
        delete this.localCache[outfitId];
        await this.saveToLocalStorage();

        // Delete from Firestore
        try {
            await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('outfits')
                .doc(outfitId)
                .delete();

            console.log('[OutfitsRepo] Outfit deleted:', outfitId);
        } catch (error) {
            console.error('[OutfitsRepo] Failed to delete outfit from Firestore:', error);
        }
    }

    /**
     * Toggle favorite status
     */
    static async toggleFavorite(userId: string, outfitId: string): Promise<void> {
        const outfit = await this.getOutfit(userId, outfitId);
        if (!outfit) {
            throw new Error('Outfit not found');
        }

        await this.updateOutfit(userId, outfitId, {
            isFavorite: !outfit.isFavorite
        });
    }

    /**
     * Log outfit as worn
     */
    static async logWorn(userId: string, outfitId: string): Promise<void> {
        const outfit = await this.getOutfit(userId, outfitId);
        if (!outfit) {
            throw new Error('Outfit not found');
        }

        await this.updateOutfit(userId, outfitId, {
            timesWorn: (outfit.timesWorn || 0) + 1,
            lastWorn: Date.now()
        });

        // Also mark individual garments as worn
        const inventoryStore = InventoryStore.getInstance();
        for (const itemId of outfit.items) {
            try {
                await inventoryStore.markAsWorn(itemId);
            } catch (err) {
                console.error('[OutfitsRepo] Failed to mark garment as worn:', itemId, err);
            }
        }

        console.log('[OutfitsRepo] Outfit logged as worn:', outfitId);
    }

    /**
     * Get unique occasions from user's outfits (dynamic)
     */
    static async getOccasions(userId: string): Promise<string[]> {
        const outfits = await this.listOutfits(userId);
        const occasions = new Set<string>();

        outfits.forEach(outfit => {
            occasions.add(outfit.occasion);
        });

        return Array.from(occasions).sort();
    }

    /**
     * Get outfit count
     */
    static async getCount(userId: string): Promise<number> {
        const outfits = await this.listOutfits(userId);
        return outfits.length;
    }

    /**
     * Sync a single outfit to Firestore
     */
    private static async syncToFirestore(userId: string, outfit: Outfit): Promise<void> {
        try {
            await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('outfits')
                .doc(outfit.id)
                .set({
                    ...outfit,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
        } catch (error) {
            console.error('[OutfitsRepo] Sync to Firestore failed:', error);
            throw error;
        }
    }

    /**
     * Force refresh from Firestore
     */
    static async refresh(userId: string): Promise<void> {
        await this.syncFromFirestore(userId);
    }

    /**
     * Clear local cache (useful for logout)
     */
    static clearCache(): void {
        this.localCache = {};
        this.isInitialized = false;
        AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
        console.log('[OutfitsRepo] Cache cleared');
    }
}
