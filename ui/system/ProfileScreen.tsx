import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { SocialManager } from '../../system/social/SocialManager';
import { ScoreboardService } from '../../system/social/ScoreboardService';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';

export const ProfileScreen: React.FC = () => {
    const social = SocialManager.getInstance();
    const scoreboard = ScoreboardService.getInstance();

    const friends = social.getFriends();
    const dripScore = scoreboard.calculateDripScore();
    const vaultMetrics = scoreboard.getVaultMetrics();

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <RitualHeader
                    subtitle="Style DNA"
                    title="Visual Intelligence."
                />

                <View style={styles.identitySection}>
                    <View style={styles.avatarGlow}>
                        <View style={styles.avatarInner}>
                            <Text style={styles.avatarInitial}>V</Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>VUDUMUDI ASHISH</Text>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>DRIP INDEX</Text>
                        <Text style={styles.scoreValue}>{dripScore}</Text>
                    </View>
                </View>

                {/* METRICS GRID - Apple Health Style */}
                <View style={styles.metricsWrapper}>
                    <View style={styles.metricsRow}>
                        <GlassCard style={[styles.metricCard, { flex: 1 }]}>
                            <View style={styles.metricHeader}>
                                <Text style={[styles.metricIcon, { color: COLORS.NEON_CYAN }]}>◉</Text>
                                <Text style={styles.metricLabel}>VAULT</Text>
                            </View>
                            <Text style={styles.metricValueLarge}>{vaultMetrics.itemCount}</Text>
                            <Text style={styles.metricSub}>Active items</Text>
                        </GlassCard>
                        <GlassCard style={[styles.metricCard, { flex: 1 }]}>
                            <View style={styles.metricHeader}>
                                <Text style={[styles.metricIcon, { color: COLORS.ELECTRIC_VIOLET }]}>◈</Text>
                                <Text style={styles.metricLabel}>NETWORK</Text>
                            </View>
                            <Text style={styles.metricValueLarge}>{friends.length}</Text>
                            <Text style={styles.metricSub}>Connections</Text>
                        </GlassCard>
                    </View>
                </View>

                {/* COST PER WEAR CHART (Mock) */}
                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>WEAR ANALYTICS</Text>
                    <GlassCard style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>Avg. Cost Per Wear</Text>
                            <Text style={styles.chartValue}>$12.50</Text>
                        </View>
                        <View style={styles.chartBars}>
                            {[40, 60, 35, 80, 50, 70, 45].map((h, i) => (
                                <View key={i} style={styles.barContainer}>
                                    <View style={[styles.bar, { height: h, backgroundColor: i === 3 ? COLORS.ELECTRIC_VIOLET : COLORS.SURFACE_MUTE }]} />
                                    <Text style={styles.dayLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                </View>

                {/* COLOR DNA */}
                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>COLOR PALETTE</Text>
                    <GlassCard style={styles.insightCard}>
                        <View style={styles.paletteRow}>
                            {['#050505', '#F8FAFC', '#2D5BFF', '#FF4E4E'].map((c, i) => (
                                <View key={c} style={styles.paletteItem}>
                                    <View style={[styles.colorCircle, { backgroundColor: c }]} />
                                    <Text style={styles.colorPercent}>{['40%', '30%', '20%', '10%'][i]}</Text>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                </View>

                <View style={styles.analysisSection}>
                    <Text style={styles.sectionTitle}>BEHAVIORAL INSIGHTS</Text>
                    <GlassCard style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <Text style={styles.insightTitle}>Dominant Vibe</Text>
                            <Text style={styles.insightStatus}>CALIBRATED</Text>
                        </View>
                        <Text style={styles.insightText}>
                            Your choices tend towards "Minimalist Tech" with a confidence bias of 0.85.
                        </Text>
                    </GlassCard>
                </View>

                <View style={styles.dnaControls}>
                    <Text style={styles.sectionTitle}>CALIBRATION</Text>
                    <TouchableOpacity style={styles.dnaButton}>
                        <Text style={styles.dnaButtonText}>Recalibrate Style DNA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.dnaButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]}>
                        <Text style={[styles.dnaButtonText, { color: COLORS.RITUAL_WHITE, opacity: 0.6 }]}>Privacy Settings</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        paddingHorizontal: SPACING.GUTTER,
    },
    identitySection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarGlow: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(45, 91, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(45, 91, 255, 0.2)',
    },
    avatarInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.SURFACE_MUTE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 32,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.RITUAL_WHITE,
    },
    userName: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 2,
        marginTop: 16,
    },
    scoreContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    scoreLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.ELECTRIC_COBALT,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 2,
    },
    scoreValue: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 48,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.RITUAL_WHITE,
    },
    metricsWrapper: {
        marginBottom: 32,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metricCard: {
        padding: 16,
        alignItems: 'flex-start',
        minHeight: 120,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricIcon: {
        fontSize: 10,
        marginRight: 6,
    },
    metricLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.KINETIC_SILVER,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 1,
    },
    metricValueLarge: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 32,
        color: COLORS.RITUAL_WHITE,
        marginBottom: 2,
    },
    metricSub: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.MUTED_ASH,
    },
    analysisSection: {
        marginBottom: 24,
    },
    chartCard: {
        padding: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    chartTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.RITUAL_WHITE,
    },
    chartValue: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.NEON_CYAN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
    },
    barContainer: {
        alignItems: 'center',
        gap: 8,
    },
    bar: {
        width: 6,
        borderRadius: 3,
    },
    dayLabel: {
        fontSize: 8,
        color: COLORS.MUTED_ASH,
    },
    paletteRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    paletteItem: {
        alignItems: 'center',
        gap: 8,
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.SURFACE_BORDER,
    },
    colorPercent: {
        fontSize: 10,
        color: COLORS.KINETIC_SILVER,
        fontWeight: 'bold',
    },
    insightCard: {
        padding: 20,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    insightTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.ELECTRIC_VIOLET,
        letterSpacing: 0,
    },
    insightStatus: {
        fontSize: 8,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.EMERALD_DUSK,
        letterSpacing: 1,
    },
    insightText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.RITUAL_WHITE,
        opacity: 0.8,
        lineHeight: 22,
    },
    dnaControls: {
        marginTop: 8,
        paddingBottom: 40,
    },
    dnaButton: {
        height: 60,
        backgroundColor: COLORS.SURFACE_MUTE,
        borderRadius: SPACING.RADIUS.MEDIUM,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dnaButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.ELECTRIC_VIOLET,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    }
});
