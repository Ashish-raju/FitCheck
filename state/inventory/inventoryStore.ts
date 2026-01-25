import AsyncStorage from '@react-native-async-storage/async-storage';
import { Piece, PieceID, Inventory } from "../../truth/types";
import { INITIAL_INVENTORY } from "./initialInventory";
import { CloudStore } from "../../system/firebase/CloudStore";
// MOCK_PIECES imported dynamically in seedMockData() to avoid blocking main thread

const STORAGE_KEY = '@fit_check_inventory_v3'; // Bump version to clear old data with wrong labels

export class InventoryStore {
    private static instance: InventoryStore;
    private inventory: Inventory;
    private globalMaxUses: number = 3;
    private isInitialized: boolean = false;
    private lockedOutfitId: string | null = null;
    private lastSealTime: number | null = null;
    private cloud: CloudStore;

    private constructor() {
        this.inventory = { ...INITIAL_INVENTORY };
        this.cloud = CloudStore.getInstance();
    }

    public static getInstance(): InventoryStore {
        if (!InventoryStore.instance) {
            InventoryStore.instance = new InventoryStore();
        }
        return InventoryStore.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Backward compatibility check
                if (data.inventory) {
                    this.inventory = data.inventory;
                    this.lockedOutfitId = data.lockedOutfitId || null;
                    this.lastSealTime = data.lastSealTime || null;
                } else {
                    this.inventory = data; // Old format
                }
                console.log('[InventoryStore] Memory restored from vault.');
            } else {
                console.log('[InventoryStore] Initializing fresh vault.');
                // await this.seedDummyData(); // DISABLE RANDOM SEEDING - Use INITIAL_INVENTORY only
                this.save(); // Save the initial state immediately
            }
        } catch (e) {
            console.error('[InventoryStore] Failed to access vault:', e);
        } finally {
            this.isInitialized = true;
        }
    }

    private async save(): Promise<void> {
        try {
            const data = {
                inventory: this.inventory,
                lockedOutfitId: this.lockedOutfitId,
                lastSealTime: this.lastSealTime
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[InventoryStore] Vault write failure:', e);
        }
    }

    public getSealData() {
        return { id: this.lockedOutfitId, time: this.lastSealTime };
    }

    public async recordSeal(outfitId: string) {
        this.lockedOutfitId = outfitId;
        this.lastSealTime = Date.now();
        await this.save();
    }

    public getInventory(): Inventory {
        return this.inventory;
    }

    public getPiece(id: PieceID): Piece | undefined {
        return this.inventory.pieces[id];
    }

    public async markAsWorn(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.currentUses += 1;
            piece.lastWorn = Date.now();

            const threshold = piece.maxUses ?? this.globalMaxUses;
            if (piece.currentUses >= threshold) {
                piece.status = "Laundry";
            } else {
                piece.status = "Dirty";
            }
            await this.save();
            await this.cloud.syncPiece(piece);
        }
    }

    public async markAsClean(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.currentUses = 0;
            piece.status = "Clean";
            await this.save();
            await this.cloud.syncPiece(piece);
        }
    }

    public async addPiece(piece: Piece) {
        this.inventory.pieces[piece.id] = piece;
        await this.save();
        await this.cloud.syncPiece(piece);
    }

    public async updateMaxUses(id: PieceID, maxUses: number) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.maxUses = maxUses;
            await this.save();
            await this.cloud.syncPiece(piece);
        }
    }

    public async setGlobalMaxUses(uses: number) {
        this.globalMaxUses = uses;
        Object.values(this.inventory.pieces).forEach(piece => {
            if (piece.maxUses === undefined) {
                if (piece.currentUses >= this.globalMaxUses) {
                    piece.status = "Laundry";
                } else if (piece.currentUses > 0) {
                    piece.status = "Dirty";
                } else {
                    piece.status = "Clean";
                }
            }
        });
        await this.save();
    }


    public async archivePiece(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.status = 'Ghost';
            await this.save();
        }
    }

    public async deletePiece(id: PieceID) {
        if (this.inventory.pieces[id]) {
            delete this.inventory.pieces[id];
            await this.save();
            // await this.cloud.deletePiece(id); // TODO: Implement cloud delete
        }
    }

    public async addTag(id: PieceID, tag: string) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            if (!piece.styleTags) piece.styleTags = [];
            if (!piece.styleTags.includes(tag)) {
                piece.styleTags.push(tag);
                await this.save();
            }
        }
    }


    public async toggleFavorite(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.isFavorite = !piece.isFavorite;
            await this.save();
        }
    }

    public getMostWorn(limit: number = 5): Piece[] {
        return Object.values(this.inventory.pieces)
            .sort((a, b) => (b.currentUses || 0) - (a.currentUses || 0)) // Fallback to currentUses if wearHistory not populated yet
            .slice(0, limit);
    }

    public getStyleClusters(): Record<string, Piece[]> {
        const clusters: Record<string, Piece[]> = {};
        Object.values(this.inventory.pieces).forEach(p => {
            const tag = p.styleTags?.[0] || "Unclassified";
            if (!clusters[tag]) clusters[tag] = [];
            clusters[tag].push(p);
        });
        return clusters;
    }

    public async seedDummyData() {
        console.log('[InventoryStore] Seeding Dummy Data...');
        const categories = ['Top', 'Bottom', 'Shoes', 'Outerwear'] as const;
        const colors = ['#1A1A24', '#2E2E3A', '#0F0F12', '#F0F0F5', '#8A2BE2', '#2E5CFF'];

        const dummyItems: Piece[] = [];

        for (let i = 0; i < 20; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const col = colors[Math.floor(Math.random() * colors.length)];

            dummyItems.push({
                id: `dummy_${i}` as PieceID,
                category: cat,
                color: col,
                warmth: Math.random(),
                formality: Math.random(),
                status: 'Clean',
                currentUses: 0,
                maxUses: 5,
                dateAdded: Date.now() - Math.floor(Math.random() * 10000000000),
                styleTags: Math.random() > 0.5 ? ['Minimalist'] : ['Streetwear'],
                wearHistory: []
            });
        }

        dummyItems.forEach(item => {
            this.inventory.pieces[item.id] = item;
        });

        await this.save();
        console.log('[InventoryStore] Seeding Complete.');
    }

    public async seedMockData() {
        console.log('[InventoryStore] Seeding 150 Mock Items...');

        // Dynamic import to avoid blocking main thread on app startup
        const { MOCK_PIECES } = require('../../assets/mock-data/mockPieces');

        // Clear existing
        this.inventory.pieces = {};

        MOCK_PIECES.forEach((p: Piece) => {
            this.inventory.pieces[p.id] = p;
        });

        await this.save();
        console.log('[InventoryStore] Seeding Complete. Total pieces:', Object.keys(this.inventory.pieces).length);

        // CRITICAL: Reinitialize engine with new inventory
        const { EngineBinder } = require('../../bridge/engineBinder');
        await EngineBinder.reinitialize(this.inventory);
        console.log('[InventoryStore] Engine ready with 150 items');
    }
}
