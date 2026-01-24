import { useState, useCallback, useEffect } from 'react';
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
    interpolateColor
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../tokens/color.tokens';
import { RitualCard } from './RitualCard';
import { useBackgroundMotion } from '../system/background/BackgroundContext';
import { ritualMachine } from '../state/ritualMachine';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

// Mock Data (Move to Provider later)
const MOCK_DECK = [
    {
        id: '1',
        title: 'Zenith Breathwork',
        brand: 'Ritual',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop',
        desc: 'Start your day with clarity.'
    },
    {
        id: '2',
        title: 'Hydration Boost',
        brand: 'Health',
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1000&auto=format&fit=crop',
        desc: 'Drink 500ml of water.'
    },
    {
        id: '3',
        title: 'Daily Walk',
        brand: 'Movement',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1000&auto=format&fit=crop',
        desc: 'Get some fresh air.'
    }
];

export const RitualDeckScreen = () => {
    const navigation = useNavigation();
    const [deck, setDeck] = useState(MOCK_DECK);

    // Connect to global background motion for the "Wave" effect
    const { panX } = useBackgroundMotion();

    // Local standard values for the card logic
    // We sync panX to these or vice versa? 
    // Better to use panX as the source of truth for Swipe X

    // Y is strictly 0
    const translateY = useSharedValue(0);

    const cardScale = useSharedValue(1);
    const nextCardScale = useSharedValue(0.95);
    const nextCardOpacity = useSharedValue(0.6);

    const activeCard = deck[0];
    const nextCard = deck[1];

    // Haptic Feedback Triggers
    const hasTriggeredHaptic = useSharedValue(false);

    useEffect(() => {
        // Reset on mount
        panX.value = 0;
        return () => {
            panX.value = 0;
        };
    }, []);

    const handleSeal = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // console.log('SEALED:', activeCard?.title);
        // ritualMachine.sealRitual(activeCard.id); // If we were using real data
        removeTopCard();
    }, [activeCard, deck]);

    const handleVeto = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // console.log('VETOED:', activeCard?.title);
        removeTopCard();
    }, [activeCard, deck]);

    const removeTopCard = () => {
        // Reset values for next card instantly
        panX.value = 0;
        translateY.value = 0;
        cardScale.value = 1;
        nextCardScale.value = 0.95;
        nextCardOpacity.value = 0.6;

        setDeck(prev => prev.slice(1));
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            panX.value = event.translationX;
            // STRICTLY ZERO Vertical movement for Tinder feel
            translateY.value = 0;

            // Haptics at threshold
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !hasTriggeredHaptic.value) {
                runOnJS(Haptics.selectionAsync)();
                hasTriggeredHaptic.value = true;
            } else if (Math.abs(event.translationX) < SWIPE_THRESHOLD && hasTriggeredHaptic.value) {
                hasTriggeredHaptic.value = false;
            }

            // Animate next card visibility
            const swipeProgress = Math.min(Math.abs(event.translationX) / (width * 0.5), 1);
            nextCardScale.value = interpolate(swipeProgress, [0, 1], [0.95, 1]);
            nextCardOpacity.value = interpolate(swipeProgress, [0, 1], [0.6, 1]);
        })
        .onEnd((event) => {
            hasTriggeredHaptic.value = false;

            if (event.translationX > SWIPE_THRESHOLD) {
                // SEAL (Right)
                panX.value = withTiming(width + 200, { duration: 250 }, () => {
                    runOnJS(handleSeal)();
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // VETO (Left)
                panX.value = withTiming(-width - 200, { duration: 250 }, () => {
                    runOnJS(handleVeto)();
                });
            } else {
                // Reset (Spring back)
                panX.value = withSpring(0, { damping: 14, stiffness: 150 });
                translateY.value = withSpring(0);
                nextCardScale.value = withSpring(0.95);
                nextCardOpacity.value = withSpring(0.6);
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: panX.value },
            { translateY: translateY.value }, // Will be 0
            { rotate: `${interpolate(panX.value, [-width, width], [-10, 10])}deg` }
        ]
    }));

    const nextCardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: nextCardScale.value }],
        opacity: nextCardOpacity.value
    }));

    // NO LABELS "VETO"/"SEAL" - Purely visual
    // Background tint handled by wrapper or AppBackground

    if (deck.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>All Done For Today</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Next Card (Underneath) */}
            {nextCard && (
                <Animated.View style={[styles.cardWrapper, nextCardStyle]}>
                    <RitualCard
                        title={nextCard.title}
                        brandName={nextCard.brand}
                        imageUrl={nextCard.image}
                        description={nextCard.desc}
                        coinCost={300}
                    />
                </Animated.View>
            )}

            {/* Active Card (Top) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
                    <RitualCard
                        title={activeCard.title}
                        brandName={activeCard.brand}
                        imageUrl={activeCard.image}
                        description={activeCard.desc}
                        coinCost={500}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardWrapper: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: COLORS.ASH_GRAY,
        fontSize: 18,
        letterSpacing: 2,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    }
});
