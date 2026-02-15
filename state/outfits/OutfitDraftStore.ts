import { InventoryStore } from '../inventory/inventoryStore';
import { OutfitStore } from './OutfitStore';
import { Piece, PieceID } from '../../truth/types';

export type DraftMode = 'create' | 'edit';

export interface DraftState {
    mode: DraftMode;
    targetOutfitId: string | null;
    items: (Piece | null)[];
    occasion: string;
    totalSlots: number;
    canvasState: any | null; // Stores item positions for recovery
}

const DEFAULT_STATE: DraftState = {
    mode: 'create',
    targetOutfitId: null,
    items: [null, null, null, null],
    occasion: 'Casual',
    totalSlots: 4,
    canvasState: null,
};

export class OutfitDraftStore {
    private static instance: OutfitDraftStore;

    // The transient state
    public state: DraftState;

    private constructor() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }

    public static getInstance(): OutfitDraftStore {
        if (!OutfitDraftStore.instance) {
            OutfitDraftStore.instance = new OutfitDraftStore();
        }
        return OutfitDraftStore.instance;
    }

    // --- ACTIONS ---

    public startNewDraft() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        console.log('[DraftStore] New draft started.');
    }

    public loadDraft(outfitId: string) {
        const outfit = OutfitStore.getInstance().getOutfit(outfitId);
        if (!outfit) {
            console.error(`[DraftStore] Failed to load outfit ${outfitId}`);
            return;
        }

        const inventory = InventoryStore.getInstance();

        // FAILSAFE: Load Mocks directly in case InventoryStore is cold
        const { MOCK_PIECES } = require('../../assets/mock-data/mockPieces');

        const loadedItems = outfit.items
            .map(id => {
                let piece = inventory.getPiece(id);
                if (!piece) {
                    // Try to find in Mocks
                    const foundMock = MOCK_PIECES.find((p: Piece) => p.id === id);
                    if (foundMock) {
                        // Clone it to ensure we don't mutate reference
                        piece = { ...foundMock };
                        console.log(`[DraftStore] Found ${id} in Mocks.`);
                    }
                } else {
                    console.log(`[DraftStore] Found ${id} in Inventory.`);
                }

                if (!piece) {
                    console.warn(`[DraftStore] Item ${id} NOT FOUND in Inventory or Mocks.`);
                }
                return piece;
            })
            .filter((p): p is Piece => !!p);

        console.log(`[DraftStore] Total items loaded: ${loadedItems.length} from IDs: ${outfit.items.join(', ')}`);

        // Pad with nulls to fill 4 slots minimum if needed (though for Canvas direct edit, we care more about exact items)
        const items = [...loadedItems, ...Array(Math.max(0, 4 - loadedItems.length)).fill(null)];

        this.state = {
            mode: 'edit',
            targetOutfitId: outfitId,
            items: items,
            occasion: outfit.occasion,
            totalSlots: Math.max(4, loadedItems.length),
            canvasState: outfit.canvasState || null, // Load saved positions
        };
        console.log(`[DraftStore] Draft loaded for editing: ${outfitId}`);
    }

    public updateItems(items: (Piece | null)[]) {
        this.state.items = items;
    }

    public updateOccasion(occasion: string) {
        this.state.occasion = occasion;
    }

    public updateTotalSlots(count: number) {
        this.state.totalSlots = count;
    }

    /**
     * Commits the current draft to the permanent OutfitStore.
     * @param imageUri The captured image of the canvas
     * @param canvasState Optional JSON object representing item positions
     */
    public async commit(imageUri: string, canvasState?: any): Promise<string> {
        const filledItems = this.state.items.filter(i => i !== null) as Piece[];
        const itemIds = filledItems.map(i => i.id);

        let finalId = this.state.targetOutfitId;
        let existingOutfit = finalId ? OutfitStore.getInstance().getOutfit(finalId) : null;

        if (!finalId) {
            // New Creation
            finalId = `styled_${Date.now()}`;
        }

        try {
            await OutfitStore.getInstance().saveOutfit({
                id: finalId,
                items: itemIds,
                occasion: this.state.occasion as any,
                score: existingOutfit ? existingOutfit.score : 0,
                source: 'manual',
                isFavorite: existingOutfit ? existingOutfit.isFavorite : false,
                name: existingOutfit ? existingOutfit.name : `${this.state.occasion} Style`,
                createdAt: existingOutfit ? existingOutfit.createdAt : Date.now(),
                imageUri: imageUri,
                canvasState: canvasState // Save positions!
            });
        } catch (err) {
            console.error('[DraftStore] Error calling OutfitStore.saveOutfit:', err);
            throw err;
        }

        console.log(`[DraftStore] Committed draft to ${finalId}`);
        return finalId;
    }

    // Helpers
    public getFilledItems(): Piece[] {
        return this.state.items.filter(i => i !== null) as Piece[];
    }
}
