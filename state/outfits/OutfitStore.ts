import { Piece, PieceID } from '../../truth/types';
import { InventoryStore } from '../inventory/inventoryStore';
import { outfitRepository, type Outfit as DBOutfit } from '../../database/repositories/OutfitRepository';

export type Occasion = 'Office' | 'Formal' | 'Party' | 'Traditional' | 'Sportswear' | 'Swimwear' | 'Casual' | 'Date' | 'Travel';

export const OUTFIT_OCCASIONS: Occasion[] = ['Office', 'Formal', 'Party', 'Traditional', 'Sportswear', 'Swimwear', 'Casual', 'Date', 'Travel'];

export interface Outfit {
    id: string;
    items: PieceID[]; // References to pieces in InventoryStore
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
    canvasState?: any; // Saved position/scale/rotation of items
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

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('[OutfitStore] Loading outfits from SQLite...');
            await this.loadOutfits();
            console.log('[OutfitStore] Loaded:', Object.keys(this.outfits).length, 'outfits');
        } catch (e) {
            console.error('[OutfitStore] Failed to load outfits:', e);
            this.outfits = {};
        } finally {
            this.isInitialized = true;
        }
    }

    /**
     * Load all outfits from SQLite
     */
    private async loadOutfits(): Promise<void> {
        const dbOutfits = await outfitRepository.getAll();
        this.outfits = {};
        dbOutfits.forEach(dbOutfit => {
            this.outfits[dbOutfit.id] = this.fromDBOutfit(dbOutfit);
        });
    }

    /**
     * Refresh from database
     */
    public async refresh(): Promise<void> {
        await this.loadOutfits();
    }

    /**
     * Convert DB outfit to app outfit
     */
    private fromDBOutfit(dbOutfit: DBOutfit): Outfit {
        return {
            id: dbOutfit.id,
            items: dbOutfit.garmentIds as PieceID[],
            occasion: (dbOutfit.eventType as Occasion) || 'Casual',
            score: dbOutfit.overallScore || 0,
            scoreBreakdown: dbOutfit.harmonyScore ? {
                harmony: dbOutfit.harmonyScore,
                silhouette: dbOutfit.contextScore || 0,
                layering: 0,
                occasion: dbOutfit.styleScore || 0,
                novelty: 0,
            } : undefined,
            source: 'sealed',
            isFavorite: dbOutfit.isFavorite || false,
            name: dbOutfit.name || 'Untitled Outfit',
            createdAt: dbOutfit.createdAt,
            lastWorn: dbOutfit.lastWorn,
            timesWorn: dbOutfit.wearCount,
        };
    }

    /**
     * Convert app outfit to DB outfit
     */
    private toDBOutfit(outfit: Outfit): DBOutfit {
        return {
            id: outfit.id,
            name: outfit.name,
            garmentIds: outfit.items,
            eventType: outfit.occasion,
            overallScore: outfit.score,
            harmonyScore: outfit.scoreBreakdown?.harmony,
            contextScore: outfit.scoreBreakdown?.silhouette,
            styleScore: outfit.scoreBreakdown?.occasion,
            isFavorite: outfit.isFavorite,
            wearCount: outfit.timesWorn || 0,
            lastWorn: outfit.lastWorn,
            createdAt: outfit.createdAt,
            updatedAt: Date.now(),
        };
    }

    public getOutfits(): Outfit[] {
        return Object.values(this.outfits).sort((a, b) => b.createdAt - a.createdAt);
    }

    public getOutfit(id: string): Outfit | undefined {
        return this.outfits[id];
    }

    public async saveOutfit(outfit: Outfit): Promise<void> {
        // Save to SQLite
        const dbOutfit = this.toDBOutfit(outfit);
        await outfitRepository.save(dbOutfit);

        // Update in-memory
        this.outfits[outfit.id] = outfit;
    }

    public async deleteOutfit(id: string): Promise<void> {
        if (this.outfits[id]) {
            // Delete from SQLite
            await outfitRepository.delete(id);

            // Delete from in-memory
            delete this.outfits[id];
        }
    }

    public async toggleFavorite(id: string): Promise<void> {
        const outfit = this.outfits[id];
        if (outfit) {
            outfit.isFavorite = !outfit.isFavorite;

            // Update in SQLite
            await outfitRepository.toggleFavorite(id);
        }
    }

    public async logWorn(id: string): Promise<void> {
        const outfit = this.outfits[id];
        if (outfit) {
            outfit.timesWorn = (outfit.timesWorn || 0) + 1;
            outfit.lastWorn = Date.now();

            // Update in SQLite
            await outfitRepository.markAsWorn(id);

            // Mark individual items as worn
            const inventory = InventoryStore.getInstance();
            for (const itemId of outfit.items) {
                await inventory.markAsWorn(itemId);
            }
        }
    }
}

