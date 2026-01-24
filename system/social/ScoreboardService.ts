import { StylistEngine } from "../../engine/ai/StylistEngine";
import { VotingSystem } from "./VotingSystem";
import { InventoryStore } from "../../state/inventory/inventoryStore";
import { ContextManager } from "../../context/kernel/contextManager";

export class ScoreboardService {
    private static instance: ScoreboardService;

    private constructor() { }

    public static getInstance(): ScoreboardService {
        if (!ScoreboardService.instance) {
            ScoreboardService.instance = new ScoreboardService();
        }
        return ScoreboardService.instance;
    }

    /**
     * Calculates the aggregate "Drip Score" for the user.
     * Formula: (Avg AI Harmony * 0.4) + (Positive Vote Ratio * 0.6)
     */
    public calculateDripScore(): number {
        const inventory = InventoryStore.getInstance().getInventory();
        const pieces = Object.values(inventory.pieces);
        const stylist = StylistEngine.getInstance();
        const voting = VotingSystem.getInstance();
        const ctx = ContextManager.getInstance().getCurrent();

        if (pieces.length === 0) return 0;

        // 1. Base Score from Portfolio Harmony
        // We simulate a few random combinations to get a "portfolio health" score
        let totalHarmony = 0;
        const sampleCount = Math.min(5, pieces.length);
        for (let i = 0; i < sampleCount; i++) {
            // Mock a simple outfit
            const mockOutfit = {
                id: `sample_${i}` as any,
                items: [pieces[i].id] as any,
                pieces: [pieces[i]],
                score: 0.5
            };
            const analysis = stylist.analyzeOutfit(mockOutfit, { warmth: ctx.weather.temperature / 40, formality: 0.5 });
            totalHarmony += analysis.harmony;
        }
        const avgHarmony = totalHarmony / sampleCount;

        // 2. Social Validation (Mocked since we don't have many real outfits in this prototype)
        // In a real app, this would iterate over the user's "Posted" outfits
        const mockSocialScore = 0.85; // Defaulting to high for prototype feel

        const finalScore = (avgHarmony * 0.4) + (mockSocialScore * 0.6);
        return Math.floor(finalScore * 100);
    }

    /**
     * Calculates the "Portfolio Value" (The Mass)
     */
    public getVaultMetrics() {
        const inventory = InventoryStore.getInstance().getInventory();
        const pieces = Object.values(inventory.pieces);

        // Mock replacement value ($50 avg per item)
        const estimatedValue = pieces.length * 50;
        const dataRetentionDays = 12; // Mock days since first capture

        return {
            itemCount: pieces.length,
            estimatedValue,
            dataRetentionDays,
            unlockedCombos: pieces.length * 2.5 // Mock heuristic
        };
    }
}
