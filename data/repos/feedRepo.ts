import { FIREBASE_DB } from '../../system/firebase/firebaseConfig';
import firebase from 'firebase/compat/app';
import { Outfit } from './outfitsRepo';

/**
 * FeedRepo - Social feed management
 * 
 * Features:
 * - Friends' outfit feed
 * - Reactions (emoji)
 * - Sharing outfits
 * 
 * Note: This is a placeholder implementation for Phase 3C.
 * Social features are not fully implemented yet.
 */

export interface FeedItem {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    outfitId: string;
    outfit?: Outfit;
    caption?: string;
    reactions: Record<string, string[]>; // emoji -> userIds[]
    timestamp: number;
}

interface ListFeedOptions {
    limit?: number;
    startAfter?: string;
}

export class FeedRepo {
    /**
     * List feed items (friends' outfits)
     */
    static async listFeed(userId: string, options: ListFeedOptions = {}): Promise<FeedItem[]> {
        try {
            // TODO: Implement proper feed query
            // For now, return empty array (Coming Soon UI will handle this)
            console.log('[FeedRepo] listFeed called - feature not yet implemented');
            return [];
        } catch (error) {
            console.error('[FeedRepo] Failed to list feed:', error);
            return [];
        }
    }

    /**
     * React to a feed post with emoji
     */
    static async reactToPost(userId: string, postId: string, emoji: string): Promise<void> {
        try {
            const postRef = FIREBASE_DB.collection('feed').doc(postId);
            const doc = await postRef.get();

            if (!doc.exists) {
                throw new Error('Post not found');
            }

            const post = doc.data() as FeedItem;
            const reactions = post.reactions || {};

            // Toggle reaction
            if (reactions[emoji]?.includes(userId)) {
                // Remove reaction
                reactions[emoji] = reactions[emoji].filter(id => id !== userId);
                if (reactions[emoji].length === 0) {
                    delete reactions[emoji];
                }
            } else {
                // Add reaction
                if (!reactions[emoji]) {
                    reactions[emoji] = [];
                }
                reactions[emoji].push(userId);
            }

            await postRef.update({ reactions });
            console.log('[FeedRepo] Reaction updated:', postId, emoji);
        } catch (error) {
            console.error('[FeedRepo] Failed to react to post:', error);
            throw error;
        }
    }

    /**
     * Share an outfit to feed
     */
    static async shareOutfit(userId: string, outfitId: string, caption?: string): Promise<void> {
        try {
            // TODO: Get user profile for authorName/avatar
            const userDoc = await FIREBASE_DB
                .collection('users')
                .doc(userId)
                .collection('profile')
                .doc('data')
                .get();

            const profile = userDoc.data();

            const feedItem: Partial<FeedItem> = {
                authorId: userId,
                authorName: profile?.displayName || 'Anonymous',
                authorAvatar: profile?.photoURL,
                outfitId,
                caption,
                reactions: {},
                timestamp: Date.now()
            };

            await FIREBASE_DB.collection('feed').add(feedItem);
            console.log('[FeedRepo] Outfit shared to feed:', outfitId);
        } catch (error) {
            console.error('[FeedRepo] Failed to share outfit:', error);
            throw error;
        }
    }

    /**
     * Get feed item by ID
     */
    static async getFeedItem(postId: string): Promise<FeedItem | null> {
        try {
            const doc = await FIREBASE_DB.collection('feed').doc(postId).get();
            if (!doc.exists) {
                return null;
            }
            return doc.data() as FeedItem;
        } catch (error) {
            console.error('[FeedRepo] Failed to get feed item:', error);
            return null;
        }
    }
}
