module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
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
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
