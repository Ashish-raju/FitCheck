import { UIState, INITIAL_STATE } from './uiState';
import { Outfit, Piece } from '../../truth/types';
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

    public toAuth() {
        console.log('[RitualMachine] Navigating to AUTH');
        this.state = { ...this.state, phase: 'AUTH' };
        this.emit();
    }

    public toHome() {
        console.log('[RitualMachine] Navigating to HOME');
        this.state = {
            ...this.state,
            phase: 'HOME',
            candidateOutfits: [], // Clear old outfits to force fresh generation
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

    public toItemPreview(draftItem: Piece) {
        console.log('[RitualMachine] Navigating to ITEM_PREVIEW');
        this.state = {
            ...this.state,
            phase: 'ITEM_PREVIEW',
            draftItem,
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public clearDraftItem() {
        console.log('[RitualMachine] Clearing draft item');
        this.state = {
            ...this.state,
            draftItem: null
        };
        this.emit();
    }

    // --- TRANSITIONS ---

    /**
     * Engine has generated combinations.
     */
    public enterRitual(outfits: Outfit[], startIndex: number = 0) {
        console.log(`[RitualMachine] Transitioning to RITUAL with ${outfits.length} outfits`);
        if (outfits.length > 0 && outfits[0].pieces.length > 0) {
            const firstOutfitItems = outfits[0].pieces.map(p => p.name || `${p.color} ${p.category}`).join(', ');
            console.log(`[RitualMachine] First outfit: ${firstOutfitItems}`);
        }
        this.state = {
            ...this.state,
            phase: 'RITUAL',
            candidateOutfits: outfits,
            currentOutfitIndex: startIndex,
            swipeDirection: 'NONE'
        };
        this.emit();
    }

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

    public sealRitual(finalOutfitId: string) {
        console.log(`[RitualMachine] Transitioning: RITUAL -> SEAL (Locked: ${finalOutfitId})`);
        const outfit = this.state.candidateOutfits.find(o => o.id === finalOutfitId);
        this.state = {
            ...this.state,
            phase: 'SEAL',
            lockedOutfitId: finalOutfitId,
            lastSealTime: Date.now(),
        };
        InventoryStore.getInstance().recordSeal(finalOutfitId);
        if (outfit) {
            this.cloud.recordRitual(outfit);
        }
        this.emit();
    }

    public vetoRitual(rejectedOutfitId: string) {
        console.log(`[RitualMachine] VETOED outfit: ${rejectedOutfitId}`);
        // Optionally record rejection statistics here
        this.emit();
    }

    public triggerSafety() {
        console.log('[RitualMachine] ALERT: Routing to SAFETY');
        this.state = {
            ...this.state,
            phase: 'SAFETY',
            swipeDirection: 'NONE'
        };
        this.emit();
    }

    public resetToHome() {
        this.state = {
            ...INITIAL_STATE,
            phase: 'HOME',
            candidateOutfits: [] // Explicitly clear
        };
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

export const ritualMachine = new RitualMachine();
