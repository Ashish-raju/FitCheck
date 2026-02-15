/**
 * ⚠️ GOOGLE CLOUD VISION API KEY CONFIGURATION
 * 
 * TO ADD YOUR GOOGLE VISION API KEY:
 * 
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing one
 * 3. Enable "Cloud Vision API"
 * 4. Go to "Credentials" → "Create Credentials" → "API Key"
 * 5. Copy the API key and add it below:
 * 
 * GOOGLE_VISION_API_KEY=your-api-key-here
 * 
 * 6. (Optional) Restrict the API key to Vision API only for security
 * 
 * NEVER commit this file to git!
 */

import Constants from 'expo-constants';

/**
 * Get Google Vision API key from environment
 */
export function getGoogleVisionApiKey(): string {
    // 1. Try Expo public env var (Expo 49+)
    if (process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY) {
        return process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
    }

    // 2. Try standard env var
    if (process.env.GOOGLE_VISION_API_KEY) {
        return process.env.GOOGLE_VISION_API_KEY;
    }

    // 3. Try Expo constants (app.json extra)
    // 3. Try Expo constants (app.json extra)
    if (Constants.expoConfig?.extra?.googleVisionApiKey) {
        return Constants.expoConfig.extra.googleVisionApiKey;
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY ||
        process.env.GOOGLE_VISION_API_KEY ||
        Constants.expoConfig?.extra?.googleVisionApiKey;

    // 4. Throw error if not found
    if (!apiKey) {
        throw new Error(
            '🚨 API Key not found!\n' +
            'Please ensure EXPO_PUBLIC_GOOGLE_VISION_API_KEY is set in .env'
        );
    }

    return apiKey;
}

/**
 * Google Vision Configuration
 */
export const GOOGLE_VISION_CONFIG = {
    /**
     * API Endpoint
     */
    API_ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',

    /**
     * Features to detect
     */
    FEATURES: [
        { type: 'LABEL_DETECTION', maxResults: 10 },      // Item type, style
        { type: 'IMAGE_PROPERTIES', maxResults: 10 },     // Dominant colors
        { type: 'OBJECT_LOCALIZATION', maxResults: 5 }    // Object detection
    ],

    /**
     * Rate limits (free tier)
     */
    RATE_LIMITS: {
        MONTHLY_FREE: 1000,  // 1,000 free per month
        PER_DAY: 50          // Suggested limit for free tier
    },

    /**
     * Timeouts
     */
    TIMEOUTS: {
        ANALYSIS: 15000  // 15 seconds
    }
} as const;
