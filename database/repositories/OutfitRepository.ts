/**
 * Outfit Repository
 * SQLite-based storage for outfit combinations
 */

import { getDatabase } from '../connection';

export interface Outfit {
    id: string;
    name?: string;
    garmentIds: string[];

    // Context
    eventType?: string;
    weatherTemp?: number;
    weatherRainProb?: number;
    season?: string;
    timeOfDay?: string;
    location?: string;

    // Scoring
    overallScore?: number;
    harmonyScore?: number;
    contextScore?: number;
    styleScore?: number;

    // AI Explanation
    rationale?: string;

    // Metadata
    isFavorite?: boolean;
    wearCount?: number;
    lastWorn?: number;

    // Timestamps
    createdAt: number;
    updatedAt: number;
}

export class OutfitRepository {
    private static instance: OutfitRepository;

    private constructor() { }

    public static getInstance(): OutfitRepository {
        if (!OutfitRepository.instance) {
            OutfitRepository.instance = new OutfitRepository();
        }
        return OutfitRepository.instance;
    }

    /**
     * Convert Outfit to database row
     */
    private toRow(outfit: Outfit): any {
        const now = Date.now();
        return {
            id: outfit.id,
            name: outfit.name || null,
            garment_ids: JSON.stringify(outfit.garmentIds),

            event_type: outfit.eventType || null,
            weather_temp: outfit.weatherTemp ?? null,
            weather_rain_prob: outfit.weatherRainProb ?? null,
            season: outfit.season || null,
            time_of_day: outfit.timeOfDay || null,
            location: outfit.location || null,

            overall_score: outfit.overallScore ?? null,
            harmony_score: outfit.harmonyScore ?? null,
            context_score: outfit.contextScore ?? null,
            style_score: outfit.styleScore ?? null,

            rationale: outfit.rationale || null,

            is_favorite: outfit.isFavorite ? 1 : 0,
            wear_count: outfit.wearCount ?? 0,
            last_worn: outfit.lastWorn || null,

            created_at: outfit.createdAt || now,
            updated_at: now,
        };
    }

    /**
     * Convert database row to Outfit
     */
    private fromRow(row: any): Outfit {
        return {
            id: row.id,
            name: row.name,
            garmentIds: JSON.parse(row.garment_ids),

            eventType: row.event_type,
            weatherTemp: row.weather_temp,
            weatherRainProb: row.weather_rain_prob,
            season: row.season,
            timeOfDay: row.time_of_day,
            location: row.location,

            overallScore: row.overall_score,
            harmonyScore: row.harmony_score,
            contextScore: row.context_score,
            styleScore: row.style_score,

            rationale: row.rationale,

            isFavorite: row.is_favorite === 1,
            wearCount: row.wear_count,
            lastWorn: row.last_worn,

            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    /**
     * Save an outfit
     */
    public async save(outfit: Outfit): Promise<void> {
        const db = getDatabase().getDatabase();
        const row = this.toRow(outfit);

        const sql = `
      INSERT OR REPLACE INTO outfits (
        id, name, garment_ids,
        event_type, weather_temp, weather_rain_prob, season, time_of_day, location,
        overall_score, harmony_score, context_score, style_score,
        rationale,
        is_favorite, wear_count, last_worn,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?,
        ?, ?, ?,
        ?, ?
      )
    `;

        const params = [
            row.id, row.name, row.garment_ids,
            row.event_type, row.weather_temp, row.weather_rain_prob, row.season, row.time_of_day, row.location,
            row.overall_score, row.harmony_score, row.context_score, row.style_score,
            row.rationale,
            row.is_favorite, row.wear_count, row.last_worn,
            row.created_at, row.updated_at,
        ];

        await db.runAsync(sql, params);
        console.log(`[OutfitRepository] Saved outfit: ${outfit.id}`);
    }

    /**
     * Update an existing outfit
     */
    public async update(id: string, updates: Partial<Outfit>): Promise<void> {
        const existing = await this.getById(id);
        if (!existing) {
            throw new Error(`Outfit not found: ${id}`);
        }

        const updated = { ...existing, ...updates };
        await this.save(updated);
    }

    /**
     * Delete an outfit
     */
    public async delete(id: string): Promise<void> {
        const db = getDatabase().getDatabase();
        await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);
        console.log(`[OutfitRepository] Deleted outfit: ${id}`);
    }

    /**
     * Get outfit by ID
     */
    public async getById(id: string): Promise<Outfit | null> {
        const db = getDatabase().getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM outfits WHERE id = ?', [id]);
        return row ? this.fromRow(row) : null;
    }

    /**
     * Get all outfits
     */
    public async getAll(): Promise<Outfit[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM outfits ORDER BY created_at DESC');
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get favorite outfits
     */
    public async getFavorites(): Promise<Outfit[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM outfits WHERE is_favorite = 1 ORDER BY created_at DESC'
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get outfits by event type
     */
    public async getByEventType(eventType: string): Promise<Outfit[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM outfits WHERE event_type = ? ORDER BY overall_score DESC',
            [eventType]
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get top-scored outfits
     */
    public async getTopScored(limit: number = 10): Promise<Outfit[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM outfits WHERE overall_score IS NOT NULL ORDER BY overall_score DESC LIMIT ?',
            [limit]
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get count of outfits
     */
    public async getCount(): Promise<number> {
        const db = getDatabase().getDatabase();
        const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM outfits');
        return result?.count ?? 0;
    }

    /**
     * Mark outfit as worn
     */
    public async markAsWorn(id: string): Promise<void> {
        const db = getDatabase().getDatabase();
        await db.runAsync(
            'UPDATE outfits SET wear_count = wear_count + 1, last_worn = ?, updated_at = ? WHERE id = ?',
            [Date.now(), Date.now(), id]
        );
    }

    /**
     * Toggle favorite
     */
    public async toggleFavorite(id: string): Promise<void> {
        const db = getDatabase().getDatabase();
        await db.runAsync(
            `UPDATE outfits SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?`,
            [Date.now(), id]
        );
    }
}

export const outfitRepository = OutfitRepository.getInstance();
