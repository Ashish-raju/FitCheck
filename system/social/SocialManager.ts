import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
    id: string;
    name: string;
    profilePin: string;
}

const SOCIAL_KEY = '@fit_check_social';

export class SocialManager {
    private static instance: SocialManager;
    private friends: Friend[] = [];
    private maxFriends: number = 3;
    private friendshipCode: string;
    private isInitialized: boolean = false;

    private constructor() {
        this.friendshipCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    public static getInstance(): SocialManager {
        if (!SocialManager.instance) {
            SocialManager.instance = new SocialManager();
        }
        return SocialManager.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;
        try {
            const stored = await AsyncStorage.getItem(SOCIAL_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.friends = data.friends || [];
                this.maxFriends = data.maxFriends || 3;
                this.friendshipCode = data.friendshipCode || this.friendshipCode;
            } else {
                await this.save();
            }
        } catch (e) {
            console.error('[SocialManager] Failed to load social state:', e);
        } finally {
            this.isInitialized = true;
        }
    }

    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(SOCIAL_KEY, JSON.stringify({
                friends: this.friends,
                maxFriends: this.maxFriends,
                friendshipCode: this.friendshipCode
            }));
        } catch (e) {
            console.error('[SocialManager] Social write failure:', e);
        }
    }

    public getFriends(): Friend[] {
        return this.friends;
    }

    public getFriendshipCode(): string {
        return this.friendshipCode;
    }

    public getMaxFriends(): number {
        return this.maxFriends;
    }

    public async sendFriendRequest(code: string): Promise<boolean> {
        if (this.friends.length >= this.maxFriends) {
            return false;
        }

        const mockFriend: Friend = {
            id: Math.random().toString(),
            name: "Style Ally " + (this.friends.length + 1),
            profilePin: code
        };
        this.friends.push(mockFriend);
        await this.save();
        return true;
    }

    public getFriendLimitStatus() {
        return {
            current: this.friends.length,
            max: this.maxFriends,
            remaining: this.maxFriends - this.friends.length
        };
    }

    public async simulateSocialGrowth() {
        const mockFriendsOfFriendsCount = Math.floor(Math.random() * 10);
        await this.checkAndIncreaseLimit(mockFriendsOfFriendsCount);
    }

    public async checkAndIncreaseLimit(friendsOfFriendsCount: number) {
        const additionalSlots = Math.floor(friendsOfFriendsCount / 3);
        this.maxFriends = 3 + additionalSlots;
        await this.save();
    }
}
