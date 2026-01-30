import { GarmentMeta, UserProfileMeta } from '../types';

export class ProfileLearner {

    /**
     * Adapt user profile based on feedback.
     * Returns a NEW UserProfileMeta object (immutable update).
     */
    static learnFromInteraction(
        items: GarmentMeta[],
        action: 'like' | 'dislike' | 'worn',
        user: UserProfileMeta
    ): UserProfileMeta {
        const updatedUser = JSON.parse(JSON.stringify(user)); // Deep copy-ish
        const LR = 0.1; // Learning Rate

        if (action === 'worn' || action === 'like') {
            // Signal: User likes what we gave them.
            // Action: Reinforce current weights (or boost 'style' confidence).
            updatedUser.weights.style = Math.min(2.0, user.weights.style + (0.05 * LR));
            updatedUser.weights.comfort = Math.min(2.0, user.weights.comfort + (0.05 * LR));

            // If they wore it, maybe they like the fit?
            // A more advanced engine would check if items.fitType matches user.fitPreference
            // and reinforce it.
        }

        if (action === 'dislike') {
            // Signal: Something was wrong.
            // Action: Reduce 'style' confidence slightly? 
            // Or maybe increase 'colorHarmony' importance if they disliked clashing colors?
            updatedUser.weights.colorHarmony = Math.min(2.0, user.weights.colorHarmony + (0.1 * LR));
        }

        return updatedUser;
    }

    // Future: Method to slowly shift 'bestColors' based on what is actually worn.
    // static updateColorPreferences(...)
}
