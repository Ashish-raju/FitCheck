import { FIREBASE_DB, FIREBASE_AUTH } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs, Timestamp } from "firebase/firestore";
import { Piece, Outfit } from '../../truth/types';

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
        if (!uid) return; // Silent fail if not logged in

        try {
            const pieceRef = doc(FIREBASE_DB, 'users', uid, 'wardrobe', piece.id);
            await setDoc(pieceRef, {
                ...piece,
                lastSynced: Timestamp.now()
            }, { merge: true });
            console.log(`[CloudStore] Synced piece: ${piece.id}`);
        } catch (error) {
            console.error('[CloudStore] Sync failed for piece:', piece.id, error);
            // In a real app, we might queue this for later retry
        }
    }

    public async pullWardrobe(): Promise<Record<string, Piece>> {
        const uid = this.getUserId();
        if (!uid) return {};

        try {
            const q = query(collection(FIREBASE_DB, 'users', uid, 'wardrobe'));
            const querySnapshot = await getDocs(q);

            const wardrobe: Record<string, Piece> = {};
            querySnapshot.forEach((doc) => {
                wardrobe[doc.id] = doc.data() as Piece;
            });
            return wardrobe;
        } catch (error) {
            console.error('[CloudStore] Pull failed:', error);
            return {};
        }
    }

    // --- RITUALS (History) ---

    public async recordRitual(outfit: Outfit): Promise<void> {
        const uid = this.getUserId();
        if (!uid) return;

        try {
            const ritualRef = doc(collection(FIREBASE_DB, 'users', uid, 'rituals'));
            await setDoc(ritualRef, {
                outfitId: outfit.id,
                items: outfit.items,
                timestamp: Timestamp.now(),
                score: outfit.score
            });

            // Update Stats
            const statsRef = doc(FIREBASE_DB, 'users', uid, 'stats', 'summary');
            await setDoc(statsRef, {
                totalRituals: 0, // In reality, use increment()
                lastRitual: Timestamp.now()
            }, { merge: true });

        } catch (error) {
            console.error('[CloudStore] Record ritual failed:', error);
        }
    }
}
