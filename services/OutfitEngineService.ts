import { generateOutfitSuggestions } from '../engine/outfit/index';
import { FirebaseGarmentRepository } from './FirebaseGarmentRepository';
import { SimpleAIService } from './SimpleAIService';
import { Outfit as EngineOutfit, EngineResult } from '../engine/outfit/models';
import { Outfit, Piece, OutfitID, PieceID } from '../truth/types';
import { WardrobeService } from './WardrobeService';

/**
 * Service that integrates the outfit suggestion engine with the app
 */
/**
 * @deprecated Replaced by EngineService. Use EngineService.getSuggestions() instead.
 */
export class OutfitEngineService {
    private static instance: OutfitEngineService;
    private repository: FirebaseGarmentRepository;
    private aiService: SimpleAIService;
    private wardrobeService: WardrobeService;

    private constructor() {
        this.repository = new FirebaseGarmentRepository();
        this.aiService = new SimpleAIService();
        this.wardrobeService = WardrobeService.getInstance();
    }

    public static getInstance(): OutfitEngineService {
        if (!OutfitEngineService.instance) {
            OutfitEngineService.instance = new OutfitEngineService();
        }
        return OutfitEngineService.instance;
    }

    /**
     * Generate outfit suggestions for a given event/context
     */
    async generateOutfits(
        userId: string,
        eventType: string,
        temperature: number,
        condition: string
    ): Promise<Outfit[]> {
        try {
            console.log('[OutfitEngineService] Generating outfits for:', { eventType, temperature, condition });

            // Get user profile
            const userProfile = await this.repository.getUserProfile(userId);

            // Map condition to rain probability
            const rainProb = condition === 'Rain' ? 0.8 : condition === 'Snow' ? 0.5 : 0.0;

            // Generate outfits using the engine
            const result: EngineResult = await generateOutfitSuggestions({
                userId,
                userProfile,
                eventParams: {
                    eventType,
                    timeOfDay: this.getTimeOfDay(),
                    geoLocation: 'India', // Could be enhanced
                    weather: {
                        temp: temperature,
                        rainProb
                    }
                },
                garmentRepo: this.repository,
                aiService: this.aiService
            });

            console.log('[OutfitEngineService] Generated', result.outfits.length, 'outfits');

            // Convert engine outfits to app outfits
            const appOutfits = await this.convertEngineOutfitsToAppOutfits(result.outfits);

            return appOutfits;
        } catch (error) {
            console.error('[OutfitEngineService] Error generating outfits:', error);
            // Return fallback/default outfits
            return this.getFallbackOutfits();
        }
    }

    /**
     * Convert engine outfits to app outfit format
     */
    private async convertEngineOutfitsToAppOutfits(engineOutfits: EngineOutfit[]): Promise<Outfit[]> {
        const appOutfits: Outfit[] = [];

        // Get all pieces for lookup
        const allPiecesRecord = await this.wardrobeService.getAllPieces();
        const allPieces = Object.values(allPiecesRecord);
        const piecesMap = new Map<string, Piece>(allPieces.map(p => [p.id as string, p]));

        for (const engineOutfit of engineOutfits) {
            // Map garment IDs to piece IDs and get piece objects
            const pieces: Piece[] = [];
            const items: PieceID[] = [];

            for (const garmentId of engineOutfit.items) {
                const piece = piecesMap.get(garmentId as string);
                if (piece) {
                    pieces.push(piece);
                    items.push(piece.id);
                }
            }

            // Only include outfits with valid pieces
            if (pieces.length > 0) {
                appOutfits.push({
                    id: engineOutfit.outfitId as OutfitID,
                    items,
                    pieces,
                    score: engineOutfit.score,
                    confidence: 0.8 // Could be calculated from score
                });
            }
        }

        return appOutfits;
    }

    /**
     * Get current time of day
     */
    private getTimeOfDay(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Fallback outfits if engine fails
     */
    private async getFallbackOutfits(): Promise<Outfit[]> {
        try {
            const piecesRecord = await this.wardrobeService.getAllPieces();
            const pieces = Object.values(piecesRecord);

            if (pieces.length < 3) {
                return [];
            }

            // Create a simple outfit from first available pieces
            const top = pieces.find(p => p.category === 'Top');
            const bottom = pieces.find(p => p.category === 'Bottom');
            const shoes = pieces.find(p => p.category === 'Shoes');

            if (!top || !bottom || !shoes) {
                return [];
            }

            return [{
                id: 'fallback_1' as OutfitID,
                items: [top.id, bottom.id, shoes.id],
                pieces: [top, bottom, shoes],
                score: 0.5,
                confidence: 0.5
            }];
        } catch (error) {
            console.error('[OutfitEngineService] Error creating fallback:', error);
            return [];
        }
    }
}
