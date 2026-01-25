/**
 * UI TOKENS BARREL FILE
 * Single source of truth for all design tokens
 */

import { COLORS, MATERIAL } from './color.tokens';
import { MOTION } from './motion.tokens';
import { SPACING } from './spacing.tokens';
import * as HAPTICS from './haptics.map';

// INLINED TYPOGRAPHY to prevent any import issues
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
        HEADER: 28, // Added missing key
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

export {
    COLORS,
    MATERIAL,
    MOTION,
    SPACING,
    HAPTICS
};
