import { Garment, UserProfile, Context, Outfit } from './models';
import { areColorsHarmonious } from './color_utils';

// Constants for Outfit Scoring weights (Greek letters in spec)
const OUTFIT_WEIGHTS = {
    ALPHA: 1.5, // Color Harmony
    BETA: 1.2,  // Silhouette
    GAMMA: 1.0, // Layering
    DELTA: 1.0, // Occasion Coherence
    EPSILON: 0.5 // Novelty
};

function calculateColorHarmonyMetric(items: Garment[]): number {
    if (items.length < 2) return 1.0; // Single item is self-harmonious

    let harmonySum = 0;
    let comparisons = 0;

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            // Check cross-color harmony between items
            // Simplistic: check every color of item i against every color of item j?
            // Expensive. Use dominant color or average?
            // "dictColorId match or harmony group match"
            // Let's take the primary color (first one?) or check ANY match.
            // Heuristic: If ANY pair of colors between the two garments is harmonious, it's good?
            // Or if the DOMINANT colors are harmonious. Assuming colors[0] is dominant.

            const c1 = items[i].colors && items[i].colors.length > 0 ? items[i].colors[0] : null;
            const c2 = items[j].colors && items[j].colors.length > 0 ? items[j].colors[0] : null;

            if (c1 && c2) {
                if (areColorsHarmonious(c1, c2)) {
                    harmonySum += 1.0;
                } else {
                    harmonySum += 0.0;
                }
                comparisons++;
            }
        }
    }

    if (comparisons === 0) return 1.0;
    return harmonySum / comparisons;
}

function calculateSilhouetteBalance(items: Garment[], bodyType: string): number {
    // Logic: Tight + Loose is better than Tight + Tight or Loose + Loose (often)
    // Rule of thirds?

    const top = items.find(i => i.type === 'top');
    const bottom = items.find(i => i.type === 'bottom');

    if (top && bottom) {
        if (top.fit === 'oversized' && bottom.fit === 'slim') return 1.2;
        if (top.fit === 'slim' && bottom.fit === 'oversized') return 1.2;
        if (top.fit === 'regular' && bottom.fit === 'regular') return 1.0;

        // Loose + Loose can be sloppy depending on body type
        if (top.fit === 'oversized' && bottom.fit === 'oversized') return 0.8;
    }

    return 1.0;
}

function calculateLayeringLogic(items: Garment[], season: string): number {
    // If winter, more layers = better?
    // If summer, fewer layers = better?
    // Check total "layerWeight".

    const totalWeight = items.reduce((sum, i) => sum + i.layerWeight, 0);

    if (season === 'winter') {
        // Assume target weight ~ 5-10
        if (totalWeight > 4) return 1.2;
        if (totalWeight < 2) return 0.6; // Too cold?
    }

    if (season === 'summer') {
        if (totalWeight > 2) return 0.5; // Too hot
        return 1.2;
    }

    return 1.0;
}

function calculateOccasionCoherence(items: Garment[], event: string): number {
    // Do all items match the event formality?
    // Variance in formality?
    // If one item is level 0 (lounge) and another is level 4 (black tie), that's bad.

    const formalities = items.map(i => i.formality);
    const minF = Math.min(...formalities);
    const maxF = Math.max(...formalities);

    if (maxF - minF > 2) return 0.5; // Incoherent
    if (maxF - minF > 1) return 0.8;

    return 1.0;
}

function calculateNovelty(items: Garment[], userHistory: any): number {
    // Placeholder for history logic
    return 1.0;
}

export function scoreOutfit(items: Garment[], baseItemScores: number[], user: UserProfile, ctx: Context): number {
    // Base Item Scores Sum
    const sumItemScores = baseItemScores.reduce((a, b) => a + b, 0);

    // Taste Layer
    const harmony = calculateColorHarmonyMetric(items);
    const silhouette = calculateSilhouetteBalance(items, user.bodyType);
    const layering = calculateLayeringLogic(items, ctx.season);
    const occasion = calculateOccasionCoherence(items, ctx.event);
    const novelty = calculateNovelty(items, null);

    const { ALPHA, BETA, GAMMA, DELTA, EPSILON } = OUTFIT_WEIGHTS;

    const tasteScore =
        (ALPHA * harmony) +
        (BETA * silhouette) +
        (GAMMA * layering) +
        (DELTA * occasion) +
        (EPSILON * novelty);

    return sumItemScores + tasteScore;
}
