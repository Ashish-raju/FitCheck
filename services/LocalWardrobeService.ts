import AsyncStorage from '@react-native-async-storage/async-storage';
import { Piece, PieceID } from '../truth/types';

const STORAGE_KEY_PREFIX = '@demo_wardrobe_';

export class LocalWardrobeService {
    private static instance: LocalWardrobeService;

    private constructor() { }

    static getInstance(): LocalWardrobeService {
        if (!LocalWardrobeService.instance) {
            LocalWardrobeService.instance = new LocalWardrobeService();
        }
        return LocalWardrobeService.instance;
    }

    private getStorageKey(userId: string): string {
        return `${STORAGE_KEY_PREFIX}${userId}`;
    }

    private async getAllPieces(userId: string): Promise<Piece[]> {
        try {
            const json = await AsyncStorage.getItem(this.getStorageKey(userId));
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error('[LocalWardrobe] Failed to load pieces', e);
            return [];
        }
    }

    private async saveAllPieces(userId: string, pieces: Piece[]): Promise<void> {
        try {
            await AsyncStorage.setItem(this.getStorageKey(userId), JSON.stringify(pieces));
        } catch (e) {
            console.error('[LocalWardrobe] Failed to save pieces', e);
        }
    }

    // --- SERVICE METHODS COMPATIBLE WITH WardrobeService ---

    async listPieces(userId: string, filters: { category?: string; status?: string; limit?: number }): Promise<{ pieces: Piece[]; lastDoc: any }> {
        let pieces = await this.getAllPieces(userId);

        if (filters.category) {
            pieces = pieces.filter(p => p.category === filters.category);
        }
        if (filters.status) {
            pieces = pieces.filter(p => p.status === filters.status);
        }
        // Limit is ignored for local for simplicity, or we can slice
        if (filters.limit) {
            pieces = pieces.slice(0, filters.limit);
        }

        return { pieces, lastDoc: null };
    }

    async getPiece(userId: string, pieceId: PieceID): Promise<Piece | null> {
        const pieces = await this.getAllPieces(userId);
        return pieces.find(p => p.id === pieceId) || null;
    }

    async addPiece(userId: string, piece: Piece): Promise<void> {
        const pieces = await this.getAllPieces(userId);
        pieces.push(piece);
        await this.saveAllPieces(userId, pieces);
    }

    async updatePiece(userId: string, pieceId: PieceID, updates: Partial<Piece>): Promise<void> {
        const pieces = await this.getAllPieces(userId);
        const index = pieces.findIndex(p => p.id === pieceId);
        if (index !== -1) {
            pieces[index] = { ...pieces[index], ...updates };
            await this.saveAllPieces(userId, pieces);
        }
    }

    async deletePiece(userId: string, pieceId: PieceID): Promise<void> {
        let pieces = await this.getAllPieces(userId);
        pieces = pieces.filter(p => p.id !== pieceId);
        await this.saveAllPieces(userId, pieces);
    }
}
