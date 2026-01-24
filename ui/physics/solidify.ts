import { SPRING } from '../foundation/motion';

/**
 * SOLIDIFY
 * 
 * The visual physics of decision.
 * When a choice is made, it becomes heavy/solid.
 */

export const LOCK_ANIMATION = {
    sequence: [
        // 1. Brief expansion (taking a breath)
        { scale: 1.05, duration: 100 },
        // 2. Hard clamp down (solidifying)
        { scale: 1.0, type: 'spring', ...SPRING.stiff },
    ],
    colorShift: {
        duration: 300,
        target: '#FFFFFF', // Authority White
    }
};
