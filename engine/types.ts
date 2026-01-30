/**
 * STRICT TYPE DEFINITIONS FOR STYLIST ENGINE
 * 
 * These interfaces enforce the "Stylist Grade" data requirements.
 * No data should enter the new engine without conforming to these types.
 */

export type Gender = 'men' | 'women' | 'unisex';
export type Season = 'summer' | 'monsoon' | 'winter' | 'transitional';
export type Formality = 'lounge' | 'casual' | 'smart_casual' | 'business_casual' | 'business_formal' | 'cocktail' | 'black_tie' | 'cultural_festive';
export type BodyType = 'triangle' | 'inverted_triangle' | 'rectangle' | 'hourglass' | 'round' | 'diamond' | 'athletic';

// --- ENUMERATED CONSTANTS ---
// (Will replace string literals in logic)
export enum OutfitSlot {
    Top = 'top',
    Bottom = 'bottom',
    Layer = 'layer',
    Shoes = 'shoes',
    Accessory = 'accessory',
    OnePiece = 'one_piece'
}

export interface ColorMeta {
    hex: string;
    dictColorId?: number; // Maps to our color theory dictionary
    hue: number;
    saturation: number;
    value: number;
    undetone: 'warm' | 'cool' | 'neutral';
}

export interface GarmentMeta {
    id: string;
    type: OutfitSlot;
    subtype: string; // e.g. 'polo', 'chinos', 'saree'

    // Core Attributes
    gender: Gender;
    colors: ColorMeta[];
    primaryColorHex: string;

    // Physical Attributes
    fabric: string; // e.g. 'cotton', 'silk'
    weight: 'light' | 'medium' | 'heavy';
    pattern: 'solid' | 'stripe' | 'check' | 'graphic' | 'floral' | 'ethnic_print' | 'other';

    // Stylist Metadata
    formalityRange: [number, number]; // 1-10 scale
    seasonScores: Record<Season, number>; // 0.0 - 1.0
    versatility: number; // 0.0 - 1.0 (how mixable it is)

    // Fit & Body
    fitType: 'slim' | 'regular' | 'oversized' | 'tailored';
    bestForBodyTypes: BodyType[];

    // Constraints
    cantBeLayeredUnder: boolean;
    requiresLayering: boolean; // e.g. sheer tops

    // State
    lastWornTimestamp?: number;
    status: 'active' | 'laundry' | 'archived';
}

export interface UserProfileMeta {
    id: string;

    // Physical
    bodyType: BodyType;
    heightCm?: number;
    skinTone: {
        hex: string;
        undertone: 'warm' | 'cool' | 'neutral';
        contrastLevel: 'low' | 'medium' | 'high';
    };

    // Preferences
    fitPreference: 'slim' | 'regular' | 'relaxed';
    modestyLevel: number; // 1-10 (1=revealing, 10=fully covered - important for India pack)

    // Color Theory
    palette: {
        bestColors: number[]; // dictColorIds
        avoidColors: number[]; // dictColorIds
    };

    // Weights for scoring (Personalization)
    weights: {
        comfort: number;
        style: number;
        colorHarmony: number;
        novelty: number;
    };
}

export interface ContextSpec {
    // Event
    eventType: string; // e.g. 'wedding', 'office', 'date'
    formalityTarget: number; // 1-10

    // Environment
    weather: {
        tempC: number;
        rainProb: number;
        isIndoor: boolean;
    };
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

    // Rules
    hardVetoes: string[]; // e.g. ['no_white_for_guest']
    requiredPieces?: string[]; // e.g. 'saree' required

    // Stylist Direction
    mood: string;
}

export interface OutfitCandidate {
    id: string;
    items: GarmentMeta[];

    // Scores
    totalScore: number;
    subscores: {
        colorHarmony: number;
        contextMatch: number;
        bodyFlattery: number;
        seasonality: number;
        stylistPick: number;
    };

    // Metadata
    isComplete: boolean;
    missingSlots: OutfitSlot[];
    warnings: string[];
}

export interface OutfitResult {
    context: ContextSpec;
    candidates: OutfitCandidate[];
    debugLog?: string[];
}
