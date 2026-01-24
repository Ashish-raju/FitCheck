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

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                // Generate next three candidates for the carousel
                const next1 = this.director!.startRitual(context);
                const next2 = this.director!.rejectResult(next1, context);
                const next3 = this.director!.rejectResult(next2, context);

                this.slab = [next1, next2, next3];
                resolve();
            }, 0);
        });
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
    public getNext(context: Context): Outfit {
        if (this.slab.length > 0) {
            const next = this.slab.shift()!;
            // Trigger refill in background
            this.fillSlab(context);
            return next;
        }

        // FALLBACK: Conservative candidate served while backgrounding
        console.warn('[Precompute] Slab empty. Serving immediate conservative fallback.');
        return this.director!.startRitual(context);
    }

    public getSafetyUniform(): Outfit | null {
        return this.safetyUniform;
    }
}
