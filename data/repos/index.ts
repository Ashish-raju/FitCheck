/**
 * Data Repositories - Barrel Export
 * 
 * Single source of truth for all data access across the application.
 * All UI components should use these repos instead of directly accessing
 * Firestore, AsyncStorage, or store singletons.
 */

export { WardrobeRepo } from './wardrobeRepo';
export { OutfitsRepo } from './outfitsRepo';
export { ProfileRepo } from './profileRepo';
export { FeedRepo } from './feedRepo';
export { FeedbackRepo } from './feedbackRepo';

// Re-export types
export type { CategorySummary } from './wardrobeRepo';
export type { Outfit, CreateOutfitPayload, Occasion } from './outfitsRepo';
export type {
    UserProfile,
    UserPreferences,
    SkinTone,
    ColorPalette,
    DerivedStats,
    WardrobeInsights
} from './profileRepo';
export type { FeedItem } from './feedRepo';
export type { AnalyticsEvent } from './feedbackRepo';
