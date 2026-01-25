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

    /**
     * Creates a draft item for preview without saving to inventory
     * Uses the new image processing engine for background removal + white bg
     */
    public async createDraftItem(
        localUri: string,
        onProgress?: (progress: 'preparing' | 'removingBackground' | 'finishing' | 'saving') => void
    ): Promise<any> {
        console.log('[GarmentIngestionService] Creating draft item for:', localUri);

        const taggingService = TaggingService.getInstance();

        // Import the new image processing engine
        const { ItemImageEngine } = await import('../../src/services/imageProcessing/itemImageEngine');
        const imageEngine = ItemImageEngine.getInstance();

        try {
            // Run Image Processing and Tagging in PARALLEL
            const [processingResult, tags] = await Promise.all([
                imageEngine.processItemImage(localUri, {
                    whiteBg: true,
                    thumbnailWidth: 384,
                    keepTransparent: true,
                }, onProgress),
                taggingService.tagImage(localUri)
            ]);

            // Create draft piece object with enhanced metadata
            const draftPiece = {
                id: ('DRAFT_' + Date.now()) as any,
                category: tags.category,
                color: tags.color,
                imageUri: processingResult.processedUri, // Firebase URL of white bg image
                processedImageUri: processingResult.processedUri,
                thumbnailUri: processingResult.thumbUri,
                transparentUri: processingResult.transparentUri,
                status: 'Clean' as const,
                currentUses: 0,
                maxUses: 3,
                warmth: 0.5,
                formality: 0.5,
                dateAdded: Date.now(),
                name: `${tags.color || ''} ${tags.category}`.trim() || 'New Item',
                processingMetadata: {
                    processingTimeMs: processingResult.processingTimeMs,
                    width: processingResult.width,
                    height: processingResult.height,
                    fileSize: processingResult.fileSize,
                    confidenceScore: processingResult.confidenceScore,
                    validationIssues: processingResult.validationIssues
                }
            };

            console.log('[GarmentIngestionService] Draft item created:', draftPiece.id);
            console.log(`[GarmentIngestionService] Processing took ${processingResult.processingTimeMs}ms`);

            return draftPiece;

        } catch (error: any) {
            console.error('[GarmentIngestionService] Draft creation failed:', error);

            // Provide user-friendly error messages
            if (error.code === 'API_KEY_INVALID') {
                throw new Error('Background removal service is not configured. Please contact support.');
            } else if (error.code === 'API_RATE_LIMIT') {
                throw new Error('Too many requests. Please try again in a few minutes.');
            } else if (error.code === 'FILE_TOO_LARGE') {
                throw new Error('Image is too large. Please use a smaller image.');
            } else if (error.code === 'CANCELLED') {
                throw new Error('Processing was cancelled.');
            }

            // Generic error
            throw new Error('Failed to process image. Please try again.');
        }
    }
}
