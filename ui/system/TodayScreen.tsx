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
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartImage } from '../primitives/SmartImage';
import { PieceID, OutfitID } from '../../truth/types';

import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { Outfit } from '../../truth/types';

// Mock Data for Demo (using real mock images to avoid blank screens)
const MOCK_OUTFITS: Outfit[] = [
    {
        id: 'void_runner_01' as OutfitID,
        score: 0.98,
        confidence: 0.95,
        items: ['p1' as PieceID, 'p2' as PieceID, 'p3' as PieceID],
        pieces: [
            { id: 'p1' as PieceID, category: 'Top', name: 'White T-Shirt', color: '#FFFFFF', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shirt_white_minimalist_1769291380313.png') },
            { id: 'p2' as PieceID, category: 'Bottom', name: 'Navy Chinos', color: '#0F0F12', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/pants_beige_chinos_1769291832497.png') },
            { id: 'p3' as PieceID, category: 'Shoes', name: 'White Sneakers', color: '#22222E', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shoes_white_sneakers_1769291896158.png') }
        ] as any
    },
    {
        id: 'neon_scholar_02' as OutfitID,
        score: 0.92,
        confidence: 0.88,
        items: ['p4' as PieceID, 'p5' as PieceID, 'p6' as PieceID],
        pieces: [
            { id: 'p4' as PieceID, category: 'Top', name: 'Black T-Shirt', color: '#2E2E3A', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shirt_black_tshirt_1769291392637.png') },
            { id: 'p5' as PieceID, category: 'Bottom', name: 'Black Jeans', color: '#121215', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/pants_black_cropped_1769291818202.png') },
            { id: 'p6' as PieceID, category: 'Shoes', name: 'Black Boots', color: '#2E5CFF', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shoes_black_boots_1769291909320.png') }
        ] as any
    },
    {
        id: 'grey_ghost_03' as OutfitID,
        score: 0.88,
        confidence: 0.85,
        items: ['p7' as PieceID, 'p8' as PieceID, 'p9' as PieceID],
        pieces: [
            { id: 'p7' as PieceID, category: 'Top', name: 'Navy Oxford', color: '#000080', warmth: 3, formality: 4, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shirt_blue_oxford_1769291405660.png') },
            { id: 'p8' as PieceID, category: 'Bottom', name: 'Grey Trousers', color: '#808080', warmth: 3, formality: 4, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/pants_grey_wool_1769291853652.png') },
            { id: 'p9' as PieceID, category: 'Shoes', name: 'Brown Loafers', color: '#8B4513', warmth: 3, formality: 4, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shoes_brown_loafers_1769291923879.png') }
        ] as any
    },
    {
        id: 'obsidian_04' as OutfitID,
        score: 0.85,
        confidence: 0.82,
        items: ['p10' as PieceID, 'p11' as PieceID, 'p12' as PieceID],
        pieces: [
            { id: 'p10' as PieceID, category: 'Top', name: 'Casual Shirt', color: '#2E2E3A', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shirt_patterned_casual_1769291418890.png') },
            { id: 'p11' as PieceID, category: 'Bottom', name: 'Olive Cargo', color: '#121215', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/pants_olive_cargo_1769291882181.png') },
            { id: 'p12' as PieceID, category: 'Shoes', name: 'Grey Runners', color: '#2E5CFF', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shoes_grey_runners_1769291938062.png') }
        ] as any
    },
    {
        id: 'midnight_05' as OutfitID,
        score: 0.82,
        confidence: 0.80,
        items: ['p13' as PieceID, 'p14' as PieceID, 'p15' as PieceID],
        pieces: [
            { id: 'p13' as PieceID, category: 'Top', name: 'Flannel', color: '#2E2E3A', warmth: 4, formality: 2, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shirt_flannel_streetwear_1769291433914.png') },
            { id: 'p14' as PieceID, category: 'Bottom', name: 'Denim Indigo', color: '#121215', warmth: 3, formality: 2, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/pants_denim_indigo_1769291869436.png') },
            { id: 'p15' as PieceID, category: 'Shoes', name: 'Black Derbies', color: '#2E5CFF', warmth: 3, formality: 3, status: 'Clean', currentUses: 0, imageUri: require('../../assets/mock-data/images/shoes_black_derbies_1769291955831.png') }
        ] as any
    }
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

export const TodayScreen: React.FC = () => {
    const { candidateOutfits } = useRitualState();
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

        // Use engine outfits if available, otherwise fallback to mock
        const outfitsToUser = (candidateOutfits && candidateOutfits.length > 0) ? candidateOutfits : MOCK_OUTFITS;
        console.log(`[TodayScreen] Entering Ritual with ${outfitsToUser.length} outfits`);

        // Force a fresh reference to ensure RitualDeckScreen's useEffect triggers
        ritualMachine.enterRitual([...outfitsToUser]);

        // Remove manual navigation to avoid race conditions with NavigationSync
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
                            <Text style={styles.brandText}>FW-26</Text>
                        </View>
                        <SmartImage
                            source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }} // Obsidian Top
                            style={styles.squareImage}
                            contentFit="cover"
                        />
                    </View>

                    {/* Layer 2: Detail Pill (Bottom) */}
                    <View style={styles.detailPill}>
                        <Text style={styles.pillLabel}>CASUAL SHARP</Text>
                        <View style={styles.pillDot} />
                        <Text style={styles.pillValue}>12°C</Text>
                    </View>
                </TouchableOpacity>

                {/* 2) IDENTITY SECTION */}
                <View style={styles.identityContainer}>
                    <Text style={styles.identityLabel}>IDENTITY: SECURE CHANNEL</Text>
                    <Text style={styles.identityId}>USER: ASHISH_RAMA // AUTH_VERIFIED</Text>
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
                                <Text style={styles.buttonText}>REVEAL OUTFIT</Text>
                            </LinearGradient>
                            <View style={styles.buttonEdge} />
                        </TouchableOpacity>
                    </Animated.View>
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
});
