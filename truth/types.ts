import { GarmentMeta } from '../engine/types';

export type BrandString<K, T> = K & { __brand: T };

export type OutfitID = BrandString<string, "OutfitID">;
export type PieceID = BrandString<string, "PieceID">;
export type ContextID = BrandString<string, "ContextID">;

export type Category = "Top" | "Bottom" | "Shoes" | "Outerwear" | "Accessory";
export type PieceStatus = "Clean" | "Dirty" | "Laundry" | "Ghost";

export interface Piece {
    id: PieceID;
    category: Category;
    warmth: number; // 1-5
    formality: number; // 1-5
    color: string;
    imageUri?: string | number; // string for URI, number for require()
    processedImageUri?: string; // Background removed + white background
    thumbnailUri?: string; // Small thumbnail for lists/previews
    transparentUri?: string; // Raw transparent PNG from remove.bg
    status: PieceStatus;
    currentUses: number;
    maxUses?: number; // Override for universal threshold
    lastWorn?: number; // timestamp
    dateAdded?: number; // timestamp
    styleTags?: string[]; // e.g. "Minimalist", "Workwear"
    wearHistory?: number[]; // Array of timestamps worn
    isFavorite?: boolean;

    // Extended properties for explainable recommendations
    // Extended properties for explainable recommendations
    name?: string;
    brand?: string;
    subcategory?: string;
    material?: string;
    pattern?: "solid" | "striped" | "check" | "graphic" | "print" | "other";
    fit?: "slim" | "regular" | "oversized" | "relaxed";
    season?: ("spring" | "summer" | "fall" | "winter")[];
    price?: number;
    notes?: string;

    // Advanced Fit Meta (High Features)
    necklineType?: string; // e.g., 'Crew', 'V-Neck', 'Collared', 'Boat'
    sleeveType?: string;   // e.g., 'Short', 'Long', '3/4', 'Sleeveless'
    lengthCategory?: string; // e.g., 'Crop', 'Waist', 'Hip', 'Thigh'
    riseType?: string; // e.g., 'Low', 'Mid', 'High'
    silhouetteType?: string; // e.g., 'Fitted', 'Boxy', 'A-Line'

    // Image processing metadata
    processingMetadata?: {
        processingTimeMs: number;
        width: number;
        height: number;
        fileSize: number;
    };

    /**
     * STYLIST ENGINE METADATA (New Engine)
     * Persisted analysis from the Phase 2+ engine.
     */
    stylistMeta?: GarmentMeta;
}

export interface TravelPack {
    id: string;
    destination: string;
    durationDays: number;
    purpose: string;
    items: Piece[];
    outfits?: Outfit[];
    createdAt: number;
    weatherForecast?: string;
}

export interface Outfit {
    id: OutfitID;
    items: PieceID[];
    pieces: Piece[]; // For UI rendering
    score: number;
    confidence?: number; // 0.0 - 1.0
}

export type CalibrationStage = "CONSERVATIVE" | "REFINEMENT" | "SIMPLIFICATION" | "SAFETY";

export interface Context {
    temperature: number; // Celsius
    condition: "Clear" | "Rain" | "Snow" | "Cloudy";
    occasion: string;
}

export type Inventory = {
    pieces: Record<PieceID, Piece>;
    outfits?: Record<OutfitID, Outfit>; // Optional - allows empty initial state
};
