import { ScoringEngine } from '../../../engine/scoring';
import { ContextRadar } from '../../../engine/context-radar';
import { GarmentMeta, UserProfileMeta, OutfitSlot, ContextSpec } from '../../../engine/types';

describe('Phase 5: Scoring Core', () => {

    // --- SETUP ---
    const mockUser: UserProfileMeta = {
        id: 'u1',
        bodyType: 'rectangle',
        skinTone: { hex: '#', undertone: 'warm', contrastLevel: 'medium' },
        fitPreference: 'regular',
        modestyLevel: 5,
        palette: { bestColors: [100], avoidColors: [200] },
        weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
    };

    const summerContext = ContextRadar.deriveContext({
        event: 'Casual Hangout',
        weather: { tempC: 32, condition: 'Sunny' }
    });

    const formalContext = ContextRadar.deriveContext({
        event: 'Business Meeting',
        weather: { tempC: 22, condition: 'AC Indoors' }
    });

    const mockTshirt: GarmentMeta = {
        id: 't1', type: OutfitSlot.Top, subtype: 't-shirt',
        gender: 'men', colors: [], primaryColorHex: '#fff',
        fabric: 'cotton', weight: 'light', pattern: 'solid',
        formalityRange: [1, 3], // Very casual
        seasonScores: { summer: 1, monsoon: 0.8, winter: 0.2, transitional: 0.5 },
        versatility: 0.8, fitType: 'regular', bestForBodyTypes: [],
        cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const mockSuitJacket: GarmentMeta = {
        id: 'j1', type: OutfitSlot.Layer, subtype: 'blazer',
        gender: 'men', colors: [], primaryColorHex: '#000',
        fabric: 'wool', weight: 'medium', pattern: 'solid',
        formalityRange: [7, 10], // Formal
        seasonScores: { summer: 0.1, monsoon: 0.3, winter: 1, transitional: 0.8 },
        versatility: 0.6, fitType: 'tailored', bestForBodyTypes: [],
        cantBeLayeredUnder: true, requiresLayering: true, status: 'active'
    };

    it('should score T-shirt HIGH for summer casual', () => {
        const score = ScoringEngine.scoreItem(mockTshirt, summerContext, mockUser);
        // Formality: Target ~2, Item ~2 -> High
        // Season: Summer -> High
        expect(score).toBeGreaterThan(0.7); // 0.8 base + season + formality bonuses
    });

    it('should score Suit Jacket LOW for summer casual', () => {
        const score = ScoringEngine.scoreItem(mockSuitJacket, summerContext, mockUser);
        // Formality: Target ~2, Item ~8.5 -> Low
        // Season: Summer -> Low (0.1)
        expect(score).toBeLessThan(0.4);
    });

    it('should score Suit Jacket HIGH for business meeting', () => {
        const score = ScoringEngine.scoreItem(mockSuitJacket, formalContext, mockUser);
        // Formality: Target ~7 (Office), Item ~8.5 -> Close match
        // Season: AC Indoors (Context might default to comfortable temp, but check logic)
        expect(score).toBeGreaterThan(0.5);
    });
});
