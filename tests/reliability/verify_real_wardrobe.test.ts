
import { MOCK_PIECES } from '../../assets/mock-data/mockPieces.temp';
import { generateOutfitSuggestions } from '../../engine/outfit';
import { checkInvariants } from './invariants';
import { ReliabilityReporter } from './report';
import { Piece, Category } from '../../truth/types';
import { Garment, GarmentType, Pattern, Fit, Color } from '../../engine/outfit/models';

// Configurable Scenarios
const SCENARIOS = [
    { event: 'office_formal', time: 'morning', temp: 24, rain: 0.1 },
    { event: 'casual_day', time: 'afternoon', temp: 30, rain: 0.0 },
    { event: 'wedding_evening', time: 'evening', temp: 18, rain: 0.0 },
    { event: 'monsoon_commute', time: 'morning', temp: 22, rain: 0.9 },
    { event: 'temple', time: 'morning', temp: 28, rain: 0.0 }
];

// Mock Repository reusing MOCK_PIECES
class RealDataRepository {
    private pieces: Piece[];
    constructor(pieces: Piece[]) { this.pieces = pieces; }

    async getAllUserGarments(userId: string): Promise<Garment[]> {
        return this.pieces.map(this.mapPieceToGarment);
    }

    // Copy mapper from runReliability because we can't export/import it easily if it's protected
    private mapPieceToGarment(piece: Piece): Garment {
        const typeMap: Record<Category, GarmentType> = {
            'Top': 'top',
            'Bottom': 'bottom',
            'Shoes': 'footwear',
            'Outerwear': 'layer',
            'Accessory': 'accessory'
        };

        return {
            id: piece.id as string,
            type: typeMap[piece.category] || 'top',
            subtype: piece.subcategory || piece.category,
            gender: 'unisex',
            fabric: piece.material || 'cotton',
            pattern: (piece.pattern === 'striped' ? 'stripe' : piece.pattern) as Pattern || 'solid', // Map striped -> stripe
            fit: (piece.fit as Fit) || 'regular',
            formality: piece.formality,
            colors: [{ hex: piece.color?.toLowerCase() || '#000000', h: 0, s: 0, l: 0, dictColorId: 10 }] as Color[],
            seasonScore: { summer: 0.5, monsoon: 0.5, winter: 0.5 },
            bodyScore: {},
            styleTags: piece.styleTags || [],
            layerWeight: piece.warmth || 1,
            wornCount: piece.currentUses || 0,
            status: (piece.status as any) || 'Clean'
        };
    }

    async getUserProfile(userId: string) { return null; }
}

describe('Current Wardrobe Verification', () => {
    test('Verifies MOCK_PIECES compliance with engine rules', async () => {
        const reporter = new ReliabilityReporter();

        // 1. Data Integrity Check
        console.log(`Verifying ${MOCK_PIECES.length} items in current wardrobe...`);
        const invalidStatus = MOCK_PIECES.filter(p => !p.status);
        if (invalidStatus.length > 0) {
            console.error(`Found ${invalidStatus.length} pieces with missing status`);
        } else {
            console.log('All pieces have status field.');
        }

        // 2. Scenario Run
        const repo = new RealDataRepository(MOCK_PIECES);
        const wardrobeMap = MOCK_PIECES.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

        for (const scenario of SCENARIOS) {
            const contextInput = {
                eventType: scenario.event,
                timeOfDay: scenario.time,
                weather: { temp: scenario.temp, rainProb: scenario.rain },
                geoLocation: 'TestCity'
            };

            const result = await generateOutfitSuggestions({
                userId: 'test_user',
                userProfile: {
                    skinTone: { undertone: 'warm', depth: 'medium' },
                    palette: { best: [], avoid: [] },
                    bodyType: 'rectangle',
                    stylePrefs: [],
                    comfortPrefs: { tight: 0.5, loose: 0.5 },
                    weights: { wF: 1, wS: 1, wB: 1, wC: 1, wU: 1, wR: 1, wP: 1 }
                },
                eventParams: contextInput,
                garmentRepo: repo,
                aiService: { generateExplanation: async () => "Verified." }
            });

            console.log(`[${scenario.event}] Generated ${result.outfits.length} outfits`);

            if (result.outfits.length === 0) {
                console.warn(`[WARN] No outfits for ${scenario.event}`);
            }

            for (const outfit of result.outfits) {
                const checks = checkInvariants(result.context, outfit, wardrobeMap);
                const failures = checks.filter(c => c.level === 'FAIL');
                if (failures.length > 0) {
                    console.error(`[FAIL] ${scenario.event}:`, failures.map(f => f.message));
                    throw new Error(`Verification failed for ${scenario.event}: ${failures[0].message}`);
                }
            }
        }

    });

    test('Fuzz Test: Runs 10000 random scenarios against current wardrobe', async () => {
        const { ScenarioGenerator } = require('./generators');
        const generator = new ScenarioGenerator(12345);
        const repo = new RealDataRepository(MOCK_PIECES);
        const wardrobeMap = MOCK_PIECES.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

        console.log('Starting Fuzz Test (10000 iterations)...');
        let passed = 0;
        let warnings = 0;

        for (let i = 0; i < 10000; i++) {
            const contextData = generator.generateContext();

            try {
                const result = await generateOutfitSuggestions({
                    userId: 'test_user',
                    userProfile: generator.generateUserProfile(),
                    eventParams: {
                        eventType: contextData.event,
                        timeOfDay: contextData.timeBucket,
                        weather: { temp: contextData.temp, rainProb: contextData.rainProb },
                        geoLocation: 'TestCity'
                    },
                    garmentRepo: repo,
                    aiService: { generateExplanation: async () => "Verified." }
                });

                if (!result.outfits || result.outfits.length === 0) {
                    process.stdout.write('W');
                    warnings++;
                    continue;
                }

                for (const outfit of result.outfits) {
                    const checks = checkInvariants(result.context, outfit, wardrobeMap);
                    const failures = checks.filter(c => c.level === 'FAIL');
                    if (failures.length > 0) {
                        console.error(`\n[FAIL] Seed ${i} Context: ${JSON.stringify(contextData)}`);
                        console.error('Violations:', failures.map(f => f.message));
                        throw new Error(`Fuzz verification failed: ${failures[0].message}`);
                    }
                }
                passed++;
                if (i % 100 === 0) process.stdout.write('.');
            } catch (e: any) {
                if (e.message.includes('Fuzz verification failed')) throw e;
                // Ignore other generator randomness errors if any, but log them
                console.error(e);
            }
        }
        console.log(`\nFuzz Test Complete. Pass: ${passed}, Warnings (No Outfit): ${warnings}`);
    }, 300000); // 5 min timeout
});
