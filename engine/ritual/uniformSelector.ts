import type { Outfit, Inventory, Context } from "../../truth/types";
import { SafetyValve } from "../core/safetyValve";
import { ScoringOrchestrator } from "../core/scoringOrchestrator";

export class UniformSelector {
    /**
     * Selects a guaranteed safety uniform when the ritual fails (max rejections).
     * In V1, this just triggers the SafetyValve logic to get the best available safe option,
     * effectively rebooting the choice with relaxed constraints or simplest valid option.
     */
    public static selectSafetyUniform(inventory: Inventory, context: Context): Outfit {
        const orchestrator = new ScoringOrchestrator(inventory);
        // SAFETY UNIFORM: We force SIMPLIFICATION stage which biases for basics and fewer pieces.
        const simplifiedOrdered = orchestrator.generateAndRank(context, "SIMPLIFICATION");

        if (simplifiedOrdered.length > 0) {
            return simplifiedOrdered[0];
        }

        return SafetyValve.ensureResult(orchestrator, context, inventory);
    }
}
