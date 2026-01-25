import { Garment, UserProfile, Context } from './models';
import { getPaletteScore } from './color_utils';

export function calculateFormalityFit(g: Garment, ctx: Context): number {
    const minF = ctx.formalityMin;
    const gF = g.formality;

    // if (gF < minF) return 0; // Soft penalty handled at end 
    // Wait, Veto layer handled "strict" formal veto patterns. 
    // Here we score. 
    // Closer is better? Or just "meet requirement"?
    // Typically: mismatch penalty.
    // Exponential decay as distance increases?
    // Let's say perfect match is 1.0. 
    // Being slightly more formal is okay (e.g. 2 vs 1). 
    // Being less formal is bad.

    if (gF === minF) return 1.0;
    if (gF > minF) return 0.8; // Slightly overdressed is ok
    return 0.1; // Underdressed heavily penalized in score (if not vetoed)
}

export function calculateStyleMatch(g: Garment, userPrefs: string[]): number {
    // Intersection of styleTags
    const intersection = g.styleTags.filter(t => userPrefs.includes(t));
    if (userPrefs.length === 0) return 0.5; // neutral
    return intersection.length / Math.max(1, g.styleTags.length);
}

export function calculateRecencyBoost(lastWornAt?: number): number {
    // "recencyBoost"
    // Usually we want to boost items NOT wearing recently? 
    // Or do we want to boost "New" items?
    // "Recency" often implies "Recently bought" -> Boost.
    // "Recently worn" -> Penalty (handled by repetitionPenalty).
    // Assuming "RecencyBoost" means "Boost items that are 'Fresh' or 'New'".
    // OR, simplistic: 1.0.
    // Let's assume input is timestamp.
    // If undefined (never worn), Boost!
    if (!lastWornAt) return 1.0;

    const now = Date.now();
    const daysSince = (now - lastWornAt) / (1000 * 60 * 60 * 24);

    // If worn yesterday, boost is 0. If worn a year ago, boost is 1.
    // Sigmoid or log function.
    return Math.min(1.0, daysSince / 30); // Max boost after 30 days
}

export function calculateRepetitionPenalty(wornCount: number): number {
    // "repetitionPenalty(g.wornCount)"
    // The more it's worn, the higher the penalty (reduced score).
    // This term is SUBTRACTED.
    // So we return a positive number representing penalty magnitude.
    // Logarithmic?
    return Math.log1p(wornCount) * 0.1;
}
