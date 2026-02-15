import { generateOutfitSuggestions } from './index';
import { Garment, UserProfile, Context } from './models';

// Mocks
const MOCK_USER: UserProfile = {
    skinTone: { undertone: "warm", depth: "medium" },
    palette: { best: [10, 20], avoid: [99] },
    bodyType: "rectangle",
    stylePrefs: ["minimal", "chic"],
    comfortPrefs: { tight: 0.5, loose: 0.5 },
    weights: {
        wF: 1.0, wS: 1.0, wB: 1.0, wC: 1.0, wU: 1.0, wR: 0.5, wP: 0.5
    }
};

const MOCK_GARMENTS: Garment[] = [
    {
        id: "g1", type: "top", subtype: "shirt", gender: "men", fabric: "cotton", pattern: "solid", fit: "regular", formality: 2,
        colors: [{ hex: "#FFFFFF", h: 0, s: 0, l: 100, lab: [100, 0, 0], dictColorId: 10 }],
        seasonScore: { summer: 1, monsoon: 0.5, winter: 0.2 },
        bodyScore: { rectangle: 1.0 }, styleTags: ["minimal"], layerWeight: 1, wornCount: 0, status: "Clean"
    },
    {
        id: "g2", type: "bottom", subtype: "chinos", gender: "men", fabric: "cotton", pattern: "solid", fit: "regular", formality: 2,
        colors: [{ hex: "#000000", h: 0, s: 0, l: 0, lab: [0, 0, 0], dictColorId: 20 }],
        seasonScore: { summer: 1, monsoon: 0.8, winter: 0.5 },
        bodyScore: { rectangle: 1.0 }, styleTags: ["chic"], layerWeight: 1, wornCount: 2, status: "Clean"
    },
    {
        id: "g3", type: "top", subtype: "t-shirt", gender: "men", fabric: "cotton", pattern: "graphic", fit: "regular", formality: 0, // Loud pattern
        colors: [{ hex: "#FF0000", h: 0, s: 100, l: 50, lab: [50, 50, 50], dictColorId: 30 }],
        seasonScore: { summer: 1, monsoon: 0.5, winter: 0.1 },
        bodyScore: { rectangle: 1.0 }, styleTags: ["casual"], layerWeight: 1, wornCount: 0, status: "Clean"
    },
    {
        id: "g4", type: "footwear", subtype: "sneakers", gender: "men", fabric: "leather", pattern: "solid", fit: "regular", formality: 1,
        colors: [{ hex: "#FFFFFF", h: 0, s: 0, l: 100, lab: [100, 0, 0], dictColorId: 10 }],
        seasonScore: { summer: 1, monsoon: 0.2, winter: 0.8 },
        bodyScore: {}, styleTags: [], layerWeight: 1, wornCount: 5, status: "Clean"
    },
    // Invalid Suede item for Monsoon
    {
        id: "g_suede", type: "footwear", subtype: "loafers", gender: "men", fabric: "suede", pattern: "solid", fit: "regular", formality: 2,
        colors: [],
        seasonScore: { summer: 0.8, monsoon: 0.1, winter: 0.8 },
        bodyScore: {}, styleTags: [], layerWeight: 1, wornCount: 0, status: "Clean"
    }
];

const MOCK_REPO = {
    getAllUserGarments: async () => MOCK_GARMENTS
};

const MOCK_AI = {
    generateExplanation: async () => "AI Generated Explanation: Nice fit."
};

async function runTest_OfficeFormal() {
    console.log("--- TEST: Office Formal Context ---");
    const result = await generateOutfitSuggestions({
        userId: "u1",
        userProfile: MOCK_USER,
        eventParams: {
            eventType: "office formal",
            timeOfDay: "morning",
            geoLocation: "Delhi",
            weather: { temp: 30, rainProb: 0.0 }
        },
        garmentRepo: MOCK_REPO,
        aiService: MOCK_AI
    });

    console.log("Context:", result.context.cultureRules);
    console.log("Outfits Found:", result.outfits.length);
    result.outfits.forEach(o => console.log(`O ID: ${o.outfitId} Score: ${o.score.toFixed(2)} Items: ${o.items}`));

    // Check if g3 (graphic tee) is absent (Vetoed by office rule)
    const hasGraphicTee = result.outfits.some(o => o.items.includes("g3"));
    if (hasGraphicTee) console.error("❌ FAILED: Graphic tee should be vetoed for office formal.");
    else console.log("✅ PASSED: Graphic tee vetoed.");
}

async function runTest_Monsoon() {
    console.log("--- TEST: Monsoon Suede Veto ---");
    const result = await generateOutfitSuggestions({
        userId: "u1",
        userProfile: MOCK_USER,
        eventParams: {
            eventType: "brunch",
            timeOfDay: "morning",
            geoLocation: "Mumbai",
            weather: { temp: 25, rainProb: 0.8 } // High rain
        },
        garmentRepo: MOCK_REPO,
        aiService: MOCK_AI
    });

    console.log("Context Culture Rules:", result.context.cultureRules);

    // Check if g_suede is absent (Vetoed by rain)
    const hasSuede = result.outfits.some(o => o.items.includes("g_suede"));
    if (hasSuede) console.error("❌ FAILED: Suede should be vetoed for monsoon.");
    else console.log("✅ PASSED: Suede vetoed.");
}


async function main() {
    await runTest_OfficeFormal();
    await runTest_Monsoon();
}

main();
