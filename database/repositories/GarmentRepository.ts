/**
 * Garment Repository
 * SQLite-based storage for clothing items
 */

import { getDatabase } from '../connection';
import { Piece, PieceID } from '../../truth/types';

export class GarmentRepository {
    private static instance: GarmentRepository;

    private constructor() { }

    public static getInstance(): GarmentRepository {
        if (!GarmentRepository.instance) {
            GarmentRepository.instance = new GarmentRepository();
        }
        return GarmentRepository.instance;
    }

    /**
     * Convert Piece to database row
     */
    private toRow(piece: Piece): any {
        const now = Date.now();
        return {
            id: piece.id,
            name: piece.name || null,
            category: piece.category,
            subcategory: piece.subcategory || null,

            // Visual DNA
            primary_color: piece.color,
            secondary_colors: piece.secondaryColors ? JSON.stringify(piece.secondaryColors) : null,
            pattern: piece.pattern || null,
            texture: piece.texture || null,

            // Physical DNA
            fabric: piece.fabric || null,
            weight: piece.weight || null,
            warmth: piece.warmth ?? 0.5,
            breathability: piece.breathability || null,

            // Style DNA
            formality: piece.formality ?? 0.5,
            season_spring: piece.seasons?.includes('spring') ? 1 : 0,
            season_summer: piece.seasons?.includes('summer') ? 1 : 0,
            season_fall: piece.seasons?.includes('fall') ? 1 : 0,
            season_winter: piece.seasons?.includes('winter') ? 1 : 0,
            style_tags: piece.styleTags ? JSON.stringify(piece.styleTags) : null,

            // Fit & Comfort
            fit_type: piece.fitType || null,
            comfort_rating: piece.comfortRating || null,

            // Status & Usage
            status: piece.status || 'Clean',
            current_uses: piece.currentUses ?? 0,
            max_uses: piece.maxUses ?? 3,
            last_worn: piece.lastWorn || null,
            date_added: piece.dateAdded || now,

            // Media
            image_uri: piece.imageUri || null,
            thumbnail_uri: piece.thumbnailUri || null,
            background_removed: piece.backgroundRemoved ? 1 : 0,

            // Metadata
            is_favorite: piece.isFavorite ? 1 : 0,
            notes: piece.notes || null,
            brand: piece.brand || null,
            purchase_date: piece.purchaseDate || null,
            price: piece.price || null,

            // Timestamps
            created_at: piece.createdAt || now,
            updated_at: now,
        };
    }

    /**
     * Convert database row to Piece
     */
    private fromRow(row: any): Piece {
        const seasons: ('spring' | 'summer' | 'fall' | 'winter')[] = [];
        if (row.season_spring) seasons.push('spring');
        if (row.season_summer) seasons.push('summer');
        if (row.season_fall) seasons.push('fall');
        if (row.season_winter) seasons.push('winter');

        return {
            id: row.id as PieceID,
            name: row.name,
            category: row.category,
            subcategory: row.subcategory,

            // Visual DNA
            color: row.primary_color,
            secondaryColors: row.secondary_colors ? JSON.parse(row.secondary_colors) : undefined,
            pattern: row.pattern,
            texture: row.texture,

            // Physical DNA
            fabric: row.fabric,
            weight: row.weight,
            warmth: row.warmth,
            breathability: row.breathability,

            // Style DNA
            formality: row.formality,
            seasons: seasons.length > 0 ? seasons : undefined,
            styleTags: row.style_tags ? JSON.parse(row.style_tags) : undefined,

            // Fit & Comfort
            fitType: row.fit_type,
            comfortRating: row.comfort_rating,

            // Status & Usage
            status: row.status,
            currentUses: row.current_uses,
            maxUses: row.max_uses,
            lastWorn: row.last_worn,
            dateAdded: row.date_added,

            // Media
            imageUri: row.image_uri,
            thumbnailUri: row.thumbnail_uri,
            backgroundRemoved: row.background_removed === 1,

            // Metadata
            isFavorite: row.is_favorite === 1,
            notes: row.notes,
            brand: row.brand,
            purchaseDate: row.purchase_date,
            price: row.price,

            // Timestamps
            createdAt: row.created_at,
            updatedAt: row.updated_at,

            // Legacy fields
            wearHistory: [], // Will be populated from wear_logs if needed
        };
    }

    /**
     * Add a new garment
     */
    public async add(piece: Piece): Promise<void> {
        const db = getDatabase().getDatabase();
        const row = this.toRow(piece);

        const sql = `
      INSERT INTO garments (
        id, name, category, subcategory,
        primary_color, secondary_colors, pattern, texture,
        fabric, weight, warmth, breathability,
        formality, season_spring, season_summer, season_fall, season_winter, style_tags,
        fit_type, comfort_rating,
        status, current_uses, max_uses, last_worn, date_added,
        image_uri, thumbnail_uri, background_removed,
        is_favorite, notes, brand, purchase_date, price,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
    `;

        const params = [
            row.id, row.name, row.category, row.subcategory,
            row.primary_color, row.secondary_colors, row.pattern, row.texture,
            row.fabric, row.weight, row.warmth, row.breathability,
            row.formality, row.season_spring, row.season_summer, row.season_fall, row.season_winter, row.style_tags,
            row.fit_type, row.comfort_rating,
            row.status, row.current_uses, row.max_uses, row.last_worn, row.date_added,
            row.image_uri, row.thumbnail_uri, row.background_removed,
            row.is_favorite, row.notes, row.brand, row.purchase_date, row.price,
            row.created_at, row.updated_at,
        ];

        await db.runAsync(sql, params);
        console.log(`[GarmentRepository] Added garment: ${piece.id}`);
    }

    /**
     * Update an existing garment
     */
    public async update(id: PieceID, updates: Partial<Piece>): Promise<void> {
        const db = getDatabase().getDatabase();

        // Get existing piece
        const existing = await this.getById(id);
        if (!existing) {
            throw new Error(`Garment not found: ${id}`);
        }

        // Merge updates
        const updated = { ...existing, ...updates };
        const row = this.toRow(updated);

        const sql = `
      UPDATE garments SET
        name = ?, category = ?, subcategory = ?,
        primary_color = ?, secondary_colors = ?, pattern = ?, texture = ?,
        fabric = ?, weight = ?, warmth = ?, breathability = ?,
        formality = ?, season_spring = ?, season_summer = ?, season_fall = ?, season_winter = ?, style_tags = ?,
        fit_type = ?, comfort_rating = ?,
        status = ?, current_uses = ?, max_uses = ?, last_worn = ?, date_added = ?,
        image_uri = ?, thumbnail_uri = ?, background_removed = ?,
        is_favorite = ?, notes = ?, brand = ?, purchase_date = ?, price = ?,
        updated_at = ?
      WHERE id = ?
    `;

        const params = [
            row.name, row.category, row.subcategory,
            row.primary_color, row.secondary_colors, row.pattern, row.texture,
            row.fabric, row.weight, row.warmth, row.breathability,
            row.formality, row.season_spring, row.season_summer, row.season_fall, row.season_winter, row.style_tags,
            row.fit_type, row.comfort_rating,
            row.status, row.current_uses, row.max_uses, row.last_worn, row.date_added,
            row.image_uri, row.thumbnail_uri, row.background_removed,
            row.is_favorite, row.notes, row.brand, row.purchase_date, row.price,
            row.updated_at,
            id,
        ];

        await db.runAsync(sql, params);
        console.log(`[GarmentRepository] Updated garment: ${id}`);
    }

    /**
     * Delete a garment
     */
    public async delete(id: PieceID): Promise<void> {
        const db = getDatabase().getDatabase();
        await db.runAsync('DELETE FROM garments WHERE id = ?', [id]);
        console.log(`[GarmentRepository] Deleted garment: ${id}`);
    }

    /**
     * Get garment by ID
     */
    public async getById(id: PieceID): Promise<Piece | null> {
        const db = getDatabase().getDatabase();
        const row = await db.getFirstAsync('SELECT * FROM garments WHERE id = ?', [id]);
        return row ? this.fromRow(row) : null;
    }

    /**
     * Get all garments
     */
    public async getAll(): Promise<Piece[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync('SELECT * FROM garments ORDER BY date_added DESC');
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get garments by category
     */
    public async getByCategory(category: string): Promise<Piece[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM garments WHERE category = ? ORDER BY date_added DESC',
            [category]
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get garments by status
     */
    public async getByStatus(status: string): Promise<Piece[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM garments WHERE status = ? ORDER BY date_added DESC',
            [status]
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get favorite garments
     */
    public async getFavorites(): Promise<Piece[]> {
        const db = getDatabase().getDatabase();
        const rows = await db.getAllAsync(
            'SELECT * FROM garments WHERE is_favorite = 1 ORDER BY date_added DESC'
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Search garments
     */
    public async search(query: string): Promise<Piece[]> {
        const db = getDatabase().getDatabase();
        const searchTerm = `%${query}%`;
        const rows = await db.getAllAsync(
            `SELECT * FROM garments 
       WHERE name LIKE ? OR category LIKE ? OR brand LIKE ? OR notes LIKE ?
       ORDER BY date_added DESC`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );
        return rows.map(row => this.fromRow(row));
    }

    /**
     * Get count of garments
     */
    public async getCount(): Promise<number> {
        const db = getDatabase().getDatabase();
        const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM garments');
        return result?.count ?? 0;
    }

    /**
     * Batch add garments (for seeding/migration)
     */
    public async batchAdd(pieces: Piece[]): Promise<void> {
        await getDatabase().transaction(async (db) => {
            for (const piece of pieces) {
                const row = this.toRow(piece);
                const sql = `
          INSERT OR REPLACE INTO garments (
            id, name, category, subcategory,
            primary_color, secondary_colors, pattern, texture,
            fabric, weight, warmth, breathability,
            formality, season_spring, season_summer, season_fall, season_winter, style_tags,
            fit_type, comfort_rating,
            status, current_uses, max_uses, last_worn, date_added,
            image_uri, thumbnail_uri, background_removed,
            is_favorite, notes, brand, purchase_date, price,
            created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?
          )
        `;

                const params = [
                    row.id, row.name, row.category, row.subcategory,
                    row.primary_color, row.secondary_colors, row.pattern, row.texture,
                    row.fabric, row.weight, row.warmth, row.breathability,
                    row.formality, row.season_spring, row.season_summer, row.season_fall, row.season_winter, row.style_tags,
                    row.fit_type, row.comfort_rating,
                    row.status, row.current_uses, row.max_uses, row.last_worn, row.date_added,
                    row.image_uri, row.thumbnail_uri, row.background_removed,
                    row.is_favorite, row.notes, row.brand, row.purchase_date, row.price,
                    row.created_at, row.updated_at,
                ];

                await db.runAsync(sql, params);
            }
        });
        console.log(`[GarmentRepository] Batch added ${pieces.length} garments`);
    }
}

export const garmentRepository = GarmentRepository.getInstance();
