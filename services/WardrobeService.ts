import { FIREBASE_DB, FIREBASE_AUTH } from '../system/firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Piece, PieceID } from '../truth/types';

export interface WardrobeServiceOptions {
    limit?: number;
    startAfter?: any;
    category?: string;
    status?: string;
}

export class WardrobeService {
    private static instance: WardrobeService;

    private constructor() { }

    public static getInstance(): WardrobeService {
        if (!WardrobeService.instance) {
            WardrobeService.instance = new WardrobeService();
        }
        return WardrobeService.instance;
    }

    private getUserId(): string {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return uid;
    }

    /**
     * Add a new piece to the wardrobe
     */
    public async addPiece(piece: Piece): Promise<void> {
        const uid = this.getUserId();

        try {
            const pieceData = {
                ...piece,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(piece.id)
                .set(pieceData);

            console.log('[WardrobeService] Added piece:', piece.id);
        } catch (error) {
            console.error('[WardrobeService] Failed to add piece:', error);
            throw error;
        }
    }

    /**
     * Update an existing piece
     */
    public async updatePiece(id: PieceID, updates: Partial<Piece>): Promise<void> {
        const uid = this.getUserId();

        try {
            const updateData = {
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(id)
                .update(updateData);

            console.log('[WardrobeService] Updated piece:', id);
        } catch (error) {
            console.error('[WardrobeService] Failed to update piece:', error);
            throw error;
        }
    }

    /**
     * Delete a piece from the wardrobe
     */
    public async deletePiece(id: PieceID): Promise<void> {
        const uid = this.getUserId();

        try {
            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(id)
                .delete();

            console.log('[WardrobeService] Deleted piece:', id);
        } catch (error) {
            console.error('[WardrobeService] Failed to delete piece:', error);
            throw error;
        }
    }

    /**
     * Get a single piece by ID
     */
    public async getPiece(id: PieceID): Promise<Piece | null> {
        const uid = this.getUserId();

        try {
            const doc = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(id)
                .get();

            if (!doc.exists) {
                return null;
            }

            return doc.data() as Piece;
        } catch (error) {
            console.error('[WardrobeService] Failed to get piece:', error);
            throw error;
        }
    }

    /**
     * List pieces with optional filtering and pagination
     */
    public async listPieces(options: WardrobeServiceOptions = {}): Promise<{ pieces: Piece[], lastDoc: any }> {
        const uid = this.getUserId();
        const { limit = 50, startAfter, category, status } = options;

        try {
            let query = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .orderBy('dateAdded', 'desc') as firebase.firestore.Query;

            // Apply filters
            if (category) {
                query = query.where('category', '==', category);
            }
            if (status) {
                query = query.where('status', '==', status);
            }

            // Apply pagination
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            query = query.limit(limit);

            const snapshot = await query.get();
            const pieces: Piece[] = [];
            let lastDoc = null;

            snapshot.forEach((doc) => {
                pieces.push(doc.data() as Piece);
                lastDoc = doc;
            });

            console.log(`[WardrobeService] Listed ${pieces.length} pieces`);
            return { pieces, lastDoc };
        } catch (error) {
            console.error('[WardrobeService] Failed to list pieces:', error);
            throw error;
        }
    }

    /**
     * Get all pieces (for local cache initialization)
     */
    public async getAllPieces(): Promise<Record<PieceID, Piece>> {
        const uid = this.getUserId();

        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .get();

            const pieces: Record<PieceID, Piece> = {};
            snapshot.forEach((doc) => {
                const piece = doc.data() as Piece;
                pieces[piece.id] = piece;
            });

            console.log(`[WardrobeService] Loaded ${Object.keys(pieces).length} pieces`);
            return pieces;
        } catch (error) {
            console.error('[WardrobeService] Failed to get all pieces:', error);
            throw error;
        }
    }

    /**
     * Subscribe to real-time wardrobe updates
     */
    public subscribeToWardrobe(callback: (pieces: Record<PieceID, Piece>) => void): () => void {
        const uid = this.getUserId();

        const unsubscribe = FIREBASE_DB
            .collection('users')
            .doc(uid)
            .collection('wardrobe')
            .onSnapshot(
                (snapshot) => {
                    const pieces: Record<PieceID, Piece> = {};
                    snapshot.forEach((doc) => {
                        const piece = doc.data() as Piece;
                        pieces[piece.id] = piece;
                    });
                    callback(pieces);
                },
                (error) => {
                    console.error('[WardrobeService] Subscription error:', error);
                }
            );

        return unsubscribe;
    }

    /**
     * Batch add multiple pieces (for initial sync)
     */
    public async batchAddPieces(pieces: Piece[]): Promise<void> {
        const uid = this.getUserId();

        try {
            const batch = FIREBASE_DB.batch();
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();

            pieces.forEach((piece) => {
                const ref = FIREBASE_DB
                    .collection('users')
                    .doc(uid)
                    .collection('wardrobe')
                    .doc(piece.id);

                batch.set(ref, {
                    ...piece,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                });
            });

            await batch.commit();
            console.log(`[WardrobeService] Batch added ${pieces.length} pieces`);
        } catch (error) {
            console.error('[WardrobeService] Batch add failed:', error);
            throw error;
        }
    }
}
