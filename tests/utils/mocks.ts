/**
 * Mock implementations for external dependencies
 */

export class MockGarmentRepository {
    private garments: any[];

    constructor(garments: any[]) {
        this.garments = garments;
    }

    async getAllUserGarments(userId: string): Promise<any[]> {
        return this.garments;
    }
}

export class MockAIService {
    private explanations: Map<string, string> = new Map();
    callCount: number = 0;

    async generateExplanation(prompt: string): Promise<string> {
        this.callCount++;

        // Validate prompt structure
        if (!prompt.includes('personal stylist')) {
            throw new Error('Invalid prompt structure');
        }

        // Cache check
        const cached = this.explanations.get(prompt);
        if (cached) {
            return cached;
        }

        // Generate deterministic explanation based on prompt hash
        const hash = this.hashString(prompt);
        const words = 80 + (hash % 40); // 80-120 words
        const explanation = `This outfit perfectly balances ${this.getAdjective(hash)} style with practicality. ${this.generateWords(words)}`;

        this.explanations.set(prompt, explanation);
        return explanation;
    }

    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }

    private getAdjective(hash: number): string {
        const adjectives = ['modern', 'classic', 'contemporary', 'elegant', 'sophisticated'];
        return adjectives[hash % adjectives.length];
    }

    private generateWords(count: number): string {
        const filler = 'The color harmony creates visual interest while maintaining sophistication. The silhouette flatters your body type. Perfect for the occasion. ';
        return filler.repeat(Math.ceil(count / 20)).split(' ').slice(0, count).join(' ');
    }

    reset() {
        this.explanations.clear();
        this.callCount = 0;
    }

    getCacheSize(): number {
        return this.explanations.size;
    }
}
