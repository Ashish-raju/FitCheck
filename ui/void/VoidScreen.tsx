import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    FadeIn,
    withSequence,
    withDelay
} from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
// import { TYPOGRAPHY } from '../tokens'; // BYPASS FOR DEBUGGING
import { MOTION } from '../tokens/motion.tokens';

export const VoidScreen: React.FC = () => {
    const breathe = useSharedValue(0.4);
    const logoScale = useSharedValue(0.9);

    useEffect(() => {
        breathe.value = withRepeat(
            withTiming(1, { duration: MOTION.DURATIONS.AMBIENT_BREATHE }),
            -1,
            true
        );
        logoScale.value = withRepeat(
            withTiming(1.05, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const breatheStyle = useAnimatedStyle(() => ({
        opacity: breathe.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: 0.1 + (breathe.value * 0.1),
        transform: [{ scale: 1 + (breathe.value * 0.2) }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View
                entering={FadeIn.duration(1000)}
                style={styles.logoContainer}
            >
                <Animated.View style={[styles.glow, glowStyle]} />
                <Animated.View style={[styles.glowOuter, glowStyle]} />
                <Animated.Text style={[styles.logoText, logoStyle]}>FIT CHECK</Animated.Text>
            </Animated.View>

            <Animated.Text style={[styles.statusText, breatheStyle]}>
                SYNCHRONIZING STYLE DNA...
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontFamily: 'Inter', // TYPOGRAPHY.STACKS.PRIMARY
        fontSize: 32,
        fontWeight: '900', // TYPOGRAPHY.WEIGHTS.BLACK
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 12,
        textShadowColor: 'rgba(255, 255, 255, 0.2)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        borderRadius: 75,
    },
    glowOuter: {
        position: 'absolute',
        width: 250,
        height: 250,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        borderRadius: 125,
        opacity: 0.05,
    },
    statusText: {
        position: 'absolute',
        bottom: 80,
        fontFamily: 'Inter', // TYPOGRAPHY.STACKS.PRIMARY
        fontSize: 10,
        fontWeight: '700', // TYPOGRAPHY.WEIGHTS.BOLD
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 4,
    },
});
