export interface GarmentTags {
    category: 'Top' | 'Bottom' | 'Shoes' | 'Outerwear' | 'Accessory';
    color: string;
    confidence: number;
}

export class TaggingService {
    private static instance: TaggingService;

    private constructor() { }

    public static getInstance(): TaggingService {
        if (!TaggingService.instance) {
            TaggingService.instance = new TaggingService();
        }
        return TaggingService.instance;
    }

    /**
     * Simulates on-device ML tagging.
     * In a real app, this would use TensorFlow Lite or CoreML.
     */
    public async tagImage(uri: string): Promise<GarmentTags> {
        console.log(`[TaggingService] Analyzing image: ${uri}`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock logic: Random tags based on URI hash or just random
        const categories: GarmentTags['category'][] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];
        const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

        return {
            category: categories[Math.floor(Math.random() * categories.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            confidence: 0.85 + Math.random() * 0.1
        };
    }

    /**
     * Simulates deduplication (Visual Hash comparison)
     */
    public async isDuplicate(uri: string): Promise<boolean> {
        // Mock: 10% chance of being a duplicate
        return Math.random() < 0.1;
    }
}
