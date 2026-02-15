import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { COLORS } from '../../../tokens/color.tokens';
import { TextInput } from 'react-native-gesture-handler'; // Used for animated text trick if needed, or just plain text update

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Helper for count up
const CountUp: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        // Simple JS interval for count up to avoid complex Reanimated Text handling on all platforms
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 800;
        const startTime = Date.now();

        const tick = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out circ
            const ease = 1 - Math.pow(1 - progress, 3);

            const current = Math.floor(start + (end - start) * ease);
            setDisplayVal(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }, [value]);

    return <Text style={styles.statValue}>{displayVal}{suffix}</Text>;
};

interface RefinedStatsProps {
    wardrobeCount: number;
    outfitsCount: number;
    streak: number;
}

export const RefinedStats: React.FC<RefinedStatsProps> = ({ wardrobeCount, outfitsCount, streak }) => {
    return (
        <View style={styles.row}>
            <StatCard label="Wardrobe" value={wardrobeCount} delay={0} />
            <StatCard label="Outfits" value={outfitsCount} delay={100} />
            <StatCard label="Streak" value={streak} suffix=" days" delay={200} />
        </View>
    );
};

const StatCard: React.FC<{ label: string; value: number; suffix?: string; delay: number }> = ({ label, value, suffix, delay }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
        translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
    }, []);

    const style = {
        opacity,
        transform: [{ translateY }]
    };

    return (
        <Animated.View style={[styles.card, style as any]}>
            <CountUp value={value} suffix={suffix} />
            <Text style={styles.statLabel}>{label}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 16,
        marginHorizontal: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statValue: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
