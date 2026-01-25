import { create } from 'zustand';
import { Outfit } from '../truth/types';
import { OutfitEngineService } from '../services/OutfitEngineService';

interface OutfitEngineState {
    // State
    outfits: Outfit[];
    isGenerating: boolean;
    error: string | null;

    // Actions
    generateOutfits: (userId: string, eventType: string, temperature: number, condition: string) => Promise<void>;
    clearOutfits: () => void;
}

export const useOutfitEngine = create<OutfitEngineState>((set) => ({
    outfits: [],
    isGenerating: false,
    error: null,

    generateOutfits: async (userId, eventType, temperature, condition) => {
        set({ isGenerating: true, error: null });

        try {
            const engine = OutfitEngineService.getInstance();
            const outfits = await engine.generateOutfits(userId, eventType, temperature, condition);

            set({ outfits, isGenerating: false });
        } catch (error) {
            console.error('[useOutfitEngine] Generation failed:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to generate outfits',
                isGenerating: false
            });
        }
    },

    clearOutfits: () => {
        set({ outfits: [], error: null });
    }
}));
