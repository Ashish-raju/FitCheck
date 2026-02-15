/**
 * ⚠️ SECURITY: API KEY CONFIGURATION
 * 
 * TO ADD YOUR OPENAI API KEY:
 * 
 * 1. Create a file called `.env` in the root directory (next to package.json)
 * 2. Add this line to .env:
 *    OPENAI_API_KEY=your-new-api-key-here
 * 
 * 3. Make sure .env is in .gitignore (it should be already)
 * 
 * NEVER commit your API key to git!
 * NEVER hardcode the key in this file!
 */

import Constants from 'expo-constants';

/**
 * Get OpenAI API key from environment
 * Falls back to expo config if .env not loaded
 */
export function getOpenAIApiKey(): string {
    // Try environment variable first (for .env file)
    const envKey = process.env.OPENAI_API_KEY;

    // Try Expo constants (for app.json extra config)
    const expoKey = Constants.expoConfig?.extra?.openaiApiKey;

    const apiKey = envKey || expoKey;

    if (!apiKey) {
        throw new Error(
            '🚨 OPENAI_API_KEY not found!\n\n' +
            'Please add your API key to .env file:\n' +
            'OPENAI_API_KEY=sk-proj-...\n\n' +
            'Or add to app.json:\n' +
            '{\n' +
            '  "expo": {\n' +
            '    "extra": {\n' +
            '      "openaiApiKey": "sk-proj-..."\n' +
            '    }\n' +
            '  }\n' +
            '}'
        );
    }

    return apiKey;
}

/**
 * OpenAI Configuration
 */
export const OPENAI_CONFIG = {
    /**
     * Model for vision analysis
     * gpt-4o is faster and cheaper than gpt-4-vision-preview
     */
    VISION_MODEL: 'gpt-4o',

    /**
     * Model for text generation (explanations, chat)
     */
    TEXT_MODEL: 'gpt-4-turbo-preview',

    /**
     * Model for embeddings
     */
    EMBEDDING_MODEL: 'text-embedding-3-small',

    /**
     * Rate limits (per user per day)
     */
    RATE_LIMITS: {
        PHOTO_ANALYSIS: 10,  // 10 photo analyses per day (free tier)
        CHAT_MESSAGES: 50    // 50 chat messages per day
    },

    /**
     * Timeouts (milliseconds)
     */
    TIMEOUTS: {
        VISION_ANALYSIS: 30000,  // 30 seconds
        TEXT_GENERATION: 15000,  // 15 seconds
        EMBEDDING: 10000         // 10 seconds
    }
} as const;
