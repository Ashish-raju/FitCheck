import * as FileSystem from 'expo-file-system';
import { safetyBoot } from '../state/storage/safetyBoot';
import { DEFAULT_STATE } from '../state/storage/schema';

/**
 * SIM_CORRUPT
 * 
 * Objective: Verify system detects corruption and restores default state without crashing.
 */
async function run() {
    console.log('>> STARTING SIM_CORRUPT');

    const STORAGE_PATH = './state/storage.json';

    // 1. Write Invalid JSON (Corruption)
    console.log('[SIM] Injecting corruption...');
    await FileSystem.writeAsStringAsync(STORAGE_PATH, '{ "BROKEN_JSON": true, ... ');

    // 2. Boot System
    console.log('[SIM] Booting system...');
    try {
        const state = await safetyBoot(STORAGE_PATH);

        // 3. Assertions
        if (!state) throw new Error('Boot returned null/undefined state');

        // Check if it matches default state structure
        if (state.version !== DEFAULT_STATE.version) {
            throw new Error('State version mismatch - expected reset to default');
        }

        // Check if trust score is reset (assuming default is 100)
        if (state.trustScore !== DEFAULT_STATE.trustScore) {
            throw new Error('Trust score not reset to default');
        }

        console.log('✅ PASS: SafetyBoot triggered, inventory restored, no crash.');

    } catch (error) {
        console.error('❌ FAIL: System crashed or failed to handle corruption.', error);
    }
}

if (require.main === module) {
    run();
}
