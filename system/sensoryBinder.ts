import * as Haptics from 'expo-haptics';
import { performanceSeal } from './performanceSeal';

/**
 * SENSORY BINDER
 * 
 * Maps system states and performance metrics to physical feedback.
 */
export const SensoryBinder = {
    /**
     * Binds haptics to every state transition.
     */
    triggerTransition: async () => {
        if (performanceSeal.shouldSkipSecondaryMotion()) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    },

    /**
     * Seal event to OS-level vibration.
     */
    triggerSeal: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Heavy combined haptic for the "Seal"
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    },

    /**
     * Failure/Safety vibration.
     */
    triggerSafety: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
};
