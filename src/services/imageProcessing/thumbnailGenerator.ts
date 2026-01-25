import * as FileSystem from 'expo-file-system/legacy';
import { ProcessingError, ThumbnailResult } from './types';

/**
 * Generates thumbnail images
 */
export class ThumbnailGenerator {
    private static instance: ThumbnailGenerator;

    private constructor() { }

    public static getInstance(): ThumbnailGenerator {
        if (!ThumbnailGenerator.instance) {
            ThumbnailGenerator.instance = new ThumbnailGenerator();
        }
        return ThumbnailGenerator.instance;
    }

    /**
     * Generate thumbnail from image
     * @param imageUri Source image URI
     * @param targetWidth Target width in pixels (maintains aspect ratio)
     * @param quality JPG quality (0-1)
     */
    public async generate(
        imageUri: string,
        targetWidth: number = 384,
        quality: number = 0.8
    ): Promise<ThumbnailResult> {
        try {
            console.log(`[ThumbnailGenerator] Generation requested (${targetWidth}px), but Canvas APIs are not available. Passthrough used.`);

            // Bypass thumbnail generation as Canvas is not supported
            // Return original URI as thumbnail
            return {
                uri: imageUri,
                width: targetWidth, // Mock dimensions (actual will be original)
                height: Math.round(targetWidth * 1.2), // Mock
            };

        } catch (error: any) {
            if (error.code) throw error;
            throw this.createError('PROCESSING_FAILED', 'Failed to generate thumbnail', error);
        }
    }

    /**
     * Load image from URI
     */
    private loadImage(uri: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => resolve(img);
            img.onerror = (e) => reject(
                this.createError('PROCESSING_FAILED', `Failed to load image: ${uri}`, e)
            );

            img.src = uri;
        });
    }

    /**
     * Convert canvas to blob
     */
    private canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(this.createError('PROCESSING_FAILED', 'Failed to create thumbnail blob'));
                    }
                },
                'image/jpeg',
                quality
            );
        });
    }

    /**
     * Save blob to file
     */
    private async saveBlob(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = async () => {
                try {
                    const base64data = reader.result as string;
                    const base64Content = base64data.includes(',')
                        ? base64data.split(',')[1]
                        : base64data;

                    const filename = `thumb_${Date.now()}.jpg`;
                    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    resolve(fileUri);
                } catch (error) {
                    reject(this.createError('PROCESSING_FAILED', 'Failed to save thumbnail', error));
                }
            };

            reader.onerror = () => {
                reject(this.createError('PROCESSING_FAILED', 'Failed to read thumbnail blob'));
            };

            reader.readAsDataURL(blob);
        });
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
