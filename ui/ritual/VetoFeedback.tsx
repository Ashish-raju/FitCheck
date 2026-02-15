import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/fonts';

interface VetoFeedbackProps {
    visible: boolean;
    message?: string;
}

const MESSAGES = [
    "Not your vibe?",
    "Let's find something better.",
    "Skipped.",
    "Saved for later?",
    "Too much?",
    "On to the next gem."
];

export const VetoFeedback: React.FC<VetoFeedbackProps> = ({ visible, message }) => {
    if (!visible) return null;

    const text = message || MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(15)}
            exiting={FadeOutUp.duration(200)}
            style={styles.container}
        >
            <View style={styles.pill}>
                <Text style={styles.text}>{text}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 120, // Below header
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
        pointerEvents: 'none', // Don't block swipes
    },
    pill: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    text: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.SOFT_WHITE, // Using soft white
        fontWeight: '500',
    }
});
