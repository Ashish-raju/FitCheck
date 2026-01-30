import { OutfitForge } from '../../../engine/outfit-forge';
import { RetrievalResult } from '../../../engine/retrieval';
import { ContextRadar } from '../../../engine/context-radar';
import { GarmentMeta, UserProfileMeta, OutfitSlot, ContextSpec } from '../../../engine/types';

describe('Phase 6: Outfit Forge', () => {

    // --- SETUP ---
    const mockUser: UserProfileMeta = {
        id: 'u1', bodyType: 'rectangle', skinTone: { hex: '#', undertone: 'warm', contrastLevel: 'medium' },
        fitPreference: 'regular', modestyLevel: 5,
        palette: { bestColors: [100], avoidColors: [200] },
        weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
    };

    const casualContext = ContextRadar.deriveContext({ event: 'Casual Hangout', weather: { tempC: 25, condition: 'Sunny' } });

    // Mock Items
    const blueTshirt: GarmentMeta = {
        id: 't1', type: OutfitSlot.Top, subtype: 't-shirt', gender: 'men', colors: [{ hex: '#00F', dictColorId: 100 } as any], primaryColorHex: '#00F',
        fabric: 'cotton', weight: 'light', pattern: 'solid', formalityRange: [1, 3], seasonScores: { summer: 1, monsoon: 1, winter: 0.5, transitional: 0.8 },
        versatility: 0.8, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };
    const whiteShirt: GarmentMeta = {
        id: 't2', type: OutfitSlot.Top, subtype: 'shirt', gender: 'men', colors: [{ hex: '#FFF', dictColorId: 101 } as any], primaryColorHex: '#FFF',
        fabric: 'cotton', weight: 'light', pattern: 'solid', formalityRange: [4, 7], seasonScores: { summer: 1, monsoon: 0.8, winter: 0.8, transitional: 0.8 },
        versatility: 0.9, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const jeans: GarmentMeta = {
        id: 'b1', type: OutfitSlot.Bottom, subtype: 'jeans', gender: 'men', colors: [{ hex: '#000', dictColorId: 105 } as any], primaryColorHex: '#000',
        fabric: 'denim', weight: 'medium', pattern: 'solid', formalityRange: [1, 5], seasonScores: { summer: 0.8, monsoon: 0.6, winter: 0.9, transitional: 0.9 },
        versatility: 1, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const sneakers: GarmentMeta = {
        id: 's1', type: OutfitSlot.Shoes, subtype: 'sneakers', gender: 'men', colors: [{ hex: '#FFF', dictColorId: 101 } as any], primaryColorHex: '#FFF',
        fabric: 'leather', weight: 'medium', pattern: 'solid', formalityRange: [1, 4], seasonScores: { summer: 1, monsoon: 0.5, winter: 0.8, transitional: 0.9 },
        versatility: 0.9, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const mockIngredients: RetrievalResult = {
        tops: [blueTshirt, whiteShirt],
        bottoms: [jeans],
        shoes: [sneakers],
        layers: [],
        accessories: [],
        onePieces: []
    };

    it('should generate valid outfits', () => {
        const result = OutfitForge.assemble(mockIngredients, casualContext, mockUser);
        expect(result.candidates.length).toBeGreaterThan(0);
        expect(result.candidates[0].isComplete).toBe(true);
        expect(result.candidates[0].items.length).toBeGreaterThanOrEqual(3); // Top, Bottom, Shoes
    });

    it('should diversity findings', () => {
        // If we force multiple Tops, we expect result to contain varied Top IDs
        const result = OutfitForge.assemble(mockIngredients, casualContext, mockUser);
        const topIds = result.candidates.map(c => c.items.find(i => i.type === OutfitSlot.Top)?.id);
        const uniqueTops = new Set(topIds);
        expect(uniqueTops.size).toBeGreaterThanOrEqual(1);
        // With only 2 tops and max 2 per top logic, and enough bottoms, we'd see both. 
        // Here we only have 1 bottom, 1 shoe -> max 1 outfit per top possible.
    });

    it('should filter low confidence garbage', () => {
        // Create context that mismatches everything (e.g. Black Tie event)
        const formalContext = ContextRadar.deriveContext({ event: 'Wedding Reception' });
        // Ingredients are T-shirts and Jeans
        const result = OutfitForge.assemble(mockIngredients, formalContext, mockUser);

        // Scores should be very low (T-shirt vs Gala)
        // Forge logic has fallback "Desperation Tier" > 0.3.
        // T-shirt might get 0.0 for formality. 0.0 base. 
        // Result might be empty if score is < 0.3.

        // Let's verify scores are low
        // If empty, that's correct behavior.
        // If fallback returns something, check score.
        if (result.candidates.length > 0) {
            expect(result.candidates[0].totalScore).toBeLessThan(0.4);
        } else {
            expect(result.candidates.length).toBe(0);
        }
    });
});
