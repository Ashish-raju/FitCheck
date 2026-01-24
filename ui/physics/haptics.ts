// import * as Haptics from 'expo-haptics'; 
// Commented out to avoid dependency errors if not installed, 
// using generic console logs or empty functions for "Seal" simulation.
// In a real env, this would wrap expo-haptics.

/**
 * TACTILE AUTHORITY
 * 
 * The physical feedback of the Engine.
 */

export const TACTILE = {
    // A subtle "click" when snapping into place
    snap: () => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('[HAPTIC] Snap');
    },

    // A heavy thud when a decision is sealed
    lock: () => {
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('[HAPTIC] LOCK (Heavy)');
    },

    // A rough texture when rejecting (friction)
    discard: () => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log('[HAPTIC] Discard');
    },

    // Something went wrong
    error: () => {
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.log('[HAPTIC] ERROR');
    }
};
