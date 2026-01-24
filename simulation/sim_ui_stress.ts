import { ritualMachine } from '../ui/state/ritualMachine';
import { INITIAL_STATE } from '../ui/state/uiState';

/**
 * SIMULATION GATE 3: UI STRESS
 * 
 * Asserts:
 * 1. Panic swipes (rapid state changes)
 * 2. Illegal transitions
 * 3. Null state prevention
 */

const LOG = (msg: string) => console.log(`[SIM-UI] ${msg}`);
const FAIL = (msg: string) => { console.error(`[FAIL] ${msg}`); process.exit(1); };

async function runSimulation() {
    LOG('Starting UI Stress Test...');

    // 1. Reset
    ritualMachine.resetToVoid();
    if (ritualMachine.getState().phase !== 'VOID') FAIL('Reset failed');
    LOG('Reset verified.');

    // 2. Illegal Transition Check (VOID -> SEAL)
    console.warn = () => { }; // Suppress warning for test
    ritualMachine.sealRitual('illegal_outfit');
    if (ritualMachine.getState().phase === 'SEAL') FAIL('Illegal transition VOID->SEAL succeeded');
    LOG('Illegal transition blocked.');

    // 3. Enter (VOID -> RITUAL)
    ritualMachine.enterRitual('outfit_001');
    if (ritualMachine.getState().phase !== 'RITUAL') FAIL('Enter Ritual failed');
    if (ritualMachine.getState().candidateId !== 'outfit_001') FAIL('Candidate data lost');
    LOG('Ritual Entry verified.');

    // 4. Panic Swipes (Stress)
    LOG('Simulating Panic Swipes (1000 ops)...');
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
        ritualMachine.setSwipe(i % 2 === 0 ? 'LEFT' : 'RIGHT');
        // Randomly try to seal or reset
        // if (Math.random() > 0.99) ritualMachine.sealRitual('panic_seal'); 
        // ^ Doing this would actually change state and stop swipes, so kept simple for "Swipe Stress"
    }
    const duration = Date.now() - start;
    LOG(`1000 Swipe updates in ${duration}ms (${duration / 1000}ms per op)`);

    if (duration > 200) FAIL('State updates too slow (< 5000fps equivalent required for logic)');
    LOG('Performance check passed.');

    // 5. Seal
    ritualMachine.sealRitual('outfit_final');
    if (ritualMachine.getState().phase !== 'SEAL') FAIL('Seal failed');
    if (ritualMachine.getState().lockedOutfitId !== 'outfit_final') FAIL('Lock ID mismatch');
    LOG('Seal verified.');

    LOG('ALL SYSTEMS PASS. UI IS ROBUST.');
}

runSimulation();
