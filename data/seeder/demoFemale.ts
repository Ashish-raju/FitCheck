import { Piece, Outfit, UserProfile, DerivedStats } from '../../truth/types';

export const DEMO_FEMALE_PROFILE: UserProfile = {
    uid: 'demo_female',
    displayName: 'Priya (Demo)',
    email: 'demo.female@example.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=200&h=200',
    city: 'San Francisco',
    gender: 'Female',
    bodyType: 'Curvy',
    skinTone: {
        undertone: 'cool',
        depth: 'light',
        contrast: 'medium'
    },
    onboardingCompleted: true,
    preferences: {
        stylePreferences: ['Boho', 'Chic', 'Minimalist'],
        fitPrefs: ['Top: Fitted', 'Bottom: Relaxed'],
        comfortPrefs: ['Soft', 'Flowy'],
        problemAreas: []
    }
};

export const DEMO_FEMALE_STATS: DerivedStats = {
    wardrobeCount: 50,
    outfitsSavedCount: 50,
    streakCount: 24,
    lastSealedAt: Date.now() - 3600000,
    mostWornColor: 'Beige',
    topBrands: ['Zara', 'Reformation', 'Aritzia', 'Chanel'],
    totalValue: 5200
};

export const DEMO_FEMALE_GARMENTS: Piece[] = [
    // --- TOPS (12) ---
    { id: 'ft_001', category: 'Top', name: 'White Silk Blouse', brand: 'Reformation', color: 'White', warmth: 1, formality: 3, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1551163943-3f6a29e3965e?w=500&q=80', isFavorite: true },
    { id: 'ft_002', category: 'Top', name: 'Black Crop Top', brand: 'Zara', color: 'Black', warmth: 1, formality: 1, status: 'Clean', currentUses: 12, imageUri: 'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=500&q=80', isFavorite: false },
    { id: 'ft_003', category: 'Top', name: 'Beige Knit Sweater', brand: 'Aritzia', color: 'Beige', warmth: 3, formality: 2, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=500&q=80', isFavorite: true },
    { id: 'ft_004', category: 'Top', name: 'Striped Tee', brand: 'H&M', color: 'Black/White', warmth: 2, formality: 1, status: 'Laundry', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1525171250216-5e40a71e623f?w=500&q=80', isFavorite: false },
    { id: 'ft_005', category: 'Top', name: 'Floral Print Blouse', brand: 'Ganni', color: 'Pink', warmth: 1, formality: 2, status: 'Clean', currentUses: 3, imageUri: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=500&q=80', isFavorite: false },
    { id: 'ft_006', category: 'Top', name: 'Grey Hoodie', brand: 'Nike', color: 'Grey', warmth: 3, formality: 1, status: 'Clean', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', isFavorite: false },
    { id: 'ft_007', category: 'Top', name: 'Navy Camisole', brand: 'Cuyana', color: 'Navy', warmth: 1, formality: 3, status: 'Clean', currentUses: 6, imageUri: 'https://images.unsplash.com/photo-1551488852-08018d6a3622?w=500&q=80', isFavorite: true },
    { id: 'ft_008', category: 'Top', name: 'Oversized White Graphic Tee', brand: 'Urban', color: 'White', warmth: 1, formality: 1, status: 'Clean', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1508296695146-25e9436d0838?w=500&q=80', isFavorite: false },
    { id: 'ft_009', category: 'Top', name: 'Denim Shirt', brand: 'Madewell', color: 'Blue', warmth: 2, formality: 1, status: 'Clean', currentUses: 9, imageUri: 'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?w=500&q=80', isFavorite: false },
    { id: 'ft_010', category: 'Top', name: 'Red Bodysuit', brand: 'Skims', color: 'Red', warmth: 1, formality: 2, status: 'Clean', currentUses: 4, imageUri: 'https://images.unsplash.com/photo-1582258810755-a50d277d33d5?w=500&q=80', isFavorite: false },
    { id: 'ft_011', category: 'Top', name: 'Linen Button Down', brand: 'Uniqlo', color: 'White', warmth: 1, formality: 2, status: 'Clean', currentUses: 7, imageUri: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80', isFavorite: true },
    { id: 'ft_012', category: 'Top', name: 'Black Turtleneck', brand: 'Uniqlo', color: 'Black', warmth: 3, formality: 2, status: 'Clean', currentUses: 11, imageUri: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500&q=80', isFavorite: false },

    // --- BOTTOMS (10) ---
    { id: 'fb_001', category: 'Bottom', name: 'Blue Mom Jeans', brand: 'Levi\'s', color: 'Blue', warmth: 2, formality: 1, status: 'Clean', currentUses: 30, imageUri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80', isFavorite: true },
    { id: 'fb_002', category: 'Bottom', name: 'Black Wide Leg Trousers', brand: 'Zara', color: 'Black', warmth: 2, formality: 3, status: 'Clean', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=500&q=80', isFavorite: true },
    { id: 'fb_003', category: 'Bottom', name: 'Floral Midi Skirt', brand: 'Reformation', color: 'Pink', warmth: 1, formality: 2, status: 'Clean', currentUses: 6, imageUri: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80', isFavorite: false },
    { id: 'fb_004', category: 'Bottom', name: 'Beige Linen Shorts', brand: 'H&M', color: 'Beige', warmth: 1, formality: 1, status: 'Clean', currentUses: 4, imageUri: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80', isFavorite: false },
    { id: 'fb_005', category: 'Bottom', name: 'Black Mini Skirt', brand: 'Zara', color: 'Black', warmth: 1, formality: 2, status: 'Clean', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1509951838637-299f93933c06?w=500&q=80', isFavorite: false },
    { id: 'fb_006', category: 'Bottom', name: 'White Jeans', brand: 'Everlane', color: 'White', warmth: 2, formality: 2, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80', isFavorite: true },
    { id: 'fb_007', category: 'Bottom', name: 'Grey Joggers', brand: 'Nike', color: 'Grey', warmth: 3, formality: 1, status: 'Dirty', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1588619461337-b452833075b2?w=500&q=80', isFavorite: false },
    { id: 'fb_008', category: 'Bottom', name: 'Plaid Trousers', brand: 'Mango', color: 'Grey', warmth: 3, formality: 3, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80', isFavorite: false },
    { id: 'fb_009', category: 'Bottom', name: 'Denim Shorts', brand: 'Agolde', color: 'Blue', warmth: 1, formality: 1, status: 'Clean', currentUses: 12, imageUri: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=500&q=80', isFavorite: true },
    { id: 'fb_010', category: 'Bottom', name: 'Green Cargo Pants', brand: 'Urban', color: 'Green', warmth: 2, formality: 1, status: 'Clean', currentUses: 7, imageUri: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80', isFavorite: false },

    // --- DRESSES & JUMPSUITS (5) ---
    { id: 'dr_001', category: 'Dress', name: 'Black Slip Dress', brand: 'Silk', color: 'Black', warmth: 1, formality: 4, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80', isFavorite: true },
    { id: 'dr_002', category: 'Dress', name: 'Summer Floral Dress', brand: 'Reformation', color: 'Yellow', warmth: 1, formality: 2, status: 'Clean', currentUses: 3, imageUri: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80', isFavorite: false },
    { id: 'dr_003', category: 'Dress', name: 'Wrap Dress', brand: 'DVF', color: 'Red', warmth: 1, formality: 3, status: 'Clean', currentUses: 2, imageUri: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80', isFavorite: false },
    { id: 'dr_004', category: 'Dress', name: 'Denim Jumpsuit', brand: 'Free People', color: 'Blue', warmth: 2, formality: 1, status: 'Clean', currentUses: 6, imageUri: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=500&q=80', isFavorite: false },
    { id: 'dr_005', category: 'Dress', name: 'Cocktail Dress', brand: 'Self Portrait', color: 'Navy', warmth: 1, formality: 5, status: 'Clean', currentUses: 1, imageUri: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80', isFavorite: true },

    // --- OUTERWEAR (5) ---
    { id: 'fo_001', category: 'Outerwear', name: 'Beige Trench Coat', brand: 'Burberry', color: 'Beige', warmth: 3, formality: 4, status: 'Clean', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500&q=80', isFavorite: true },
    { id: 'fo_002', category: 'Outerwear', name: 'Black Blazer', brand: 'Zara', color: 'Black', warmth: 2, formality: 4, status: 'Clean', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&q=80', isFavorite: true },
    { id: 'fo_003', category: 'Outerwear', name: 'Denim Jacket', brand: 'Madewell', color: 'Blue', warmth: 2, formality: 1, status: 'Clean', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1520975661186-a43252e3d178?w=500&q=80', isFavorite: false },
    { id: 'fo_004', category: 'Outerwear', name: 'Teddy Coat', brand: 'Max Mara', color: 'Brown', warmth: 5, formality: 2, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=500&q=80', isFavorite: true },
    { id: 'fo_005', category: 'Outerwear', name: 'Leather Jacket', brand: 'AllSaints', color: 'Black', warmth: 3, formality: 3, status: 'Clean', currentUses: 18, imageUri: 'https://images.unsplash.com/photo-1551028919-ac66e6a39451?w=500&q=80', isFavorite: true },

    // --- FOOTWEAR (6) ---
    { id: 'fsh_001', category: 'Shoes', name: 'White Sneakers', brand: 'Veja', color: 'White', warmth: 1, formality: 1, status: 'Clean', currentUses: 40, imageUri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80', isFavorite: true },
    { id: 'fsh_002', category: 'Shoes', name: 'Black Ankle Boots', brand: 'Acne', color: 'Black', warmth: 3, formality: 3, status: 'Clean', currentUses: 25, imageUri: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80', isFavorite: true },
    { id: 'fsh_003', category: 'Shoes', name: 'Strappy Heels', brand: 'Steve Madden', color: 'Nude', warmth: 0, formality: 5, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1534030347209-7147fdfaa71a?w=500&q=80', isFavorite: true },
    { id: 'fsh_004', category: 'Shoes', name: 'Loafers', brand: 'Gucci', color: 'Black', warmth: 2, formality: 4, status: 'Clean', currentUses: 10, imageUri: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&q=80', isFavorite: false },
    { id: 'fsh_005', category: 'Shoes', name: 'Sandals', brand: 'Birkenstock', color: 'Brown', warmth: 0, formality: 1, status: 'Clean', currentUses: 15, imageUri: 'https://images.unsplash.com/photo-1596515867375-9275815bd3bb?w=500&q=80', isFavorite: true },
    { id: 'fsh_006', category: 'Shoes', name: 'Knee High Boots', brand: 'Stuart Weitzman', color: 'Black', warmth: 4, formality: 3, status: 'Clean', currentUses: 8, imageUri: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80', isFavorite: true },

    // --- ACCESSORIES (5) ---
    { id: 'facc_001', category: 'Accessories', name: 'Gold Hoops', brand: 'Mejuri', color: 'Gold', warmth: 0, formality: 4, status: 'Clean', currentUses: 60, imageUri: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?w=500&q=80', isFavorite: true },
    { id: 'facc_002', category: 'Accessories', name: 'Black Tote Bag', brand: 'Tory Burch', color: 'Black', warmth: 0, formality: 3, status: 'Clean', currentUses: 45, imageUri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80', isFavorite: true },
    { id: 'facc_003', category: 'Accessories', name: 'Silk Scarf', brand: 'Hermes', color: 'Orange', warmth: 1, formality: 3, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', isFavorite: false },
    { id: 'facc_004', category: 'Accessories', name: 'Sunglasses', brand: 'Celine', color: 'Black', warmth: 0, formality: 2, status: 'Clean', currentUses: 30, imageUri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80', isFavorite: true },
    { id: 'facc_005', category: 'Accessories', name: 'Belt', brand: 'Gucci', color: 'Black', warmth: 0, formality: 3, status: 'Clean', currentUses: 20, imageUri: 'https://images.unsplash.com/photo-1624222244080-8756e6d17e76?w=500&q=80', isFavorite: false },

    // --- ETHNIC (2) ---
    { id: 'feth_001', category: 'Dress', name: 'Lehenga', brand: 'Sabyasachi', color: 'Red', warmth: 2, formality: 5, status: 'Clean', currentUses: 1, imageUri: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=500&q=80', isFavorite: true },
    { id: 'feth_002', category: 'Top', name: 'Kurti', brand: 'FabIndia', color: 'Yellow', warmth: 1, formality: 2, status: 'Clean', currentUses: 5, imageUri: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80', isFavorite: false }
] as any[];

export const DEMO_FEMALE_OUTFITS: Outfit[] = [
    { id: 'fout_001', items: ['ft_001', 'fb_001', 'fsh_003', 'facc_001'], score: 0.95, confidence: 0.9 },
    { id: 'fout_002', items: ['ft_002', 'fb_002', 'fo_005', 'fsh_001'], score: 0.88, confidence: 0.85 },
    { id: 'fout_003', items: ['dr_001', 'fo_002', 'fsh_003', 'facc_004'], score: 0.92, confidence: 0.9 },
    { id: 'fout_004', items: ['ft_003', 'fb_004', 'fsh_005', 'facc_002'], score: 0.85, confidence: 0.8 },
    { id: 'fout_005', items: ['dr_002', 'fsh_005', 'facc_003'], score: 0.89, confidence: 0.88 },
    { id: 'fout_006', items: ['ft_012', 'fb_002', 'fo_001', 'fsh_004'], score: 0.96, confidence: 0.95 },
    { id: 'fout_007', items: ['ft_006', 'fb_007', 'fo_003', 'fsh_001'], score: 0.78, confidence: 0.75 },
    { id: 'fout_008', items: ['ft_005', 'fb_001', 'fsh_004'], score: 0.82, confidence: 0.8 },
    { id: 'fout_009', items: ['ft_007', 'fb_005', 'fo_005', 'fsh_006'], score: 0.91, confidence: 0.9 },
    { id: 'fout_010', items: ['feth_001', 'facc_001'], score: 0.98, confidence: 0.95 },
    { id: 'fout_011', items: ['ft_004', 'fb_006', 'fsh_001', 'facc_004'], score: 0.87, confidence: 0.85 },
    { id: 'fout_012', items: ['dr_004', 'fo_003', 'fsh_001'], score: 0.84, confidence: 0.82 },
    { id: 'fout_013', items: ['ft_008', 'fb_009', 'fsh_005', 'facc_004'], score: 0.80, confidence: 0.78 },
    { id: 'fout_014', items: ['ft_001', 'fb_008', 'fsh_004', 'facc_002'], score: 0.90, confidence: 0.88 },
    { id: 'fout_015', items: ['dr_005', 'fsh_003', 'facc_001'], score: 0.97, confidence: 0.95 },
    ...Array.from({ length: 35 }).map((_, i) => ({
        id: `fout_gen_${i}`,
        items: ['ft_001', 'fb_001', 'fsh_001'],
        score: 0.8,
        confidence: 0.8
    }))
] as any[];
