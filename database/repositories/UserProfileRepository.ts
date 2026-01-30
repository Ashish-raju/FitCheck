/**
 * User Profile Repository
 * SQLite-based storage for user preferences and profile data
 */

import { getDatabase } from '../connection';

export interface UserProfile {
    id?: string;

    // Body Intelligence
    bodyType?: string;
    height?: number;
    weight?: number;
    measurements?: any;

    // Skin & Color
    skinTone?: string;
    skinUndertone?: string;
    colorPalette?: string[];

    // Fit Preferences
    fitPreferences?: any;

    // Style Preferences
    stylePersonality?: string;
    preferredFormality?: number;

    // Vetoes & Constraints
    colorVetoes?: string[];
    patternVetoes?: string[];
    fabricVetoes?: string[];
    categoryVetoes?: string[];

    // Comfort Settings
    comfortOverStyle?: boolean;
    temperatureSensitivity?: number;

    // Timestamps
    createdAt?: number;
    updatedAt?: number;
}

export class UserProfileRepository {
    private static instance: UserProfileRepository;

    private constructor() { }

    public static getInstance(): UserProfileRepository {
        if (!UserProfileRepository.instance) {
            UserProfileRepository.instance = new UserProfileRepository();
        }
        return UserProfileRepository.instance;
    }

    /**
     * Get user profile (always returns 'default' profile)
     */
    public async get(): Promise<UserProfile> {
        const db = getDatabase().getDatabase();
        const row = await db.getFirstAsync(
            'SELECT * FROM user_profile WHERE id = ?',
            ['default']
        );

        if (!row) {
            // Should not happen due to INIT script, but handle gracefully
            return this.getDefaultProfile();
        }

        return this.fromRow(row);
    }

    /**
     * Update user profile
     */
    public async update(updates: Partial<UserProfile>): Promise<void> {
        const db = getDatabase().getDatabase();
        const existing = await this.get();
        const updated = { ...existing, ...updates };
        const row = this.toRow(updated);

        const sql = `
      UPDATE user_profile SET
        body_type = ?,
        height = ?,
        weight = ?,
        measurements = ?,
        skin_tone = ?,
        skin_undertone = ?,
        color_palette = ?,
        fit_preferences = ?,
        style_personality = ?,
        preferred_formality = ?,
        color_vetoes = ?,
        pattern_vetoes = ?,
        fabric_vetoes = ?,
        category_vetoes = ?,
        comfort_over_style = ?,
        temperature_sensitivity = ?,
        updated_at = ?
      WHERE id = 'default'
    `;

        const params = [
            row.body_type,
            row.height,
            row.weight,
            row.measurements,
            row.skin_tone,
            row.skin_undertone,
            row.color_palette,
            row.fit_preferences,
            row.style_personality,
            row.preferred_formality,
            row.color_vetoes,
            row.pattern_vetoes,
            row.fabric_vetoes,
            row.category_vetoes,
            row.comfort_over_style,
            row.temperature_sensitivity,
            row.updated_at,
        ];

        await db.runAsync(sql, params);
        console.log('[UserProfileRepository] Updated user profile');
    }

    private toRow(profile: UserProfile): any {
        return {
            id: 'default',
            body_type: profile.bodyType || null,
            height: profile.height || null,
            weight: profile.weight || null,
            measurements: profile.measurements ? JSON.stringify(profile.measurements) : null,
            skin_tone: profile.skinTone || null,
            skin_undertone: profile.skinUndertone || null,
            color_palette: profile.colorPalette ? JSON.stringify(profile.colorPalette) : null,
            fit_preferences: profile.fitPreferences ? JSON.stringify(profile.fitPreferences) : null,
            style_personality: profile.stylePersonality || null,
            preferred_formality: profile.preferredFormality ?? null,
            color_vetoes: profile.colorVetoes ? JSON.stringify(profile.colorVetoes) : null,
            pattern_vetoes: profile.patternVetoes ? JSON.stringify(profile.patternVetoes) : null,
            fabric_vetoes: profile.fabricVetoes ? JSON.stringify(profile.fabricVetoes) : null,
            category_vetoes: profile.categoryVetoes ? JSON.stringify(profile.categoryVetoes) : null,
            comfort_over_style: profile.comfortOverStyle ? 1 : 0,
            temperature_sensitivity: profile.temperatureSensitivity ?? null,
            created_at: profile.createdAt || Date.now(),
            updated_at: Date.now(),
        };
    }

    private fromRow(row: any): UserProfile {
        return {
            id: row.id,
            bodyType: row.body_type,
            height: row.height,
            weight: row.weight,
            measurements: row.measurements ? JSON.parse(row.measurements) : undefined,
            skinTone: row.skin_tone,
            skinUndertone: row.skin_undertone,
            colorPalette: row.color_palette ? JSON.parse(row.color_palette) : undefined,
            fitPreferences: row.fit_preferences ? JSON.parse(row.fit_preferences) : undefined,
            stylePersonality: row.style_personality,
            preferredFormality: row.preferred_formality,
            colorVetoes: row.color_vetoes ? JSON.parse(row.color_vetoes) : undefined,
            patternVetoes: row.pattern_vetoes ? JSON.parse(row.pattern_vetoes) : undefined,
            fabricVetoes: row.fabric_vetoes ? JSON.parse(row.fabric_vetoes) : undefined,
            categoryVetoes: row.category_vetoes ? JSON.parse(row.category_vetoes) : undefined,
            comfortOverStyle: row.comfort_over_style === 1,
            temperatureSensitivity: row.temperature_sensitivity,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private getDefaultProfile(): UserProfile {
        return {
            id: 'default',
            preferredFormality: 0.5,
            temperatureSensitivity: 0.5,
            comfortOverStyle: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
    }
}

export const userProfileRepository = UserProfileRepository.getInstance();
