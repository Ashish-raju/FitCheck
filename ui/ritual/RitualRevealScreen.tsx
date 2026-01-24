import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from '../primitives/GlassCard';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ritual'>; // 'Ritual' is the route name for this screen

export const RitualRevealScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // Animations
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const buttonScale = useSharedValue(1);

    React.useEffect(() => {
        // Entrance Animation
        opacity.value = withTiming(1, { duration: 800 });
        scale.value = withSpring(1, { damping: 12 });
    }, []);

    const handleReveal = () => {
        // Button press effect
        buttonScale.value = withSpring(0.95, {}, () => {
            buttonScale.value = withSpring(1);
        });

        // Transition Sequence
        // 1. Fade out content slightly
        opacity.value = withTiming(0, { duration: 400 }, (finished) => {
            if (finished) {
                runOnJS(navigateToDeck)();
            }
        });
    };

    const navigateToDeck = () => {
        navigation.replace('RitualDeck'); // Use replace to prevent going back to reveal
    };

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }]
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, containerStyle]}>
                <View style={styles.textContainer}>
                    <Text style={styles.kicker}>DAILY RITUAL</Text>
                    <Text style={styles.heading}>Your fit is ready.</Text>
                    <Text style={styles.subheading}>
                        Our stylists have curated a look based on your schedule and the weather (12°C).
                    </Text>
                </View>

                <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={handleReveal}
                        style={styles.revealButton}
                    >
                        <Text style={styles.buttonText}>REVEAL TODAY'S FIT</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Background is handled by LivingBackground via transparent nav
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.GUTTER,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    textContainer: {
        marginBottom: 60,
        alignItems: 'center',
    },
    kicker: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY, // Monospace ideally
        fontSize: 12,
        letterSpacing: 3,
        color: COLORS.ELECTRIC_BLUE,
        marginBottom: 16,
    },
    heading: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 42,
        color: COLORS.RITUAL_WHITE,
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 10,
    },
    subheading: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 16,
        color: COLORS.ASH_GRAY,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 24,
    },
    buttonWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    revealButton: {
        width: '100%',
        height: 64,
        backgroundColor: COLORS.RITUAL_WHITE,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.RITUAL_WHITE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonText: {
        color: COLORS.DEEP_NAVY,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1.5,
    }
});
