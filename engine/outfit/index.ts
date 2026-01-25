import { EngineResult, UserProfile, Context, Garment } from './models';
import { parseContext } from './context';
import { RetrievalEngine } from './retrieval';
import { calculateItemScore } from './scoring';
import { OutfitAssembler } from './assembly';
import { Diversifier } from './diversification';
import { ExplanationEngine } from './explanation';

// Input for the entire engine
interface EngineInput {
    userId: string;
    userProfile: UserProfile;
    eventParams: {
        eventType: string;
        timeOfDay: string;
        weather: { temp: number; rainProb: number };
        geoLocation: string;
    };
    garmentRepo: any; // Interface match
    aiService: any; // Interface match
}

export async function generateOutfitSuggestions(input: EngineInput): Promise<EngineResult> {
    const { userId, userProfile, eventParams, garmentRepo, aiService } = input;

    // 1. Context Parsing (Section 2)
    const context = parseContext(eventParams);

    // 2. Candidate Retrieval & Hard Filtering (Section 3 & 4)
    const retrieval = new RetrievalEngine(garmentRepo);
    const candidates = await retrieval.retrieveCandidates(userId, context);

    if (candidates.length === 0) {
        return { context, outfits: [] }; // Handle graceful empty
    }

    // 3. Item Scoring (Section 5)
    const scoredCandidates: Record<string, number> = {};
    const candidatesByType: Record<string, Garment[]> = {};
    const garmentsMap: Record<string, Garment> = {}; // Helper for later

    for (const g of candidates) {
        const score = calculateItemScore(g, userProfile, context);
        scoredCandidates[g.id] = score;
        garmentsMap[g.id] = g;

        if (!candidatesByType[g.type]) candidatesByType[g.type] = [];
        candidatesByType[g.type].push(g);
    }

    // 4. Outfit Assembly (Section 6)
    const rawOutfits = OutfitAssembler.assembleOutfits(
        candidatesByType,
        scoredCandidates,
        context,
        userProfile
    );

    // 5. Outfit Scoring (Section 7)
    // Already partially done in assembly for pruning, but final scores are set.
    // Assuming assembleOutfits returns scored outfits using scoreOutfit().

    // 6. Diversification (Section 8)
    const finalOutfits = Diversifier.selectDiverseOutfits(rawOutfits, garmentsMap);

    // 7. Explanation (Section 9)
    // Async generation often best for UI, but here we await or schedule.
    // Populate 'rationale'
    for (const outfit of finalOutfits) {
        const outfitGarments = outfit.items.map(id => garmentsMap[id]);
        // Mock AI service for now if null
        const service = aiService || { generateExplanation: async () => "Perfectly matched for your style and the weather." };
        outfit.rationale = await ExplanationEngine.generateExplanation(outfit, outfitGarments, context, service);
    }

    return {
        context,
        outfits: finalOutfits
    };
}
