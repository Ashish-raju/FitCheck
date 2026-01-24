import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withDelay, ZoomIn } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { MOTION } from '../tokens/motion.tokens';
import * as Haptics from 'expo-haptics';

interface FloatingFABProps {
    onPress: () => void;
    icon?: string;
    label?: string;
}

export const FloatingFAB: React.FC<FloatingFABProps> = ({ onPress, icon = "+", label }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        scale.value = withSequence(
            withSpring(0.9, MOTION.SPRINGS.SNAPPY),
            withSpring(1, MOTION.SPRINGS.BUTTERY)
        );
        onPress();
    };

    return (
        <Animated.View entering={ZoomIn.delay(500)} style={[styles.container, animatedStyle]}>
            <TouchableOpacity
                style={styles.touchable}
                activeOpacity={1}
                onPress={handlePress}
            >
                <View style={styles.content}>
                    <Text style={styles.icon}>{icon}</Text>
                    {label && <Text style={styles.label}>{label}</Text>}
                </View>
                <View style={styles.glow} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        zIndex: 100,
    },
    touchable: {
        minWidth: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.ELECTRIC_COBALT,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        paddingHorizontal: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        fontSize: 32,
        color: COLORS.RITUAL_WHITE,
        fontWeight: '300',
        marginTop: -2
    },
    label: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    glow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderWidth: 1,
        borderColor: COLORS.ELECTRIC_COBALT,
        borderRadius: 40,
        opacity: 0.3,
    }
});
