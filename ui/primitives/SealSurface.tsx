/**
 * FIREWALL — SEAL SURFACE
 * Terminal state container.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../tokens/color.tokens';

export const SealSurface: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <View style={styles.container} pointerEvents="none">
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.VOID_BLACK,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
