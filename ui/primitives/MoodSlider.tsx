import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import * as Haptics from 'expo-haptics';

interface MoodSliderProps {
    onValueChange: (value: number) => void;
    initialValue?: number;
}

/**
 * MoodSlider - A haptic-rich behavioral input for the daily ritual.
 * Maps 0.0 (Safe/Calm) to 1.0 (Confident/Bold).
 */
export const MoodSlider: React.FC<MoodSliderProps> = ({ onValueChange, initialValue = 0.5 }) => {
    const pan = useRef(new Animated.Value(initialValue)).current;
    const lastHapticValue = useRef(initialValue);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Simple mapping: width is assumed to be roughly screen width minus margins
                const newValue = Math.max(0, Math.min(1, gestureState.moveX / 300)); // Rough estimate for now
                pan.setValue(newValue);

                // Haptic feedback at intervals
                if (Math.abs(newValue - lastHapticValue.current) > 0.1) {
                    Haptics.selectionAsync();
                    lastHapticValue.current = newValue;
                }

                onValueChange(newValue);
            },
            onPanResponderRelease: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
        })
    ).current;

    const leftLabelOpacity = pan.interpolate({
        inputRange: [0, 0.5],
        outputRange: [1, 0.2],
        extrapolate: 'clamp',
    });

    const rightLabelOpacity = pan.interpolate({
        inputRange: [0.5, 1],
        outputRange: [0.2, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <View style={styles.labels}>
                <Animated.Text style={[styles.label, { opacity: leftLabelOpacity }]}>ANXIOUS</Animated.Text>
                <Animated.Text style={[styles.label, { opacity: rightLabelOpacity }]}>CONFIDENT</Animated.Text>
            </View>
            <View style={styles.track} {...panResponder.panHandlers}>
                <View style={styles.baseTrack} />
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            left: pan.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '90%'],
                            })
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: SPACING.GUTTER,
        marginVertical: SPACING.STACK.LARGE,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.STACK.TIGHT,
    },
    label: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.LABEL,
        color: COLORS.RITUAL_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: TYPOGRAPHY.TRACKING.WIDE,
    },
    track: {
        height: 40,
        justifyContent: 'center',
        position: 'relative',
    },
    baseTrack: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        width: '100%',
    },
    thumb: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
});
