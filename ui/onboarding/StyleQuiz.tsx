import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';

const { width } = Dimensions.get('window');

const VIBES = [
    { id: 'minimal', label: 'Minimalist', color: '#E2E8F0' },
    { id: 'street', label: 'Streetwear', color: '#FCD34D' },
    { id: 'vintage', label: 'Vintage', color: '#F87171' },
    { id: 'avant', label: 'Avant-Garde', color: '#818CF8' },
];

export const StyleQuiz: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Vibe, 1: Permissions

    const handleVibeSelect = (vibeId: string) => {
        setStep(1);
    };

    const handlePermissionGrant = () => {
        // Mock permission grant
        ritualMachine.toHome();
    };

    return (
        <View style={styles.container}>
            {step === 0 ? (
                <Animated.View exiting={FadeOutLeft} style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Define Your Style.</Text>
                        <Text style={styles.subtitle}>Pick the vibe that speaks to you most today.</Text>
                    </View>

                    <View style={styles.grid}>
                        {VIBES.map((vibe, index) => (
                            <Animated.View
                                key={vibe.id}
                                entering={FadeInDown.delay(index * 100).springify()}
                                style={styles.cardContainer}
                            >
                                <TouchableOpacity onPress={() => handleVibeSelect(vibe.id)}>
                                    <View style={styles.optionCard}>
                                        <View style={[styles.colorBlock, { backgroundColor: vibe.color }]} />
                                        <Text style={styles.optionLabel}>{vibe.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>
            ) : (
                <Animated.View entering={FadeInRight} style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Trust the Process.</Text>
                        <Text style={styles.subtitle}>
                            We need access to your camera to build your closet.
                            Your photos verify your style, they never leave your vault.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handlePermissionGrant}>
                        <Text style={styles.primaryButtonText}>ALLOW ACCESS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handlePermissionGrant}>
                        <Text style={styles.secondaryButtonText}>NOT NOW</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: SPACING.GUTTER,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.HERO,
        color: MATERIAL.TEXT_MAIN,
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY_LG,
        color: MATERIAL.TEXT_MUTED,
        fontWeight: TYPOGRAPHY.WEIGHTS.LIGHT,
        lineHeight: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: (width - SPACING.GUTTER * 2 - 16) / 2,
    },
    optionCard: {
        height: 160,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MATERIAL.CARD,
        borderColor: MATERIAL.BORDER,
        borderWidth: 1,
        borderRadius: 16,
    },
    colorBlock: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 16,
        opacity: 0.8,
    },
    optionLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: MATERIAL.TEXT_MAIN,
    },
    primaryButton: {
        backgroundColor: COLORS.ELECTRIC_BLUE,
        paddingVertical: 18,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryButtonText: {
        color: COLORS.SOFT_WHITE,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 1,
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    secondaryButtonText: {
        color: MATERIAL.TEXT_MUTED,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
    }
});
