import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { CandidateStage } from '../ritual/CandidateStage';
import { VotingSystem } from '../../system/social/VotingSystem';
import { Outfit } from '../../truth/types';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';
import * as Haptics from 'expo-haptics';

const MOCK_FRIENDS_OUTFITS: { friendName: string, avatar: string, outfit: Outfit }[] = [
    {
        friendName: "ALEX R.",
        avatar: "A",
        outfit: {
            id: "friend_outfit_1" as any,
            items: ["p1", "p2"],
            score: 0.92,
            pieces: [
                { id: "p1" as any, category: "Top", color: "#F9FAFB", status: "Clean", currentUses: 0, maxUses: 3, warmth: 0.5, formality: 0.5 },
                { id: "p2" as any, category: "Bottom", color: "#1A1A1E", status: "Clean", currentUses: 0, maxUses: 3, warmth: 0.5, formality: 0.5 },
            ]
        }
    },
    {
        friendName: "SARAH L.",
        avatar: "S",
        outfit: {
            id: "friend_outfit_2" as any,
            items: ["p3" as any, "p4" as any],
            score: 0.88,
            pieces: [
                { id: "p3" as any, category: "Top", color: "#2D5BFF", status: "Clean", currentUses: 0, maxUses: 3, warmth: 0.8, formality: 0.3 },
                { id: "p4" as any, category: "Bottom", color: "#E5E7EB", status: "Clean", currentUses: 0, maxUses: 3, warmth: 0.4, formality: 0.2 },
            ]
        }
    }
];

export const FriendsFeed: React.FC = () => {
    const voting = VotingSystem.getInstance();
    const [scores, setScores] = useState<Record<string, { good: number, bad: number }>>({});

    useEffect(() => {
        const newScores: Record<string, { good: number, bad: number }> = {};
        MOCK_FRIENDS_OUTFITS.forEach(fo => {
            newScores[fo.outfit.id] = voting.getScores(fo.outfit.id);
        });
        setScores(newScores);
    }, []);

    const handleVote = (outfitId: string, type: 'GOOD' | 'BAD') => {
        voting.castVote(outfitId, 'current_user', type);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setScores({
            ...scores,
            [outfitId]: voting.getScores(outfitId)
        });
    };

    return (
        <View style={styles.container}>
            <RitualHeader
                subtitle="The Circle"
                title="Fit Checks."
            />

            {/* LEADERBOARD TEASER */}
            <View style={styles.leaderboardTeaser}>
                <Text style={styles.leaderboardTitle}>TOP STYLISTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.leaderboardScroll}>
                    {['SARAH', 'ALEX', 'YOU', 'MIKE'].map((name, i) => (
                        <View key={name} style={styles.leaderUser}>
                            <View style={[styles.leaderAvatar, i === 2 && styles.myAvatar]}>
                                <Text style={styles.leaderInitial}>{name[0]}</Text>
                            </View>
                            <Text style={styles.leaderRank}>#{i + 1}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.masonryContainer}>
                    {/* LEFT COLUMN */}
                    <View style={styles.column}>
                        {MOCK_FRIENDS_OUTFITS.filter((_, i) => i % 2 === 0).map((fo, idx) => (
                            <FeedCard key={fo.outfit.id} fo={fo} scores={scores} onVote={handleVote} />
                        ))}
                    </View>
                    {/* RIGHT COLUMN */}
                    <View style={styles.column}>
                        {MOCK_FRIENDS_OUTFITS.filter((_, i) => i % 2 !== 0).map((fo, idx) => (
                            <FeedCard key={fo.outfit.id} fo={fo} scores={scores} onVote={handleVote} />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    // Open Camera for Fit Check
                }}
            >
                <Text style={styles.fabIcon}>📸</Text>
            </TouchableOpacity>
        </View>
    );
};

const FeedCard: React.FC<{ fo: any, scores: any, onVote: any }> = ({ fo, scores, onVote }) => (
    <GlassCard style={styles.feedItem}>
        <View style={styles.stageArea}>
            {/* Mocking the Image/Composition */}
            <View style={[styles.mockImage, { backgroundColor: fo.friendName === 'ALEX R.' ? '#E2E8F0' : '#DBEAFE' }]} />
            <View style={styles.hotspotTag}>
                <Text style={styles.hotspotText}>{(fo.outfit.score * 100).toFixed(0)}% MATCH</Text>
            </View>
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.friendRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{fo.avatar}</Text>
                </View>
                <View>
                    <Text style={styles.friendName}>{fo.friendName}</Text>
                    <Text style={styles.timeLabel}>2h ago</Text>
                </View>
            </View>

            <View style={styles.reactions}>
                <TouchableOpacity onPress={() => onVote(fo.outfit.id, 'GOOD')} style={styles.reactBtn}>
                    <Text style={styles.reactIcon}>🔥</Text>
                    <Text style={styles.reactCount}>{scores[fo.outfit.id]?.good || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </GlassCard>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        paddingHorizontal: SPACING.GUTTER,
    },
    leaderboardTeaser: {
        marginBottom: 24,
    },
    leaderboardTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.KINETIC_SILVER,
        letterSpacing: 2,
        marginBottom: 12,
    },
    leaderboardScroll: {
        gap: 20,
    },
    leaderUser: {
        alignItems: 'center',
    },
    leaderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.SURFACE_GLASS,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.ELECTRIC_COBALT,
        marginBottom: 4,
    },
    myAvatar: {
        borderColor: COLORS.ROYAL_GOLD,
    },
    leaderInitial: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        color: COLORS.RITUAL_WHITE,
        fontSize: 18,
    },
    leaderRank: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.KINETIC_SILVER,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    masonryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        width: '48%',
    },
    feedItem: {
        marginBottom: 16,
        padding: 0,
        overflow: 'hidden',
    },
    stageArea: {
        height: 180,
        backgroundColor: COLORS.MIDNIGHT_VOID,
    },
    mockImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    hotspotTag: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    hotspotText: {
        color: COLORS.NEON_CYAN,
        fontSize: 8,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
    cardFooter: {
        padding: 12,
    },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.SURFACE_MUTE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    friendName: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
    timeLabel: {
        fontSize: 8,
        color: COLORS.KINETIC_SILVER,
    },
    reactions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    reactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.SURFACE_GLASS_HIGHLIGHT,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    reactIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    reactCount: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.RITUAL_WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.RITUAL_WHITE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    fabIcon: {
        fontSize: 24,
    }
});
