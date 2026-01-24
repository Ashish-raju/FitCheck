import { ContextManager } from '../context/kernel/contextManager';
import type { Inventory } from '../truth/types';
import { RitualDirector } from '../engine/ritual/ritualDirector';
import { ritualMachine } from '../ui/state/ritualMachine';
import { PrecomputeEngine } from '../engine/runtime/precompute';
import { performanceSeal } from '../system/performanceSeal';
import { SensoryBinder } from '../system/sensoryBinder';

// This binder acts as the synapse between the Nervous System (Context) and the Brain (Engine)
export class EngineBinder {
    private static director: RitualDirector | null = null;

    private static inventory: Inventory | null = null;

    static setDirector(director: RitualDirector) {
        this.director = director;
        PrecomputeEngine.getInstance().initialize(director);
    }

    static bind(inventory: Inventory) {
        this.inventory = inventory;
        ContextManager.getInstance().subscribe(async (ctx) => {
            try {
                // When context changes (time, weather), we ping the engine
                console.log(`[EngineBinder] Context Pulse: ${ctx.id} | Weather: ${ctx.weather.condition}`);

                if (this.director) {
                    await this.execute();
                }
            } catch (error) {
                console.error('[EngineBinder] CATASTROPHIC ENGINE ERROR:', error);
            }
        });
    }

    static async execute() {
        if (!this.director || !this.inventory) return;

        const ctx = ContextManager.getInstance().getCurrent();
        console.log('[EngineBinder] Executing Proposal Generation...');
        const pre = PrecomputeEngine.getInstance();
        await pre.fillSlab(ctx.weather);

        // TRANSITION: Move to RITUAL once slab is ready
        const outfits = pre.getAllCached();
        const state = ritualMachine.getState();
        if (state.phase === 'VOID' || state.phase === 'HOME') {
            ritualMachine.enterRitual(outfits);
        }
    }

    static rejectCurrent(context: any) {
        if (this.director) {
            const state = ritualMachine.getState();
            const currentOutfit = state.candidateOutfits[state.currentOutfitIndex];
            if (!currentOutfit) return;

            console.log(`[EngineBinder] Rejecting: ${currentOutfit.id}`);

            const start = performanceSeal.startTimeToGlass();

            const nextOutfit = this.director.rejectResult(currentOutfit, context);

            performanceSeal.endTimeToGlass(start);
            performanceSeal.monitorVeto(performance.now() - start);

            console.log(`[EngineBinder] New Proposal replacing current slot: ${nextOutfit.id}`);

            // Replace the rejected outfit in the list
            const newOutfits = [...state.candidateOutfits];
            newOutfits[state.currentOutfitIndex] = nextOutfit;

            ritualMachine.updateRitualOutfits(newOutfits);
            SensoryBinder.triggerTransition();
        }
    }
}
