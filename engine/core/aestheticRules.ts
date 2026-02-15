import type { Outfit, Context, Piece, CalibrationStage } from "../../truth/types";
import { ColorHarmony, type ColorHSL } from "./colorHarmony";

export interface ScoreBreakdown {
    colorHarmony: number;        // 0-30
    formalityAlignment: number;  // 0-20
    styleCoherence: number;      // 0-20
    seasonSuitability: number;   // 0-15
    patternClash: number;        // 0-10 (penalty)
    materialMismatch: number;    // 0-5 (penalty)
    reasons: string[];
}

export class AestheticRules {
    /**
     * Calculates a deterministic, explainable score for an outfit based on context.
     * Higher is better. Returns score + breakdown for transparency.
     */
    public static scoreOutfit(
        outfit: Outfit,
        pieces: Piece[],
        context: Context,
        stage: CalibrationStage = "CONSERVATIVE"
    ): { score: number; breakdown: ScoreBreakdown } {
        const breakdown: ScoreBreakdown = {
            colorHarmony: 0,
            formalityAlignment: 0,
            styleCoherence: 0,
            seasonSuitability: 0,
            patternClash: 0,
            materialMismatch: 0,
            reasons: []
        };

        // 1. COLOR HARMONY (0-30 points) - Using Color Wheel Theory
        const colorHSLs = pieces
            .map(p => {
                try {
                    return ColorHarmony.hexToHSL(p.color);
                } catch (e) {
                    // Fallback for invalid colors
                    return null;
                }
            })
            .filter((c): c is ColorHSL => c !== null);

        if (colorHSLs.length === 0) {
            breakdown.colorHarmony = 5;
            breakdown.reasons.push(`Unable to analyze colors`);
        } else {
            const harmonyResult = ColorHarmony.analyzeHarmony(colorHSLs);
            breakdown.colorHarmony = harmonyResult.score;
            breakdown.reasons.push(harmonyResult.reasoning);
        }

        // 2. FORMALITY ALIGNMENT (0-20 points)
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

        // 3. STYLE COHERENCE (0-20 points)
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

        // 4. SEASON SUITABILITY (0-15 points)
        // Simplified: check if items have season data and if it matches current context
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

        // 5. PATTERN CLASH PENALTY (0-10 points deduction)
        const patterns = pieces.map(p => p.pattern).filter(p => p && p !== 'solid');
        if (patterns.length >= 3) {
            breakdown.patternClash = 10;
            breakdown.reasons.push(`Too many patterns - visual chaos`);
        } else if (patterns.length === 2) {
            breakdown.patternClash = 5;
            breakdown.reasons.push(`Multiple patterns - risky combination`);
        }

        // 6. MATERIAL MISMATCH PENALTY (0-5 points deduction)
        const materials = pieces.map(p => p.material).filter(m => m);
        const uniqueMaterials = new Set(materials);
        if (uniqueMaterials.size >= 3) {
            breakdown.materialMismatch = 5;
        } else if (uniqueMaterials.size === 2) {
            breakdown.materialMismatch = 2;
        }

        // STAGE-SPECIFIC ADJUSTMENTS
        if (stage === "CONSERVATIVE") {
            // Get harmony type from the analysis we did earlier
            const harmonyResult = colorHSLs.length > 0
                ? ColorHarmony.analyzeHarmony(colorHSLs)
                : null;

            if (harmonyResult?.type === 'MONOCHROMATIC') {
                breakdown.colorHarmony += 10; // Extra bonus for monochrome
                breakdown.reasons.push(`Conservative mode: favoring safe monochrome`);
            }
            if (avgFormality >= 2 && avgFormality <= 4) {
                breakdown.formalityAlignment += 5; // Bonus for moderate formality
            }
        }

        if (stage === "REFINEMENT") {
            // Stricter formality matching
            breakdown.formalityAlignment = Math.max(0, 25 - (formalityDiff * 8));
        }


        if (stage === "SIMPLIFICATION") {
            // Bias for simplicity
            const numColors = colorHSLs.length;
            breakdown.colorHarmony -= (numColors - 1) * 5;
            if (avgFormality < 3) {
                breakdown.formalityAlignment += 10;
                breakdown.reasons.push(`Simplification mode: favoring casual ease`);
            }
        }

        // CALCULATE FINAL SCORE
        const score =
            breakdown.colorHarmony +
            breakdown.formalityAlignment +
            breakdown.styleCoherence +
            breakdown.seasonSuitability -
            breakdown.patternClash -
            breakdown.materialMismatch;

        // CONFIDENCE CALCULATION
        const formalityConfidence = 1.0 - (formalityDiff / 5);
        const numColors = colorHSLs.length;
        const colorConfidence = numColors <= 2 ? 0.4 : 0.1;
        const styleConfidence = maxTagCount >= 2 ? 0.2 : 0;
        outfit.confidence = Math.min(1.0, formalityConfidence + colorConfidence + styleConfidence);

        return { score: Math.max(0, score), breakdown };
    }
}
