import { describe, test, expect } from '@jest/globals';
import { generateOutfitSuggestions } from '../../engine/outfit/index';
import { WardrobeGenerator, UserProfileBuilder } from '../utils/builders';
import { MockGarmentRepository, MockAIService } from '../utils/mocks';

describe('Performance Tests', () => {
    test('P95 latency < 2s for 200 items', async () => {
        const iterations = 10;
        const latencies: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const wardrobe = new WardrobeGenerator(12345 + i).generate(200);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();
            const mockAI = new MockAIService();

            const start = Date.now();

            await generateOutfitSuggestions({
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

            const latency = Date.now() - start;
            latencies.push(latency);
        }

        // Calculate P95
        latencies.sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p95 = latencies[p95Index];

        console.log(`P95 latency for 200 items: ${p95}ms`);
        expect(p95).toBeLessThan(2000); // < 2s
    }, 30000);

    test('P95 latency < 3s for 1000 items', async () => {
        const iterations = 5;
        const latencies: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const wardrobe = new WardrobeGenerator(22345 + i).generate(1000);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();
            const mockAI = new MockAIService();

            const start = Date.now();

            await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'party',
                    timeOfDay: 'evening',
                    geoLocation: 'Delhi',
                    weather: { temp: 28, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });

            const latency = Date.now() - start;
            latencies.push(latency);
        }

        // Calculate P95
        latencies.sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p95 = latencies[p95Index];

        console.log(`P95 latency for 1000 items: ${p95}ms`);
        expect(p95).toBeLessThan(3000); // < 3s
    }, 30000);

    test('no crashes under varying wardrobe sizes', async () => {
        const sizes = [0, 1, 2, 3, 10, 50, 200];

        for (const size of sizes) {
            const wardrobe = new WardrobeGenerator(32345).generate(size);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();
            const mockAI = new MockAIService();

            const runTest = async () => {
                await generateOutfitSuggestions({
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
            };

            await expect(runTest()).resolves.not.toThrow();
        }
    }, 30000);

    test('consistent results with same seed', async () => {
        const seed = 42345;
        const runGeneration = async () => {
            const wardrobe = new WardrobeGenerator(seed).generate(100);
            const repo = new MockGarmentRepository(wardrobe);
            const user = new UserProfileBuilder().build();
            const mockAI = new MockAIService();

            return await generateOutfitSuggestions({
                userId: 'user1',
                userProfile: user,
                eventParams: {
                    eventType: 'casual',
                    timeOfDay: 'afternoon',
                    geoLocation: 'Pune',
                    weather: { temp: 29, rainProb: 0.0 }
                },
                garmentRepo: repo,
                aiService: mockAI
            });
        };

        const result1 = await runGeneration();
        const result2 = await runGeneration();

        // With same seed, should get same garments (though outfit assembly may vary slightly)
        expect(result1.context.season).toBe(result2.context.season);
        expect(result1.outfits.length).toBe(result2.outfits.length);
    }, 30000);
});
