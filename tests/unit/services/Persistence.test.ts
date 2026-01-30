import { FirebaseGarmentRepository } from '../../../services/FirebaseGarmentRepository';
import { UserService } from '../../../services/UserService';
import { WardrobeService } from '../../../services/WardrobeService';
import { FIREBASE_DB } from '../../../system/firebase/firebaseConfig';
import { GarmentMeta, UserProfileMeta, OutfitSlot } from '../../../engine/types';

// --- MOCKS ---

// Mock WardrobeService
jest.mock('../../../services/WardrobeService', () => {
    return {
        WardrobeService: {
            getInstance: jest.fn().mockReturnValue({
                updatePiece: jest.fn(),
                getAllPieces: jest.fn(),
            }),
        }
    };
});

// Mock Firestore
jest.mock('../../../system/firebase/firebaseConfig', () => ({
    FIREBASE_DB: {
        collection: jest.fn(),
    },
    FIREBASE_AUTH: {
        currentUser: { uid: 'test-uid' }
    }
}));

const mockDoc = {
    set: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
};
const mockCollection = {
    doc: jest.fn(() => mockDoc),
};
(FIREBASE_DB.collection as jest.Mock).mockReturnValue(mockCollection);

describe('Persistence Logic (Phase 3)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('FirebaseGarmentRepository', () => {
        let repository: FirebaseGarmentRepository;
        let mockWardrobeService: jest.Mocked<WardrobeService>;

        beforeEach(() => {
            repository = new FirebaseGarmentRepository();
            // @ts-ignore
            mockWardrobeService = WardrobeService.getInstance() as jest.Mocked<WardrobeService>;

            (mockWardrobeService.updatePiece as jest.Mock).mockClear();
            (mockWardrobeService.getAllPieces as jest.Mock).mockClear();
            (mockWardrobeService.updatePiece as jest.Mock).mockResolvedValue(undefined);
        });

        it('should save garment metadata via WardrobeService', async () => {
            const mockMeta: GarmentMeta = {
                id: 'item_1',
                type: OutfitSlot.Top,
                subtype: 'shirt',
                gender: 'men',
                colors: [],
                primaryColorHex: '#fff',
                fabric: 'cotton',
                weight: 'light',
                pattern: 'solid',
                formalityRange: [1, 5],
                seasonScores: { summer: 1, monsoon: 1, winter: 0, transitional: 1 },
                versatility: 0.8,
                fitType: 'regular',
                bestForBodyTypes: [],
                cantBeLayeredUnder: false,
                requiresLayering: false,
                status: 'active'
            };

            await repository.saveGarmentMeta('item_1', mockMeta);

            expect(mockWardrobeService.updatePiece).toHaveBeenCalledWith(
                'item_1',
                { stylistMeta: mockMeta }
            );
        });
    });

    describe('UserService', () => {
        it('should save user stylist metadata to Firestore', async () => {
            const mockUserMeta: UserProfileMeta = {
                id: 'user_1',
                bodyType: 'rectangle',
                skinTone: { hex: '#000', undertone: 'cool', contrastLevel: 'high' },
                fitPreference: 'slim',
                modestyLevel: 5,
                palette: { bestColors: [], avoidColors: [] },
                weights: { comfort: 1, style: 1, colorHarmony: 1, novelty: 1 }
            };

            await UserService.getInstance().saveUserMeta('user_1', mockUserMeta);

            expect(mockDoc.update).toHaveBeenCalledWith(expect.objectContaining({
                stylistMeta: mockUserMeta
            }));
        });
    });
});
