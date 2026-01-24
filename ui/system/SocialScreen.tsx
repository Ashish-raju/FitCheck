import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';

export const SocialScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Circle</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.placeholder}>Friends feed coming in v1.1</Text>
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
