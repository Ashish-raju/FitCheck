import { Piece, Outfit } from '../truth/types';

export interface WardrobeAnalytics {
    healthScore: number;
    healthBreakdown: {
        coverage: number;
        diversity: number;
        freshness: number;
    };
    underusedItems: Piece[];
    mostVersatileItems: Piece[];
    topColors: { color: string; count: number }[];
}

export class AnalyticsService {
    private static instance: AnalyticsService;

    private constructor() { }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    /**
     * Compute full analytics for a user
     */
    public analyzeWardrobe(wardrobe: Piece[], outfits: Outfit[]): WardrobeAnalytics {
        const healthScore = this.calculateHealthScore(wardrobe, outfits);
        const underusedItems = this.findUnderusedItems(wardrobe);
        const mostVersatileItems = this.findMostVersatileItems(outfits, wardrobe);
        const topColors = this.getTopColors(wardrobe);

        return {
            healthScore: healthScore.total,
            healthBreakdown: healthScore.breakdown,
            underusedItems,
            mostVersatileItems,
            topColors
        };
    }

    /**
     * Calculate Wardrobe Health Score (0-100)
     */
    private calculateHealthScore(wardrobe: Piece[], outfits: Outfit[]): { total: number; breakdown: any } {
        if (wardrobe.length === 0) return { total: 0, breakdown: { coverage: 0, diversity: 0, freshness: 0 } };

        // 1. Coverage Score (Do we have basics?)
        const categories = new Set(wardrobe.map(p => p.category));
        const hasTops = categories.has('Top');
        const hasBottoms = categories.has('Bottom');
        const hasShoes = categories.has('Shoes');

        let coverageScore = 0;
        if (hasTops) coverageScore += 30;
        if (hasBottoms) coverageScore += 30;
        if (hasShoes) coverageScore += 40;

        // 2. Diversity Score (Color variety)
        const uniqueColors = new Set(wardrobe.map(p => p.color).filter(Boolean));
        const diversityScore = Math.min(uniqueColors.size * 10, 100); // 10 colors = 100%

        // 3. Freshness / Activity (Outfits created relative to wardrobe size)
        const outfitRatio = outfits.length / Math.max(wardrobe.length, 1);
        const freshnessScore = Math.min(outfitRatio * 50, 100); // 2 outfits per item = 100%

        // Weighted Total
        // Coverage (40%), Diversity (30%), Freshness (30%)
        const total = Math.round(
            (coverageScore * 0.4) +
            (diversityScore * 0.3) +
            (freshnessScore * 0.3)
        );

        return {
            total,
            breakdown: {
                coverage: coverageScore,
                diversity: diversityScore,
                freshness: Math.round(freshnessScore)
            }
        };
    }

    /**
     * Find items with low wear count (e.g. <= 1)
     */
    private findUnderusedItems(wardrobe: Piece[]): Piece[] {
        return wardrobe
            .filter(p => (p.currentUses || 0) <= 1)
            .sort((a, b) => (a.currentUses || 0) - (b.currentUses || 0))
            .slice(0, 10);
    }

    /**
     * Find items that appear in the most outfits
     */
    private findMostVersatileItems(outfits: Outfit[], wardrobe: Piece[]): Piece[] {
        const usageMap = new Map<string, number>();

        outfits.forEach(outfit => {
            outfit.items.forEach(itemId => {
                usageMap.set(itemId, (usageMap.get(itemId) || 0) + 1);
            });
        });

        return wardrobe
            .map(piece => ({
                ...piece,
                image: (piece.imageUri || piece.processedImageUri) as string, // Normalizing for UI
                _tempUsage: usageMap.get(piece.id) || 0
            }))
            .sort((a, b) => b._tempUsage - a._tempUsage)
            .slice(0, 5); // Top 5
    }

    private getTopColors(wardrobe: Piece[]): { color: string; count: number }[] {
        const colorMap = new Map<string, number>();
        wardrobe.forEach(p => {
            if (p.color) {
                colorMap.set(p.color, (colorMap.get(p.color) || 0) + 1);
            }
        });

        return Array.from(colorMap.entries())
            .map(([color, count]) => ({ color, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Get color density map for Color Wheel v2
     * Returns: Map of Hue (0-360 mapped to buckets) -> density count
     */
    public getColorDensity(wardrobe: Piece[]): { hue: number; items: Piece[] }[] {
        // Simple bucketing into 12 segments
        const buckets: { hue: number; items: Piece[] }[] = Array.from({ length: 12 }, (_, i) => ({
            hue: i * 30, // 0, 30, 60...
            items: []
        }));

        wardrobe.forEach(piece => {
            // Mock hue extraction from color string
            let hue = 0;
            const c = (piece.color || '').toLowerCase();
            if (c.includes('red')) hue = 0;
            else if (c.includes('orange')) hue = 30;
            else if (c.includes('yellow')) hue = 60;
            else if (c.includes('green')) hue = 120;
            else if (c.includes('blue')) hue = 240;
            else if (c.includes('purple') || c.includes('violet')) hue = 270;
            else if (c.includes('pink')) hue = 300;

            // Find bucket
            const bucketIndex = Math.floor(hue / 30) % 12;
            buckets[bucketIndex].items.push(piece);
        });

        return buckets;
    }
}
