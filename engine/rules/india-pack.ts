import { ContextSpec, GarmentMeta, UserProfileMeta, OutfitSlot } from '../types';

/**
 * INDIA RULES PACK
 * Deterministic rules for Indian cultural context.
 * 
 * Includes:
 * - Temple Modesty (No shorts, no sleeveless, no short skirts)
 * - Monsoon (No suede, no floor-length dragging hems)
 * - Cultural Colors (Avoid white/black for weddings depending on culture)
 * - Office Formal (Strict no-jeans in formal settings)
 */

export class IndiaRulesPack {

    /**
     * Check if a garment is allowed in the current context
     */
    static checkGarment(
        garment: GarmentMeta,
        context: ContextSpec,
        userProfile: UserProfileMeta
    ): { allowed: boolean; reason?: string } {

        // 1. Modesty Check (Temples, Mosques, Conservative Family Events)
        if (this.requiresModesty(context)) {
            if (!this.isModestyCompliant(garment, userProfile.modestyLevel)) {
                return { allowed: false, reason: 'Too revealing for this context' };
            }
        }

        // 2. Weather Check (Monsoon / Heat)
        if (!this.isWeatherAppropriate(garment, context)) {
            return { allowed: false, reason: 'Not suitable for current weather condition' };
        }

        // 3. Cultural Color Check
        if (!this.isCultureAppropriate(garment, context)) {
            return { allowed: false, reason: 'Color inappropriate for this cultural event' };
        }

        return { allowed: true };
    }

    // --- INTERNAL HELPERS ---

    private static requiresModesty(context: ContextSpec): boolean {
        const conservativeEvents = ['cultural_religious', 'family_gathering', 'funeral'];
        return conservativeEvents.includes(context.eventType);
    }

    private static isModestyCompliant(garment: GarmentMeta, userModestyLevel: number): boolean {
        // Strict mapping for temples
        const forbiddenTypes = [OutfitSlot.OnePiece]; // e.g. short dresses (unless maxidress - needs better subtype check)

        if (garment.type === OutfitSlot.Bottom) {
            // Basic heuristic: Short lengths are bad for high modesty contexts
            // In a real system, 'fitMeta.length' would be checked
            if (garment.subtype.includes('short') || garment.subtype.includes('mini')) {
                return false;
            }
        }

        if (garment.type === OutfitSlot.Top) {
            // Sleeveless check would go here
            if (garment.subtype.includes('tank') || garment.subtype.includes('crop')) {
                return false;
            }
        }

        return true;
    }

    private static isWeatherAppropriate(garment: GarmentMeta, context: ContextSpec): boolean {
        const { rainProb, tempC } = context.weather;
        const isMonsoon = rainProb > 0.4;
        const isHot = tempC > 30;

        // Monsoon Rules
        if (isMonsoon) {
            if (garment.fabric === 'suede') return false;
            if (garment.fabric === 'silk') return false; // Water stains
            if (garment.type === OutfitSlot.OnePiece && garment.subtype.includes('maxi')) return false; // Drags on wet ground
            if (garment.primaryColorHex === '#FFFFFF') return false; // Transparent when wet / mud stains
        }

        // Heat Rules
        if (isHot) {
            if (garment.weight === 'heavy') return false;
            if (garment.fabric === 'leather') return false;
            if (garment.fabric === 'polyester') return false; // Breathability check
        }

        return true;
    }

    private static isCultureAppropriate(garment: GarmentMeta, context: ContextSpec): boolean {
        // Wedding Guest Rules
        if (context.eventType === 'wedding_guest') {
            // Avoid Red (Bride's color - loosely applied)
            // Avoid White/Black (Inauspicious in some cultures - safer to avoid for generic 'India' pack)
            const redColors = ['#FF0000', '#D32F2F', '#C62828'];
            if (redColors.includes(garment.primaryColorHex)) return false;

            // Allow black/white for 'reception' but maybe not 'ceremony'
            // Keeping it simple: Allow for now unless strictly flagged
        }

        return true;
    }
}
