/**
 * UI STATE TYPES
 * 
 * The UI is a projection of the Engine, but has its own state machine
 * to handle animations, transitions, and user intent.
 */

// Basic phases of the daily ritual
export type RitualPhase =
    | 'VOID'      // System is calculating or idle
    | 'SPLASH'    // Cinematic Intro
    | 'INTRO'     // 3-Screen Editorial Slideshow
    | 'ONBOARDING' // Style Quiz
    | 'AUTH'      // Authentication
    | 'HOME'      // Main dashboard
    | 'RITUAL'    // User is making choices (The Carousel)
    | 'SEAL'      // Choice is locked (Final screen)
    | 'WARDROBE'  // Digital closet
    | 'PROFILE'   // User settings & saved outfits
    | 'CAMERA'    // Garment capture
    | 'ITEM_PREVIEW' // Preview captured item before saving
    | 'FRIENDS_FEED' // Phase 2: Social feed
    | 'AI_STYLIST_CHAT' // Phase 2: AI interaction
    | 'SAFETY';   // Emergency fallback state

export type WardrobeTab = 'Top' | 'Bottom' | 'Shoes' | 'Outerwear' | 'Accessory' | 'Favourites' | 'All';

import { Outfit, Piece } from '../../truth/types';

export interface UIState {
    phase: RitualPhase;
    candidateOutfits: Outfit[]; // 3 combinations for Fit Check
    currentOutfitIndex: number; // For carousel
    swipeDirection: 'LEFT' | 'RIGHT' | 'DOWN' | 'NONE';
    lockedOutfitId: string | null;
    activeWardrobeTab: WardrobeTab;
    lastSealTime: number | null;
    error: string | null;
    mood: number; // 0.0 to 1.0
    draftItem: Piece | null; // Draft item for preview before saving
}

export const INITIAL_STATE: UIState = {
    phase: 'VOID',
    candidateOutfits: [],
    currentOutfitIndex: 0,
    swipeDirection: 'NONE',
    lockedOutfitId: null,
    activeWardrobeTab: 'All',
    lastSealTime: null,
    error: null,
    mood: 0.5,
    draftItem: null,
};
