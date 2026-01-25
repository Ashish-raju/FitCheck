import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { t } from '../../src/copy';

export const InsightsScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Style DNA</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.placeholder}>{t('insights.comingSoon')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MATERIAL.BACKGROUND,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: MATERIAL.BORDER,
    },
    headerTitle: {
        color: MATERIAL.TEXT_MAIN,
        fontSize: TYPOGRAPHY.SCALE.H2,
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        color: MATERIAL.TEXT_MUTED,
        fontSize: TYPOGRAPHY.SCALE.BODY,
    }
});
