import { EASING } from '../foundation/motion';

/**
 * DISCARD
 * 
 * How things leave existence.
 * Rejections are not polite. They are discarded.
 */

export const REJECT_ANIMATION = {
    exitLeft: {
        translateX: -400,
        opacity: 0,
        easing: EASING.reject,
        duration: 300,
    }
};
