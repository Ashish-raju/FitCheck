import type { Outfit, Context, Inventory, PieceID, CalibrationStage } from "../../truth/types";
import { InventoryGraph } from "../graph/inventoryGraph";
import { OutfitBuilder } from "../graph/outfitBuilder";
import { FilterGateway } from "./filterGateway";
import { AestheticRules } from "./aestheticRules";

export class ScoringOrchestrator {
    private graph: InventoryGraph;
    private builder: OutfitBuilder;

    constructor(inventory: Inventory) {
        this.graph = new InventoryGraph(inventory);
        this.builder = new OutfitBuilder(this.graph);
    }

    public generateAndRank(context: Context, stage: CalibrationStage = "CONSERVATIVE"): Outfit[] {
        // 1. Filter pieces first (Optimization)
        // Actually builder uses graph directly.
        // We can either filter graph or filter generated outfits.
        // Filtering graph is more efficient.
        // But Graph is stateful? No, standard class.
        // Let's filter post-generation or pre-filter lists.

        const allOutfits = this.builder.getAllPossibleOutfits();
        const validOutfits: Outfit[] = [];

        for (const outfit of allOutfits) {
            const pieces = outfit.items.map(id => this.graph.getPiece(id)).filter((p): p is import("../../truth/types").Piece => !!p);

            // 2. Apply Hard Filter Gates
            const allPassed = pieces.every(p => FilterGateway.filterPiece(p, context));
            if (!allPassed) continue;

            // 3. Score
            outfit.pieces = pieces;
            outfit.score = AestheticRules.scoreOutfit(outfit, pieces, context, stage);
            validOutfits.push(outfit);
        }

        // 4. Sort deterministic (Score desc, then ID to break ties)
        return validOutfits.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.id.localeCompare(b.id);
        });
    }
}
