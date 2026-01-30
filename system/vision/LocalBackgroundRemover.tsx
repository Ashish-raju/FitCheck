import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

interface RemovalResult {
    transparentUri: string;
    width: number;
    height: number;
}

interface ProcessingError {
    code: string;
    message: string;
}

type MessageHandler = (result: RemovalResult) => void;
type ErrorHandler = (error: ProcessingError) => void;
type ProgressHandler = (stage: string) => void;

/**
 * Local background removal using @imgly/background-removal in a WebView
 * Completely free, no API keys required, runs on-device
 */
export class LocalBackgroundRemover {
    private static instance: LocalBackgroundRemover;
    private webViewRef: React.RefObject<WebView> | null = null;
    private isReady = false;
    private queue: Array<{
        imageUri: string;
        onSuccess: MessageHandler;
        onError: ErrorHandler;
        onProgress?: ProgressHandler;
    }> = [];

    private constructor() { }

    public static getInstance(): LocalBackgroundRemover {
        if (!LocalBackgroundRemover.instance) {
            LocalBackgroundRemover.instance = new LocalBackgroundRemover();
        }
        return LocalBackgroundRemover.instance;
    }

    /**
     * Set the WebView reference (called by the WebViewBridge component)
     */
    public setWebViewRef(ref: React.RefObject<WebView>) {
        this.webViewRef = ref;
    }

    /**
     * Mark as ready (called when bridge sends ready message)
     */
    public markReady() {
        this.isReady = true;
        this.processQueue();
    }

    /**
     * Remove background from image
     */
    public async removeBackground(
        imageUri: string,
        onProgress?: ProgressHandler
    ): Promise<RemovalResult> {
        return new Promise((resolve, reject) => {
            const request = {
                imageUri,
                onSuccess: resolve,
                onError: (error: ProcessingError) => reject(new Error(error.message)),
                onProgress
            };

            this.queue.push(request);

            if (this.isReady) {
                this.processQueue();
            }
        });
    }

    /**
     * Process queued requests
     */
    private async processQueue() {
        if (this.queue.length === 0 || !this.isReady || !this.webViewRef?.current) {
            return;
        }

        const request = this.queue.shift();
        if (!request) return;

        try {
            // Read image file as base64
            const base64 = await FileSystem.readAsStringAsync(request.imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Send to WebView bridge
            const message = JSON.stringify({
                type: 'process',
                imageData: `data:image/jpeg;base64,${base64}`
            });

            this.webViewRef.current.postMessage(message);

            // Store current request handlers for the message handler
            this.currentRequest = request;

        } catch (error: any) {
            request.onError({
                code: 'PROCESSING_FAILED',
                message: error.message || 'Failed to read image file'
            });
            this.processQueue(); // Process next in queue
        }
    }

    private currentRequest: {
        imageUri: string;
        onSuccess: MessageHandler;
        onError: ErrorHandler;
        onProgress?: ProgressHandler;
    } | null = null;

    /**
     * Handle message from WebView bridge
     */
    public async handleMessage(event: any) {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'ready') {
                this.markReady();
                console.log('[LocalBackgroundRemover] Bridge ready');
            }
            else if (message.type === 'progress') {
                this.currentRequest?.onProgress?.(message.stage);
            }
            else if (message.type === 'success') {
                if (!this.currentRequest) return;

                // Save the base64 result to a file
                const base64Content = message.data.split(',')[1];
                const filename = `transparent_${Date.now()}.png`;
                const fileUri = `${FileSystem.cacheDirectory}${filename}`;

                await FileSystem.writeAsStringAsync(fileUri, base64Content, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                // Get dimensions
                const { width, height } = await this.getImageDimensions(fileUri);

                this.currentRequest.onSuccess({
                    transparentUri: fileUri,
                    width,
                    height
                });

                this.currentRequest = null;
                this.processQueue(); // Process next in queue
            }
            else if (message.type === 'error') {
                if (!this.currentRequest) return;

                this.currentRequest.onError({
                    code: 'PROCESSING_FAILED',
                    message: message.message || 'Processing failed'
                });

                this.currentRequest = null;
                this.processQueue(); // Process next in queue
            }
        } catch (error: any) {
            console.error('[LocalBackgroundRemover] Message handler error:', error);
            if (this.currentRequest) {
                this.currentRequest.onError({
                    code: 'PROCESSING_FAILED',
                    message: 'Failed to handle response from bridge'
                });
                this.currentRequest = null;
            }
        }
    }

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
                    console.warn('[LocalBackgroundRemover] Failed to get dimensions:', error);
                    resolve({ width: 800, height: 1000 }); // Fallback
                }
            );
        });
    }
}

/**
 * WebView Bridge Component (must be rendered in the app root)
 */
export const BackgroundRemovalBridge: React.FC = () => {
    const webViewRef = useRef<WebView>(null);
    const [htmlUri, setHtmlUri] = React.useState<string | null>(null);

    useEffect(() => {
        // Load HTML asset
        async function loadAsset() {
            try {
                const asset = Asset.fromModule(require('../../assets/bgremoval/index.html'));
                await asset.downloadAsync();
                setHtmlUri(asset.localUri || asset.uri);
            } catch (error) {
                console.error('[BackgroundRemovalBridge] Failed to load HTML asset:', error);
            }
        }
        loadAsset();

        // Register WebView with service
        LocalBackgroundRemover.getInstance().setWebViewRef(webViewRef);
    }, []);

    const handleMessage = (event: any) => {
        LocalBackgroundRemover.getInstance().handleMessage(event);
    };

    if (!htmlUri) return null;

    return (
        <View style={styles.hidden}>
            <WebView
                ref={webViewRef}
                source={{ uri: htmlUri }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                style={styles.webview}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    hidden: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        overflow: 'hidden',
    },
    webview: {
        width: 1,
        height: 1,
    },
});
