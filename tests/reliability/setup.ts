// Mock expo-constants to prevent import errors
jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        expoConfig: {
            extra: {
                firebase: {
                    apiKey: 'mock-api-key',
                    authDomain: 'mock-domain',
                    projectId: 'mock-project',
                    storageBucket: 'mock-bucket',
                    messagingSenderId: 'mock-sender',
                    appId: 'mock-app-id'
                }
            }
        }
    }
}));

// Mock Firebase
jest.mock('firebase/compat/app', () => ({
    initializeApp: jest.fn(),
    apps: []
}));

jest.mock('firebase/compat/auth', () => ({}));
jest.mock('firebase/compat/firestore', () => ({}));
jest.mock('firebase/compat/storage', () => ({}));

// Mock React Native modules that may be imported
jest.mock('react-native', () => ({
    Platform: { OS: 'ios', select: jest.fn() },
    Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) }
}));

// Suppress console logs during tests (optional)
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
