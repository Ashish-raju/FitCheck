/**
 * INDIA PACK - Cultural Fashion Rules
 * 
 * Handles Indian cultural context, festivals, regional variations,
 * fabric formality tiers, and modesty guidelines.
 */

import { GarmentMeta, ContextSpec, UserProfileMeta } from '../types';
import { INDIA_PACK } from '../outfit/config';

export interface CulturalRule {
    id: string;
    name: string;
    description: string;
    apply: (garment: GarmentMeta, context: ContextSpec, user: UserProfileMeta) => { allowed: boolean; reason?: string };
}

export class IndiaPack {

    /**
     * Check if garment is appropriate for Indian cultural context
     */
    static validateForCulture(
        garment: GarmentMeta,
        context: ContextSpec,
        user: UserProfileMeta
    ): { allowed: boolean; reason?: string } {

        // 1. Festival-specific rules
        const festivalCheck = this.checkFestivalRules(garment, context);
        if (!festivalCheck.allowed) return festivalCheck;

        // 2. Regional appropriateness
        const regionalCheck = this.checkRegionalRules(garment, context);
        if (!regionalCheck.allowed) return regionalCheck;

        // 3. Modesty requirements
        const modestyCheck = this.checkModestyRules(garment, user);
        if (!modestyCheck.allowed) return modestyCheck;

        // 4. Fabric-formality matching
        const fabricCheck = this.checkFabricFormality(garment, context);
        if (!fabricCheck.allowed) return fabricCheck;

        return { allowed: true };
    }

    /**
     * Festival-specific clothing rules
     */
    private static checkFestivalRules(
        garment: GarmentMeta,
        context: ContextSpec
    ): { allowed: boolean; reason?: string } {
        const event = context.eventType.toLowerCase();

        // DIWALI: Prefer bright colors, avoid dull/dark unless very formal
        if (event.includes('diwali')) {
            // Check if colors are bright (high saturation)
            const isBright = garment.colors.some(c => c.saturation > 60 && c.value > 40);
            if (!isBright && context.formalityTarget < 7) {
                return {
                    allowed: false,
                    reason: 'Diwali prefers bright, festive colors'
                };
            }
        }

        // HOLI: Avoid white and expensive fabrics (they'll get stained!)
        if (event.includes('holi')) {
            const isWhite = garment.colors.some(c => c.value > 90 && c.saturation < 10);
            if (isWhite) {
                return {
                    allowed: false,
                    reason: 'White not recommended for Holi (color festival)'
                };
            }

            const expensiveFabrics = ['silk', 'brocade', 'velvet', 'satin'];
            if (expensiveFabrics.includes(garment.fabric.toLowerCase())) {
                return {
                    allowed: false,
                    reason: 'Save expensive fabrics from Holi colors'
                };
            }
        }

        // EID: High formality + high modesty
        if (event.includes('eid')) {
            const avgFormality = (garment.formalityRange[0] + garment.formalityRange[1]) / 2;
            if (avgFormality < 7) {
                return {
                    allowed: false,
                    reason: 'Eid requires formal attire'
                };
            }
        }

        // WEDDING (as guest): No white, no black (traditionally)
        if (event.includes('wedding') && event.includes('guest')) {
            const isWhite = garment.colors.some(c => c.value > 90 && c.saturation < 10);
            const isBlack = garment.colors.some(c => c.value < 20 && c.saturation < 20);

            if (isWhite || isBlack) {
                return {
                    allowed: false,
                    reason: 'Avoid white/black as wedding guest (cultural tradition)'
                };
            }
        }

        // POOJA/TEMPLE: Modest, traditional, no loud graphics
        if (event.includes('temple') || event.includes('pooja')) {
            if (garment.pattern === 'graphic') {
                return {
                    allowed: false,
                    reason: 'Avoid loud graphics for temple/pooja'
                };
            }
        }

        return { allowed: true };
    }

    /**
     * Regional climate and style preferences
     */
    private static checkRegionalRules(
        garment: GarmentMeta,
        context: ContextSpec
    ): { allowed: boolean; reason?: string } {
        // Note: Would need location data for full implementation
        // For now, use weather as proxy

        const temp = context.weather.tempC;
        const isHumid = context.weather.rainProb > 0.3;

        // South India / Coastal: Light, breathable fabrics in hot+humid
        if (temp > 30 && isHumid) {
            const heavyFabrics = ['wool', 'velvet', 'heavy_cotton', 'denim'];
            if (heavyFabrics.includes(garment.fabric.toLowerCase()) && garment.weight === 'heavy') {
                return {
                    allowed: false,
                    reason: 'Too heavy for hot & humid climate'
                };
            }
        }

        // North India / Winter: Layering is common and expected
        if (temp < 15) {
            // This is informational, not a veto
            // Could boost score for layerable items
        }

        return { allowed: true };
    }

    /**
     * Modesty level validation
     */
    private static checkModestyRules(
        garment: GarmentMeta,
        user: UserProfileMeta
    ): { allowed: boolean; reason?: string } {
        const modestyLevel = user.modestyLevel || 5; // Default moderate

        if (modestyLevel >= INDIA_PACK.MODESTY.HIGH) {
            // High modesty: Avoid revealing items
            const revealingSubtypes = ['crop_top', 'tube_top', 'shorts', 'mini_skirt'];
            if (revealingSubtypes.includes(garment.subtype.toLowerCase())) {
                return {
                    allowed: false,
                    reason: 'Item doesn\'t meet modesty preference'
                };
            }
        }

        if (modestyLevel >= INDIA_PACK.MODESTY.VERY_HIGH) {
            // Very high modesty: Prefer traditional cuts
            // Suggest dupatta/stole for tops
            // This would be a "suggestion" rather than hard veto
        }

        return { allowed: true };
    }

    /**
     * Fabric formality tier validation
     */
    private static checkFabricFormality(
        garment: GarmentMeta,
        context: ContextSpec
    ): { allowed: boolean; reason?: string } {
        const fabric = garment.fabric.toLowerCase();
        const targetFormality = context.formalityTarget;

        // Define fabric formality tiers
        const casualFabrics = ['cotton', 'denim', 'jersey', 'fleece'];
        const smartCasualFabrics = ['linen', 'chambray', 'poplin', 'khaki'];
        const formalFabrics = ['silk', 'brocade', 'velvet', 'satin', 'wool_blend'];

        // Very formal events (8-10): Need formal fabrics
        if (targetFormality >= 8) {
            if (casualFabrics.includes(fabric)) {
                return {
                    allowed: false,
                    reason: 'Fabric too casual for very formal event'
                };
            }
        }

        // Formal events (6-7): At least smart-casual fabrics
        if (targetFormality >= 6) {
            if (fabric === 'denim' || fabric === 'fleece' || fabric === 'jersey') {
                return {
                    allowed: false,
                    reason: 'Fabric too casual for formal event'
                };
            }
        }

        // Casual events (1-3): Formal fabrics might be overkill
        // But this is a style preference, not a veto

        return { allowed: true };
    }

    /**
     * Get dupatta/stole/layer suggestions based on context
     */
    static getStylingTips(
        outfit: GarmentMeta[],
        context: ContextSpec,
        user: UserProfileMeta
    ): string[] {
        const tips: string[] = [];

        // High modesty + formal event = suggest dupatta
        if (user.modestyLevel >= INDIA_PACK.MODESTY.HIGH && context.formalityTarget >= 6) {
            const hasDupatta = outfit.some(item =>
                item.subtype.toLowerCase().includes('dupatta') ||
                item.subtype.toLowerCase().includes('stole')
            );

            if (!hasDupatta) {
                tips.push('💡 Consider adding a dupatta or stole for elegant coverage');
            }
        }

        // Festival suggestions
        if (context.eventType.toLowerCase().includes('diwali')) {
            tips.push('✨ Diwali tip: Gold/silver accents add festive sparkle');
        }

        if (context.eventType.toLowerCase().includes('holi')) {
            tips.push('🎨 Holi tip: Wear clothes you don\'t mind staining');
        }

        return tips;
    }
}
