// Jest setup file
// Set global test timeout
jest.setTimeout(30000);

// Suppress console logs in tests unless explicitly needed
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
};
