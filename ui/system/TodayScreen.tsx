import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation/AppNavigator';

import { ritualMachine } from '../state/ritualMachine';
import { Outfit } from '../../truth/types';

// Mock Data for Demo
const MOCK_OUTFITS: Outfit[] = [
    {
        id: 'void_runner_01',
        score: 0.98,
        coherence: 0.95,
        pieces: [
            { id: 'p1', category: 'Top', color: '#1A1A24', layer: 'Mid' },
            { id: 'p2', category: 'Bottom', color: '#0F0F12', layer: 'Base' },
            { id: 'p3', category: 'Shoes', color: '#22222E', layer: 'Outer' }
        ]
    },
    {
        id: 'neon_scholar_02',
        score: 0.92,
        coherence: 0.88,
        pieces: [
            { id: 'p4', category: 'Top', color: '#2E2E3A', layer: 'Mid' },
            { id: 'p5', category: 'Bottom', color: '#121215', layer: 'Base' },
            { id: 'p6', category: 'Outerwear', color: '#2E5CFF', layer: 'Outer' }
        ]
    }
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const TodayScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // Button Animation
    const buttonScale = useSharedValue(1);
    const buttonTranslateY = useSharedValue(0);

    const handleRevealPressIn = () => {
        buttonScale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
        buttonTranslateY.value = withSpring(4, { damping: 10, stiffness: 300 }); // Push down effect
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleRevealPressOut = () => {
        buttonScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        buttonTranslateY.value = withSpring(0, { damping: 12, stiffness: 200 });

        // Navigate
        ritualMachine.enterRitual(MOCK_OUTFITS);

        // Small delay for spring release visual
        setTimeout(() => {
            navigation.navigate('RitualDeck');
        }, 100);
    };

    const loadRitual = () => {
        // Just in case they tap without holding (shouldn't happen with Pressable/Touch logic but good safety)
        handleRevealPressOut();
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: buttonScale.value },
            { translateY: buttonTranslateY.value }
        ]
    }));

    const timeGreeting = "Evening, Ash.";
    const vibe = "Something elegant for tonight?";

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{timeGreeting}</Text>
                    <Text style={styles.subGreeting}>{vibe}</Text>
                </View>

                {/* 1) NEW HOME HERO CARD (CRED STYLE) */}
                <View style={styles.heroCardContainer}>
                    {/* Visual Layer: Full Bleed Image/Abstract Top */}
                    <View style={styles.heroVisual}>
                        {/* Abstract Gradient Placeholder for "Outfit" Vibe */}
                        <LinearGradient
                            colors={['#2E2E3A', '#121215']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }}
                            style={styles.heroImage}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)', COLORS.CARBON_BLACK]}
                            style={styles.gradientOverlay}
                        />
                    </View>

                    {/* Content Layer */}
                    <View style={styles.heroContent}>
                        <View style={styles.metadataRow}>
                            <View style={styles.pillBadge}>
                                <Text style={styles.pillText}>28°C • Casual Sharp</Text>
                            </View>
                        </View>

                        <Text style={styles.heroTitle}>Today's Fit</Text>

                        <View style={styles.spacer} />

                        {/* 3) 3D REVEAL BUTTON */}
                        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPressIn={handleRevealPressIn}
                                onPressOut={handleRevealPressOut}
                                style={styles.revealButton3D}
                            >
                                <LinearGradient
                                    colors={[COLORS.ELECTRIC_VIOLET, '#5B21B6']} // Deep purple gradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>REVEAL OUTFIT</Text>
                                </LinearGradient>
                                {/* Bottom 3D Edge */}
                                <View style={styles.buttonEdge} />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* Secondary Actions / Stats */}
                <View style={styles.quickActions}>
                    <View style={styles.miniCard}>
                        <Text style={styles.miniCardLabel}>STREAK</Text>
                        <Text style={styles.miniCardValue}>3 Days 🔥</Text>
                    </View>
                    <View style={styles.miniCard}>
                        <Text style={styles.miniCardLabel}>LOGGED</Text>
                        <Text style={styles.miniCardValue}>Yesterday</Text>
                    </View>
                </View>

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
    // HERO CARD CRED STYLE
    heroCardContainer: {
        height: 420,
        borderRadius: 28,
        backgroundColor: COLORS.CARBON_BLACK,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // No heavy shadow, subtle depth handled by border and inner content
    },
    heroVisual: {
        height: '55%', // Top 55%
        width: '100%',
        backgroundColor: '#222',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.9,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    heroContent: {
        flex: 1,
        marginTop: -40, // Overlap slightly with visual if needed, or just layout below
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: 'flex-end',
    },
    metadataRow: {
        marginBottom: 12,
    },
    pillBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    pillText: {
        color: COLORS.KINETIC_SILVER, // Light grey
        fontSize: 12,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    heroTitle: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 36,
        color: COLORS.RITUAL_WHITE,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    spacer: {
        flex: 1,
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
        marginVertical: 6,// Leave space for the mock edge below in relative positioning if simpler
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
});
