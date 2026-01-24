import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { useRitualState } from '../state/ritualProvider';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { CandidateStage } from '../ritual/CandidateStage';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';
import * as Haptics from 'expo-haptics';

import { MOTION } from '../tokens/motion.tokens';

export const SealScreen: React.FC = () => {
    const { lockedOutfitId, candidateOutfits } = useRitualState();
    const outfit = candidateOutfits.find(o => o.id === lockedOutfitId);

    const opacityAnim = useRef(new Animated.Value(0)).current;
    const flickerAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // High Impact Sequence
        const runFinality = async () => {
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: MOTION.DURATIONS.SEAL_FINALITY,
                useNativeDriver: true,
            }).start();

            // Haptic Crescendo
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await new Promise(r => setTimeout(r, 100));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await new Promise(r => setTimeout(r, 200));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Archival Flicker
            Animated.sequence([
                Animated.timing(flickerAnim, { toValue: 0.8, duration: 50, useNativeDriver: true }),
                Animated.timing(flickerAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
                Animated.timing(flickerAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
                Animated.timing(flickerAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
        };

        runFinality();
    }, []);

    if (!outfit) return null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: flickerAnim }] }]}>
                    <Text style={styles.stateWhisper}>SEALED</Text>

                    <View style={styles.stageWrapper}>
                        <CandidateStage outfit={outfit} />
                    </View>

                    <View style={styles.explanationSection}>
                        <Text style={styles.explanationTitle}>Stylist's Note</Text>
                        <Text style={styles.explanationText}>
                            This combination balances warmth and formality perfectly for your current context.
                            The colors coordinate for a high-confidence visual profile.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.fitCheckButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                ritualMachine.toFriendsFeed();
                            }}
                        >
                            <Text style={styles.fitCheckText}>Fit check</Text>
                            <Text style={styles.fitCheckSub}>Ask friends for feedback</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                ritualMachine.toProfile();
                            }}
                        >
                            <Text style={styles.saveText}>View Style DNA</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                ritualMachine.toHome();
                            }}
                        >
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    flash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.RITUAL_WHITE,
        zIndex: 100,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
        paddingHorizontal: SPACING.GUTTER,
    },
    content: {
        alignItems: 'center',
        marginTop: 20,
    },
    stageWrapper: {
        width: '100%',
        height: 420,
        marginBottom: SPACING.STACK.LARGE,
    },
    explanationSection: {
        width: '100%',
        backgroundColor: COLORS.SURFACE_MUTE,
        padding: 24,
        borderRadius: SPACING.RADIUS.MEDIUM,
        marginBottom: SPACING.STACK.LARGE,
        borderWidth: 1,
        borderColor: COLORS.SURFACE_BORDER,
    },
    explanationTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.ELECTRIC_COBALT,
        fontSize: TYPOGRAPHY.SCALE.LABEL,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: TYPOGRAPHY.TRACKING.WIDE,
        marginBottom: 8,
    },
    explanationText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        opacity: 0.8,
        lineHeight: 24,
        fontSize: TYPOGRAPHY.SCALE.BODY,
    },
    stateWhisper: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.ELECTRIC_COBALT,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 4,
        marginBottom: 20,
        opacity: 0.6,
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    fitCheckButton: {
        backgroundColor: COLORS.ELECTRIC_COBALT,
        padding: 20,
        borderRadius: SPACING.RADIUS.MEDIUM,
        alignItems: 'center',
    },
    fitCheckText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        fontSize: TYPOGRAPHY.SCALE.HEADER,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: TYPOGRAPHY.TRACKING.WIDE,
    },
    fitCheckSub: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.6,
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: COLORS.SURFACE_MUTE,
        padding: 20,
        borderRadius: SPACING.RADIUS.MEDIUM,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    saveText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        fontSize: 16,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 2,
    },
    doneButton: {
        padding: 20,
        alignItems: 'center',
    },
    doneText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        opacity: 0.5,
        fontSize: TYPOGRAPHY.SCALE.BODY,
    }
});
