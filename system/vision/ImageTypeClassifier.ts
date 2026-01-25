import { ImageType } from './types';
import { Image } from 'react-native';

export class ImageTypeClassifier {
    /**
     * Classifies the image into a category using heuristics.
     * In a real production environment, this would use a lightweight TFJS model.
     * For now, we use aspect ratio and basic heuristics.
     */
    static async classify(uri: string): Promise<ImageType> {
        return new Promise((resolve) => {
            Image.getSize(uri, (width, height) => {
                const aspectRatio = width / height;

                // Heuristic 1: Tall images are often worn body shots or dresses
                if (aspectRatio < 0.6) {
                    // likely full body or long dress
                    resolve(ImageType.WORN);
                    return;
                }

                // Heuristic 2: Square/Wide images are often flat lays or shoes
                if (aspectRatio >= 0.9 && aspectRatio <= 1.3) {
                    // Check if we can infer more? 
                    // Without pixel data, we guess FLAT_LAY as default for square-ish
                    resolve(ImageType.FLAT_LAY);
                    return;
                }

                // Heuristic 3: Very wide images might be shoes
                if (aspectRatio > 1.3) {
                    resolve(ImageType.SHOES_ACCESSORIES);
                    return;
                }

                // Default fallback
                resolve(ImageType.FLAT_LAY);
            }, (_err) => {
                console.warn('Failed to get image size for classification', _err);
                resolve(ImageType.UNKNOWN);
            });
        });
    }
}
