import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { Piece, Outfit } from '../../truth/types';

/**
 * CloudStore - Enhanced Firestore integration
 * 
 * This is a legacy class that's being replaced by the new service layer.
 * Kept for backward compatibility during migration.
 */
export class CloudStore {
    private static instance: CloudStore;

    private constructor() { }

    public static getInstance(): CloudStore {
        if (!CloudStore.instance) {
            CloudStore.instance = new CloudStore();
        }
        return CloudStore.instance;
    }

    private getUserId(): string | null {
        return FIREBASE_AUTH.currentUser?.uid || null;
    }

    // --- GARMENTS (Pieces) ---

    public async syncPiece(piece: Piece): Promise<void> {
        const uid = this.getUserId();
        if (!uid) return;

        try {
            const pieceRef = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(piece.id);

            await pieceRef.set({
                ...piece,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            console.log(`[CloudStore] Synced piece: ${piece.id}`);
        } catch (error) {
            console.error('[CloudStore] Sync failed for piece:', piece.id, error);
        }
    }

    public async pullWardrobe(): Promise<Record<string, Piece>> {
        const uid = this.getUserId();
        if (!uid) return {};

        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .get();

            const wardrobe: Record<string, Piece> = {};
            snapshot.forEach((doc) => {
                wardrobe[doc.id] = doc.data() as Piece;
            });

            console.log(`[CloudStore] Pulled ${Object.keys(wardrobe).length} pieces`);
            return wardrobe;
        } catch (error) {
            console.error('[CloudStore] Pull failed:', error);
            return {};
        }
    }

    public async deletePiece(pieceId: string): Promise<void> {
        const uid = this.getUserId();
        if (!uid) return;

        try {
            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('wardrobe')
                .doc(pieceId)
                .delete();

            console.log(`[CloudStore] Deleted piece: ${pieceId}`);
        } catch (error) {
            console.error('[CloudStore] Delete failed for piece:', pieceId, error);
        }
    }

    // --- RITUALS (History) ---

    public async recordRitual(outfit: Outfit): Promise<void> {
        const uid = this.getUserId();
        if (!uid) return;

        try {
            const ritualRef = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('rituals')
                .doc();

            await ritualRef.set({
                outfitId: outfit.id,
                items: outfit.items,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                score: outfit.score,
                confidence: outfit.confidence,
            });

            // Update Stats
            const statsRef = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('stats')
                .doc('summary');

            await statsRef.set({
                totalRituals: firebase.firestore.FieldValue.increment(1),
                lastRitual: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            console.log('[CloudStore] Recorded ritual:', outfit.id);
        } catch (error) {
            console.error('[CloudStore] Record ritual failed:', error);
        }
    }

    // --- BATCH OPERATIONS ---

    public async batchSyncPieces(pieces: Piece[]): Promise<void> {
        const uid = this.getUserId();
        if (!uid) return;

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
                    updatedAt: timestamp,
                }, { merge: true });
            });

            await batch.commit();
            console.log(`[CloudStore] Batch synced ${pieces.length} pieces`);
        } catch (error) {
            console.error('[CloudStore] Batch sync failed:', error);
        }
    }

    // --- REAL-TIME SUBSCRIPTIONS ---

    public subscribeToWardrobe(callback: (pieces: Record<string, Piece>) => void): () => void {
        const uid = this.getUserId();
        if (!uid) {
            return () => { };
        }

        const unsubscribe = FIREBASE_DB
            .collection('users')
            .doc(uid)
            .collection('wardrobe')
            .onSnapshot(
                (snapshot) => {
                    const pieces: Record<string, Piece> = {};
                    snapshot.forEach((doc) => {
                        pieces[doc.id] = doc.data() as Piece;
                    });
                    callback(pieces);
                },
                (error) => {
                    console.error('[CloudStore] Subscription error:', error);
                }
            );

        return unsubscribe;
    }
}
