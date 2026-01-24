import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withSpring,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, MATERIAL } from '../tokens/color.tokens';

const { width } = Dimensions.get('window');

interface RitualRevealProps {
    isRevealed: boolean;
    children: React.ReactNode;
}

export const RitualReveal: React.FC<RitualRevealProps> = ({ isRevealed, children }) => {
    const blurIntensity = useSharedValue(20);
    const scale = useSharedValue(0.95);
    const overlayOpacity = useSharedValue(1);
    const shimmer = useSharedValue(-width);

    useEffect(() => {
        if (isRevealed) {
            // Reveal Sequence
            blurIntensity.value = withTiming(0, { duration: 800 });
            scale.value = withSpring(1, { damping: 12 });
            overlayOpacity.value = withTiming(0, { duration: 600 });

            // Shimmer effect
            shimmer.value = withDelay(400, withTiming(width * 2, { duration: 1000 }));
        }
    }, [isRevealed]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmer.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, containerStyle]}>
                {children}

                {/* Overlay & Blur for Locked State */}
                {/* Note: BlurView needs absolute positioning over content */}
                <Animated.View
                    style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
                    pointerEvents="none"
                >
                    <BlurView intensity={isRevealed ? 0 : 40} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={[StyleSheet.absoluteFill, styles.dimOverlay]} />
                </Animated.View>

                {/* Shimmer Light Layer */}
                <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
    },
    dimOverlay: {
        backgroundColor: COLORS.DEEP_NAVY,
        opacity: 0.3,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        transform: [{ skewX: '-20deg' }],
        zIndex: 10,
    }
});
