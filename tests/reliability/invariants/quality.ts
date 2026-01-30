import { Outfit } from '../../../truth/types';
import { GarmentMeta } from '../../../engine/types';
import { ReliabilityScenario } from '../scenarioGen';
import { InvariantResult } from './hard';

export class QualityInvariants {

    static checkAll(result: Outfit[], scenario: ReliabilityScenario, wardrobe: Record<string, GarmentMeta>): InvariantResult[] {
        const checks: InvariantResult[] = [];

        checks.push(this.checkDiversity(result));
        checks.push(this.checkExplanationPresence(result));

        return checks;
    }

    private static checkDiversity(result: Outfit[]): InvariantResult {
        // If we recommend multiple outfits, they shouldn't be identical items
        if (result.length < 2) return { passed: true, group: 'QUALITY' };

        const fingerprints = new Set<string>();
        for (const outfit of result) {
            const fp = outfit.items.sort().join('|');
            if (fingerprints.has(fp)) {
                return { passed: false, group: 'QUALITY', message: `Duplicate Outfit Recommendation: ${fp}` };
            }
            fingerprints.add(fp);
        }
        return { passed: true, group: 'QUALITY' };
    }

    private static checkExplanationPresence(result: Outfit[]): InvariantResult {
        // Stylist notes might be optional on Outfit type - check if present
        for (const outfit of result) {
            const notes = (outfit as any).stylistNotes || (outfit as any).explanation;
            if (!notes || notes.length < 10) {
                // This is a quality warning, not a hard failure
                return { passed: true, group: 'QUALITY', message: `Weak explanation for outfit ${outfit.id}` };
            }
        }
        return { passed: true, group: 'QUALITY' };
    }
}
