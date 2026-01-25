import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from '../primitives/GlassCard';

interface RitualStreakProps {
    streakCount: number;
    onPress?: () => void;
}

export const RitualStreak: React.FC<RitualStreakProps> = ({ streakCount, onPress }) => {
    const list = [
        streakCount > 0 ? `You’re on a ${streakCount}-day streak 🔥` : "Let’s start your first streak.",
        "Consistency is stylish.",
        streakCount > 3 ? "Review your week" : null
    ].filter(Boolean) as string[];

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <GlassCard style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.ringContainer}>
                        <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }], opacity: 0.3 }]} />
                        <View style={styles.solidRing}>
                            <Text style={styles.countText}>{streakCount}</Text>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{list[0]}</Text>
                        <Text style={styles.subtitle}>View this week's fits</Text>
                    </View>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.STACK.NORMAL,
        marginBottom: SPACING.STACK.NORMAL,
        borderRadius: SPACING.RADIUS.LARGE,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.STACK.NORMAL,
    },
    ringContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        zIndex: 1,
    },
    solidRing: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.ELECTRIC_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.DEEP_NAVY,
        zIndex: 2,
    },
    countText: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.H3,
        color: COLORS.SOFT_WHITE,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.SOFT_WHITE,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: COLORS.ASH_GRAY,
    },
});
