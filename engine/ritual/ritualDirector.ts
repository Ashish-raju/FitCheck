import type { Outfit, Context, Inventory, CalibrationStage } from "../../truth/types";
import { CONSTRAINTS } from "../../truth/constraints";
import { ScoringOrchestrator } from "../core/scoringOrchestrator";
import { RejectionMemory } from "./rejectionMemory";
import { UniformSelector } from "./uniformSelector";

export class RitualDirector {
    private orchestrator: ScoringOrchestrator;
    private memory: RejectionMemory;
    private inventory: Inventory;
    private trustRepairCounter: number = 0; // Sessions remaining in trust repair mode

    constructor(inventory: Inventory) {
        this.inventory = inventory;
        this.orchestrator = new ScoringOrchestrator(inventory);
        this.memory = new RejectionMemory();
    }

    public async startRitual(context: Context): Promise<Outfit> {
        this.memory.clear();
        const outfit = await this.getNextCandidate(context);

        // If we are starting a ritual and it's conservative but confidence is low, 
        // we might already be in a "trust repair" or "low evidence" state.
        return outfit;
    }

    public async rejectResult(outfit: Outfit, context: Context): Promise<Outfit> {
        this.memory.recordRejection(outfit);

        const count = this.memory.getRejectionCount();

        if (count >= CONSTRAINTS.MAX_VETO_COUNT) {
            // Max rejections reached. Force Uniform.
            this.trustRepairCounter = 2; // Enter trust repair for next 2 sessions
            return UniformSelector.selectSafetyUniform(this.inventory, context);
        }

        return await this.getNextCandidate(context);
    }

    private async getNextCandidate(context: Context): Promise<Outfit> {
        const rejectionCount = this.memory.getRejectionCount();
        let stage: CalibrationStage = "CONSERVATIVE";

        if (this.trustRepairCounter > 0) {
            stage = "CONSERVATIVE"; // Force conservatism if repairing trust
            if (rejectionCount === 0) this.trustRepairCounter--;
        } else {
            if (rejectionCount === 1) stage = "REFINEMENT";
            if (rejectionCount === 2) stage = "SIMPLIFICATION";
        }

        const ranked = await this.orchestrator.generateAndRank(context, stage);

        // Find first non-rejected option
        for (const outfit of ranked) {
            if (!this.memory.isRejected(outfit)) {
                // INTERNAL CONFIDENCE GATE
                if (outfit.confidence && outfit.confidence < 0.4 && stage !== "SIMPLIFICATION") {
                    console.log(`[RitualDirector] Low confidence (${outfit.confidence}). Escalating to SIMPLIFICATION.`);
                    return await this.getSimplifiedFallback(context);
                }
                return outfit;
            }
        }

        // If all valid options rejected (unlikely but possible if small inventory),
        // Force Uniform.
        return UniformSelector.selectSafetyUniform(this.inventory, context);
    }

    private async getSimplifiedFallback(context: Context): Promise<Outfit> {
        const simplified = await this.orchestrator.generateAndRank(context, "SIMPLIFICATION");
        return simplified[0] || UniformSelector.selectSafetyUniform(this.inventory, context);
    }
}
