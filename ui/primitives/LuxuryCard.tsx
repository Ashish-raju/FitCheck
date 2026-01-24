import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from './GlassCard';
import { usePressFeedback } from '../hooks/usePressFeedback';

interface LuxuryCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    onLongPress?: () => void;
    activeScale?: number;
    selected?: boolean;
    delayPressIn?: number;
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
    children,
    style,
    onPress,
    onLongPress,
    activeScale = 0.96,
    selected = false,
    delayPressIn = 0
}) => {
    // 1. Shared Press Logic
    const { animatedStyle: pressStyle, pressHandlers } = usePressFeedback({ activeScale });

    // 2. Component Specific Logic (Border Color)
    const borderStyle = useAnimatedStyle(() => ({
        borderColor: withSpring(selected ? COLORS.ELECTRIC_COBALT : COLORS.SUBTLE_GRAY)
    }));

    const handlePress = () => {
        pressHandlers.onPress(); // Haptics
        onPress?.(); // User action
    };

    // Combine styles
    // Note: styles.container is just a wrapper, styles.glass handles the look
    return (
        <Animated.View style={[styles.container, pressStyle, borderStyle, style]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={pressHandlers.onPressIn}
                onPressOut={pressHandlers.onPressOut}
                onPress={handlePress}
                onLongPress={onLongPress}
                delayLongPress={300}
                delayPressIn={delayPressIn}
                style={{ flex: 1 }}
            >
                <GlassCard style={styles.glass}>
                    {children}
                </GlassCard>
                {selected && (
                    <View style={styles.checkBadge}>
                        <View style={styles.checkDot} />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Wrapper for animation, border is applied here usually?
        // Wait, GlassCard has border. 
        // If LuxuryCard acts as specific border container, we need border logic here.
        // Current implementation applies borderStyle to Animated.View.
        // But GlassCard has its own border.
        // If 'selected', we want to highlight.
        // We'll let GlassCard handle base border, and overlay a highlight?
        // OR, apply border to this wrapper.
        borderWidth: 1, // Base border width
        borderRadius: SPACING.RADIUS.MEDIUM,
    },
    glass: {
        flex: 1,
        borderRadius: SPACING.RADIUS.MEDIUM, // Match parent
        overflow: 'hidden',
        borderWidth: 0, // Disable GlassCard border to let parent handle it?
        // Or keep GlassCard border and just change color? 
        // GlassCard: borderColor: COLORS.SURFACE_BORDER
        // LuxuryCard override: borderColor: selected ? COBALT : SUBTLE_GRAY
        // To override, we must remove GlassCard's border or ensure this wrapper is visible.
        // Actually, if GlassCard is inside, this wrapper's border is OUTSIDE GlassCard.
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.VOID_BLACK,
    },
    checkDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.RITUAL_WHITE,
    }
});
