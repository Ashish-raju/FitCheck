import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FeedService } from '../../services/FeedService';
import { SocialPost, SocialUser } from '../../state/storage/schema';
import { FeedCard } from './FeedCard';
import { COLORS } from '../tokens';

interface FeedSectionProps {
    headerComponent?: React.ReactElement;
}

export const FeedSection: React.FC<FeedSectionProps> = ({ headerComponent }) => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [users, setUsers] = useState<Record<string, SocialUser>>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    const loadFeed = useCallback(async (currentPage: number, reset = false) => {
        if (reset) {
            setLoading(true);
        }

        const newPosts = await FeedService.getHomeFeed(currentPage);

        // Fetch users for these posts efficiently
        const userIds = [...new Set(newPosts.map(p => p.userId))];
        const newUsers: Record<string, SocialUser> = {};
        for (const uid of userIds) {
            const u = await FeedService.getUser(uid);
            if (u) newUsers[uid] = u;
        }
        setUsers(prev => ({ ...prev, ...newUsers }));

        if (reset) {
            setPosts(newPosts);
        } else {
            setPosts(prev => [...prev, ...newPosts]);
        }

        setLoading(false);
    }, []);

    // Initial Load
    useEffect(() => {
        loadFeed(0, true);
    }, [loadFeed]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
    };

    const renderItem = ({ item }: { item: SocialPost }) => {
        const user = users[item.userId];
        return (
            <FeedCard
                post={item}
                user={user}
            />
        );
    };

    const renderFooter = () => {
        return (
            <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.ASH_GRAY} />
            </View>
        );
    };

    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListHeaderComponent={headerComponent}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100
    }
});
