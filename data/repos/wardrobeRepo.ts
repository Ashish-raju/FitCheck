import { WardrobeService } from '../../services/WardrobeService';
import { Piece, PieceID } from '../../truth/types';

/**
 * WardrobeRepo - Single source of truth for wardrobe/closet data
 * 
 * Features:
 * - Wraps WardrobeService (Firestore-backed)
 * - In-memory caching with TTL
 * - Optimistic updates for mutations
 * - Dynamic category computation
 */

interface GarmentListOptions {
    category?: string;
    status?: string;
    isFavorite?: boolean;
    limit?: number;
    search?: string;
}

export interface CategorySummary {
    category: string;
    count: number;
}

interface CachedData<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class WardrobeRepo {
    private static cache = new Map<string, CachedData<any>>();
    private static service = WardrobeService.getInstance();

    /**
     * List garments with optional filtering
     */
    static async listGarments(userId: string, options: GarmentListOptions = {}): Promise<Piece[]> {
        const cacheKey = `garments_${userId}_${JSON.stringify(options)}`;
        const cached = this.getFromCache<Piece[]>(cacheKey);

        if (cached) {
            console.log('[WardrobeRepo] Cache hit for listGarments');
            return cached;
        }

        try {
            const { pieces } = await this.service.listPieces({
                category: options.category,
                status: options.status,
                limit: options.limit
            });

            // Client-side filtering for options not supported by service
            let filtered = pieces;

            if (options.isFavorite !== undefined) {
                filtered = filtered.filter(p => p.isFavorite === options.isFavorite);
            }

            if (options.search) {
                const query = options.search.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name?.toLowerCase().includes(query) ||
                    p.category?.toLowerCase().includes(query) ||
                    p.color?.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query)
                );
            }

            this.setCache(cacheKey, filtered);
            return filtered;
        } catch (error) {
            console.error('[WardrobeRepo] Failed to list garments:', error);
            throw error;
        }
    }

    /**
     * Get a single garment by ID
     */
    static async getGarment(userId: string, garmentId: PieceID): Promise<Piece | null> {
        const cacheKey = `garment_${userId}_${garmentId}`;
        const cached = this.getFromCache<Piece>(cacheKey);

        if (cached) {
            console.log('[WardrobeRepo] Cache hit for getGarment');
            return cached;
        }

        try {
            const garment = await this.service.getPiece(garmentId);
            if (garment) {
                this.setCache(cacheKey, garment);
            }
            return garment;
        } catch (error) {
            console.error('[WardrobeRepo] Failed to get garment:', error);
            throw error;
        }
    }

    /**
     * Get category summary with counts
     */
    static async getCategories(userId: string): Promise<CategorySummary[]> {
        const cacheKey = `categories_${userId}`;
        const cached = this.getFromCache<CategorySummary[]>(cacheKey);

        if (cached) {
            console.log('[WardrobeRepo] Cache hit for getCategories');
            return cached;
        }

        try {
            // Load all garments to compute categories
            const allGarments = await this.listGarments(userId, {});

            // Count by category
            const categoryMap = new Map<string, number>();
            allGarments.forEach(garment => {
                const cat = garment.category || 'Uncategorized';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
            });

            // Count favorites
            const favCount = allGarments.filter(g => g.isFavorite).length;

            // Build summary
            const categories: CategorySummary[] = [
                { category: 'All', count: allGarments.length },
                { category: 'Favourites', count: favCount },
                ...Array.from(categoryMap.entries())
                    .map(([category, count]) => ({ category, count }))
                    .sort((a, b) => b.count - a.count) // Sort by count descending
            ];

            this.setCache(cacheKey, categories);
            return categories;
        } catch (error) {
            console.error('[WardrobeRepo] Failed to get categories:', error);
            throw error;
        }
    }

    /**
     * Create a new garment
     */
    static async createGarment(userId: string, garment: Piece): Promise<Piece> {
        try {
            await this.service.addPiece(garment);
            this.invalidateCache(userId);
            console.log('[WardrobeRepo] Garment created:', garment.id);
            return garment;
        } catch (error) {
            console.error('[WardrobeRepo] Failed to create garment:', error);
            throw error;
        }
    }

    /**
     * Update an existing garment
     */
    static async updateGarment(userId: string, garmentId: PieceID, patch: Partial<Piece>): Promise<void> {
        try {
            await this.service.updatePiece(garmentId, patch);
            this.invalidateCache(userId);
            console.log('[WardrobeRepo] Garment updated:', garmentId);
        } catch (error) {
            console.error('[WardrobeRepo] Failed to update garment:', error);
            throw error;
        }
    }

    /**
     * Delete a garment
     */
    static async deleteGarment(userId: string, garmentId: PieceID): Promise<void> {
        try {
            await this.service.deletePiece(garmentId);
            this.invalidateCache(userId);
            console.log('[WardrobeRepo] Garment deleted:', garmentId);
        } catch (error) {
            console.error('[WardrobeRepo] Failed to delete garment:', error);
            throw error;
        }
    }

    /**
     * Toggle favorite status
     */
    static async toggleFavorite(userId: string, garmentId: PieceID): Promise<void> {
        try {
            // Get current state
            const garment = await this.getGarment(userId, garmentId);
            if (!garment) {
                throw new Error('Garment not found');
            }

            // Toggle
            await this.updateGarment(userId, garmentId, {
                isFavorite: !garment.isFavorite
            });

            console.log('[WardrobeRepo] Favorite toggled:', garmentId);
        } catch (error) {
            console.error('[WardrobeRepo] Failed to toggle favorite:', error);
            throw error;
        }
    }

    /**
     * Get total wardrobe count
     */
    static async getCount(userId: string): Promise<number> {
        try {
            const garments = await this.listGarments(userId, {});
            return garments.length;
        } catch (error) {
            console.error('[WardrobeRepo] Failed to get count:', error);
            return 0;
        }
    }

    /**
     * Get estimated wardrobe value
     */
    static async getEstimatedValue(userId: string): Promise<number> {
        try {
            const garments = await this.listGarments(userId, {});
            return garments.reduce((sum, g) => {
                // Use estimatedValue if available, otherwise default to $0
                const value = (g as any).estimatedValue || 0;
                return sum + value;
            }, 0);
        } catch (error) {
            console.error('[WardrobeRepo] Failed to get estimated value:', error);
            return 0;
        }
    }

    // ==================== Cache Management ====================

    private static getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    private static setCache<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private static invalidateCache(userId: string): void {
        // Clear all cache entries for this user
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
            if (key.includes(userId)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log('[WardrobeRepo] Cache invalidated for user:', userId);
    }

    /**
     * Clear all cache (useful for logout or manual refresh)
     */
    static clearCache(): void {
        this.cache.clear();
        console.log('[WardrobeRepo] All cache cleared');
    }
}
