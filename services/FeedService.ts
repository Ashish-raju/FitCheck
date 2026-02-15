import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialPost, SocialUser, SocialState } from '../state/storage/schema';

const SOCIAL_STORAGE_KEY = '@fit_check_social_state_v2';

// --- DUMMY DATA SEED ---
const DUMMY_USERS: SocialUser[] = [
    { id: 'u1', username: 'kaira.v', avatarUrl: 'https://i.pravatar.cc/150?u=kaira', isFollowed: true },
    { id: 'u2', username: 'jason_style', avatarUrl: 'https://i.pravatar.cc/150?u=jason', isFollowed: true },
    { id: 'u3', username: 'elena.fits', avatarUrl: 'https://i.pravatar.cc/150?u=elena', isFollowed: false },
    { id: 'u4', username: 'marc_o', avatarUrl: 'https://i.pravatar.cc/150?u=marc', isFollowed: true },
];

const DUMMY_POSTS: SocialPost[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `post_${i}`,
    userId: DUMMY_USERS[i % DUMMY_USERS.length].id,
    imageUrls: [`https://picsum.photos/500/600?random=${i}`],
    caption: '',
    likesCount: Math.floor(Math.random() * 50) + 5,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    tags: [],
    aspectRatio: 0.8
}));

const INITIAL_SOCIAL_STATE: SocialState = {
    posts: DUMMY_POSTS,
    users: DUMMY_USERS.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}),
    likedPostIds: [],
    savedPostIds: []
};

// --- SERVICE ---
export class FeedService {

    private static async loadState(): Promise<SocialState> {
        try {
            const json = await AsyncStorage.getItem(SOCIAL_STORAGE_KEY);
            if (json) {
                return JSON.parse(json) as SocialState;
            }
        } catch (e) {
            console.error('[FeedService] Failed to load state', e);
        }
        return INITIAL_SOCIAL_STATE;
    }

    private static async saveState(state: SocialState): Promise<void> {
        try {
            await AsyncStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('[FeedService] Failed to save state', e);
        }
    }

    // READ
    static async getHomeFeed(page: number = 0, pageSize: number = 10): Promise<SocialPost[]> {
        const state = await this.loadState();

        // Auto-seed if empty (checking posts length)
        if (state.posts.length === 0) {
            console.log('[FeedService] Seeding social data...');
            await this.saveState(INITIAL_SOCIAL_STATE);
            return DUMMY_POSTS.slice(0, pageSize);
        }

        // Simple pagination
        const allPosts = state.posts;
        const start = page * pageSize;
        return allPosts.slice(start, start + pageSize);
    }

    static async getUser(userId: string): Promise<SocialUser | undefined> {
        const state = await this.loadState();
        return state.users[userId];
    }

    static async isLiked(postId: string): Promise<boolean> {
        const state = await this.loadState();
        return state.likedPostIds.includes(postId) || false;
    }

    static async isSaved(postId: string): Promise<boolean> {
        const state = await this.loadState();
        return state.savedPostIds.includes(postId) || false;
    }

    // WRITE
    static async toggleLike(postId: string): Promise<boolean> {
        const state = await this.loadState();

        const isLiked = state.likedPostIds.includes(postId);
        let newLikedIds = isLiked
            ? state.likedPostIds.filter(id => id !== postId)
            : [...state.likedPostIds, postId];

        // Update count
        const newPosts = state.posts.map(p =>
            p.id === postId
                ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) }
                : p
        );

        await this.saveState({
            ...state,
            likedPostIds: newLikedIds,
            posts: newPosts
        });

        return !isLiked;
    }

    static async toggleSave(postId: string): Promise<boolean> {
        const state = await this.loadState();

        const isSaved = state.savedPostIds.includes(postId);
        let newSavedIds = isSaved
            ? state.savedPostIds.filter(id => id !== postId)
            : [...state.savedPostIds, postId];

        await this.saveState({
            ...state,
            savedPostIds: newSavedIds
        });

        return !isSaved;
    }
}
