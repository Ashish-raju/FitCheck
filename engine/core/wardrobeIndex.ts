import type { Piece, PieceID, Category, Inventory } from "../../truth/types";

/**
 * WardrobeIndex - Cached analytics and fast lookups for the wardrobe
 * Computed once and recomputed only when inventory changes
 */
export interface WardrobeIndex {
    itemsById: Record<PieceID, Piece>;
    itemsByCategory: Record<Category, Piece[]>;
    colorsHistogram: Record<string, number>;
    tagsHistogram: Record<string, number>;
    brandsHistogram: Record<string, number>;
    formalityDistribution: number[]; // Count at each formality level 1-5
    missingFieldsSummary: {
        missingName: number;
        missingBrand: number;
        missingMaterial: number;
        missingPattern: number;
        missingFit: number;
        missingSeason: number;
    };
}

export class WardrobeIndexBuilder {
    /**
     * Build a comprehensive index of the wardrobe for fast analytics
     */
    public static build(inventory: Inventory): WardrobeIndex {
        const pieces = Object.values(inventory.pieces);

        const index: WardrobeIndex = {
            itemsById: { ...inventory.pieces },
            itemsByCategory: {
                Top: [],
                Bottom: [],
                Shoes: [],
                Outerwear: [],
                Accessory: []
            },
            colorsHistogram: {},
            tagsHistogram: {},
            brandsHistogram: {},
            formalityDistribution: [0, 0, 0, 0, 0, 0], // Index 0 unused, 1-5 for formality levels
            missingFieldsSummary: {
                missingName: 0,
                missingBrand: 0,
                missingMaterial: 0,
                missingPattern: 0,
                missingFit: 0,
                missingSeason: 0,
            }
        };

        // Build histograms and distributions
        for (const piece of pieces) {
            // Skip ghost items
            if (piece.status === 'Ghost') continue;

            // Category grouping
            index.itemsByCategory[piece.category].push(piece);

            // Color histogram
            const color = piece.color || 'Unknown';
            index.colorsHistogram[color] = (index.colorsHistogram[color] || 0) + 1;

            // Tags histogram
            if (piece.styleTags) {
                for (const tag of piece.styleTags) {
                    index.tagsHistogram[tag] = (index.tagsHistogram[tag] || 0) + 1;
                }
            }

            // Brand histogram
            if (piece.brand) {
                index.brandsHistogram[piece.brand] = (index.brandsHistogram[piece.brand] || 0) + 1;
            }

            // Formality distribution
            const formality = Math.round(piece.formality);
            if (formality >= 1 && formality <= 5) {
                index.formalityDistribution[formality]++;
            }

            // Missing fields tracking
            if (!piece.name) index.missingFieldsSummary.missingName++;
            if (!piece.brand) index.missingFieldsSummary.missingBrand++;
            if (!piece.material) index.missingFieldsSummary.missingMaterial++;
            if (!piece.pattern) index.missingFieldsSummary.missingPattern++;
            if (!piece.fit) index.missingFieldsSummary.missingFit++;
            if (!piece.season || piece.season.length === 0) index.missingFieldsSummary.missingSeason++;
        }

        return index;
    }

    /**
     * Get top N items from a histogram
     */
    public static getTopN<T extends string>(histogram: Record<T, number>, n: number): [T, number][] {
        return Object.entries(histogram)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, n) as [T, number][];
    }
}
