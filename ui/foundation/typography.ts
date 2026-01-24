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
