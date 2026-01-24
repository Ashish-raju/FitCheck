import { ritualMachine } from '../ui/state/ritualMachine';
import { performanceSeal } from '../system/performanceSeal';

/**
 * SIM_RAGE_INTERACTION
 * 
 * Objective: Verify performance monitoring and silent visual downgrades under stress.
 */
async function run() {
    console.log('>> STARTING SIM_RAGE_INTERACTION');

    // 1. Enter Ritual
    ritualMachine.enterRitual('TEST_UNIFORM_1');

    // 2. Simulate Rage Interation (Heavy frame drops)
    console.log('[SIM] Simulating rapid frame drops...');
    for (let i = 0; i < 10; i++) {
        // Record frames with a delta > 20ms
        performanceSeal.recordFrame(i * 30);
    }

    // 3. Verify Downgrade
    const isDowngraded = performanceSeal.shouldSkipSecondaryMotion();
    console.log(`[SIM] Visual Downgrade Active: ${isDowngraded}`);

    if (isDowngraded) {
        console.log('✅ PASS: System silently downgraded visuals under performance stress.');
    } else {
        console.error('❌ FAIL: System failed to detect performance degradation.');
    }
}

run();
