/**
 * FIREWALL — MOTION & PHYSICS TOKENS
 * Authority: Principal Design Engineer
 */

import { Easing } from 'react-native-reanimated';

export const MOTION = {
    DURATIONS: {
        INSTANT: 0,
        QUICK: 150,
        SNAPPY: 300,
        MEDIUM: 500,
        LONG: 800,
        CINEMATIC: 1200,
        AMBIENT_BREATHE: 3000,
        RITUAL_TRANSITION: 800,
    },
    CURVES: {
        // CRED-like easing: Slow in, very fast out, or slight bounce
        EASE_OUT_EXPO: Easing.bezier(0.16, 1, 0.3, 1),
        ELASTIC_GENTLE: Easing.elastic(0.8),
        SMOOTH_FLOW: Easing.bezier(0.4, 0.0, 0.2, 1),
    },
    PHYSICS: {
        SPRING_SNAPPY: {
            damping: 15,
            stiffness: 200, // Stiffer
            mass: 0.8,
        },
        SPRING_BOUNCY: {
            damping: 12,
            stiffness: 150,
            mass: 1,
        },
        SPRING_HEAVY_DROP: {
            damping: 40,
            stiffness: 250,
            mass: 2, // Heavy feel
        },
    }
} as const;
