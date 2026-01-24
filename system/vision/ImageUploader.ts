import { FIREBASE_STORAGE, FIREBASE_AUTH } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export class ImageUploader {
    private static instance: ImageUploader;

    private constructor() { }

    public static getInstance(): ImageUploader {
        if (!ImageUploader.instance) {
            ImageUploader.instance = new ImageUploader();
        }
        return ImageUploader.instance;
    }

    public async uploadImage(uri: string): Promise<string | null> {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) {
            console.warn('[ImageUploader] No user logged in. Skipping upload.');
            return null; // Or return local URI if offline-first
        }

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const filename = `garments/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(FIREBASE_STORAGE, `users/${uid}/${filename}`);

            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);

            console.log('[ImageUploader] Upload success:', downloadUrl);
            return downloadUrl;

        } catch (error) {
            console.error('[ImageUploader] Upload failed:', error);
            return null;
        }
    }
}
