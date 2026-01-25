/**
 * Copy Engine
 * Centralized copy management with luxury tone enforcement
 */

import type { CopyDictionary, CopyParams, CopyVariant } from './types';

// Copy Dictionary - All user-facing text
const copyDictionary: CopyDictionary = {
    global: {
        appName: 'FIT CHECK',
        identityLabel: 'IDENTITY: AUTH_REQUIRED',
        continue: 'Continue',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        done: 'Done',
        back: 'Back',
        next: 'Next',
        skip: 'Skip',
    },

    navigation: {
        home: 'Today',
        wardrobe: 'Vault',
        camera: 'Capture',
        insights: 'Insights',
        social: 'Network',
        settings: 'Settings',
    },

    home: {
        greeting: {
            default: 'Welcome, {name}',
            morning: 'Morning, {name}',
            afternoon: 'Afternoon, {name}',
            evening: 'Evening, {name}',
            night: 'Night, {name}',
        },
        vibe: 'Something elegant for tonight?',
        revealButton: 'REVEAL OUTFIT',
        seasonBadge: 'FW-26',
        styleTag: 'CASUAL SHARP',
        weather: '{temp}°C',
        streakLabel: 'STREAK',
        loggedLabel: 'LOGGED',
        identitySecure: 'IDENTITY: SECURE CHANNEL',
        userAuth: 'USER: {userId} // AUTH_VERIFIED',
    },

    wardrobe: {
        title: 'STYLE VAULT',
        subtitle: 'Your Collection',
        totalItems: 'TOTAL ITEMS',
        estValue: 'EST. VALUE',
        tabs: {
            all: 'All',
            top: 'Top',
            bottom: 'Bottom',
            shoes: 'Shoes',
            outerwear: 'Outerwear',
        },
        empty: {
            default: 'No items yet',
            short: 'Empty',
            category: 'No {category} yet',
        },
        addButton: 'Add Item',
        deleteConfirm: 'Remove this piece?',
        deleteSuccess: 'Removed',
        favoriteAdded: 'Saved to favorites',
        favoriteRemoved: 'Removed from favorites',
    },

    camera: {
        title: 'Capture',
        capture: 'Capture',
        retake: 'Retake',
        confirm: 'Confirm',
        processing: 'Processing',
        permissionTitle: 'Camera access required',
        permissionMessage: 'Enable camera to add items',
        permissionButton: 'Enable Camera',
    },

    ritual: {
        weatherOptimized: 'OPTIMIZED FOR {temp}°C // {condition}',
        description: 'A precise configuration of technical shells and obsidian bases, calibrated for high-performance urban navigation',
        componentAnalysis: 'COMPONENT ANALYSIS',
        matchScore: '{score}% MATCH',
        labels: {
            primary: 'PRIMARY',
            base: 'BASE',
            accent: 'ACCENT',
            layer: 'LAYER',
        },
        swipe: {
            approve: 'Perfect',
            reject: 'Skip',
            maybe: 'Maybe',
        },
        reveal: {
            title: 'Your fit',
            subtitle: 'Revealed',
        },
        streak: {
            title: 'Streak',
            days: '{count} {count, plural, one {Day} other {Days}}',
        },
        complete: {
            title: 'Session complete',
            subtitle: 'Well styled',
        },
    },

    auth: {
        welcomeBack: 'Welcome back',
        createAccount: 'Create your wardrobe',
        nameLabel: 'NAME',
        emailLabel: 'EMAIL',
        passwordLabel: 'PASSWORD',
        namePlaceholder: 'Your name',
        emailPlaceholder: 'you@example.com',
        passwordPlaceholder: '••••••••',
        signInButton: 'SIGN IN',
        createAccountButton: 'CREATE ACCOUNT',
        noAccount: 'No account? Sign up',
        hasAccount: 'Have an account? Sign in',
        legal: 'By continuing, you agree to our Terms of Service and Privacy Policy',
    },

    onboarding: {
        tagline: 'Your Personal Stylist, Every Day',
        splash: {
            title: 'FIT CHECK',
            subtitle: 'Your Personal Stylist, Every Day',
        },
        intro: {
            slide1Title: 'Daily outfit suggestions',
            slide1Body: 'Personalized to your style and weather',
            slide2Title: 'Smart wardrobe',
            slide2Body: 'Track and organize your collection',
            slide3Title: 'Style insights',
            slide3Body: 'Learn what works for you',
        },
        quiz: {
            title: 'Set your style',
            subtitle: 'A few questions to calibrate',
        },
    },

    insights: {
        title: 'Insights',
        comingSoon: 'Analytics coming soon',
        topPieces: 'Most worn',
        wearPatterns: 'Wear patterns',
        styleScore: 'Style score',
    },

    social: {
        title: 'Network',
        comingSoon: 'Friends feed coming soon',
        friends: 'Friends',
        activity: 'Activity',
    },

    chat: {
        title: 'Stylist',
        placeholder: 'Calibrate style',
        send: 'Send',
    },

    settings: {
        title: 'Settings',
        profile: 'Profile',
        preferences: 'Preferences',
        notifications: 'Notifications',
        privacy: 'Privacy',
        about: 'About',
        signOut: 'Sign Out',
    },

    errors: {
        validation: {
            requiredFields: 'Required fields missing',
            nameRequired: 'Name required',
            emailRequired: 'Email required',
            emailInvalid: 'Invalid email format',
            passwordRequired: 'Password required',
            passwordTooShort: 'Password too short',
        },
        auth: {
            failed: 'Authentication failed',
            invalidCredentials: 'Invalid credentials',
            networkError: 'Connection failed',
            emailInUse: 'Email already registered',
        },
        network: {
            offline: 'No connection',
            timeout: 'Request timed out',
            serverError: 'Server unavailable',
        },
        permission: {
            camera: 'Camera permission needed',
            photos: 'Photo access needed',
            notifications: 'Notification permission needed',
        },
        generic: 'Something went wrong',
    },

    success: {
        saved: 'Saved',
        deleted: 'Deleted',
        updated: 'Updated',
        sent: 'Sent',
        uploaded: 'Uploaded',
    },

    loading: {
        default: 'Loading',
        processing: 'Processing',
        uploading: 'Uploading',
        analyzing: 'Analyzing',
    },
};

// Debug mode state
let debugMode = false;

/**
 * Set debug mode to show copy keys instead of values
 */
export function setDebugMode(enabled: boolean): void {
    debugMode = enabled;
    console.log(`[CopyEngine] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Get value from nested object path
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Interpolate parameters into copy string
 */
function interpolate(text: string, params?: CopyParams): string {
    if (!params) return text;

    let result = text;

    // Handle standard interpolation {param}
    Object.entries(params).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, String(value ?? ''));
    });

    // Handle pluralization {count, plural, one {singular} other {plural}}
    const pluralRegex = /\{(\w+),\s*plural,\s*one\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g;
    result = result.replace(pluralRegex, (match, countKey, singular, plural) => {
        const count = params[countKey];
        return Number(count) === 1 ? singular : plural;
    });

    return result;
}

/**
 * Main translation function
 * @param key - Copy key (e.g., 'home.greeting.morning')
 * @param params - Dynamic parameters for interpolation
 * @param variant - Copy variant (default, short, long)
 * @returns Translated and interpolated copy
 */
export function t(key: string, params?: CopyParams, variant: CopyVariant = 'default'): string {
    // Debug mode: return key
    if (debugMode) {
        return `[${key}]`;
    }

    try {
        // Get base value
        let value = getNestedValue(copyDictionary, key);

        // Handle variants
        if (typeof value === 'object' && value !== null && variant in value) {
            value = value[variant];
        } else if (typeof value === 'object' && value !== null && 'default' in value) {
            value = value.default;
        }

        // Missing key handling
        if (value === undefined || value === null) {
            if (__DEV__) {
                console.warn(`[CopyEngine] Missing copy key: "${key}"`);
            }
            return __DEV__ ? `[MISSING: ${key}]` : key;
        }

        // Interpolate parameters
        return interpolate(String(value), params);
    } catch (error) {
        if (__DEV__) {
            console.error(`[CopyEngine] Error processing key "${key}":`, error);
        }
        return __DEV__ ? `[ERROR: ${key}]` : key;
    }
}

// Export dictionary for reference (read-only)
export const copyReference = copyDictionary as Readonly<CopyDictionary>;
