import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MOTION } from '../tokens/motion.tokens';

interface PressFeedbackConfig {
    activeScale?: number;
    haptic?: boolean;
}

export const usePressFeedback = ({
    activeScale = 0.96,
    haptic = true
}: PressFeedbackConfig = {}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const onPressIn = () => {
        'worklet';
        scale.value = withSpring(activeScale, MOTION.PHYSICS.SPRING_SNAPPY);
    };

    const onPressOut = () => {
        'worklet';
        scale.value = withSpring(1, MOTION.PHYSICS.SPRING_SNAPPY);
    };

    const onPress = () => {
        if (haptic) {
            // Haptics must be run on JS thread unless we use a worklet-compatible version or runOnJS
            // But expo-haptics is imperative. Use runOnJS if needed inside typical Reanimated callbacks.
            // But here, these handlers are returned to Props, so they run on JS thread usually.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    return {
        animatedStyle,
        pressHandlers: {
            onPressIn,
            onPressOut,
            onPress
        }
    };
};
