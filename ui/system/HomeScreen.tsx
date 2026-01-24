import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    interpolate,
    useAnimatedScrollHandler
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { MOTION } from '../tokens/motion.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';

const { width } = Dimensions.get('window');

const HERO_HEIGHT = 420;

export const HomeScreen: React.FC = () => {
    const { candidateOutfits } = useRitualState();
    const isGenerated = candidateOutfits.length > 0;
    const scrollY = useSharedValue(0);

    useEffect(() => {
        // Auto-generate if empty on mount (Silent Concierge)
        if (!isGenerated) {
            generateOutfits();
        }
    }, []);

    const generateOutfits = () => {
        const inventory = InventoryStore.getInstance().getInventory();
        const topIds = Object.keys(inventory.pieces).filter(id => inventory.pieces[id as any].category === 'Top');
        const btmIds = Object.keys(inventory.pieces).filter(id => inventory.pieces[id as any].category === 'Bottom');
        const shoeIds = Object.keys(inventory.pieces).filter(id => inventory.pieces[id as any].category === 'Shoes');

        // Fallback for empty inventory
        if (topIds.length === 0) return;

        const outfits = [1, 2, 3].map(i => ({
            id: `GEN_${new Date().getTime()}_${i}`,
            items: [topIds[i % topIds.length], btmIds[i % btmIds.length], shoeIds[i % shoeIds.length]],
            pieces: [
                inventory.pieces[topIds[i % topIds.length]],
                inventory.pieces[btmIds[i % btmIds.length]],
                inventory.pieces[shoeIds[i % shoeIds.length]]
            ],
            score: 0.8 + Math.random() * 0.2
        })) as any;

        setTimeout(() => {
            // Delay slightly to simulate AI "Thinking" if called explicitly
            // But for auto-load on mount, it's instant in state but we can animate intro.
            ritualMachine.enterRitual(outfits);
        }, 500);
    };

    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollY.value = event.contentOffset.y;
    });

    const heroStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [-100, 0, 100], [1.1, 1, 0.95]);
        const opacity = interpolate(scrollY.value, [0, 200], [1, 0.8]);
        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <View style={styles.container}>
            <RitualHeader
                subtitle="Daily Ritual"
                title={`Good Morning,\nAshish.`}
            />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. STATUS & WEATHER */}
                <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                    <View style={styles.statusRow}>
                        <View style={styles.streakBadge}>
                            <Text style={styles.streakIcon}>🔥</Text>
                            <Text style={styles.streakText}>5 Day Streak</Text>
                        </View>
                        <View style={styles.weatherBadge}>
                            <Text style={styles.weatherText}>22°C • Clear Sky</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* 2. OUTFIT HERO CARD */}
                <Animated.View entering={FadeInDown.delay(400).duration(800).springify()}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => ritualMachine.enterRitual(candidateOutfits)}
                    >
                        <GlassCard style={styles.heroCard}>
                            <Animated.View style={[styles.heroImageContainer, heroStyle]}>
                                {/* Placeholder for Outfit Aura/Image */}
                                <View style={styles.auraPlaceholder} />
                                <Image
                                    source={{ uri: 'https://via.placeholder.com/400x400/1a1a1a/333333?text=OUTFIT+OF+THE+DAY' }}
                                    style={styles.heroImage}
                                />
                            </Animated.View>

                            <View style={styles.heroOverlay}>
                                <View style={styles.heroContent}>
                                    <Text style={styles.heroTitle}>Today's Look</Text>
                                    <Text style={styles.heroSubtitle}>Curated for Work Ritual</Text>
                                </View>
                                <View style={styles.unlockButton}>
                                    <Text style={styles.unlockText}>VIEW</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                </Animated.View>

                {/* 3. INSIGHTS TEASER */}
                <View style={styles.sectionRow}>
                    <GlassCard style={styles.insightCard}>
                        <Text style={styles.cardLabel}>WARDROBE HEALTH</Text>
                        <Text style={styles.cardValue}>92%</Text>
                    </GlassCard>
                    <GlassCard style={styles.insightCard}>
                        <Text style={styles.cardLabel}>MOST WORN</Text>
                        <View style={{ width: 20, height: 20, backgroundColor: COLORS.ELECTRIC_VIOLET, borderRadius: 10, marginTop: 4 }} />
                    </GlassCard>
                </View>

                <View style={{ height: 100 }} />
            </Animated.ScrollView>

            {/* FLOATING ACTION BUTTON - STYLIST */}
            <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        ritualMachine.toAIStylistChat();
                    }}
                >
                    <View style={styles.fabIcon}>
                        <View style={styles.avatar} />
                        <View style={styles.onlineDot} />
                    </View>
                    <Text style={styles.fabText}>Ask Stylist</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: SPACING.GUTTER,
    },
    scrollContent: {
        paddingTop: 20,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.GLASS_SURFACE,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SPACING.RADIUS.PILL,
        borderWidth: 1,
        borderColor: COLORS.WARNING_GOLD,
    },
    streakIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    streakText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.WARNING_GOLD,
    },
    weatherBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: SPACING.RADIUS.PILL,
        backgroundColor: COLORS.SURFACE_GLASS,
    },
    weatherText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: COLORS.KINETIC_SILVER,
    },
    heroCard: {
        height: HERO_HEIGHT,
        padding: 0,
        marginBottom: 24,
    },
    heroImageContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.8,
    },
    auraPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        opacity: 0.1,
    },
    heroOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.3)', // Gradient effect
    },
    heroContent: {
        marginBottom: 16,
    },
    heroTitle: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 32,
        color: COLORS.RITUAL_WHITE,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.KINETIC_SILVER,
    },
    unlockButton: {
        height: 48,
        backgroundColor: COLORS.RITUAL_WHITE,
        borderRadius: SPACING.RADIUS.PILL,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 32,
    },
    unlockText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fontSize: 12,
        color: COLORS.DEEP_OBSIDIAN,
        letterSpacing: 1,
    },
    sectionRow: {
        flexDirection: 'row',
        gap: 16,
    },
    insightCard: {
        flex: 1,
        height: 120,
        padding: 16,
        justifyContent: 'space-between',
    },
    cardLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.KINETIC_SILVER,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 1,
    },
    cardValue: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 32,
        color: COLORS.RITUAL_WHITE,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 100, // Above Nav
        right: SPACING.GUTTER,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: SPACING.RADIUS.PILL,
        shadowColor: COLORS.ELECTRIC_VIOLET,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    fabIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.RITUAL_WHITE,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.SUCCESS_MINT,
        borderWidth: 1,
        borderColor: COLORS.ELECTRIC_VIOLET,
    },
    fabText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
    }
});
