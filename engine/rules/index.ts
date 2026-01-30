import { ContextSpec, GarmentMeta, UserProfileMeta, OutfitCandidate } from '../types';
import { IndiaRulesPack } from './india-pack';

export interface RuleResult {
    allowed: boolean;
    reason?: string;
}

export class RulesEngine {

    /**
     * Check if a single garment is allowed in the context
     */
    static isGarmentAllowed(
        garment: GarmentMeta,
        context: ContextSpec,
        userProfile: UserProfileMeta
    ): RuleResult {

        // 1. Check Hard Vetoes from Context
        // (e.g. user manually said "NO JEANS")
        // This logic needs parsing of hardVetoes strings vs garment types

        // 2. Run India Rules Pack
        // In verify mode, we might swap this based on user locale
        const indiaResult = IndiaRulesPack.checkGarment(garment, context, userProfile);
        if (!indiaResult.allowed) {
            return indiaResult;
        }

        // 3. User Vetoes (from Profile)
        // e.g. "I never wear yellow" logic (handled in scoring mostly, but hard vetoes here)
        if (userProfile.palette.avoidColors.includes(garment.colors[0]?.dictColorId || -1)) {
            // For now, let's treat 'avoid' as scoring penalty, not hard rule, unless strict.
            // But if 'modesty' is high, strict rules apply.
        }

        return { allowed: true };
    }

    /**
     * Check if an entire outfit is valid
     */
    static isOutfitAllowed(
        outfit: OutfitCandidate,
        context: ContextSpec
    ): RuleResult {

        // 1. Missing Slots Check
        if (!outfit.isComplete) {
            // Some contexts REQUIRE shoes, etc.
            // For now, allowed, but scored low.
        }

        // 2. Cohesion Rules
        // e.g. "Don't wear Pattern on Pattern" if style pref is Minimalist

        return { allowed: true };
    }
}
