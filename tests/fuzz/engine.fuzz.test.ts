import { EngineService } from '../../services/EngineService';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import { WardrobeService } from '../../services/WardrobeService';
import { UserService } from '../../services/UserService';
import { GarmentMeta, UserProfileMeta } from '../../engine/types';

// Mocks
jest.mock('expo-constants', () => ({ manifest: { extra: { firebase: {} } } }));
jest.mock('../../system/firebase/firebaseConfig', () => ({ FIREBASE_DB: {}, FIREBASE_AUTH: {} }));
jest.mock('../../services/OutfitEngineService');
jest.mock('../../services/WardrobeService');
jest.mock('../../services/UserService');

describe('Phase 10: Quality Lab (Fuzz Testing)', () => {

    const iterations = 1000;

    beforeAll(() => {
        FeatureFlagService.NEW_ENGINE_ENABLED = true;
    });

    // Helper to generate random garbage
    const randomString = () => Math.random().toString(36).substring(7);
    const randomInt = (max: number) => Math.floor(Math.random() * max);

    it(`should survive ${iterations} random inputs`, async () => {
        let failures = 0;

        for (let i = 0; i < iterations; i++) {
            // 1. Generate Random Profile
            const mockProfile = {
                id: randomString(),
                stylistMeta: {
                    id: randomString(),
                    bodyType: ['rectangle', 'hourglass', 'triangle', 'inverted_triangle', 'oval'][randomInt(5)],
                    skinTone: { undertone: 'warm', hex: '#FFE0BD' },
                    fitPreference: 'regular',
                    modestyLevel: randomInt(10),
                    weights: { comfort: Math.random(), style: Math.random() }
                }
            };
            (UserService.getInstance as jest.Mock).mockReturnValue({
                getProfile: jest.fn().mockResolvedValue(mockProfile)
            });

            // 2. Generate Random Wardrobe (0-20 items)
            const itemCount = randomInt(20);
            const mockPieces = {};
            for (let j = 0; j < itemCount; j++) {
                const id = `item_${j}`;
                mockPieces[id] = {
                    id,
                    category: ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'][randomInt(5)],
                    subcategory: randomString(),
                    color: ['black', 'blue', 'red', 'white', undefined][randomInt(5)],
                    stylistMeta: Math.random() > 0.5 ? {
                        id,
                        type: 'top',
                        colors: [{ hex: '#000', dictColorId: 1 }],
                        formalityRange: [1, 10],
                        seasonScores: {}
                    } : undefined // Half have meta, half don't (testing mapping fallback)
                };
            }
            (WardrobeService.getInstance as jest.Mock).mockReturnValue({
                getAllPieces: jest.fn().mockResolvedValue(mockPieces)
            });

            // 3. Random Context
            const event = ['General', 'Wedding', 'Gym', 'Date', randomString()][randomInt(5)];

            // 4. EXECUTE
            try {
                const result = await EngineService.getSuggestions('u1', event);
                expect(Array.isArray(result)).toBe(true);
            } catch (e) {
                console.error(`Fuzz Failure at iteration ${i}:`, e);
                failures++;
            }
        }

        expect(failures).toBe(0);
    });

});
