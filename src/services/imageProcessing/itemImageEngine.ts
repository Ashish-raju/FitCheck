import * as FileSystem from 'expo-file-system/legacy';
import { RemoveBgClient } from './removeBgClient';
import { SegmentationPipeline } from '../../../system/vision/SegmentationPipeline';
import { WhiteBackgroundCompositor } from './compositor';
import { ThumbnailGenerator } from './thumbnailGenerator';
import { ImageUploader } from '../../../system/vision/ImageUploader';
import {
    ProcessingOptions,
    ProcessingResult,
    ProcessingProgress,
    ProcessingError
} from './types';

/**
 * Main orchestrator for item image processing pipeline
 */
export class ItemImageEngine {
    private static instance: ItemImageEngine;
    private isCancelled = false;

    private constructor() { }

    public static getInstance(): ItemImageEngine {
        if (!ItemImageEngine.instance) {
            ItemImageEngine.instance = new ItemImageEngine();
        }
        return ItemImageEngine.instance;
    }

    /**
     * Process item image: remove background, add white bg, generate thumbnail, upload to Firebase
     * 
     * @param inputUri Local URI of the captured/selected image
     * @param options Processing options
     * @param onProgress Optional callback for progress updates
     * @returns Processing result with all URIs and metadata
     */
    public async processItemImage(
        inputUri: string,
        options: ProcessingOptions = {},
        onProgress?: (progress: ProcessingProgress) => void
    ): Promise<ProcessingResult> {
        const startTime = Date.now();
        this.isCancelled = false;

        // Default options
        const opts: Required<ProcessingOptions> = {
            whiteBg: options.whiteBg !== false,
            thumbnailWidth: options.thumbnailWidth || 384,
            keepTransparent: options.keepTransparent !== false,
            maxFileSizeMB: options.maxFileSizeMB || 6,
            jpgQuality: options.jpgQuality || 0.85,
        };

        console.log('[ItemImageEngine] Starting processing pipeline...');

        // Temporary file URIs for cleanup
        const tempFiles: string[] = [];

        try {
            // ========================================
            // STAGE 1: PREPARING
            // ========================================
            onProgress?.('preparing');
            this.checkCancelled();

            // Validate input
            const fileInfo = await FileSystem.getInfoAsync(inputUri);
            if (!fileInfo.exists) {
                throw this.createError('FILE_NOT_FOUND', `Input file not found: ${inputUri}`);
            }

            // STYLE 2: REMOVING BACKGROUND WITH PIPELINE
            // ========================================
            onProgress?.('removingBackground');
            this.checkCancelled();

            const pipeline = SegmentationPipeline.getInstance();
            const segmentationResult = await pipeline.processImage(inputUri);

            const { maskUri: transparentUri, width, height, confidenceScore, validationIssues, imageType, failureReason } = segmentationResult;

            if (!transparentUri) {
                // Determine error based on reason
                throw this.createError('PROCESSING_FAILED', failureReason || 'Segmentation failed');
            }

            tempFiles.push(transparentUri);

            console.log(`[ItemImageEngine] Background removed. Dimensions: ${width}x${height}, Confidence: ${confidenceScore}, Type: ${imageType}`);

            // ========================================
            // STAGE 3: FINISHING (Composite + Thumbnail)
            // ========================================
            onProgress?.('finishing');
            this.checkCancelled();

            // Composite onto white background
            let processedLocalUri: string;
            if (opts.whiteBg) {
                const compositor = WhiteBackgroundCompositor.getInstance();
                processedLocalUri = await compositor.composite(
                    transparentUri,
                    width,
                    height,
                    opts.jpgQuality
                );
                tempFiles.push(processedLocalUri);
            } else {
                // If no white bg requested, use transparent as processed
                processedLocalUri = transparentUri;
            }

            this.checkCancelled();

            // Generate thumbnail from processed image
            const thumbnailGen = ThumbnailGenerator.getInstance();
            const { uri: thumbLocalUri } = await thumbnailGen.generate(
                processedLocalUri,
                opts.thumbnailWidth,
                0.8
            );
            tempFiles.push(thumbLocalUri);

            console.log('[ItemImageEngine] Compositing and thumbnail generation complete');

            // ========================================
            // STAGE 4: SAVING (Upload to Firebase)
            // ========================================
            onProgress?.('saving');
            this.checkCancelled();

            const uploader = ImageUploader.getInstance();

            // Upload all files in parallel
            const uploadPromises: Promise<string | null>[] = [
                uploader.uploadImage(processedLocalUri),
                uploader.uploadImage(thumbLocalUri),
            ];

            if (opts.keepTransparent) {
                uploadPromises.push(uploader.uploadImage(transparentUri));
            }

            let [processedUrl, thumbUrl, transparentUrl] = await Promise.all(uploadPromises);

            if (!processedUrl || !thumbUrl) {
                // FALLBACK: If upload fails (e.g. offline/no auth), use local URIs
                console.warn('[ItemImageEngine] Upload failed - falling back to local URIs (Offline Mode)');
                processedUrl = processedUrl || processedLocalUri;
                thumbUrl = thumbUrl || thumbLocalUri;
                transparentUrl = transparentUrl || transparentUri;

                // PREVENT CLEANUP: We need these files since they are now the primary URIs
                const index = tempFiles.indexOf(processedLocalUri);
                if (index > -1) tempFiles.splice(index, 1);
                const indexThumb = tempFiles.indexOf(thumbLocalUri);
                if (indexThumb > -1) tempFiles.splice(indexThumb, 1);
                const indexTrans = tempFiles.indexOf(transparentUri);
                if (indexTrans > -1) tempFiles.splice(indexTrans, 1);
            }

            // Get file size of processed image
            const processedFileInfo = await FileSystem.getInfoAsync(processedLocalUri);
            const fileSize = (processedFileInfo.exists && 'size' in processedFileInfo)
                ? processedFileInfo.size || 0
                : 0;

            // Calculate total processing time
            const processingTimeMs = Date.now() - startTime;

            console.log(`[ItemImageEngine] Processing complete in ${processingTimeMs}ms`);

            onProgress?.('complete');

            // Build result
            const result: ProcessingResult = {
                processedUri: processedUrl,
                thumbUri: thumbUrl,
                transparentUri: transparentUrl || undefined,
                width,
                height,
                fileSize,
                processingTimeMs,
                confidenceScore,
                validationIssues,
                imageType
            };

            return result;

        } catch (error: any) {
            console.error('[ItemImageEngine] Processing failed:', error);

            // Re-throw if already a ProcessingError
            if (error.code) {
                throw error;
            }

            // Wrap in ProcessingError
            throw this.createError('PROCESSING_FAILED', 'Image processing failed', error);

        } finally {
            // Cleanup temporary files
            await this.cleanupTempFiles(tempFiles);
        }
    }

    /**
     * Cancel ongoing processing
     */
    public cancel(): void {
        console.log('[ItemImageEngine] Cancelling processing...');
        this.isCancelled = true;

        // Cancel remove.bg request if ongoing
        RemoveBgClient.getInstance().cancel();
    }

    /**
     * Check if processing was cancelled
     */
    private checkCancelled(): void {
        if (this.isCancelled) {
            throw this.createError('CANCELLED', 'Processing was cancelled');
        }
    }

    /**
     * Cleanup temporary files
     */
    private async cleanupTempFiles(files: string[]): Promise<void> {
        console.log(`[ItemImageEngine] Cleaning up ${files.length} temporary files...`);

        await Promise.all(
            files.map(async (fileUri) => {
                try {
                    const info = await FileSystem.getInfoAsync(fileUri);
                    if (info.exists) {
                        await FileSystem.deleteAsync(fileUri, { idempotent: true });
                    }
                } catch (error) {
                    // Ignore cleanup errors
                    console.warn(`[ItemImageEngine] Failed to cleanup ${fileUri}:`, error);
                }
            })
        );
    }

    /**
     * Create typed error
     */
    private createError(
        code: ProcessingError['code'],
        message: string,
        originalError?: any
    ): ProcessingError {
        const error = new Error(message) as ProcessingError;
        error.code = code;
        error.originalError = originalError;
        return error;
    }
}
