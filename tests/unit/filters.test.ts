import { describe, test, expect } from '@jest/globals';
import { HardFilter } from '../../engine/outfit/filters';
import { Context } from '../../engine/outfit/models';
import { GarmentBuilder } from '../utils/builders';
import { INDIA_CULTURE_RULES } from '../../engine/outfit/constants';

describe('Hard Filter - Veto Rules', () => {
    describe('Season score veto', () => {
        test('rejects garment with low season score', () => {
            const garment = new GarmentBuilder()
                .seasonScore(0.3, 0.3, 0.3)
                .build();

            const context: Context = {
                event: 'casual',
                formalityMin: 0,
                season: 'summer',
                rainProb: 0,
                temp: 30,
                timeBucket: 'afternoon',
                cultureRules: [],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });

        test('accepts garment with adequate season score', () => {
            const garment = new GarmentBuilder()
                .seasonScore(0.8, 0.5, 0.5)
                .build();

            const context: Context = {
                event: 'casual',
                formalityMin: 0,
                season: 'summer',
                rainProb: 0,
                temp: 30,
                timeBucket: 'afternoon',
                cultureRules: [],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(true);
        });
    });

    describe('Monsoon fabric veto', () => {
        test('rejects suede in high rain probability', () => {
            const garment = new GarmentBuilder()
                .fabric('suede')
                .seasonScore(0.8, 0.8, 0.8)
                .build();

            const context: Context = {
                event: 'commute',
                formalityMin: 0,
                season: 'monsoon',
                rainProb: 0.7,
                temp: 25,
                timeBucket: 'morning',
                cultureRules: [INDIA_CULTURE_RULES.MONSOON_VETO],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });

        test('rejects raw_silk in monsoon', () => {
            const garment = new GarmentBuilder()
                .fabric('raw_silk')
                .seasonScore(0.8, 0.8, 0.8)
                .build();

            const context: Context = {
                event: 'party',
                formalityMin: 1,
                season: 'monsoon',
                rainProb: 0.6,
                temp: 26,
                timeBucket: 'evening',
                cultureRules: [INDIA_CULTURE_RULES.MONSOON_VETO],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });

        test('rejects white linen in monsoon', () => {
            const garment = new GarmentBuilder()
                .fabric('linen')
                .whiteColor()
                .seasonScore(0.9, 0.5, 0.5)
                .build();

            const context: Context = {
                event: 'brunch',
                formalityMin: 1,
                season: 'monsoon',
                rainProb: 0.8,
                temp: 27,
                timeBucket: 'noon',
                cultureRules: [INDIA_CULTURE_RULES.MONSOON_VETO],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });

        test('accepts cotton in monsoon', () => {
            const garment = new GarmentBuilder()
                .fabric('cotton')
                .blackColor()
                .seasonScore(0.8, 0.9, 0.7)
                .build();

            const context: Context = {
                event: 'work',
                formalityMin: 2,
                season: 'monsoon',
                rainProb: 0.6,
                temp: 26,
                timeBucket: 'morning',
                cultureRules: [INDIA_CULTURE_RULES.MONSOON_VETO],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(true);
        });
    });

    describe('Temple modesty veto', () => {
        test('rejects shorts for temple', () => {
            const garment = new GarmentBuilder()
                .type('bottom')
                .subtype('shorts')
                .seasonScore(0.9, 0.7, 0.5)
                .build();

            const context: Context = {
                event: 'temple',
                formalityMin: 1,
                season: 'summer',
                rainProb: 0,
                temp: 32,
                timeBucket: 'morning',
                cultureRules: [INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });

        test('rejects mini skirt for temple', () => {
            const garment = new GarmentBuilder()
                .type('bottom')
                .subtype('skirt_mini')
                .seasonScore(0.9, 0.7, 0.5)
                .build();

            const context: Context = {
                event: 'puja',
                formalityMin: 1,
                season: 'summer',
                rainProb: 0,
                temp: 30,
                timeBucket: 'evening',
                cultureRules: [INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });
    });

    describe('Funeral white-heavy veto', () => {
        test('rejects white-dominant garment for funeral', () => {
            const garment = new GarmentBuilder()
                .whiteColor()
                .seasonScore(0.8, 0.8, 0.8)
                .build();

            const context: Context = {
                event: 'funeral',
                formalityMin: 1,
                season: 'summer',
                rainProb: 0,
                temp: 28,
                timeBucket: 'afternoon',
                cultureRules: [INDIA_CULTURE_RULES.FUNERAL_NO_WHITE_HEAVY],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });
    });

    describe('Office formal veto', () => {
        test('rejects graphic pattern for office', () => {
            const garment = new GarmentBuilder()
                .pattern('graphic')
                .seasonScore(0.8, 0.8, 0.8)
                .build();

            const context: Context = {
                event: 'office',
                formalityMin: 2,
                season: 'summer',
                rainProb: 0,
                temp: 28,
                timeBucket: 'morning',
                cultureRules: [INDIA_CULTURE_RULES.OFFICE_NO_LOUD],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });
    });

    describe('Formal event pattern veto', () => {
        test('rejects graphic for high formality event', () => {
            const garment = new GarmentBuilder()
                .pattern('graphic')
                .formality(2)
                .seasonScore(0.8, 0.8, 0.8)
                .build();

            const context: Context = {
                event: 'wedding',
                formalityMin: 3,
                season: 'summer',
                rainProb: 0,
                temp: 30,
                timeBucket: 'evening',
                cultureRules: [],
                desiredStyle: [],
                paletteTarget: []
            };

            expect(HardFilter.isGarmentBroadlyValid(garment, context)).toBe(false);
        });
    });

    describe('Double-loud pattern veto (pairwise)', () => {
        test('rejects two non-solid patterns (top + bottom)', () => {
            const top = new GarmentBuilder()
                .type('top')
                .pattern('stripe')
                .build();

            const bottom = new GarmentBuilder()
                .type('bottom')
                .pattern('checks')
                .build();

            expect(HardFilter.isCombinationValid(top, bottom)).toBe(false);
        });

        test('accepts solid + pattern combination', () => {
            const top = new GarmentBuilder()
                .type('top')
                .pattern('solid')
                .build();

            const bottom = new GarmentBuilder()
                .type('bottom')
                .pattern('checks')
                .build();

            expect(HardFilter.isCombinationValid(top, bottom)).toBe(true);
        });

        test('accepts two solid garments', () => {
            const top = new GarmentBuilder()
                .type('top')
                .pattern('solid')
                .build();

            const bottom = new GarmentBuilder()
                .type('bottom')
                .pattern('solid')
                .build();

            expect(HardFilter.isCombinationValid(top, bottom)).toBe(true);
        });

        test('allows pattern mixing for non-top/bottom pairs', () => {
            const top = new GarmentBuilder()
                .type('top')
                .pattern('stripe')
                .build();

            const accessory = new GarmentBuilder()
                .type('accessory')
                .pattern('checks')
                .build();

            // Should be valid since we only restrict top+bottom
            expect(HardFilter.isCombinationValid(top, accessory)).toBe(true);
        });
    });
});
