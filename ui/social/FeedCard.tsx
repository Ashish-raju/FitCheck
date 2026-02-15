import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

import { SocialPost, SocialUser } from '../../state/storage/schema';
import { FeedService } from '../../services/FeedService';
import { COLORS, TYPOGRAPHY } from '../tokens';

const { width } = Dimensions.get('window');

interface FeedCardProps {
    post: SocialPost;
    user?: SocialUser;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, user }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isSaved, setIsSaved] = useState(false);

    // Animation values
    const scale = useSharedValue(1);

    useEffect(() => {
        // Sync initial state
        FeedService.isLiked(post.id).then(setIsLiked);
        FeedService.isSaved(post.id).then(setIsSaved);
    }, [post.id]);

    const handleLike = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Optimistic Update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        // Animation
        if (newIsLiked) {
            scale.value = withSequence(
                withSpring(1.2),
                withSpring(1)
            );
        }

        await FeedService.toggleLike(post.id);
    };

    const handleSave = async () => {
        Haptics.selectionAsync();
        setIsSaved(!isSaved);
        await FeedService.toggleSave(post.id);
    };

    const likeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    // Time Ago Formatter
    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        return `${Math.floor(diffInSeconds / 86400)}d`;
    };

    return (
        <View style={styles.card}>
            {/* HERDER */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.username}>{user?.username || 'Unknown'}</Text>
                        <Text style={styles.timestamp}>{timeAgo(post.createdAt)}</Text>
                    </View>
                </View>
            </View>

            {/* IMAGE */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: post.imageUrls[0] }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            </View>

            {/* ACTIONS */}
            <View style={styles.actionRow}>
                <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
                    <Animated.View style={likeAnimatedStyle}>
                        <MaterialCommunityIcons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? COLORS.RITUAL_RED : COLORS.RITUAL_WHITE}
                        />
                    </Animated.View>
                    <Text style={styles.actionCount}>{likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSave}>
                    <MaterialCommunityIcons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isSaved ? COLORS.ELECTRIC_VIOLET : COLORS.RITUAL_WHITE}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        paddingBottom: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333'
    },
    username: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: '700',
        fontSize: 14,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY
    },
    timestamp: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY
    },
    imageContainer: {
        width: width,
        height: width * 1.25, // 4:5 Aspect Ratio
        backgroundColor: '#111',
        marginBottom: 12
    },
    postImage: {
        width: '100%',
        height: '100%'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    actionCount: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: '600',
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY
    },
    footer: {
        paddingHorizontal: 20
    },
    caption: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY
    },
    usernameInline: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold'
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6
    },
    tag: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 12,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY
    }
});
