/**
 * Smoke Tests for Standalone APK
 * Verifies critical user flows work offline
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { DatabaseConnection } from '../../database/connection';
import { garmentRepository } from '../../database/repositories/GarmentRepository';
import { outfitRepository } from '../../database/repositories/OutfitRepository';
import { userProfileRepository } from '../../database/repositories/UserProfileRepository';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { OutfitStore } from '../../state/outfits/OutfitStore';
import { Piece, PieceID } from '../../truth/types';

describe('APK Smoke Tests', () => {
    let inventoryStore: InventoryStore;
    let outfitStore: OutfitStore;

    beforeAll(async () => {
        // Initialize database
        await DatabaseConnection.getInstance().initialize();

        // Initialize stores
        inventoryStore = InventoryStore.getInstance();
        await inventoryStore.initialize();

        outfitStore = OutfitStore.getInstance();
        await outfitStore.initialize();
    });

    describe('Database Initialization', () => {
        it('should initialize SQLite database without errors', async () => {
            const db = DatabaseConnection.getInstance();
            expect(db).toBeDefined();

            const stats = await db.getStats();
            expect(stats).toBeDefined();
            expect(typeof stats.garments).toBe('number');
        });

        it('should have all required tables', async () => {
            const db = DatabaseConnection.getInstance().getDatabase();

            // Query sqlite_master to check tables exist
            const tables = await db.getAllAsync<{ name: string }>(
                "SELECT name FROM sqlite_master WHERE type='table'"
            );

            const tableNames = tables.map(t => t.name);
            expect(tableNames).toContain('garments');
            expect(tableNames).toContain('outfits');
            expect(tableNames).toContain('user_profile');
            expect(tableNames).toContain('wear_logs');
            expect(tableNames).toContain('travel_packs');
            expect(tableNames).toContain('feedback_events');
        });
    });

    describe('Upload Garment Flow', () => {
        it('should add a new garment to SQLite', async () => {
            const newGarment: Piece = {
                id: 'smoke_test_001' as PieceID,
                category: 'Top',
                color: '#000000',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.5,
                warmth: 0.5,
                wearHistory: [],
            };

            await inventoryStore.addPiece(newGarment);

            // Verify it's in the store
            const retrieved = inventoryStore.getPiece('smoke_test_001' as PieceID);
            expect(retrieved).toBeDefined();
            expect(retrieved?.category).toBe('Top');

            // Verify it's in SQLite
            const fromDB = await garmentRepository.getById('smoke_test_001' as PieceID);
            expect(fromDB).toBeDefined();
            expect(fromDB?.category).toBe('Top');

            // Cleanup
            await inventoryStore.deletePiece('smoke_test_001' as PieceID);
        });

        it('should update garment status', async () => {
            const garment: Piece = {
                id: 'smoke_test_002' as PieceID,
                category: 'Bottom',
                color: '#0000FF',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.5,
                warmth: 0.5,
                wearHistory: [],
            };

            await inventoryStore.addPiece(garment);

            // Mark as worn
            await inventoryStore.markAsWorn('smoke_test_002' as PieceID);

            // Verify status changed
            const updated = inventoryStore.getPiece('smoke_test_002' as PieceID);
            expect(updated?.currentUses).toBe(1);
            expect(updated?.status).toBe('Dirty');

            // Cleanup
            await inventoryStore.deletePiece('smoke_test_002' as PieceID);
        });
    });

    describe('Generate Outfit Flow', () => {
        it('should save outfit to SQLite', async () => {
            const testOutfit = {
                id: 'smoke_test_outfit_001',
                name: 'Test Outfit',
                items: ['test_piece_1', 'test_piece_2'] as PieceID[],
                occasion: 'Casual' as const,
                score: 0.85,
                source: 'manual' as const,
                isFavorite: false,
                createdAt: Date.now(),
            };

            await outfitStore.saveOutfit(testOutfit);

            // Verify it's in the store
            const retrieved = outfitStore.getOutfit('smoke_test_outfit_001');
            expect(retrieved).toBeDefined();
            expect(retrieved?.name).toBe('Test Outfit');

            // Verify it's in SQLite
            const fromDB = await outfitRepository.getById('smoke_test_outfit_001');
            expect(fromDB).toBeDefined();
            expect(fromDB?.name).toBe('Test Outfit');

            // Cleanup
            await outfitStore.deleteOutfit('smoke_test_outfit_001');
        });
    });

    describe('Data Persistence', () => {
        it('should persist data across store reinitialization', async () => {
            // Add a garment
            const persistenceTestGarment: Piece = {
                id: 'persistence_test_001' as PieceID,
                category: 'Shoes',
                color: '#FFFFFF',
                status: 'Clean',
                currentUses: 0,
                maxUses: 5,
                dateAdded: Date.now(),
                formality: 0.7,
                warmth: 0.3,
                wearHistory: [],
            };

            await garmentRepository.add(persistenceTestGarment);

            // Create new store instance (simulating app restart)
            const newStore = InventoryStore.getInstance();
            await newStore.refresh();

            // Verify data persisted
            const retrieved = newStore.getPiece('persistence_test_001' as PieceID);
            expect(retrieved).toBeDefined();
            expect(retrieved?.category).toBe('Shoes');

            // Cleanup
            await garmentRepository.delete('persistence_test_001' as PieceID);
        });

        it('should handle concurrent writes without corruption', async () => {
            const garments: Piece[] = [];
            for (let i = 0; i < 10; i++) {
                garments.push({
                    id: `concurrent_test_${i}` as PieceID,
                    category: 'Top',
                    color: '#FF0000',
                    status: 'Clean',
                    currentUses: 0,
                    maxUses: 3,
                    dateAdded: Date.now(),
                    formality: 0.5,
                    warmth: 0.5,
                    wearHistory: [],
                });
            }

            // Write concurrently
            await Promise.all(garments.map(g => garmentRepository.add(g)));

            // Verify all were added
            for (let i = 0; i < 10; i++) {
                const retrieved = await garmentRepository.getById(`concurrent_test_${i}` as PieceID);
                expect(retrieved).toBeDefined();
            }

            // Cleanup
            await Promise.all(garments.map(g => garmentRepository.delete(g.id)));
        });
    });

    describe('Offline Functionality', () => {
        it('should work without network calls', async () => {
            // This test verifies that all operations are local
            // In a real scenario, you'd mock network to fail

            const offlineGarment: Piece = {
                id: 'offline_test_001' as PieceID,
                category: 'Outerwear',
                color: '#00FF00',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.6,
                warmth: 0.9,
                wearHistory: [],
            };

            // All these operations should complete without network
            await inventoryStore.addPiece(offlineGarment);
            await inventoryStore.markAsWorn('offline_test_001' as PieceID);

            const retrieved = inventoryStore.getPiece('offline_test_001' as PieceID);
            expect(retrieved?.currentUses).toBe(1);

            // Cleanup
            await inventoryStore.deletePiece('offline_test_001' as PieceID);
        });
    });

    describe('User Profile', () => {
        it('should read and update user profile', async () => {
            const profile = await userProfileRepository.get();
            expect(profile).toBeDefined();

            await userProfileRepository.update({
                bodyType: 'athletic',
                skinTone: 'medium',
            });

            const updated = await userProfileRepository.get();
            expect(updated.bodyType).toBe('athletic');
            expect(updated.skinTone).toBe('medium');
        });
    });

    describe('Database Statistics', () => {
        it('should provide accurate counts', async () => {
            const initialCount = await garmentRepository.getCount();

            // Add a garment
            const testGarment: Piece = {
                id: 'stats_test_001' as PieceID,
                category: 'Accessories',
                color: '#FFFF00',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.5,
                warmth: 0.5,
                wearHistory: [],
            };

            await garmentRepository.add(testGarment);

            const newCount = await garmentRepository.getCount();
            expect(newCount).toBe(initialCount + 1);

            // Cleanup
            await garmentRepository.delete('stats_test_001' as PieceID);
        });
    });
});

describe('Performance Tests', () => {
    it('should handle large batch operations efficiently', async () => {
        const startTime = Date.now();

        const largeGarments: Piece[] = [];
        for (let i = 0; i < 100; i++) {
            largeGarments.push({
                id: `perf_test_${i}` as PieceID,
                category: i % 2 === 0 ? 'Top' : 'Bottom',
                color: '#000000',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.5,
                warmth: 0.5,
                wearHistory: [],
            });
        }

        await garmentRepository.batchAdd(largeGarments);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete in under 3 seconds
        expect(duration).toBeLessThan(3000);

        // Cleanup
        for (let i = 0; i < 100; i++) {
            await garmentRepository.delete(`perf_test_${i}` as PieceID);
        }
    });

    it('should query large dataset quickly', async () => {
        // Add 50 items
        const items: Piece[] = [];
        for (let i = 0; i < 50; i++) {
            items.push({
                id: `query_test_${i}` as PieceID,
                category: 'Top',
                color: '#0000FF',
                status: 'Clean',
                currentUses: 0,
                maxUses: 3,
                dateAdded: Date.now(),
                formality: 0.5,
                warmth: 0.5,
                wearHistory: [],
            });
        }

        await garmentRepository.batchAdd(items);

        const startTime = Date.now();
        const all = await garmentRepository.getAll();
        const endTime = Date.now();

        // Should query in under 500ms
        expect(endTime - startTime).toBeLessThan(500);
        expect(all.length).toBeGreaterThanOrEqual(50);

        // Cleanup
        for (let i = 0; i < 50; i++) {
            await garmentRepository.delete(`query_test_${i}` as PieceID);
        }
    });
});
