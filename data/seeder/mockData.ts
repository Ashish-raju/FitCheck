import { Piece, Outfit, UserProfile, DerivedStats } from '../../truth/types';
import { Category } from '../../truth/types';

export const MOCK_PROFILE: UserProfile = {
    uid: 'dummy_user_001',
    displayName: 'Ash',
    email: 'ash.demo@example.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200',
    city: 'New York',
    gender: 'Male',
    bodyType: 'Athletic',
    skinTone: {
        undertone: 'neutral',
        depth: 'medium',
        contrast: 'medium'
    },
    onboardingCompleted: true,
    preferences: {
        stylePreferences: ['Minimalist', 'Streetwear', 'Techwear'],
        fitPrefs: ['Top: Regular', 'Bottom: Slim'],
        comfortPrefs: ['Breathable', 'Stretch'],
        problemAreas: []
    }
};

export const MOCK_STATS: DerivedStats = {
    wardrobeCount: 164,
    outfitsSavedCount: 42,
    streakCount: 12,
    lastSealedAt: Date.now() - 86400000,
    mostWornColor: 'Black',
    topBrands: ['Nike', 'Uniqlo', 'Arc\'teryx'],
    totalValue: 12500
};

export const MOCK_GARMENTS: Piece[] = [
    {
        id: 'top_001' as any,
        category: 'Top',
        name: 'Obsidian Tech Hoodie',
        brand: 'Nike Tech',
        color: '#000000',
        warmth: 4,
        formality: 2,
        status: 'Clean',
        currentUses: 5,
        imageUri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
        isFavorite: true
    },
    {
        id: 'top_002' as any,
        category: 'Top',
        name: 'Vapor Grey Tee',
        brand: 'Uniqlo',
        color: '#CCCCCC',
        warmth: 1,
        formality: 1,
        status: 'Clean',
        currentUses: 12,
        imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
        isFavorite: false
    },
    {
        id: 'bottom_001' as any,
        category: 'Bottom',
        name: 'Cargo Joggers',
        brand: 'Stone Island',
        color: '#1A1A1A',
        warmth: 3,
        formality: 2,
        status: 'Clean',
        currentUses: 8,
        imageUri: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=600&q=80',
        isFavorite: true
    },
    {
        id: 'shoes_001' as any,
        category: 'Shoes',
        name: 'Air Max 97',
        brand: 'Nike',
        color: '#FFFFFF',
        warmth: 2,
        formality: 1,
        status: 'Clean',
        currentUses: 20,
        imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        isFavorite: true
    },
    {
        id: 'outerwear_001' as any,
        category: 'Outerwear',
        name: 'Alpha Shell Jacket',
        brand: 'Arc\'teryx',
        color: '#223344',
        warmth: 5,
        formality: 3,
        status: 'Clean',
        currentUses: 3,
        imageUri: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        isFavorite: true
    }
];

export const MOCK_OUTFITS: Outfit[] = [
    {
        id: 'outfit_001' as any,
        items: ['top_001', 'bottom_001', 'shoes_001'] as any,
        pieces: [MOCK_GARMENTS[0], MOCK_GARMENTS[2], MOCK_GARMENTS[3]],
        score: 0.95,
        confidence: 0.9
    },
    {
        id: 'outfit_002' as any,
        items: ['top_002', 'bottom_001', 'outerwear_001', 'shoes_001'] as any,
        pieces: [MOCK_GARMENTS[1], MOCK_GARMENTS[2], MOCK_GARMENTS[4], MOCK_GARMENTS[3]],
        score: 0.88,
        confidence: 0.85
    }
];
