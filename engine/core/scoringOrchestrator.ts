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
    private cachedOutfits: Outfit[] | null = null;

    constructor(inventory: Inventory) {
        this.graph = new InventoryGraph(inventory);
        this.builder = new OutfitBuilder(this.graph);

        // Build wardrobe index for analytics
        this.wardrobeIndex = WardrobeIndexBuilder.build(inventory);

        // Log wardrobe stats on initialization
        EngineDebugger.logWardrobeStats(this.wardrobeIndex);
        EngineDebugger.logSampleItems(this.wardrobeIndex, 5);
    }

    public async generateAndRank(context: Context, stage: CalibrationStage = "CONSERVATIVE"): Promise<OutfitWithBreakdown[]> {
        const startTime = performance.now();

        // Use Background Worker to generate and rank outfits
        // This offloads the heavy loop to a separate thread
        const { runScoringPipeline } = require("../runtime/backgroundWorker");
        const allPieces = this.graph.getAllPieces();

        const sorted = await runScoringPipeline(allPieces, context, stage);

        const endTime = performance.now();

        // Log performance metrics
        EngineDebugger.logPerformanceMetrics(
            sorted.length, // Total generated matches valid ones here since worker filters internaly
            sorted.length,
            endTime - startTime
        );

        // Log top 3 recommendations
        sorted.slice(0, 3).forEach((outfit, i) => {
            EngineDebugger.logOutfitRecommendation(outfit, outfit.breakdown, i + 1);
        });

        return sorted;
    }
}
