/**
 * Calculates entropy drift for items based on time since last worn.
 * Higher entropy means the item is "fading" from priority.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const HALFLIFE_DAYS = 7; // Entropy increases by 0.1 every 7 days? Or decay logic.

// Linear drift: 0 to 1 over 30 days.
const MAX_DECAY_DAYS = 30;

export function calculateEntropy(lastWornTimeMs: number | undefined, nowMs: number = Date.now()): number {
    if (!lastWornTimeMs) {
        // Never worn items have high entropy? Or 0?
        // Let's say new items have 0 entropy (fresh).
        return 0;
    }

    const deltaMs = nowMs - lastWornTimeMs;
    const daysDiff = deltaMs / DAY_MS;

    // Simple linear decay for now.
    // 0 days = 0.0 entropy
    // 30 days = 1.0 entropy
    const entropy = Math.min(daysDiff / MAX_DECAY_DAYS, 1.0);

    return parseFloat(entropy.toFixed(4));
}
