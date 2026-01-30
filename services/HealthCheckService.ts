/**
 * Engine Health Check Service
 * Provides runtime diagnostics and verification that the engine
 * is using live data from Firebase.
 */

import { WardrobeService } from './WardrobeService';
import { UserService } from './UserService';
import { FeatureFlagService } from './FeatureFlagService';
import { FIREBASE_AUTH } from '../system/firebase/firebaseConfig';

export interface EngineHealthStatus {
    mode: 'LIVE' | 'OFFLINE';
    dataSource: string;
    wardrobeCount: number;
    sampleGarmentIds: string[];
    userId: string | null;
    flags: {
        newEngineEnabled: boolean;
        parallelRun: boolean;
    };
    timestamp: number;
}

export class HealthCheckService {
    private static instance: HealthCheckService;
    private lastCheck: EngineHealthStatus | null = null;

    private constructor() { }

    public static getInstance(): HealthCheckService {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }

    /**
     * Perform health check and return diagnostics
     */
    public async performCheck(verbose = false): Promise<EngineHealthStatus> {
        const startTime = Date.now();

        try {
            // Get current user
            const userId = FIREBASE_AUTH.currentUser?.uid || null;

            if (!userId) {
                return {
                    mode: 'OFFLINE',
                    dataSource: 'NONE - User not authenticated',
                    wardrobeCount: 0,
                    sampleGarmentIds: [],
                    userId: null,
                    flags: {
                        newEngineEnabled: FeatureFlagService.useNewEngine(),
                        parallelRun: FeatureFlagService.shouldRunParallel()
                    },
                    timestamp: Date.now()
                };
            }

            // Fetch wardrobe (this will use real Firebase data)
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const garmentIds = Object.keys(wardrobeRecord);
            const count = garmentIds.length;

            // Sample up to 5 IDs
            const sampleIds = garmentIds.slice(0, Math.min(5, count));

            const status: EngineHealthStatus = {
                mode: 'LIVE',
                dataSource: `Firebase Firestore - users/${userId}/wardrobe`,
                wardrobeCount: count,
                sampleGarmentIds: sampleIds,
                userId,
                flags: {
                    newEngineEnabled: FeatureFlagService.useNewEngine(),
                    parallelRun: FeatureFlagService.shouldRunParallel()
                },
                timestamp: Date.now()
            };

            this.lastCheck = status;

            // DEV-ONLY Logging
            if (verbose && __DEV__) {
                console.log('╔═══════════════════════════════════════════════════════════╗');
                console.log('║           ENGINE HEALTH CHECK                             ║');
                console.log('╚═══════════════════════════════════════════════════════════╝');
                console.log(`MODE: ${status.mode}`);
                console.log(`WARDROBE_SOURCE: ${status.dataSource}`);
                console.log(`WARDROBE_COUNT: ${status.wardrobeCount}`);
                console.log(`SAMPLE_GARMENT_IDS: [${status.sampleGarmentIds.join(', ')}]`);
                console.log(`USER_ID: ${status.userId}`);
                console.log(`NEW_ENGINE_ENABLED: ${status.flags.newEngineEnabled}`);
                console.log(`PARALLEL_RUN: ${status.flags.parallelRun}`);
                console.log(`Check Duration: ${Date.now() - startTime}ms`);
                console.log('═══════════════════════════════════════════════════════════\n');
            }

            return status;
        } catch (error) {
            console.error('[HealthCheck] Failed:', error);
            return {
                mode: 'OFFLINE',
                dataSource: `ERROR - ${(error as Error).message}`,
                wardrobeCount: 0,
                sampleGarmentIds: [],
                userId: FIREBASE_AUTH.currentUser?.uid || null,
                flags: {
                    newEngineEnabled: FeatureFlagService.useNewEngine(),
                    parallelRun: FeatureFlagService.shouldRunParallel()
                },
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get last cached health status
     */
    public getLastCheck(): EngineHealthStatus | null {
        return this.lastCheck;
    }

    /**
     * Quick verification (logs to console in DEV)
     */
    public async quickVerify(): Promise<boolean> {
        const status = await this.performCheck(true);
        return status.mode === 'LIVE' && status.wardrobeCount > 0;
    }
}
