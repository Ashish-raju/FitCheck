import * as FileSystem from 'expo-file-system/legacy';
import { ProcessingError, RemoveBgResponse } from './types';

// API Configuration
const REMOVE_BG_API_KEY = 'MOCK';
const API_URL = 'https://api.remove.bg/v1.0/removebg';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

/**
 * Enhanced remove.bg API client with validation, retry logic, and error handling
 */
export class RemoveBgClient {
    private static instance: RemoveBgClient;
    private abortController?: AbortController;

    private constructor() { }

    public static getInstance(): RemoveBgClient {
        if (!RemoveBgClient.instance) {
            RemoveBgClient.instance = new RemoveBgClient();
        }
        return RemoveBgClient.instance;
    }

    /**
     * Remove background from image with retry logic
     */
    public async removeBackground(
        imageUri: string,
        maxFileSizeMB: number = 6
    ): Promise<RemoveBgResponse> {
        // Validate API key
        if (!REMOVE_BG_API_KEY) {
            throw this.createError(
                'API_KEY_INVALID',
                'Remove.bg API key is not configured'
            );
        }

        // Validate input file
        await this.validateInput(imageUri, maxFileSizeMB);

        // Attempt with retries
        let lastError: any;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[RemoveBgClient] Attempt ${attempt}/${MAX_RETRIES}`);
                return await this.executeRequest(imageUri);
            } catch (error: any) {
                lastError = error;

                // Don't retry on certain errors (these are user/config errors, not transient)
                if (
                    error.code === 'API_KEY_INVALID' ||
                    error.code === 'INVALID_INPUT' ||
                    error.code === 'CANCELLED' ||
                    error.code === 'API_UNKNOWN_FOREGROUND' // No cloth found - user error
                ) {
                    throw error;
                }

                console.warn(`[RemoveBgClient] Attempt ${attempt} failed:`, error.message);

                // Exponential backoff before retry
                if (attempt < MAX_RETRIES) {
                    const backoffMs = Math.pow(2, attempt) * 1000;
                    await this.delay(backoffMs);
                }
            }
        }

        // All retries failed
        throw lastError || this.createError('PROCESSING_FAILED', 'All retry attempts failed');
    }

    /**
     * Cancel any ongoing request
     */
    public cancel(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = undefined;
        }
    }

    /**
     * Validate input image
     */
    private async validateInput(imageUri: string, maxFileSizeMB: number): Promise<void> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);

            if (!fileInfo.exists) {
                throw this.createError('FILE_NOT_FOUND', `Image file not found: ${imageUri}`);
            }

            // Check file size
            if (fileInfo.size && fileInfo.size > maxFileSizeMB * 1024 * 1024) {
                throw this.createError(
                    'FILE_TOO_LARGE',
                    `Image size ${(fileInfo.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${maxFileSizeMB}MB`
                );
            }
        } catch (error: any) {
            if (error.code) throw error; // Already a ProcessingError
            throw this.createError('INVALID_INPUT', 'Failed to validate input file', error);
        }
    }

    /**
     * Execute remove.bg API request
     */
    private async executeRequest(imageUri: string): Promise<RemoveBgResponse> {
        // Create abort controller for this request
        this.abortController = new AbortController();

        // Set timeout
        const timeoutId = setTimeout(() => {
            this.abortController?.abort();
        }, REQUEST_TIMEOUT_MS);

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('size', 'auto');

            const imageFile = {
                uri: imageUri,
                name: 'image.jpg',
                type: 'image/jpeg',
            } as any;

            formData.append('image_file', imageFile);

            // MOCK MODE: Bypass API if key is 'MOCK'
            if ((REMOVE_BG_API_KEY as string) === 'MOCK') {
                console.log('[RemoveBgClient] Using MOCK response to bypass rate limit');
                await this.delay(1000);
                // Return original URI as "transparent" one for now
                // Ideally we'd copy it to cache dir
                const mockUri = imageUri;
                const { width, height } = await this.getImageDimensions(imageUri);
                return { transparentUri: mockUri, width, height };
            }

            // Make request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-Api-Key': REMOVE_BG_API_KEY,
                },
                body: formData,
                signal: this.abortController.signal,
            });

            clearTimeout(timeoutId);

            // Handle errors
            if (!response.ok) {
                await this.handleApiError(response);
            }

            // Process response
            const blob = await response.blob();
            const transparentUri = await this.saveBlob(blob);

            // Get image dimensions
            const { width, height } = await this.getImageDimensions(transparentUri);

            console.log('[RemoveBgClient] Background removed successfully');
            return { transparentUri, width, height };

        } catch (error: any) {
            clearTimeout(timeoutId);

            // Handle abort
            if (error.name === 'AbortError') {
                throw this.createError('CANCELLED', 'Request was cancelled');
            }

            // Handle network errors
            if (error.message?.includes('Network')) {
                throw this.createError('API_NETWORK_ERROR', 'Network error during API request', error);
            }

            throw error;
        } finally {
            this.abortController = undefined;
        }
    }

    /**
     * Handle API error responses
     */
    private async handleApiError(response: Response): Promise<never> {
        const errorText = await response.text();

        if (response.status === 403) {
            throw this.createError('API_KEY_INVALID', 'Invalid remove.bg API key');
        }

        if (response.status === 429) {
            throw this.createError('API_RATE_LIMIT', 'Rate limit exceeded. Please try again later.');
        }

        if (response.status === 400 && errorText.includes('unknown_foreground')) {
            throw this.createError(
                'API_UNKNOWN_FOREGROUND',
                'Could not identify foreground object in image'
            );
        }

        throw this.createError(
            'PROCESSING_FAILED',
            `API request failed: ${response.status} - ${errorText}`
        );
    }

    /**
     * Save blob to local file
     */
    private async saveBlob(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = async () => {
                try {
                    const base64data = reader.result as string;
                    if (!base64data || typeof base64data !== 'string') {
                        reject(this.createError('PROCESSING_FAILED', 'Invalid blob data'));
                        return;
                    }

                    // Remove data header if present
                    const base64Content = base64data.includes(',')
                        ? base64data.split(',')[1]
                        : base64data;

                    const filename = `transparent_${Date.now()}.png`;
                    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    resolve(fileUri);
                } catch (error) {
                    reject(this.createError('PROCESSING_FAILED', 'Failed to save image', error));
                }
            };

            reader.onerror = () => {
                reject(this.createError('PROCESSING_FAILED', 'Failed to read blob'));
            };

            reader.readAsDataURL(blob);
        });
    }

    /**
     * Get image dimensions
     */
    /**
     * Get image dimensions
     */
    private async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve) => {
            const { Image } = require('react-native');
            Image.getSize(
                uri,
                (width: number, height: number) => {
                    resolve({ width, height });
                },
                (error: any) => {
                    console.warn('[RemoveBgClient] Failed to get dimensions:', error);
                    resolve({ width: 800, height: 1000 }); // Fallback
                }
            );
        });
    }

    /**
     * Create typed error
     */
    private createError(code: ProcessingError['code'], message: string, originalError?: any): ProcessingError {
        const error = new Error(message) as ProcessingError;
        error.code = code;
        error.originalError = originalError;
        return error;
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
