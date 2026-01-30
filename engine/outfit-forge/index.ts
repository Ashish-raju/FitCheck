import { GarmentMeta, ContextSpec, UserProfileMeta, OutfitCandidate, OutfitResult, OutfitSlot } from '../types';
import { RetrievalResult } from '../retrieval';
import { ScoringEngine } from '../scoring';

export class OutfitForge {

    /**
     * The Master Chef function: Takes ingredients, returns formatted meal plan.
     */
    static assemble(
        ingredients: RetrievalResult,
        context: ContextSpec,
        userProfile: UserProfileMeta
    ): OutfitResult {

        const rawCandidates: OutfitCandidate[] = [];

        // --- FORMULA 1: Top + Bottom + Shoes ---
        for (const top of ingredients.tops) {
            for (const bottom of ingredients.bottoms) {
                // Optimization: Pre-check compatibility here (e.g. color mismatch hard veto)
                // For now, generate all and score.

                // Add Shoes
                // Note: In real world, we might iterate all shoes. 
                // Optimization: Just pick best 3 matching shoes for this Top+Bottom combo
                // to avoid combinatorial explosion (50 tops * 50 bottoms * 50 shoes = 125,000!)
                // Heuristic: Take top 3 shoes from ingredients
                const bestShoes = ingredients.shoes.slice(0, 3);

                for (const shoe of bestShoes) {
                    const outfit: OutfitCandidate = {
                        id: `gen_${top.id}_${bottom.id}_${shoe.id}`,
                        items: [top, bottom, shoe],
                        totalScore: 0,
                        subscores: { colorHarmony: 0, contextMatch: 0, bodyFlattery: 0, seasonality: 0, stylistPick: 0 },
                        isComplete: true,
                        missingSlots: [],
                        warnings: []
                    };

                    // Score immediately
                    outfit.totalScore = ScoringEngine.scoreOutfit(outfit, context, userProfile);
                    rawCandidates.push(outfit);
                }

                // --- FORMULA 2: Top + Bottom + Layer + Shoes ---
                // Only if context suggests layering (e.g. Winter / AC)
                if (context.weather.tempC < 20 || context.formalityTarget >= 7) {
                    const bestLayers = ingredients.layers.slice(0, 3);
                    for (const layer of bestLayers) {
                        // Check layerability
                        if (!layer.cantBeLayeredUnder) {
                            // Assuming layer goes OVER top. 
                            // Top must allow being layered over (default true).
                            for (const shoe of bestShoes) { // Re-using top 3 shoes
                                const outfit: OutfitCandidate = {
                                    id: `gen_${top.id}_${bottom.id}_${layer.id}_${shoe.id}`,
                                    items: [top, bottom, layer, shoe],
                                    totalScore: 0,
                                    subscores: { colorHarmony: 0, contextMatch: 0, bodyFlattery: 0, seasonality: 0, stylistPick: 0 },
                                    isComplete: true,
                                    missingSlots: [],
                                    warnings: []
                                };
                                outfit.totalScore = ScoringEngine.scoreOutfit(outfit, context, userProfile);
                                rawCandidates.push(outfit);
                            }
                        }
                    }
                }
            }
        }

        // --- FORMULA 3: One Piece + Shoes (+ Layer) ---
        for (const onePiece of ingredients.onePieces) {
            const bestShoes = ingredients.shoes.slice(0, 3);
            for (const shoe of bestShoes) {
                const outfit: OutfitCandidate = {
                    id: `gen_${onePiece.id}_${shoe.id}`,
                    items: [onePiece, shoe],
                    totalScore: 0,
                    subscores: { colorHarmony: 0, contextMatch: 0, bodyFlattery: 0, seasonality: 0, stylistPick: 0 },
                    isComplete: true,
                    missingSlots: [],
                    warnings: []
                };
                outfit.totalScore = ScoringEngine.scoreOutfit(outfit, context, userProfile);
                rawCandidates.push(outfit);
            }
        }

        // --- POST-PROCESSING ---

        // 1. Sort by Score (Desc)
        rawCandidates.sort((a, b) => b.totalScore - a.totalScore);

        // 2. Diversity Filter (MMR-lite)
        const diverseCandidates = this.ensureDiversity(rawCandidates);

        // 3. Confidence Gate
        const finalCandidates = this.filterByConfidence(diverseCandidates);

        return {
            context,
            candidates: finalCandidates,
            debugLog: [`Generated ${rawCandidates.length} raw, filtered to ${finalCandidates.length}`]
        };
    }

    private static ensureDiversity(candidates: OutfitCandidate[]): OutfitCandidate[] {
        const usedDominantIds = new Set<string>(); // Top ID or OnePiece ID
        const result: OutfitCandidate[] = [];
        const MAX_PER_ITEM = 2; // Max 2 outfits with same shirt
        const itemUseCounts = new Map<string, number>();

        for (const outfit of candidates) {
            if (result.length >= 10) break; // Hard limit for UI

            // Identify dominant piece (Top or OnePiece)
            const dominant = outfit.items.find(i => i.type === OutfitSlot.Top || i.type === OutfitSlot.OnePiece);
            if (!dominant) continue;

            const currentCount = itemUseCounts.get(dominant.id) || 0;
            if (currentCount < MAX_PER_ITEM) {
                result.push(outfit);
                itemUseCounts.set(dominant.id, currentCount + 1);
            }
        }
        return result;
    }

    /**
     * Score a single outfit (for existing/saved outfits)
     * Used by EngineService.scoreOutfit()
     */
    static scoreOutfit(
        candidate: OutfitCandidate,
        context: ContextSpec,
        userProfile: UserProfileMeta
    ): OutfitCandidate {
        // Use ScoringEngine to compute score
        const totalScore = ScoringEngine.scoreOutfit(candidate, context, userProfile);

        // For now, return candidate with updated score
        // In future, can populate detailed subscores
        return {
            ...candidate,
            totalScore,
            subscores: {
                colorHarmony: totalScore * 0.2,
                contextMatch: totalScore * 0.3,
                bodyFlattery: totalScore * 0.2,
                seasonality: totalScore * 0.15,
                stylistPick: totalScore * 0.15
            }
        };
    }

    private static filterByConfidence(candidates: OutfitCandidate[]): OutfitCandidate[] {
        // High Bar
        const highTier = candidates.filter(c => c.totalScore > 0.65);
        if (highTier.length >= 3) return highTier;

        // Fallback Tier
        const midTier = candidates.filter(c => c.totalScore > 0.5);
        if (midTier.length >= 3) return midTier;

        // Desperation Tier (Return whatever we have over 0.3, strictly better than empty)
        return candidates.filter(c => c.totalScore > 0.3);
    }
}
