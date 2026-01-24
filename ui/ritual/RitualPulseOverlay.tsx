import React, { useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    withRepeat,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens'; // Assuming color tokens exist here or will need import adjustment

const { width } = Dimensions.get('window');

// --- TYPES ---
export interface RitualPulseHandle {
    triggerRevealStart: () => void;
    triggerRevealSuccess: () => void;
    triggerLogSuccess: () => void;
    triggerStreakIncrement: () => void;
    reset: () => void;
}

// --- CONSTANTS ---
const PULSE_IDLE_DURATION = 4000; // 4s breathe
const PULSE_REVEAL_DURATION = 1500;

export const RitualPulseOverlay = forwardRef<RitualPulseHandle, {}>((props, ref) => {
    // --- ANIMATION VALUES ---
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    // Additional "Bloom" layer for success states
    const bloomOpacity = useSharedValue(0);
    const bloomScale = useSharedValue(0.8);

    useImperativeHandle(ref, () => ({
        triggerRevealStart: () => {
            // Subtle faster pulse
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.05, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            );
        },
        triggerRevealSuccess: () => {
            // Single bloom
            cancelAnimation(opacity);
            opacity.value = 0;

            bloomOpacity.value = 0.4;
            bloomScale.value = 0.8;

            bloomOpacity.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) });
            bloomScale.value = withSpring(1.5, { damping: 20 });
        },
        triggerLogSuccess: () => {
            // Stronger bloom + quick shimmer
            bloomOpacity.value = 0.6;
            bloomScale.value = 0.5;

            bloomOpacity.value = withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) });
            bloomScale.value = withSpring(2.0, { damping: 15, stiffness: 90 });
        },
        triggerStreakIncrement: () => {
            // Heartbeat
            bloomOpacity.value = 0.3;
            bloomScale.value = 1;

            bloomScale.value = withSequence(
                withTiming(1.2, { duration: 150 }),
                withTiming(1.0, { duration: 150 }),
                withTiming(1.2, { duration: 150 }),
                withTiming(1.0, { duration: 300 })
            );
            bloomOpacity.value = withTiming(0, { duration: 800 });
        },
        reset: () => {
            // Back to Idle
            cancelAnimation(opacity);
            cancelAnimation(scale);

            // Idle Pulse
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.08, { duration: PULSE_IDLE_DURATION, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.02, { duration: PULSE_IDLE_DURATION, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            );
        }
    }));

    // Start Idle on mount
    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.08, { duration: PULSE_IDLE_DURATION, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.02, { duration: PULSE_IDLE_DURATION, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );
    }, []);

    // --- STYLES ---
    const pulseStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const bloomStyle = useAnimatedStyle(() => ({
        opacity: bloomOpacity.value,
        transform: [{ scale: bloomScale.value }]
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {/* IDLE / REVEAL LAYER */}
            <Animated.View style={[styles.pulseCircle, pulseStyle]} />

            {/* SUCCESS BLOOM LAYER */}
            <Animated.View style={[styles.bloomCircle, bloomStyle]} />
        </View>
    );
});

// Helper removed, using Reanimated's withRepeat directly

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0, // Behind cards
    },
    pulseCircle: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: COLORS.KINETIC_SILVER || 'white',
        // We use a simple solid circle with low opacity. 
        // For "Cool Chrome + Faint Violet", we could use a radical gradient if we want to be fancy, 
        // but simple color with opacity is cheaper.
    },
    bloomCircle: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: '#A0A0FF', // Faint Violet
        position: 'absolute',
    }
});
