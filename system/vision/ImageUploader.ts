import { FIREBASE_STORAGE, FIREBASE_AUTH } from '../firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number; // 0-100
}

export class ImageUploader {
    private static instance: ImageUploader;

    private constructor() { }

    public static getInstance(): ImageUploader {
        if (!ImageUploader.instance) {
            ImageUploader.instance = new ImageUploader();
        }
        return ImageUploader.instance;
    }

    /**
     * Upload image with progress tracking
     */
    public async uploadWithProgress(
        uri: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string | null> {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) {
            console.warn('[ImageUploader] No user logged in. Skipping upload.');
            return null;
        }

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const filename = `garments/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = FIREBASE_STORAGE.ref(`users/${uid}/${filename}`);

            // Create upload task for progress tracking
            const uploadTask = storageRef.put(blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Progress callback
                        const progress: UploadProgress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                        };
                        onProgress?.(progress);
                    },
                    (error) => {
                        // Error callback
                        console.error('[ImageUploader] Upload failed:', error);
                        reject(error);
                    },
                    async () => {
                        // Success callback
                        try {
                            const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('[ImageUploader] Upload success:', downloadUrl);
                            resolve(downloadUrl);
                        } catch (error) {
                            console.error('[ImageUploader] Failed to get download URL:', error);
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('[ImageUploader] Upload failed:', error);
            return null;
        }
    }

    /**
     * Upload image (simple version without progress)
     */
    public async uploadImage(uri: string): Promise<string | null> {
        return this.uploadWithProgress(uri);
    }

    /**
     * Delete image from storage
     */
    public async deleteImage(imageUrl: string): Promise<void> {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) {
            console.warn('[ImageUploader] No user logged in. Skipping delete.');
            return;
        }

        try {
            // Extract path from URL
            const storageRef = FIREBASE_STORAGE.refFromURL(imageUrl);
            await storageRef.delete();
            console.log('[ImageUploader] Deleted image:', imageUrl);
        } catch (error) {
            console.error('[ImageUploader] Delete failed:', error);
            throw error;
        }
    }

    /**
     * Delete image by path
     */
    public async deleteImageByPath(path: string): Promise<void> {
        try {
            const storageRef = FIREBASE_STORAGE.ref(path);
            await storageRef.delete();
            console.log('[ImageUploader] Deleted image at path:', path);
        } catch (error) {
            console.error('[ImageUploader] Delete by path failed:', error);
            throw error;
        }
    }

    /**
     * Upload with retry logic
     */
    public async uploadWithRetry(
        uri: string,
        maxRetries: number = 3,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string | null> {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[ImageUploader] Upload attempt ${attempt}/${maxRetries}`);
                const url = await this.uploadWithProgress(uri, onProgress);
                return url;
            } catch (error) {
                lastError = error;
                console.warn(`[ImageUploader] Attempt ${attempt} failed:`, error);

                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.error('[ImageUploader] All retry attempts failed:', lastError);
        return null;
    }
}
