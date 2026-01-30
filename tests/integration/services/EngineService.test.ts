import { EngineService } from '../../../services/EngineService';
import { FeatureFlagService } from '../../../services/FeatureFlagService';
import { OutfitEngineService } from '../../../services/OutfitEngineService';
import { WardrobeService } from '../../../services/WardrobeService';
import { UserService } from '../../../services/UserService';
import { RetrievalEngine } from '../../../engine/retrieval';

// Mocks
jest.mock('expo-constants', () => ({
    manifest: { extra: { firebase: {} } }
}));
jest.mock('../../../system/firebase/firebaseConfig', () => ({
    FIREBASE_DB: {},
    FIREBASE_AUTH: {}
}));
jest.mock('../../../services/OutfitEngineService');
jest.mock('../../../services/WardrobeService');
jest.mock('../../../services/UserService');
jest.mock('../../../services/FirebaseGarmentRepository');
jest.mock('../../../engine/retrieval');
jest.mock('../../../engine/outfit-forge', () => ({
    OutfitForge: { assemble: jest.fn(() => ({ candidates: [] })) }
}));

describe('Phase 9: Engine Service (Integration)', () => {

    const mockLegacyOutfitService = {
        generateOutfits: jest.fn()
    };

    const mockWardrobeService = {
        getAllPieces: jest.fn().mockResolvedValue({})
    };

    const mockUserService = {
        getProfile: jest.fn().mockResolvedValue({ id: 'u1', preferences: {} })
    };

    beforeEach(() => {
        jest.clearAllMocks();
        FeatureFlagService.NEW_ENGINE_ENABLED = false;
        FeatureFlagService.PARALLEL_RUN = false;
        (RetrievalEngine.findCandidates as jest.Mock).mockReturnValue({ tops: [], bottoms: [], shoes: [], layers: [], onePieces: [], accessories: [] });

        // Mock Singletons
        (OutfitEngineService.getInstance as jest.Mock).mockReturnValue(mockLegacyOutfitService);
        mockLegacyOutfitService.generateOutfits.mockResolvedValue([{ id: 'legacy_1' }]);

        (WardrobeService.getInstance as jest.Mock).mockReturnValue(mockWardrobeService);
        (UserService.getInstance as jest.Mock).mockReturnValue(mockUserService);
    });

    it('should use legacy engine by default', async () => {
        const results = await EngineService.getSuggestions('u1');

        expect(results[0].id).toBe('legacy_1');
        expect(mockLegacyOutfitService.generateOutfits).toHaveBeenCalled();
        expect(RetrievalEngine.findCandidates).not.toHaveBeenCalled();
    });

    it('should trigger shadow run if enabled', async () => {
        FeatureFlagService.PARALLEL_RUN = true;

        const results = await EngineService.getSuggestions('u1');

        expect(results[0].id).toBe('legacy_1'); // Still returns legacy
        expect(mockLegacyOutfitService.generateOutfits).toHaveBeenCalled();

        // Wait for next tick to check shadow run (microtask queue)
        await new Promise(resolve => process.nextTick(resolve));

        expect(RetrievalEngine.findCandidates).toHaveBeenCalled();
    });

    it('should use new engine if flag enabled', async () => {
        FeatureFlagService.NEW_ENGINE_ENABLED = true;

        await EngineService.getSuggestions('u1');

        expect(RetrievalEngine.findCandidates).toHaveBeenCalled();
        expect(mockLegacyOutfitService.generateOutfits).not.toHaveBeenCalled();
    });

    it('should fallback to legacy if new engine crashes', async () => {
        FeatureFlagService.NEW_ENGINE_ENABLED = true;
        (RetrievalEngine.findCandidates as jest.Mock).mockImplementation(() => { throw new Error("Boom"); });

        const results = await EngineService.getSuggestions('u1');

        expect(results[0].id).toBe('legacy_1'); // Fallback successful
        expect(mockLegacyOutfitService.generateOutfits).toHaveBeenCalled();
    });

});
