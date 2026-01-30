import type { Outfit, Context } from "../../truth/types";
import { RitualDirector } from "../ritual/ritualDirector";

/**
 * COMPUTATION INVISIBILITY LAYER
 * 
 * Pre-generates ritual candidates in a memory slab
 * to ensure zero-wait UI transitions.
 */
export class PrecomputeEngine {
    private static instance: PrecomputeEngine;
    private slab: Outfit[] = [];
    private safetyUniform: Outfit | null = null;
    private director: RitualDirector | null = null;

    public static getInstance() {
        if (!PrecomputeEngine.instance) {
            PrecomputeEngine.instance = new PrecomputeEngine();
        }
        return PrecomputeEngine.instance;
    }

    public initialize(director: RitualDirector) {
        this.director = director;
    }

    /**
     * Fills the memory slab with the next potential candidates.
     */
    public async fillSlab(context: Context) {
        if (!this.director) return;

        console.log('[Precompute] Filling slab via Background Worker...');

        try {
            this.slab = []; // Reset slab

            // 1. Initial Candidate
            // Now fully non-blocking thanks to background worker
            let current = await this.director.startRitual(context);
            this.slab.push(current);

            // 2. Generate rest (Total 5)
            // We can run these sequentially or parallel. Sequential is safer for "Rejection" logic chain.
            for (let i = 0; i < 4; i++) {
                current = await this.director.rejectResult(current, context);
                this.slab.push(current);
            }

            console.log(`[Precompute] Slab filled with ${this.slab.length} outfits.`);

        } catch (e) {
            console.error('[Precompute] Failed to fill slab:', e);
            // Fallback: If background worker fails, we might have an empty slab.
            // The getNext() method handles empty slab with a safe synchronous fallback if needed (though that would block).
            // Ideal production hardening: Trigger a "Toast" or "Retry".
        }
    }

    /**
     * Returns all currently cached outfits.
     */
    public getAllCached(): Outfit[] {
        return [...this.slab];
    }

    public clearSlab() {
        this.slab = [];
    }

    /**
     * Serves a cached candidate or triggers emergency background generation.
     */
    public async getNext(context: Context): Promise<Outfit> {
        if (this.slab.length > 0) {
            const next = this.slab.shift()!;
            // Trigger refill in background
            this.fillSlab(context);
            return next;
        }

        // FALLBACK: Conservative candidate served while backgrounding
        console.warn('[Precompute] Slab empty. Serving immediate conservative fallback (Async).');
        return await this.director!.startRitual(context);
    }

    public getSafetyUniform(): Outfit | null {
        return this.safetyUniform;
    }
}
