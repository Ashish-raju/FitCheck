/**
 * ENGINE CONFIGURATION CONSTANTS
 * 
 * Centralized configuration for all magic numbers and thresholds.
 * Each constant is documented with its purpose and rationale.
 */

export const ENGINE_CONFIG = {
    // === RETRIEVAL SETTINGS ===

    /**
     * Maximum items per category to consider during outfit generation.
     * Rationale: 60 items = ~216k combinations (60×60×60), manageable for scoring
     * while still providing good variety. Higher = slower but more options.
     */
    RETRIEVAL_LIMIT_PER_CATEGORY: 60,

    /**
     * Number of shoe options to try per top+bottom combination.
     * Rationale: 3 balances variety with performance. With 60 tops × 60 bottoms × 3 shoes
     * = 10,800 combinations which can be scored in ~500ms.
     */
    SHOES_PER_COMBO: 3,

    /**
     * Number of layer options (jackets, blazers) to try when layering is needed.
     * Rationale: Layering is contextual (cold weather, formal events), so we're selective.
     */
    LAYERS_PER_COMBO: 3,

    // === ASSEMBLY SETTINGS ===

    /**
     * Threshold for using full generation vs sampling.
     * Rationale: 50k combinations can be generated in ~100ms using Fisher-Yates shuffle.
     * Above this, we use random sampling to prevent memory issues.
     */
    GENERATION_THRESHOLD: 50000,

    /**
     * Maximum outfits to show user in final results.
     * Rationale: 10 provides good variety without overwhelming. Users rarely scroll beyond this.
     */
    MAX_OUTFITS_TO_USER: 10,

    /**
     * Maximum times same item can appear in different outfit suggestions.
     * Rationale: 2 allows showing versatility (e.g., black jeans in casual and dressy looks)
     * without being repetitive.
     */
    MAX_REUSE_PER_ITEM: 2,

    // === SCORING WEIGHTS ===

    /**
     * Scoring component weights (must sum to ~1.0)
     * These determine relative importance of different factors.
     */
    WEIGHTS: {
        COLOR_HARMONY: 0.30,      // Most visible aspect
        FORMALITY: 0.25,          // Context-critical
        SEASON: 0.20,             // Comfort and appropriateness
        STYLE_COHERENCE: 0.15,    // Aesthetic consistency
        BODY_FLATTERY: 0.10       // Personalization
    },

    // === CONFIDENCE THRESHOLDS ===

    /**
     * Minimum scores for outfit quality tiers.
     * High tier (0.65+): "Use this immediately" ⭐
     * Mid tier (0.50+): "Very cute combo" 👍
     * Low tier (0.30+): "Solid potential" ✓
     * Below 0.30: Rejected
     */
    CONFIDENCE_TIERS: {
        HIGH: 0.65,
        MID: 0.50,
        LOW: 0.30
    },

    // === COLOR HARMONY POINTS ===

    /**
     * Point allocation for different color relationships.
     * Based on color wheel theory and professional styling principles.
     */
    COLOR_SCORES: {
        MONOCHROMATIC: 30,        // Same hue, safest choice
        ANALOGOUS: 25,            // Adjacent hues (±30°), harmonious
        COMPLEMENTARY: 22,        // Opposite hues (180°), bold but balanced
        TRIADIC: 20,              // 120° apart, vibrant
        SPLIT_COMPLEMENTARY: 18,  // Base + two adjacent to complement
        TETRADIC: 15,             // Double complementary, complex
        CHAOTIC: 5                // 4+ unrelated hues, avoid
    },

    // === FORMALITY SCALING ===

    /**
     * Formality matching curve steepness.
     * distance 0 → score 1.0
     * distance 2 → score 0.75
     * distance 4 → score 0.5
     * distance 8 → score 0.0
     */
    FORMALITY_DISTANCE_DIVISOR: 8.0,

    // === SEASON THRESHOLDS ===

    /**
     * Temperature breakpoints for season detection.
     */
    SEASON: {
        SUMMER_TEMP: 30,      // Above 30°C = summer
        WINTER_TEMP: 15,      // Below 15°C = winter
        MONSOON_RAIN_PROB: 0.5 // Above 50% rain = monsoon
    },

    // === LEARNING SETTINGS ===

    /**
     * Learning rate for preference updates.
     * Rationale: 0.3 means new feedback has 30% weight, old preference has 70%.
     * This prevents single actions from drastically changing learned preferences.
     */
    LEARNING_RATE: 0.3,

    /**
     * Feedback action weights (how much they influence learning).
     */
    FEEDBACK_WEIGHTS: {
        WORN: 1.0,        // Strongest signal: they actually wore it!
        LIKED: 0.7,       // Positive signal
        SKIPPED: -0.2,    // Mild negative
        DISLIKED: -0.5    // Strong negative
    },

    // === PERFORMANCE TARGETS ===

    /**
     * Maximum acceptable time (ms) for each operation.
     * Used for performance monitoring and optimization triggers.
     */
    PERFORMANCE_TARGETS: {
        SMALL_WARDROBE: 100,   // 30 items
        MEDIUM_WARDROBE: 500,  // 100 items
        LARGE_WARDROBE: 2000,  // 300 items
        HUGE_WARDROBE: 5000    // 500+ items
    }
} as const;

/**
 * Color wheel constants for harmony calculations
 */
export const COLOR_WHEEL = {
    /**
     * Tolerance (in degrees) for considering colors as "similar"
     * within each harmony category.
     */
    TOLERANCE: {
        MONOCHROMATIC: 15,     // ±15° = same hue family
        ANALOGOUS: 30,          // ±30° = adjacent on wheel
        COMPLEMENTARY: 20       // ±20° from exact opposite
    }
} as const;

/**
 * India Pack cultural constants
 */
export const INDIA_PACK = {
    /**
     * Modesty level thresholds (1-10 scale)
     */
    MODESTY: {
        LOW: 3,
        MODERATE: 5,
        HIGH: 7,
        VERY_HIGH: 9
    },

    /**
     * Festival-specific rules
     */
    FESTIVALS: {
        DIWALI: {
            PREFER_COLORS: ['gold', 'red', 'bright'],
            FORMALITY_MIN: 6
        },
        HOLI: {
            VETO_COLORS: ['white'],
            PREFER_OLD_CLOTHES: true
        },
        EID: {
            FORMALITY_MIN: 7,
            MODESTY_MIN: 7
        }
    }
} as const;
