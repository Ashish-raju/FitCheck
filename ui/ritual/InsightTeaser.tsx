import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';

interface InsightItem {
    id: string;
    label: string;
    value?: string;
}

export const InsightTeaser: React.FC = () => {
    // Mock data
    const insights: InsightItem[] = [
        { id: '1', label: 'Monochrome', value: '3x this week' },
        { id: '2', label: 'Worn Denim', value: '5x this month' },
        { id: '3', label: 'Top Color', value: 'Black' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>STYLE INSIGHTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {insights.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.STACK.LARGE, // Note: Verify casing of Large/LARGE in spacing tokens
        marginTop: SPACING.STACK.NORMAL,
    },
    header: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.SMALL,
        color: COLORS.MUTED_ASH,
        letterSpacing: 1.5,
        marginBottom: SPACING.STACK.NORMAL,
        paddingHorizontal: SPACING.GUTTER,
    },
    scroll: {
        paddingHorizontal: SPACING.GUTTER,
        gap: SPACING.STACK.NORMAL,
    },
    card: {
        backgroundColor: COLORS.SUBTLE_GRAY,
        borderRadius: 12,
        padding: 12,
        minWidth: 120,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    label: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: COLORS.ASH_GRAY,
        marginBottom: 4,
    },
    value: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.SOFT_WHITE,
        fontWeight: '600',
    }
});
