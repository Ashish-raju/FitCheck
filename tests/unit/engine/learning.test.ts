import { FeedbackService } from '../../../engine/feedback';
import { GarmentMeta, UserProfileMeta, OutfitSlot } from '../../../engine/types';

describe('Phase 8: Learning Loop', () => {

    const mockUser: UserProfileMeta = {
        id: 'u1', bodyType: 'rectangle', skinTone: { hex: '#', undertone: 'warm', contrastLevel: 'medium' },
        fitPreference: 'regular', modestyLevel: 5,
        palette: { bestColors: [100], avoidColors: [200] },
        weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
    };

    const shirt: GarmentMeta = {
        id: 't1', type: OutfitSlot.Top, subtype: 'shirt', gender: 'men', colors: [], primaryColorHex: '#F00',
        fabric: 'cotton', weight: 'light', pattern: 'solid', formalityRange: [4, 7], seasonScores: {} as any, versatility: 1, fitType: 'regular', bestForBodyTypes: [], cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
    };

    it('should update timestamp on worn', () => {
        const items = [shirt];
        const initialTime = shirt.lastWornTimestamp || 0;

        FeedbackService.handleInteraction(items, 'worn', mockUser);

        expect(shirt.lastWornTimestamp).toBeGreaterThan(initialTime);
    });

    it('should boost style weight on like', () => {
        const initialStyle = mockUser.weights.style;
        const newUser = FeedbackService.handleInteraction([shirt], 'like', mockUser);

        expect(newUser.weights.style).toBeGreaterThan(initialStyle);
        // Ensure immutability (mostly)
        expect(newUser).not.toBe(mockUser);
    });

    it('should boost harmony weight on dislike', () => {
        const initialHarmony = mockUser.weights.colorHarmony;
        const newUser = FeedbackService.handleInteraction([shirt], 'dislike', mockUser);

        expect(newUser.weights.colorHarmony).toBeGreaterThan(initialHarmony);
    });

});
