import { Garment, Context } from './models';
import { HardFilter } from './filters';
import { ALGO_PARAMS } from './constants';

// Interface for fetching, can be mocked
interface GarmentRepository {
    getAllUserGarments(userId: string): Promise<Garment[]>;
}

export class RetrievalEngine {
    constructor(private repo: GarmentRepository) { }

    async retrieveCandidates(userId: string, ctx: Context): Promise<Garment[]> {
        const allGarments = await this.repo.getAllUserGarments(userId);

        // 1. Broad Filtering & Hard Veto
        const validCandidates = allGarments.filter(g => {
            return HardFilter.isGarmentBroadlyValid(g, ctx);
        });

        // 2. Size constraints
        // "Never retrieve fewer than 20 unless wardrobe is small"
        // "Retrieve up to 60 candidates"

        if (validCandidates.length <= ALGO_PARAMS.MAX_CANDIDATES) {
            return validCandidates;
        }

        // If we have > 60, we need to select the "best" 60 to pass to scoring/assembly
        // Spec says: "Apply DB filters FIRST. Then optional vector similarity."
        // Since we don't have vector DB here, we will prioritize by rudimentary relevance 
        // (e.g. season score, just to cut down to 60).

        // sorting by season match as a proxy for "relevance" before heavy scoring
        validCandidates.sort((a, b) => b.seasonScore[ctx.season] - a.seasonScore[ctx.season]);

        return validCandidates.slice(0, ALGO_PARAMS.MAX_CANDIDATES);
    }
}
