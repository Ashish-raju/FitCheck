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
                category: type === 'top' ? 'Top' : type === 'bottom' ? 'Bottom' : type === 'shoes' ? 'Shoes' : 'Other',
                subcategory: subtype,
                color: pick(['#000', '#FFF', '#F00', '#0F0', '#00F', '#FF0', '#0FF', '#F0F']),
                material: pick(['cotton', 'silk', 'polyester', 'wool', 'denim', 'leather']),
                pattern: pick(['solid', 'striped', 'floral', 'dot', 'check']),
                fit: pick(['tight', 'regular', 'loose']),
                status: 'Clean',
                brand: 'Generic',
                cost: 0,
                purchaseDate: new Date().toISOString(),
                stylistMeta: undefined // Force re-analysis or mapping
            } as any as GarmentMeta;

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
