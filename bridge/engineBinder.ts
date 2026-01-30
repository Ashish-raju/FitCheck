import { ContextManager } from '../context/kernel/contextManager';
import { InteractionManager } from 'react-native';
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

    /**
     * ON-DEMAND GENERATION TRIGGER
     * Called by TodayScreen when user clicks "Reveal"
     */
    static async generateNow(): Promise<import('../truth/types').Outfit[]> {
        if (!this.director) {
            console.warn('[EngineBinder] Cannot generate: Director not initialized');
            return [];
        }

        const ctx = ContextManager.getInstance().getCurrent();
        const pre = PrecomputeEngine.getInstance();

        console.log('[EngineBinder] Requested generation. Waiting for UI lane to clear...');

        // EXPERIMENTAL: Traffic Control
        // Wait for all interactions (touches, animations) to finish before starting the heavy engine.
        // This ensures the "Reveal" button animation finishes smoothly before we hog the CPU.
        return new Promise((resolve) => {
            InteractionManager.runAfterInteractions(async () => {
                console.log('[EngineBinder] UI lane clear. Starting logic engine.');

                // Force fill slab (will yield internally for UI smoothness)
                await pre.fillSlab(ctx.weather);

                const outfits = pre.getAllCached();
                console.log(`[EngineBinder] On-Demand Generation complete: ${outfits.length} outfits`);
                resolve(outfits);
            });
        });
    }

    static async rejectCurrent(context: any) {
        if (this.director) {
            const state = ritualMachine.getState();
            const currentOutfit = state.candidateOutfits[state.currentOutfitIndex];
            if (!currentOutfit) return;

            console.log(`[EngineBinder] Rejecting: ${currentOutfit.id}`);

            const start = performanceSeal.startTimeToGlass();

            const nextOutfit = await this.director.rejectResult(currentOutfit, context);

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
        // ON-DEMAND ONLY: Do not auto-run. 
        // We simply update the inventory reference here.
        // The actual computation will be triggered by the user in TodayScreen.
        console.log('[EngineBinder] Updating inventory reference...');
        this.inventory = inventory;

        // Also update the director with new inventory, but do NOT fill slab yet.
        const director = new RitualDirector(inventory);
        this.setDirector(director);

        // Clear old slab to ensure freshness when user does click Reveal
        const pre = PrecomputeEngine.getInstance();
        pre.clearSlab();

        console.log('[EngineBinder] Engine inventory updated. Waiting for Reveal trigger.');
    }
}
