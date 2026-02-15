/**
 * COLOR HARMONY UTILITIES
 * 
 * Implements color wheel theory for outfit coordination.
 * Uses HSL color space for accurate harmony calculations.
 */

import { ENGINE_CONFIG, COLOR_WHEEL } from '../outfit/config';

export interface ColorHSL {
    hue: number;        // 0-360 degrees
    saturation: number; // 0-100 %
    lightness: number;  // 0-100 %
    hex: string;        // Original hex for reference
}

/**
 * Color harmony types based on color wheel relationships
 */
export type ColorHarmonyType =
    | 'MONOCHROMATIC'       // Same hue, different S/L
    | 'ANALOGOUS'           // Adjacent hues (±30°)
    | 'COMPLEMENTARY'       // Opposite hues (180°)
    | 'SPLIT_COMPLEMENTARY' // Base + two adjacent to complement
    | 'TRIADIC'             // 120° apart
    | 'TETRADIC'            // Double complementary
    | 'CHAOTIC';            // No clear relationship

export interface ColorHarmonyResult {
    type: ColorHarmonyType;
    score: number;          // From ENGINE_CONFIG.COLOR_SCORES
    confidence: number;     // 0-1, how clear the pattern is
    reasoning: string;
}

export class ColorHarmony {

    /**
     * Analyzes color relationships and returns harmony type + score
     */
    static analyzeHarmony(colors: ColorHSL[]): ColorHarmonyResult {
        if (colors.length === 0) {
            return {
                type: 'CHAOTIC',
                score: 0,
                confidence: 0,
                reasoning: 'No colors provided'
            };
        }

        if (colors.length === 1) {
            return {
                type: 'MONOCHROMATIC',
                score: ENGINE_CONFIG.COLOR_SCORES.MONOCHROMATIC,
                confidence: 1.0,
                reasoning: 'Single color used'
            };
        }

        // Extract hues
        const hues = colors.map(c => c.hue);

        // Check each harmony type in order of preference

        // 1. MONOCHROMATIC (same hue ± tolerance)
        if (this.isMonochromatic(hues)) {
            return {
                type: 'MONOCHROMATIC',
                score: ENGINE_CONFIG.COLOR_SCORES.MONOCHROMATIC,
                confidence: 0.95,
                reasoning: `All colors share the same hue family (${Math.round(hues[0])}°)`
            };
        }

        // 2. ANALOGOUS (adjacent hues)
        if (this.isAnalogous(hues)) {
            const avgHue = Math.round(hues.reduce((a, b) => a + b, 0) / hues.length);
            return {
                type: 'ANALOGOUS',
                score: ENGINE_CONFIG.COLOR_SCORES.ANALOGOUS,
                confidence: 0.85,
                reasoning: `Colors are neighbors on the wheel (centered ~${avgHue}°)`
            };
        }

        // 3. COMPLEMENTARY (opposite hues)
        if (hues.length === 2 && this.isComplementary(hues[0], hues[1])) {
            return {
                type: 'COMPLEMENTARY',
                score: ENGINE_CONFIG.COLOR_SCORES.COMPLEMENTARY,
                confidence: 0.9,
                reasoning: `Classic complementary pair (${Math.round(hues[0])}° and ${Math.round(hues[1])}°)`
            };
        }

        // 4. TRIADIC (120° apart)
        if (hues.length === 3 && this.isTriadic(hues)) {
            return {
                type: 'TRIADIC',
                score: ENGINE_CONFIG.COLOR_SCORES.TRIADIC,
                confidence: 0.8,
                reasoning: `Balanced triadic scheme (120° spacing)`
            };
        }

        // 5. SPLIT COMPLEMENTARY
        if (hues.length === 3 && this.isSplitComplementary(hues)) {
            return {
                type: 'SPLIT_COMPLEMENTARY',
                score: ENGINE_CONFIG.COLOR_SCORES.SPLIT_COMPLEMENTARY,
                confidence: 0.75,
                reasoning: `Split complementary (softer than direct complement)`
            };
        }

        // 6. TETRADIC (4 colors in two complementary pairs)
        if (hues.length === 4 && this.isTetradic(hues)) {
            return {
                type: 'TETRADIC',
                score: ENGINE_CONFIG.COLOR_SCORES.TETRADIC,
                confidence: 0.65,
                reasoning: `Complex tetradic scheme (two complementary pairs)`
            };
        }

        // 7. CHAOTIC (no recognizable pattern)
        return {
            type: 'CHAOTIC',
            score: ENGINE_CONFIG.COLOR_SCORES.CHAOTIC,
            confidence: 0.3,
            reasoning: `${hues.length} colors without clear harmony relationship`
        };
    }

    /**
     * Check if all hues are within tolerance of each other (same hue family)
     */
    private static isMonochromatic(hues: number[]): boolean {
        if (hues.length < 2) return true;

        const tolerance = COLOR_WHEEL.TOLERANCE.MONOCHROMATIC;
        const baseHue = hues[0];

        return hues.every(h => this.hueDifference(h, baseHue) <= tolerance);
    }

    /**
     * Check if hues are adjacent (within 30° of each other)
     */
    private static isAnalogous(hues: number[]): boolean {
        if (hues.length < 2) return false;

        const tolerance = COLOR_WHEEL.TOLERANCE.ANALOGOUS;
        const sorted = [...hues].sort((a, b) => a - b);

        // Check if all hues fit within a 60° arc
        const range = this.hueDifference(sorted[sorted.length - 1], sorted[0]);

        return range <= tolerance * 2; // Within ±30° = 60° total range
    }

    /**
     * Check if two hues are complementary (opposite on wheel)
     */
    private static isComplementary(hue1: number, hue2: number): boolean {
        const diff = this.hueDifference(hue1, hue2);
        const tolerance = COLOR_WHEEL.TOLERANCE.COMPLEMENTARY;

        // Complementary = 180° ± tolerance
        return Math.abs(diff - 180) <= tolerance;
    }

    /**
     * Check if three hues form a triadic relationship (120° apart)
     */
    private static isTriadic(hues: number[]): boolean {
        if (hues.length !== 3) return false;

        const sorted = [...hues].sort((a, b) => a - b);
        const [h1, h2, h3] = sorted;

        const diff1 = this.hueDifference(h2, h1);
        const diff2 = this.hueDifference(h3, h2);
        const diff3 = this.hueDifference(h1 + 360, h3); // Wrap around

        const tolerance = 30; // ±30° from ideal 120°

        // All three differences should be close to 120°
        return (
            Math.abs(diff1 - 120) <= tolerance &&
            Math.abs(diff2 - 120) <= tolerance &&
            Math.abs(diff3 - 120) <= tolerance
        );
    }

    /**
     * Check if three hues form split complementary
     * (base + two colors adjacent to its complement)
     */
    private static isSplitComplementary(hues: number[]): boolean {
        if (hues.length !== 3) return false;

        // Try each hue as the base
        for (let i = 0; i < 3; i++) {
            const base = hues[i];
            const others = hues.filter((_, idx) => idx !== i);

            const complement = (base + 180) % 360;

            // Check if the other two hues are adjacent to the complement
            const diff1 = Math.abs(this.hueDifference(others[0], complement));
            const diff2 = Math.abs(this.hueDifference(others[1], complement));

            // Both should be 20-40° from complement (adjacent but not exact)
            if (diff1 >= 20 && diff1 <= 40 && diff2 >= 20 && diff2 <= 40) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if four hues form tetradic (rectangle on color wheel)
     */
    private static isTetradic(hues: number[]): boolean {
        if (hues.length !== 4) return false;

        const sorted = [...hues].sort((a, b) => a - b);

        // Check if we have two complementary pairs
        const tolerance = 30;

        // Pair 1: hues[0] and hues[2]
        // Pair 2: hues[1] and hues[3]
        const comp1 = Math.abs(this.hueDifference(sorted[0], sorted[2]) - 180);
        const comp2 = Math.abs(this.hueDifference(sorted[1], sorted[3]) - 180);

        return comp1 <= tolerance && comp2 <= tolerance;
    }

    /**
     * Calculate shortest angular difference between two hues (0-180°)
     */
    private static hueDifference(hue1: number, hue2: number): number {
        const diff = Math.abs(hue1 - hue2);
        return diff > 180 ? 360 - diff : diff;
    }

    /**
     * Convert hex color to HSL
     */
    static hexToHSL(hex: string): ColorHSL {
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Parse RGB
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / delta + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / delta + 4) / 6;
                    break;
            }
        }

        return {
            hue: Math.round(h * 360),
            saturation: Math.round(s * 100),
            lightness: Math.round(l * 100),
            hex: `#${hex}`
        };
    }
}
