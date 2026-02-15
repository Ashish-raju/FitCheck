import { TokenBucket } from './token-capping';
import { OutfitCandidate, ContextSpec, UserProfileMeta } from '../types';

export class StylistVoice {
    private static tokenBucket = new TokenBucket(100, 1); // 100 tokens, refill 1/sec

    /**
     * Generate the "Why this works" text for an outfit.
     * Uses deterministic templates based on scores to ensure safety.
     * Can be enhanced with LLM rewriting in the future (Safe Mode).
     */
    /**
     * Generate the "Why this works" text for an outfit.
     * Uses deterministic templates based on scores to ensure safety.
     * Enhanced with "Hype Girl" / "CEO Energy" personality.
     */
    static explainOutfit(
        outfit: OutfitCandidate,
        context: ContextSpec,
        user: UserProfileMeta
    ): string {
        const parts: string[] = [];

        // 1. Context / Formality (Vibe Check)
        const formalityDiff = Math.abs(context.formalityTarget - 5);

        if (context.formalityTarget >= 7) {
            parts.push("Giving major CEO energy 💼.");
        } else if (context.formalityTarget <= 3) {
            parts.push("Cozy chic for the win ✨."); // More inviting
        } else {
            parts.push("Effortlessly polished."); // "Smart and versatile" was too resume-like
        }

        // 2. Seasonality (Comfort Check)
        const { tempC, rainProb } = context.weather;

        if (tempC > 28) {
            parts.push("Light & airy for the heat."); // "Breathable fabrics" -> "Light & airy"
        } else if (tempC < 15) {
            parts.push("Layers on point for the chill."); // "Warm layers" -> "Layers on point"
        } else if (rainProb > 0.4) {
            parts.push("Cute but rain-proof ☔."); // "Monsoon-ready" -> "Cute but rain-proof"
        }

        // 3. Flattery / Body (Empowerment)
        // If we had subscores, we'd say "Snatched waist!" or "Legs for days!"

        // 4. Color Logic (Analysis)
        const bestColors = user.palette?.bestColors || [];
        const matchesBest = outfit.items.some(i => bestColors.includes(i.colors[0]?.dictColorId || -1));

        if (matchesBest) {
            parts.push("This color palette makes you glow.");
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
        return Promise.resolve(this.explainOutfit(outfit, {} as any, {} as any));
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

        // Overall assessment (Personality Injection)
        if (score >= 0.8) {
            parts.push("⭐ Use this immediately."); // "Excellent choice" -> "Use this immediately"
        } else if (score >= 0.6) {
            parts.push("👍 Very cute combo."); // "Good match" -> "Very cute combo"
        } else if (score >= 0.4) {
            parts.push("✓ Solid potential."); // "Decent option" -> "Solid potential"
        } else {
            parts.push("Let's tweak this slightly."); // "Consider alternatives" -> milder
        }

        // Add context-specific notes
        if (outfit.subscores?.contextMatch && outfit.subscores.contextMatch > 0.7) {
            parts.push(`Spot on for ${context.eventType}.`);
        }

        if (outfit.subscores?.colorHarmony && outfit.subscores.colorHarmony > 0.7) {
            parts.push("The colors are obsessed with each other."); // "Colors work beautifully" -> "Obsessed"
        }

        return parts.join(" ");
    }
}
