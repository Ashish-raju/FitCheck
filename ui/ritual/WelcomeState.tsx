import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';

interface WelcomeStateProps {
    onAddItems: () => void;
    onDemo: () => void;
}

const { width } = Dimensions.get('window');

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onAddItems, onDemo }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Visual Centerpiece */}
            <View style={styles.illustrationContainer}>
                <LinearGradient
                    colors={[COLORS.ELECTRIC_BLUE, 'transparent']}
                    style={styles.circleGradient}
                />
                <View style={styles.circleInner} />
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.title}>Let’s build your first look.</Text>
                <Text style={styles.subtitle}>
                    Your wardrobe is empty. Add a few items to start your daily style ritual.
                </Text>

                <View style={styles.actions}>
                    <TouchableOpacity onPress={onAddItems} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Add New Items</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onDemo} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Try Demo Fit</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.GUTTER,
        minHeight: 500,
    },
    illustrationContainer: {
        width: width * 0.6,
        height: width * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.STACK.X_LARGE,
    },
    circleGradient: {
        width: '100%',
        height: '100%',
        borderRadius: width * 0.3,
        opacity: 0.2,
    },
    circleInner: {
        position: 'absolute',
        width: '60%',
        height: '60%',
        borderRadius: width * 0.2,
        backgroundColor: COLORS.DEEP_NAVY,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.H2,
        color: COLORS.RITUAL_WHITE,
        textAlign: 'center',
        marginBottom: SPACING.STACK.NORMAL,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.ASH_GRAY,
        textAlign: 'center',
        marginBottom: SPACING.STACK.X_LARGE,
        lineHeight: 24,
        maxWidth: '80%',
    },
    actions: {
        width: '100%',
        gap: SPACING.STACK.NORMAL,
    },
    primaryButton: {
        width: '100%',
        height: 56,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        borderRadius: SPACING.RADIUS.PILL,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.ELECTRIC_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    primaryButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.ASH_GRAY,
        letterSpacing: 0.5,
    },
});
