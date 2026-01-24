import { InventoryGraph } from "./inventoryGraph";
import type { Piece, Outfit, OutfitID, PieceID } from "../../truth/types";
// Removed uuid import to be dependency-free

// Strict no-deps/no-external libs was not explicitly "No npm", but "Pure intelligence only".
// I'll stick to a simple ID generator to be safe and dependency-free for the "core" logic if possible, 
// or just use a placeholder ID since we are inside the engine.
// Actually, types says BrandString.

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export class OutfitBuilder {
    private graph: InventoryGraph;

    constructor(graph: InventoryGraph) {
        this.graph = graph;
    }

    /**
     * Generates a physically complete outfit.
     * Rule: Must have Top + Bottom + Shoes.
     * (Optional: Outerwear, Accessory - for now, simplest valid outfit)
     */
    public buildOutfit(topId: PieceID, bottomId: PieceID, shoesId: PieceID): Outfit | null {
        const top = this.graph.getPiece(topId);
        const bottom = this.graph.getPiece(bottomId);
        const shoes = this.graph.getPiece(shoesId);

        if (!top || top.category !== "Top") return null;
        if (!bottom || bottom.category !== "Bottom") return null;
        if (!shoes || shoes.category !== "Shoes") return null;

        return {
            id: generateId() as OutfitID,
            items: [topId, bottomId, shoesId],
            pieces: [], // To be populated by Orchestrator
            score: 0 // To be calculated by Scorer
        };
    }

    /**
     * For simulation/generative purposes, creates *all* possible valid base combinations.
     * Warning: Cartesian product can be large.
     */
    public getAllPossibleOutfits(): Outfit[] {
        const tops = this.graph.getPiecesByCategory("Top");
        const bottoms = this.graph.getPiecesByCategory("Bottom");
        const shoes = this.graph.getPiecesByCategory("Shoes");

        const outfits: Outfit[] = [];

        for (const top of tops) {
            for (const bottom of bottoms) {
                for (const shoe of shoes) {
                    const outfit = this.buildOutfit(top.id, bottom.id, shoe.id);
                    if (outfit) {
                        outfits.push(outfit);
                    }
                }
            }
        }
        return outfits;
    }
}
