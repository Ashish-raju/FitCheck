/**
 * FIREWALL — VOID SURFACE
 * Internalized style enforcement.
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewProps } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';

export const VoidSurface: React.FC<ViewProps> = ({ children, style, ...props }) => {
    return (
        <SafeAreaView style={styles.outer}>
            <View
                style={[styles.inner, style]}
                {...props}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        backgroundColor: COLORS.VOID_BLACK,
    },
    inner: {
        flex: 1,
        paddingHorizontal: SPACING.VOID_MARGIN_HORIZONTAL,
    },
});
