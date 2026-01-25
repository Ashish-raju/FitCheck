import { Garment, UserProfile, Color, GarmentType, Pattern, Fit } from '../engine/outfit/models';
import { Piece, PieceID, Category } from '../truth/types';
import { WardrobeService } from './WardrobeService';

/**
 * Repository implementation that bridges the outfit engine with Firebase/app data
 */
export class FirebaseGarmentRepository {
    private wardrobeService: WardrobeService;

    constructor() {
        this.wardrobeService = WardrobeService.getInstance();
    }

    /**
     * Convert app Piece to engine Garment
     */
    private pieceToGarment(piece: Piece): Garment {
        // Map category to garment type
        const typeMap: Record<Category, GarmentType> = {
            'Top': 'top',
            'Bottom': 'bottom',
            'Shoes': 'footwear',
            'Outerwear': 'layer',
            'Accessory': 'accessory'
        };

        // Extract colors from the piece
        const colors: Color[] = this.extractColorsFromPiece(piece);

        // Map season scores
        const seasonScore = {
            summer: piece.season?.includes('summer') ? 1.0 : 0.5,
            monsoon: 0.6, // Default, could be enhanced
            winter: piece.season?.includes('winter') ? 1.0 : 0.3
        };

        return {
            id: piece.id as string,
            type: typeMap[piece.category] || 'top',
            subtype: piece.subcategory || piece.category,
            gender: 'unisex', // Could be enhanced with user profile
            fabric: piece.material || 'cotton',
            pattern: (piece.pattern as Pattern) || 'solid',
            fit: (piece.fit as Fit) || 'regular',
            formality: piece.formality,
            colors,
            seasonScore,
            bodyScore: {}, // Could be enhanced
            styleTags: piece.styleTags || [],
            layerWeight: piece.warmth || 1,
            status: (piece.status as any) || "Clean",
            lastWornAt: piece.lastWorn,
            wornCount: piece.currentUses || 0,
        };
    }

    /**
     * Extract/parse colors from piece
     */
    private extractColorsFromPiece(piece: Piece): Color[] {
        // Simple color extraction - could be enhanced with actual color analysis
        const colorName = piece.color?.toLowerCase() || 'unknown';

        // Map common colors to HSL values
        const colorMap: Record<string, { h: number; s: number; l: number; dictColorId: number }> = {
            'black': { h: 0, s: 0, l: 0, dictColorId: 2 },
            'white': { h: 0, s: 0, l: 100, dictColorId: 1 },
            'red': { h: 0, s: 100, l: 50, dictColorId: 10 },
            'blue': { h: 240, s: 100, l: 50, dictColorId: 20 },
            'green': { h: 120, s: 100, l: 50, dictColorId: 30 },
            'yellow': { h: 60, s: 100, l: 50, dictColorId: 40 },
            'gray': { h: 0, s: 0, l: 50, dictColorId: 3 },
            'brown': { h: 30, s: 60, l: 30, dictColorId: 50 },
            'navy': { h: 240, s: 100, l: 25, dictColorId: 21 },
            'beige': { h: 40, s: 30, l: 70, dictColorId: 51 },
        };

        const colorData = colorMap[colorName] || colorMap['gray'];

        return [{
            hex: piece.color || '#808080',
            h: colorData.h,
            s: colorData.s,
            l: colorData.l,
            lab: [colorData.l, 0, 0], // Simplified LAB
            dictColorId: colorData.dictColorId
        }];
    }

    /**
     * Get all user garments
     */
    async getAllUserGarments(userId: string): Promise<Garment[]> {
        try {
            const pieces = await this.wardrobeService.getAllPieces();
            return pieces.map(piece => this.pieceToGarment(piece));
        } catch (error) {
            console.error('[FirebaseGarmentRepository] Error fetching garments:', error);
            return [];
        }
    }

    /**
     * Get user profile (could be enhanced to fetch from Firebase)
     */
    async getUserProfile(userId: string): Promise<UserProfile> {
        // Default profile - could be enhanced to fetch from user settings
        return {
            skinTone: { undertone: 'warm', depth: 'medium' },
            palette: { best: [1, 2, 10, 20], avoid: [99] },
            bodyType: 'rectangle',
            stylePrefs: ['minimal', 'chic'],
            comfortPrefs: { tight: 0.5, loose: 0.5 },
            weights: {
                wF: 1.0,
                wS: 1.0,
                wB: 1.0,
                wC: 1.0,
                wU: 1.0,
                wR: 0.5,
                wP: 0.5
            }
        };
    }
}
