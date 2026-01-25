import { FIREBASE_DB, FIREBASE_AUTH } from '../system/firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Outfit, OutfitID } from '../truth/types';

export class OutfitService {
    private static instance: OutfitService;

    private constructor() { }

    public static getInstance(): OutfitService {
        if (!OutfitService.instance) {
            OutfitService.instance = new OutfitService();
        }
        return OutfitService.instance;
    }

    private getUserId(): string {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');
        return uid;
    }

    /**
     * Save an outfit (from ritual)
     */
    public async saveOutfit(outfit: Outfit): Promise<void> {
        const uid = this.getUserId();

        try {
            const outfitData = {
                ...outfit,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('outfits')
                .doc(outfit.id)
                .set(outfitData);

            console.log('[OutfitService] Saved outfit:', outfit.id);
        } catch (error) {
            console.error('[OutfitService] Failed to save outfit:', error);
            throw error;
        }
    }

    /**
     * Get a single outfit
     */
    public async getOutfit(id: OutfitID): Promise<Outfit | null> {
        const uid = this.getUserId();

        try {
            const doc = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('outfits')
                .doc(id)
                .get();

            if (!doc.exists) {
                return null;
            }

            return doc.data() as Outfit;
        } catch (error) {
            console.error('[OutfitService] Failed to get outfit:', error);
            throw error;
        }
    }

    /**
     * List all saved outfits
     */
    public async listOutfits(limit: number = 50): Promise<Outfit[]> {
        const uid = this.getUserId();

        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('outfits')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const outfits: Outfit[] = [];
            snapshot.forEach((doc) => {
                outfits.push(doc.data() as Outfit);
            });

            console.log(`[OutfitService] Listed ${outfits.length} outfits`);
            return outfits;
        } catch (error) {
            console.error('[OutfitService] Failed to list outfits:', error);
            throw error;
        }
    }

    /**
     * Delete an outfit
     */
    public async deleteOutfit(id: OutfitID): Promise<void> {
        const uid = this.getUserId();

        try {
            await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('outfits')
                .doc(id)
                .delete();

            console.log('[OutfitService] Deleted outfit:', id);
        } catch (error) {
            console.error('[OutfitService] Failed to delete outfit:', error);
            throw error;
        }
    }

    /**
     * Record a ritual (daily outfit selection)
     */
    public async recordRitual(outfit: Outfit): Promise<void> {
        const uid = this.getUserId();

        try {
            const ritualRef = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('rituals')
                .doc(); // Auto-generate ID

            await ritualRef.set({
                outfitId: outfit.id,
                items: outfit.items,
                score: outfit.score,
                confidence: outfit.confidence,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });

            // Update stats
            const statsRef = FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('stats')
                .doc('summary');

            await statsRef.set({
                totalRituals: firebase.firestore.FieldValue.increment(1),
                lastRitual: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            console.log('[OutfitService] Recorded ritual:', outfit.id);
        } catch (error) {
            console.error('[OutfitService] Failed to record ritual:', error);
            throw error;
        }
    }

    /**
     * Get ritual history
     */
    public async getRitualHistory(limit: number = 30): Promise<any[]> {
        const uid = this.getUserId();

        try {
            const snapshot = await FIREBASE_DB
                .collection('users')
                .doc(uid)
                .collection('rituals')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const rituals: any[] = [];
            snapshot.forEach((doc) => {
                rituals.push({ id: doc.id, ...doc.data() });
            });

            return rituals;
        } catch (error) {
            console.error('[OutfitService] Failed to get ritual history:', error);
            throw error;
        }
    }
}
