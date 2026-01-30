import { FeatureFlagService } from './FeatureFlagService';
import { OutfitEngineService } from './OutfitEngineService';
import { WardrobeService } from './WardrobeService';
import { UserService } from './UserService';
import { HealthCheckService } from './HealthCheckService';

// New Engine Imports
import { RetrievalEngine } from '../engine/retrieval';
import { OutfitForge } from '../engine/outfit-forge';
import { ContextRadar } from '../engine/context-radar';
import { StylistVoice } from '../engine/stylist-voice';
import { GarmentMeta, UserProfileMeta, OutfitResult, OutfitCandidate } from '../engine/types';

// Legacy Types
import { Outfit, Piece as LegacyPiece } from '../truth/types';

export class EngineService {

    // Health check flag (runs once on first call)
    private static healthCheckDone = false;

    /**
     * Main Entrypoint for Outfit Generation
     */
    static async getSuggestions(userId: string, eventType: string = 'General'): Promise<Outfit[]> {
        // PHASE 1: Health Check (DEV ONLY, RUNS ONCE)
        if (__DEV__ && !this.healthCheckDone) {
            await HealthCheckService.getInstance().quickVerify();
            this.healthCheckDone = true;
        }

        const useNew = FeatureFlagService.useNewEngine();

        // 1. Fetch Data (Needed for both mostly, or at least for new)
        // Optimization: In real app, might want to defer this if using legacy only

        let newEngineResult: Outfit[] = [];
        let legacyResult: Outfit[] = [];

        // --- EXECUTION PATHS ---

        if (useNew) {
            console.log('[EngineService] Using NEW Engine');
            try {
                newEngineResult = await this.runNewEngine(userId, eventType);
                return newEngineResult;
            } catch (error) {
                console.error('[EngineService] New Engine Failed! Fallback to Legacy.', error);
                // Fallback
                return this.runLegacyEngine(userId); // Legacy usually takes no args or just overrides
            }
        } else {
            console.log('[EngineService] Using LEGACY Engine');
            legacyResult = await this.runLegacyEngine(userId);

            // Shadow Run
            if (FeatureFlagService.shouldRunParallel()) {
                // Non-blocking
                this.runNewEngine(userId, eventType).then(res => {
                    console.log(`[EngineService] Parallel Run Complete. Legacy Count: ${legacyResult.length}, New Count: ${res.length}`);
                }).catch(err => {
                    console.error('[EngineService] Parallel Run Failed', err);
                });
            }

            return legacyResult;
        }
    }

    // --- PRIVATE WORKERS ---

    private static async runLegacyEngine(userId: string): Promise<Outfit[]> {
        const legacyService = OutfitEngineService.getInstance();
        // Assuming default/current weather for legacy if not passed
        return legacyService.generateOutfits(userId, 'General', 25, 'Sunny');
    }

    private static async runNewEngine(userId: string, eventType: string): Promise<Outfit[]> {
        // 1. Fetch All Required Data
        const profile = await UserService.getInstance().getProfile(userId);
        const piecesRecord = await WardrobeService.getInstance().getAllPieces();
        const pieces = Object.values(piecesRecord);

        // Transform to Metas
        const wardrobeMetas: GarmentMeta[] = pieces.map(p => this.mapLegacyToMeta(p));
        const userMeta: UserProfileMeta = this.mapUserToMeta(profile);

        // 2. Derive Context
        // Mocking weather for now or fetching it
        const context = ContextRadar.deriveContext({
            event: eventType,
            weather: { tempC: 25, condition: 'Sunny' } // TODO: Hook up WeatherService
        });

        // 3. Retrieval
        const candidates = RetrievalEngine.findCandidates(wardrobeMetas, context, userMeta);

        // 4. Forge
        const forgeResult = OutfitForge.assemble(candidates, context, userMeta);

        // 5. Transform to Legacy Outfit Format for UI
        return forgeResult.candidates.map(c => this.mapCandidateToOutfit(c, context, userMeta));
    }

    // --- MAPPERS (Glue Code) ---

    private static mapLegacyToMeta(g: LegacyPiece): GarmentMeta {
        // Quick mapping using the stylistMeta we persisted in Phase 3 if avail
        // If not avail, fallback to basic mapping
        if (g.stylistMeta) return g.stylistMeta;

        // Basic fallback
        return {
            id: g.id,
            type: g.category.toLowerCase() as any, // unsafe cast for speed, verify later
            subtype: g.subcategory || 'other',
            gender: 'unisex',
            colors: [{ hex: g.color, hue: 0, saturation: 0, value: 0, undetone: 'neutral', dictColorId: 0 }], // minimal
            primaryColorHex: g.color || '#000',
            fabric: g.material || 'cotton',
            weight: 'medium', // default
            pattern: (g.pattern || 'solid') as any,
            formalityRange: [1, 10], // broad default
            seasonScores: { summer: 0.5, winter: 0.5, monsoon: 0.5, transitional: 0.5 },
            versatility: 0.5,
            fitType: (g.fit || 'regular') as any,
            bestForBodyTypes: [],
            cantBeLayeredUnder: false,
            requiresLayering: false,
            status: g.status === 'Clean' ? 'active' : 'laundry'
        } as GarmentMeta;
    }

    private static mapUserToMeta(u: any): UserProfileMeta {
        if (u?.stylistMeta) return u.stylistMeta;
        // Fallback
        return {
            id: u?.uid || 'unknown',
            bodyType: 'rectangle',
            skinTone: { hex: '#DAA', undertone: 'warm', contrastLevel: 'medium' },
            fitPreference: 'regular',
            modestyLevel: 5,
            palette: { bestColors: [], avoidColors: [] },
            weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
        };
    }

    private static mapCandidateToOutfit(c: OutfitCandidate, ctx: any, user: any): Outfit {
        // Reconstruct legacy Outfit object
        return {
            id: c.id as any,
            items: c.items.map(meta => meta.id), // Just IDs for legacy
            pieces: [], // Empty for now, caller might refetch or we can map back if needed
            score: c.totalScore,
            tags: ['generated'],
            stylistNotes: StylistVoice.explainOutfit(c, ctx, user)
        } as any as Outfit; // Heavy casting for Phase 9 Glue
    }

    // =====================================================
    // PHASE 2: Enhanced Facade Methods
    // =====================================================

    /**
     * Score an existing outfit (from saved outfits or manual creation)
     * Returns detailed score breakdown
     */
    static async scoreOutfit(
        outfitItemIds: string[],
        context?: { event?: string; weather?: any }
    ): Promise<{
        totalScore: number;
        subscores: { [key: string]: number };
        badges: string[];
        explanation: string;
    }> {
        try {
            // 1. Fetch wardrobe to get full garment data
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const garmentMetas: GarmentMeta[] = outfitItemIds
                .map(id => wardrobeRecord[id as any])
                .filter(Boolean)
                .map(p => this.mapLegacyToMeta(p));

            if (garmentMetas.length === 0) {
                return {
                    totalScore: 0,
                    subscores: {},
                    badges: [],
                    explanation: 'No valid items found'
                };
            }

            // 2. Get user profile
            const userId = await this.getCurrentUserId();
            const profile = await UserService.getInstance().getProfile(userId);
            const userMeta = this.mapUserToMeta(profile);

            // 3. Derive context
            const ctx = ContextRadar.deriveContext({
                event: context?.event || 'General',
                weather: context?.weather || { tempC: 25, condition: 'Sunny' }
            });

            // 4. Create temporary outfit candidate for scoring
            const candidate: OutfitCandidate = {
                id: `temp_${Date.now()}`,
                items: garmentMetas,
                totalScore: 0,
                subscores: {
                    colorHarmony: 0,
                    contextMatch: 0,
                    bodyFlattery: 0,
                    seasonality: 0,
                    stylistPick: 0
                },
                badges: []
            };

            // 5. Use OutfitForge to score
            const scored = OutfitForge.scoreOutfit(candidate, ctx, userMeta);

            return {
                totalScore: scored.totalScore,
                subscores: scored.subscores || {},
                badges: scored.badges || [],
                explanation: StylistVoice.explainScore(scored, ctx, userMeta)
            };
        } catch (error) {
            console.error('[EngineService.scoreOutfit] Failed:', error);
            return {
                totalScore: 0.5,
                subscores: {},
                badges: [],
                explanation: 'Scoring temporarily unavailable'
            };
        }
    }

    /**
     * Analyze a garment and return enhanced metadata
     * This runs AI-powered garment DNA analysis
     */
    static async analyzeGarment(
        garmentId: string,
        imageUri?: string
    ): Promise<GarmentMeta | null> {
        try {
            // Fetch existing piece
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const piece = wardrobeRecord[garmentId as any];

            if (!piece) {
                console.warn(`[EngineService.analyzeGarment] Garment ${garmentId} not found`);
                return null;
            }

            // Check if already analyzed
            if (piece.stylistMeta && !imageUri) {
                console.log(`[EngineService.analyzeGarment] Using cached meta for ${garmentId}`);
                return piece.stylistMeta;
            }

            // TODO: Implement proper garment DNA analysis
            // For now, create enhanced meta from available data
            const meta: GarmentMeta = this.mapLegacyToMeta(piece);

            // Persist to piece.stylistMeta
            await WardrobeService.getInstance().updatePiece(garmentId as any, {
                ...piece,
                stylistMeta: meta
            });

            console.log(`[EngineService.analyzeGarment] Analyzed ${garmentId}`);
            return meta;
        } catch (error) {
            console.error('[EngineService.analyzeGarment] Failed:', error);
            return null;
        }
    }

    /**
     * Analyze user profile (body scan, skin tone analysis)
     * Returns enhanced user metadata
     */
    static async analyzeUser(
        userId: string,
        scanData?: {
            bodyMeasurements?: any;
            skinImage?: string;
            preferences?: any;
        }
    ): Promise<UserProfileMeta | null> {
        try {
            const profile = await UserService.getInstance().getProfile(userId);

            if (!profile) {
                console.warn(`[EngineService.analyzeUser] Profile ${userId} not found`);
                return null;
            }

            // Check if already analyzed
            if ((profile as any).stylistMeta && !scanData) {
                console.log(`[EngineService.analyzeUser] Using cached meta for ${userId}`);
                return (profile as any).stylistMeta;
            }

            // TODO: Implement proper user aura analysis
            // For now, use enhanced mapping
            const meta: UserProfileMeta = this.mapUserToMeta(profile);

            // Persist to profile.stylistMeta
            await UserService.getInstance().updateProfile(userId, {
                ...profile,
                stylistMeta: meta
            } as any);

            console.log(`[EngineService.analyzeUser] Analyzed user ${userId}`);
            return meta;
        } catch (error) {
            console.error('[EngineService.analyzeUser] Failed:', error);
            return null;
        }
    }

    // =====================================================
    // Helper Methods
    // =====================================================

    private static async getCurrentUserId(): Promise<string> {
        const { FIREBASE_AUTH } = require('../system/firebase/firebaseConfig');
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return uid;
    }
}
