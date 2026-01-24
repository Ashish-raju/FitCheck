/**
 * FIREWALL — HAPTIC & SOUND MAP
 * Authority: Principal Design Engineer
 */

export const HAPTICS = {
    RATIFY: {
        type: 'heavy',
        sequence: [0, 50, 20, 100], // Low rumble building to THOCK
        perception: 'Vault Door Locking',
    },
    VETO: {
        type: 'medium',
        intensity: 1.0,
        perception: 'Paper Tearing / Stone Scraping',
    },
    FAILURE: {
        type: 'error',
        perception: 'Static / System Breach',
    },
    SILENCE: {
        type: 'none',
    }
} as const;

export const SOUND_SPECK = {
    CUT: 'instant_null',
    ALARM: 'low_freq_static',
} as const;
