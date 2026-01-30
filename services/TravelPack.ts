import { Piece, Outfit, TravelPack } from '../truth/types';
import { FIREBASE_DB } from '../system/firebase/firebaseConfig';
// import { AnalyticsService } from './AnalyticsService'; 
// import firebase from 'firebase/compat/app';

export interface PackCriteria {
    destination: string;
    duration: number; // days
    purpose: string; // 'Business', 'Vacation', etc.
    season?: string; // 'Summer', 'Winter'
}

/**
 * Generate a localized travel pack
 */
export const generatePack = (wardrobe: Piece[], criteria: PackCriteria): TravelPack => {
    const { duration, purpose, season } = criteria;

    // 1. Target item counts
    // Heuristic: Outfits >= duration * 1.2
    // Tops approx duration / 1.5, Bottoms duration / 3, Shoes 2-3
    const targetTops = Math.max(2, Math.ceil(duration / 1.5));
    const targetBottoms = Math.max(2, Math.ceil(duration / 3));
    const targetShoes = Math.min(3, Math.max(1, Math.ceil(duration / 5)));
    const targetOuterwear = season === 'Winter' ? 2 : 1;

    // 2. Score and Sort Wardrobe
    // Priority: Versatility > Formality Match > Weather Appropriateness
    const scoredItems = wardrobe.map(item => {
        let score = 0;

        // Versatility (Mocked or from analytics)
        // Real impl would cache versatility score on item
        score += (item.currentUses || 0) * 0.5;

        // Formality Match
        const isFormalTrip = purpose === 'Business' || purpose === 'Wedding';
        if (isFormalTrip && item.formality >= 4) score += 20;
        if (!isFormalTrip && item.formality <= 3) score += 10;

        // Season Match (Mocked simple check)
        // Ideally we check item.warmth against expected temp
        if (season === 'Winter' && item.warmth >= 4) score += 30;
        if (season === 'Summer' && item.warmth <= 2) score += 30;

        return { item, score };
    }).sort((a, b) => b.score - a.score);

    // 3. Greedy Selection
    const selectedItems: Piece[] = [];
    const counts = { Top: 0, Bottom: 0, Shoes: 0, Outerwear: 0, Accessory: 0 };

    for (const { item } of scoredItems) {
        const cat = item.category as keyof typeof counts; // Assumes category matches keys roughly

        // Map specific categories if needed
        let mappedCat = cat;
        if (cat === 'Top' as any || cat === 'Tops' as any) mappedCat = 'Top';
        if (cat === 'Bottom' as any || cat === 'Bottoms' as any) mappedCat = 'Bottom';
        // ...

        // Safe increment type check
        if (mappedCat === 'Top' && counts.Top < targetTops) {
            selectedItems.push(item);
            counts.Top++;
        } else if (mappedCat === 'Bottom' && counts.Bottom < targetBottoms) {
            selectedItems.push(item);
            counts.Bottom++;
        } else if ((mappedCat === 'Shoes' as any) && counts.Shoes < targetShoes) {
            selectedItems.push(item);
            counts.Shoes++;
        } else if ((mappedCat === 'Outerwear' as any) && counts.Outerwear < targetOuterwear) {
            selectedItems.push(item);
            counts.Outerwear++;
        }
    }

    // 4. Construct Pack Object
    return {
        id: Math.random().toString(36).substring(7),
        destination: criteria.destination,
        durationDays: duration,
        purpose,
        items: selectedItems,
        createdAt: Date.now(),
        weatherForecast: season // Mocked
    };
};

/**
 * Save generated pack to history
 */
export const savePack = async (uid: string, pack: TravelPack): Promise<void> => {
    try {
        await FIREBASE_DB
            .collection('users')
            .doc(uid)
            .collection('packs')
            .doc(pack.id)
            .set({
                ...pack,
                savedAt: Date.now()
            });
        console.log('Pack saved:', pack.id);
    } catch (e) {
        console.error('Failed to save pack', e);
        throw e;
    }
};
