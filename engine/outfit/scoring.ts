import { Garment, UserProfile, Context } from './models';
import * as Utils from './scoring_utils';
import { getPaletteScore } from './color_utils';

export function calculateItemScore(g: Garment, user: UserProfile, ctx: Context): number {
    // Component Scores
    const formalityFit = Utils.calculateFormalityFit(g, ctx);
    const seasonScore = g.seasonScore[ctx.season] || 0; // Model has this
    const bodyScore = g.bodyScore[user.bodyType] || 0.5; // Default neutral if missing
    const styleMatch = Utils.calculateStyleMatch(g, user.stylePrefs);
    const paletteFit = getPaletteScore(g.colors, ctx.paletteTarget, user.palette.avoid);
    const recencyBoost = Utils.calculateRecencyBoost(g.lastWornAt);
    const repetitionPenalty = Utils.calculateRepetitionPenalty(g.wornCount);

    // Weights from User Profile
    const { wF, wS, wB, wC, wU, wR, wP } = user.weights;

    // Formula:
    // wF * formalityFit + wS * seasonScore + wB * bodyScore + wU * styleMatch + wC * paletteFit + wR * recencyBoost - wP * repetitionPenalty

    const score =
        (wF * formalityFit) +
        (wS * seasonScore) +
        (wB * bodyScore) +
        (wU * styleMatch) +
        (wC * paletteFit) +
        (wR * recencyBoost) -
        (wP * repetitionPenalty);

    return score;
}
