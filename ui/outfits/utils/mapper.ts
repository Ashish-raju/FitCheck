import { Piece } from '../../../truth/types';
import { Garment, Color, GarmentType, Gender, Pattern, Fit } from '../../../engine/outfit/models';

export function mapPieceToGarment(piece: Piece): Garment {
    // Helper to safely parse color
    const primaryColor: Color = {
        hex: piece.color || '#000000',
        h: 0, s: 0, l: 0, lab: [0, 0, 0], dictColorId: 0
    };

    // Helper to map category to GarmentType
    let type: GarmentType = 'top';
    const cat = piece.category.toLowerCase();
    if (cat === 'top') type = 'top';
    else if (cat === 'bottom') type = 'bottom';
    else if (cat === 'shoes') type = 'footwear';
    else if (cat === 'outerwear') type = 'layer';
    else if (cat === 'accessory') type = 'accessory';

    return {
        id: piece.id,
        type: type,
        subtype: piece.subcategory || 'unknown',
        gender: 'unisex' as Gender, // Default
        fabric: piece.material || 'cotton',
        pattern: (piece.pattern as Pattern) || 'solid',
        fit: (piece.fit as Fit) || 'regular',
        formality: piece.formality || 1,
        colors: [primaryColor],
        seasonScore: {
            summer: 1,
            monsoon: 1,
            winter: 1
        },
        bodyScore: {},
        styleTags: piece.styleTags || [],
        layerWeight: piece.warmth || 1,
        wornCount: piece.currentUses || 0,
        status: piece.status as any,
        embedding: []
    };
}
