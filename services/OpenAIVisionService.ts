/**
 * OPENAI VISION SERVICE
 * 
 * Uses GPT-4o to analyze clothing with human-level understanding.
 * Far superior to Google Vision for patterns, styles, and details.
 */

import { GarmentMeta, OutfitSlot, Season } from '../engine/types';
import * as FileSystem from 'expo-file-system/legacy';

export class OpenAIVisionService {

    /**
     * Analyze garment using GPT-4o
     */
    static async analyzeGarment(photoUri: string): Promise<any> {
        try {
            console.log('[OpenAI] Starting analysis...');

            // 1. Get API Key
            const apiKey = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;

            if (!apiKey) {
                throw new Error('Missing OPENAI_API_KEY. Please add it to your .env file.');
            }

            // 2. Convert image to base64
            const base64Image = await this.convertToBase64(photoUri);

            // 3. Prepare the Prompt
            const prompt = `
            Analyze this clothing item in valid JSON format.
            Focus on:
            - precise color (hex code)
            - specific item name (e.g. "Vintage Dinosaur Print Shirt")
            - pattern (precise, e.g. "dinosaur print", "floral", "plaid")
            - style tags (e.g. "streetwear", "retro", "casual")
            - formality (1-10)
            
            Return JSON ONLY:
            {
                "type": "top" | "bottom" | "shoes" | "layer",
                "subtype": "string",
                "color_hex": "#RRGGBB",
                "color_name": "string",
                "pattern": "string",
                "fabric": "string (guess)",
                "formality": number,
                "description": "string",
                "tags": ["string"]
            }
            `;

            // 4. Call OpenAI API (Direct Fetch to avoid SDK issues on mobile)
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",  // Use GPT-4o for speed & vision
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[OpenAI] Error:', data);
                throw new Error(data.error?.message || 'Failed to connect to OpenAI');
            }

            // 5. Parse Result
            const content = data.choices[0].message.content;
            const result = JSON.parse(content);

            console.log('[OpenAI] Success:', result);

            return this.transformToGarmentMeta(result);

        } catch (error) {
            console.error('[OpenAI] Analysis failed:', error);
            throw error;
        }
    }

    private static async convertToBase64(uri: string): Promise<string> {
        // Use the fetch/blob method which is reliable on Expo
        try {
            if (uri.startsWith('data:')) return uri.split(',')[1];

            const response = await fetch(uri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Base64 conversion failed', e);
            throw new Error('Could not process image file');
        }
    }

    private static transformToGarmentMeta(data: any): any {
        return {
            type: this.mapType(data.type),
            subtype: data.subtype,
            colors: [{
                hex: data.color_hex,
                name: data.color_name,
                dictColorId: 1,
                hue: 0, saturation: 0, value: 0 // placeholders
            }],
            primaryColorHex: data.color_hex,
            pattern: data.pattern,
            fabric: data.fabric,
            weight: 'medium',
            fitType: 'regular',
            formalityRange: [Math.max(1, data.formality - 1), Math.min(10, data.formality + 1)],
            seasonScores: { summer: 0.5, winter: 0.5, transitional: 0.5, monsoon: 0.5 },
            versatility: 0.8,
            tags: data.tags,
            aiDescription: data.description,
            aiConfidence: 0.95,
            aiAnalyzedAt: Date.now()
        };
    }

    private static mapType(type: string): OutfitSlot {
        const map: Record<string, OutfitSlot> = {
            'top': OutfitSlot.Top,
            'bottom': OutfitSlot.Bottom,
            'shoes': OutfitSlot.Shoes,
            'layer': OutfitSlot.Layer,
            'one_piece': OutfitSlot.OnePiece
        };
        return map[type.toLowerCase()] || OutfitSlot.Top;
    }
}
