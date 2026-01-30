import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

interface DraggableItemProps {
    id: string;
    imageUri: string | number; // Support local (number) or remote (string)
    initialX: number;
    initialY: number; // 0-1 (normalized) or absolute? Let's use absolute for now, simplified.
    initialScale?: number;
    initialRotation?: number; // radians
    isActive: boolean;
    onTap: () => void;
    onChange: (changes: { x: number; y: number; scale: number; rotate: number }) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
    id,
    imageUri,
    initialX,
    initialY,
    initialScale = 1,
    initialRotation = 0,
    isActive,
    onTap,
    onChange,
}) => {
    // Shared Values
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scale = useSharedValue(initialScale);
    const rotate = useSharedValue(initialRotation);
    const zIndex = useSharedValue(isActive ? 100 : 1);

    // Track previous values for gesture continuity
    const ctx = useSharedValue({ x: 0, y: 0, scale: 1, rotate: 0 });

    // React to active state change
    React.useEffect(() => {
        console.log(`[DraggableItem] Mounted ${id} at ${initialX},${initialY}`);
        zIndex.value = isActive ? 100 : 1;
    }, [isActive]);

    // Pan Gesture
    const pan = Gesture.Pan()
        .onStart(() => {
            'worklet';
            ctx.value = { ...ctx.value, x: translateX.value, y: translateY.value };
            if (onTap) runOnJS(onTap)();
        })
        .onUpdate((e) => {
            'worklet';
            translateX.value = ctx.value.x + e.translationX;
            translateY.value = ctx.value.y + e.translationY;
        })
        .onEnd(() => {
            'worklet';
            if (onChange) {
                runOnJS(onChange)({
                    x: translateX.value,
                    y: translateY.value,
                    scale: scale.value,
                    rotate: rotate.value,
                });
            }
        });

    // Pinch Gesture
    const pinch = Gesture.Pinch()
        .onStart(() => {
            'worklet';
            ctx.value = { ...ctx.value, scale: scale.value };
            if (onTap) runOnJS(onTap)();
        })
        .onUpdate((e) => {
            'worklet';
            scale.value = ctx.value.scale * e.scale;
        })
        .onEnd(() => {
            'worklet';
            if (onChange) {
                runOnJS(onChange)({
                    x: translateX.value,
                    y: translateY.value,
                    scale: scale.value,
                    rotate: rotate.value,
                });
            }
        });

    // Rotation Gesture - DISABLED TEMPORARILY due to crash suspicion
    /*
    const rotation = Gesture.Rotation()
        .onStart(() => {
            'worklet';
            ctx.value = { ...ctx.value, rotate: rotate.value };
            if (onTap) runOnJS(onTap)();
        })
        .onUpdate((e) => {
            'worklet';
            rotate.value = ctx.value.rotate + e.rotation;
        })
        .onEnd(() => {
            'worklet';
            if (onChange) runOnJS(onChange)({ ... });
        });
    */

    // Compose gestures: Allow simultaneous Pan, Pinch
    const gesture = Gesture.Simultaneous(pan, pinch);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            // zIndex: zIndex.value, // Z-Index can be flaky in Reanimated on some versions
            // Shadows removed for stability testing
            // shadowColor: isActive ? '#4CD964' : '#000',
            // shadowOffset: { width: 0, height: 4 },
            // shadowOpacity: isActive ? 0.5 : 0.3,
            // shadowRadius: isActive ? 8 : 4,
            borderColor: isActive ? 'rgba(76, 217, 100, 0.5)' : 'transparent',
            borderWidth: isActive ? 1 : 0,
        } as any;
    }); // Explicit cast to any for the RETURNED object to suppress strict Reanimated types

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.itemContainer, animatedStyle]}>
                <Image
                    source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
                    style={styles.image}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                />
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        position: 'absolute',
        width: 150, // Base size
        height: 150,
        // Center anchor point logic is implicit in transforms usually, standard View origin is top-left but transforms apply from center? 
        // Reanimated defaults to center origin for transforms.
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
