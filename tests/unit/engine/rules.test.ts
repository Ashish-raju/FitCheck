import { ContextRadar } from '../../../engine/context-radar';
import { RulesEngine } from '../../../engine/rules';
import { GarmentMeta, UserProfileMeta, OutfitSlot, Gender } from '../../../engine/types';

describe('Phase 4: Context & Rules', () => {

    // --- CONTEXT RADAR TESTS ---
    describe('Context Radar', () => {
        it('should detect Wedding context', () => {
            const ctx = ContextRadar.deriveContext({ event: 'Sister\'s Wedding' });
            expect(ctx.eventType).toBe('wedding_guest');
            //expect(ctx.formalityTarget).toBeGreaterThan(8);
        });

        it('should detect Temple context', () => {
            const ctx = ContextRadar.deriveContext({ event: 'Morning Temple Visit' });
            expect(ctx.eventType).toBe('cultural_religious');
            expect(ctx.mood).toBe('serene');
        });

        it('should handle Monsoon weather', () => {
            const ctx = ContextRadar.deriveContext({
                event: 'Work',
                weather: { tempC: 28, condition: 'Rainy', rainProb: 0.9 }
            });
            expect(ctx.weather.rainProb).toBeGreaterThan(0.5);
            expect(ctx.weather.isIndoor).toBe(false);
        });
    });

    // --- RULES ENGINE TESTS ---
    describe('Rules Engine (India Pack)', () => {

        const mockUser: UserProfileMeta = {
            id: 'u1',
            bodyType: 'rectangle',
            skinTone: { hex: '#', undertone: 'warm', contrastLevel: 'medium' },
            fitPreference: 'regular',
            modestyLevel: 8, // Conservative
            palette: { bestColors: [], avoidColors: [] },
            weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
        };

        const templeContext = ContextRadar.deriveContext({ event: 'Temple Poojas' });
        const monsoonContext = ContextRadar.deriveContext({
            event: 'Outdoor',
            weather: { tempC: 25, condition: 'Rain', rainProb: 1.0 }
        });

        it('should VETO mini skirts in Temple', () => {
            const miniSkirt: GarmentMeta = {
                id: 'g1', type: OutfitSlot.Bottom, subtype: 'mini skirt',
                gender: 'women', colors: [], primaryColorHex: '#000',
                fabric: 'cotton', weight: 'light', pattern: 'solid',
                formalityRange: [1, 5], seasonScores: {} as any, versatility: 1,
                fitType: 'regular', bestForBodyTypes: [],
                cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
            };

            const result = RulesEngine.isGarmentAllowed(miniSkirt, templeContext, mockUser);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('revealing');
        });

        it('should ALLOW maxi skirt in Temple', () => {
            const maxiSkirt: GarmentMeta = {
                id: 'g2', type: OutfitSlot.Bottom, subtype: 'maxi skirt',
                gender: 'women', colors: [], primaryColorHex: '#000',
                fabric: 'cotton', weight: 'light', pattern: 'solid',
                formalityRange: [1, 5], seasonScores: {} as any, versatility: 1,
                fitType: 'regular', bestForBodyTypes: [],
                cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
            };

            const result = RulesEngine.isGarmentAllowed(maxiSkirt, templeContext, mockUser);
            expect(result.allowed).toBe(true);
        });

        it('should VETO Suede in Monsoon', () => {
            const suedeShoes: GarmentMeta = {
                id: 'g3', type: OutfitSlot.Shoes, subtype: 'loafers',
                gender: 'men', colors: [], primaryColorHex: '#000',
                fabric: 'suede', weight: 'medium', pattern: 'solid',
                formalityRange: [1, 8], seasonScores: {} as any, versatility: 1,
                fitType: 'regular', bestForBodyTypes: [],
                cantBeLayeredUnder: false, requiresLayering: false, status: 'active'
            };

            const result = RulesEngine.isGarmentAllowed(suedeShoes, monsoonContext, mockUser);
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('weather');
        });
    });
});
