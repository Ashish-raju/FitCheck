export type BodyType = 'Ectomorph' | 'Mesomorph' | 'Endomorph' | 'Athletic' | 'Curvy' | 'Rectangular' | 'Pear' | 'Apple';

export interface FitRecommendation {
    bestCuts: string[];
    avoidCuts: string[];
    assetsToHighlight: string[];
    stylingTips: string[];
    ethnicWearTips: string[]; // India-specific context
}

export const FitRulesLibrary: Record<string, FitRecommendation> = {
    // 1. Ectomorph / Slim / Rectangular
    'Ectomorph': {
        bestCuts: ['Slim fit', 'Structured shoulders', 'Layered looks', 'Horizontal stripes', 'Crew necks'],
        avoidCuts: ['Oversized baggy clothes', 'Deep V-necks', 'Vertical stripes'],
        assetsToHighlight: ['Height', 'Lean frame'],
        stylingTips: ['Use layering to add bulk.', 'Structured jackets work wonders.', 'Choose heavier fabrics like denim or wool.'],
        ethnicWearTips: ['Bandhgalas look great.', 'Avoid very loose pathanis.', 'Layer kurtas with Nehru jackets.']
    },
    'Rectangular': { // Alias for similar rules
        bestCuts: ['Slim fit', 'Structured shoulders', 'Layered looks', 'Horizontal stripes', 'Crew necks'],
        avoidCuts: ['Boxy fits', 'Monochrome head-to-toe (can look too straight)'],
        assetsToHighlight: ['Shoulders', 'Defined waist (create illusion)'],
        stylingTips: ['Belted jackets.', 'Contrast colors top vs bottom.'],
        ethnicWearTips: ['Structured Sherwanis.', 'Dhoti pants add volume.']
    },

    // 2. Mesomorph / Athletic
    'Mesomorph': {
        bestCuts: ['Fitted shirts', 'Regular fit jeans', 'V-necks', 'Tailored suits'],
        avoidCuts: ['Boxy shapes that hide taper', 'Too tight skinny jeans'],
        assetsToHighlight: ['Shoulders', 'Chest', 'Arms'],
        stylingTips: ['Show off the taper.', 'Roll up sleeves.', 'Fitted but not tight.'],
        ethnicWearTips: ['Fitted Kurtas.', 'Jodhpuri suits.', 'Can pull off most drapes.']
    },
    'Athletic': { // Alias
        bestCuts: ['Fitted shirts', 'Regular fit jeans', 'V-necks', 'Tailored suits'],
        avoidCuts: ['Baggy clothes'],
        assetsToHighlight: ['Muscular build'],
        stylingTips: ['Keep it simple.', 'Avoid too many patterns.'],
        ethnicWearTips: ['Short Kurtas.', 'Pathani suits.']
    },

    // 3. Endomorph / Curvy / Apple
    'Endomorph': {
        bestCuts: ['Straight fit pants', 'Vertical stripes', 'Dark colors', 'Structured jackets'],
        avoidCuts: ['Tight t-shirts', 'Horizontal stripes', 'Light colors on problem areas'],
        assetsToHighlight: ['Legs', 'Face'],
        stylingTips: ['Monochrome creates a slimming vertical line.', 'Avoid pockets on hips.'],
        ethnicWearTips: ['Long Kurtas (below knee).', 'Achkans.', 'Avoid heavy pleating near waist.']
    },
    'Curvy': { // Often implies hour-glass or pear
        bestCuts: ['High waist pants', 'Wrap tops', 'Belted coats'],
        avoidCuts: ['Boxy tops', 'Low rise jeans'],
        assetsToHighlight: ['Waist'],
        stylingTips: ['Cinch the waist.', 'Tailored is key.'],
        ethnicWearTips: ['Anarkali silhouettes.', 'Lehengas with fitted blouses.']
    },
    'Apple': { // Weight around midsection
        bestCuts: ['Empire waist', 'Flowy tops', 'Straight leg pants', 'V-necks'],
        avoidCuts: ['Belts', 'High waist pants that cut into torso'],
        assetsToHighlight: ['Legs', 'Décolletage'],
        stylingTips: ['Draw attention upwards.', 'Untucked but structured shirts.'],
        ethnicWearTips: ['A-line Kurtas.', 'Dupatta draped on one side.']
    },
    'Pear': { // Weight around hips
        bestCuts: ['Bootcut jeans', 'Statement tops', 'Boat necks', 'A-line skirts'],
        avoidCuts: ['Skinny jeans without long tops', 'Cargo pants with side pockets'],
        assetsToHighlight: ['Waist', 'Shoulders'],
        stylingTips: ['Darker bottoms, lighter tops.', 'Add volume to shoulders.'],
        ethnicWearTips: ['Shararas (balance hips).', 'Heavy work on Kurta yoke.']
    }
};

export const getRecommendations = (bodyType?: string): FitRecommendation => {
    if (!bodyType) return FitRulesLibrary['Mesomorph']; // Default
    return FitRulesLibrary[bodyType] || FitRulesLibrary['Mesomorph'];
};
