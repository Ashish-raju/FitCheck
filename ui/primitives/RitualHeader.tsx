import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';

interface RitualHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    showBack?: boolean;
}

export const RitualHeader: React.FC<RitualHeaderProps> = ({
    title,
    subtitle,
    onBack,
    showBack = true
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {showBack && onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.textContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 12,
        paddingHorizontal: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    backText: {
        fontSize: 24,
        color: MATERIAL.TEXT_MAIN,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 24,
        color: MATERIAL.TEXT_MAIN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: MATERIAL.TEXT_MUTED,
        marginTop: 4,
    },
});
