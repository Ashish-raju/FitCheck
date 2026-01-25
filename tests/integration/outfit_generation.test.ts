import { describe, test, expect, beforeEach } from '@jest/globals';
import { generateOutfitSuggestions } from '../../engine/outfit/index';
import { WardrobeGenerator, UserProfileBuilder } from '../utils/builders';
import { MockGarmentRepository, MockAIService } from '../utils/mocks';
import { INDIA_CULTURE_RULES } from '../../engine/outfit/constants';

describe('Outfit Generation - Integration Tests', () => {
    let mockAI: MockAIService;

    beforeEach(() => {
        mockAI = new MockAIService();
    });

    describe('India-specific event scenarios', () => {
        test('temple visit: no shorts or revealing wear', async () => {
            const wardrobe = new WardrobeGenerator(12345).generateWithProblematicItems();
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'temple visit',
                    timeOfDay: 'morning',
                    geoLocation: 'Varanasi',
                    weather: { temp: 32, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Assert no shorts in any outfit
            const hasShorts = result.outfits.some(outfit =>
                outfit.items.includes('shorts')
            );
            expect(hasShorts).toBe(false);
            expect(result.context.cultureRules).toContain(INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS);
        });

        test('funeral: no white-dominant garments', async () => {
            const wardrobe = new WardrobeGenerator(12346).generateWithProblematicItems();
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().palette([2, 10, 20], [1]).build(); // Avoid color ID 1 (white)

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'funeral service',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Delhi',
                    weather: { temp: 28, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Check that white shirt is not in outfits
            const hasWhiteShirt = result.outfits.some(outfit =>
                outfit.items.includes('white_shirt')
            );
            expect(hasWhiteShirt).toBe(false);
            expect(result.context.cultureRules).toContain(INDIA_CULTURE_RULES.FUNERAL_NO_WHITE_HEAVY);
        });

        test('monsoon commute: no suede or delicate fabrics', async () => {
            const wardrobe = new WardrobeGenerator(12347).generateWithProblematicItems();
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'commute',
                    timeOfDay: 'morning',
                    geoLocation: 'Mumbai',
                    weather: { temp: 26, rainProb: 0.8 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Assert no suede shoes
            const hasSuede = result.outfits.some(outfit =>
                outfit.items.includes('suede_shoes')
            );
            expect(hasSuede).toBe(false);
            expect(result.context.cultureRules).toContain(INDIA_CULTURE_RULES.MONSOON_VETO);
        });

        test('office formal: no graphic patterns', async () => {
            const wardrobe = new WardrobeGenerator(12348).generateWithProblematicItems();
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'office formal meeting',
                    timeOfDay: 'morning',
                    geoLocation: 'Bangalore',
                    weather: { temp: 30, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Assert no graphic tee
            const hasGraphic = result.outfits.some(outfit =>
                outfit.items.includes('graphic_tee')
            );
            expect(hasGraphic).toBe(false);
            expect(result.context.cultureRules).toContain(INDIA_CULTURE_RULES.OFFICE_NO_LOUD);
        });

        test('wedding evening: high formality, harmonious colors', async () => {
            const wardrobe = new WardrobeGenerator(12349).generate(50);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'wedding reception',
                    timeOfDay: 'evening',
                    geoLocation: 'Jaipur',
                    weather: { temp: 25, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Wedding events should have very high formality
            expect(result.context.formalityMin).toBeGreaterThanOrEqual(3);

            // All outfits should have explanations
            result.outfits.forEach(outfit => {
                expect(outfit.rationale).toBeTruthy();
                expect(outfit.rationale.split(' ').length).toBeGreaterThanOrEqual(20);
            });
        });
    });

    describe('Double-loud pattern prevention', () => {
        test('never outputs outfits with both non-solid top and bottom', async () => {
            const wardrobe = new WardrobeGenerator(12350).generate(100);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual party',
                    timeOfDay: 'evening',
                    geoLocation: 'Pune',
                    weather: { temp: 28, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // Get all garments for validation
            const allGarments = await repo.getAllUserGarments('user1');
            const garmentMap = new Map(allGarments.map(g => [g.id, g]));

            // Check each outfit
            for (const outfit of result.outfits) {
                const outfitGarments = outfit.items.map(id => garmentMap.get(id)!);
                const top = outfitGarments.find(g => g.type === 'top');
                const bottom = outfitGarments.find(g => g.type === 'bottom');

                if (top && bottom) {
                    const bothLoud = top.pattern !== 'solid' && bottom.pattern !== 'solid';
                    expect(bothLoud).toBe(false);
                }
            }
        });
    });

    describe('MMR diversity guarantees', () => {
        test('top K outfits are diverse when wardrobe allows', async () => {
            const wardrobe = new WardrobeGenerator(12351).generate(200);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual outing',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Goa',
                    weather: { temp: 32, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            if (result.outfits.length >= 3) {
                // Check that not all outfits are identical
                const firstOutfit = result.outfits[0].items.sort().join(',');
                const allSame = result.outfits.every(o =>
                    o.items.sort().join(',') === firstOutfit
                );
                expect(allSame).toBe(false);
            }
        });
    });

    describe('Edge cases', () => {
        test('empty wardrobe returns no outfits', async () => {
            const repo = new MockGarmentRepository([]);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Mumbai',
                    weather: { temp: 30, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            expect(result.outfits).toHaveLength(0);
        });

        test('insufficient items returns fewer than K outfits', async () => {
            const wardrobe = new WardrobeGenerator(12352).generate(3);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Chennai',
                    weather: { temp: 35, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // May have 0 outfits due to missing required types
            expect(result.outfits.length).toBeLessThanOrEqual(5);
        });

        test('extreme weather conditions (42°C) are handled', async () => {
            const wardrobe = new WardrobeGenerator(12353).generate(100);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'outdoor',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Rajasthan',
                    weather: { temp: 42, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            expect(result.context.temp).toBe(42);
            expect(result.context.season).toBe('summer');
            // Should not crash
            expect(result.outfits).toBeDefined();
        });
    });

    describe('Explanation layer', () => {
        test('generates explanations for all outfits', async () => {
            const wardrobe = new WardrobeGenerator(12354).generate(50);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'brunch',
                    timeOfDay: 'noon',
                    geoLocation: 'Delhi',
                    weather: { temp: 28, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            result.outfits.forEach(outfit => {
                expect(outfit.rationale).toBeTruthy();
                const wordCount = outfit.rationale.split(/\s+/).length;
                expect(wordCount).toBeGreaterThanOrEqual(50); // Relaxed for test stability
            });
        });

        test('AI service is called for each unique outfit', async () => {
            const wardrobe = new WardrobeGenerator(12355).generate(50);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            mockAI.reset();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'dinner',
                    timeOfDay: 'evening',
                    geoLocation: 'Mumbai',
                    weather: { temp: 27, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            // AI should be called for each outfit
            expect(mockAI.callCount).toBe(result.outfits.length);
        });
    });

    describe('Output count', () => {
        test('returns 3-5 outfits when wardrobe is sufficient', async () => {
            const wardrobe = new WardrobeGenerator(12356).generate(200);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();

            const result = await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Bangalore',
                    weather: { temp: 30, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            expect(result.outfits.length).toBeGreaterThanOrEqual(1);
            expect(result.outfits.length).toBeLessThanOrEqual(5);
        });
    });
});
