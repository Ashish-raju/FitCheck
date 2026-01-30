import { GarmentMeta, ContextSpec, UserProfileMeta, OutfitSlot } from '../types';
import { RulesEngine } from '../rules';

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
            // Don't recommend dirty or archived items unless strictly requested (not imp here)
            if (item.status !== 'active') {
                continue;
            }

            // B. Rule Check (Safety & Culture)
            // Use Phase 4 Rules Logic
            const ruleStatus = RulesEngine.isGarmentAllowed(item, context, userProfile);
            if (!ruleStatus.allowed) {
                // Log veto if debugging is needed
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

        // 2. Cap Results (Optimization)
        // If user has 500 shirts, we don't need all 500. 
        // We will implement a heuristic sort + slice in Phase 6 (Scoring integration)
        // For now, simple slice to prevent OOM
        const LIMIT = 60;
        result.tops = result.tops.slice(0, LIMIT);
        result.bottoms = result.bottoms.slice(0, LIMIT);
        result.layers = result.layers.slice(0, LIMIT);
        result.shoes = result.shoes.slice(0, LIMIT);

        return result;
    }
}
