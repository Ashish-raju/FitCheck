import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image'; // Use expo-image for caching
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.GUTTER * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45; // Aspect ratio for card

interface RitualCardProps {
    title: string;
    brandName?: string;
    brandLogoUrl?: string;
    imageUrl?: string;
    description?: string;
    coinCost?: number;
    isLoading?: boolean;
}

export const RitualCard: React.FC<RitualCardProps> = ({
    title,
    brandName = "FIREWALL",
    brandLogoUrl,
    imageUrl,
    description,
    coinCost = 500,
    isLoading = false,
}) => {

    const blurhash = 'L00000fQfQfQfQfQfQfQfQfQfQfQ'; // Placeholder dark blur

    if (isLoading) {
        return <SkeletonCard />;
    }

    return (
        <View style={styles.cardContainer}>
            {/* 1. Full Bleed Media Layer */}
            <Image
                style={styles.mediaLayer}
                source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }}
                placeholder={blurhash}
                contentFit="cover"
                transition={500}
            />

            {/* 2. Gradient Overlay (Bottom Fade) */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)', '#000000']}
                locations={[0.4, 0.6, 0.85, 1]}
                style={styles.gradientOverlay}
            />

            {/* 3. Floating Brand Chip (Top Left) */}
            <View style={styles.brandChipWrapper}>
                <BlurView intensity={20} tint="dark" style={styles.brandChipBlur}>
                    {brandLogoUrl ? (
                        <Image source={{ uri: brandLogoUrl }} style={styles.brandLogo} />
                    ) : (
                        <View style={styles.brandPlaceholder} />
                    )}
                    <Text style={styles.brandName}>{brandName.toUpperCase()}</Text>
                </BlurView>
            </View>

            {/* 4. Content Layer (Bottom) */}
            <View style={styles.contentLayer}>
                <View>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {title}
                    </Text>
                    {description && (
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {description}
                        </Text>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.coinTag}>
                        <View style={styles.coinIcon} />
                        <Text style={styles.coinText}>{coinCost}</Text>
                    </View>
                    <Text style={styles.tncText}>T&C apply</Text>
                </View>
            </View>

            {/* 5. Border & Inner Highlight (Subtle) */}
            <View style={styles.borderOverlay} pointerEvents="none" />
        </View>
    );
};

// Skeleton State for Loading
const SkeletonCard = () => (
    <View style={[styles.cardContainer, { backgroundColor: '#1A1A1A' }]}>
        <View style={{ flex: 1, backgroundColor: '#222' }} />
        <LinearGradient
            colors={['#222', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
        />
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 28,
        backgroundColor: '#0A0A0A',
        overflow: 'hidden',
        position: 'relative',
        // Shadow (Subtle)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    mediaLayer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradientOverlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    // brand chip
    brandChipWrapper: {
        position: 'absolute',
        top: 20,
        left: 20,
        borderRadius: 30, // Pill
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    brandChipBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    brandLogo: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    brandPlaceholder: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        marginRight: 6,
    },
    brandName: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    // content
    contentLayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 32,
    },
    cardTitle: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 28, // Hero
        color: COLORS.RITUAL_WHITE,
        lineHeight: 32,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardSubtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    coinTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    coinIcon: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFD700', // Gold
        marginRight: 6,
        shadowColor: '#FFD700',
        shadowOpacity: 0.8,
        shadowRadius: 6,
    },
    coinText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    tncText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    borderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
});
