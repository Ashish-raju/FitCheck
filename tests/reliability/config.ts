
export const TestConfig = {
    // Mode
    // REAL_DB: Connect to actual dev DB (read-only)
    // FIXTURES: Use purely synthetic data
    DB_MODE: process.env.DB_MODE || 'FIXTURES',

    // Target User ID for real DB sampling
    TARGET_USER_ID: process.env.TARGET_USER_ID,

    // Count
    TEST_COUNT: process.env.TEST_COUNT ? parseInt(process.env.TEST_COUNT) : 100000,

    // Performance Thresholds (ms)
    MAX_LATENCY_SMALL: 2000, // Wardrobe size 200 (P95)
    MAX_LATENCY_LARGE: 3000, // Wardrobe size 1000 (P95)

    // Seeds
    MASTER_SEED: 12345,
};
