import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { TYPOGRAPHY } from '../tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.GUTTER * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

interface RitualCardProps {
    title: string;
    brandName?: string;
    brandLogoUrl?: string;
    imageUrl?: string;
    description?: string;
    weatherTag?: string;
    vibeTag?: string;
    isLoading?: boolean;
}

export const RitualCard: React.FC<RitualCardProps> = memo(({
    title,
    brandName = "FIREWALL",
    brandLogoUrl,
    imageUrl,
    description,
    weatherTag,
    vibeTag,
    isLoading = false,
}) => {
    const blurhash = 'L00000fQfQfQfQfQfQfQfQfQfQfQ';

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
                transition={400}
                cachePolicy="memory-disk"
            />

            {/* 2. Inner Highlight (Top Edge Glow) */}
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'transparent']}
                locations={[0, 0.15]}
                style={styles.innerHighlight}
            />

            {/* 3. Bottom Vignette Gradient */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                locations={[0.35, 0.55, 0.78, 1]}
                style={styles.gradientOverlay}
            />

            {/* 4. Floating Brand Chip (Top Left) - No Blur for Performance */}
            <View style={styles.brandChip}>
                {brandLogoUrl ? (
                    <Image source={{ uri: brandLogoUrl }} style={styles.brandLogo} cachePolicy="memory-disk" />
                ) : (
                    <View style={styles.brandPlaceholder} />
                )}
                <Text style={styles.brandName}>{brandName.toUpperCase()}</Text>
            </View>

            {/* 5. Content Layer (Bottom) */}
            <View style={styles.contentLayer}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {title}
                </Text>
                {description && (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {description}
                    </Text>
                )}

                {/* Metadata Chips (Max 2) */}
                {(weatherTag || vibeTag) && (
                    <View style={styles.chipRow}>
                        {vibeTag && (
                            <View style={styles.metaChip}>
                                <Text style={styles.chipText}>{vibeTag}</Text>
                            </View>
                        )}
                        {weatherTag && (
                            <View style={styles.metaChip}>
                                <Text style={styles.chipText}>{weatherTag}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* 6. Outer Border (Subtle Layered Glass) */}
            <View style={styles.outerBorder} pointerEvents="none" />
        </View>
    );
});

// Skeleton State for Loading
const SkeletonCard = () => (
    <View style={[styles.cardContainer, styles.skeleton]}>
        <LinearGradient
            colors={['#1A1A1A', '#121212', '#1A1A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 26,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        overflow: 'hidden',
        position: 'relative',
    },
    skeleton: {
        backgroundColor: '#1A1A1A',
    },
    mediaLayer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
    },
    gradientOverlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    // Brand Chip (No BlurView - Performance)
    brandChip: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    brandLogo: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },
    brandPlaceholder: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        marginRight: 6,
    },
    brandName: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1.2,
    },
    // Content Layer
    contentLayer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 28,
        paddingBottom: 36,
    },
    cardTitle: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 26,
        color: COLORS.RITUAL_WHITE,
        lineHeight: 30,
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    cardSubtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 13,
        color: 'rgba(255,255,255,0.72)',
        marginBottom: 18,
        letterSpacing: 0.2,
    },
    // Metadata Chips
    chipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metaChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    chipText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    // Outer Border (Layered Glass Look)
    outerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
});
