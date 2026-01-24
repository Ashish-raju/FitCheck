import { Outfit } from '../../truth/types';

export interface StyleScore {
    overall: number;
    harmony: number;
    contextMatch: number;
    feedback: string;
}

export class StylistEngine {
    private static instance: StylistEngine;

    private constructor() { }

    public static getInstance(): StylistEngine {
        if (!StylistEngine.instance) {
            StylistEngine.instance = new StylistEngine();
        }
        return StylistEngine.instance;
    }

    /**
     * Analyzes an outfit based on simulated AI heuristics.
     */
    public analyzeOutfit(outfit: Outfit, context: { warmth: number, formality: number }): StyleScore {
        const pieceCount = outfit.pieces.length;
        if (pieceCount === 0) return { overall: 0, harmony: 0, contextMatch: 0, feedback: "Neural state empty." };

        // 1. Harmony: Check for category diversity and color grounding
        const categories = new Set(outfit.pieces.map(p => p.category));
        const hasContrast = outfit.pieces.some(p => p.color.toLowerCase().includes('black') || p.color.toLowerCase().includes('white'));
        const harmony = (categories.size / 3) * 0.7 + (hasContrast ? 0.3 : 0);

        // 2. Context Match: Weighted averages
        const avgWarmth = outfit.pieces.reduce((sum, p) => sum + (p.warmth || 0.5), 0) / pieceCount;
        const avgFormality = outfit.pieces.reduce((sum, p) => sum + (p.formality || 0.5), 0) / pieceCount;

        const warmthDiff = Math.abs(avgWarmth - context.warmth);
        const formalityDiff = Math.abs(avgFormality - context.formality);

        const contextMatch = Math.max(0, 1 - (warmthDiff * 1.5 + formalityDiff * 1.2));
        const overall = (harmony * 0.3) + (contextMatch * 0.7);

        let feedback = "Neural calibration successful. Optimized for current context.";
        if (contextMatch < 0.4) feedback = "Warning: Visual signature misaligned with environmental parameters.";
        else if (harmony < 0.4) feedback = "Style harmony nominal, but structural density is low.";

        return {
            overall: Math.max(0, Math.min(1, overall)),
            harmony: Math.max(0, Math.min(1, harmony)),
            contextMatch,
            feedback
        };
    }
}
