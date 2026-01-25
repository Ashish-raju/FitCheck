import { describe, test, expect } from '@jest/globals';
import { parseContext } from '../../engine/outfit/context';
import { INDIA_CULTURE_RULES } from '../../engine/outfit/constants';

describe('Context Parser', () => {
    describe('India-specific rules', () => {
        test('temple event enforces modesty rules', () => {
            const context = parseContext({
                eventType: 'temple visit',
                timeOfDay: 'morning',
                geoLocation: 'Delhi',
                weather: { temp: 30, rainProb: 0.1 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS);
            expect(context.formalityMin).toBeGreaterThanOrEqual(1);
        });

        test('puja event enforces temple rules', () => {
            const context = parseContext({
                eventType: 'family puja',
                timeOfDay: 'evening',
                geoLocation: 'Mumbai',
                weather: { temp: 28, rainProb: 0.0 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS);
        });

        test('funeral enforces white-avoidance rules', () => {
            const context = parseContext({
                eventType: 'funeral service',
                timeOfDay: 'afternoon',
                geoLocation: 'Bangalore',
                weather: { temp: 25, rainProb: 0.0 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.FUNERAL_NO_WHITE_HEAVY);
            expect(context.formalityMin).toBeGreaterThanOrEqual(1);
        });

        test('monsoon season enforces fabric protection rules', () => {
            const context = parseContext({
                eventType: 'commute',
                timeOfDay: 'morning',
                geoLocation: 'Chennai',
                weather: { temp: 26, rainProb: 0.7 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.MONSOON_VETO);
            expect(context.season).toBe('monsoon');
        });

        test('high rain probability triggers monsoon rules even if not classified as monsoon', () => {
            const context = parseContext({
                eventType: 'brunch',
                timeOfDay: 'noon',
                geoLocation: 'Pune',
                weather: { temp: 28, rainProb: 0.6 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.MONSOON_VETO);
        });

        test('office formal enforces conservative dress code', () => {
            const context = parseContext({
                eventType: 'office formal meeting',
                timeOfDay: 'morning',
                geoLocation: 'Hyderabad',
                weather: { temp: 32, rainProb: 0.0 }
            });

            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.OFFICE_NO_LOUD);
            expect(context.formalityMin).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Season derivation', () => {
        test('high rain probability indicates monsoon', () => {
            const context = parseContext({
                eventType: 'casual',
                timeOfDay: 'afternoon',
                geoLocation: 'Goa',
                weather: { temp: 27, rainProb: 0.5 }
            });

            expect(context.season).toBe('monsoon');
        });

        test('low temperature indicates winter', () => {
            const context = parseContext({
                eventType: 'casual',
                timeOfDay: 'morning',
                geoLocation: 'Delhi',
                weather: { temp: 15, rainProb: 0.0 }
            });

            expect(context.season).toBe('winter');
        });

        test('hot and dry indicates summer', () => {
            const context = parseContext({
                eventType: 'casual',
                timeOfDay: 'afternoon',
                geoLocation: 'Jaipur',
                weather: { temp: 42, rainProb: 0.0 }
            });

            expect(context.season).toBe('summer');
        });
    });

    describe('Formality mapping', () => {
        test('wedding sets high formality', () => {
            const context = parseContext({
                eventType: 'wedding reception',
                timeOfDay: 'evening',
                geoLocation: 'Mumbai',
                weather: { temp: 28, rainProb: 0.0 }
            });

            expect(context.formalityMin).toBe(3);
        });

        test('black tie sets maximum formality', () => {
            const context = parseContext({
                eventType: 'black tie gala',
                timeOfDay: 'evening',
                geoLocation: 'Mumbai',
                weather: { temp: 25, rainProb: 0.0 }
            });

            expect(context.formalityMin).toBe(4);
        });

        test('casual event has low formality requirement', () => {
            const context = parseContext({
                eventType: 'casual party',
                timeOfDay: 'evening',
                geoLocation: 'Bangalore',
                weather: { temp: 24, rainProb: 0.0 }
            });

            expect(context.formalityMin).toBeLessThan(2);
        });
    });

    describe('Edge cases', () => {
        test('extreme heat (42°C)', () => {
            const context = parseContext({
                eventType: 'outdoor event',
                timeOfDay: 'afternoon',
                geoLocation: 'Rajasthan',
                weather: { temp: 42, rainProb: 0.0 }
            });

            expect(context.temp).toBe(42);
            expect(context.season).toBe('summer');
        });

        test('extreme cold (9°C)', () => {
            const context = parseContext({
                eventType: 'outdoor event',
                timeOfDay: 'morning',
                geoLocation: 'Shimla',
                weather: { temp: 9, rainProb: 0.0 }
            });

            expect(context.temp).toBe(9);
            expect(context.season).toBe('winter');
        });

        test('maximum rain probability', () => {
            const context = parseContext({
                eventType: 'commute',
                timeOfDay: 'morning',
                geoLocation: 'Cherrapunji',
                weather: { temp: 20, rainProb: 0.9 }
            });

            expect(context.rainProb).toBe(0.9);
            expect(context.cultureRules).toContain(INDIA_CULTURE_RULES.MONSOON_VETO);
        });
    });
});
