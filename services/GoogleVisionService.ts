/**
 * GOOGLE VISION SERVICE
 * 
 * Analyzes clothing item photos using Google Cloud Vision API
 * Works directly from mobile (no backend needed!)
 */

import { getGoogleVisionApiKey, GOOGLE_VISION_CONFIG } from '../config/googleVision';
import { GarmentMeta, OutfitSlot, Season } from '../engine/types';

/**
 * Google Vision API Response Types
 */
interface ColorInfo {
    color: { red: number; green: number; blue: number };
    score: number;
    pixelFraction: number;
}

interface LabelAnnotation {
    description: string;
    score: number;
}

/**
 * Google Vision Service
 */
export class GoogleVisionService {

    /**
     * Analyze a garment photo using Google Vision API
     * 
     * @param photoUri - Local file URI of the photo
     * @returns Extracted garment metadata
     */
    static async analyzeGarmentPhoto(photoUri: string): Promise<any> {
        try {
            console.log('[GoogleVision] Starting analysis for:', photoUri);

            // Convert image to base64
            const base64Image = await this.convertToBase64(photoUri);

            // Call Google Vision API
            const apiKey = getGoogleVisionApiKey();
            const response = await fetch(
                `${GOOGLE_VISION_CONFIG.API_ENDPOINT}?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [{
                            image: { content: base64Image },
                            features: GOOGLE_VISION_CONFIG.FEATURES
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[GoogleVision] API Request Failed!');
                console.error('[GoogleVision] Status:', response.status);
                console.error('[GoogleVision] Body:', errorText);

                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error && errorJson.error.message) {
                        throw new Error(`Google AI Error: ${errorJson.error.message}`);
                    }
                } catch (e) {
                    // unexpected json format
                }

                throw new Error(`Google Vision API error: ${response.status} - ${errorText.substring(0, 100)}`);
            }

            const data = await response.json();
            const result = data.responses[0];

            if (result.error) {
                throw new Error(result.error.message);
            }

            console.log('[GoogleVision] Analysis complete');

            // Extract metadata
            return this.extractMetadata(result);

        } catch (error) {
            console.error('[GoogleVision] Analysis failed:', error);

            if (error instanceof Error) {
                if (error.message.includes('API_KEY_INVALID')) {
                    throw new Error('Invalid Google Vision API key. Please check your configuration.');
                } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
                    throw new Error('Daily analysis limit reached. Try again tomorrow!');
                }
            }

            throw new Error('Failed to analyze photo. Please try again or enter details manually.');
        }
    }

    /**
     * Convert image URI to base64
     */
    /**
     * Convert image URI to base64 using standard fetch/FileReader
     * This avoids deprecated Expo FileSystem APIs
     */
    private static async convertToBase64(uri: string): Promise<string> {
        try {
            // Remove data URI prefix if present (already base64)
            if (uri.startsWith('data:')) {
                return uri.split(',')[1];
            }

            // Use fetch to get blob
            const response = await fetch(uri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // Remove "data:image/jpeg;base64," prefix
                    const base64 = base64data.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('[GoogleVision] Failed to convert image:', error);
            console.error('[GoogleVision] URI was:', uri);
            throw new Error(`Failed to read image file: ${uri ? uri.substring(0, 50) : 'null'}...`);
        }
    }

    /**
     * Extract metadata from Google Vision response
     */
    private static extractMetadata(result: any): any {
        const labels: LabelAnnotation[] = result.labelAnnotations || [];
        const colors: ColorInfo[] = result.imagePropertiesAnnotation?.dominantColors?.colors || [];

        // Detect item type from labels
        const { type, subtype } = this.detectItemType(labels);

        // Extract dominant colors
        const detectedColors = this.extractColors(colors);

        // Detect pattern from labels
        const pattern = this.detectPattern(labels);

        // Detect fabric from labels
        const fabric = this.detectFabric(labels);

        // Estimate formality
        const formalityRange = this.estimateFormality(labels, type);

        // Extract style tags
        const styleTags = this.extractStyleTags(labels);

        // Generate description
        const description = this.generateDescription(type, subtype, detectedColors, pattern);

        return {
            type,
            subtype,
            colors: detectedColors,
            primaryColorHex: detectedColors[0]?.hex || '#000000',
            pattern,
            fabric,
            weight: 'medium' as const,
            fitType: 'regular' as const,
            formalityRange,
            seasonScores: this.estimateSeasons(fabric, type),
            versatility: this.calculateVersatility(detectedColors, pattern),
            bestForBodyTypes: ['rectangle', 'hourglass', 'pear', 'inverted_triangle', 'apple'],
            tags: styleTags,
            aiDescription: description,
            aiConfidence: labels[0]?.score || 0.7,
            aiAnalyzedAt: Date.now()
        };
    }

    /**
     * Detect item type from labels
     */
    private static detectItemType(labels: LabelAnnotation[]): { type: OutfitSlot; subtype: string } {
        const labelTexts = labels.map(l => l.description.toLowerCase());

        // Check for specific items
        if (labelTexts.some(l => l.includes('shirt') || l.includes('blouse') || l.includes('top'))) {
            const subtype = labelTexts.find(l => l.includes('t-shirt')) ? 't-shirt' :
                labelTexts.find(l => l.includes('polo')) ? 'polo' :
                    labelTexts.find(l => l.includes('button')) ? 'button-down' : 'shirt';
            return { type: OutfitSlot.Top, subtype };
        }

        if (labelTexts.some(l => l.includes('pants') || l.includes('jeans') || l.includes('trousers'))) {
            const subtype = labelTexts.find(l => l.includes('jeans')) ? 'jeans' :
                labelTexts.find(l => l.includes('chinos')) ? 'chinos' : 'pants';
            return { type: OutfitSlot.Bottom, subtype };
        }

        if (labelTexts.some(l => l.includes('dress') || l.includes('gown'))) {
            return { type: OutfitSlot.OnePiece, subtype: 'dress' };
        }

        if (labelTexts.some(l => l.includes('shoe') || l.includes('sneaker') || l.includes('boot'))) {
            const subtype = labelTexts.find(l => l.includes('sneaker')) ? 'sneakers' :
                labelTexts.find(l => l.includes('boot')) ? 'boots' : 'shoes';
            return { type: OutfitSlot.Shoes, subtype };
        }

        if (labelTexts.some(l => l.includes('jacket') || l.includes('coat') || l.includes('blazer'))) {
            const subtype = labelTexts.find(l => l.includes('blazer')) ? 'blazer' :
                labelTexts.find(l => l.includes('jacket')) ? 'jacket' : 'coat';
            return { type: OutfitSlot.Layer, subtype };
        }

        // Default to top
        return { type: OutfitSlot.Top, subtype: labels[0]?.description || 'clothing' };
    }

    /**
     * Extract colors from Google Vision response
     */
    private static extractColors(colors: ColorInfo[]): Array<{ hex: string; name: string; hue: number; saturation: number; value: number; undertone: string; dictColorId: number }> {
        return colors.slice(0, 3).map((colorInfo, idx) => {
            const { red, green, blue } = colorInfo.color;
            const hex = this.rgbToHex(red, green, blue);
            const { hue, saturation, value } = this.rgbToHsv(red, green, blue);
            const name = this.getColorName(hue, saturation, value);

            return {
                hex,
                name,
                hue,
                saturation,
                value,
                undertone: 'neutral',
                dictColorId: idx + 1
            };
        });
    }

    /**
     * Convert RGB to Hex
     */
    private static rgbToHex(r: number, g: number, b: number): string {
        return '#' + [r, g, b]
            .map(x => Math.round(x).toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Convert RGB to HSV
     */
    private static rgbToHsv(r: number, g: number, b: number): { hue: number; saturation: number; value: number } {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let hue = 0;
        if (delta !== 0) {
            if (max === r) {
                hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            } else if (max === g) {
                hue = ((b - r) / delta + 2) / 6;
            } else {
                hue = ((r - g) / delta + 4) / 6;
            }
        }

        const saturation = max === 0 ? 0 : (delta / max) * 100;
        const value = max * 100;

        return {
            hue: Math.round(hue * 360),
            saturation: Math.round(saturation),
            value: Math.round(value)
        };
    }

    /**
     * Get color name from HSV
     */
    private static getColorName(hue: number, saturation: number, value: number): string {
        if (value < 20) return 'black';
        if (saturation < 10) {
            if (value > 90) return 'white';
            if (value > 60) return 'light gray';
            return 'gray';
        }

        if (hue < 15) return 'red';
        if (hue < 45) return 'orange';
        if (hue < 75) return 'yellow';
        if (hue < 150) return 'green';
        if (hue < 210) return 'cyan';
        if (hue < 270) return 'blue';
        if (hue < 330) return 'purple';
        return 'red';
    }

    /**
     * Detect pattern from labels
     */
    private static detectPattern(labels: LabelAnnotation[]): string {
        const labelTexts = labels.map(l => l.description.toLowerCase());

        if (labelTexts.some(l => l.includes('stripe'))) return 'striped';
        if (labelTexts.some(l => l.includes('plaid') || l.includes('check'))) return 'checked';
        if (labelTexts.some(l => l.includes('floral') || l.includes('flower'))) return 'floral';
        if (labelTexts.some(l => l.includes('dot') || l.includes('polka'))) return 'dotted';
        if (labelTexts.some(l => l.includes('print') || l.includes('pattern'))) return 'printed';

        return 'solid';
    }

    /**
     * Detect fabric from labels
     */
    private static detectFabric(labels: LabelAnnotation[]): string {
        const labelTexts = labels.map(l => l.description.toLowerCase());

        if (labelTexts.some(l => l.includes('denim') || l.includes('jean'))) return 'denim';
        if (labelTexts.some(l => l.includes('cotton'))) return 'cotton';
        if (labelTexts.some(l => l.includes('silk'))) return 'silk';
        if (labelTexts.some(l => l.includes('wool'))) return 'wool';
        if (labelTexts.some(l => l.includes('leather'))) return 'leather';
        if (labelTexts.some(l => l.includes('linen'))) return 'linen';

        return 'cotton'; // Default
    }

    /**
     * Estimate formality from labels and type
     */
    private static estimateFormality(labels: LabelAnnotation[], type: OutfitSlot): [number, number] {
        const labelTexts = labels.map(l => l.description.toLowerCase());

        if (labelTexts.some(l => l.includes('formal') || l.includes('suit') || l.includes('blazer'))) {
            return [7, 9];
        }
        if (labelTexts.some(l => l.includes('casual') || l.includes('t-shirt') || l.includes('jeans'))) {
            return [2, 4];
        }
        if (type === OutfitSlot.Shoes) {
            if (labelTexts.some(l => l.includes('sneaker'))) return [2, 4];
            if (labelTexts.some(l => l.includes('boot') || l.includes('loafer'))) return [5, 7];
        }

        return [4, 6]; // Smart casual default
    }

    /**
     * Extract style tags from labels
     */
    private static extractStyleTags(labels: LabelAnnotation[]): string[] {
        const tags: string[] = [];
        const labelTexts = labels.map(l => l.description.toLowerCase());

        if (labelTexts.some(l => l.includes('casual'))) tags.push('casual');
        if (labelTexts.some(l => l.includes('formal'))) tags.push('formal');
        if (labelTexts.some(l => l.includes('sport'))) tags.push('athletic');
        if (labelTexts.some(l => l.includes('vintage'))) tags.push('vintage');
        if (labelTexts.some(l => l.includes('modern'))) tags.push('modern');

        return tags.length > 0 ? tags : ['casual'];
    }

    /**
     * Estimate seasons based on fabric and type
     */
    private static estimateSeasons(fabric: string, type: OutfitSlot): Record<Season, number> {
        const seasons: Record<Season, number> = {
            summer: 0.5,
            winter: 0.5,
            monsoon: 0.5,
            transitional: 0.7
        };

        // Heavy fabrics
        if (['wool', 'leather', 'velvet'].includes(fabric)) {
            seasons.winter = 0.9;
            seasons.summer = 0.2;
        }

        // Light fabrics
        if (['cotton', 'linen', 'silk'].includes(fabric)) {
            seasons.summer = 0.9;
            seasons.winter = 0.4;
        }

        return seasons;
    }

    /**
     * Calculate versatility score
     */
    private static calculateVersatility(colors: any[], pattern: string): number {
        let score = 0.5;

        if (pattern === 'solid') score += 0.2;

        const neutralColors = ['black', 'white', 'gray', 'navy', 'beige'];
        if (colors.some(c => neutralColors.includes(c.name.toLowerCase()))) {
            score += 0.15;
        }

        return Math.min(1, score);
    }

    /**
     * Generate natural language description
     */
    private static generateDescription(type: string, subtype: string, colors: any[], pattern: string): string {
        const colorName = colors[0]?.name || 'colored';
        return `${colorName.charAt(0).toUpperCase() + colorName.slice(1)} ${pattern} ${subtype}`;
    }
}
