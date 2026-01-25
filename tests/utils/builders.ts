import { Garment, UserProfile, Color, GarmentType, Pattern, Fit, Gender } from '../../engine/outfit/models';
import { SeededRandom } from './random';

const FABRICS = ['cotton', 'linen', 'silk', 'wool', 'polyester', 'suede', 'raw_silk', 'denim', 'leather'];
const PATTERNS: Pattern[] = ['solid', 'stripe', 'checks', 'graphic', 'floral', 'other'];
const FITS: Fit[] = ['slim', 'regular', 'oversized', 'relaxed'];
const GENDERS: Gender[] = ['men', 'women', 'unisex'];

/**
 * Garment builder for creating test garments with controlled properties
 */
export class GarmentBuilder {
    private garment: Partial<Garment>;
    private rng: SeededRandom;

    constructor(rng?: SeededRandom) {
        this.rng = rng || new SeededRandom();
        this.garment = {
            id: `g_${Math.random().toString(36).substr(2, 9)}`,
            type: 'top',
            subtype: 'shirt',
            gender: 'unisex',
            fabric: 'cotton',
            pattern: 'solid',
            fit: 'regular',
            formality: 2,
            colors: [],
            seasonScore: { summer: 0.8, monsoon: 0.6, winter: 0.5 },
            bodyScore: {},
            styleTags: [],
            layerWeight: 1,
            wornCount: 0
        };
    }

    id(id: string): this {
        this.garment.id = id;
        return this;
    }

    type(type: GarmentType): this {
        this.garment.type = type;
        return this;
    }

    subtype(subtype: string): this {
        this.garment.subtype = subtype;
        return this;
    }

    fabric(fabric: string): this {
        this.garment.fabric = fabric;
        return this;
    }

    pattern(pattern: Pattern): this {
        this.garment.pattern = pattern;
        return this;
    }

    formality(level: number): this {
        this.garment.formality = level;
        return this;
    }

    color(hex: string, h: number, s: number, l: number, dictColorId: number): this {
        const color: Color = {
            hex,
            h,
            s,
            l,
            lab: [l, (s * Math.cos(h * Math.PI / 180)), (s * Math.sin(h * Math.PI / 180))],
            dictColorId
        };
        this.garment.colors = [...(this.garment.colors || []), color];
        return this;
    }

    whiteColor(): this {
        return this.color('#FFFFFF', 0, 0, 100, 1);
    }

    blackColor(): this {
        return this.color('#000000', 0, 0, 0, 2);
    }

    redColor(): this {
        return this.color('#FF0000', 0, 100, 50, 10);
    }

    blueColor(): this {
        return this.color('#0000FF', 240, 100, 50, 20);
    }

    seasonScore(summer: number, monsoon: number, winter: number): this {
        this.garment.seasonScore = { summer, monsoon, winter };
        return this;
    }

    bodyScore(bodyType: string, score: number): this {
        this.garment.bodyScore = { ...this.garment.bodyScore, [bodyType]: score };
        return this;
    }

    styleTags(tags: string[]): this {
        this.garment.styleTags = tags;
        return this;
    }

    wornCount(count: number): this {
        this.garment.wornCount = count;
        return this;
    }

    lastWornAt(timestamp: number): this {
        this.garment.lastWornAt = timestamp;
        return this;
    }

    fit(fit: Fit): this {
        this.garment.fit = fit;
        return this;
    }

    layerWeight(weight: number): this {
        this.garment.layerWeight = weight;
        return this;
    }

    build(): Garment {
        return this.garment as Garment;
    }

    /**
     * Creates a random garment with the given type
     */
    static random(type: GarmentType, rng: SeededRandom): Garment {
        const builder = new GarmentBuilder(rng);
        return builder
            .type(type)
            .subtype(`${type}_${rng.int(1, 10)}`)
            .fabric(rng.choice(FABRICS))
            .pattern(rng.choice(PATTERNS))
            .formality(rng.int(0, 5))
            .color(
                `#${rng.int(0, 256).toString(16).padStart(2, '0')}${rng.int(0, 256).toString(16).padStart(2, '0')}${rng.int(0, 256).toString(16).padStart(2, '0')}`,
                rng.int(0, 360),
                rng.int(0, 100),
                rng.int(20, 80),
                rng.int(1, 50)
            )
            .seasonScore(rng.next(), rng.next(), rng.next())
            .bodyScore('rectangle', 0.5 + rng.next() * 0.5)
            .wornCount(rng.int(0, 20))
            .build();
    }
}

/**
 * User profile builder
 */
export class UserProfileBuilder {
    private profile: UserProfile;

    constructor() {
        this.profile = {
            skinTone: { undertone: 'warm', depth: 'medium' },
            palette: { best: [1, 2, 10], avoid: [99] },
            bodyType: 'rectangle',
            stylePrefs: ['minimal', 'chic'],
            comfortPrefs: { tight: 0.5, loose: 0.5 },
            weights: {
                wF: 1.0,
                wS: 1.0,
                wB: 1.0,
                wC: 1.0,
                wU: 1.0,
                wR: 0.5,
                wP: 0.5
            }
        };
    }

    bodyType(type: string): this {
        this.profile.bodyType = type;
        return this;
    }

    palette(best: number[], avoid: number[]): this {
        this.profile.palette = { best, avoid };
        return this;
    }

    weights(weights: Partial<UserProfile['weights']>): this {
        this.profile.weights = { ...this.profile.weights, ...weights };
        return this;
    }

    build(): UserProfile {
        return this.profile;
    }
}

/**
 * Wardrobe generator
 */
export class WardrobeGenerator {
    private rng: SeededRandom;

    constructor(seed: number = 12345) {
        this.rng = new SeededRandom(seed);
    }

    generate(size: number): Garment[] {
        const wardrobe: Garment[] = [];
        const types: GarmentType[] = ['top', 'bottom', 'layer', 'footwear', 'accessory', 'one_piece'];

        for (let i = 0; i < size; i++) {
            const type = this.rng.choice(types);
            wardrobe.push(GarmentBuilder.random(type, this.rng));
        }

        return wardrobe;
    }

    /**
     * Generate a wardrobe with specific problematic items for testing
     */
    generateWithProblematicItems(): Garment[] {
        return [
            // Suede shoes for monsoon testing
            new GarmentBuilder()
                .id('suede_shoes')
                .type('footwear')
                .subtype('loafers')
                .fabric('suede')
                .pattern('solid')
                .formality(2)
                .blackColor()
                .seasonScore(0.8, 0.1, 0.8)
                .build(),

            // Graphic tee for office testing
            new GarmentBuilder()
                .id('graphic_tee')
                .type('top')
                .subtype('t-shirt')
                .fabric('cotton')
                .pattern('graphic')
                .formality(0)
                .redColor()
                .seasonScore(1.0, 0.5, 0.2)
                .build(),

            // Shorts for temple testing
            new GarmentBuilder()
                .id('shorts')
                .type('bottom')
                .subtype('shorts')
                .fabric('cotton')
                .pattern('solid')
                .formality(0)
                .blueColor()
                .seasonScore(1.0, 0.5, 0.1)
                .build(),

            // White heavy outfit for funeral testing
            new GarmentBuilder()
                .id('white_shirt')
                .type('top')
                .subtype('shirt')
                .fabric('cotton')
                .pattern('solid')
                .formality(2)
                .whiteColor()
                .seasonScore(0.8, 0.6, 0.5)
                .build(),

            // Good basic items
            new GarmentBuilder()
                .id('blue_shirt')
                .type('top')
                .subtype('shirt')
                .fabric('cotton')
                .pattern('solid')
                .formality(2)
                .blueColor()
                .seasonScore(0.8, 0.6, 0.5)
                .build(),

            new GarmentBuilder()
                .id('black_chinos')
                .type('bottom')
                .subtype('chinos')
                .fabric('cotton')
                .pattern('solid')
                .formality(2)
                .blackColor()
                .seasonScore(0.7, 0.8, 0.9)
                .build(),

            new GarmentBuilder()
                .id('sneakers')
                .type('footwear')
                .subtype('sneakers')
                .fabric('canvas')
                .pattern('solid')
                .formality(1)
                .whiteColor()
                .seasonScore(1.0, 0.5, 0.3)
                .build(),
        ];
    }
}
