module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.jsx?$': 'babel-jest',
    },
    collectCoverageFrom: [
        'engine/outfit/**/*.ts',
        '!engine/outfit/**/*.test.ts',
        '!engine/outfit/test_runner.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    setupFiles: ['<rootDir>/node_modules/react-native/jest/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!(expo-constants|expo-modules-core|@react-native|react-native|expo-asset|expo-file-system|expo-font|expo-keep-awake|expo-error-recovery|expo-font|expo-secure-store|@expo|firebase)/)'
    ],
    globals: {
        __DEV__: true
    }
};
