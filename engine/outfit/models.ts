export type GarmentType = "top" | "bottom" | "layer" | "footwear" | "accessory" | "one_piece" | "bag";
export type Gender = "men" | "women" | "unisex";
export type Pattern = "solid" | "stripe" | "checks" | "graphic" | "floral" | "other";
export type Fit = "slim" | "regular" | "oversized" | "relaxed";
export type Season = "summer" | "monsoon" | "winter";
export type BodyType = string; // e.g. "triangle", "rectangle", etc.

export interface Color {
    hex: string;
    h: number;
    s: number;
    l: number;
    lab: number[];
    dictColorId: number;
}

export interface Garment {
    id: string;
    type: GarmentType;
    subtype: string;
    gender: Gender;
    fabric: string;
    pattern: Pattern;
    fit: Fit;
    formality: number; // 0 (lounge) -> 4 (black tie)
    colors: Color[];
    seasonScore: {
        summer: number;
        monsoon: number;
        winter: number;
    };
    bodyScore: Record<BodyType, number>;
    styleTags: string[];
    layerWeight: number; // thickness / warmth
    lastWornAt?: number; // timestamp
    wornCount: number;
    status: "Clean" | "Dirty" | "Laundry" | "Ghost" | "Donate";
    embedding?: number[];
}

export interface UserProfile {
    skinTone: {
        undertone: string;
        depth: string;
    };
    palette: {
        best: number[]; // dictColorIds
        avoid: number[]; // dictColorIds
    };
    bodyType: BodyType;
    stylePrefs: string[];
    comfortPrefs: {
        tight: number;
        loose: number;
    };
    weights: {
        wF: number; // formality
        wS: number;
        wB: number; // body
        wC: number; // color/palette
        wU: number; // user style
        wR: number; // recency
        wP: number; // repetition penalty
    };
}

export interface Context {
    event: string;
    formalityMin: number;
    season: Season;
    rainProb: number;
    temp: number;
    timeBucket: string;
    cultureRules: string[];
    desiredStyle: string[];
    paletteTarget: number[]; // dictColorIds
}

export interface Outfit {
    outfitId: string;
    items: string[]; // garmentIds
    score: number;
    badges: string[];
    rationale: string;
}

export interface EngineResult {
    context: Context;
    outfits: Outfit[];
}
