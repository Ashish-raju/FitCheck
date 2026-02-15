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

// Mock React Native to fix Expo dependencies
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj.ios || obj.default,
    },
    NativeModules: {},
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
    manifest: {
        extra: {
            firebase: {
                apiKey: "test-api-key",
                authDomain: "test-project.firebaseapp.com",
                projectId: "test-project",
                storageBucket: "test-project.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef"
            }
        }
    },
    expoConfig: {
        extra: {
            firebase: {
                apiKey: "test-api-key",
                authDomain: "test-project.firebaseapp.com",
                projectId: "test-project",
                storageBucket: "test-project.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef"
            }
        }
    }
}));

// Mock Firebase
const firebaseMock = {
    apps: [],
    ensureInitialized: jest.fn(),
    initializeApp: jest.fn(() => firebaseMock),
    app: jest.fn(() => firebaseMock),
    auth: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' },
        onAuthStateChanged: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
        signOut: jest.fn(),
        useEmulator: jest.fn(),
    })),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
                set: jest.fn(),
                update: jest.fn(),
                onSnapshot: jest.fn(),
            })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ docs: [] })),
                onSnapshot: jest.fn(),
            })),
            add: jest.fn(),
        })),
        useEmulator: jest.fn(),
    })),
    storage: jest.fn(() => ({
        ref: jest.fn(() => ({
            put: jest.fn(),
            getDownloadURL: jest.fn(() => Promise.resolve('https://test-url.com')),
        })),
        useEmulator: jest.fn(),
    })),
};

jest.mock('firebase/compat/app', () => firebaseMock);
jest.mock('firebase/compat/auth', () => ({}));
jest.mock('firebase/compat/firestore', () => ({}));
jest.mock('firebase/compat/storage', () => ({}));
