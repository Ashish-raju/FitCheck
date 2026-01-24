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
    imageUri?: string;
    processedImageUri?: string; // Background removed
    status: PieceStatus;
    currentUses: number;
    maxUses?: number; // Override for universal threshold
    lastWorn?: number; // timestamp
    dateAdded?: number; // timestamp
    styleTags?: string[]; // e.g. "Minimalist", "Workwear"
    wearHistory?: number[]; // Array of timestamps worn
    isFavorite?: boolean;
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

export interface Inventory {
    pieces: Record<PieceID, Piece>;
    outfits: Record<OutfitID, Outfit>;
}
