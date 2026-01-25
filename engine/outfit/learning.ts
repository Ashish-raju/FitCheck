import { UserProfile } from './models';

// Signals
export type LearningSignal = "save" | "favorite" | "skip" | "delete";

export const SIGNAL_VALUES: Record<LearningSignal, number> = {
    "save": 2,
    "favorite": 3,
    "skip": -1,
    "delete": -2
};

export class UserLearner {
    /**
     * Update User Profile based on interaction
     * "Learning must be slow, bounded, and monotonic."
     */
    static learnFromInteraction(
        user: UserProfile,
        signal: LearningSignal,
        garmentIds: string[],
        // garments: Garment[] // could use to learn style/color
    ): UserProfile {
        // Clone user to avoid mutation side-effects logic elsewhere
        const newUser = JSON.parse(JSON.stringify(user)) as UserProfile;

        // Update weights? Spec: "Update: user.weights, palette preferences, repetition penalties, style affinity"

        const delta = SIGNAL_VALUES[signal];
        const LEARNING_RATE = 0.01;

        // Example: If user Favorites (+3), slightly increase Style Weight? 
        // Or increase affinity for the specific styles of the outfit?
        // "Update user.weights" probably implies tuning wF, wS, etc. based on feedback.
        // Without strict feedback on "Why" they liked it, it's hard to tune component weights.
        // Assume we update "Style Affinity" mostly.

        // If we have styleTags in the items (need garment objects), we would boost them in user.stylePrefs.

        // Updating Global Weights (wU, wC etc) - Placeholder Logic:
        // If they interact positively often, maybe trust style (wU) more?
        // If they skip, maybe boost Comfort?

        // For now, let's implement "repetition penalty" update?
        // "Update repetition penalties"
        // If they SAVE an outfit, maybe we reduce the repetition penalty for those items? 
        // Or if they DELETE, we increase it?

        // Implementation of "Slow, Bounded" weight update
        // Let's tweak wU (Style Weight) as a proxy
        if (delta > 0) {
            newUser.weights.wU = Math.min(2.0, newUser.weights.wU + (delta * LEARNING_RATE));
        } else {
            newUser.weights.wU = Math.max(0.5, newUser.weights.wU + (delta * LEARNING_RATE));
        }

        return newUser;
    }
}
