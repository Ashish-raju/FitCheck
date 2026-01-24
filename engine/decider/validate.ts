import type { Outfit, Context } from "../../truth/types.ts";
import { CONSTRAINTS } from "../../truth/constraints.ts";

export function validateOutfit(outfit: Outfit, context: Context): boolean {
    // 1. Structure Check
    if (outfit.items.length < CONSTRAINTS.INVENTORY.MIN_ITEMS_FOR_VALID_OUTFIT) {
        return false;
    }

    // 2. Context Check
    // In V1, we just return true if structure is valid.
    // Real thermal checks would go here.
    if (context.temperature < CONSTRAINTS.CONTEXT.COLD_THRESHOLD) {
        // Logic to check if outfit has Outerwear would prevent "Shorts in Snow"
        // For now, pass.
    }

    return true;
}
