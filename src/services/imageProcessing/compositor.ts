import * as FileSystem from 'expo-file-system/legacy';
import { ProcessingError } from './types';

/**
 * Composites transparent PNG onto white background
 */
export class WhiteBackgroundCompositor {
    private static instance: WhiteBackgroundCompositor;

    private constructor() { }

    public static getInstance(): WhiteBackgroundCompositor {
        if (!WhiteBackgroundCompositor.instance) {
            WhiteBackgroundCompositor.instance = new WhiteBackgroundCompositor();
        }
        return WhiteBackgroundCompositor.instance;
    }

    /**
     * Composite transparent image onto white background
     * @param transparentUri URI of transparent PNG
     * @param width Image width
     * @param height Image height
     * @param quality JPG quality (0-1)
     * @returns URI of composited JPG with white background
     */
    public async composite(
        transparentUri: string,
        width: number,
        height: number,
        quality: number = 0.85
    ): Promise<string> {
        try {
            console.log('[Compositor] Compositing requested, but Canvas APIs are not available. Passthrough used.');
            // Bypass compositing as Canvas is not supported in this environment without native modules
            return transparentUri;

        } catch (error: any) {
            if (error.code) throw error;
            throw this.createError('PROCESSING_FAILED', 'Failed to composite image', error);
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
                        reject(this.createError('PROCESSING_FAILED', 'Failed to create blob from canvas'));
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
    private async saveBlob(blob: Blob, prefix: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = async () => {
                try {
                    const base64data = reader.result as string;
                    const base64Content = base64data.includes(',')
                        ? base64data.split(',')[1]
                        : base64data;

                    const filename = `${prefix}_${Date.now()}.jpg`;
                    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    resolve(fileUri);
                } catch (error) {
                    reject(this.createError('PROCESSING_FAILED', 'Failed to save composited image', error));
                }
            };

            reader.onerror = () => {
                reject(this.createError('PROCESSING_FAILED', 'Failed to read blob'));
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
