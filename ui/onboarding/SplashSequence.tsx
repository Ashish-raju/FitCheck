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
import { TYPOGRAPHY } from '../tokens';
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
    const hasNavigated = React.useRef(false);

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
        console.log('[SplashSequence] === MOUNT START ===');
        console.log('[SplashSequence] hasNavigated.current:', hasNavigated.current);

        const navigateToIntro = (source: string) => {
            console.log(`[SplashSequence] navigateToIntro called from: ${source}`);
            console.log('[SplashSequence] hasNavigated.current before check:', hasNavigated.current);

            if (!hasNavigated.current) {
                hasNavigated.current = true;
                console.log('[SplashSequence] >>> EXECUTING NAVIGATION TO INTRO <<<');
                try {
                    ritualMachine.toIntro();
                    console.log('[SplashSequence] ritualMachine.toIntro() completed');
                } catch (e) {
                    console.error('[SplashSequence] Navigation CRASHED:', e);
                }
            } else {
                console.log('[SplashSequence] Navigation already happened, skipping');
            }
        };

        // PRIMARY TIMER: Navigate after 2.5 seconds (after animations complete)
        console.log('[SplashSequence] Setting up primary timer (2500ms)');
        const primaryTimer = setTimeout(() => {
            console.log('[SplashSequence] PRIMARY TIMER FIRED');
            navigateToIntro('primaryTimer');
        }, 2500);

        // WATCHDOG TIMER: Force navigation after 4 seconds as backup
        console.log('[SplashSequence] Setting up watchdog timer (4000ms)');
        const watchdogTimer = setTimeout(() => {
            console.log('[SplashSequence] WATCHDOG TIMER FIRED');
            navigateToIntro('watchdog');
        }, 4000);

        // Sequence animations (these are purely for visual, not for navigation control)
        console.log('[SplashSequence] Starting animations');
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withTiming(1, { duration: 1200, easing: MOTION.CURVES.EASE_OUT_EXPO });
        textTranslateY.value = withDelay(400, withSpring(0, MOTION.PHYSICS.SPRING_SNAPPY));
        textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
        lineWidth.value = withDelay(1000, withTiming(120, { duration: 600, easing: MOTION.CURVES.SMOOTH_FLOW }));
        subTextOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
        console.log('[SplashSequence] Animations queued');

        console.log('[SplashSequence] === MOUNT COMPLETE ===');

        return () => {
            console.log('[SplashSequence] === UNMOUNT ===');
            hasNavigated.current = true;
            clearTimeout(primaryTimer);
            clearTimeout(watchdogTimer);
        };
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
