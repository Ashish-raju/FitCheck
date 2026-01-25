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

        // GUARD: Don't execute until inventory is properly seeded (>10 items)
        const itemCount = Object.keys(this.inventory.pieces).length;
        if (itemCount < 10) {
            console.log(`[EngineBinder] Skipping execute - inventory too small (${itemCount} items). Waiting for seeding...`);
            return;
        }

        const ctx = ContextManager.getInstance().getCurrent();
        console.log('[EngineBinder] Executing Proposal Generation...');
        const pre = PrecomputeEngine.getInstance();
        await pre.fillSlab(ctx.weather);

        // TRANSITION: Move to RITUAL once slab is ready
        const outfits = pre.getAllCached();

        // DEBUG: Prove engine uses real wardrobe items
        console.log(`[EngineBinder] Generated ${outfits.length} outfits from real wardrobe data`);
        outfits.forEach((outfit, i) => {
            const itemNames = outfit.pieces.map(p => p.name || `${p.color} ${p.category}`).join(', ');
            console.log(`  Outfit ${i + 1}: ${itemNames} (score: ${outfit.score.toFixed(1)})`);
        });

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

    /**
     * Reinitialize the engine with updated inventory (e.g., after seeding mock data)
     */
    static async reinitialize(inventory: Inventory) {
        console.log('[EngineBinder] Reinitializing engine with updated inventory...');
        const director = new RitualDirector(inventory);
        this.setDirector(director);
        this.inventory = inventory;

        // CRITICAL: Clear old precomputed outfits and regenerate with new inventory
        const pre = PrecomputeEngine.getInstance();
        pre.clearSlab();
        const ctx = ContextManager.getInstance().getCurrent();
        await pre.fillSlab(ctx.weather);

        console.log('[EngineBinder] Engine reinitialized successfully with fresh outfits');
    }
}
