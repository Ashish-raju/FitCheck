import { GarmentMeta, ContextSpec, UserProfileMeta, OutfitSlot, Season } from '../types';
import { RulesEngine } from '../rules';
import { ENGINE_CONFIG } from '../outfit/config';

export interface RetrievalResult {
    tops: GarmentMeta[];
    bottoms: GarmentMeta[];
    layers: GarmentMeta[];
    shoes: GarmentMeta[];
    accessories: GarmentMeta[];
    onePieces: GarmentMeta[];
}

export class RetrievalEngine {

    /**
     * Retrieve and filter candidates for a given context
     */
    static findCandidates(
        wardrobe: GarmentMeta[],
        context: ContextSpec,
        userProfile: UserProfileMeta
    ): RetrievalResult {

        const result: RetrievalResult = {
            tops: [],
            bottoms: [],
            layers: [],
            shoes: [],
            accessories: [],
            onePieces: []
        };

        // 1. Filter Loop
        for (const item of wardrobe) {

            // A. Availability Check
            // Don't recommend dirty or archived items
            if (item.status !== 'active') {
                continue;
            }

            // B. Rule Check (Safety & Culture)
            const ruleStatus = RulesEngine.isGarmentAllowed(item, context, userProfile);
            if (!ruleStatus.allowed) {
                continue;
            }

            // C. Slot Sorting
            switch (item.type) {
                case OutfitSlot.Top: result.tops.push(item); break;
                case OutfitSlot.Bottom: result.bottoms.push(item); break;
                case OutfitSlot.Layer: result.layers.push(item); break;
                case OutfitSlot.Shoes: result.shoes.push(item); break;
                case OutfitSlot.Accessory: result.accessories.push(item); break;
                case OutfitSlot.OnePiece: result.onePieces.push(item); break;
            }
        }

        // 2. RANK AND SLICE (Instead of naive slicing)
        // Score each item and take the best ones
        const LIMIT = ENGINE_CONFIG.RETRIEVAL_LIMIT_PER_CATEGORY;

        result.tops = this.rankAndSlice(result.tops, context, userProfile, LIMIT);
        result.bottoms = this.rankAndSlice(result.bottoms, context, userProfile, LIMIT);
        result.layers = this.rankAndSlice(result.layers, context, userProfile, LIMIT);
        result.shoes = this.rankAndSlice(result.shoes, context, userProfile, LIMIT);
        result.accessories = this.rankAndSlice(result.accessories, context, userProfile, LIMIT);
        result.onePieces = this.rankAndSlice(result.onePieces, context, userProfile, LIMIT);

        return result;
    }

    /**
     * Score items, rank them, and return top N
     */
    private static rankAndSlice(
        items: GarmentMeta[],
        context: ContextSpec,
        user: UserProfileMeta,
        limit: number
    ): GarmentMeta[] {
        if (items.length <= limit) {
            return items; // No need to rank if we have fewer items than limit
        }

        // Score each item
        const scored = items.map(item => ({
            item,
            score: this.scoreItem(item, context, user)
        }));

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        // Take top N
        return scored.slice(0, limit).map(s => s.item);
    }

    /**
     * Quick relevance scoring for individual items
     * Considers: formality match, season, user preferences
     */
    private static scoreItem(
        item: GarmentMeta,
        context: ContextSpec,
        user: UserProfileMeta
    ): number {
        let score = 0.5; // Base score

        // 1. Formality Match (40% weight)
        const itemFormality = (item.formalityRange[0] + item.formalityRange[1]) / 2;
        const formalityDiff = Math.abs(itemFormality - context.formalityTarget);
        const formalityScore = Math.max(0, 1 - (formalityDiff / 8.0));
        score += formalityScore * 0.4;

        // 2. Season Match (30% weight)
        const currentSeason = this.getSeasonFromContext(context);
        const seasonScore = item.seasonScores[currentSeason] || 0.5;
        score += seasonScore * 0.3;

        // 3. User Palette Match (20% weight)
        if (item.colors[0]?.dictColorId) {
            const colorId = item.colors[0].dictColorId;
            if (user.palette.bestColors.includes(colorId)) {
                score += 0.2; // Bonus for preferred color
            } else if (user.palette.avoidColors.includes(colorId)) {
                score -= 0.15; // Penalty for avoided color
            }
        }

        // 4. Body Type Match (10% weight)
        if (item.bestForBodyTypes.includes(user.bodyType)) {
            score += 0.1;
        }

        // 5. Versatility Bonus (slight boost for high-versatility items)
        score += item.versatility * 0.05;

        // 6. Recency Penalty (slight penalty for recently worn items)
        if (item.lastWornTimestamp) {
            const daysSinceWorn = (Date.now() - item.lastWornTimestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceWorn < 3) {
                score -= 0.1; // Small penalty for recently worn
            }
        }

        return Math.max(0, Math.min(1, score)); // Clamp to [0, 1]
    }

    /**
     * Determine season from context
     */
    private static getSeasonFromContext(ctx: ContextSpec): Season {
        const { tempC, rainProb } = ctx.weather;

        if (tempC > ENGINE_CONFIG.SEASON.SUMMER_TEMP) return 'summer';
        if (tempC < ENGINE_CONFIG.SEASON.WINTER_TEMP) return 'winter';
        if (rainProb > ENGINE_CONFIG.SEASON.MONSOON_RAIN_PROB) return 'monsoon';
        return 'transitional';
    }
}
