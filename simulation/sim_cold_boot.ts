import { BootLoader } from '../runtime/bootLoader.ts';
import { RuntimeOrchestrator } from '../runtime/runtimeOrchestrator.ts';
import { BootProfiler } from '../runtime/metrics/bootProfiler.ts';

async function simColdBoot() {
    console.log('[SIM] STARTING COLD BOOT DRILL');
    BootProfiler.startBoot();

    try {
        await BootLoader.boot();
        RuntimeOrchestrator.orchestrate();

        BootProfiler.endBoot();
        console.log('[SIM] Cold Boot Verified. No crash.');
    } catch (e) {
        console.error('[SIM] COLD BOOT FAILED', e);
        process.exit(1);
    }
}

simColdBoot();
