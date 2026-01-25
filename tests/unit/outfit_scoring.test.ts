import { describe, test, expect } from '@jest/globals';
import { scoreOutfit } from '../../engine/outfit/outfit_scoring';
import { GarmentBuilder, UserProfileBuilder } from '../utils/builders';
import { Context } from '../../engine/outfit/models';

describe('Outfit Scoring', () => {
    const mockContext: Context = {
        event: 'casual',
        formalityMin: 1,
        season: 'summer',
        rainProb: 0,
        temp: 30,
        timeBucket: 'afternoon',
        cultureRules: [],
        desiredStyle: [],
        paletteTarget: [10]
    };

    const user = new UserProfileBuilder().build();

    test('outfit with harmonious colors gets bonus', () => {
        const top = new GarmentBuilder()
            .type('top')
            .color('#FF0000', 0, 100, 50, 10)
            .build();

        const bottom = new GarmentBuilder()
            .type('bottom')
            .color('#AA0000', 0, 100, 30, 10) // Same color family
            .build();

        const items = [top, bottom];
        const baseScores = [2.0, 2.0];

        const score = scoreOutfit(items, baseScores, user, mockContext);
        expect(score).toBeGreaterThan(4); // Base + harmony bonus
    });

    test('outfit with balanced silhouette gets bonus', () => {
        const top = new GarmentBuilder()
            .type('top')
            .fit('oversized')
            .color('#FFFFFF', 0, 0, 100, 1)
            .build();

        const bottom = new GarmentBuilder()
            .type('bottom')
            .fit('slim')
            .color('#000000', 0, 0, 0, 2)
            .build();

        const items = [top, bottom];
        const baseScores = [2.0, 2.0];

        const score = scoreOutfit(items, baseScores, user, mockContext);
        expect(score).toBeGreaterThan(4); // Base + silhouette bonus
    });

    test('winter layering in winter context gets bonus', () => {
        const winterContext: Context = {
            ...mockContext,
            season: 'winter',
            temp: 10
        };

        const top = new GarmentBuilder()
            .layerWeight(2)
            .color('#FFFFFF', 0, 0, 100, 1)
            .build();

        const layer = new GarmentBuilder()
            .layerWeight(3)
            .color('#000000', 0, 0, 0, 2)
            .build();

        const items = [top, layer];
        const baseScores = [2.0, 2.0];

        const score = scoreOutfit(items, baseScores, user, winterContext);
        expect(score).toBeGreaterThan(4); // Base + layering bonus
    });

    test('single item outfit has no harmony issues', () => {
        const top = new GarmentBuilder()
            .color('#FF0000', 0, 100, 50, 10)
            .build();

        const items = [top];
        const baseScores = [2.0];

        const score = scoreOutfit(items, baseScores, user, mockContext);
        expect(score).toBeGreaterThan(0); // Should not crash
    });

    test('formality mismatch gets penalty', () => {
        const casual = new GarmentBuilder()
            .formality(0)
            .color('#FFFFFF', 0, 0, 100, 1)
            .build();

        const formal = new GarmentBuilder()
            .formality(4)
            .color('#000000', 0, 0, 0, 2)
            .build();

        const items = [casual, formal];
        const baseScores = [2.0, 2.0];

        const score = scoreOutfit(items, baseScores, user, mockContext);
        const matchedScore = scoreOutfit([casual, casual], baseScores, user, mockContext);

        // High formality variance should reduce occasion coherence score
        expect(score).toBeLessThan(matchedScore);
    });
});
