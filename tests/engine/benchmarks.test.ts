/**
 * ENGINE PERFORMANCE BENCHMARKS
 * 
 * Real performance tests with measurements to validate optimization targets.
 */

import { RetrievalEngine } from '../../engine/retrieval';
import { OutfitForge } from '../../engine/outfit-forge';
import { ContextRadar } from '../../engine/context-radar';
import { AestheticRules } from '../../engine/core/aestheticRules';
import { ENGINE_CONFIG } from '../../engine/outfit/config';
import { GarmentMeta, ContextSpec, UserProfileMeta, OutfitSlot } from '../../engine/types';

describe('Engine Performance Benchmarks', () => {

    /**
     * Helper to generate test wardrobe of specified size
     */
    function generateTestWardrobe(size: number): GarmentMeta[] {
        const wardrobe: GarmentMeta[] = [];
        const types = [OutfitSlot.Top, OutfitSlot.Bottom, OutfitSlot.Shoes, OutfitSlot.Layer];

        for (let i = 0; i < size; i++) {
            wardrobe.push({
                id: `item_${i}`,
                type: types[i % types.length],
                subtype: 'shirt',
                name: `Test Item ${i}`,
                status: 'active',
                colors: [{ hue: Math.random() * 360, saturation: 70, value: 50, dictColorId: 1, hex: '#000000' }],
                formalityRange: [3, 5],
                seasonScores: { summer: 0.8, winter: 0.6, monsoon: 0.7, transitional: 0.7 },
                versatility: 0.7,
                bestForBodyTypes: ['rectangle'],
                fabric: 'cotton',
                pattern: 'solid',
                weight: 'medium',
                primaryColorHex: '#000000',
                lastWornTimestamp: 0,
                cantBeLayeredUnder: false
            } as GarmentMeta);
        }

        return wardrobe;
    }

    /**
     * Helper to create test context
     */
    function createTestContext(): ContextSpec {
        return {
            eventType: 'office',
            formalityTarget: 5,
            weather: {
                tempC: 25,
                rainProb: 0.1,
                windSpeed: 5
            },
            timeOfDay: 'afternoon',
            season: 'summer'
        } as ContextSpec;
    }

    /**
     * Helper to create test user profile
     */
    function createTestUser(): UserProfileMeta {
        return {
            bodyType: 'rectangle',
            palette: {
                bestColors: [1, 2, 3],
                avoidColors: [10, 11]
            },
            modestyLevel: 5
        } as UserProfileMeta;
    }

    /**
     * Measure execution time
     */
    function measure(fn: () => void): number {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
    }

    // ===== BENCHMARK TESTS =====

    describe('Retrieval Performance', () => {
        it('should retrieve from small wardrobe (30 items) in <100ms', () => {
            const wardrobe = generateTestWardrobe(30);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                RetrievalEngine.findCandidates(wardrobe, context, user);
            });

            console.log(`✅ Small wardrobe retrieval: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.SMALL_WARDROBE);
        });

        it('should retrieve from medium wardrobe (100 items) in <500ms', () => {
            const wardrobe = generateTestWardrobe(100);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                RetrievalEngine.findCandidates(wardrobe, context, user);
            });

            console.log(`✅ Medium wardrobe retrieval: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.MEDIUM_WARDROBE);
        });

        it('should retrieve from large wardrobe (300 items) in <2s', () => {
            const wardrobe = generateTestWardrobe(300);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                RetrievalEngine.findCandidates(wardrobe, context, user);
            });

            console.log(`✅ Large wardrobe retrieval: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.LARGE_WARDROBE);
        });
    });

    describe('Outfit Assembly Performance', () => {
        it('should assemble outfits from small wardrobe in <100ms', () => {
            const wardrobe = generateTestWardrobe(30);
            const context = createTestContext();
            const user = createTestUser();

            const ingredients = RetrievalEngine.findCandidates(wardrobe, context, user);

            const time = measure(() => {
                OutfitForge.assemble(ingredients, context, user);
            });

            console.log(`✅ Small assembly: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.SMALL_WARDROBE);
        });

        it('should assemble outfits from medium wardrobe in <500ms', () => {
            const wardrobe = generateTestWardrobe(100);
            const context = createTestContext();
            const user = createTestUser();

            const ingredients = RetrievalEngine.findCandidates(wardrobe, context, user);

            const time = measure(() => {
                OutfitForge.assemble(ingredients, context, user);
            });

            console.log(`✅ Medium assembly: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.MEDIUM_WARDROBE);
        });
    });

    describe('Scoring Performance', () => {
        it('should score single outfit in <10ms', () => {
            const mockOutfit = {
                id: 'test',
                items: ['item1', 'item2', 'item3'],
                pieces: [
                    { color: '#FF5733', formality: 5, pattern: 'solid', fabric: 'cotton', tags: ['casual'] },
                    { color: '#3366FF', formality: 5, pattern: 'solid', fabric: 'denim', tags: ['casual'] },
                    { color: '#000000', formality: 5, pattern: 'solid', fabric: 'leather', tags: ['casual'] }
                ],
                score: 0
            };

            const context = {
                season: 'summer',
                formality: 5,
                weather: { temp: 25 }
            };

            const time = measure(() => {
                AestheticRules.scoreOutfit(mockOutfit as any, mockOutfit.pieces as any, context as any);
            });

            console.log(`✅ Single outfit scoring: ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(10);
        });

        it('should score 100 outfits in <50ms', () => {
            const mockOutfit = {
                id: 'test',
                items: ['item1', 'item2', 'item3'],
                pieces: [
                    { color: '#FF5733', formality: 5, pattern: 'solid', fabric: 'cotton', tags: ['casual'] },
                    { color: '#3366FF', formality: 5, pattern: 'solid', fabric: 'denim', tags: ['casual'] },
                    { color: '#000000', formality: 5, pattern: 'solid', fabric: 'leather', tags: ['casual'] }
                ],
                score: 0
            };

            const context = {
                season: 'summer',
                formality: 5,
                weather: { temp: 25 }
            };

            const time = measure(() => {
                for (let i = 0; i < 100; i++) {
                    AestheticRules.scoreOutfit(mockOutfit as any, mockOutfit.pieces as any, context as any);
                }
            });

            console.log(`✅ 100 outfit scoring: ${time.toFixed(2)}ms (${(time / 100).toFixed(2)}ms per outfit)`);
            expect(time).toBeLessThan(50);
        });
    });

    describe('End-to-End Pipeline', () => {
        it('should complete full pipeline for small wardrobe in <100ms', () => {
            const wardrobe = generateTestWardrobe(30);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                const ingredients = RetrievalEngine.findCandidates(wardrobe, context, user);
                const outfits = OutfitForge.assemble(ingredients, context, user);
            });

            console.log(`✅ End-to-end (small): ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.SMALL_WARDROBE);
        });

        it('should complete full pipeline for medium wardrobe in <500ms', () => {
            const wardrobe = generateTestWardrobe(100);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                const ingredients = RetrievalEngine.findCandidates(wardrobe, context, user);
                const outfits = OutfitForge.assemble(ingredients, context, user);
            });

            console.log(`✅ End-to-end (medium): ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.MEDIUM_WARDROBE);
        });

        it('should complete full pipeline for large wardrobe in <2s', () => {
            const wardrobe = generateTestWardrobe(300);
            const context = createTestContext();
            const user = createTestUser();

            const time = measure(() => {
                const ingredients = RetrievalEngine.findCandidates(wardrobe, context, user);
                const outfits = OutfitForge.assemble(ingredients, context, user);
            });

            console.log(`✅ End-to-end (large): ${time.toFixed(2)}ms`);
            expect(time).toBeLessThan(ENGINE_CONFIG.PERFORMANCE_TARGETS.LARGE_WARDROBE);
        });
    });
});
