import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from '../primitives/GlassCard';

import type { Outfit } from '../../truth/types';

interface CandidateStageProps {
    outfit: Outfit | null;
}

export const CandidateStage: React.FC<CandidateStageProps> = ({ outfit }) => {
    if (!outfit || !outfit.pieces) return null;

    const top = outfit.pieces.find(p => p.category === 'Top');
    const bottom = outfit.pieces.find(p => p.category === 'Bottom');
    const shoes = outfit.pieces.find(p => p.category === 'Shoes');
    const outer = outfit.pieces.find(p => p.category === 'Outerwear');

    return (
        <View style={styles.compositionHost}>
            {/* Visual Composition: Explicit Hierarchical Array */}
            <View style={styles.garmentLayer}>
                {top && (
                    top.imageUri ?
                        <Image source={{ uri: top.imageUri }} style={[styles.pieceBlock, { height: 180, width: 160, top: 40, zIndex: 2 }]} /> :
                        <View style={[styles.pieceBlock, { backgroundColor: top.color, height: 180, width: 160, top: 40, zIndex: 2 }]} />
                )}
                {bottom && (
                    bottom.imageUri ?
                        <Image source={{ uri: bottom.imageUri }} style={[styles.pieceBlock, { height: 220, width: 140, bottom: 60, zIndex: 1 }]} /> :
                        <View style={[styles.pieceBlock, { backgroundColor: bottom.color, height: 220, width: 140, bottom: 60, zIndex: 1 }]} />
                )}
                {shoes && (
                    shoes.imageUri ?
                        <Image source={{ uri: shoes.imageUri }} style={[styles.pieceBlock, { height: 40, width: 110, bottom: 10, zIndex: 0 }]} /> :
                        <View style={[styles.pieceBlock, { backgroundColor: shoes.color, height: 40, width: 110, bottom: 10, zIndex: 0 }]} />
                )}
                {outer && (
                    outer.imageUri ?
                        <Image source={{ uri: outer.imageUri }} style={[styles.pieceBlock, { height: 200, width: 180, top: 20, zIndex: 3, opacity: 0.9, borderWidth: 1, borderColor: COLORS.ELECTRIC_COBALT }]} /> :
                        <View style={[styles.pieceBlock, { backgroundColor: outer.color, height: 200, width: 180, top: 20, zIndex: 3, opacity: 0.9, borderWidth: 1, borderColor: COLORS.ELECTRIC_COBALT }]} />
                )}
            </View>

            {/* Prestige Labeling */}
            <View style={styles.labelContainer}>
                <Text style={styles.stateWhisper}>IDENTITY LOCKED</Text>
                <Text style={styles.idText}>{outfit.id.toUpperCase()}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    compositionHost: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.GUTTER,
    },
    garmentLayer: {
        width: '100%',
        height: '70%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieceBlock: {
        position: 'absolute',
        borderRadius: SPACING.RADIUS.SMALL,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    labelContainer: {
        marginTop: SPACING.STACK.LARGE,
        alignItems: 'center',
    },
    stateWhisper: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.ELECTRIC_COBALT,
        fontSize: TYPOGRAPHY.SCALE.LABEL,
        letterSpacing: TYPOGRAPHY.TRACKING.WIDE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        marginBottom: 4,
    },
    idText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        opacity: 0.8,
    },
});
