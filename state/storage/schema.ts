export type InventoryId = string;

export interface InventoryItem {
    id: InventoryId;
    name: string;
    wearCount: number;
    lastWorn?: number; // timestamp
    entropy: number; // 0-1 decay
}

// --- SOCIAL TYPES ---
export interface SocialUser {
    id: string;
    username: string;
    avatarUrl: string;
    isFollowed: boolean;
}

export interface SocialPost {
    id: string;
    userId: string;
    imageUrls: string[];
    caption: string;
    likesCount: number;
    createdAt: string;
    tags: string[];
    // Minimal aesthetic data for "vibes"
    aspectRatio?: number;
}

export interface SocialState {
    posts: SocialPost[];
    users: Record<string, SocialUser>;
    likedPostIds: string[];
    savedPostIds: string[];
}

export interface StateSchemaV1 {
    version: 1;
    inventory: Record<string, any>;
    globalMaxUses: number;
    lastBoot: number;
    trustScore: number;
    social: SocialState;
}

export const DEFAULT_STATE: StateSchemaV1 = {
    version: 1,
    inventory: {},
    globalMaxUses: 3,
    lastBoot: 0,
    trustScore: 100,
    social: {
        posts: [],
        users: {},
        likedPostIds: [],
        savedPostIds: []
    }
};

export type AnyState = StateSchemaV1;
