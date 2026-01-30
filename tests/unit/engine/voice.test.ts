import { StylistVoice } from '../../../engine/stylist-voice';
import { ContextRadar } from '../../../engine/context-radar';
import { GarmentMeta, UserProfileMeta, OutfitCandidate, OutfitSlot, ContextSpec } from '../../../engine/types';

describe('Phase 7: Stylist Voice', () => {

    const mockUser: UserProfileMeta = {
        id: 'u1', bodyType: 'rectangle', skinTone: { hex: '#', undertone: 'warm', contrastLevel: 'medium' },
        fitPreference: 'regular', modestyLevel: 5,
        palette: { bestColors: [100], avoidColors: [200] },
        weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
    };

    const casualContext: ContextSpec = {
        eventType: 'Casual Hangout', formalityTarget: 2,
        weather: { tempC: 22, rainProb: 0, isIndoor: false },
        timeOfDay: 'afternoon', hardVetoes: [], mood: 'relaxed'
    };
    const formalContext: ContextSpec = {
        eventType: 'Job Interview', formalityTarget: 9,
        weather: { tempC: 22, rainProb: 0, isIndoor: true },
        timeOfDay: 'morning', hardVetoes: [], mood: 'focused'
    };
    const summerContext: ContextSpec = {
        eventType: 'Beach', formalityTarget: 5,
        weather: { tempC: 35, rainProb: 0, isIndoor: false },
        timeOfDay: 'afternoon', hardVetoes: [], mood: 'fun'
    };
    const winterContext: ContextSpec = {
        eventType: 'Snow', formalityTarget: 5,
        weather: { tempC: 5, rainProb: 0, isIndoor: false },
        timeOfDay: 'morning', hardVetoes: [], mood: 'cozy'
    };

    // Mock Items with color 100 which is in bestColors
    const niceShirt: GarmentMeta = {
        id: 't1', type: OutfitSlot.Top, subtype: 'shirt', gender: 'men', colors: [{ hex: '#F00', dictColorId: 100 } as any], primaryColorHex: '#F00',
        fabric: 'cotton', weight: 'light', pattern: 'solid', formalityRange: [4, 7],
        seasonScores: { summer: 0.5, winter: 0.5, monsoon: 0.5, transitional: 0.5 },
        versatility: 1, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const dullShirt: GarmentMeta = {
        id: 't2', type: OutfitSlot.Top, subtype: 'shirt', gender: 'men', colors: [{ hex: '#F00', dictColorId: 999 } as any], primaryColorHex: '#F00',
        fabric: 'cotton', weight: 'light', pattern: 'solid', formalityRange: [4, 7],
        seasonScores: { summer: 0.5, winter: 0.5, monsoon: 0.5, transitional: 0.5 },
        versatility: 1, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    const mockOutfit: OutfitCandidate = {
        id: 'o1', items: [niceShirt], totalScore: 0.8,
        subscores: {} as any, isComplete: true, missingSlots: [], warnings: []
    };

    const dullOutfit: OutfitCandidate = {
        id: 'o2', items: [dullShirt], totalScore: 0.8,
        subscores: {} as any, isComplete: true, missingSlots: [], warnings: []
    };


    it('should explain formality correctly', () => {
        const text1 = StylistVoice.explainOutfit(mockOutfit, formalContext, mockUser);
        expect(text1).toContain('Sharp and professional');

        const text2 = StylistVoice.explainOutfit(mockOutfit, casualContext, mockUser);
        expect(text2).toContain('Relaxed and comfortable');
    });

    it('should explain seasonality correctly', () => {
        const textS = StylistVoice.explainOutfit(mockOutfit, summerContext, mockUser);
        expect(textS).toContain('Breathable fabrics');

        const textW = StylistVoice.explainOutfit(mockOutfit, winterContext, mockUser);
        expect(textW).toContain('Warm layers');
    });

    it('should compliment color if matching palette', () => {
        const textWithColor = StylistVoice.explainOutfit(mockOutfit, casualContext, mockUser);
        expect(textWithColor).toContain('Features colors that complement');
    });

    it('should NOT compliment color if NOT matching palette', () => {
        const textNoColor = StylistVoice.explainOutfit(dullOutfit, casualContext, mockUser);
        expect(textNoColor).not.toContain('complement');
    });

});
