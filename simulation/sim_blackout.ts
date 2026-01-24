import { safetyBoot } from '../state/storage/safetyBoot';

/**
 * SIM_BLACKOUT
 * 
 * Objective: Verify system boots safely without network access.
 * Since Phase 2 does not have the Engine, we verify State hydration.
 */
async function run() {
    console.log('>> STARTING SIM_BLACKOUT');

    // 1. Simulate Network Down (Conceptually - since we use no network in boot yet)
    const NETWORK_AVAILABLE = false;

    // 2. Boot System
    const STORAGE_PATH = './state/storage.json';
    console.log(`[SIM] Booting from ${STORAGE_PATH} with Network=${NETWORK_AVAILABLE}`);

    try {
        const state = await safetyBoot(STORAGE_PATH);

        // 3. Assertions
        if (!state) throw new Error('Boot returned null/undefined state');
        if (state.version !== 1) throw new Error('Boot returned invalid schema version');

        console.log('✅ PASS: System booted to valid state.');
    } catch (error) {
        console.error('❌ FAIL: System crashed during blackout boot.', error);
    }
}

if (require.main === module) {
    run();
}
