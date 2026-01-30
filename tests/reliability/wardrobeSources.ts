import { GarmentMeta } from '../../engine/types';
import { ReliabilityConfig } from './config';

// Mock types if needed, or import GarmentMeta
// Assuming GarmentMeta is robust.

export class WardrobeSource {

    // Deterministic generation
    static generateFuzzWardrobe(size: number, seed: number): Record<string, GarmentMeta> {
        // Simple LCG for wardrobe content
        let state = seed % 2147483647;
        const next = () => {
            state = (state * 48271) % 2147483647;
            return state / 2147483647;
        };
        const nextInt = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
        const pick = <T>(arr: T[]) => arr[nextInt(0, arr.length - 1)];

        const items: Record<string, GarmentMeta> = {};

        for (let i = 0; i < size; i++) {
            const id = `g_${i}`;

            // Randomly intentionally create "bad" data? 
            // Phase 1: Create mostly valid but weird data
            const type = pick(['top', 'bottom', 'shoes', 'layer', 'one-piece', 'accessory']);
            const subtype = pick(['t-shirt', 'jeans', 'sneakers', 'jacket', 'dress', 'watch']);

            items[id] = {
                id,
                type: type as any,
                subtype: subtype,
                gender: 'unisex',
                colors: [{
                    hex: pick(['#000', '#FFF', '#F00', '#0F0', '#00F', '#FF0', '#0FF', '#F0F']),
                    hue: 0, saturation: 0, value: 0, undetone: 'neutral', dictColorId: 0
                }],
                primaryColorHex: '#000',
                processingStatus: 'processed',

                // Random Attributes
                fabric: pick(['cotton', 'silk', 'polyester', 'wool', 'denim', 'leather']),
                weight: pick(['light', 'medium', 'heavy']),
                pattern: pick(['solid', 'striped', 'floral', 'dot', 'check']),
                fitType: pick(['tight', 'regular', 'loose']),

                // Scores
                formalityRange: [nextInt(1, 5), nextInt(6, 10)], // potentially invalid range [8, 4]?
                seasonScores: {
                    summer: next(),
                    winter: next(),
                    monsoon: next(),
                    transitional: next()
                },
                versatility: next(),

                status: 'active',
                lastWornTimestamp: 0,
                wornCount: 0,
                costPerWear: 0
            } as any as GarmentMeta; // loose casting for robustness

            // Inject Adversarial Traits
            if (next() < 0.05) {
                // 5% chance of missing critical fields (simulated by 'any' cast) or invalid
                (items[id] as any).type = 'INVALID_TYPE';
            }
        }
        return items;
    }

    // Placeholder for Real DB
    static async loadRealWardrobe(userId: string): Promise<Record<string, GarmentMeta>> {
        console.warn('Real DB loading not active in CLI mode. Returning mock.');
        return this.generateFuzzWardrobe(50, 999);
    }
}
