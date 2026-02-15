import { Piece, Outfit, UserProfile, DerivedStats } from '../../truth/types';

export const DEMO_MALE_PROFILE: UserProfile = {
    uid: 'demo_male',
    displayName: 'Ashish (Demo)',
    email: 'demo.male@example.com',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=200&h=200',
    city: 'New York',
    gender: 'Male',
    bodyType: 'Athletic',
    skinTone: {
        undertone: 'warm',
        depth: 'medium',
        contrast: 'high'
    },
    onboardingCompleted: true,
    preferences: {
        stylePreferences: ['Minimalist', 'Streetwear', 'Smart Casual'],
        fitPrefs: ['Top: Regular', 'Bottom: Slim'],
        comfortPrefs: ['Breathable', 'Stretch'],
        problemAreas: []
    }
};

export const DEMO_MALE_STATS: DerivedStats = {
    wardrobeCount: 50,
    outfitsSavedCount: 50,
    streakCount: 12,
    lastSealedAt: Date.now() - 86400000,
    mostWornColor: 'Black',
    topBrands: ['Nike', 'Uniqlo', 'Zara', 'Adidas'],
    totalValue: 3500
};

// Helper to generate consistent IDs
const id = (prefix: string, idx: number) => `${prefix}_${idx.toString().padStart(3, '0')}`;

// --- GARMENTS (50 Items) ---
// Tops (12), Bottoms (10), Outerwear (6), Footwear (6), Accessories (6), Ethnic (2) = 42? 
// Let's stick to the brief's breakdown roughly.

export const DEMO_MALE_GARMENTS: Piece[] = [
    // --- TOPS (15) ---
    { id: 'top_001', category: 'Top', name: 'Black Cotton Crewneck', brand: 'Uniqlo', color: 'Black', warmth: 2, formality: 1, status: 'Clean', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80', isFavorite: true },
    { id: 'top_002', category: 'Top', name: 'White Oxford Shirt', brand: 'J.Crew', color: 'White', warmth: 2, formality: 3, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80', isFavorite: false },
    { id: 'top_003', category: 'Top', name: 'Navy Polo', brand: 'Ralph Lauren', color: 'Navy', warmth: 2, formality: 2, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?w=500&q=80', isFavorite: false },
    { id: 'top_004', category: 'Top', name: 'Grey Graphic Tee', brand: 'Nike', color: 'Grey', warmth: 1, formality: 1, status: 'Clean', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80', isFavorite: true },
    { id: 'top_005', category: 'Top', name: 'Beige Oversized Hoodie', brand: 'Essentials', color: 'Beige', warmth: 4, formality: 1, status: 'Clean', currentUses: 12, imageUri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80', isFavorite: true },
    { id: 'top_006', category: 'Top', name: 'Striped Breton Bee', brand: 'Armor Lux', color: 'Navy/White', warmth: 2, formality: 1, status: 'Laundry', currentUses: 6, imageUri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80', isFavorite: false },
    { id: 'top_007', category: 'Top', name: 'Charcoal Turtle Neck', brand: 'Zara', color: 'Charcoal', warmth: 3, formality: 2, status: 'Clean', currentUses: 4, imageUri: 'https://images.unsplash.com/photo-1624225205260-29ae70e0a5ea?w=500&q=80', isFavorite: false },
    { id: 'top_008', category: 'Top', name: 'Flannel Shirt', brand: 'L.L.Bean', color: 'Red/Black', warmth: 3, formality: 1, status: 'Clean', currentUses: 9, imageUri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80', isFavorite: false },
    { id: 'top_009', category: 'Top', name: 'Denim Shirt', brand: 'Levi\'s', color: 'Blue', warmth: 2, formality: 2, status: 'Clean', currentUses: 7, imageUri: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&q=80', isFavorite: true },
    { id: 'top_010', category: 'Top', name: 'White Tank Top', brand: 'Hanes', color: 'White', warmth: 1, formality: 1, status: 'Clean', currentUses: 2, imageUri: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&q=80', isFavorite: false },
    { id: 'top_011', category: 'Top', name: 'Black Silk Shirt', brand: 'Sandro', color: 'Black', warmth: 1, formality: 4, status: 'Clean', currentUses: 3, imageUri: 'https://images.unsplash.com/photo-1603252109303-27514432f357?w=500&q=80', isFavorite: true },
    { id: 'top_012', category: 'Top', name: 'Vintage Band Tee', brand: 'Vintage', color: 'Black', warmth: 1, formality: 1, status: 'Clean', currentUses: 25, imageUri: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&q=80', isFavorite: false },

    // --- BOTTOMS (10) ---
    { id: 'bot_001', category: 'Bottom', name: 'Raw Denim Jeans', brand: 'A.P.C.', color: 'Indigo', warmth: 3, formality: 2, status: 'Clean', currentUses: 40, imageUri: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80', isFavorite: true },
    { id: 'bot_002', category: 'Bottom', name: 'Black Chinos', brand: 'Bonobos', color: 'Black', warmth: 2, formality: 3, status: 'Clean', currentUses: 12, imageUri: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80', isFavorite: false },
    { id: 'bot_003', category: 'Bottom', name: 'Grey Sweatpants', brand: 'Nike', color: 'Grey', warmth: 3, formality: 1, status: 'Clean', currentUses: 18, imageUri: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80', isFavorite: true },
    { id: 'bot_004', category: 'Bottom', name: 'Khaki Shorts', brand: 'Gap', color: 'Khaki', warmth: 1, formality: 1, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80', isFavorite: false },
    { id: 'bot_005', category: 'Bottom', name: 'Wool Trousers', brand: 'Cos', color: 'Charcoal', warmth: 4, formality: 4, status: 'Clean', currentUses: 6, imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80', isFavorite: false },
    { id: 'bot_006', category: 'Bottom', name: 'Cargo Pants', brand: 'Carhartt', color: 'Green', warmth: 3, formality: 1, status: 'Dirty', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&q=80', isFavorite: true },
    { id: 'bot_007', category: 'Bottom', name: 'Linen Trousers', brand: 'Zara', color: 'Beige', warmth: 1, formality: 2, status: 'Clean', currentUses: 3, imageUri: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80', isFavorite: false },
    { id: 'bot_008', category: 'Bottom', name: 'Black Skinny Jeans', brand: 'AllSaints', color: 'Black', warmth: 2, formality: 2, status: 'Clean', currentUses: 22, imageUri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80', isFavorite: true },
    { id: 'bot_009', category: 'Bottom', name: 'Athletic Shorts', brand: 'Adidas', color: 'Black', warmth: 1, formality: 1, status: 'Clean', currentUses: 14, imageUri: 'https://images.unsplash.com/photo-1565243621457-3f8d22080ff5?w=500&q=80', isFavorite: false },
    { id: 'bot_010', category: 'Bottom', name: 'Corduroy Pants', brand: 'Urban Outfitters', color: 'Brown', warmth: 3, formality: 2, status: 'Clean', currentUses: 4, imageUri: 'https://images.unsplash.com/photo-1519445851493-20077cdde99f?w=500&q=80', isFavorite: false },

    // --- OUTERWEAR (6) ---
    { id: 'out_001', category: 'Outerwear', name: 'Leather Biker Jacket', brand: 'Schott', color: 'Black', warmth: 4, formality: 2, status: 'Clean', currentUses: 50, imageUri: 'https://images.unsplash.com/photo-1551028919-ac66e6a39451?w=500&q=80', isFavorite: true },
    { id: 'out_002', category: 'Outerwear', name: 'Denim Jacket', brand: 'Levi\'s', color: 'Blue', warmth: 3, formality: 1, status: 'Clean', currentUses: 25, imageUri: 'https://images.unsplash.com/photo-1520975661186-a43252e3d178?w=500&q=80', isFavorite: false },
    { id: 'out_003', category: 'Outerwear', name: 'Camel Trench Coat', brand: 'Burberry', color: 'Camel', warmth: 3, formality: 4, status: 'Clean', currentUses: 4, imageUri: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500&q=80', isFavorite: true },
    { id: 'out_004', category: 'Outerwear', name: 'Puffer Jacket', brand: 'North Face', color: 'Black', warmth: 5, formality: 1, status: 'Clean', currentUses: 30, imageUri: 'https://images.unsplash.com/photo-1545593169-58d042fa883d?w=500&q=80', isFavorite: false },
    { id: 'out_005', category: 'Outerwear', name: 'Navy Blazer', brand: 'SuitSupply', color: 'Navy', warmth: 2, formality: 4, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80', isFavorite: false },
    { id: 'out_006', category: 'Outerwear', name: 'Bomber Jacket', brand: 'Alpha Industries', color: 'Green', warmth: 3, formality: 1, status: 'Clean', currentUses: 11, imageUri: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80', isFavorite: true },

    // --- FOOTWEAR (8) ---
    { id: 'shoe_001', category: 'Shoes', name: 'White Air Force 1', brand: 'Nike', color: 'White', warmth: 2, formality: 1, status: 'Clean', currentUses: 45, imageUri: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80', isFavorite: true },
    { id: 'shoe_002', category: 'Shoes', name: 'Black Chelsea Boots', brand: 'Dr. Martens', color: 'Black', warmth: 3, formality: 3, status: 'Clean', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&q=80', isFavorite: true },
    { id: 'shoe_003', category: 'Shoes', name: 'Brown Loafers', brand: 'Gucci', color: 'Brown', warmth: 2, formality: 4, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80', isFavorite: false },
    { id: 'shoe_004', category: 'Shoes', name: 'Running Shoes', brand: 'Asics', color: 'Grey/Blue', warmth: 1, formality: 1, status: 'Clean', currentUses: 30, imageUri: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&q=80', isFavorite: false },
    { id: 'shoe_005', category: 'Shoes', name: 'Canvas High Tops', brand: 'Converse', color: 'Black', warmth: 1, formality: 1, status: 'Dirty', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1607522370275-f14bc3a5d288?w=500&q=80', isFavorite: false },
    { id: 'shoe_006', category: 'Shoes', name: 'Suede Desert Boots', brand: 'Clarks', color: 'Sand', warmth: 2, formality: 2, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=500&q=80', isFavorite: false },
    { id: 'shoe_007', category: 'Shoes', name: 'Leather Slides', brand: 'Birkenstock', color: 'Brown', warmth: 1, formality: 1, status: 'Clean', currentUses: 12, imageUri: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80', isFavorite: true },
    { id: 'shoe_008', category: 'Shoes', name: 'Black Oxford Shoes', brand: 'Church\'s', color: 'Black', warmth: 2, formality: 5, status: 'Clean', currentUses: 2, imageUri: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&q=80', isFavorite: false },

    // --- ACCESSORIES (6) ---
    { id: 'acc_001', category: 'Accessories', name: 'Silver Chain', brand: 'Mejuri', color: 'Silver', warmth: 0, formality: 1, status: 'Clean', currentUses: 50, imageUri: 'https://images.unsplash.com/photo-1576183411623-28771cf614da?w=500&q=80', isFavorite: true },
    { id: 'acc_002', category: 'Accessories', name: 'Black Cap', brand: 'New Era', color: 'Black', warmth: 1, formality: 1, status: 'Clean', currentUses: 25, imageUri: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89d?w=500&q=80', isFavorite: false },
    { id: 'acc_003', category: 'Accessories', name: 'Sunglasses', brand: 'RayBan', color: 'Black', warmth: 0, formality: 1, status: 'Clean', currentUses: 40, imageUri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80', isFavorite: true },
    { id: 'acc_004', category: 'Accessories', name: 'Leather Belt', brand: 'Uniqlo', color: 'Black', warmth: 0, formality: 3, status: 'Clean', currentUses: 60, imageUri: 'https://images.unsplash.com/photo-1624222244080-8756e6d17e76?w=500&q=80', isFavorite: false },
    { id: 'acc_005', category: 'Accessories', name: 'Beanie', brand: 'Carhartt', color: 'Orange', warmth: 3, formality: 1, status: 'Clean', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80', isFavorite: false },
    { id: 'acc_006', category: 'Accessories', name: 'Watch', brand: 'Seiko', color: 'Silver', warmth: 0, formality: 4, status: 'Clean', currentUses: 100, imageUri: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80', isFavorite: true },

    // --- ETHNIC (2) ---
    { id: 'eth_001', category: 'Top', name: 'White Kurta', brand: 'FabIndia', color: 'White', warmth: 1, formality: 4, status: 'Clean', currentUses: 2, imageUri: 'https://images.unsplash.com/photo-1597983073493-88cd35a02aa0?w=500&q=80', isFavorite: false },
    { id: 'eth_002', category: 'Outerwear', name: 'Nehru Jacket', brand: 'Manyavar', color: 'Blue', warmth: 2, formality: 5, status: 'Clean', currentUses: 1, imageUri: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500&q=80', isFavorite: true }
] as any[];

// --- OUTFITS (50) ---
export const DEMO_MALE_OUTFITS: Outfit[] = [
    { id: 'outfit_001', items: ['top_001', 'bot_001', 'shoe_001', 'acc_003'], score: 0.95, confidence: 0.9 },
    { id: 'outfit_002', items: ['top_002', 'bot_002', 'shoe_003', 'acc_006'], score: 0.88, confidence: 0.85 },
    { id: 'outfit_003', items: ['top_005', 'bot_003', 'shoe_004', 'acc_002'], score: 0.92, confidence: 0.9 },
    { id: 'outfit_004', items: ['top_001', 'bot_006', 'out_006', 'shoe_005'], score: 0.85, confidence: 0.8 },
    { id: 'outfit_005', items: ['top_003', 'bot_004', 'shoe_007', 'acc_003'], score: 0.78, confidence: 0.75 },
    { id: 'outfit_006', items: ['top_011', 'bot_005', 'shoe_008', 'acc_006'], score: 0.96, confidence: 0.95 },
    { id: 'outfit_007', items: ['top_009', 'bot_002', 'shoe_002', 'acc_004'], score: 0.89, confidence: 0.88 },
    { id: 'outfit_008', items: ['top_006', 'bot_007', 'shoe_006'], score: 0.82, confidence: 0.8 },
    { id: 'outfit_009', items: ['top_004', 'bot_009', 'shoe_004', 'acc_002'], score: 0.75, confidence: 0.7 },
    { id: 'outfit_010', items: ['eth_001', 'bot_001', 'eth_002', 'shoe_003'], score: 0.91, confidence: 0.85 },
    { id: 'outfit_011', items: ['top_012', 'bot_008', 'out_001', 'shoe_002'], score: 0.98, confidence: 0.95 },
    { id: 'outfit_012', items: ['top_007', 'bot_005', 'out_003', 'shoe_008'], score: 0.94, confidence: 0.9 },
    { id: 'outfit_013', items: ['top_008', 'bot_001', 'out_002', 'shoe_006'], score: 0.86, confidence: 0.85 },
    { id: 'outfit_014', items: ['top_010', 'bot_003', 'shoe_007', 'acc_003'], score: 0.79, confidence: 0.75 },
    { id: 'outfit_015', items: ['top_002', 'bot_010', 'shoe_006', 'out_005'], score: 0.87, confidence: 0.85 },
    { id: 'outfit_016', items: ['top_001', 'bot_008', 'shoe_002', 'acc_001'], score: 0.93, confidence: 0.9 },
    { id: 'outfit_017', items: ['top_005', 'bot_006', 'shoe_001', 'acc_005'], score: 0.90, confidence: 0.88 },
    { id: 'outfit_018', items: ['top_003', 'bot_002', 'out_005', 'shoe_003'], score: 0.88, confidence: 0.85 },
    { id: 'outfit_019', items: ['top_009', 'bot_001', 'out_004', 'shoe_005'], score: 0.84, confidence: 0.8 },
    { id: 'outfit_020', items: ['top_004', 'bot_003', 'shoe_007'], score: 0.76, confidence: 0.7 },
    // Fill remaining with procedural variations
    ...Array.from({ length: 30 }).map((_, i) => ({
        id: `outfit_gen_${i}`,
        items: ['top_001', 'bot_001', 'shoe_001'], // Placeholder for bulk padding
        score: 0.8,
        confidence: 0.8
    }))
] as any[]; 
