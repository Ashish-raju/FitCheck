import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { COLORS } from '../../tokens/color.tokens';
import { getRecommendations } from '../../../services/FitRulesLibrary';
import { SPACING } from '../../tokens/spacing.tokens';

interface BestFitsRecommendationsProps {
    bodyType?: string;
}

// Simple Icon component for cuts
const CutIcon = ({ type, color }: { type: string, color: string }) => {
    // Very abstract representations
    let d = "M20,20 L80,20 L80,80 L20,80 Z"; // Default box
    if (type.includes('Neck')) d = "M20,20 L50,50 L80,20"; // V-shape
    else if (type.includes('Waist') || type.includes('Rise')) d = "M20,50 L80,50 M50,20 L50,80"; // Waist line
    else if (type.includes('Fit') || type.includes('Leg')) d = "M30,20 L30,80 L70,80 L70,20"; // Legs

    return (
        <Svg width="40" height="40" viewBox="0 0 100 100">
            <Path d={d} stroke={color} strokeWidth="2" fill="none" />
        </Svg>
    );
};

export const BestFitsRecommendations: React.FC<BestFitsRecommendationsProps> = ({ bodyType }) => {
    const rules = getRecommendations(bodyType);

    const renderCard = (title: string, isBest: boolean) => (
        <View key={title} style={[styles.card, isBest ? styles.cardBest : styles.cardAvoid]}>
            <View style={styles.iconContainer}>
                <CutIcon type={title} color={isBest ? COLORS.ELECTRIC_BLUE : COLORS.RITUAL_RED} />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
            {isBest && <View style={styles.bestBadge}><Text style={styles.badgeText}>BEST</Text></View>}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>FOR YOUR BODY TYPE: {bodyType?.toUpperCase() || 'MESOMORPH'}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>BEST CUTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {rules.bestCuts.map((cut) => renderCard(cut, true))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AVOID</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {rules.avoidCuts.map((cut) => renderCard(cut, false))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>HIGHLIGHT ASSETS</Text>
                <View style={styles.highlightRow}>
                    {rules.assetsToHighlight.map(asset => (
                        <View key={asset} style={styles.assetChip}>
                            <Text style={styles.assetText}>{asset.toUpperCase()}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    scrollContent: {
        gap: 12,
        paddingRight: 16,
    },
    card: {
        width: 100,
        height: 120,
        backgroundColor: COLORS.CARBON_BLACK,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    cardBest: {
        borderColor: COLORS.ELECTRIC_BLUE,
        backgroundColor: 'rgba(46, 92, 255, 0.05)',
    },
    cardAvoid: {
        opacity: 0.6,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    iconContainer: {
        marginBottom: 12,
        opacity: 0.8,
    },
    cardTitle: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
    bestBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 8,
        fontWeight: 'bold',
    },
    highlightRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    assetChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    assetText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 12,
        fontWeight: '500',
    }
});
