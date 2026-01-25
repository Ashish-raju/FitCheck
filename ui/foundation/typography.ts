/**
 * THE VOICE OF THE ENGINE
 * 
 * Cinematic, Editorial, Authority.
 */

export const FONTS = {
    system: 'System',
    mono: 'Monospace',
} as const;

export const WEIGHTS = {
    thin: '200',
    ghost: '300',
    body: '400',
    medium: '500',
    authority: '700',
} as const;

export const SIZES = {
    micro: 10,
    caption: 12,
    body: 16,
    heading: 24,
    title: 32,
    hero: 48,    // Large editorial headers
    display: 64, // Massive numbers/stats
} as const;

export const TEXT = {
    // Semantic presets
    display: {
        fontSize: SIZES.display,
        fontWeight: WEIGHTS.thin,
        letterSpacing: -2,
    },
    hero: {
        fontSize: SIZES.hero,
        fontWeight: WEIGHTS.ghost,
        letterSpacing: -1.5,
        lineHeight: 56,
    },
    title: {
        fontSize: SIZES.title,
        fontWeight: WEIGHTS.body, // Slightly bolder but still refined
        letterSpacing: -1,
    },
    heading: {
        fontSize: SIZES.heading,
        fontWeight: WEIGHTS.medium,
        letterSpacing: -0.5,
    },
    body: {
        fontSize: SIZES.body,
        fontWeight: WEIGHTS.body,
        letterSpacing: 0,
        lineHeight: 24,
    },
    label: {
        fontSize: SIZES.caption,
        fontWeight: WEIGHTS.authority,
        letterSpacing: 1.5, // Premium tracked caps
        textTransform: 'uppercase' as 'uppercase',
    },
    value: {
        fontFamily: FONTS.mono,
        fontSize: SIZES.body,
        fontWeight: WEIGHTS.medium,
    },
    micro: {
        fontSize: SIZES.micro,
        fontWeight: WEIGHTS.ghost,
        letterSpacing: 0.5,
    }
} as const;

// FALLBACK: Export TYPOGRAPHY to prevent any ReferenceError
export const TYPOGRAPHY = {
    STACKS: {
        PRIMARY: 'Inter',
        DISPLAY: 'Playfair Display',
    },
    SCALE: {
        HERO: 48,
        H1: 32,
        H2: 24,
        H3: 20,
        BODY_LG: 18,
        BODY: 16,
        CAPTION: 14,
        SMALL: 12,
        LABEL: 10,
        HEADER: 28,
    },
    WEIGHTS: {
        BLACK: '900',
        BOLD: '700',
        MEDIUM: '500',
        REGULAR: '400',
        LIGHT: '300',
    },
    TRACKING: {
        TIGHT: -0.5,
        NORMAL: 0,
        WIDE: 0.5,
    },
    COMMAND_FONT: 'Inter',
    AUTHORITY_FONT: 'Playfair Display',
    ID_SIZE: 12,
    ID_WEIGHT: '700',
    ID_TRACKING: 0.5,
    WHISPER_SIZE: 12,
    WHISPER_OPACITY: 0.7,
    LOCK_SIZE: 14,
    LOCK_TRACKING: 1.5,
} as const;

export const typography = TYPOGRAPHY;
export const formatCommand = (text: string) => `// ${text.toUpperCase()}`;
