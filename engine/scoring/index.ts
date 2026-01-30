import { GarmentMeta, ContextSpec, UserProfileMeta, OutfitCandidate, Season } from '../types';
import { RulesEngine } from '../rules';

export class ScoringEngine {

    /**
     * Score a single garment against the context and user
     * Returns 0.0 - 1.0
     */
    static scoreItem(
        garment: GarmentMeta,
        context: ContextSpec,
        user: UserProfileMeta
    ): number {
        let score = 0.0; // Base score (Start low, earn points)

        // 1. Formality Match (Bell Curve)
        const itemFormality = this.getAverageFormality(garment);
        const formalityDistance = Math.abs(itemFormality - context.formalityTarget);

        // Formality Logic:
        // Stricter curve. Distance of 4 should range-ban the item.
        // Dist 0 -> 1.0
        // Dist 2 -> 0.75
        // Dist 4 -> 0.5
        // Dist 8 -> 0.0
        const formalityScore = Math.max(0, 1 - (formalityDistance / 8.0));
        score += (formalityScore * 0.5); // 50% weight (High importance)

        // 2. Seasonality
        // Uses the seasonScores map in GarmentMeta
        // We find the 'season' from context (derived from month/weather) and lookup score.
        // Simplified: 'summer' if temp > 25, 'winter' if < 15, etc.
        const currentSeason = this.getSeasonFromContext(context);
        const seasonScore = garment.seasonScores[currentSeason] || 0.5;
        score += (seasonScore * 0.3); // 30% weight

        // 3. User Preferences (Palette & Body)
        // Palette
        if (garment.colors[0]) {
            if (user.palette.bestColors.includes(garment.colors[0].dictColorId || -1)) {
                score += 0.1; // Bonus
            } else if (user.palette.avoidColors.includes(garment.colors[0].dictColorId || -1)) {
                score -= 0.2; // Penalty
            }
        }

        // Body Fit
        if (garment.bestForBodyTypes.includes(user.bodyType)) {
            score += 0.1; // Bonus
        }

        // 4. Boost for Versatility if score is decent
        if (score > 0.4) {
            score += (garment.versatility * 0.1);
        }

        return Math.max(0, Math.min(1, score)); // Clamp 0-1
    }

    static scoreOutfit(
        outfit: OutfitCandidate,
        context: ContextSpec,
        user: UserProfileMeta
    ): number {
        // 1. Base Integrity
        const vetoCheck = RulesEngine.isOutfitAllowed(outfit, context);
        if (!vetoCheck.allowed) return 0;

        let totalScore = 0;
        let validItems = 0;

        for (const item of outfit.items) {
            const itemScore = this.scoreItem(item, context, user);
            totalScore += itemScore;
            validItems++;
        }

        // 2. Harmony (Color/Pattern)
        // Placeholder: If we had color harmony logic, we'd apply a multiplier here.
        // e.g. totalScore *= harmonyMultiplier;

        return validItems > 0 ? (totalScore / validItems) : 0;
    }

    // --- HELPERS ---

    private static getAverageFormality(g: GarmentMeta): number {
        return (g.formalityRange[0] + g.formalityRange[1]) / 2;
    }

    private static getSeasonFromContext(ctx: ContextSpec): Season {
        if (ctx.weather.tempC > 30) return 'summer';
        if (ctx.weather.tempC < 15) return 'winter';
        if (ctx.weather.rainProb > 0.5) return 'monsoon';
        return 'transitional';
    }
}
