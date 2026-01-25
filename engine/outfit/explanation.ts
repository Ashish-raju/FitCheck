import { Outfit, Context, Garment } from './models';

// Interface for AI Service
interface IAIService {
    generateExplanation(prompt: string): Promise<string>;
}

export class ExplanationEngine {
    // Pass compact metadata only
    static constructPrompt(outfit: Outfit, garments: Garment[], ctx: Context): string {
        const itemSummaries = garments.map(g =>
            `- ${g.type} (${g.subtype}): ${g.colors[0]?.hex || 'Unknown'} ${g.pattern} ${g.fabric}`
        ).join('\n');

        return `
      Act as a personal stylist. Explain why this outfit works for a ${ctx.event} (${ctx.timeBucket}) in ${ctx.season}.
      Context: ${ctx.temp}C, Rain: ${ctx.rainProb}.
      Items:
      ${itemSummaries}
      
      Keep it under 100 words. Focus on color harmony and silhouette.
    `;
    }

    static async generateExplanation(
        outfit: Outfit,
        garments: Garment[],
        ctx: Context,
        aiService: IAIService
    ): Promise<string> {
        const prompt = this.constructPrompt(outfit, garments, ctx);

        // "Cache explanation permanently" logic would go here (checking DB).
        // For now, call service.
        try {
            return await aiService.generateExplanation(prompt);
        } catch (e) {
            return "Ideally suited for the occasion with balanced colors and comfort."; // Fallback
        }
    }
}
