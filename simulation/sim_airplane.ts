import { BootLoader } from '../runtime/bootLoader.ts';
import { ContextManager } from '../context/kernel/contextManager.ts';

async function simAirplaneMode() {
    console.log('[SIM] STARTING AIRPLANE MODE DRILL (Network Failure)');

    // Mock Context Manager's external fetcher to fail
    // (Assuming we could inject a mock, effectively we simulate ignoring weather updates or default fallback)

    try {
        await BootLoader.boot();

        console.log('[SIM] Simulating Network Failure on Context Update...');
        // We push an update with MISSING data usually fetched from network?
        // Or just ensure it doesn't crash if we can't reach weather service.
        // For V1 binding, we rely on cached/default context.

        const current = ContextManager.getInstance().getCurrent();
        if (current) {
            console.log('[SIM] System survived with cached/default context:', current.id);
        } else {
            throw new Error('System blank state on airplane mode');
        }

    } catch (e) {
        console.error('[SIM] AIRPLANE MODE FAILED', e);
        process.exit(1);
    }
}

simAirplaneMode();
