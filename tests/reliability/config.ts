export const ReliabilityConfig = {
    // Run Configuration
    SEED: parseInt(process.env.RELIABILITY_SEED || '12345'),
    MODE: process.env.RELIABILITY_MODE || 'SYNTHETIC_FUZZ', // REAL_DB, REAL_DB_SAMPLED, SYNTHETIC_FUZZ
    USER_ID: process.env.RELIABILITY_USER_ID || 'u1',

    // Thresholds
    THRESHOLDS: {
        LATENCY_P95_MS: 200, // Strict latency budget
        MAX_HARD_FAILS: 0,
        MAX_WARNING_RATE: 0.01 // 1%
    },

    // Paths
    PATHS: {
        REPORT: './tests/reliability/REPORT.md',
        FAILURES: './tests/reliability/failures.jsonl'
    }
};
