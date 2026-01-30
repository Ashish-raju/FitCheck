import { GarmentMeta, UserProfileMeta } from '../types';
import { ProfileLearner } from '../learning';

export class FeedbackService {

    /**
     * Process a user interaction with an outfit.
     * Returns the *updated* UserProfile (so the app can save it).
     */
    static handleInteraction(
        items: GarmentMeta[],
        action: 'like' | 'dislike' | 'worn',
        user: UserProfileMeta
    ): UserProfileMeta {

        // 1. Update Garment State (In-Memory for now, would be DB write)
        if (action === 'worn') {
            const now = Date.now();
            items.forEach(item => {
                item.lastWornTimestamp = now;
                if (item.status === 'active') {
                    // Start dirty timer? 
                    // item.status = 'laundry'; // Maybe too aggressive for MVP
                }
            });
        }

        // 2. Learn
        const newUserProfile = ProfileLearner.learnFromInteraction(items, action, user);

        return newUserProfile;
    }
}
