import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { COLORS } from '../../../tokens/color.tokens';
import { IllustrationFrame } from '../visuals/IllustrationFrame';
import { FadeInUp } from '../motion/Motion';
import { TorsoSilhouette } from '../visuals/TorsoSilhouette';

interface BodySnapshotProps {
    currentBodyType?: string;
    gender?: string; // 'Male' | 'Female' | 'Non-Binary' etc.
    confidence?: number;
    onRetakePress: () => void;
}

export const RefinedBodySnapshot = React.memo<BodySnapshotProps>(({ currentBodyType, gender, confidence, onRetakePress }) => {
    return (
        <View style={styles.container}>
            <IllustrationFrame height={220}>
                {/* Silhouette */}
                <View style={styles.svg}>
                    <View style={styles.comparisonContainer}>
                        {/* Comparison View */}
                        <View style={styles.compCol}>
                            <Text style={styles.compLabel}>Male</Text>
                            <TorsoSilhouette bodyType={currentBodyType} gender="Male" height={180} width={120} />
                        </View>
                        <View style={styles.compCol}>
                            <Text style={styles.compLabel}>Female</Text>
                            <TorsoSilhouette bodyType={currentBodyType} gender="Female" height={180} width={120} />
                        </View>
                    </View>

                    {/* Confidence Indicator (Ring) */}
                    {confidence && (
                        <Svg width="140" height="180" style={StyleSheet.absoluteFill}>
                            <G transform="translate(100, 30)">
                                <Circle r="18" fill="rgba(0,0,0,0.6)" stroke={COLORS.GLASS_BORDER} strokeWidth="1" />
                                <Circle r="18" stroke={COLORS.ELECTRIC_VIOLET} strokeWidth="2" strokeDasharray={`${confidence * 113} 1000`} transform="rotate(-90)" />
                            </G>
                        </Svg>
                    )}
                </View>

                {/* Confidence Label floating near ring */}
                {confidence && (
                    <View style={styles.confLabelContainer}>
                        <Text style={styles.confVal}>{Math.round(confidence * 100)}%</Text>
                    </View>
                )}
            </IllustrationFrame>

            {/* Controls */}
            <View style={styles.controls}>
                <View>
                    <Text style={styles.typeLabel}>{currentBodyType || 'Unknown Build'}</Text>
                    <Text style={styles.subLabel}>AI Analysis</Text>
                </View>
                <TouchableOpacity onPress={onRetakePress} style={styles.adjustBtn}>
                    <Text style={styles.adjustText}>Adjust</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 20
    },
    svg: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    confLabelContainer: {
        position: 'absolute',
        top: 36,
        right: 25,
        width: 40,
        alignItems: 'center'
    },
    confVal: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: 'bold'
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 4
    },
    typeLabel: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    subLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 12
    },
    adjustBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    adjustText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 12,
        fontWeight: '600'
    },
    comparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 10
    },
    compCol: {
        alignItems: 'center'
    },
    compLabel: {
        color: COLORS.ASH_GRAY,
        marginBottom: 8,
        fontSize: 12,
        textTransform: 'uppercase'
    }
});
