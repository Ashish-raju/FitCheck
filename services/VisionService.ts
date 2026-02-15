/**
 * OPENAI VISION SERVICE
 * 
 * Analyzes clothing item photos using GPT-4 Vision API
 * to automatically extract metadata.
 */

import OpenAI from 'openai';
import { getOpenAIApiKey, OPENAI_CONFIG } from '../config/openai';
import { GarmentMeta, OutfitSlot, Season } from '../engine/types';

/**
 * Response from Vision API (raw)
 */
interface VisionAnalysisResponse {
    type: string;
    subtype: string;
    colors: Array<{
        hex: string;
        name: string;
        percentage: number;
    }>;
    pattern: string;
    fabric: string;
    weight: 'light' | 'medium' | 'heavy';
    fit: string;
    formality_range: [number, number];
    style_tags: string[];
    seasons: Record<Season, number>;
    occasions: string[];
    body_flattering: string[];
    description: string;
    confidence: number;
}

/**
 * Analysis prompt for GPT-4 Vision
 */
const ANALYSIS_PROMPT = `Analyze this clothing item photo and extract detailed metadata.

Return a JSON object with the following structure:
{
  "type": "shirt|pants|dress|shoes|jacket|...",
  "subtype": "oxford|polo|t-shirt|chinos|jeans|...",
  "colors": [
    {"hex": "#4A90E2", "name": "sky blue", "percentage": 85},
    {"hex": "#FFFFFF", "name": "white", "percentage": 15}
  ],
  "pattern": "solid|stripe|check|floral|graphic|...",
  "fabric": "cotton|denim|silk|wool|linen|polyester|...",
  "weight": "light|medium|heavy",
  "fit": "slim|regular|oversized|tailored|loose",
  "formality_range": [min, max],  // 1-10 scale (1=gym wear, 10=black tie)
  "style_tags": ["preppy", "casual", "minimalist", "..."],
  "seasons": {
    "summer": 0.9,    // 0-1 score for summer appropriateness
    "winter": 0.3,
    "monsoon": 0.5,
    "transitional": 0.7
  },
  "occasions": ["office", "casual", "date", "party", "gym", "..."],
  "body_flattering": ["rectangle", "hourglass", "pear", "inverted_triangle", "apple"],
  "description": "A natural language description of the item",
  "confidence": 0.92  // 0-1 confidence in the analysis
}

IMPORTANT:
- Be precise with hex colors (use a color picker mentally)
- Consider Indian fashion context (recognize kurtas, sherwanis, salwar kameez, dupattas)
- Formality: 1-3 = very casual, 4-6 = smart casual, 7-8 = business formal, 9-10 = black tie
- Seasons: Consider fabric weight and coverage
- Only return the JSON, no additional text`;

/**
 * OpenAI Vision Service
 */
export class VisionService {
    private static client: OpenAI | null = null;

    /**
     * Get or initialize OpenAI client
     */
    private static getClient(): OpenAI {
        if (!this.client) {
            const apiKey = getOpenAIApiKey();
            this.client = new OpenAI({
                apiKey,
                timeout: OPENAI_CONFIG.TIMEOUTS.VISION_ANALYSIS
            });
        }
        return this.client;
    }

    /**
     * Analyze a garment photo using GPT-4 Vision
     * 
     * @param photoUri - URI of the photo (local file or URL)
     * @returns Extracted garment metadata
     */
    static async analyzeGarmentPhoto(photoUri: string): Promise<Partial<GarmentMeta>> {
        try {
            console.log('[VisionService] Starting analysis for:', photoUri);

            const client = this.getClient();

            // Convert local file URI to base64 if needed
            const imageUrl = await this.prepareImageUrl(photoUri);

            const response = await client.chat.completions.create({
                model: OPENAI_CONFIG.VISION_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: ANALYSIS_PROMPT
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'high'  // High detail for better color detection
                            }
                        }
                    ]
                }],
                max_tokens: 1000,
                temperature: 0.1,  // Low temperature for consistency
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from Vision API');
            }

            const analysis: VisionAnalysisResponse = JSON.parse(content);

            console.log('[VisionService] Analysis complete:', {
                type: analysis.type,
                colors: analysis.colors.length,
                confidence: analysis.confidence
            });

            // Transform to GarmentMeta format
            return this.transformToGarmentMeta(analysis);

        } catch (error) {
            console.error('[VisionService] Analysis failed:', error);

            if (error instanceof Error) {
                if (error.message.includes('rate_limit')) {
                    throw new Error('Daily photo analysis limit reached. Try again tomorrow!');
                } else if (error.message.includes('invalid_api_key')) {
                    throw new Error('Invalid OpenAI API key. Please check your configuration.');
                } else if (error.message.includes('insufficient_quota')) {
                    throw new Error('OpenAI account has insufficient credits.');
                }
            }

            throw new Error('Failed to analyze photo. Please try again or enter details manually.');
        }
    }

    /**
     * Prepare image URL for API
     * Converts local file to base64 data URL if needed
     */
    private static async prepareImageUrl(uri: string): Promise<string> {
        // If already a URL, return as-is
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return uri;
        }

        // For local files, would need to convert to base64
        // For now, assume we're getting URLs from image picker
        return uri;
    }

    /**
     * Transform Vision API response to GarmentMeta format
     */
    private static transformToGarmentMeta(analysis: VisionAnalysisResponse): any {
        const baseMetadata = {
            type: this.mapToOutfitSlot(analysis.type),
            subtype: analysis.subtype,
            colors: analysis.colors.map((c, idx) => ({
                dictColorId: idx + 1,
                hex: c.hex,
                hue: this.hexToHue(c.hex),
                saturation: 70,
                value: 50,
                name: c.name,
                undertone: 'neutral' as const
            })),
            primaryColorHex: analysis.colors[0]?.hex || '#000000',
            pattern: analysis.pattern,
            fabric: analysis.fabric,
            weight: analysis.weight,
            fitType: (analysis.fit === 'slim' || analysis.fit === 'regular' || analysis.fit === 'oversized' || analysis.fit === 'tailored')
                ? analysis.fit
                : 'regular' as const,
            formalityRange: analysis.formality_range,
            seasonScores: analysis.seasons,
            versatility: this.calculateVersatility(analysis),
            bestForBodyTypes: analysis.body_flattering,
            tags: analysis.style_tags,
            // AI-specific metadata  
            aiDescription: analysis.description,
            aiConfidence: analysis.confidence,
            aiAnalyzedAt: Date.now()
        };

        return baseMetadata;
    }

    /**
     * Map type string to OutfitSlot enum
     */
    private static mapToOutfitSlot(type: string): OutfitSlot {
        const typeMap: Record<string, OutfitSlot> = {
            'shirt': OutfitSlot.Top,
            'top': OutfitSlot.Top,
            'blouse': OutfitSlot.Top,
            'pants': OutfitSlot.Bottom,
            'jeans': OutfitSlot.Bottom,
            'trousers': OutfitSlot.Bottom,
            'skirt': OutfitSlot.Bottom,
            'dress': OutfitSlot.OnePiece,
            'jumpsuit': OutfitSlot.OnePiece,
            'shoes': OutfitSlot.Shoes,
            'sneakers': OutfitSlot.Shoes,
            'jacket': OutfitSlot.Layer,
            'blazer': OutfitSlot.Layer,
            'coat': OutfitSlot.Layer,
            'accessory': OutfitSlot.Accessory
        };

        return typeMap[type.toLowerCase()] || OutfitSlot.Top;
    }

    /**
     * Convert hex color to hue (0-360)
     */
    private static hexToHue(hex: string): number {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

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

        return Math.round(hue * 360);
    }

    /**
     * Calculate versatility score based on analysis
     */
    private static calculateVersatility(analysis: VisionAnalysisResponse): number {
        let score = 0.5;  // Base

        // Solid patterns are more versatile
        if (analysis.pattern === 'solid') score += 0.2;

        // Neutral colors are more versatile
        const neutralColors = ['black', 'white', 'gray', 'navy', 'beige', 'brown'];
        if (analysis.colors.some(c => neutralColors.includes(c.name.toLowerCase()))) {
            score += 0.15;
        }

        // Multiple occasions = more versatile
        if (analysis.occasions.length >= 3) score += 0.15;

        return Math.min(1, score);
    }
}
