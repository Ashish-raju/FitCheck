/**
 * SQLite Database Connection Manager
 * Handles database initialization, versioning, and migrations
 */

import * as SQLite from 'expo-sqlite';
import {
    DB_NAME,
    DB_VERSION,
    ALL_TABLES,
    ALL_INDEXES,
    MIGRATIONS_TABLE,
    INIT_USER_PROFILE,
} from './schema';

export class DatabaseConnection {
    private static instance: DatabaseConnection;
    private db: SQLite.SQLiteDatabase | null = null;
    private isInitialized = false;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    /**
     * Initialize database and run migrations
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('[Database] Already initialized');
            return;
        }

        try {
            console.log('[Database] Initializing SQLite database...');

            // Open database
            this.db = await SQLite.openDatabaseAsync(DB_NAME);

            // Enable foreign keys
            await this.db.execAsync('PRAGMA foreign_keys = ON;');

            // Create migrations table first
            await this.db.execAsync(MIGRATIONS_TABLE);

            // Check current version
            const currentVersion = await this.getCurrentVersion();
            console.log(`[Database] Current version: ${currentVersion}`);

            // Run migrations if needed
            if (currentVersion < DB_VERSION) {
                await this.runMigrations(currentVersion, DB_VERSION);
            }

            this.isInitialized = true;
            console.log('[Database] Initialization complete');
        } catch (error) {
            console.error('[Database] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get current database version
     */
    private async getCurrentVersion(): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');

        try {
            const result = await this.db.getFirstAsync<{ version: number }>(
                'SELECT MAX(version) as version FROM migrations'
            );
            return result?.version ?? 0;
        } catch (error) {
            // Table doesn't exist yet
            return 0;
        }
    }

    /**
     * Run migrations from current version to target version
     */
    private async runMigrations(fromVersion: number, toVersion: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        console.log(`[Database] Running migrations from v${fromVersion} to v${toVersion}`);

        try {
            await this.db.execAsync('BEGIN TRANSACTION;');

            // Migration v0 -> v1: Create all tables
            if (fromVersion < 1) {
                console.log('[Database] Creating tables...');
                for (const tableSQL of ALL_TABLES) {
                    await this.db.execAsync(tableSQL);
                }

                console.log('[Database] Creating indexes...');
                for (const indexSQL of ALL_INDEXES) {
                    await this.db.execAsync(indexSQL);
                }

                // Initialize default user profile
                const now = Date.now();
                await this.db.runAsync(INIT_USER_PROFILE, [now, now]);

                // Record migration
                await this.db.runAsync(
                    'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
                    [1, now]
                );
            }

            await this.db.execAsync('COMMIT;');
            console.log('[Database] Migrations completed successfully');
        } catch (error) {
            await this.db.execAsync('ROLLBACK;');
            console.error('[Database] Migration failed, rolled back:', error);
            throw error;
        }
    }

    /**
     * Get database instance
     */
    public getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Execute raw SQL (use with caution)
     */
    public async execute(sql: string, params: any[] = []): Promise<any> {
        const db = this.getDatabase();
        return await db.runAsync(sql, params);
    }

    /**
     * Execute query and return all rows
     */
    public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        const db = this.getDatabase();
        return await db.getAllAsync<T>(sql, params);
    }

    /**
     * Execute query and return first row
     */
    public async queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
        const db = this.getDatabase();
        return await db.getFirstAsync<T>(sql, params);
    }

    /**
     * Run transaction
     */
    public async transaction(callback: (db: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> {
        const db = this.getDatabase();
        try {
            await db.execAsync('BEGIN TRANSACTION;');
            await callback(db);
            await db.execAsync('COMMIT;');
        } catch (error) {
            await db.execAsync('ROLLBACK;');
            throw error;
        }
    }

    /**
     * Close database connection
     */
    public async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.isInitialized = false;
            console.log('[Database] Connection closed');
        }
    }

    /**
     * Delete database (for testing/reset)
     */
    public static async deleteDatabase(): Promise<void> {
        try {
            await SQLite.deleteDatabaseAsync(DB_NAME);
            console.log('[Database] Database deleted');
        } catch (error) {
            console.error('[Database] Failed to delete database:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    public async getStats(): Promise<{
        garments: number;
        outfits: number;
        wearLogs: number;
        travelPacks: number;
        feedbackEvents: number;
    }> {
        const db = this.getDatabase();

        const [garments, outfits, wearLogs, travelPacks, feedbackEvents] = await Promise.all([
            db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM garments'),
            db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM outfits'),
            db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM wear_logs'),
            db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM travel_packs'),
            db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM feedback_events'),
        ]);

        return {
            garments: garments?.count ?? 0,
            outfits: outfits?.count ?? 0,
            wearLogs: wearLogs?.count ?? 0,
            travelPacks: travelPacks?.count ?? 0,
            feedbackEvents: feedbackEvents?.count ?? 0,
        };
    }
}

/**
 * Get singleton database connection
 */
export const getDatabase = () => DatabaseConnection.getInstance();
