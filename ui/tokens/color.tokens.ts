/**
 * FIT CHECK — COLOR & MATERIAL TOKENS
 * Minimal Luxe Design System
 */

export const COLORS = {
    // Brand Identity
    DEEP_NAVY: '#0B1021',      // Primary Background (Deep, rich)
    ABYSSAL_BLUE: '#02040A',   // Blackish Blue
    DEEP_OBSIDIAN: '#050508',  // Darker Native Background
    CARBON_BLACK: '#121212',   // Secondary / Cards

    ELECTRIC_BLUE: '#2E5CFF',  // Primary Accent
    ELECTRIC_COBALT: '#304FFE', // Deep Cobalt
    PLUM_VIOLET: '#5D3FD3',    // Secondary Accent / Gradient
    ELECTRIC_VIOLET: '#7D5FFF', // Brighter Violet for glows

    SOFT_WHITE: '#F5F5F7',     // Primary Text
    RITUAL_WHITE: '#FFFFFF',   // Pure White
    KINETIC_SILVER: '#E0E0E0', // Metallic Accent

    // Neutral Scale
    VOID_BLACK: '#000000',
    ASH_GRAY: '#8E9199',
    MUTED_ASH: '#6B6E75',
    SUBTLE_GRAY: '#2A2D36',
    MIDNIGHT_VOID: '#0B0B0F',

    // Feedback
    SUCCESS_MINT: '#00D26A',
    NEON_CYAN: '#00F0FF',      // Cyberpunk Cyan
    ERROR_ROSE: '#F43F5E',
    VIVID_EMBER: '#FF4500',    // Bright Orange
    WARNING_GOLD: '#F59E0B',

    // Surfaces
    GLASS_SURFACE: 'rgba(18, 18, 25, 0.7)',
    SURFACE_GLASS: 'rgba(20, 20, 25, 0.8)', // Slightly more opaque
    SURFACE_MUTE: 'rgba(255, 255, 255, 0.05)',

    GLASS_BORDER: 'rgba(255, 255, 255, 0.08)',
    SURFACE_BORDER: 'rgba(255, 255, 255, 0.12)',

    // System
    SEAM_DARK: '#1A1A1A',
    AUTHORITY_WHITE: '#E5E7EB',
    MATTER_WHITE: '#F5F5F7',   // Alias for SOFT_WHITE
    FAILURE_ONLY: '#EF4444',
} as const;

export const MATERIAL = {
    BACKGROUND: COLORS.DEEP_NAVY,
    CARD: COLORS.CARBON_BLACK,
    PRIMARY: COLORS.ELECTRIC_BLUE,
    SECONDARY: COLORS.PLUM_VIOLET,
    TEXT_MAIN: COLORS.SOFT_WHITE,
    TEXT_MUTED: COLORS.ASH_GRAY,
    BORDER: COLORS.GLASS_BORDER,
} as const;
