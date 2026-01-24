import type { Outfit, Context, Piece, CalibrationStage } from "../../truth/types";
import { InventoryGraph } from "../graph/inventoryGraph";

export class AestheticRules {
    /**
     * Calculates a deterministic score for an outfit based on context.
     * Higher is better.
     */
    public static scoreOutfit(outfit: Outfit, pieces: Piece[], context: Context, stage: CalibrationStage = "CONSERVATIVE"): number {
        let score = 0;

        // 1. Color Harmony (Simplified: Monotone boost)
        const colors = pieces.map(p => p.color);
        const uniqueColors = new Set(colors);

        // Bonus for all same color or high coordination
        if (uniqueColors.size === 1) {
            score += 20;
        } else if (uniqueColors.size === 2) {
            score += 10;
        }

        // 2. Formality Matching (Occasion vs Formality)
        // Heuristic: Work = 4, Casual = 2, Formal = 5
        let targetFormality = 3;
        if (context.occasion === "Work") targetFormality = 4;
        if (context.occasion === "Formal") targetFormality = 5;
        if (context.occasion === "Casual") targetFormality = 2;

        const avgFormality = pieces.reduce((sum, p) => sum + p.formality, 0) / pieces.length;
        const formalityDiff = Math.abs(avgFormality - targetFormality);
        score += Math.max(0, 50 - (formalityDiff * 20));

        // --- THE TRUST BIAS ---
        if (stage === "CONSERVATIVE") {
            // Favor monochrome
            if (uniqueColors.size === 1) score += 30;
            // Favor moderate formality (safe)
            if (avgFormality >= 2 && avgFormality <= 4) score += 20;
        }

        if (stage === "REFINEMENT") {
            // Strictly match target formality
            score += Math.max(0, 40 - (formalityDiff * 30));
        }

        if (stage === "SIMPLIFICATION") {
            // Bias for few colors and low effort
            score -= (uniqueColors.size * 10);
            if (avgFormality < 3) score += 30;
        }

        // --- CONFIDENCE CALCULATION (SILENT) ---
        const formalityConfidence = 1.0 - (formalityDiff / 5);
        const colorConfidence = uniqueColors.size <= 2 ? 0.4 : 0.1;
        outfit.confidence = Math.min(1.0, formalityConfidence + colorConfidence);

        return score;
    }
}
