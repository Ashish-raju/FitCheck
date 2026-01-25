/**
 * Simple AI service stub for development
 * In production, this would call Gemini/OpenAI API
 */
export class SimpleAIService {
    async generateExplanation(prompt: string): Promise<string> {
        // For development, return a simple explanation
        // In production, this would call an actual AI API
        return "A carefully curated outfit that balances style, comfort, and occasion-appropriateness. " +
            "The color harmony creates visual interest while the silhouette flatters your body type. " +
            "Perfect for today's weather and your planned activities.";
    }
}
