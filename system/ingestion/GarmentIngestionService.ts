import { ImageUploader } from '../vision/ImageUploader';
import { TaggingService } from '../vision/TaggingService';
import { BackgroundRemovalService } from '../vision/BackgroundRemovalService';
import { InventoryStore } from '../../state/inventory/inventoryStore';

export class GarmentIngestionService {
    private static instance: GarmentIngestionService;

    private constructor() { }

    public static getInstance(): GarmentIngestionService {
        if (!GarmentIngestionService.instance) {
            GarmentIngestionService.instance = new GarmentIngestionService();
        }
        return GarmentIngestionService.instance;
    }

    /**
     * Orchestrates the full ingestion flow:
     * 1. Upload to Cloud (if needed)
     * 2. Tag content
     * 3. Remove Background
     * 4. Check Duplicate
     * 5. Add to Inventory
     */
    public async ingestFromUri(localUri: string): Promise<void> {
        console.log('[GarmentIngestionService] Starting ingestion for:', localUri);

        // 1. Cloud Upload
        const taggingService = TaggingService.getInstance();
        const bgService = BackgroundRemovalService.getInstance();
        const uploader = ImageUploader.getInstance();

        // Run Cloud Upload, Background Removal, and Tagging in PARALLEL
        const [cloudUrl, processedUri, tags] = await Promise.all([
            uploader.uploadImage(localUri),
            bgService.removeBackground(localUri).then(res => res || undefined),
            taggingService.tagImage(localUri)
        ]);

        const finalUri = cloudUrl || localUri;

        // 4. Duplicate Check (Non-blocking)
        taggingService.isDuplicate(finalUri).catch(e => console.warn('Duplicate check failed', e));

        // 5. Add to Inventory
        InventoryStore.getInstance().addPiece({
            id: ('GARMENT_' + Date.now()) as any,
            category: tags.category,
            color: tags.color,
            imageUri: finalUri,
            processedImageUri: processedUri,
            status: 'Clean',
            currentUses: 0,
            maxUses: 3,
            warmth: 0.5,
            formality: 0.5
        });

        console.log('[GarmentIngestionService] Ingestion complete.');
    }
}
