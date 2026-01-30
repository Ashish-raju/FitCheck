import React, { useEffect } from 'react';
import { TouchableOpacity, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    Easing
} from 'react-native-reanimated';

// ------------------------------------------------------------------
// FadeInUp: Simple entry animation
// ------------------------------------------------------------------
export const FadeInUp: React.FC<{
    children: React.ReactNode;
    delay?: number;
    style?: StyleProp<ViewStyle>;
}> = ({ children, delay = 0, style }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
        translateY.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <Animated.View style={[style, animStyle]}>
            {children}
        </Animated.View>
    );
};

// ------------------------------------------------------------------
// PressScale: Subtle scale feedback
// ------------------------------------------------------------------
export const PressScale: React.FC<{
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}> = ({ children, onPress, style, scaleTo = 0.98 }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(scaleTo, { stiffness: 300, damping: 20 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    };

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
            <Animated.View style={[style, animStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
