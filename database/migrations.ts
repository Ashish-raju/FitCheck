/**
 * AsyncStorage to SQLite Migration Utility
 * One-time migration of existing data from AsyncStorage to SQLite
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { garmentRepository } from './repositories/GarmentRepository';
import { outfitRepository } from './repositories/OutfitRepository';
import { userProfileRepository } from './repositories/UserProfileRepository';
import { Piece } from '../truth/types';

const STORAGE_KEY_INVENTORY = '@fit_check_inventory_v3';
const STORAGE_KEY_OUTFITS = '@fit_check_outfits';
const MIGRATION_FLAG_KEY = '@fit_check_migration_complete';

export class DataMigration {
    /**
     * Check if migration has already been completed
     */
    public static async isMigrationComplete(): Promise<boolean> {
        try {
            const flag = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
            return flag === 'true';
        } catch (error) {
            console.error('[Migration] Error checking migration flag:', error);
            return false;
        }
    }

    /**
     * Run migration from AsyncStorage to SQLite
     */
    public static async migrate(): Promise<{
        success: boolean;
        garmentsMigrated: number;
        outfitsMigrated: number;
        error?: string;
    }> {
        console.log('[Migration] Starting AsyncStorage → SQLite migration...');

        try {
            // Check if already migrated
            const isComplete = await this.isMigrationComplete();
            if (isComplete) {
                console.log('[Migration] Already completed, skipping');
                return { success: true, garmentsMigrated: 0, outfitsMigrated: 0 };
            }

            let garmentsMigrated = 0;
            let outfitsMigrated = 0;

            // Migrate inventory (garments)
            try {
                const inventoryData = await AsyncStorage.getItem(STORAGE_KEY_INVENTORY);
                if (inventoryData) {
                    const parsed = JSON.parse(inventoryData);

                    // Handle different storage versions
                    let pieces: Record<string, Piece> = {};
                    if (parsed.inventory && parsed.inventory.pieces) {
                        // V3/V4 format
                        pieces = parsed.inventory.pieces;
                    } else if (parsed.pieces) {
                        // V2 format
                        pieces = parsed.pieces;
                    } else {
                        // V1 format (direct pieces)
                        pieces = parsed;
                    }

                    // Batch add to SQLite
                    const pieceArray = Object.values(pieces);
                    if (pieceArray.length > 0) {
                        await garmentRepository.batchAdd(pieceArray);
                        garmentsMigrated = pieceArray.length;
                        console.log(`[Migration] Migrated ${garmentsMigrated} garments`);
                    }
                }
            } catch (error) {
                console.warn('[Migration] No inventory data found or error migrating:', error);
            }

            // Migrate outfits
            try {
                const outfitsData = await AsyncStorage.getItem(STORAGE_KEY_OUTFITS);
                if (outfitsData) {
                    const outfits = JSON.parse(outfitsData);

                    if (Array.isArray(outfits)) {
                        for (const outfit of outfits) {
                            await outfitRepository.save(outfit);
                            outfitsMigrated++;
                        }
                        console.log(`[Migration] Migrated ${outfitsMigrated} outfits`);
                    }
                }
            } catch (error) {
                console.warn('[Migration] No outfit data found or error migrating:', error);
            }

            // Mark migration as complete
            await AsyncStorage.setItem(MIGRATION_FLAG_KEY, 'true');

            console.log('[Migration] Completed successfully');
            console.log(`[Migration] Total: ${garmentsMigrated} garments, ${outfitsMigrated} outfits`);

            return {
                success: true,
                garmentsMigrated,
                outfitsMigrated,
            };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('[Migration] Failed:', errorMsg);
            return {
                success: false,
                garmentsMigrated: 0,
                outfitsMigrated: 0,
                error: errorMsg,
            };
        }
    }

    /**
     * Clear old AsyncStorage data (call after successful migration and verification)
     */
    public static async clearOldData(): Promise<void> {
        console.log('[Migration] Clearing old AsyncStorage data...');
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEY_INVENTORY,
                STORAGE_KEY_OUTFITS,
            ]);
            console.log('[Migration] Old data cleared');
        } catch (error) {
            console.error('[Migration] Error clearing old data:', error);
        }
    }

    /**
     * Reset migration flag (for testing)
     */
    public static async resetMigration(): Promise<void> {
        await AsyncStorage.removeItem(MIGRATION_FLAG_KEY);
        console.log('[Migration] Migration flag reset');
    }

    /**
     * Get migration statistics
     */
    public static async getMigrationStats(): Promise<{
        isComplete: boolean;
        garmentsInSQLite: number;
        outfitsInSQLite: number;
    }> {
        const isComplete = await this.isMigrationComplete();
        const garmentsInSQLite = await garmentRepository.getCount();
        const outfitsInSQLite = await outfitRepository.getCount();

        return {
            isComplete,
            garmentsInSQLite,
            outfitsInSQLite,
        };
    }
}
