import { Outfit } from '../../../truth/types';
import { GarmentMeta } from '../../../engine/types';
import { ReliabilityScenario } from '../scenarioGen';

export interface InvariantResult {
    passed: boolean;
    group: string;
    message?: string;
}

export class HardInvariants {

    static checkAll(result: Outfit[], scenario: ReliabilityScenario, wardrobe: Record<string, GarmentMeta>): InvariantResult[] {
        const checks: InvariantResult[] = [];

        checks.push(this.checkNoHallucinations(result, wardrobe));
        checks.push(this.checkConfidence(result));
        checks.push(this.checkVetoes(result, scenario, wardrobe));

        return checks;
    }

    private static checkNoHallucinations(result: Outfit[], wardrobe: Record<string, GarmentMeta>): InvariantResult {
        for (const outfit of result) {
            for (const itemId of outfit.items) {
                if (!wardrobe[itemId]) {
                    return { passed: false, group: 'HARD_SAFETY', message: `Hallucinated ID: ${itemId}` };
                }
            }
        }
        return { passed: true, group: 'HARD_SAFETY' };
    }

    private static checkConfidence(result: Outfit[]): InvariantResult {
        // Assuming min score should be > 0.5? Or just > 0.
        // If result is empty, that's allowed? 
        // If result exists, score must be valid.
        for (const outfit of result) {
            if (outfit.score < 0) {
                return { passed: false, group: 'HARD_SAFETY', message: `Negative Score: ${outfit.score}` };
            }
        }
        return { passed: true, group: 'HARD_SAFETY' };
    }

    private static checkVetoes(result: Outfit[], scenario: ReliabilityScenario, wardrobe: Record<string, GarmentMeta>): InvariantResult {
        if (scenario.context.event === 'Funeral') {
            for (const outfit of result) {
                for (const itemId of outfit.items) {
                    const item = wardrobe[itemId];
                    // Simple check: Check for bright colors?
                    // Hex based heuristic? Or just rely on 'formality'?
                    // For now, let's just assert no 'Shorts' at Funeral (if that logic exists)
                    if (item.subtype === 'Shorts') {
                        return { passed: false, group: 'HARD_SAFETY', message: `Veto Violation: Shorts at Funeral` };
                    }
                }
            }
        }
        return { passed: true, group: 'HARD_SAFETY' };
    }
}
