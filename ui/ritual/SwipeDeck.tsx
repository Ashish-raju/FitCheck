import React, { useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
    clamp,
    Easing,
    SharedValue,
    useAnimatedReaction
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Outfit } from '../../truth/types';
import { SwipeCard } from './SwipeCard';
import { ritualMachine } from '../state/ritualMachine';
import { useBackgroundMotion } from '../system/background/BackgroundContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.30;
const MAX_ROTATION = 12; // 8-12 degrees as requested
const MAX_Y_DRIFT = 6; // Clamped to [-6, +6]
const OFF_SCREEN = width * 1.2;
const TRANSITION_DURATION = 220; // 180-240ms

interface SwipeDeckProps {
    data: Outfit[];
    onIndexChange?: (index: number) => void;
}

export const SwipeDeck = ({ data, onIndexChange }: SwipeDeckProps) => {
    // --- 1. STATE & POINTERS ---
    const [topIndex, setTopIndex] = useState(0);
    const { panX: globalPanX } = useBackgroundMotion(); // Hook into background lights

    // Performance logs
    const releaseTimeRef = useRef<number>(0);

    // Haptics State
    const hasTriggeredHaptic = useSharedValue(false);

    // --- 2. SHARED VALUES ---
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Scale values for next/third cards to animate smooth promotion
    const nextCardScale = useSharedValue(0.96);
    const thirdCardScale = useSharedValue(0.92);

    // --- 3. DERIVED DATA ---
    const visibleCards = useMemo(() => {
        // Safe slice, if we are near end, we might get fewer items
        return [
            data[topIndex],
            data[topIndex + 1],
            data[topIndex + 2]
        ].filter(Boolean);
    }, [data, topIndex]);

    // --- 4. IMAGE PREFETCHING ---
    useEffect(() => {
        if (!data || data.length === 0) return;

        const urlsToPrefetch: string[] = [];
        for (let i = topIndex; i < topIndex + 6; i++) {
            if (data[i]) {
                const outfit = data[i];
                // Combine all piece images
                outfit.pieces.forEach(p => {
                    if (typeof p.imageUri === 'string' && !p.imageUri.startsWith('data:')) {
                        urlsToPrefetch.push(p.imageUri);
                    }
                });
            }
        }

        if (urlsToPrefetch.length > 0) {
            Image.prefetch(urlsToPrefetch).then(() => {
                if (__DEV__) console.log(`[DECK] Prefetched ${urlsToPrefetch.length} images for index ${topIndex}`);
            });
        }
    }, [topIndex, data]);

    // --- 5. ANIMATION LOGIC ---

    const handleCommit = useCallback((direction: 'left' | 'right') => {
        const timeToNext = Date.now() - releaseTimeRef.current;
        if (__DEV__) {
            console.log(`[DECK] Committing ${direction.toUpperCase()} | Index: ${topIndex} -> ${topIndex + 1} | TimeToNext: ${timeToNext}ms`);
        }

        // Action
        const currentItem = data[topIndex];
        if (currentItem) {
            if (direction === 'right') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                ritualMachine.sealRitual(currentItem.id);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                ritualMachine.vetoRitual(currentItem.id);
            }
        }

        // 1. Increment index (State update - triggers render)
        setTopIndex(prev => prev + 1);
        if (onIndexChange) onIndexChange(topIndex + 1);

        // 2. Reset shared values *immediately* for the new top card?
        // Wait! usage of `data[topIndex]` implies that after setTopIndex, the components shift.
        // If we reset values immediately, the "new" top card starts at 0.
        // The "old" top card is removed from DOM.

        // CRITICAL: We need to coordinate the reset with the React render.
        // When `topIndex` changes, `visibleCards` updates.
        // Card at index 0 becomes the *new* card.
        // We must ensure `translateX` is 0 for the new Card 0.

        // Reset scales for the nice spring up effect
        // nextCardScale was 0.96 (visual size of next), now it becomes TOP so it should be 1.0 (handled by layout/styles typically, 
        // but here we want to Animate it).
        // Actually, in this architecture "Render exactly 3 cards", we likely want the NEW top card to technically scale up from 0.96 to 1.
        // But since we just swapped the data, the View that WAS 'Next' is now 'Top'? 
        // No, React might re-use the views or map them by content. The array changed.

        // Let's use a stable non-react-state animation trigger.
        // We can just animate a 'promotion' value from 0 to 1.

    }, [data, topIndex, onIndexChange]); // Removed shared values from dependency as we don't reset them here

    // Reset values when index changes (after commit)
    React.useLayoutEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
        globalPanX.value = 0; // Reset background light
        hasTriggeredHaptic.value = false;

        // Reset scales to initial state for the new cards
        nextCardScale.value = 0.96;
        thirdCardScale.value = 0.92;
    }, [topIndex]);


    // --- 6. GESTURES ---

    // Animation Styles

    // Card 0 (Top)
    const topCardStyle = useAnimatedStyle(() => {
        return {
            zIndex: 3,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${interpolate(translateX.value, [-width, width], [-MAX_ROTATION, MAX_ROTATION])}deg` }
            ]
        } as any;
    });

    // Card 1 (Next)
    const nextCardStyle = useAnimatedStyle(() => {
        const progress = Math.min(Math.abs(translateX.value) / (width * 0.5), 1);
        const scale = interpolate(progress, [0, 1], [0.96, 1.0], Extrapolation.CLAMP);
        // User Request: Opacity 0% until 50% swipe progress, then fade in.
        const opacity = interpolate(progress, [0.5, 1], [0, 1], Extrapolation.CLAMP);

        return {
            zIndex: 2,
            transform: [{ scale }],
            opacity
        } as any;
    });

    // Card 2 (Third)
    const thirdCardStyle = useAnimatedStyle(() => {
        const progress = Math.min(Math.abs(translateX.value) / (width * 0.5), 1);
        const scale = interpolate(progress, [0, 1], [0.92, 0.96], Extrapolation.CLAMP);
        // Third card stays invisible. It moves into "Next" slot which is also invisible at rest.
        const opacity = 0;

        return {
            zIndex: 1,
            transform: [{ scale }],
            opacity
        } as any;
    });


    // Haptics Management
    const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentHapticDir = useRef<'left' | 'right' | null>(null);

    const stopHaptics = useCallback(() => {
        if (hapticIntervalRef.current) {
            clearInterval(hapticIntervalRef.current);
            hapticIntervalRef.current = null;
        }
        currentHapticDir.current = null;
    }, []);

    const triggerHaptics = useCallback((direction: 'left' | 'right') => {
        if (currentHapticDir.current === direction) return;

        stopHaptics();
        currentHapticDir.current = direction;

        if (direction === 'right') {
            // Heartbeat Pattern: Bum-bum... Bum-bum...
            const heartbeat = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }, 100);
            };
            heartbeat(); // Immediate
            hapticIntervalRef.current = setInterval(heartbeat, 800);
        } else {
            // Continuous Pattern: Warning vibration
            const vibrate = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            };
            vibrate(); // Immediate
            hapticIntervalRef.current = setInterval(vibrate, 150); // Fast pulse
        }
    }, [stopHaptics]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopHaptics();
            globalPanX.value = 0; // CRITICAL: Reset background lights when deck unmounts/navigates
        };
    }, [stopHaptics, globalPanX]);

    // ...

    const pan = Gesture.Pan()
        .activeOffsetX([-10, 10]) // Don't trigger on vertical scroll attempts
        .onUpdate((e) => {
            translateX.value = e.translationX;
            globalPanX.value = e.translationX; // Drive background lights
            translateY.value = clamp(e.translationY, -MAX_Y_DRIFT, MAX_Y_DRIFT);

            // Haptic Control
            const threshold = width * 0.15;
            if (e.translationX > threshold) {
                runOnJS(triggerHaptics)('right');
            } else if (e.translationX < -threshold) {
                runOnJS(triggerHaptics)('left');
            } else if (Math.abs(e.translationX) < threshold) {
                runOnJS(stopHaptics)();
            }
        })
        .onEnd((e) => {
            runOnJS(stopHaptics)(); // Stop immediately on release

            const velocity = e.velocityX;
            const translation = e.translationX;

            // Commit Logic
            let targetX = 0;
            let shouldCommit = false;
            let direction: 'left' | 'right' = 'right';

            if (translation > SWIPE_THRESHOLD || (translation > 30 && velocity > 800)) {
                targetX = OFF_SCREEN;
                shouldCommit = true;
                direction = 'right';
            } else if (translation < -SWIPE_THRESHOLD || (translation < -30 && velocity < -800)) {
                targetX = -OFF_SCREEN;
                shouldCommit = true;
                direction = 'left';
            }

            if (shouldCommit) {
                // Animate to off-screen
                translateX.value = withTiming(targetX, {
                    duration: TRANSITION_DURATION,
                    easing: Easing.out(Easing.quad)
                }, (finished) => {
                    if (finished) {
                        runOnJS(handleCommit)(direction);
                    }
                });
                // Animate background light to max intensity then reset
                globalPanX.value = withTiming(targetX);
            } else {
                // Spring back
                translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
                translateY.value = withSpring(0);
                globalPanX.value = withSpring(0); // Reset lights
            }
        });

    // --- 7. RENDER ---

    // Safety check
    if (visibleCards.length === 0) {
        return <View style={styles.emptyContainer} />;
    }

    return (
        <View style={styles.container}>
            {/* 
                Render Order: 
                We want top card LAST in DOM so it's on top of Z-stack naturally if zIndex doesn't work, 
                but we are using absolute position + zIndex. 
                Iterate reverse so Card 2 is first, then 1, then 0.
             */}
            {[2, 1, 0].map(offset => {
                const item = visibleCards[offset];
                if (!item) return null;

                // Determine style based on offset
                let style;
                // Use Animated.View for all to satisfy types and simplicity
                const TagWrapper = Animated.View as any;
                let gestureDesc = undefined;

                if (offset === 0) {
                    style = topCardStyle;
                    gestureDesc = pan;
                } else if (offset === 1) {
                    style = nextCardStyle;
                } else {
                    style = thirdCardStyle;
                }

                // Actual Card Component
                const cardContent = (
                    <TagWrapper style={[styles.cardWrapper, style]} key={`card-${item.id}`}>
                        <SwipeCard
                            item={item}
                            userId={item.id}
                            priority={offset === 0 ? 'high' : 'normal'}
                        />
                    </TagWrapper>
                );

                if (offset === 0) {
                    return (
                        <GestureDetector gesture={gestureDesc!} key={item.id}>
                            {cardContent}
                        </GestureDetector>
                    );
                }

                return (
                    <React.Fragment key={item.id}>
                        {cardContent}
                    </React.Fragment>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Transparent background as requested
        backgroundColor: 'transparent',
    },
    cardWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});
