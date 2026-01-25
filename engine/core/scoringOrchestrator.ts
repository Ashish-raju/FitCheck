import type { Outfit, Context, Inventory, PieceID, CalibrationStage } from "../../truth/types";
import { InventoryGraph } from "../graph/inventoryGraph";
import { OutfitBuilder } from "../graph/outfitBuilder";
import { FilterGateway } from "./filterGateway";
import { AestheticRules, ScoreBreakdown } from "./aestheticRules";
import { WardrobeIndexBuilder, WardrobeIndex } from "./wardrobeIndex";
import { EngineDebugger } from "../debug/engineDebugger";

// Extend Outfit type to include breakdown
interface OutfitWithBreakdown extends Outfit {
    breakdown?: ScoreBreakdown;
}

export class ScoringOrchestrator {
    private graph: InventoryGraph;
    private builder: OutfitBuilder;
    private wardrobeIndex: WardrobeIndex;

    constructor(inventory: Inventory) {
        this.graph = new InventoryGraph(inventory);
        this.builder = new OutfitBuilder(this.graph);

        // Build wardrobe index for analytics
        this.wardrobeIndex = WardrobeIndexBuilder.build(inventory);

        // Log wardrobe stats on initialization
        EngineDebugger.logWardrobeStats(this.wardrobeIndex);
        EngineDebugger.logSampleItems(this.wardrobeIndex, 5);
    }

    public generateAndRank(context: Context, stage: CalibrationStage = "CONSERVATIVE"): OutfitWithBreakdown[] {
        const startTime = performance.now();

        const allOutfits = this.builder.getAllPossibleOutfits(4000); // Cap at 4000
        const validOutfits: OutfitWithBreakdown[] = [];

        for (const outfit of allOutfits) {
            const pieces = outfit.items.map(id => this.graph.getPiece(id)).filter((p): p is import("../../truth/types").Piece => !!p);

            // Apply Hard Filter Gates
            const allPassed = pieces.every(p => FilterGateway.filterPiece(p, context));
            if (!allPassed) continue;

            // Score with explainable breakdown
            outfit.pieces = pieces;
            const { score, breakdown } = AestheticRules.scoreOutfit(outfit, pieces, context, stage);
            outfit.score = score;
            (outfit as OutfitWithBreakdown).breakdown = breakdown;

            validOutfits.push(outfit as OutfitWithBreakdown);
        }

        // Sort deterministic (Score desc, then ID to break ties)
        const sorted = validOutfits.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.id.localeCompare(b.id);
        });

        const endTime = performance.now();

        // Log performance metrics
        EngineDebugger.logPerformanceMetrics(
            allOutfits.length,
            validOutfits.length,
            endTime - startTime
        );

        // Log top 3 recommendations
        sorted.slice(0, 3).forEach((outfit, i) => {
            EngineDebugger.logOutfitRecommendation(outfit, outfit.breakdown, i + 1);
        });

        return sorted;
    }
}
