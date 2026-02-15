import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';

export const InsightStrip: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={[styles.body, styles.insightText]}>
                    Your wardrobe is strongest in <Text style={{ color: COLORS.ELECTRIC_BLUE }}>dark neutrals</Text>.
                </Text>
            </View>

            <TouchableOpacity>
                <Text style={[styles.micro, styles.linkText]}>VIEW BREAKDOWN →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        marginTop: SPACING.STACK.LARGE,
        paddingHorizontal: SPACING.STACK.TIGHT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginRight: SPACING.STACK.NORMAL,
    },
    body: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.ASH_GRAY,
    },
    micro: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: 'bold',
    },
    insightText: {
        color: COLORS.ASH_GRAY,
    },
    linkText: {
        color: COLORS.ELECTRIC_VIOLET,
        letterSpacing: 1,
    }
});
