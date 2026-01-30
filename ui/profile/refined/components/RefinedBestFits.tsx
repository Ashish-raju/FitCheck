import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../../tokens/color.tokens';
import { getRecommendations } from '../../../../services/FitRulesLibrary';
import { getCutIcon } from '../visuals/CutIcons';

interface RefinedBestFitsProps {
    bodyType?: string;
}

export const RefinedBestFits: React.FC<RefinedBestFitsProps> = ({ bodyType }) => {
    const rules = getRecommendations(bodyType);

    const renderCard = (title: string, isBest: boolean) => {
        const Icon = getCutIcon(title);

        return (
            <View key={title} style={[styles.card, isBest ? styles.cardBest : styles.cardAvoid]}>
                <View style={styles.iconContainer}>
                    <Icon color={isBest ? COLORS.ELECTRIC_BLUE : COLORS.RITUAL_RED} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                {isBest && <View style={styles.bestBadge}><Text style={styles.badgeText}>BEST</Text></View>}
            </View>
        );
    };

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%' },
    header: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: { marginBottom: 20 },
    sectionTitle: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 1,
    },
    scrollContent: { gap: 12, paddingRight: 16 },
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
    cardBest: { borderColor: COLORS.ELECTRIC_BLUE, backgroundColor: 'rgba(46, 92, 255, 0.05)' },
    cardAvoid: { opacity: 0.6, borderColor: 'rgba(255, 59, 48, 0.3)' },
    iconContainer: { marginBottom: 12 },
    cardTitle: { color: COLORS.RITUAL_WHITE, fontSize: 10, textAlign: 'center', fontWeight: '600' },
    bestBadge: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: COLORS.ELECTRIC_BLUE, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4,
    },
    badgeText: { color: COLORS.RITUAL_WHITE, fontSize: 8, fontWeight: 'bold' }
});
