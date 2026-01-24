export const CONSTRAINTS = {
    MAX_VETO_COUNT: 3,
    TIME_TO_GLASS_MS: 200,
    VETO_LATENCY_MS: 50,
    LOCK_LATENCY_MS: 100,
    MIN_FPS: 58,
    INVENTORY: {
        MAX_ITEMS: 1000,
        MIN_ITEMS_FOR_VALID_OUTFIT: 2, // e.g. Top + Bottom
    },
    CONTEXT: {
        COLD_THRESHOLD: 10,
        HOT_THRESHOLD: 25,
    }
} as const;
