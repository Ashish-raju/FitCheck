import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// In a real production app, this should be in an environment variable.
// For this prototype, we are using the key provided by the user.
const REMOVE_BG_API_KEY = 'd4BsDbV4196ubyvqVS4uFyjV';
const API_URL = 'https://api.remove.bg/v1.0/removebg';

export class BackgroundRemovalService {
    private static instance: BackgroundRemovalService;

    private constructor() { }

    public static getInstance(): BackgroundRemovalService {
        if (!BackgroundRemovalService.instance) {
            BackgroundRemovalService.instance = new BackgroundRemovalService();
        }
        return BackgroundRemovalService.instance;
    }

    /**
     * Removes background from an image using remove.bg API.
     * Returns the URI of the processed image (locally saved), or null if failed/skipped.
     */
    public async removeBackground(imageUri: string): Promise<string | null> {
        console.log(`[BackgroundRemovalService] Processing: ${imageUri}`);

        if (!REMOVE_BG_API_KEY) {
            console.warn('[BackgroundRemovalService] No API Key. Skipping background removal.');
            return null;
        }

        try {
            // 1. Prepare form data
            const formData = new FormData();
            formData.append('size', 'auto');

            // Handle different URI formats
            const imageFile = {
                uri: imageUri,
                name: 'image.jpg',
                type: 'image/jpeg',
            } as any;

            formData.append('image_file', imageFile);

            // 2. Call API with Timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-Api-Key': REMOVE_BG_API_KEY,
                },
                body: formData,
                signal: controller.signal as any
            }).finally(() => clearTimeout(timeoutId));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[BackgroundRemovalService] API Error:', response.status, errorText);
                return null;
            }

            // 3. Save result
            const blob = await response.blob();

            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    if (!base64data || typeof base64data !== 'string') {
                        console.error('[BackgroundRemovalService] Invalid base64 data');
                        resolve(null);
                        return;
                    }

                    // Remove data header if present
                    const base64Content = base64data.includes(',') ? base64data.split(',')[1] : base64data;

                    const filename = `processed_${Date.now()}.png`;
                    // Use cache directory for reliable write access
                    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                    try {
                        await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        console.log('[BackgroundRemovalService] Saved processed image:', fileUri);
                        resolve(fileUri);
                    } catch (fsError) {
                        console.error('[BackgroundRemovalService] FS Write Error:', fsError);
                        resolve(null);
                    }
                };
                reader.onerror = (e) => {
                    console.error('[BackgroundRemovalService] Reader Error:', e);
                    resolve(null);
                }
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('[BackgroundRemovalService] Exception:', error);
            return null;
        }
    }
}
