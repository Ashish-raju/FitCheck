import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, Image, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    runOnJS,
    WithSpringConfig,
    withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface SimpleDraggableItemProps {
    id: string;
    imageUri: string | number; // Support local requires (mocks) and string URIs
    initialX: number;
    initialY: number;
    initialScale?: number;
    isActive: boolean;
    onTap?: () => void;
    onChange?: (transform: { x: number; y: number; scale: number }) => void;
}

export const SimpleDraggableItem: React.FC<SimpleDraggableItemProps> = ({
    id,
    imageUri,
    initialX,
    initialY,
    initialScale = 1,
    isActive,
    onTap,
    onChange,
}) => {
    // Shared Values (Source of Truth on UI Thread)
    const offsetX = useSharedValue(initialX);
    const offsetY = useSharedValue(initialY);
    const scale = useSharedValue(initialScale);

    // Track start values for gestures
    const startX = useSharedValue(initialX);
    const startY = useSharedValue(initialY);
    const startScale = useSharedValue(initialScale);

    // Initial Sync (if props change from outside - restored from DraftStore)
    useEffect(() => {
        offsetX.value = initialX;
        offsetY.value = initialY;
        scale.value = initialScale;
    }, [initialX, initialY, initialScale]);

    // --- GESTURES ---

    // 1. PAN (Drag)
    const panGesture = Gesture.Pan()
        .averageTouches(false)
        .onStart(() => {
            startX.value = offsetX.value;
            startY.value = offsetY.value;

            if (onTap) runOnJS(onTap)();
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        })
        .onUpdate((e) => {
            offsetX.value = startX.value + e.translationX;
            offsetY.value = startY.value + e.translationY;
        })
        .onEnd(() => {
            if (onChange) {
                runOnJS(onChange)({
                    x: offsetX.value,
                    y: offsetY.value,
                    scale: scale.value,
                });
            }
        });

    // 2. PINCH (Zoom)
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            startScale.value = scale.value;
        })
        .onUpdate((e) => {
            const newScale = startScale.value * e.scale;
            // Clamp between 0.5x and 3x
            scale.value = Math.max(0.5, Math.min(3, newScale));
        })
        .onEnd(() => {
            if (onChange) {
                runOnJS(onChange)({
                    x: offsetX.value,
                    y: offsetY.value,
                    scale: scale.value,
                });
            }
        });

    // Combine them to allow simultaneous interaction
    const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    // --- ANIMATED STYLE ---
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
                { scale: scale.value }
            ],
            zIndex: isActive ? 100 : 1 // Bring to front if active
        } as any;
    });

    // Safe Image Source Logic
    // React Native Image expects number (require) or { uri: string }
    const imageSource = typeof imageUri === 'string' ? { uri: imageUri } : imageUri;

    return (
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
            <GestureDetector gesture={composedGesture}>
                <Animated.View style={{ width: '100%', height: '100%' }}>
                    <Image
                        source={imageSource}
                        style={[
                            styles.image,
                            isActive && styles.activeImage
                        ]}
                        resizeMode="contain"
                    />
                    {/* Visual Border for active state */}
                    {isActive && <Animated.View style={styles.activeBorder} />}
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        position: 'absolute',
        width: 120, // Base size
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    activeImage: {
        opacity: 0.9,
    },
    activeBorder: {
        position: 'absolute',
        width: '110%',
        height: '110%',
        borderWidth: 1,
        borderColor: '#FFF',
        borderRadius: 8,
        borderStyle: 'dashed',
        pointerEvents: 'none',
    },
});
