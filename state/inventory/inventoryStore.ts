/**
 * Inventory Store V2 - SQLite Edition
 * Replaces AsyncStorage with SQLite for robust offline persistence
 */

import { Piece, PieceID, Inventory } from "../../truth/types";
import { INITIAL_INVENTORY } from "./initialInventory";
import { CloudStore } from "../../system/firebase/CloudStore";
import { garmentRepository } from "../../database/repositories/GarmentRepository";
import { getDatabase, DataMigration } from "../../database";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEAL_DATA_KEY = '@fit_check_seal_data';

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

    /**
     * Initialize database and load inventory
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('[InventoryStore] Initializing SQLite-backed inventory...');

            // Initialize database
            await getDatabase().initialize();

            // Run migration from AsyncStorage if needed
            const migrationResult = await DataMigration.migrate();
            if (migrationResult.success && migrationResult.garmentsMigrated > 0) {
                console.log(`[InventoryStore] Migrated ${migrationResult.garmentsMigrated} garments from AsyncStorage`);
            }

            // Load seal data from AsyncStorage (small metadata)
            await this.loadSealData();

            // Load inventory from SQLite
            await this.loadInventory();

            // AUTO-SEED: If inventory is empty, seed mock data
            if (Object.keys(this.inventory.pieces).length === 0) {
                console.log('[InventoryStore] Inventory empty, auto-seeding mock data...');
                await this.seedMockData();
            }

            this.isInitialized = true;
            console.log('[InventoryStore] Initialization complete');
        } catch (error) {
            console.error('[InventoryStore] Initialization failed:', error);
            // Fallback to empty inventory
            this.inventory = { ...INITIAL_INVENTORY };
            this.isInitialized = true;
        }
    }

    /**
     * Load seal data from AsyncStorage
     */
    private async loadSealData(): Promise<void> {
        try {
            const sealData = await AsyncStorage.getItem(SEAL_DATA_KEY);
            if (sealData) {
                const parsed = JSON.parse(sealData);
                this.lockedOutfitId = parsed.lockedOutfitId || null;
                this.lastSealTime = parsed.lastSealTime || null;
            }
        } catch (error) {
            console.error('[InventoryStore] Failed to load seal data:', error);
        }
    }

    /**
     * Save seal data to AsyncStorage
     */
    private async saveSealData(): Promise<void> {
        try {
            await AsyncStorage.setItem(SEAL_DATA_KEY, JSON.stringify({
                lockedOutfitId: this.lockedOutfitId,
                lastSealTime: this.lastSealTime,
            }));
        } catch (error) {
            console.error('[InventoryStore] Failed to save seal data:', error);
        }
    }

    /**
     * Load inventory from SQLite
     */
    private async loadInventory(): Promise<void> {
        const pieces = await garmentRepository.getAll();
        this.inventory.pieces = {};
        pieces.forEach(piece => {
            this.inventory.pieces[piece.id] = piece;
        });
        console.log(`[InventoryStore] Loaded ${pieces.length} pieces from SQLite`);
    }

    /**
     * Refresh inventory from database (call after bulk operations)
     */
    public async refresh(): Promise<void> {
        await this.loadInventory();
    }

    public getSealData() {
        return { id: this.lockedOutfitId, time: this.lastSealTime };
    }

    public async recordSeal(outfitId: string) {
        this.lockedOutfitId = outfitId;
        this.lastSealTime = Date.now();
        await this.saveSealData();
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

            // Update in SQLite
            await garmentRepository.update(id, {
                currentUses: piece.currentUses,
                lastWorn: piece.lastWorn,
                status: piece.status,
            });

            // Optional cloud sync
            await this.cloud.syncPiece(piece);
        }
    }

    public async markAsClean(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.currentUses = 0;
            piece.status = "Clean";

            // Update in SQLite
            await garmentRepository.update(id, {
                currentUses: 0,
                status: "Clean",
            });

            // Optional cloud sync
            await this.cloud.syncPiece(piece);
        }
    }

    public async addPiece(piece: Piece) {
        // Add to SQLite
        await garmentRepository.add(piece);

        // Update in-memory
        this.inventory.pieces[piece.id] = piece;

        // Optional cloud sync
        await this.cloud.syncPiece(piece);
    }

    public async updateMaxUses(id: PieceID, maxUses: number) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.maxUses = maxUses;

            // Update in SQLite
            await garmentRepository.update(id, { maxUses });

            // Optional cloud sync
            await this.cloud.syncPiece(piece);
        }
    }

    public async setGlobalMaxUses(uses: number) {
        this.globalMaxUses = uses;

        // Update all pieces without explicit maxUses
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

        // Note: For efficiency, we don't update all pieces in SQLite here
        // They will be updated individually when next modified
    }

    public async archivePiece(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.status = 'Ghost';

            // Update in SQLite
            await garmentRepository.update(id, { status: 'Ghost' });
        }
    }

    public async deletePiece(id: PieceID) {
        if (this.inventory.pieces[id]) {
            // Delete from SQLite
            await garmentRepository.delete(id);

            // Delete from in-memory
            delete this.inventory.pieces[id];
        }
    }

    public async addTag(id: PieceID, tag: string) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            if (!piece.styleTags) piece.styleTags = [];
            if (!piece.styleTags.includes(tag)) {
                piece.styleTags.push(tag);

                // Update in SQLite
                await garmentRepository.update(id, { styleTags: piece.styleTags });
            }
        }
    }

    public async toggleFavorite(id: PieceID) {
        const piece = this.inventory.pieces[id];
        if (piece) {
            piece.isFavorite = !piece.isFavorite;

            // Update in SQLite
            await garmentRepository.update(id, { isFavorite: piece.isFavorite });
        }
    }

    public getMostWorn(limit: number = 5): Piece[] {
        return Object.values(this.inventory.pieces)
            .sort((a, b) => (b.currentUses || 0) - (a.currentUses || 0))
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

        // Batch add to SQLite
        await garmentRepository.batchAdd(dummyItems);

        // Refresh in-memory inventory
        await this.loadInventory();

        console.log('[InventoryStore] Seeding Complete.');
    }

    public async seedMockData() {
        console.log('[InventoryStore] Seeding 150 Mock Items...');

        // Dynamic import to avoid blocking main thread on app startup
        const { MOCK_PIECES } = require('../../assets/mock-data/mockPieces');

        // Batch add to SQLite
        await garmentRepository.batchAdd(MOCK_PIECES);

        // Refresh in-memory inventory
        await this.loadInventory();

        console.log('[InventoryStore] Seeding Complete. Total pieces:', Object.keys(this.inventory.pieces).length);

        // FIRE-AND-FORGET: Reinitialize engine in background
        const { EngineBinder } = require('../../bridge/engineBinder');
        void EngineBinder.reinitialize(this.inventory);
        console.log('[InventoryStore] Engine reinitialization triggered in background');
    }
}
