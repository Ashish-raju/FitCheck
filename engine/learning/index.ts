/**
 * LEARNING SYSTEM
 * 
 * Implements personalized preference learning from user feedback.
 * Uses exponential moving average for Bayesian-style updates.
 */

import { GarmentMeta, UserProfileMeta } from '../types';
import { ENGINE_CONFIG } from '../outfit/config';

export type FeedbackAction = 'WORN' | 'LIKED' | 'SKIPPED' | 'DISLIKED';

export interface FeedbackEvent {
    userId: string;
    garmentIds: string[];
    action: FeedbackAction;
    timestamp: number;
    context?: string; // e.g., "wedding", "office"
}

export interface LearningProfile {
    userId: string;
    garmentAffinities: Map<string, number>;  // garmentId -> affinity score (0-1)
    patternPreferences: Map<string, number>; // pattern type -> preference (-1 to 1)
    colorPreferences: Map<string, number>;   // color family -> preference (-1 to 1)
    formalityTolerance: number;              // Adjusted based on feedback (0-1)
    lastUpdated: number;
}

export class LearningEngine {

    /**
     * Update learning profile based on user feedback
     */
    static updateFromFeedback(
        profile: LearningProfile,
        event: FeedbackEvent,
        affectedGarments: GarmentMeta[]
    ): LearningProfile {

        const weight = ENGINE_CONFIG.FEEDBACK_WEIGHTS[event.action];
        const learningRate = ENGINE_CONFIG.LEARNING_RATE;

        const updatedProfile = { ...profile };

        // 1. Update garment-specific affinities
        for (const garmentId of event.garmentIds) {
            const currentAffinity = profile.garmentAffinities.get(garmentId) || 0.5;
            const newAffinity = this.exponentialMovingAverage(
                currentAffinity,
                weight,
                learningRate
            );
            updatedProfile.garmentAffinities.set(garmentId, newAffinity);
        }

        // 2. Update pattern preferences (generalize from specific items)
        for (const garment of affectedGarments) {
            if (garment.pattern) {
                const currentPref = profile.patternPreferences.get(garment.pattern) || 0;
                const newPref = this.exponentialMovingAverage(
                    currentPref,
                    weight * 0.3,  // Reduced weight for generalization
                    learningRate
                );
                updatedProfile.patternPreferences.set(garment.pattern, newPref);
            }
        }

        // 3. Update color preferences
        for (const garment of affectedGarments) {
            for (const color of garment.colors) {
                const colorFamily = this.getColorFamily(color.hue);
                const currentPref = profile.colorPreferences.get(colorFamily) || 0;
                const newPref = this.exponentialMovingAverage(
                    currentPref,
                    weight * 0.2,  // Reduced weight
                    learningRate
                );
                updatedProfile.colorPreferences.set(colorFamily, newPref);
            }
        }

        // 4. Update formality tolerance (if worn/liked, adjust tolerance)
        if (event.action === 'WORN' || event.action === 'LIKED') {
            // Calculate average formality of outfit
            const avgFormality = affectedGarments.reduce((sum, g) => {
                return sum + (g.formalityRange[0] + g.formalityRange[1]) / 2;
            }, 0) / affectedGarments.length;

            // Adjust tolerance based on what they actually wore
            const normalizedFormality = avgFormality / 10; // 0-1 scale
            updatedProfile.formalityTolerance = this.exponentialMovingAverage(
                profile.formalityTolerance,
                normalizedFormality,
                learningRate * 0.5  // Slower adjustment
            );
        }

        updatedProfile.lastUpdated = Date.now();

        return updatedProfile;
    }

    /**
     * Apply learned preferences to boost/penalize item scores
     */
    static applyLearning(
        itemScore: number,
        garment: GarmentMeta,
        profile: LearningProfile
    ): number {
        let adjusted = itemScore;

        // 1. Garment-specific affinity (strong signal)
        const affinity = profile.garmentAffinities.get(garment.id);
        if (affinity !== undefined) {
            // affinity = 0 → penalty -0.2
            // affinity = 0.5 → neutral
            // affinity = 1 → boost +0.2
            const affinityBoost = (affinity - 0.5) * 0.4;
            adjusted += affinityBoost;
        }

        // 2. Pattern preference (medium signal)
        if (garment.pattern) {
            const patternPref = profile.patternPreferences.get(garment.pattern);
            if (patternPref !== undefined) {
                adjusted += patternPref * 0.1;  // ±10% max adjustment
            }
        }

        // 3. Color preference (weak signal)
        const avgColorPref = garment.colors
            .map(c => {
                const family = this.getColorFamily(c.hue);
                return profile.colorPreferences.get(family) || 0;
            })
            .reduce((a, b) => a + b, 0) / (garment.colors.length || 1);

        adjusted += avgColorPref * 0.05;  // ±5% max adjustment

        return Math.max(0, Math.min(1, adjusted));  // Clamp to [0, 1]
    }

    /**
     * Exponential moving average: new_value = (1-α)*old + α*new_signal
     */
    private static exponentialMovingAverage(
        oldValue: number,
        newSignal: number,
        alpha: number
    ): number {
        return (1 - alpha) * oldValue + alpha * newSignal;
    }

    /**
     * Map hue (0-360) to color family name
     */
    private static getColorFamily(hue: number): string {
        if (hue >= 0 && hue < 15) return 'red';
        if (hue >= 15 && hue < 45) return 'orange';
        if (hue >= 45 && hue < 75) return 'yellow';
        if (hue >= 75 && hue < 150) return 'green';
        if (hue >= 150 && hue < 210) return 'cyan';
        if (hue >= 210 && hue < 270) return 'blue';
        if (hue >= 270 && hue < 330) return 'purple';
        return 'red';  // 330-360 wraps back to red
    }

    /**
     * Initialize a new learning profile
     */
    static createProfile(userId: string): LearningProfile {
        return {
            userId,
            garmentAffinities: new Map(),
            patternPreferences: new Map(),
            colorPreferences: new Map(),
            formalityTolerance: 0.5,  // Neutral starting point
            lastUpdated: Date.now()
        };
    }

    /**
     * Get insights from learning profile for UI display
     */
    static getInsights(profile: LearningProfile): string[] {
        const insights: string[] = [];

        // Top liked patterns
        const topPattern = Array.from(profile.patternPreferences.entries())
            .filter(([_, pref]) => pref > 0.3)
            .sort((a, b) => b[1] - a[1])[0];

        if (topPattern) {
            insights.push(`You tend to prefer ${topPattern[0]} patterns`);
        }

        // Favorite color families
        const topColors = Array.from(profile.colorPreferences.entries())
            .filter(([_, pref]) => pref > 0.2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        if (topColors.length > 0) {
            const colorNames = topColors.map(([name]) => name).join(' and ');
            insights.push(`Your favorite colors are ${colorNames}`);
        }

        // Formality preference
        if (profile.formalityTolerance < 0.3) {
            insights.push('You prefer casual, relaxed styles');
        } else if (profile.formalityTolerance > 0.7) {
            insights.push('You lean toward formal, polished looks');
        }

        return insights;
    }
}
