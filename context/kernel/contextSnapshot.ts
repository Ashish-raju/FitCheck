import type { Context } from '../../truth/types.ts';

/**
 * The single source of truth for "Now".
 * Immutable by design.
 */
export interface ContextVector {
    readonly id: string; // Unique snapshot ID
    readonly timestamp: number; // Epoch ms
    readonly timezone: string;

    readonly weather: Context;

    // Time-derived signals
    readonly isDaytime: boolean;
    readonly dayPhase: "Morning" | "Day" | "Evening" | "Night";

    // Ritual signals
    readonly isRitualActive: boolean;
    readonly timeSinceLastRitual: number;
}

export const INITIAL_CONTEXT: ContextVector = {
    id: "genesis",
    timestamp: 0,
    timezone: "UTC",
    weather: {
        temperature: 20,
        condition: "Clear",
        occasion: "Standard"
    },
    isDaytime: true,
    dayPhase: "Day",
    isRitualActive: false,
    timeSinceLastRitual: -1
};

export function createSnapshot(
    base: ContextVector,
    updates: Partial<ContextVector>
): ContextVector {
    const now = Date.now();
    return Object.freeze({
        ...base,
        ...updates,
        timestamp: now,
        id: `ctx_${now}_${Math.random().toString(36).substr(2, 5)}`
    });
}
