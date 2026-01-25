import { Season } from './models';

export const RULE_WEIGHTS = {
    // Can be used for default values if not provided in user profile
    DEFAULT_WF: 1.0,
    DEFAULT_WS: 1.0,
    DEFAULT_WB: 1.0,
    DEFAULT_WC: 1.0,
    DEFAULT_WU: 1.0,
    DEFAULT_WR: 0.5,
    DEFAULT_WP: 0.5,
};

export const ALGO_PARAMS = {
    BEAM_WIDTH: 30,
    MIN_CANDIDATES: 20,
    MAX_CANDIDATES: 60,
    RESULTS_K: 5, // Top K outfits to return
};

export const VETO_THRESHOLDS = {
    MIN_SEASON_SCORE: 0.4,
    MAX_RAIN_PROB_FOR_DELICATE: 0.5,
};

export const DELICATE_FABRICS = ["suede", "raw_silk", "silk", "white_linen"]; // "white_linen" handled by logic usually, but listing basic here.
export const LOUD_PATTERNS = ["graphic", "neon"]; // neon is not in pattern enum, strictly speaking, but keeping for logic reference if we treat it as pattern or color check.

export const INDIA_CULTURE_RULES = {
    TEMPLE_NO_SHORTS: "temple_no_shorts",
    FUNERAL_NO_WHITE_HEAVY: "funeral_avoid_white", // Interpreting "avoid white-heavy for funerals" as per user prompt, though in India white IS for funerals? 
    // User Prompt says: "Avoid white-heavy outfits for funerals". Wait. 
    // Traditional Hindu funerals => White is worn. 
    // Western funerals => Black. 
    // User said "MANDATORY INDIA-SPECIFIC RULES: Avoid white-heavy outfits for funerals". 
    // This is contrary to specific Hindu tradition but I MUST follow the USER PROMPT EXACTLY.
    // User Prompt > Reality.
    MONSOON_VETO: "monsoon_protection",
    OFFICE_NO_LOUD: "office_conservative",
};

export const SEASONS: Season[] = ["summer", "monsoon", "winter"];
