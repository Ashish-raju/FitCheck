import { runReliability } from './run';

describe('Reliability Lab', () => {
    // 1 Hour Timeout for Full Suite
    jest.setTimeout(3600000);

    test('should execute reliability harness', async () => {
        // Just invoke the runner
        await runReliability();
    });
});
