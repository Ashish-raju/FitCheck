import { Outfit, Garment } from './models';
import { ALGO_PARAMS } from './constants';

function calculateHueSimilarity(o1: Outfit, o2: Outfit, garments: Record<string, Garment>): number {
    // Get dominant colors of outfits
    // Simply average Hue? Or overlapping buckets?
    // Heuristic: Check overlapping item IDs first (Jaccard).
    // Spec wants "Hue diversity".

    // Collect all colors from O1
    const uniqueColors1 = new Set<number>();
    // ... logic to extract hues

    // For now, let's use Overlap of Items as a strong proxy for similarity + simple "Primary Color" check of Top.
    // Assuming 'items' contains IDs.

    const intersection = o1.items.filter(id => o2.items.includes(id));
    const jaccard = intersection.length / (new Set([...o1.items, ...o2.items]).size);

    // If they share main items, they are very similar.
    return jaccard;
}

function calculateSimilarity(o1: Outfit, o2: Outfit, garments: Record<string, Garment>): number {
    // Combine Hue, Silhouette, Vibe
    // Using Jaccard of items as the strongest signal of "sameness"
    // For diversity, we want different items.

    return calculateHueSimilarity(o1, o2, garments);
}

export class Diversifier {
    static selectDiverseOutfits(
        scoredOutfits: Outfit[],
        garmentsMap: Record<string, Garment> // Need full garment data for checking attributes
    ): Outfit[] {
        const K = ALGO_PARAMS.RESULTS_K;
        const LAMBDA = 0.5; // Balance between Relevance (Score) and Diversity

        if (scoredOutfits.length <= K) return scoredOutfits;

        const selected: Outfit[] = [];
        const remaining = [...scoredOutfits];

        // MMR Loop
        while (selected.length < K && remaining.length > 0) {
            let bestCandidateIndex = -1;
            let bestMMR = -Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const candidate = remaining[i];

                // Relevance Part
                // Normalize score? Assuming score is somewhat normalized or comparable.
                // Let's assume scores are like 5.0, 4.5 etc.
                const relevance = candidate.score;

                // Diversity Part
                let maxSim = 0;
                for (const existing of selected) {
                    const sim = calculateSimilarity(candidate, existing, garmentsMap);
                    if (sim > maxSim) maxSim = sim;
                }

                // MMR Formula: Use raw score if normalizing is hard, 
                // but usually we need them in same range.
                // Let's assume Score is dominant, but MaxSim (0-1) penalizes.
                // Score - PenaltyFactor * MaxSim
                const mmr = relevance - (5.0 * maxSim); // High penalty for duplicates

                if (mmr > bestMMR) {
                    bestMMR = mmr;
                    bestCandidateIndex = i;
                }
            }

            if (bestCandidateIndex !== -1) {
                selected.push(remaining[bestCandidateIndex]);
                remaining.splice(bestCandidateIndex, 1);
            } else {
                break;
            }
        }

        return selected;
    }
}
