
import { generateOutfitSuggestions } from '../../engine/outfit/index';
// import { FirebaseGarmentRepository } from '../../services/FirebaseGarmentRepository'; // We mock this
import { TestConfig } from './config';
import { ScenarioGenerator } from './generators';
import { checkInvariants } from './invariants';
import { ReliabilityReporter } from './report';
import { Piece, Category } from '../../truth/types';
import { Garment, Color, Pattern, Fit, GarmentType, Context } from '../../engine/outfit/models';

describe('Reliability Harness', () => {
    test('runs reliability cases', async () => {
        // Run small batch for test environment unless configured otherwise
        process.env.RELIABILITY_SMALL = 'true';
        await run();
    }, 1200000); // 20 min timeout
});


// Mock Repository
class MockGarmentRepository {
    private wardrobe: Piece[];

    constructor(wardrobe: Piece[]) {
        this.wardrobe = wardrobe;
    }

    async getAllUserGarments(userId: string): Promise<Garment[]> {
        return this.wardrobe.map(p => this.mapPieceToGarment(p));
    }

    // Simplified mapper mimicking FirebaseGarmentRepository
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
            pattern: (piece.pattern as Pattern) || 'solid',
            fit: (piece.fit as Fit) || 'regular',
            formality: piece.formality,
            colors: [{ hex: piece.color, h: 0, s: 0, l: 0, dictColorId: 10 }] as Color[], // Mock color
            seasonScore: { summer: 0.5, monsoon: 0.5, winter: 0.5 },
            bodyScore: {},
            styleTags: piece.styleTags || [],
            layerWeight: piece.warmth || 1,
            wornCount: piece.currentUses || 0,
            status: (piece.status as any) || 'Clean'
        };
    }

    async getUserProfile(userId: string) {
        return null; // We pass profile explicitly to engine
    }
}

// Mock AI
const MockAIService = {
    generateExplanation: async () => "Mock explanation."
};

async function run() {
    const reporter = new ReliabilityReporter();
    const count = process.argv.includes('--small') ? 2000 : TestConfig.TEST_COUNT;

    console.log(`Starting Reliability Run: ${count} cases...`);

    // Use simple performance tracker
    const latencyStats = { count: 0, total: 0, max: 0 };

    for (let i = 0; i < count; i++) {
        const seed = TestConfig.MASTER_SEED + i;
        const generator = new ScenarioGenerator(seed);

        const context = generator.generateContext();
        const userProfile = generator.generateUserProfile();
        const wardrobeMap = generator.generateWardrobe(Math.floor(Math.random() * 50) + 10); // Small to Med wardrobes
        const wardrobeArray = Object.values(wardrobeMap);

        const mockRepo = new MockGarmentRepository(wardrobeArray);

        try {
            const start = Date.now();
            const result = await generateOutfitSuggestions({
                userId: 'test_user',
                userProfile,
                eventParams: {
                    eventType: context.event,
                    timeOfDay: context.timeBucket,
                    weather: { temp: context.temp, rainProb: context.rainProb },
                    geoLocation: 'TestCity'
                },
                garmentRepo: mockRepo,
                aiService: MockAIService
            });
            const duration = Date.now() - start;

            latencyStats.count++;
            latencyStats.total += duration;
            latencyStats.max = Math.max(latencyStats.max, duration);

            // Invariants
            if (!result.outfits || result.outfits.length === 0) {
                // Warning for empty results
                reporter.logResult({ passed: true, level: 'WARN', seed, context, details: { message: 'No outfits generated' } });
            }

            for (const outfit of result.outfits || []) {
                const checks = checkInvariants(result.context, outfit, wardrobeMap);

                for (const check of checks) {
                    reporter.logResult({ passed: check.pass, level: check.level, seed, context, details: { message: check.message, code: check.code, outfitIds: outfit.items } });
                }
            }

            // Performance Check
            if (duration > TestConfig.MAX_LATENCY_SMALL) {
                reporter.logResult({ passed: false, level: 'FAIL', seed, context, details: { message: `Performance: ${duration}ms`, code: 'P1_LATENCY' } });
            }

        } catch (e: any) {
            reporter.logResult({ passed: false, level: 'FAIL', seed, context, details: { message: `Crash: ${e.message}`, stack: e.stack } });
        }

        if (i % 500 === 0) process.stdout.write('.');
    }

    console.log('\nRun complete.');
    console.log(`Avg Latency: ${(latencyStats.total / latencyStats.count).toFixed(2)}ms, Max: ${latencyStats.max}ms`);
    reporter.writeReport();

    if (reporter.getFailureCount() > 0) {
        console.error(`FAILED with ${reporter.getFailureCount()} errors.`);
        process.exit(1);
    }
}

// run(); // Executed by test runner
