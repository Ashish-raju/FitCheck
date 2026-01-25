/**
 * Copy Engine Type Definitions
 * Centralized type system for app copy management
 */

export type CopyVariant = 'default' | 'short' | 'long';
export type CopyContext = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'empty';

export interface CopyParams {
    [key: string]: string | number | boolean | undefined;
}

export interface CopyDictionary {
    global: {
        appName: string;
        identityLabel: string;
        continue: string;
        cancel: string;
        save: string;
        delete: string;
        edit: string;
        close: string;
        done: string;
        back: string;
        next: string;
        skip: string;
    };
    navigation: {
        home: string;
        wardrobe: string;
        camera: string;
        insights: string;
        social: string;
        settings: string;
    };
    home: {
        greeting: {
            default: string;
            morning: string;
            afternoon: string;
            evening: string;
            night: string;
        };
        vibe: string;
        revealButton: string;
        seasonBadge: string;
        styleTag: string;
        weather: string;
        streakLabel: string;
        loggedLabel: string;
        identitySecure: string;
        userAuth: string;
    };
    wardrobe: {
        title: string;
        subtitle: string;
        totalItems: string;
        estValue: string;
        tabs: {
            all: string;
            top: string;
            bottom: string;
            shoes: string;
            outerwear: string;
        };
        empty: {
            default: string;
            short: string;
            category: string;
        };
        addButton: string;
        deleteConfirm: string;
        deleteSuccess: string;
        favoriteAdded: string;
        favoriteRemoved: string;
    };
    camera: {
        title: string;
        capture: string;
        retake: string;
        confirm: string;
        processing: string;
        permissionTitle: string;
        permissionMessage: string;
        permissionButton: string;
    };
    ritual: {
        weatherOptimized: string;
        description: string;
        componentAnalysis: string;
        matchScore: string;
        labels: {
            primary: string;
            base: string;
            accent: string;
            layer: string;
        };
        swipe: {
            approve: string;
            reject: string;
            maybe: string;
        };
        reveal: {
            title: string;
            subtitle: string;
        };
        streak: {
            title: string;
            days: string;
        };
        complete: {
            title: string;
            subtitle: string;
        };
    };
    auth: {
        welcomeBack: string;
        createAccount: string;
        nameLabel: string;
        emailLabel: string;
        passwordLabel: string;
        namePlaceholder: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        signInButton: string;
        createAccountButton: string;
        noAccount: string;
        hasAccount: string;
        legal: string;
    };
    onboarding: {
        tagline: string;
        splash: {
            title: string;
            subtitle: string;
        };
        intro: {
            slide1Title: string;
            slide1Body: string;
            slide2Title: string;
            slide2Body: string;
            slide3Title: string;
            slide3Body: string;
        };
        quiz: {
            title: string;
            subtitle: string;
        };
    };
    insights: {
        title: string;
        comingSoon: string;
        topPieces: string;
        wearPatterns: string;
        styleScore: string;
    };
    social: {
        title: string;
        comingSoon: string;
        friends: string;
        activity: string;
    };
    chat: {
        title: string;
        placeholder: string;
        send: string;
    };
    settings: {
        title: string;
        profile: string;
        preferences: string;
        notifications: string;
        privacy: string;
        about: string;
        signOut: string;
    };
    errors: {
        validation: {
            requiredFields: string;
            nameRequired: string;
            emailRequired: string;
            emailInvalid: string;
            passwordRequired: string;
            passwordTooShort: string;
        };
        auth: {
            failed: string;
            invalidCredentials: string;
            networkError: string;
            emailInUse: string;
        };
        network: {
            offline: string;
            timeout: string;
            serverError: string;
        };
        permission: {
            camera: string;
            photos: string;
            notifications: string;
        };
        generic: string;
    };
    success: {
        saved: string;
        deleted: string;
        updated: string;
        sent: string;
        uploaded: string;
    };
    loading: {
        default: string;
        processing: string;
        uploading: string;
        analyzing: string;
    };
}

export type CopyKey = string; // More flexible than strict union for extensibility
