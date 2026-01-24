/**
 * FIREWALL — ALTAR STAGE
 * Rigidly anchored decision frame.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { computeAltarFrame } from '../tokens/spacing.tokens';
import { COLORS } from '../tokens/color.tokens';

const { width, height } = Dimensions.get('window');

export const AltarStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const frame = computeAltarFrame({ width, height });

    return (
        <View style={styles.container}>
            <View style={{
                width: frame.width,
                height: frame.height,
                position: 'absolute',
                left: frame.x,
                top: frame.y,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.VOID_BLACK,
    },
});
