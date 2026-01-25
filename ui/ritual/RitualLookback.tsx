import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from '../primitives/GlassCard';

export const RitualLookback: React.FC = () => {
    return (
        <GlassCard style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Yesterday</Text>
                <Text style={styles.subtitle}>Still iconic.</Text>
            </View>

            <View style={styles.content}>
                {/* Placeholder for outfit visuals */}
                <View style={styles.previewStrip}>
                    <View style={[styles.itemPreview, { backgroundColor: '#333' }]} />
                    <View style={[styles.itemPreview, { backgroundColor: '#444' }]} />
                    <View style={[styles.itemPreview, { backgroundColor: '#555' }]} />
                </View>

                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Remix</Text>
                </TouchableOpacity>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.STACK.NORMAL,
        marginBottom: SPACING.STACK.NORMAL,
        marginTop: SPACING.STACK.NORMAL,
    },
    header: {
        marginBottom: SPACING.STACK.NORMAL,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: TYPOGRAPHY.SCALE.H3,
        color: COLORS.SOFT_WHITE,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: COLORS.ELECTRIC_BLUE,
        fontStyle: 'italic',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    previewStrip: {
        flexDirection: 'row',
        gap: 4,
    },
    itemPreview: {
        width: 40,
        height: 50,
        borderRadius: 4,
        backgroundColor: COLORS.SUBTLE_GRAY,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: COLORS.SURFACE_GLASS,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    actionText: {
        color: COLORS.RITUAL_WHITE || COLORS.SOFT_WHITE,
        fontSize: TYPOGRAPHY.SCALE.SMALL,
        fontWeight: '600',
    }
});
