import type { Inventory, PieceID, OutfitID } from "../../truth/types";

export const INITIAL_INVENTORY: Inventory = {
    pieces: {
        ["top_01" as PieceID]: {
            id: "top_01" as PieceID,
            category: "Top",
            warmth: 3,
            formality: 3,
            color: "Obsidian",
            status: "Clean",
            currentUses: 0,
            lastWorn: 1000,
            // Placeholder Image for "Obsidian Shell"
            imageUri: "https://images.unsplash.com/photo-1551232864-3f52236a2629?q=80&w=2070&auto=format&fit=crop"
        },
        ["coat_01" as PieceID]: { // Renamed from top_02 ideally, but keeping ID for stability or changing if safe. Let's change ID to be cleaner.
            id: "coat_01" as PieceID,
            category: "Outerwear",
            warmth: 8,
            formality: 4,
            color: "Vapor Grey",
            status: "Clean",
            currentUses: 0,
            lastWorn: 2000,
            imageUri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop"
        },
        ["btm_01" as PieceID]: {
            id: "btm_01" as PieceID,
            category: "Bottom",
            warmth: 3,
            formality: 3,
            color: "Midnight Denim",
            status: "Clean",
            currentUses: 0,
            lastWorn: 500,
            imageUri: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=2070&auto=format&fit=crop"
        },
        ["btm_02" as PieceID]: {
            id: "btm_02" as PieceID,
            category: "Bottom",
            warmth: 1,
            formality: 1,
            color: "Carbon Cargo",
            status: "Clean",
            currentUses: 0,
            lastWorn: 3000,
            imageUri: "https://images.unsplash.com/photo-1552160753-22d5c662ad7b?q=80&w=1974&auto=format&fit=crop"
        },
        ["shoes_01" as PieceID]: {
            id: "shoes_01" as PieceID,
            category: "Shoes",
            warmth: 2,
            formality: 2,
            color: "Ghost White",
            status: "Clean",
            currentUses: 0,
            lastWorn: 4000,
            imageUri: "https://images.unsplash.com/photo-1600185365926-3a6c3c5418af?q=80&w=2025&auto=format&fit=crop"
        }
    },
    ["outfit_01" as OutfitID]: {
        id: "outfit_01" as OutfitID,
        pieces: [
            {
                id: "top_01" as PieceID,
                category: "Top",
                warmth: 3,
                formality: 3,
                color: "Obsidian",
                status: "Clean",
                currentUses: 0,
                lastWorn: 1000,
                imageUri: "https://images.unsplash.com/photo-1551232864-3f52236a2629?q=80&w=2070&auto=format&fit=crop"
            },
            {
                id: "btm_01" as PieceID,
                category: "Bottom",
                warmth: 3,
                formality: 3,
                color: "Midnight Denim",
                status: "Clean",
                currentUses: 0,
                lastWorn: 500,
                imageUri: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=2070&auto=format&fit=crop"
            },
            {
                id: "shoes_01" as PieceID,
                category: "Shoes",
                warmth: 2,
                formality: 2,
                color: "Ghost White",
                status: "Clean",
                currentUses: 0,
                lastWorn: 4000,
                imageUri: "https://images.unsplash.com/photo-1600185365926-3a6c3c5418af?q=80&w=2025&auto=format&fit=crop"
            }
        ],
        score: 0.98,
        confidence: 0.9,
        items: ["top_01" as PieceID, "btm_01" as PieceID, "shoes_01" as PieceID]
    },
    ["outfit_02" as OutfitID]: {
        id: "outfit_02" as OutfitID,
        pieces: [
            {
                id: "coat_01" as PieceID,
                category: "Outerwear",
                warmth: 8,
                formality: 4,
                color: "Vapor Grey",
                status: "Clean",
                currentUses: 0,
                lastWorn: 2000,
                imageUri: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop"
            },
            {
                id: "btm_02" as PieceID,
                category: "Bottom",
                warmth: 1,
                formality: 1,
                color: "Carbon Cargo",
                status: "Clean",
                currentUses: 0,
                lastWorn: 3000,
                imageUri: "https://images.unsplash.com/photo-1552160753-22d5c662ad7b?q=80&w=1974&auto=format&fit=crop"
            },
            {
                id: "shoes_01" as PieceID, // Reusing shoes
                category: "Shoes",
                warmth: 2,
                formality: 2,
                color: "Ghost White",
                status: "Clean",
                currentUses: 0,
                lastWorn: 4000,
                imageUri: "https://images.unsplash.com/photo-1600185365926-3a6c3c5418af?q=80&w=2025&auto=format&fit=crop"
            }
        ],
        score: 0.95,
        confidence: 0.85,
        items: ["coat_01" as PieceID, "btm_02" as PieceID, "shoes_01" as PieceID]
    }
}
