import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SPACING } from '../tokens/spacing.tokens';

interface GlassCardProps {
    children: React.ReactNode;
    style?: any;
    noPadding?: boolean;
    intensity?: number;
}

/**
 * GlassCard - The primary material unit for Fit Check.
 * Implements the "Liquid Glass" aesthetic using expo-blur and reflection streaks.
 */
export const GlassCard: React.FC<GlassCardProps> = memo(({
    children,
    style,
    noPadding = false,
    intensity = 20 // Lower for "Acrylic" feel
}) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Acrylic Surface Layers - Top Highlight & Gradient */}
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255,255,255,0.02)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 0.8 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Inner Vignette / Grain (Simulated) */}
            <View style={styles.vignetteOverlay} />

            <View style={[styles.blurLayer, noPadding && { padding: 0 }]}>
                {children}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        borderRadius: 22, // Radius 18-22
        overflow: 'hidden',
        backgroundColor: 'rgba(18, 18, 20, 0.9)', // Near-black base
    },
    vignetteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle vignette/quiet feel
    },
    blurLayer: {
        padding: SPACING.CARD.HORIZONTAL_PADDING,
        flex: 1,
    }
});
