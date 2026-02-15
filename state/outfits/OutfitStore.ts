import { Piece, PieceID } from '../../truth/types';
import { InventoryStore } from '../inventory/inventoryStore';
import { OutfitsRepo, Outfit as RepoOutfit, Occasion } from '../../data/repos/outfitsRepo';
import { FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';

export { Occasion };
export const OUTFIT_OCCASIONS: Occasion[] = ['Office', 'Formal', 'Party', 'Traditional', 'Sportswear', 'Swimwear', 'Casual', 'Date', 'Travel'];

export interface Outfit extends RepoOutfit {
    // Retaining compatibility with existing OutfitStore interface if needed,
    // but RepoOutfit covers all fields used in the app.
}

export class OutfitStore {
    private static instance: OutfitStore;
    private outfits: Record<string, Outfit> = {};
    private isInitialized: boolean = false;

    private constructor() { }

    public static getInstance(): OutfitStore {
        if (!OutfitStore.instance) {
            OutfitStore.instance = new OutfitStore();
        }
        return OutfitStore.instance;
    }

    private getUserId(): string | null {
        return FIREBASE_AUTH.currentUser?.uid || null;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        const userId = this.getUserId() || 'guest';
        if (!userId) {
            console.log('[OutfitStore] No user, skipping load.');
            return;
        }

        try {
            console.log('[OutfitStore] Loading outfits from OutfitsRepo (Firestore/Local)...');
            await this.loadOutfits(userId);
        } catch (e) {
            console.error('[OutfitStore] Failed to load outfits:', e);
            this.outfits = {};
        } finally {
            this.isInitialized = true;
        }
    }

    /**
     * Load all outfits from Repo
     */
    private async loadOutfits(userId: string): Promise<void> {
        const repoOutfits = await OutfitsRepo.listOutfits(userId);
        this.outfits = {};
        repoOutfits.forEach(outfit => {
            this.outfits[outfit.id] = outfit;
        });
        console.log('[OutfitStore] Loaded:', Object.keys(this.outfits).length, 'outfits');
    }

    /**
     * Refresh from database
     */
    public async refresh(): Promise<void> {
        const userId = this.getUserId();
        if (userId) {
            await this.loadOutfits(userId);
        }
    }

    public getOutfits(): Outfit[] {
        return Object.values(this.outfits).sort((a, b) => b.createdAt - a.createdAt);
    }

    public getOutfit(id: string): Outfit | undefined {
        return this.outfits[id];
    }

    public async saveOutfit(outfitData: Omit<Outfit, 'userId'> & { userId?: string }): Promise<void> {
        const userId = this.getUserId() || 'guest';
        // if (!userId) throw new Error('User not authenticated');

        // Ensure userId is strictly set from Auth
        const outfit: Outfit = { ...outfitData, userId };

        console.log('[OutfitStore] Saving outfit via OutfitsRepo:', outfit.id);

        if (this.outfits[outfit.id]) {
            // Update
            await OutfitsRepo.updateOutfit(userId, outfit.id, outfit);
        } else {
            // Create
            await OutfitsRepo.createOutfit(userId, {
                id: outfit.id,
                name: outfit.name,
                items: outfit.items,
                occasion: outfit.occasion,
                score: outfit.score,
                scoreBreakdown: outfit.scoreBreakdown,
                source: outfit.source,
                imageUri: outfit.imageUri,
                canvasState: outfit.canvasState
            });
        }

        // Update in-memory to reflect changes immediately
        this.outfits[outfit.id] = outfit;
    }

    public async deleteOutfit(id: string): Promise<void> {
        const userId = this.getUserId();
        if (!userId) return;

        console.log('[OutfitStore] Deleting outfit:', id);

        if (this.outfits[id]) {
            // Delete from Repo
            await OutfitsRepo.deleteOutfit(userId, id);

            // Delete from in-memory
            delete this.outfits[id];
        }
    }

    public async toggleFavorite(id: string): Promise<void> {
        const userId = this.getUserId();
        if (!userId) return;

        const outfit = this.outfits[id];
        if (outfit) {
            // Optimistic update
            outfit.isFavorite = !outfit.isFavorite;

            // Update in Repo
            await OutfitsRepo.toggleFavorite(userId, id);
        }
    }

    public async logWorn(id: string): Promise<void> {
        const userId = this.getUserId();
        if (!userId) return;

        const outfit = this.outfits[id];
        if (outfit) {
            // Optimistic update
            outfit.timesWorn = (outfit.timesWorn || 0) + 1;
            outfit.lastWorn = Date.now();

            // Update in Repo (also updates inventory wear counts)
            await OutfitsRepo.logWorn(userId, id);
        }
    }
}
