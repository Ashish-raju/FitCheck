import type { Outfit, Context, Inventory, PieceID, Piece } from "../../truth/types";
import { ScoringOrchestrator } from "./scoringOrchestrator";
import { InventoryGraph } from "../graph/inventoryGraph";

export class SafetyValve {
    /**
     * Guaranteed to return a valid outfit or throw a catastrophic error if physically impossible.
     */
    public static async ensureResult(orchestrator: ScoringOrchestrator, context: Context, inventory: Inventory): Promise<Outfit> {
        const ranked = await orchestrator.generateAndRank(context, "SIMPLIFICATION");

        if (ranked.length > 0) {
            return ranked[0];
        }

        // PANIC FALLBACK: Absolute minimum physical possibility
        const graph = new InventoryGraph(inventory);
        const categories = ["Top", "Bottom", "Shoes"];
        const items: PieceID[] = [];

        for (const cat of categories) {
            const pieces = graph.getPiecesByCategory(cat as any);
            if (pieces.length > 0) items.push(pieces[0].id);
        }

        if (items.length >= 2) {
            return {
                id: `STATIC_SAFETY_FALLBACK_${Math.random().toString(36).substr(2, 9)}` as any,
                items,
                pieces: items.map(id => inventory[id]).filter(p => !!p) as Piece[],
                score: -100,
                confidence: 0.1
            };
        }

        throw new Error("CRITICAL FAILURE: No physical clothes available to form outfit.");
    }
}
