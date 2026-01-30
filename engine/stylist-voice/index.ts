import { TokenBucket } from './token-capping';
import { OutfitCandidate, ContextSpec, UserProfileMeta } from '../types';

export class StylistVoice {
    private static tokenBucket = new TokenBucket(100, 1); // 100 tokens, refill 1/sec

    /**
     * Generate the "Why this works" text for an outfit.
     * Uses deterministic templates based on scores to ensure safety.
     * Can be enhanced with LLM rewriting in the future (Safe Mode).
     */
    static explainOutfit(
        outfit: OutfitCandidate,
        context: ContextSpec,
        user: UserProfileMeta
    ): string {
        const parts: string[] = [];

        // 1. Context / Formality
        // If score is high on contextMatch (which is part of totalScore currently)
        // We assume totalScore represents goodness of fit.
        // We can check specific item properties to be more specific.

        const formalityDiff = Math.abs(context.formalityTarget - 5); // Rough check
        if (context.formalityTarget >= 7) {
            parts.push("Sharp and professional.");
        } else if (context.formalityTarget <= 3) {
            parts.push("Relaxed and comfortable.");
        } else {
            parts.push("Smart and versatile.");
        }

        // 2. Seasonality
        if (context.weather.tempC > 28) {
            parts.push("Breathable fabrics for the heat.");
        } else if (context.weather.tempC < 15) {
            parts.push("Warm layers for the cold.");
        } else if (context.weather.rainProb > 0.4) {
            parts.push("Monsoon-ready materials.");
        }

        // 3. Flattery / Body (Placeholder logic)
        // If we had granular subscores populated, we'd use them.
        // For now, simple standard sign-off.

        // 4. Color Logic
        // Check if primary colors match user's 'bestColors'
        const bestColors = user.palette.bestColors;
        const matchesBest = outfit.items.some(i => bestColors.includes(i.colors[0]?.dictColorId || -1));
        if (matchesBest) {
            parts.push("Features colors that complement your tone.");
        }

        // Combine
        return parts.join(" ");
    }

    /**
     * FUTURE: LLM Integration Point
     * strictOutput: true ensures we only get text, no JSON/Function calls.
     */
    static async explainWithLLM(outfit: OutfitCandidate): Promise<string> {
        if (!this.tokenBucket.consume(10)) {
            return "Rate limit exceeded. Using standard notes.";
        }

        // TODO: Implement OpenAI/Gemini call here.
        // Cap max tokens to 50.
        // content: `Explain this outfit: ${outfit.items.map(i => i.subtype).join(', ')}`
        return Promise.resolve(this.explainOutfit(outfit, {} as any, {} as any)); // Fallback
    }

    /**
     * Explain the score breakdown for an outfit
     * Used by EngineService.scoreOutfit()
     */
    static explainScore(
        outfit: OutfitCandidate,
        context: ContextSpec,
        user: UserProfileMeta
    ): string {
        const score = outfit.totalScore;
        const parts: string[] = [];

        // Overall assessment
        if (score >= 0.8) {
            parts.push("⭐ Excellent choice!");
        } else if (score >= 0.6) {
            parts.push("👍 Good match.");
        } else if (score >= 0.4) {
            parts.push("✓ Decent option.");
        } else {
            parts.push("Consider alternatives.");
        }

        // Add context-specific notes
        if (outfit.subscores?.contextMatch && outfit.subscores.contextMatch > 0.7) {
            parts.push(`Perfect for ${context.event}.`);
        }

        if (outfit.subscores?.colorHarmony && outfit.subscores.colorHarmony > 0.7) {
            parts.push("Colors work beautifully together.");
        }

        return parts.join(" ");
    }
}
