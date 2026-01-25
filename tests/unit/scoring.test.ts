import { describe, test, expect } from '@jest/globals';
import { calculateItemScore } from '../../engine/outfit/scoring';
import { calculateFormalityFit, calculateStyleMatch, calculateRecencyBoost, calculateRepetitionPenalty } from '../../engine/outfit/scoring_utils';
import { GarmentBuilder, UserProfileBuilder } from '../utils/builders';
import { Context } from '../../engine/outfit/models';

describe('Item Scoring', () => {
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

    describe('Formality scoring', () => {
        test('perfect formality match gives high score', () => {
            const garment = new GarmentBuilder().formality(1).build();
            const score = calculateFormalityFit(garment, mockContext);
            expect(score).toBe(1.0);
        });

        test('higher formality than required gives good score', () => {
            const garment = new GarmentBuilder().formality(2).build();
            const score = calculateFormalityFit(garment, mockContext);
            expect(score).toBe(0.8);
        });

        test('lower formality than required gives low score', () => {
            const garment = new GarmentBuilder().formality(0).build();
            const score = calculateFormalityFit(garment, mockContext);
            expect(score).toBe(0.1);
        });
    });

    describe('Style matching', () => {
        test('matching style tags increase score', () => {
            const garment = new GarmentBuilder().styleTags(['minimal', 'chic']).build();
            const user = new UserProfileBuilder().build(); // Has minimal, chic
            const score = calculateStyleMatch(garment, user.stylePrefs);
            expect(score).toBeGreaterThan(0);
        });

        test('no matching styles gives zero score', () => {
            const garment = new GarmentBuilder().styleTags(['sporty']).build();
            const user = new UserProfileBuilder().build(); // Has minimal, chic
            const score = calculateStyleMatch(garment, user.stylePrefs);
            expect(score).toBe(0);
        });
    });

    describe('Recency boost', () => {
        test('never worn items get maximum boost', () => {
            const score = calculateRecencyBoost(undefined);
            expect(score).toBe(1.0);
        });

        test('recently worn items get low boost', () => {
            const yesterday = Date.now() - (24 * 60 * 60 * 1000);
            const score = calculateRecencyBoost(yesterday);
            expect(score).toBeLessThan(0.1);
        });

        test('items worn 30+ days ago get full boost', () => {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const score = calculateRecencyBoost(thirtyDaysAgo);
            expect(score).toBeGreaterThanOrEqual(1.0);
        });
    });

    describe('Repetition penalty', () => {
        test('never worn has no penalty', () => {
            const penalty = calculateRepetitionPenalty(0);
            expect(penalty).toBe(0);
        });

        test('frequently worn has higher penalty', () => {
            const penalty10 = calculateRepetitionPenalty(10);
            const penalty20 = calculateRepetitionPenalty(20);
            expect(penalty20).toBeGreaterThan(penalty10);
        });

        test('penalty grows logarithmically', () => {
            const p10 = calculateRepetitionPenalty(10);
            const p20 = calculateRepetitionPenalty(20);
            const p30 = calculateRepetitionPenalty(30);

            // Log growth: difference between 10-20 should be larger than 20-30
            expect(p20 - p10).toBeGreaterThan(p30 - p20);
        });
    });

    describe('Overall item scoring', () => {
        test('well-matched garment gets high score', () => {
            const garment = new GarmentBuilder()
                .formality(1)
                .seasonScore(0.9, 0.5, 0.5)
                .color('#FF0000', 0, 100, 50, 10) // Matches palette target
                .styleTags(['minimal'])
                .wornCount(0)
                .build();

            const user = new UserProfileBuilder().build();
            const score = calculateItemScore(garment, user, mockContext);
            expect(score).toBeGreaterThan(3); // Should be reasonably high
        });

        test('poorly matched garment gets low score', () => {
            const garment = new GarmentBuilder()
                .formality(4) // Too formal for casual
                .seasonScore(0.2, 0.2, 0.9) // Wrong season
                .color('#000000', 0, 0, 0, 99) // In avoid list
                .styleTags(['sporty']) // Doesn't match user
                .wornCount(50) // Overused
                .build();

            const user = new UserProfileBuilder().build();
            const score = calculateItemScore(garment, user, mockContext);
            expect(score).toBeLessThan(2); // Should be low
        });
    });
});
