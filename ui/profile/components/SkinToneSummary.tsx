import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { SPACING } from '../../tokens/spacing.tokens';

interface SkinToneSummaryProps {
    skinTone?: {
        undertone: string;
        depth: string;
        contrast: string;
    };
    palette?: {
        best: string[];
        avoid: string[];
    };
    onRescan: () => void;
}

// Abstract Face SVG
const FaceSilhouette = ({ undertone }: { undertone: string }) => {
    // Determine stroke color emphasis
    const strokeColor = undertone === 'Warm' ? COLORS.ROYAL_GOLD : (undertone === 'Cool' ? COLORS.ELECTRIC_BLUE : COLORS.RITUAL_WHITE);

    return (
        <Svg width="100" height="120" viewBox="0 0 100 120">
            <Defs>
                <SvgLinearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={strokeColor} stopOpacity="0.2" />
                    <Stop offset="1" stopColor={strokeColor} stopOpacity="0" />
                </SvgLinearGradient>
            </Defs>
            {/* Outline */}
            <Path
                d="M50,10 C75,10 90,30 90,60 C90,100 70,115 50,115 C30,115 10,100 10,60 C10,30 25,10 50,10 Z"
                stroke={strokeColor}
                strokeWidth="1.5"
                fill="url(#faceGrad)"
            />
            {/* Abstract Features */}
            <Path d="M30,50 Q40,45 50,50 Q60,45 70,50" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
            <Path d="M40,85 Q50,95 60,85" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
        </Svg>
    );
};

export const SkinToneSummary: React.FC<SkinToneSummaryProps> = ({ skinTone, palette, onRescan }) => {
    if (!skinTone) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No skin tone analysis found.</Text>
                <TouchableOpacity style={styles.rescanButton} onPress={onRescan}>
                    <Text style={styles.rescanText}>Start Scan</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Dynamic Gradient Colors
    const getGradientColors = () => {
        switch (skinTone.undertone) {
            case 'Warm': return ['rgba(255, 215, 0, 0.15)', 'rgba(0,0,0,0)']; // Gold
            case 'Cool': return ['rgba(46, 92, 255, 0.15)', 'rgba(0,0,0,0)']; // Blue
            default: return ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0)']; // Neutral
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getGradientColors() as any}
                style={styles.visualHeader}
            >
                <FaceSilhouette undertone={skinTone.undertone} />
                <View style={styles.toneTag}>
                    <Text style={[styles.toneText, { color: skinTone.undertone === 'Warm' ? COLORS.ROYAL_GOLD : COLORS.ELECTRIC_BLUE }]}>
                        {skinTone.undertone} • {skinTone.depth}
                    </Text>
                </View>
            </LinearGradient>

            {/* Analysis Row */}
            <View style={styles.contentContainer}>
                {/* Palette Row */}
                {palette && (
                    <View style={styles.paletteSection}>
                        <Text style={styles.subTitle}>POWER PALETTE</Text>
                        <View style={styles.swatchRow}>
                            {palette.best.slice(0, 5).map((color, index) => (
                                <View key={`best-${index}`} style={[styles.swatch, { backgroundColor: color }]} />
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.rescanButtonSmall} onPress={onRescan}>
                    <Text style={styles.rescanTextSmall}>Re-scan Face</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: SPACING.RADIUS.MEDIUM,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
    },
    emptyText: {
        color: MATERIAL.TEXT_MUTED,
        marginBottom: 12,
    },
    visualHeader: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
    },
    toneTag: {
        marginTop: -10,
        backgroundColor: COLORS.CARBON_BLACK,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    toneText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    contentContainer: {
        padding: 16,
    },
    paletteSection: {
        marginBottom: 16,
        alignItems: 'center',
    },
    subTitle: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        marginBottom: 12,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    swatchRow: {
        flexDirection: 'row',
        gap: 12,
    },
    swatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    rescanButton: {
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    rescanText: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    rescanButtonSmall: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    rescanTextSmall: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        textDecorationLine: 'underline',
    }
});
