import { UIState, RitualPhase, INITIAL_STATE } from './uiState';
import { Outfit } from '../../truth/types';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { CloudStore } from '../../system/firebase/CloudStore';

/**
 * THE RITUAL MACHINE
 * 
 * Enforces the strict flow of the daily ritual.
 * VOID -> RITUAL -> SEAL.
 * No backward steps. No branching.
 * 
 * NOTE: This is a pure logic class, not a React component.
 */
export class RitualMachine {
    private state: UIState;
    private listeners: ((state: UIState) => void)[] = [];
    private cloud: CloudStore;

    constructor() {
        this.state = { ...INITIAL_STATE };
        this.cloud = CloudStore.getInstance();
    }

    public getState(): UIState {
        return { ...this.state };
    }

    public subscribe(listener: (state: UIState) => void): () => void {
        this.listeners.push(listener);
        listener(this.state);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private emit() {
        this.listeners.forEach(l => l({ ...this.state }));
    }

    // --- NAVIGATION ---

    public toSplash() {
        console.log('[RitualMachine] Navigating to SPLASH');
        this.state = { ...this.state, phase: 'SPLASH' };
        this.emit();
    }

    public toIntro() {
        console.log('[RitualMachine] Navigating to INTRO');
        this.state = { ...this.state, phase: 'INTRO' };
        this.emit();
    }

    public toOnboarding() {
        console.log('[RitualMachine] Navigating to ONBOARDING');
        this.state = { ...this.state, phase: 'ONBOARDING' };
        this.emit();
    }

    public toHome() {
        console.log('[RitualMachine] Navigating to HOME');
        this.state = {
            ...this.state,
            phase: 'HOME',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public toWardrobe() {
        console.log('[RitualMachine] Navigating to WARDROBE');
        this.state = {
            ...this.state,
            phase: 'WARDROBE',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public toProfile() {
        console.log('[RitualMachine] Navigating to PROFILE');
        this.state = {
            ...this.state,
            phase: 'PROFILE',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public toCamera() {
        console.log('[RitualMachine] Navigating to CAMERA');
        this.state = {
            ...this.state,
            phase: 'CAMERA',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public toFriendsFeed() {
        console.log('[RitualMachine] Navigating to FRIENDS_FEED');
        this.state = {
            ...this.state,
            phase: 'FRIENDS_FEED',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public toAIStylistChat() {
        console.log('[RitualMachine] Navigating to AI_STYLIST_CHAT');
        this.state = {
            ...this.state,
            phase: 'AI_STYLIST_CHAT',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    // --- TRANSITIONS ---

    /**
     * Engine has generated combinations.
     */
    public enterRitual(outfits: Outfit[], startIndex: number = 0) {
        console.log(`[RitualMachine] Transitioning to RITUAL with ${outfits.length} outfits`);
        this.state = {
            ...this.state,
            phase: 'RITUAL',
            candidateOutfits: outfits,
            currentOutfitIndex: startIndex,
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    /**
     * Update the list of outfits (e.g. after a rejection) without resetting current position or phase.
     */
    public updateRitualOutfits(outfits: Outfit[]) {
        if (this.state.phase !== 'RITUAL') return;
        this.state.candidateOutfits = outfits;
        this.emit();
    }

    public setOutfitIndex(index: number) {
        if (this.state.phase !== 'RITUAL') return;
        this.state.currentOutfitIndex = index;
        this.emit();
    }

    /**
     * User has made a choice.
     */
    public sealRitual(finalOutfitId: string) {
        console.log(`[RitualMachine] Transitioning: RITUAL -> SEAL (Locked: ${finalOutfitId})`);

        // Find outfit before state update
        const outfit = this.state.candidateOutfits.find(o => o.id === finalOutfitId);

        this.state = {
            ...this.state,
            phase: 'SEAL',
            lockedOutfitId: finalOutfitId,
            lastSealTime: Date.now(),
        };

        InventoryStore.getInstance().recordSeal(finalOutfitId);

        // The instruction was to add this call, but it was already present.
        // Assuming the intent was to ensure it's there and correctly placed.
        if (outfit) {
            this.cloud.recordRitual(outfit);
        }

        this.emit();
    }

    /**
     * EMERGENCY: System violation or interruption detected.
     */
    public triggerSafety() {
        console.log('[RitualMachine] ALERT: Routing to SAFETY');
        this.state = {
            ...this.state,
            phase: 'SAFETY',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    /**
     * Reset 
     */
    public resetToHome() {
        this.state = { ...INITIAL_STATE, phase: 'HOME' };
        this.emit();
    }

    // --- ACTIONS ---

    public setSwipe(direction: 'LEFT' | 'RIGHT' | 'DOWN' | 'NONE') {
        if (this.state.phase !== 'RITUAL') return;
        this.state.swipeDirection = direction;
        this.emit();
    }

    public setMood(value: number) {
        this.state.mood = value;
        this.emit();
    }

    public setWardrobeTab(tab: any) {
        this.state.activeWardrobeTab = tab;
        this.emit();
    }
}

// Singleton instance for the app
export const ritualMachine = new RitualMachine();
