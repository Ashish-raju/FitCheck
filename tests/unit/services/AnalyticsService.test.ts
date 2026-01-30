import { AnalyticsService } from '../../../services/AnalyticsService';
import { Piece, Outfit } from '../../../truth/types';

describe('AnalyticsService', () => {
    const service = AnalyticsService.getInstance();

    const mockWardrobe: Piece[] = [
        { id: '1', category: 'Tops', color: 'Black', stats: { wearCount: 5, lastWorn: null, costPerWear: 0 } } as any,
        { id: '2', category: 'Bottoms', color: 'Blue', stats: { wearCount: 2, lastWorn: null, costPerWear: 0 } } as any,
        { id: '3', category: 'Shoes', color: 'White', stats: { wearCount: 0, lastWorn: null, costPerWear: 0 } } as any,
        { id: '4', category: 'Tops', color: 'Red', stats: { wearCount: 1, lastWorn: null, costPerWear: 0 } } as any,
    ];

    const mockOutfits: Outfit[] = [
        { id: 'o1', items: ['1', '2'], score: 10 } as any, // Outfit 1: Top 1 + Bottom 2
        { id: 'o2', items: ['1', '3'], score: 10 } as any, // Outfit 2: Top 1 + Shoes 3
    ];

    it('should calculate health score correctly', () => {
        const result = service.analyzeWardrobe(mockWardrobe, mockOutfits);

        // Coverage: Tops (30) + Bottoms (30) + Shoes (40) = 100
        // Diversity: 4 colors (Black, Blue, White, Red) * 10 = 40
        // Freshness: 2 outfits / 4 items = 0.5 ratio -> * 50 = 25

        // Total: (100 * 0.4) + (40 * 0.3) + (25 * 0.3) = 40 + 12 + 7.5 = 59.5 -> 60
        expect(result.healthScore).toBeCloseTo(60, 0);
        expect(result.healthBreakdown.coverage).toBe(100);
    });

    it('should identify underused items', () => {
        const result = service.analyzeWardrobe(mockWardrobe, mockOutfits);
        // Items with wearCount <= 1: id '3' (0), id '4' (1)
        expect(result.underusedItems.length).toBe(2);
        expect(result.underusedItems[0].id).toBe('3'); // 0 wears come first
    });

    it('should identify most versatile items', () => {
        const result = service.analyzeWardrobe(mockWardrobe, mockOutfits);
        // Item '1' is in 2 outfits. Item '2' in 1. Item '3' in 1.
        expect(result.mostVersatileItems[0].id).toBe('1');
    });

    it('should handle empty wardrobe', () => {
        const result = service.analyzeWardrobe([], []);
        expect(result.healthScore).toBe(0);
        expect(result.underusedItems).toEqual([]);
    });
});
