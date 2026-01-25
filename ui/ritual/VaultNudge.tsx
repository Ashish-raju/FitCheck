import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { GlassCard } from '../primitives/GlassCard';

interface VaultNudgeProps {
    missingCategory: string;
    onAddPress: () => void;
}

export const VaultNudge: React.FC<VaultNudgeProps> = ({ missingCategory, onAddPress }) => {
    return (
        <GlassCard style={styles.container}>
            <View style={styles.row}>
                <View style={styles.iconPlaceholder}>
                    <Text style={{ fontSize: 24 }}>👟</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.message}>
                        You’ve got range. But you’re missing <Text style={styles.highlight}>{missingCategory}</Text>.
                    </Text>
                    <TouchableOpacity onPress={onAddPress}>
                        <Text style={styles.cta}>Add {missingCategory} now →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.STACK.NORMAL,
        marginBottom: SPACING.STACK.NORMAL,
        backgroundColor: 'rgba(255, 100, 100, 0.05)', // Subtle red tint for alert/nudge
        borderColor: 'rgba(255, 100, 100, 0.2)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.STACK.NORMAL,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    info: {
        flex: 1,
    },
    message: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.BODY,
        color: COLORS.ASH_GRAY,
        marginBottom: 8,
        lineHeight: 22,
    },
    highlight: {
        color: COLORS.SOFT_WHITE,
        fontWeight: 'bold',
    },
    cta: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.CAPTION,
        color: COLORS.ELECTRIC_BLUE,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    }
});
