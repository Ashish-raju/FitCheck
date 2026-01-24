import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../foundation/colors';
import { TEXT } from '../foundation/typography';
import { SPACE, LAYOUT } from '../foundation/spacing';

export const InsightStrip: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={[TEXT.body, styles.insightText]}>
                    Your wardrobe is strongest in <Text style={{ color: COLORS.electric_blue }}>dark neutrals</Text>.
                </Text>
            </View>

            <TouchableOpacity>
                <Text style={[TEXT.micro, styles.linkText]}>VIEW BREAKDOWN →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: LAYOUT.cardWidth,
        alignSelf: 'center',
        marginTop: SPACE.lg,
        paddingHorizontal: SPACE.xs,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginRight: SPACE.md,
    },
    insightText: {
        color: COLORS.secondary,
    },
    linkText: {
        color: COLORS.tertiary,
        letterSpacing: 1,
    }
});
