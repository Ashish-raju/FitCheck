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

        // OPTIMIZATION: If total combinations are manageable (e.g., < 50k), 
        // it is faster and more uniform to generate ALL and shuffle/slice, 
        // rather than random sampling which suffers from collision performance decay.
        const GENERATION_THRESHOLD = 50000;

        if (totalPossible <= GENERATION_THRESHOLD) {
            return this.generateAllAndShuffle(tops, bottoms, shoes, maxCombos);
        }

        // If truly huge, fall back to sampling
        console.log(`[OutfitBuilder] Space too large (${totalPossible}), using random sampling for ${maxCombos} items`);
        return this.sampleOutfits(tops, bottoms, shoes, maxCombos);
    }

    /**
     * Deterministic generation of all combinations followed by Fisher-Yates shuffle.
     * Guaranteed to finish in linear time relative to totalPossible.
     */
    private generateAllAndShuffle(
        tops: import("../../truth/types").Piece[],
        bottoms: import("../../truth/types").Piece[],
        shoes: import("../../truth/types").Piece[],
        limit: number
    ): Outfit[] {
        const outfits: Outfit[] = [];

        // 1. Generate ALL (Fast for < 50k)
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

        // 2. Fisher-Yates Shuffle
        for (let i = outfits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [outfits[i], outfits[j]] = [outfits[j], outfits[i]];
        }

        // 3. Slice
        return outfits.slice(0, limit);
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

        // Safety break to prevent infinite loops if RNG is bad
        let attempts = 0;
        const maxAttempts = maxCombos * 10;

        while (outfits.length < maxCombos && attempts < maxAttempts) {
            attempts++;
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
