import { describe, test, expect } from '@jest/globals';
import { areColorsHarmonious, getPaletteScore } from '../../engine/outfit/color_utils';
import { Color } from '../../engine/outfit/models';

describe('Color Utilities', () => {
    describe('Color Harmony', () => {
        test('monochromatic colors (same dictColorId) are harmonious', () => {
            const color1: Color = {
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            };

            const color2: Color = {
                hex: '#AA0000',
                h: 0,
                s: 100,
                l: 33,
                lab: [33, 80, 70],
                dictColorId: 10
            };

            expect(areColorsHarmonious(color1, color2)).toBe(true);
        });

        test('analogous colors (30° apart) are harmonious', () => {
            const color1: Color = {
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            };

            const color2: Color = {
                hex: '#FF8000',
                h: 30,
                s: 100,
                l: 50,
                lab: [50, 70, 70],
                dictColorId: 11
            };

            expect(areColorsHarmonious(color1, color2)).toBe(true);
        });

        test('complementary colors (180° apart) are harmonious', () => {
            const color1: Color = {
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            };

            const color2: Color = {
                hex: '#00FFFF',
                h: 180,
                s: 100,
                l: 50,
                lab: [50, -80, -70],
                dictColorId: 20
            };

            expect(areColorsHarmonious(color1, color2)).toBe(true);
        });

        test('triadic colors (120° apart) are harmonious', () => {
            const color1: Color = {
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            };

            const color2: Color = {
                hex: '#00FF00',
                h: 120,
                s: 100,
                l: 50,
                lab: [50, -80, 70],
                dictColorId: 20
            };

            expect(areColorsHarmonious(color1, color2)).toBe(true);
        });

        test('neutral colors are always harmonious', () => {
            const white: Color = {
                hex: '#FFFFFF',
                h: 0,
                s: 0,
                l: 100,
                lab: [100, 0, 0],
                dictColorId: 1
            };

            const vividRed: Color = {
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            };

            expect(areColorsHarmonious(white, vividRed)).toBe(true);
        });

        test('black with any color is harmonious', () => {
            const black: Color = {
                hex: '#000000',
                h: 0,
                s: 0,
                l: 0,
                lab: [0, 0, 0],
                dictColorId: 2
            };

            const vividBlue: Color = {
                hex: '#0000FF',
                h: 240,
                s: 100,
                l: 50,
                lab: [50, 0, -80],
                dictColorId: 20
            };

            expect(areColorsHarmonious(black, vividBlue)).toBe(true);
        });
    });

    describe('Palette Scoring', () => {
        test('direct palette match gives positive score', () => {
            const garmentColors: Color[] = [{
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 10
            }];

            const score = getPaletteScore(garmentColors, [10], []);
            expect(score).toBeGreaterThan(0);
        });

        test('avoid list gives penalty', () => {
            const garmentColors: Color[] = [{
                hex: '#FF0000',
                h: 0,
                s: 100,
                l: 50,
                lab: [50, 80, 70],
                dictColorId: 99
            }];

            const score = getPaletteScore(garmentColors, [10], [99]);
            expect(score).toBeLessThan(0);
        });

        test('empty colors array returns 0', () => {
            const score = getPaletteScore([], [10], [99]);
            expect(score).toBe(0);
        });

        test('multiple matching colors increase score', () => {
            const garmentColors: Color[] = [
                { hex: '#FF0000', h: 0, s: 100, l: 50, lab: [50, 80, 70], dictColorId: 10 },
                { hex: '#00FF00', h: 120, s: 100, l: 50, lab: [50, -80, 70], dictColorId: 20 }
            ];

            const score = getPaletteScore(garmentColors, [10, 20], []);
            expect(score).toBeGreaterThan(0.5);
        });
    });
});
