import { ReliabilityConfig } from './config';
import { ScenarioGenerator } from './scenarioGen';
import { WardrobeSource } from './wardrobeSources';
import { HardInvariants } from './invariants/hard';
import { QualityInvariants } from './invariants/quality';
import { EngineService } from '../../services/EngineService';
import { UserService } from '../../services/UserService';
import { WardrobeService } from '../../services/WardrobeService';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import * as fs from 'fs';

// Constants
const BATCH_SIZE = process.argv.includes('--small') ? 50 : 5000; // Default small is 5000? Let's use 5000 if real
// Use CLI arg for count
const RUN_COUNT = process.argv.includes('--full') ? 100000 :
    process.argv.includes('--small') ? 5000 : 50; // Default dev run 50

export async function runReliability() {
    const isSmall = process.env.RELIABILITY_SMALL === 'true' || process.argv.includes('--small');
    const isFull = process.env.RELIABILITY_FULL === 'true' || process.argv.includes('--full');

    const RUN_COUNT = isFull ? 100000 : (isSmall ? 5000 : 50);

    console.log(`[ReliabilityLab] Starting run with ${RUN_COUNT} scenarios. Seed: ${ReliabilityConfig.SEED}`);

    // Setup Environment
    FeatureFlagService.NEW_ENGINE_ENABLED = true;
    (FeatureFlagService as any).PARALLEL_RUN = false; // Disable parallel to isolate memory

    // Initialize Generator
    const scenarioGen = new ScenarioGenerator(ReliabilityConfig.SEED);
    const scenarios = scenarioGen.generate(RUN_COUNT);

    // Prepare Report
    const failuresStream = fs.createWriteStream(ReliabilityConfig.PATHS.FAILURES, { flags: 'w' });
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    const startTime = Date.now();

    for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];

        // 1. Generate Wardrobe
        // Fuzz size: random between 10 and 200
        const wardrobeSize = 50; // Fixed for now or randomized
        const wardrobe = WardrobeSource.generateFuzzWardrobe(wardrobeSize, scenario.seed);

        // 2. Mock Services (Dirty Injection for Integration Test)
        (UserService.getInstance as any) = () => ({
            getProfile: async () => scenario.userProfile
        });
        (WardrobeService.getInstance as any) = () => ({
            getAllPieces: async () => wardrobe
        });

        // 3. Execute Engine
        const sw = Date.now();
        let result: any[] = [];
        let error: any = null;

        try {
            result = await EngineService.getSuggestions(scenario.userProfile.id, scenario.context.event);
        } catch (e) {
            error = e;
        }
        const latency = Date.now() - sw;

        // 4. Check Invariants
        const checks = [
            ...HardInvariants.checkAll(result, scenario, wardrobe),
            ...QualityInvariants.checkAll(result, scenario, wardrobe)
        ];

        // 5. Analyze
        let isFail = false;
        if (error) {
            isFail = true;
            checks.push({ passed: false, group: 'CRASH', message: error.message || String(error) });
        }

        const failedChecks = checks.filter(c => !c.passed);
        if (failedChecks.length > 0) {
            isFail = true; // Treat all check failures as failures for the report initially
            failed++;

            // Log Failure
            const entry = {
                scenarioId: scenario.id,
                seed: scenario.seed,
                latency,
                error: error ? String(error) : undefined,
                failures: failedChecks
            };
            failuresStream.write(JSON.stringify(entry) + '\n');
        } else {
            passed++;
        }

        // Progress
        if (i % 100 === 0) {
            process.stdout.write(`\rProcessed ${i}/${RUN_COUNT} | Pass: ${passed} | Fail: ${failed}`);
        }
    }

    console.log(`\n[ReliabilityLab] Complete. Pass: ${passed}, Fail: ${failed}`);
    failuresStream.end();
}

// Auto-execute if run as script
if (require.main === module) {
    runReliability().catch(console.error);
}
