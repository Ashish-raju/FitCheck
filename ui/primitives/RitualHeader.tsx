import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    FadeInLeft,
    FadeIn
} from 'react-native-reanimated';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { MOTION } from '../tokens/motion.tokens';

interface RitualHeaderProps {
    title: string;
    subtitle?: string;
    showPulse?: boolean;
}

/**
 * RitualHeader - High-prestige typography unit for ritual dates and headers.
 * Now featuring neural pulse micro-interactions.
 */
export const RitualHeader: React.FC<RitualHeaderProps> = ({ title, subtitle, showPulse = true }) => {
    const pulseOpacity = useSharedValue(0.4);

    useEffect(() => {
        pulseOpacity.value = withRepeat(
            withTiming(1, { duration: MOTION.DURATIONS.AMBIENT_BREATHE / 2 }),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {showPulse && <Animated.View style={[styles.pulseDot, pulseStyle]} />}
                {subtitle && (
                    <Animated.Text
                        entering={FadeInLeft.delay(100).duration(MOTION.DURATIONS.RITUAL_TRANSITION)}
                        style={styles.subtitle}
                    >
                        {subtitle.toUpperCase()}
                    </Animated.Text>
                )}
            </View>
            <Animated.Text
                entering={FadeIn.delay(300).duration(MOTION.DURATIONS.SNAPPY)}
                style={styles.title}
            >
                {title}
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.STACK.LARGE,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.STACK.TIGHT,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        marginRight: 8,
        shadowColor: COLORS.ELECTRIC_COBALT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.LABEL,
        color: COLORS.ELECTRIC_COBALT,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: TYPOGRAPHY.TRACKING.WIDE,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.HERO,
        color: COLORS.RITUAL_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        letterSpacing: TYPOGRAPHY.TRACKING.TIGHT,
    },
});
