import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY } from '../tokens';
import { useRitualState } from '../state/ritualProvider';
import { ritualMachine } from '../state/ritualMachine';
import { SwipeDeck } from './SwipeDeck';

export const RitualDeckScreen = () => {
    const navigation = useNavigation();
    const { candidateOutfits } = useRitualState();

    // Local check for empty state handling or navigation
    const handleIndexChange = (newIndex: number) => {
        // If we are near the end, we might want to trigger a fetch or navigate home
        if (candidateOutfits && newIndex >= candidateOutfits.length) {
            ritualMachine.toHome();
        }
    };

    if (!candidateOutfits || candidateOutfits.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>NO RITUALS DETECTED</Text>
                <TouchableOpacity onPress={() => ritualMachine.toHome()} style={styles.button}>
                    <Text style={styles.buttonText}>RETURN HOME</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SwipeDeck
                data={candidateOutfits}
                onIndexChange={handleIndexChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    emptyText: {
        color: COLORS.ASH_GRAY,
        fontSize: 16,
        letterSpacing: 2,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        marginBottom: 24,
    },
    button: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    buttonText: {
        color: COLORS.ELECTRIC_BLUE,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
});
