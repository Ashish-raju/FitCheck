import { InventoryStore } from '../../state/inventory/inventoryStore';
import { Piece } from '../../truth/types';

export interface TripConfig {
    destination: string;
    durationDays: number;
    climate: 'WARM' | 'COLD' | 'MILD';
    purpose: 'WORK' | 'LEISURE';
}

export class TravelPacker {
    private static instance: TravelPacker;

    private constructor() { }

    public static getInstance(): TravelPacker {
        if (!TravelPacker.instance) {
            TravelPacker.instance = new TravelPacker();
        }
        return TravelPacker.instance;
    }

    public generatePackList(config: TripConfig): Piece[] {
        console.log(`[TravelPacker] Generating list for ${config.destination} (${config.durationDays} days)`);

        const inventory = InventoryStore.getInstance().getInventory();
        const allPieces = Object.values(inventory.pieces);
        const packList: Piece[] = [];

        // Simple heuristic list
        const categories: Piece['category'][] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];

        categories.forEach(cat => {
            const applicable = allPieces.filter(p => {
                if (p.category !== cat) return false;
                if (p.status !== 'Clean') return false;

                // Filter by warmth
                if (config.climate === 'WARM' && (p.warmth || 0.5) > 0.6) return false;
                if (config.climate === 'COLD' && (p.warmth || 0.5) < 0.4) return false;

                // Filter by formality
                if (config.purpose === 'WORK' && (p.formality || 0.5) < 0.4) return false;
                if (config.purpose === 'LEISURE' && (p.formality || 0.5) > 0.7) return false;

                return true;
            });

            // Take up to 2 items per category for simplicity in Phase 2
            packList.push(...applicable.slice(0, 2));
        });

        return packList;
    }
}
