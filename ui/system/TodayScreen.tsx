import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/types';
import { SmartImage } from '../primitives/SmartImage';
import { t } from '../../src/copy';

import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { ProfileRepo, DerivedStats, UserProfile } from '../../data/repos';
import { Seeder } from '../../data/seeder/Seeder';
import { useAuth } from '../../context/auth/AuthProvider';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const TodayScreen: React.FC = () => {
    const { candidateOutfits } = useRitualState();
    const navigation = useNavigation<NavigationProp>();

    // Use reactive auth state
    const { user, loading: authLoading } = useAuth();
    const userId = user?.uid;

    // State
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [stats, setStats] = React.useState<DerivedStats | null>(null);
    const [generationError, setGenerationError] = React.useState<string | null>(null);
    const [isSeeding, setIsSeeding] = React.useState(false);

    // Load user profile and stats
    React.useEffect(() => {
        if (authLoading || !userId) return;

        const loadUserData = async () => {
            try {
                // Check and seed dummy data if needed (Temporary Demo Mode)
                await Seeder.seedIfEmpty(userId);

                // Refresh data
                const [userProfile, userStats] = await Promise.all([
                    ProfileRepo.getProfile(userId),
                    ProfileRepo.getStats(userId)
                ]);
                setProfile(userProfile);
                setStats(userStats);
            } catch (error) {
                console.error('[TodayScreen] Failed to load user data:', error);
            }
        };
        loadUserData();
    }, [userId, authLoading]);

    // Manual Seed Trigger (Debug)
    const handleForceSeed = async () => {
        if (!userId) return;
        setIsSeeding(true);
        try {
            await Seeder.seedAll(userId);
            // Reload
            const [userProfile, userStats] = await Promise.all([
                ProfileRepo.getProfile(userId),
                ProfileRepo.getStats(userId)
            ]);
            setProfile(userProfile);
            setStats(userStats);
            alert('Seeding Complete! Please reload.');
        } catch (e) {
            alert('Seeding Failed');
        } finally {
            setIsSeeding(false);
        }
    };

    // Button Animation
    const buttonScale = useSharedValue(1);
    const buttonTranslateY = useSharedValue(0);

    const handleRevealPressIn = () => {
        if (isGenerating) return;
        buttonScale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
        buttonTranslateY.value = withSpring(4, { damping: 10, stiffness: 300 }); // Push down effect
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleRevealPressOut = async () => {
        if (isGenerating) return;

        // Animate Button Release
        buttonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        buttonTranslateY.value = withSpring(0, { damping: 12, stiffness: 200 });

        // START GENERATION
        setIsGenerating(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Dynamic require to avoid circular deps if any, or just valid import usage
        const { EngineBinder } = require('../../bridge/engineBinder');

        // Allow UI to update to "Loading" state before freezing on any micro-task
        await new Promise(r => setTimeout(r, 50));

        try {
            const outfits = await EngineBinder.generateNow();
            console.log(`[TodayScreen] Generation done. Outfits: ${outfits.length}`);

            if (outfits.length > 0) {
                ritualMachine.enterRitual([...outfits]);
                setGenerationError(null);
            } else {
                // Show error instead of falling back to mocks
                const wardrobeCount = stats?.wardrobeCount || 0;
                if (wardrobeCount < 10) {
                    setGenerationError(`Not enough items in wardrobe (${wardrobeCount}/10 minimum). Add more pieces to generate outfits.`);
                } else {
                    setGenerationError('Unable to generate outfits. Please try again.');
                }
            }
        } catch (e) {
            console.error('[TodayScreen] Engine generation failed:', e);
            const wardrobeCount = stats?.wardrobeCount || 0;
            if (wardrobeCount < 10) {
                setGenerationError(`Not enough items in wardrobe (${wardrobeCount}/10 minimum). Upload more pieces to get started.`);
            } else {
                setGenerationError('Generation failed. Please try again later.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const loadRitual = () => {
        handleRevealPressOut();
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: buttonScale.value },
            { translateY: buttonTranslateY.value }
        ] as any
    }));

    // Dynamic greeting with real user name
    const userName = profile?.displayName || 'There';
    const timeGreeting = t('home.greeting.evening', { name: userName });
    const vibe = t('home.vibe');

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{timeGreeting}</Text>
                    <Text style={styles.subGreeting}>{vibe}</Text>
                </View>

                {/* Demo Mode Indicator */}
                {userId?.startsWith('demo_') && (
                    <View style={{
                        position: 'absolute',
                        top: 10,
                        right: 0,
                        backgroundColor: '#FFD700',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        zIndex: 100
                    }}>
                        <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>DEMO MODE</Text>
                    </View>
                )}

                {/* 1) MINIMAL LUXE STACKED CARD UI */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleRevealPressOut}
                    style={styles.stackContainer}
                >
                    {/* Layer 0: Main Card (Tall) */}
                    <View style={styles.mainCard}>
                        <SmartImage
                            source={{ uri: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop' }} // Vapor Grey Coat
                            style={styles.fullImage}
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                            style={styles.cardGradient}
                        />
                    </View>

                    {/* Layer 1: Context Card (Top Square) */}
                    <View style={styles.topSquareCard}>
                        <View style={styles.brandBadge}>
                            <Text style={styles.brandText}>{t('home.seasonBadge')}</Text>
                        </View>
                        <SmartImage
                            source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }} // Obsidian Top
                            style={styles.squareImage}
                            contentFit="cover"
                        />
                    </View>

                    {/* Layer 2: Detail Pill (Bottom) */}
                    <View style={styles.detailPill}>
                        <Text style={styles.pillLabel}>{t('home.styleTag')}</Text>
                        <View style={styles.pillDot} />
                        <Text style={styles.pillValue}>{t('home.weather', { temp: 12 })}</Text>
                    </View>
                </TouchableOpacity>

                {/* 2) IDENTITY SECTION */}
                <View style={styles.identityContainer}>
                    <Text style={styles.identityLabel}>{t('home.identitySecure')}</Text>
                    <Text style={styles.identityId}>{t('home.userAuth', { userId: userId || 'GUEST' })}</Text>
                </View>

                {/* 3) REVEAL ACTION SECTION */}
                <View style={styles.revealSection}>
                    <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPressIn={handleRevealPressIn}
                            onPressOut={handleRevealPressOut}
                            style={styles.revealButton3D}
                        >
                            <LinearGradient
                                colors={[COLORS.ELECTRIC_VIOLET, '#5B21B6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>
                                    {isGenerating ? t('home.processing', { defaultValue: 'ANALYZING WARDROBE...' }) : t('home.revealButton')}
                                </Text>
                            </LinearGradient>
                            <View style={styles.buttonEdge} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Error Message */}
                    {generationError && (
                        <View style={styles.errorCard}>
                            <Text style={styles.errorText}>⚠️ {generationError}</Text>
                            <TouchableOpacity
                                style={styles.errorButton}
                                onPress={() => navigation.navigate('Wardrobe' as any)}
                            >
                                <Text style={styles.errorButtonText}>Go to Closet</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Secondary Actions / Stats */}
                <View style={styles.quickActions}>
                    <View style={styles.miniCard}>
                        <Text style={styles.miniCardLabel}>{t('home.streakLabel')}</Text>
                        <Text style={styles.miniCardValue}>
                            {stats ? `${stats.streakCount} ${stats.streakCount === 1 ? 'day' : 'days'}` : '—'} 🔥
                        </Text>
                    </View>
                    <View style={styles.miniCard}>
                        <Text style={styles.miniCardLabel}>{t('home.loggedLabel')}</Text>
                        <Text style={styles.miniCardValue}>
                            {stats?.lastSealedAt ? new Date(stats.lastSealedAt).toLocaleDateString() : 'Never'}
                        </Text>
                    </View>
                </View>

                {/* DEBUG: Force Seed (Temporary) */}
                {(!stats || stats.wardrobeCount === 0) && userId && (
                    <View style={[styles.errorCard, { marginBottom: 40 }]}>
                        <Text style={styles.errorText}>Debug Mode: No wardrobe data found.</Text>
                        <TouchableOpacity
                            style={[styles.errorButton, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}
                            onPress={handleForceSeed}
                            disabled={isSeeding}
                        >
                            <Text style={[styles.errorButtonText, { color: '#34C759' }]}>
                                {isSeeding ? 'Seeding...' : '🌱 Force Seed Demo Data'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 32,
        color: MATERIAL.TEXT_MAIN,
        marginBottom: 4,
    },
    subGreeting: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 16,
        color: MATERIAL.TEXT_MUTED,
        fontWeight: TYPOGRAPHY.WEIGHTS.LIGHT,
    },
    // STACKED CARD SYSTEM
    stackContainer: {
        height: 440,
        width: '100%',
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCard: {
        width: width * 0.72,
        height: 400,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 10,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
    },
    topSquareCard: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 130,
        height: 130,
        backgroundColor: COLORS.CARBON_BLACK,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    squareImage: {
        width: '100%',
        height: '100%',
    },
    brandBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brandText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    detailPill: {
        position: 'absolute',
        bottom: 20,
        right: -10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    pillLabel: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    pillDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        marginHorizontal: 8,
    },
    pillValue: {
        color: COLORS.KINETIC_SILVER,
        fontSize: 11,
        fontWeight: '600',
    },

    // IDENTITY
    identityContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    identityLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.ELECTRIC_COBALT,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 4,
    },
    identityId: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1,
    },

    // REVEAL SECTION
    revealSection: {
        width: '100%',
        alignItems: 'center',
    },
    // 3D BUTTON STYLES
    buttonWrapper: {
        width: '100%',
        height: 64, // Total height including edge
    },
    revealButton3D: {
        width: '100%',
        height: 58,
        borderRadius: 16,
    },
    buttonGradient: {
        flex: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2, // Sit on top of edge
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)', // Top highlight
    },
    buttonEdge: {
        position: 'absolute',
        bottom: -6, // Push down to create depth
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: '#380B70', // Darker shade of violet
        borderRadius: 16,
        zIndex: 1,
    },
    buttonText: {
        color: COLORS.RITUAL_WHITE,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fontSize: 14,
        letterSpacing: 1.5,
    },

    // Secondary
    quickActions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 16,
    },
    miniCard: {
        flex: 1,
        backgroundColor: 'rgba(10,10,12,0.6)', // Very dark card
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    miniCardLabel: {
        color: MATERIAL.TEXT_MUTED,
        fontSize: 11,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        marginBottom: 6,
        letterSpacing: 1,
    },
    miniCardValue: {
        color: MATERIAL.TEXT_MAIN,
        fontSize: 18,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },

    // Error States
    errorCard: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    errorButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    errorButtonText: {
        color: '#FF3B30',
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fontSize: 12,
        letterSpacing: 0.5,
    },
});
