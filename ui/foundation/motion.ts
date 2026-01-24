/**
 * THE PHYSICS OF CERTAINTY
 * 
 * Fast. Snappy. No bounce.
 * Things don't float; they arrive.
 */

export const DURATION = {
    instant: 0,
    fast: 150,
    normal: 250,
    deliberate: 400, // For big state changes
} as const;

export const EASING = {
    // Cubic beziers
    sharp: 'cubic-bezier(0.2, 0.0, 0.2, 1.0)', // Standard snappy
    hold: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)', // Decelerate only
    reject: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)', // Harsh exit
} as const;

export const SPRING = {
    // Reanimated/Animated spring configs
    stiff: {
        stiffness: 300,
        damping: 30,
        mass: 1,
    },
    fluid: {
        stiffness: 100,
        damping: 20,
        mass: 1,
    }
} as const;
