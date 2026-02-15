

import { Piece, PieceID, Category } from '../../truth/types';
import { Context, UserProfile, GarmentType, Pattern, Fit, Gender } from '../../engine/outfit/models';

class SeededRNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Simple LCG
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280.0;
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    choice<T>(arr: T[]): T {
        return arr[this.nextInt(0, arr.length - 1)];
    }

    shuffle<T>(arr: T[]): T[] {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }
}

export class ScenarioGenerator {
    private rng: SeededRNG;

    constructor(seed: number) {
        this.rng = new SeededRNG(seed);
    }

    private randomId(): string {
        return Math.floor(this.rng.next() * 1000000000).toString(36);
    }

    public generateContext(): Context {
        const events = ['office_formal', 'casual_day', 'wedding_evening', 'temple', 'funeral', 'monsoon_commute'];
        const timeBuckets = ['morning', 'day', 'evening', 'night'];
        const seasons: any[] = ['summer', 'monsoon', 'winter'];

        return {
            event: this.rng.choice(events),
            timeBucket: this.rng.choice(timeBuckets),
            season: this.rng.choice(seasons),
            rainProb: this.rng.next(),
            temp: this.rng.choice([9, 18, 29, 42]),
            formalityMin: this.rng.nextInt(0, 4),
            cultureRules: [],
            desiredStyle: [],
            paletteTarget: [10, 20] // Mock
        };
    }

    public generateUserProfile(): UserProfile {
        return {
            skinTone: { undertone: 'warm', depth: 'medium' },
            palette: { best: [1, 2, 10], avoid: [99] },
            bodyType: 'rectangle',
            stylePrefs: ['minimal'],
            comfortPrefs: { tight: 0.5, loose: 0.5 },
            weights: { wF: 1, wS: 1, wB: 1, wC: 1, wU: 1, wR: 1, wP: 1 }
        };
    }

    public generateWardrobe(size: number): Record<string, Piece> {
        const pieces: Record<string, Piece> = {};
        const categories: Category[] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];
        const patterns: Pattern[] = ['solid', 'stripe', 'checks', 'graphic', 'floral', 'other'];

        for (let i = 0; i < size; i++) {
            const cat = this.rng.choice(categories);
            const id = `syn_${this.randomId()}`;

            // Bias towards compatible basic items
            const isBasic = this.rng.next() > 0.3;

            pieces[id] = {
                id: id as PieceID,
                category: cat,
                warmth: this.rng.nextInt(1, 5),
                formality: this.rng.nextInt(0, 4),
                color: this.rng.choice(['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', 'neon_green']),
                status: (this.rng.next() < 0.05) ? 'Laundry' : 'Clean', // 5% dirty
                currentUses: this.rng.nextInt(0, 10),
                material: this.rng.choice(['cotton', 'linen', 'suede', 'silk', 'polyester']),
                pattern: isBasic ? 'solid' : this.rng.choice(patterns),
                fit: 'regular',
                subcategory: cat === 'Shoes' ? this.rng.choice(['sneakers', 'boots', 'loafers']) : (cat === 'Bottom' ? (this.rng.next() > 0.8 ? 'shorts' : 'jeans') : 'genteric'),
            } as any;
        }

        // Guarantee at least one functional outfit
        const guaranteedTop = `syn_guaranteed_top`;
        const guaranteedBottom = `syn_guaranteed_bottom`;
        const guaranteedShoes = `syn_guaranteed_shoes`;

        pieces[guaranteedTop] = {
            id: guaranteedTop as PieceID,
            category: 'Top',
            formality: 2,
            status: 'Clean',
            warmth: 2,
            color: '#FFFFFF',
            pattern: 'solid',
            material: 'cotton',
            fit: 'regular',
            subcategory: 't-shirt',
            currentUses: 0
        } as any;
        pieces[guaranteedBottom] = {
            id: guaranteedBottom as PieceID,
            category: 'Bottom',
            formality: 2,
            status: 'Clean',
            warmth: 2,
            color: '#000000',
            pattern: 'solid',
            material: 'denim',
            fit: 'regular',
            subcategory: 'jeans',
            currentUses: 0
        } as any;
        pieces[guaranteedShoes] = {
            id: guaranteedShoes as PieceID,
            category: 'Shoes',
            formality: 2,
            status: 'Clean',
            warmth: 1,
            color: '#000000',
            pattern: 'solid',
            material: 'leather',
            fit: 'regular',
            subcategory: 'sneakers',
            currentUses: 0
        } as any;

        return pieces;
    }
}
