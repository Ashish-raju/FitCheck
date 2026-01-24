/**
 * THE RHYTHM OF AUTHORITY
 * 
 * Cinematic spacing. Breathing room.
 */

export const SPACE = {
    xxs: 4,
    xs: 8,
    sm: 16,     // Increased base unit
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
    void: 96,   // Significant pause
    cosmos: 180, // Massive vertical spacing
} as const;

export const LAYOUT = {
    margin: 24,
    gutter: 16,
    cardWidth: 340,
    navHeight: 60,
    safeAreaTop: 60,
} as const;
