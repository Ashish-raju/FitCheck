/**
 * FIREWALL — CANDIDATE SLAB
 * Machined material unit. 0px Radius.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';

export const CandidateSlab: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <View style={styles.slab}>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    slab: {
        backgroundColor: COLORS.VOID_BLACK,
        borderColor: COLORS.SEAM_DARK,
        borderWidth: SPACING.SEAM_THICKNESS,
        borderRadius: 0,
        overflow: 'hidden',
    },
    content: {
        elevation: SPACING.PRESS_DEPTH,
    },
});
