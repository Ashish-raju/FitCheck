/**
 * Copy Engine Tests
 * Validates interpolation, pluralization, variants, and fallback behavior
 */

import { t, setDebugMode } from '../copyEngine';

describe('Copy Engine', () => {
    beforeEach(() => {
        setDebugMode(false);
    });

    describe('Basic Translation', () => {
        it('should return simple copy value', () => {
            expect(t('global.appName')).toBe('FIT CHECK');
            expect(t('global.save')).toBe('Save');
            expect(t('global.delete')).toBe('Delete');
        });

        it('should handle nested keys', () => {
            expect(t('wardrobe.title')).toBe('STYLE VAULT');
            expect(t('auth.welcomeBack')).toBe('Welcome back');
            expect(t('errors.auth.failed')).toBe('Authentication failed');
        });
    });

    describe('Interpolation', () => {
        it('should interpolate single parameter', () => {
            const result = t('home.greeting.morning', { name: 'Alex' });
            expect(result).toBe('Morning, Alex');
        });

        it('should interpolate multiple parameters', () => {
            const result = t('home.weather', { temp: 18 });
            expect(result).toBe('18°C');
        });

        it('should handle missing parameters gracefully', () => {
            const result = t('home.greeting.evening', {});
            expect(result).toContain('Evening');
        });

        it('should interpolate complex strings', () => {
            const result = t('ritual.weatherOptimized', { temp: 15, condition: 'RAIN' });
            expect(result).toBe('OPTIMIZED FOR 15°C // RAIN');
        });
    });

    describe('Pluralization', () => {
        it('should handle singular (count = 1)', () => {
            const result = t('ritual.streak.days', { count: 1 });
            expect(result).toBe('1 Day');
        });

        it('should handle plural (count > 1)', () => {
            const result = t('ritual.streak.days', { count: 5 });
            expect(result).toBe('5 Days');
        });

        it('should handle zero as plural', () => {
            const result = t('ritual.streak.days', { count: 0 });
            expect(result).toBe('0 Days');
        });
    });

    describe('Variants', () => {
        it('should return default variant when none specified', () => {
            const result = t('wardrobe.empty.default');
            expect(result).toBe('No items yet');
        });

        it('should return short variant', () => {
            const result = t('wardrobe.empty.short');
            expect(result).toBe('Empty');
        });

        it('should handle nested variant objects', () => {
            const result = t('home.greeting.afternoon', { name: 'Jordan' });
            expect(result).toBe('Afternoon, Jordan');
        });
    });

    describe('Error Handling', () => {
        it('should return key for missing translation in dev mode', () => {
            const result = t('missing.key.that.does.not.exist');
            expect(result).toContain('MISSING');
        });

        it('should handle deeply nested missing keys', () => {
            const result = t('a.b.c.d.e.f.g');
            expect(result).toBeDefined();
        });
    });

    describe('Debug Mode', () => {
        it('should return key wrapped in brackets when debug mode enabled', () => {
            setDebugMode(true);
            const result = t('global.appName');
            expect(result).toBe('[global.appName]');
            setDebugMode(false);
        });

        it('should return actual copy when debug mode disabled', () => {
            setDebugMode(false);
            const result = t('global.appName');
            expect(result).toBe('FIT CHECK');
        });
    });

    describe('Tone Compliance', () => {
        it('should not contain banned phrases', () => {
            const bannedPhrases = ['Oops', 'Yay', 'Awesome!!!', 'Hey', 'buddy', 'bro'];

            const checkCopy = (key: string) => {
                const copy = t(key);
                bannedPhrases.forEach(phrase => {
                    expect(copy.toLowerCase()).not.toContain(phrase.toLowerCase());
                });
            };

            checkCopy('errors.generic');
            checkCopy('auth.welcomeBack');
            checkCopy('success.saved');
            checkCopy('wardrobe.empty.default');
        });

        it('should use minimal luxury language', () => {
            expect(t('wardrobe.title')).toBe('STYLE VAULT'); // Not "My Closet"
            expect(t('success.saved')).toBe('Saved'); // Not "Successfully saved!"
            expect(t('errors.network.offline')).toBe('No connection'); // Not "Oops! Check your Internet"
        });
    });

    describe('Real-World Usage', () => {
        it('should support home screen greeting flow', () => {
            const morning = t('home.greeting.morning', { name: 'Taylor' });
            const evening = t('home.greeting.evening', { name: 'Taylor' });

            expect(morning).toBe('Morning, Taylor');
            expect(evening).toBe('Evening, Taylor');
        });

        it('should support wardrobe empty states', () => {
            const allEmpty = t('wardrobe.empty.default');
            const categoryEmpty = t('wardrobe.empty.category', { category: 'shoes' });

            expect(allEmpty).toBe('No items yet');
            expect(categoryEmpty).toBe('No shoes yet');
        });

        it('should support auth validation errors', () => {
            const required = t('errors.validation.requiredFields');
            const nameReq = t('errors.validation.nameRequired');
            const emailReq = t('errors.validation.emailRequired');

            expect(required).toBe('Required fields missing');
            expect(nameReq).toBe('Name required');
            expect(emailReq).toBe('Email required');
        });
    });
});
