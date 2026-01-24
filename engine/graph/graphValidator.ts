import { InventoryGraph } from "./inventoryGraph.ts";
import { CONSTRAINTS } from "../../truth/constraints.ts";

export class GraphValidator {
    public static validate(graph: InventoryGraph): boolean {
        // Physics completeness check: Do we have at least 1 top, 1 bottom, 1 shoes?
        const tops = graph.getPiecesByCategory("Top");
        const bottoms = graph.getPiecesByCategory("Bottom");
        const shoes = graph.getPiecesByCategory("Shoes");

        if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
            // Cannot form any valid outfit
            return false;
        }

        // Additional constraints from CONSTRAINTS can be checked here
        // e.g. MIN_ITEMS_FOR_VALID_OUTFIT is 2 in truth/constraints, 
        // but physically we need 3 for our specific rule (Top+Bottom+Shoe).
        // The constraint file said "e.g. Top + Bottom", so maybe shoes aren't strictly required by *that* constraint,
        // but Phase 3 requirement says "Generate only physically complete outfits".
        // I will assume Top+Bottom+Shoes is the physical completeness standard for V1.

        return true;
    }
}
