import type { Inventory, Context, Outfit, PieceID, OutfitID, Piece } from "../../truth/types";
import { InventoryGraph } from "../../state/inventory/inventoryGraph";
import { CONSTRAINTS } from "../../truth/constraints";

// PURE FUNCTION: SELECT
// deterministic(Inventory, Context) -> Outfit
export function selectOutfit(inventory: Inventory, context: Context): Outfit {
    const validPieces = Object.values(inventory.pieces).filter(p => p.status === "Clean" || !p.status);

    const tops = validPieces.filter(p => p.category === "Top");
    const bottoms = validPieces.filter(p => p.category === "Bottom");
    const shoes = validPieces.filter(p => p.category === "Shoes");
    const outerwear = validPieces.filter(p => p.category === "Outerwear");

    if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
        throw new Error("PHYSICAL_LAW_VIOLATION: Missing essential categories (top, bottom, shoes).");
    }

    // Deterministic Selection Logic
    // We want the most appropriate for the context first, then use ID for stability.

    // Simple Score: warmth matching context temperature (rough mapping)
    // 0-10C: Warmth 4-5
    // 10-20C: Warmth 3
    // 20-30C+: Warmth 1-2
    const targetWarmth = context.temperature < 10 ? 5 : (context.temperature < 20 ? 3 : 1);

    const scorePiece = (p: Piece) => {
        const warmthScore = 5 - Math.abs(p.warmth - targetWarmth);
        return warmthScore;
    };

    const pickBest = (pieces: Piece[]) => {
        return pieces.sort((a, b) => {
            const scoreA = scorePiece(a);
            const scoreB = scorePiece(b);
            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.id.localeCompare(b.id); // Seed-level determinism
        })[0];
    };

    const selectedTop = pickBest(tops);
    const selectedBottom = pickBest(bottoms);
    const selectedShoes = pickBest(shoes);

    const items = [selectedTop.id, selectedBottom.id, selectedShoes.id];

    // Optional outerwear if cold
    if (context.temperature < 15 && outerwear.length > 0) {
        items.push(pickBest(outerwear).id);
    }

    const outfitId = `outfit_${items.sort().join("_")}` as OutfitID;

    return {
        id: outfitId,
        items,
        pieces: [selectedTop, selectedBottom, selectedShoes, ...(context.temperature < 15 && outerwear.length > 0 ? [pickBest(outerwear)] : [])],
        score: 1.0
    };
}
