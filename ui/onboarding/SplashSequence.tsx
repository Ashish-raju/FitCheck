import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { MOTION } from '../tokens/motion.tokens';

import { ritualMachine } from '../state/ritualMachine';

const { width, height } = Dimensions.get('window');

// interface SplashSequenceProps {
//     onComplete: () => void;
// }

export const SplashSequence: React.FC = () => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const textTranslateY = useSharedValue(20);
    const textOpacity = useSharedValue(0);
    const subTextOpacity = useSharedValue(0);
    const lineWidth = useSharedValue(0);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }]
    }));

    const subTextStyle = useAnimatedStyle(() => ({
        opacity: subTextOpacity.value,
    }));

    const lineStyle = useAnimatedStyle(() => ({
        width: lineWidth.value,
    }));

    useEffect(() => {
        // Sequence:
        // 1. Fade in container/bg
        // 2. Reveal "FIT CHECK"
        // 3. Draw line
        // 4. Reveal "Your Personal Stylist"
        // 5. Exit

        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, { duration: 1200, easing: MOTION.CURVES.EASE_OUT_EXPO });

        textTranslateY.value = withDelay(400, withSpring(0, MOTION.PHYSICS.SPRING_SNAPPY));
        textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

        lineWidth.value = withDelay(1000, withTiming(120, { duration: 600, easing: MOTION.CURVES.SMOOTH_FLOW }));

        subTextOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));

        // Exit after 3.5s
        setTimeout(() => {
            // onComplete();
            ritualMachine.toIntro();
        }, 3500);

    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, containerStyle]}>
                <View style={styles.iconPlaceholder}>
                    {/* Abstract "Style Spark" Icon */}
                    <View style={styles.sparkVertical} />
                    <View style={styles.sparkHorizontal} />
                </View>

                <Animated.View style={textStyle}>
                    <Text style={styles.title}>FIT CHECK</Text>
                </Animated.View>

                <Animated.View style={[styles.separator, lineStyle]} />

                <Animated.View style={subTextStyle}>
                    <Text style={styles.subtitle}>Your Personal Stylist, Every Day.</Text>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconPlaceholder: {
        width: 80,
        height: 80,
        marginBottom: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sparkVertical: {
        position: 'absolute',
        width: 4,
        height: 64,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        borderRadius: 2,
    },
    sparkHorizontal: {
        position: 'absolute',
        width: 64,
        height: 4,
        backgroundColor: COLORS.PLUM_VIOLET,
        borderRadius: 2,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.HERO,
        color: MATERIAL.TEXT_MAIN,
        letterSpacing: 4,
        textAlign: 'center',
    },
    separator: {
        height: 2,
        backgroundColor: MATERIAL.BORDER,
        marginTop: 16,
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: MATERIAL.TEXT_MUTED,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
