import { describe, test, expect } from '@jest/globals';
import { UserLearner, LearningSignal } from '../../engine/outfit/learning';
import { UserProfileBuilder } from '../utils/builders';

describe('Learning Loop', () => {
    describe('Signal processing', () => {
        test('save signal increases style weight', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const updated = UserLearner.learnFromInteraction(user, 'save', ['g1', 'g2']);

            expect(updated.weights.wU).toBeGreaterThan(user.weights.wU);
        });

        test('favorite signal increases style weight more than save', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const savedUser = UserLearner.learnFromInteraction(user, 'save', ['g1']);
            const favoritedUser = UserLearner.learnFromInteraction(user, 'favorite', ['g1']);

            expect(favoritedUser.weights.wU).toBeGreaterThan(savedUser.weights.wU);
        });

        test('skip signal decreases style weight', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const updated = UserLearner.learnFromInteraction(user, 'skip', ['g1']);

            expect(updated.weights.wU).toBeLessThanOrEqual(user.weights.wU);
        });

        test('delete signal decreases style weight', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const updated = UserLearner.learnFromInteraction(user, 'delete', ['g1']);

            expect(updated.weights.wU).toBeLessThan(user.weights.wU);
        });
    });

    describe('Bounded updates', () => {
        test('weights never exceed upper bound', () => {
            let user = new UserProfileBuilder().weights({ wU: 1.9 }).build();

            // Apply many positive signals
            for (let i = 0; i < 100; i++) {
                user = UserLearner.learnFromInteraction(user, 'favorite', ['g1']);
            }

            expect(user.weights.wU).toBeLessThanOrEqual(2.0);
        });

        test('weights never go below lower bound', () => {
            let user = new UserProfileBuilder().weights({ wU: 0.6 }).build();

            // Apply many negative signals
            for (let i = 0; i < 100; i++) {
                user = UserLearner.learnFromInteraction(user, 'delete', ['g1']);
            }

            expect(user.weights.wU).toBeGreaterThanOrEqual(0.5);
        });
    });

    describe('Monotonic changes', () => {
        test('positive signals always increase or maintain weights', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();

            const updated1 = UserLearner.learnFromInteraction(user, 'save', ['g1']);
            expect(updated1.weights.wU).toBeGreaterThanOrEqual(user.weights.wU);

            const updated2 = UserLearner.learnFromInteraction(user, 'favorite', ['g1']);
            expect(updated2.weights.wU).toBeGreaterThanOrEqual(user.weights.wU);
        });

        test('negative signals always decrease or maintain weights', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();

            const updated1 = UserLearner.learnFromInteraction(user, 'skip', ['g1']);
            expect(updated1.weights.wU).toBeLessThanOrEqual(user.weights.wU);

            const updated2 = UserLearner.learnFromInteraction(user, 'delete', ['g1']);
            expect(updated2.weights.wU).toBeLessThanOrEqual(user.weights.wU);
        });
    });

    describe('Slow learning', () => {
        test('single interaction has small impact', () => {
            const user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const updated = UserLearner.learnFromInteraction(user, 'favorite', ['g1']);

            const delta = Math.abs(updated.weights.wU - user.weights.wU);
            expect(delta).toBeLessThan(0.1); // Small incremental change
        });

        test('multiple interactions accumulate gradually', () => {
            let user = new UserProfileBuilder().weights({ wU: 1.0 }).build();
            const initial = user.weights.wU;

            for (let i = 0; i < 10; i++) {
                user = UserLearner.learnFromInteraction(user, 'favorite', ['g1']);
            }

            const totalDelta = Math.abs(user.weights.wU - initial);
            expect(totalDelta).toBeGreaterThan(0.05); // Accumulated change
            expect(totalDelta).toBeLessThan(0.5); // But still gradual
        });
    });
});
