import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';

interface GlassCardProps {
    children: React.ReactNode;
    style?: any;
}

/**
 * GlassCard - The primary material unit for Fit Check.
 * Implements the "Glass & Gravity" aesthetic using transparency and borders.
 * Optimized for Android: Uses Gradient + Border instead of Elevation/Blur.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[COLORS.SURFACE_GLASS, COLORS.GLASS_SURFACE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            <View style={styles.blurLayer}>
                {children}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: COLORS.SURFACE_GLASS, // Replaced by Gradient
        borderRadius: SPACING.RADIUS.LARGE,
        borderWidth: 1,
        borderColor: COLORS.SURFACE_BORDER,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 }, // Reduced shadow
                shadowOpacity: 0.2, // Reduced opacity
                shadowRadius: 8, // Reduced radius
            },
            android: {
                // elevation: 0, // REMOVED ELEVATION
            },
        }),
    },
    blurLayer: {
        padding: SPACING.CARD.HORIZONTAL_PADDING,
        flex: 1,
    },
});
