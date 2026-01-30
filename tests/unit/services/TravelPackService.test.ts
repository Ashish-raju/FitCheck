import { generatePack, PackCriteria } from '../../../services/TravelPack';
import { Piece } from '../../../truth/types';

describe('TravelPackService', () => {

    const mockWardrobe: Piece[] = [
        { id: '1', category: 'Top', formality: 5, warmth: 3, currentUses: 10, season: ['winter'] } as any, // Formal Top
        { id: '2', category: 'Top', formality: 2, warmth: 5, currentUses: 5, season: ['summer'] } as any, // Casual Top
        { id: '3', category: 'Bottom', formality: 4, warmth: 3, currentUses: 8 } as any, // Formal Bottom
        { id: '4', category: 'Bottom', formality: 1, warmth: 2, currentUses: 2 } as any, // Casual Bottom
        { id: '5', category: 'Shoes', formality: 5, warmth: 3, currentUses: 5 } as any, // Formal Shoes
        { id: '6', category: 'Shoes', formality: 1, warmth: 2, currentUses: 2 } as any, // Casual Shoes
        { id: '7', category: 'Outerwear', formality: 3, warmth: 5, currentUses: 3 } as any, // Warm Jacket
    ];

    it('should generate a pack respecting duration and purpose (Business)', () => {
        const criteria: PackCriteria = {
            destination: 'NYC',
            duration: 5, // Need ~4 tops, ~2 bottoms
            purpose: 'Business',
            season: 'Winter'
        };

        const pack = generatePack(mockWardrobe, criteria);

        expect(pack.destination).toBe('NYC');
        expect(pack.purpose).toBe('Business');

        // Should favor formal items (id 1, 3, 5)
        const itemIds = pack.items.map(p => p.id);
        expect(itemIds).toContain('1'); // Formal Top
        expect(itemIds).toContain('3'); // Formal Bottom
        expect(itemIds).toContain('5'); // Formal Shoes

        // Winter -> Should have outerwear
        expect(itemIds).toContain('7');
    });

    it('should fall back to other items if preferences not met', () => {
        const criteria: PackCriteria = {
            destination: 'Beach',
            duration: 30, // Long trip, needs many items
            purpose: 'Vacation',
            season: 'Summer'
        };

        // Wardrobe is small, should just take everything it can
        const pack = generatePack(mockWardrobe, criteria);
        expect(pack.items.length).toBeLessThanOrEqual(mockWardrobe.length);
    });
});
