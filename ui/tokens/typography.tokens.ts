/**
 * FIT CHECK — TYPOGRAPHY TOKENS
 * Editorial Modern Identity
 */

import { Platform } from 'react-native';

console.log("[DEBUG_ANTIGRAVITY] typography.tokens.ts evaluating...");


export const TYPOGRAPHY = {
    STACKS: {
        PRIMARY: 'Inter', // Fallback to System
        DISPLAY: 'Playfair Display', // Serif for prestige headings
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
    },
    WEIGHTS: {
        BLACK: '900',
        BOLD: '700',
        MEDIUM: '500',
        REGULAR: '400',
        LIGHT: '300', // Added for "light body text" requirement
    },
    TRACKING: {
        TIGHT: -0.5,
        NORMAL: 0,
        WIDE: 0.5,
    },
    // System Whisper Specifics (Mapped to Standard)
    COMMAND_FONT: 'Inter',
    AUTHORITY_FONT: 'Playfair Display',
    ID_SIZE: 12,
    ID_WEIGHT: '700', // BOLD
    ID_TRACKING: 0.5,
    WHISPER_SIZE: 12,
    WHISPER_OPACITY: 0.7,
    LOCK_SIZE: 14,
    LOCK_TRACKING: 1.5,
} as const;

export const formatCommand = (text: string) => `// ${text.toUpperCase()}`;
