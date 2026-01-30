import { StylistEngineFacade } from '../../../engine/facade';
import { OutfitSlot, Gender, ContextSpec, UserProfileMeta, GarmentMeta } from '../../../engine/types';

describe('StylistEngineFacade', () => {

    // Mock Data
    const mockUser: UserProfileMeta = {
        id: 'user_123',
        bodyType: 'rectangle',
        skinTone: {
            hex: '#F0C0A0',
            undertone: 'warm',
            contrastLevel: 'medium'
        },
        fitPreference: 'regular',
        modestyLevel: 5,
        palette: {
            bestColors: [],
            avoidColors: []
        },
        weights: {
            comfort: 1,
            style: 1,
            colorHarmony: 1,
            novelty: 1
        }
    };

    const mockContext: ContextSpec = {
        eventType: 'casual_dinner',
        formalityTarget: 3,
        weather: {
            tempC: 25,
            rainProb: 0,
            isIndoor: true
        },
        timeOfDay: 'evening',
        hardVetoes: [],
        mood: 'relaxed'
    };

    const mockGarment: GarmentMeta = {
        id: 'g_1',
        type: OutfitSlot.Top,
        subtype: 't-shirt',
        gender: 'men',
        colors: [],
        primaryColorHex: '#FFFFFF',
        fabric: 'cotton',
        weight: 'light',
        pattern: 'solid',
        formalityRange: [1, 4],
        seasonScores: {
            summer: 1,
            monsoon: 0.5,
            winter: 0,
            transitional: 0.8
        },
        versatility: 0.9,
        fitType: 'regular',
        bestForBodyTypes: ['rectangle'],
        cantBeLayeredUnder: false,
        requiresLayering: false,
        status: 'active'
    };

    test('generateOutfits returns empty result in Phase 2 Stub', async () => {
        const result = await StylistEngineFacade.generateOutfits(
            mockUser.id,
            mockUser,
            mockContext,
            [mockGarment]
        );

        expect(result).toBeDefined();
        expect(result.candidates).toEqual([]);
        expect(result.debugLog).toContain('Engine initialized (Phase 2 Stub)');
    });

    test('scoreOutfit returns neutral score in Phase 2 Stub', async () => {
        const candidate = {
            id: 'outfit_1',
            items: [mockGarment],
            totalScore: 0, // Initial
            subscores: {
                colorHarmony: 0,
                contextMatch: 0,
                bodyFlattery: 0,
                seasonality: 0,
                stylistPick: 0
            },
            isComplete: false,
            missingSlots: [OutfitSlot.Bottom, OutfitSlot.Shoes],
            warnings: []
        };

        const result = await StylistEngineFacade.scoreOutfit(
            candidate,
            mockContext,
            mockUser
        );

        expect(result.totalScore).toBe(0.5);
    });
});
