import { Worklets } from 'react-native-worklets-core';
import type { Piece, Context, CalibrationStage, Outfit } from '../../truth/types';

// ============================================================================
// TYPES & CONSTANTS (Mirrored to ensure availability in Worklet Context)
// ============================================================================

interface ScoreBreakdown {
    colorHarmony: number;
    formalityAlignment: number;
    styleCoherence: number;
    seasonSuitability: number;
    patternClash: number;
    materialMismatch: number;
    reasons: string[];
}

const CONSTRAINTS = {
    CONTEXT: {
        COLD_THRESHOLD: 10,
    }
};

interface OutfitWithBreakdown extends Outfit {
    breakdown?: ScoreBreakdown;
}

// ============================================================================
// PURE LOGIC (Copied from FilterGateway & AestheticRules to ensure closure safety)
// ============================================================================

function filterPiece(piece: Piece, context: Context): boolean {
    'worklet';
    if (piece.status !== 'Clean') return false;
    if (context.temperature < CONSTRAINTS.CONTEXT.COLD_THRESHOLD) {
        if (piece.warmth < 2) return false;
    }
    return true;
}

function scoreOutfit(
    outfit: Outfit,
    pieces: Piece[],
    context: Context,
    stage: CalibrationStage
): { score: number; breakdown: ScoreBreakdown } {
    'worklet';
    const breakdown: ScoreBreakdown = {
        colorHarmony: 0,
        formalityAlignment: 0,
        styleCoherence: 0,
        seasonSuitability: 0,
        patternClash: 0,
        materialMismatch: 0,
        reasons: []
    };

    // 1. COLOR HARMONY
    const colors = pieces.map(p => p.color.toLowerCase());
    const uniqueColors = new Set(colors);

    if (uniqueColors.size === 1) {
        breakdown.colorHarmony = 30;
        breakdown.reasons.push(`Monochrome outfit (${colors[0]}) - maximum harmony`);
    } else if (uniqueColors.size === 2) {
        breakdown.colorHarmony = 20;
        breakdown.reasons.push(`Two-color palette - good coordination`);
    } else if (uniqueColors.size === 3) {
        breakdown.colorHarmony = 10;
        breakdown.reasons.push(`Three colors - acceptable variety`);
    } else {
        breakdown.colorHarmony = 0;
        breakdown.reasons.push(`Too many colors (${uniqueColors.size}) - lacks cohesion`);
    }

    // 2. FORMALITY ALIGNMENT
    let targetFormality = 3;
    if (context.occasion === "Work") targetFormality = 4;
    if (context.occasion === "Formal") targetFormality = 5;
    if (context.occasion === "Casual") targetFormality = 2;

    const avgFormality = pieces.reduce((sum, p) => sum + p.formality, 0) / pieces.length;
    const formalityDiff = Math.abs(avgFormality - targetFormality);
    breakdown.formalityAlignment = Math.max(0, 20 - (formalityDiff * 5));

    if (formalityDiff < 0.5) {
        breakdown.reasons.push(`Perfect formality match for ${context.occasion}`);
    } else if (formalityDiff < 1.5) {
        breakdown.reasons.push(`Good formality alignment for ${context.occasion}`);
    } else {
        breakdown.reasons.push(`Formality mismatch - ${avgFormality.toFixed(1)} vs target ${targetFormality}`);
    }

    // 3. STYLE COHERENCE
    const allTags = pieces.flatMap(p => p.styleTags || []);
    const tagCounts = new Map<string, number>();
    allTags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));

    const maxTagCount = Math.max(...Array.from(tagCounts.values()), 0);
    if (maxTagCount >= 3) {
        breakdown.styleCoherence = 20;
        const dominantTag = Array.from(tagCounts.entries()).find(([_, count]) => count === maxTagCount)?.[0];
        breakdown.reasons.push(`Strong ${dominantTag} aesthetic across all pieces`);
    } else if (maxTagCount === 2) {
        breakdown.styleCoherence = 15;
        breakdown.reasons.push(`Consistent style theme across items`);
    } else if (allTags.length > 0) {
        breakdown.styleCoherence = 10;
        breakdown.reasons.push(`Mixed styles - some coherence`);
    } else {
        breakdown.styleCoherence = 5;
    }

    // 4. SEASON SUITABILITY (Approximated)
    // In Worklet, new Date() works.
    const currentMonth = new Date().getMonth() + 1;
    let currentSeason: "spring" | "summer" | "fall" | "winter";
    if (currentMonth >= 3 && currentMonth <= 5) currentSeason = "spring";
    else if (currentMonth >= 6 && currentMonth <= 8) currentSeason = "summer";
    else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = "fall";
    else currentSeason = "winter";

    const seasonMatches = pieces.filter(p => p.season?.includes(currentSeason)).length;
    breakdown.seasonSuitability = (seasonMatches / pieces.length) * 15;

    if (seasonMatches === pieces.length) {
        breakdown.reasons.push(`All items perfect for ${currentSeason}`);
    } else if (seasonMatches >= 2) {
        breakdown.reasons.push(`Most items suitable for ${currentSeason}`);
    }

    // 5. PATTERN CLASH
    const patterns = pieces.map(p => p.pattern).filter(p => p && p !== 'solid');
    if (patterns.length >= 3) {
        breakdown.patternClash = 10;
        breakdown.reasons.push(`Too many patterns - visual chaos`);
    } else if (patterns.length === 2) {
        breakdown.patternClash = 5;
        breakdown.reasons.push(`Multiple patterns - risky combination`);
    }

    // 6. MATERIAL MISMATCH
    const materials = pieces.map(p => p.material).filter(m => m);
    const uniqueMaterials = new Set(materials);
    if (uniqueMaterials.size >= 3) {
        breakdown.materialMismatch = 5;
    } else if (uniqueMaterials.size === 2) {
        breakdown.materialMismatch = 2;
    }

    // STAGE ADJUSTMENTS
    if (stage === "CONSERVATIVE") {
        if (uniqueColors.size === 1) {
            breakdown.colorHarmony += 10;
            breakdown.reasons.push(`Conservative mode: favoring safe monochrome`);
        }
        if (avgFormality >= 2 && avgFormality <= 4) {
            breakdown.formalityAlignment += 5;
        }
    }

    if (stage === "REFINEMENT") {
        breakdown.formalityAlignment = Math.max(0, 25 - (formalityDiff * 8));
    }

    if (stage === "SIMPLIFICATION") {
        breakdown.colorHarmony -= (uniqueColors.size - 1) * 5;
        if (avgFormality < 3) {
            breakdown.formalityAlignment += 10;
            breakdown.reasons.push(`Simplification mode: favoring casual ease`);
        }
    }

    const finalScore =
        breakdown.colorHarmony +
        breakdown.formalityAlignment +
        breakdown.styleCoherence +
        breakdown.seasonSuitability -
        breakdown.patternClash -
        breakdown.materialMismatch;

    // CONFIDENCE
    const formalityConfidence = 1.0 - (formalityDiff / 5);
    const colorConfidence = uniqueColors.size <= 2 ? 0.4 : 0.1;
    const styleConfidence = maxTagCount >= 2 ? 0.2 : 0;
    outfit.confidence = Math.min(1.0, formalityConfidence + colorConfidence + styleConfidence);

    return { score: Math.max(0, finalScore), breakdown };
}

// ============================================================================
// WORKLET ENTRY POINT
// ============================================================================

/**
 * The heavy computation function that runs in the background thread.
 * It takes primitive arrays/objects and returns the sorted outfit list.
 */
function outfitGenerationWorklet(
    allPieces: Piece[],
    context: Context,
    stage: CalibrationStage
): OutfitWithBreakdown[] {
    'worklet';

    // 1. Indexing
    const tops = allPieces.filter(p => p.category === 'Top');
    const bottoms = allPieces.filter(p => p.category === 'Bottom');
    const shoes = allPieces.filter(p => p.category === 'Shoes');

    const validOutfits: OutfitWithBreakdown[] = [];

    // 2. Generation Loop (Caps at ~50k iterations implicit by wardrobe size)
    // Note: We don't have the uuid generator here, so we use a simple random string
    // or we can generate a deterministic ID based on piece IDs which is BETTER.

    for (const top of tops) {
        for (const bottom of bottoms) {
            for (const shoe of shoes) {

                // Filter Individual Pieces against context (Early Exit)
                if (!filterPiece(top, context)) continue;
                if (!filterPiece(bottom, context)) continue;
                if (!filterPiece(shoe, context)) continue;

                // Create Outfit
                const pieces = [top, bottom, shoe];
                const id = `outfit_${top.id}_${bottom.id}_${shoe.id}`; // Deterministic ID

                const outfit: OutfitWithBreakdown = {
                    id: id as any,
                    items: [top.id, bottom.id, shoe.id],
                    pieces: pieces,
                    score: 0,
                    confidence: 0,
                };

                // Score
                const { score, breakdown } = scoreOutfit(outfit, pieces, context, stage);
                outfit.score = score;
                outfit.breakdown = breakdown;

                if (score > 0) {
                    validOutfits.push(outfit);
                }
            }
        }
    }

    // 3. Sort (Descending Score)
    validOutfits.sort((a, b) => b.score - a.score);

    // 4. Cap results to top 100 to save serialization bridge cost
    return validOutfits.slice(0, 100);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Runs the outfit generation pipeline in a background thread.
 * Non-blocking.
 */
export async function runScoringPipeline(
    inventoryPieces: Piece[],
    context: Context,
    stage: CalibrationStage
): Promise<OutfitWithBreakdown[]> {
    console.log('[BackgroundWorker] Spawning worker...');
    const start = performance.now();

    try {
        // Create the worklet function
        // defaultContext is the background thread provided by react-native-worklets-core
        const worklet = Worklets.createRunInContextFn(outfitGenerationWorklet, Worklets.defaultContext);

        // Execute
        const results = await worklet(inventoryPieces, context, stage);

        const duration = performance.now() - start;
        console.log(`[BackgroundWorker] Complete. Generated ${results.length} outfits in ${duration.toFixed(0)}ms (Async)`);

        return results;
    } catch (e) {
        console.error('[BackgroundWorker] Worker Failed:', e);
        // Fallback: If worker fails, return empty or throw
        return [];
    }
}
