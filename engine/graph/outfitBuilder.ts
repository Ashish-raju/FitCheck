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
     * Now with sampling to cap at maxCombos for performance.
     */
    public getAllPossibleOutfits(maxCombos: number = 4000): Outfit[] {
        const tops = this.graph.getPiecesByCategory("Top");
        const bottoms = this.graph.getPiecesByCategory("Bottom");
        const shoes = this.graph.getPiecesByCategory("Shoes");

        const totalPossible = tops.length * bottoms.length * shoes.length;

        console.log(`[OutfitBuilder] Wardrobe size: ${tops.length} tops × ${bottoms.length} bottoms × ${shoes.length} shoes = ${totalPossible} possible combinations`);

        // If too many combinations, use sampling
        if (totalPossible > maxCombos) {
            console.log(`[OutfitBuilder] Sampling ${maxCombos} combinations from ${totalPossible} to prevent performance issues`);
            return this.sampleOutfits(tops, bottoms, shoes, maxCombos);
        }

        // Generate all combinations if under limit
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

    /**
     * Sample random combinations to cap computational cost
     */
    private sampleOutfits(
        tops: import("../../truth/types").Piece[],
        bottoms: import("../../truth/types").Piece[],
        shoes: import("../../truth/types").Piece[],
        maxCombos: number
    ): Outfit[] {
        const outfits: Outfit[] = [];
        const seen = new Set<string>();

        while (outfits.length < maxCombos) {
            const top = tops[Math.floor(Math.random() * tops.length)];
            const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const shoe = shoes[Math.floor(Math.random() * shoes.length)];

            // Ensure uniqueness
            const key = `${top.id}-${bottom.id}-${shoe.id}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const outfit = this.buildOutfit(top.id, bottom.id, shoe.id);
            if (outfit) {
                outfits.push(outfit);
            }
        }

        return outfits;
    }
}
