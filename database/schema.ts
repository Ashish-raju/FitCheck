/**
 * SQLite Database Schema for FitCheck
 * Offline-first local storage for all app data
 */

import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'fitcheck.db';
export const DB_VERSION = 1;

/**
 * Database Schema
 * All tables designed for offline-first operation
 */

// Garments table - stores clothing items with full DNA
export const GARMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS garments (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Visual DNA
  primary_color TEXT NOT NULL,
  secondary_colors TEXT,
  pattern TEXT,
  texture TEXT,
  
  -- Physical DNA
  fabric TEXT,
  weight REAL,
  warmth REAL DEFAULT 0.5,
  breathability REAL DEFAULT 0.5,
  
  -- Style DNA
  formality REAL DEFAULT 0.5,
  season_spring INTEGER DEFAULT 1,
  season_summer INTEGER DEFAULT 1,
  season_fall INTEGER DEFAULT 1,
  season_winter INTEGER DEFAULT 1,
  style_tags TEXT,
  
  -- Fit & Comfort
  fit_type TEXT,
  comfort_rating REAL,
  
  -- Status & Usage
  status TEXT DEFAULT 'Clean',
  current_uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 3,
  last_worn INTEGER,
  date_added INTEGER NOT NULL,
  
  -- Media
  image_uri TEXT,
  thumbnail_uri TEXT,
  background_removed INTEGER DEFAULT 0,
  
  -- Metadata
  is_favorite INTEGER DEFAULT 0,
  notes TEXT,
  brand TEXT,
  purchase_date INTEGER,
  price REAL,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

// Create indexes for common queries
export const GARMENTS_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category);',
    'CREATE INDEX IF NOT EXISTS idx_garments_status ON garments(status);',
    'CREATE INDEX IF NOT EXISTS idx_garments_date_added ON garments(date_added DESC);',
    'CREATE INDEX IF NOT EXISTS idx_garments_last_worn ON garments(last_worn DESC);',
    'CREATE INDEX IF NOT EXISTS idx_garments_favorite ON garments(is_favorite);',
];

// Outfits table - stores outfit combinations
export const OUTFITS_TABLE = `
CREATE TABLE IF NOT EXISTS outfits (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  
  -- Outfit composition (JSON array of garment IDs)
  garment_ids TEXT NOT NULL,
  
  -- Context
  event_type TEXT,
  weather_temp REAL,
  weather_rain_prob REAL,
  season TEXT,
  time_of_day TEXT,
  location TEXT,
  
  -- Scoring
  overall_score REAL,
  harmony_score REAL,
  context_score REAL,
  style_score REAL,
  
  -- AI Explanation
  rationale TEXT,
  
  -- Metadata
  is_favorite INTEGER DEFAULT 0,
  wear_count INTEGER DEFAULT 0,
  last_worn INTEGER,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

export const OUTFITS_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_outfits_created ON outfits(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_outfits_score ON outfits(overall_score DESC);',
    'CREATE INDEX IF NOT EXISTS idx_outfits_event ON outfits(event_type);',
    'CREATE INDEX IF NOT EXISTS idx_outfits_favorite ON outfits(is_favorite);',
];

// User Profile table - single row with user preferences
export const USER_PROFILE_TABLE = `
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  
  -- Body Intelligence
  body_type TEXT,
  height REAL,
  weight REAL,
  measurements TEXT,
  
  -- Skin & Color
  skin_tone TEXT,
  skin_undertone TEXT,
  color_palette TEXT,
  
  -- Fit Preferences (JSON)
  fit_preferences TEXT,
  
  -- Style Preferences
  style_personality TEXT,
  preferred_formality REAL DEFAULT 0.5,
  
  -- Vetoes & Constraints (JSON arrays)
  color_vetoes TEXT,
  pattern_vetoes TEXT,
  fabric_vetoes TEXT,
  category_vetoes TEXT,
  
  -- Comfort Settings
  comfort_over_style INTEGER DEFAULT 0,
  temperature_sensitivity REAL DEFAULT 0.5,
  
  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

// Wear Logs table - history of when items/outfits were worn
export const WEAR_LOGS_TABLE = `
CREATE TABLE IF NOT EXISTS wear_logs (
  id TEXT PRIMARY KEY NOT NULL,
  garment_id TEXT,
  outfit_id TEXT,
  
  -- When & Where
  worn_date INTEGER NOT NULL,
  event_type TEXT,
  location TEXT,
  
  -- Weather conditions
  weather_temp REAL,
  weather_condition TEXT,
  
  -- Feedback
  comfort_rating REAL,
  style_rating REAL,
  temperature_rating REAL,
  notes TEXT,
  
  created_at INTEGER NOT NULL,
  
  FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
);
`;

export const WEAR_LOGS_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_wear_logs_garment ON wear_logs(garment_id);',
    'CREATE INDEX IF NOT EXISTS idx_wear_logs_outfit ON wear_logs(outfit_id);',
    'CREATE INDEX IF NOT EXISTS idx_wear_logs_date ON wear_logs(worn_date DESC);',
];

// Travel Packs table - saved packing lists
export const TRAVEL_PACKS_TABLE = `
CREATE TABLE IF NOT EXISTS travel_packs (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  
  -- Trip Details
  destination TEXT,
  start_date INTEGER,
  end_date INTEGER,
  trip_duration INTEGER,
  
  -- Context
  weather_forecast TEXT,
  activities TEXT,
  formality_level REAL,
  
  -- Pack Contents (JSON array of garment IDs)
  garment_ids TEXT NOT NULL,
  
  -- Metadata
  notes TEXT,
  is_archived INTEGER DEFAULT 0,
  
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

export const TRAVEL_PACKS_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_travel_packs_created ON travel_packs(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_travel_packs_start ON travel_packs(start_date DESC);',
];

// Feedback Events table - user feedback for learning
export const FEEDBACK_EVENTS_TABLE = `
CREATE TABLE IF NOT EXISTS feedback_events (
  id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  
  -- Related entities
  garment_id TEXT,
  outfit_id TEXT,
  
  -- Feedback data (JSON)
  feedback_data TEXT NOT NULL,
  
  -- Context
  screen_name TEXT,
  user_action TEXT,
  
  created_at INTEGER NOT NULL,
  
  FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE SET NULL,
  FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE SET NULL
);
`;

export const FEEDBACK_EVENTS_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_feedback_events_type ON feedback_events(event_type);',
    'CREATE INDEX IF NOT EXISTS idx_feedback_events_date ON feedback_events(created_at DESC);',
];

// App Settings table - app configuration
export const APP_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

/**
 * All tables in creation order (respecting foreign keys)
 */
export const ALL_TABLES = [
    GARMENTS_TABLE,
    OUTFITS_TABLE,
    USER_PROFILE_TABLE,
    WEAR_LOGS_TABLE,
    TRAVEL_PACKS_TABLE,
    FEEDBACK_EVENTS_TABLE,
    APP_SETTINGS_TABLE,
];

/**
 * All indexes
 */
export const ALL_INDEXES = [
    ...GARMENTS_INDEXES,
    ...OUTFITS_INDEXES,
    ...WEAR_LOGS_INDEXES,
    ...TRAVEL_PACKS_INDEXES,
    ...FEEDBACK_EVENTS_INDEXES,
];

/**
 * Initialize default user profile
 */
export const INIT_USER_PROFILE = `
INSERT OR IGNORE INTO user_profile (id, created_at, updated_at)
VALUES ('default', ?, ?);
`;

/**
 * Migration tracking
 */
export const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  applied_at INTEGER NOT NULL
);
`;
