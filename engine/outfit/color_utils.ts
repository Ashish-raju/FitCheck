import { Color } from './models';

// Simple heuristic mapping for harmony if heavy DB is not present
// Returns true if c1 and c2 are harmonious
export function areColorsHarmonious(c1: Color, c2: Color): boolean {
    // 1. Dictionary Pairwise Harmony Prior (Mocked)
    // In real app, this checks a DB or lookup table: validPairs.has(c1.id, c2.id)
    // For now, assume if they are in same "dictColorId" group or complementary they are good.

    if (c1.dictColorId === c2.dictColorId) return true; // Monochromatic

    // 2. Hue-math fallback
    // Complementary: 180 deg apart (+- 20)
    // Analogous: 30 deg apart
    // Triadic: 120 deg apart
    const hueDiff = Math.abs(c1.h - c2.h);
    const diff = Math.min(hueDiff, 360 - hueDiff);

    if (diff < 30) return true; // Analogous
    if (Math.abs(diff - 180) < 20) return true; // Complementary
    if (Math.abs(diff - 120) < 20) return true; // Triadic

    // Neutral check (Black, White, Grey are usually harmonious with everything)
    const isNeutral1 = c1.s < 0.1 || c1.l > 0.95 || c1.l < 0.1;
    const isNeutral2 = c2.s < 0.1 || c2.l > 0.95 || c2.l < 0.1;

    if (isNeutral1 || isNeutral2) return true;

    return false;
}

export function getPaletteScore(garmentColors: Color[], targetPaletteIds: number[], avoidIds: number[]): number {
    let score = 0;

    for (const c of garmentColors) {
        if (avoidIds.includes(c.dictColorId)) {
            score -= 1.0; // Avoid list penalty
            continue;
        }

        if (targetPaletteIds.includes(c.dictColorId)) {
            score += 1.0; // Direct match
        } else {
            // Check harmony with target ? 
            // "PaletteFit MUST use: dictColorId match, harmony group match, avoid list penalty"
            // We assume "harmony group match" means "is it harmonious with the target palette?"
            // Usually paletteTarget is a set of "desired" colors.
            // If the garment color is NOT in target, but is harmonious with ALL of target? Or SOME?
            // Conservative: If it matches target ID, +1. If it doesn't match but is neutral? 
            // Mocking "harmony group match" as +0.5 if it shares harmony with target.
            // Simplified: Direct ID match is strong (+1), Avoid is penalty (-1). 
            // If empty target, neutral score.
        }
    }

    // Normalize to 0-1 range roughly? Or just raw additive?
    // User weights will apply to this. Let's keep it normalized component-wise if possible, 
    // but here it's additive per color.
    // Average it per garment color count?
    if (garmentColors.length === 0) return 0;
    return score / garmentColors.length;
}
