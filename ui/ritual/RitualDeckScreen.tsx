import { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
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
    Easing
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY } from '../tokens';
import { CandidateStage } from './CandidateStage';
import { useBackgroundMotion } from '../system/background/BackgroundContext';
import { SPACING } from '../tokens/spacing.tokens';
import { useRitualState } from '../state/ritualProvider';
import { ritualMachine } from '../state/ritualMachine';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.30;
const HAPTIC_TRIGGER = width * 0.15; // Start haptics earlier
const MAX_ROTATION = 10;
const MAX_Y_DRIFT = 6;

export const RitualDeckScreen = () => {
    const navigation = useNavigation();
    const { candidateOutfits } = useRitualState();

    // Use REAL engine outfits instead of mock data
    const [deck, setDeck] = useState(candidateOutfits || []);

    // DEBUG: Log what outfits we're rendering
    useEffect(() => {
        console.log('[RitualDeckScreen] Rendering deck with', deck.length, 'outfits');
        if (deck.length > 0) {
            const firstOutfit = deck[0];
            console.log('[RitualDeckScreen] First outfit:', {
                id: firstOutfit.id,
                itemCount: firstOutfit.pieces?.length || 0,
                items: firstOutfit.pieces?.map(p => ({
                    id: p.id,
                    name: p.name,
                    imageUri: typeof p.imageUri === 'string' ? p.imageUri.substring(0, 50) + '...' : 'require()'
                }))
            });
        }
    }, [deck]);

    // Update deck when candidateOutfits changes OR when screen mounts
    useEffect(() => {
        if (candidateOutfits) {
            console.log('[RitualDeckScreen] Updating deck for new session:', candidateOutfits.length);
            setDeck(candidateOutfits);
        }
    }, [candidateOutfits]);

    const { panX } = useBackgroundMotion();
    const translateY = useSharedValue(0);

    // Next card promotion animation
    const nextCardScale = useSharedValue(0.94);
    const nextCardTranslateY = useSharedValue(14);
    const nextCardOpacity = useSharedValue(0);

    const activeCard = deck[0];
    const nextCard = deck[1];

    const hasTriggeredHaptic = useSharedValue(false);
    const isAnimatingOut = useRef(false);

    // Haptic loop refs
    const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const currentHapticDirection = useRef<'left' | 'right' | null>(null);

    useEffect(() => {
        panX.value = 0;
        nextCardScale.value = 0.94;
        nextCardTranslateY.value = 14;
        nextCardOpacity.value = 0;
        return () => {
            panX.value = 0;
            stopHapticLoop();
        };
    }, []);

    // ... HAPTIC LOGIC SAME AS BEFORE ...
    // Start continuous haptic loop
    const startHapticLoop = useCallback((direction: 'left' | 'right') => {
        if (currentHapticDirection.current === direction) return;

        stopHapticLoop();
        currentHapticDirection.current = direction;

        if (direction === 'right') {
            const doubleTap = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 60);
            };
            doubleTap();
            hapticIntervalRef.current = setInterval(doubleTap, 350);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            hapticIntervalRef.current = setInterval(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 50);
        }
    }, []);

    const stopHapticLoop = useCallback(() => {
        if (hapticIntervalRef.current) {
            clearInterval(hapticIntervalRef.current);
            hapticIntervalRef.current = null;
        }
        currentHapticDirection.current = null;
    }, []);

    const promoteNextCard = useCallback(() => {
        stopHapticLoop();

        // Immediately move next card to front positions (internal state)
        setDeck(prev => {
            const newDeck = prev.slice(1);

            // Reset animations for the NEW active card (which was the next card)
            panX.value = 0;
            translateY.value = 0;

            // Briefly wait for React to render before allowing new gestures
            setTimeout(() => {
                nextCardScale.value = 0.94;
                nextCardTranslateY.value = 14;
                nextCardOpacity.value = 0;
                isAnimatingOut.current = false;
            }, 300); // 300ms allows for visual settling

            return newDeck;
        });
    }, [stopHapticLoop]);

    const handleSeal = useCallback(() => {
        if (!activeCard) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // CRITICAL: Actually complete the ritual in the state machine
        ritualMachine.sealRitual(activeCard.id);
    }, [activeCard]);

    const handleVeto = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        if (deck.length <= 1) {
            // No more outfits - return home
            ritualMachine.toHome();
        } else {
            promoteNextCard();
        }
    }, [promoteNextCard, deck.length]);

    const handleSwipeHaptic = useCallback((translationX: number) => {
        if (translationX > HAPTIC_TRIGGER) {
            startHapticLoop('right');
        } else if (translationX < -HAPTIC_TRIGGER) {
            startHapticLoop('left');
        } else {
            stopHapticLoop();
        }
    }, [startHapticLoop, stopHapticLoop]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .onUpdate((event) => {
            if (isAnimatingOut.current) return;

            panX.value = event.translationX;
            translateY.value = clamp(event.translationY * 0.08, -MAX_Y_DRIFT, MAX_Y_DRIFT);

            runOnJS(handleSwipeHaptic)(event.translationX);

            const swipeProgress = Math.min(Math.abs(event.translationX) / (width * 0.5), 1);
            nextCardScale.value = interpolate(swipeProgress, [0, 1], [0.94, 1]);
            nextCardTranslateY.value = interpolate(swipeProgress, [0, 1], [14, 0]);
            nextCardOpacity.value = interpolate(swipeProgress, [0, 0.1, 1], [0, 0.4, 1]);
        })
        .onEnd((event) => {
            runOnJS(stopHapticLoop)();

            if (event.translationX > SWIPE_THRESHOLD) {
                isAnimatingOut.current = true;
                panX.value = withTiming(
                    width * 1.3,
                    { duration: 200, easing: Easing.out(Easing.quad) },
                    () => {
                        runOnJS(handleSeal)();
                    }
                );
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                isAnimatingOut.current = true;
                panX.value = withTiming(
                    -width * 1.3,
                    { duration: 200, easing: Easing.out(Easing.quad) },
                    () => {
                        runOnJS(handleVeto)();
                    }
                );
            } else {
                panX.value = withSpring(0, { damping: 18, stiffness: 180, mass: 0.8 });
                translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
                nextCardScale.value = withSpring(0.94, { damping: 15, stiffness: 150 });
                nextCardTranslateY.value = withSpring(14, { damping: 15, stiffness: 150 });
                nextCardOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
            }
        });

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            runOnJS(handleSeal)();
        });

    const combinedGesture = Gesture.Exclusive(panGesture, tapGesture);

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: panX.value },
            { translateY: translateY.value },
            { rotate: `${interpolate(panX.value, [-width, width], [-MAX_ROTATION, MAX_ROTATION], Extrapolation.CLAMP)}deg` }
        ] as const
    }));

    const nextCardStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: nextCardScale.value },
            { translateY: nextCardTranslateY.value }
        ] as const,
        opacity: nextCardOpacity.value
    }));

    if (deck.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Outfits Available</Text>
                <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>
                    Engine is generating recommendations...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {nextCard && (
                <Animated.View style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}>
                    <CandidateStage
                        outfit={nextCard}
                        userId={nextCard.id}
                    />
                </Animated.View>
            )}

            <GestureDetector gesture={combinedGesture}>
                <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
                    <CandidateStage
                        outfit={activeCard}
                        userId={activeCard.id}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    cardWrapper: {
        ...StyleSheet.absoluteFillObject,
    },
    nextCard: {
        zIndex: 0,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    emptyText: {
        color: COLORS.ASH_GRAY,
        fontSize: 16,
        letterSpacing: 2,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        marginBottom: 24,
    },
    regenButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    regenButtonText: {
        color: COLORS.ELECTRIC_BLUE,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
});
