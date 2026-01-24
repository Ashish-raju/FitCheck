/**
 * FIREWALL — SPACING & VOID SYSTEM
 * Authority: Principal Design Engineer
 */

export const SPACING = {
    GUTTER: 24,
    RADIUS: {
        SMALL: 8,
        MEDIUM: 16,
        LARGE: 24,
        PILL: 999,
        CIRCLE: 9999,
    },
    STACK: {
        TIGHT: 8,
        NORMAL: 16,
        LARGE: 32,
        X_LARGE: 64, // More breathing room
        HUGE: 96,
    },
    CARD: {
        ASPECT_RATIO: 3 / 4,
        HORIZONTAL_PADDING: 20,
        VERTICAL_GAP: 24,
    },
    LAYOUT: {
        MAX_CONTENT_WIDTH: 600,
    },
} as const;

export type SpacingToken = keyof typeof SPACING;
