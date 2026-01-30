import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { UserService } from '../../../services/UserService';
import { FIREBASE_AUTH } from '../../../system/firebase/firebaseConfig';

const STYLE_OPTIONS = [
    'Minimalist', 'Streetwear', 'Vintage', 'Avant-Garde',
    'Techwear', 'Classic', 'Bohemian', 'Grunge', 'Preppy'
];

interface StylePreferencesProps {
    selected: string[];
    onUpdate: (newPrefs: string[]) => void;
}

import Svg, { Path } from 'react-native-svg';

// Simple Icon Mapper
const StyleIcon = ({ style, color }: { style: string, color: string }) => {
    // Abstract icons
    let d = "M20,50 L80,50"; // Default line
    if (style === 'Minimalist') d = "M30,50 L70,50";
    else if (style === 'Streetwear') d = "M20,20 L80,80 M80,20 L20,80"; // X
    else if (style === 'Vintage') d = "M50,20 C80,20 80,80 50,80 C20,80 20,20 50,20"; // Circle
    else if (style === 'Preppy') d = "M50,20 L80,80 L20,80 Z"; // Triangle
    return (
        <Svg width="16" height="16" viewBox="0 0 100 100" style={{ marginRight: 6 }}>
            <Path d={d} stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
        </Svg>
    );
}

export const StylePreferences: React.FC<StylePreferencesProps> = ({ selected = [], onUpdate }) => {

    const togglePreference = async (pref: string) => {
        const newSelected = selected.includes(pref)
            ? selected.filter(p => p !== pref)
            : [...selected, pref];

        onUpdate(newSelected); // Optimistic update

        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (uid) {
            try {
                await UserService.getInstance().updateProfile(uid, {
                    // @ts-ignore: Using dot notation for nested update to avoid overwriting other prefs
                    "preferences.stylePreferences": newSelected
                });
            } catch (error) {
                console.error("Failed to save style prefs", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.chipContainer}>
                {STYLE_OPTIONS.map((style) => {
                    const isSelected = selected.includes(style);
                    const iconColor = isSelected ? COLORS.RITUAL_WHITE : COLORS.ASH_GRAY;

                    return (
                        <TouchableOpacity
                            key={style}
                            style={[styles.chip, isSelected && styles.activeChip]}
                            onPress={() => togglePreference(style)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <StyleIcon style={style} color={iconColor} />
                                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                                    {style}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.CARBON_BLACK,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    activeChip: {
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        borderColor: COLORS.ELECTRIC_VIOLET,
    },
    chipText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        fontWeight: '600',
    },
    activeChipText: {
        color: COLORS.RITUAL_WHITE,
    }
});
