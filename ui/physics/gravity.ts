import { SPRING } from '../foundation/motion';

/**
 * GRAVITY
 * 
 * Rules for how things enter the stage.
 * Things don't fade in; they fall or slide with weight.
 */

export const ENTER_ANIMATION = {
    fromVoid: {
        opacity: { from: 0, to: 1, duration: 400 },
        scale: { from: 0.9, to: 1, type: 'spring', ...SPRING.stiff },
    },
    nextCandidate: {
        translateX: { from: 300, to: 0, type: 'spring', ...SPRING.fluid },
        opacity: { from: 0, to: 1, duration: 200 },
    }
};
