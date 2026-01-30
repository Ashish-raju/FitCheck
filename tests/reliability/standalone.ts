#!/usr/bin/env ts-node
/**
 * Standalone Reliability Lab Runner
 * Run with: npx ts-node tests/reliability/standalone.ts --small
 * 
 * This bypasses Jest and runs the reliability harness directly,
 * making it easier to debug compilation and runtime issues.
 */

import { runReliability } from './run';

// Set environment for small run
process.env.RELIABILITY_SMALL = 'true';
process.env.RELIABILITY_MODE = 'SYNTHETIC_FUZZ';
process.env.RELIABILITY_SEED = '12345';

console.log('=== Standalone Reliability Lab Runner ===');
console.log('Running in SYNTHETIC_FUZZ mode with 5,000 scenarios\n');

runReliability()
    .then(() => {
        console.log('\n✅ Reliability Lab Complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Reliability Lab Failed:');
        console.error(error);
        process.exit(1);
    });
