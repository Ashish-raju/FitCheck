import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Svg, Circle, G } from 'react-native-svg';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { WardrobeAnalytics as AnalyticsData } from '../../../services/AnalyticsService';
import { SmartImage } from '../../primitives/SmartImage';

interface WardrobeAnalyticsProps {
    data: AnalyticsData | null;
}

export const WardrobeAnalytics: React.FC<WardrobeAnalyticsProps> = React.memo(({ data }) => {
    if (!data) return <Text style={{ color: COLORS.ASH_GRAY }}>Analyzing wardrobe...</Text>;

    return (
        <View style={styles.container}>
            {/* Health Score Row */}
            <View style={styles.scoreRow}>
                <View style={styles.circleContainer}>
                    <ProgressCircle score={data.healthScore} size={80} strokeWidth={8} />
                    <View style={styles.scoreTextContainer}>
                        <Text style={styles.scoreValue}>{data.healthScore}</Text>
                        <Text style={styles.scoreLabel}>Health</Text>
                    </View>
                </View>
                <View style={styles.breakdown}>
                    <BreakdownBar label="Coverage" value={data.healthBreakdown.coverage} />
                    <BreakdownBar label="Diversity" value={data.healthBreakdown.diversity} />
                    <BreakdownBar label="Freshness" value={data.healthBreakdown.freshness} />
                </View>
            </View>

            {/* Versatile Items */}
            {data.mostVersatileItems.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MOST VERSATILE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemList}>
                        {data.mostVersatileItems.map(item => (
                            <View key={item.id} style={styles.itemCard}>
                                <SmartImage source={{ uri: (item as any).image || item.imageUri || item.processedImageUri || '' }} style={styles.itemImage} contentFit="contain" />
                                <View style={styles.usageBadge}>
                                    <Text style={styles.usageText}>★</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Underused Items - Visuals: Greyed/Dimmed */}
            {data.underusedItems && data.underusedItems.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NEEDS LOVE (Little to no wear)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemList}>
                        {data.underusedItems.map(item => (
                            <View key={item.id} style={[styles.itemCard, styles.itemCardDimmed]}>
                                <SmartImage
                                    source={{ uri: (item as any).image || item.imageUri || item.processedImageUri || '' }}
                                    style={[styles.itemImage, { opacity: 0.5 }]}
                                    contentFit="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Top Colors */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DOMINANT COLORS</Text>
                <View style={styles.colorRow}>
                    {data.topColors.map((c, i) => (
                        <View key={c.color} style={{ alignItems: 'center', marginRight: 12 }}>
                            <View style={[styles.colorDot, { backgroundColor: c.color }]} />
                            <Text style={styles.colorCount}>{c.count}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
});

const ProgressCircle = ({ score, size, strokeWidth }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={COLORS.ELECTRIC_BLUE}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </G>
        </Svg>
    );
};

const BreakdownBar = ({ label, value }: any) => (
    <View style={styles.barContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.barLabel}>{label}</Text>
            <Text style={styles.barValue}>{value}%</Text>
        </View>
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${value}%` }]} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    circleContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 24,
    },
    scoreTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    scoreValue: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 24,
        fontWeight: 'bold',
    },
    scoreLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    breakdown: {
        flex: 1,
        gap: 12,
    },
    barContainer: {},
    barLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
    },
    barValue: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: 'bold',
    },
    track: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    fill: {
        height: '100%',
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        borderRadius: 2,
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
    itemList: {
        paddingRight: 24,
    },
    itemCard: {
        width: 60,
        height: 60,
        backgroundColor: COLORS.CARBON_BLACK,
        borderRadius: 8,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    itemCardDimmed: {
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    itemImage: {
        width: 40,
        height: 40,
    },
    usageBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.GOLD_ACCENT,
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    usageText: {
        fontSize: 8,
        color: 'black',
        fontWeight: 'bold',
    },
    colorRow: {
        flexDirection: 'row',
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    colorCount: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
    }
});
