import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../../tokens/color.tokens';
import { TravelPack } from '../../../../truth/types';
import { SmartImage } from '../../../primitives/SmartImage';

interface TravelPackResultProps {
    pack: TravelPack | null;
    onSave: () => void;
    onClose: () => void;
}

import Svg, { Path } from 'react-native-svg';

const CategoryIcon = ({ category }: { category: string }) => {
    let d = "M10,10 L90,10 L90,90 L10,90 Z";
    // Short logic
    const c = category.toLowerCase();
    if (c.includes('top') || c.includes('shirt')) d = "M20,90 L20,40 L10,40 L20,10 L80,10 L90,40 L80,40 L80,90 Z"; // Shirt
    else if (c.includes('bottom') || c.includes('pant')) d = "M30,10 L70,10 L80,90 L55,90 L50,40 L45,90 L20,90 Z"; // Pants
    else if (c.includes('shoe') || c.includes('foot')) d = "M20,50 L20,80 L80,80 L80,60 C80,40 50,40 20,50"; // Shoe

    return (
        <Svg width="12" height="12" viewBox="0 0 100 100" style={{ marginRight: 6 }}>
            <Path d={d} stroke={COLORS.ASH_GRAY} strokeWidth="6" fill="none" />
        </Svg>
    );
};

export const TravelPackResult: React.FC<TravelPackResultProps> = ({ pack, onSave, onClose }) => {
    if (!pack) return null;

    const [checkedItems, setCheckedItems] = useState(new Set<string>());

    const toggleCheck = (id: string) => {
        const next = new Set(checkedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedItems(next);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.tripTitle}>{pack.destination}</Text>
                    <Text style={styles.tripSub}>{pack.durationDays} Days • {pack.purpose}</Text>
                </View>
                <TouchableOpacity onPress={onClose}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
            </View>

            <ScrollView style={styles.list}>
                <Text style={styles.sectionHeader}>PACKING LIST ({pack.items.length})</Text>
                {pack.items.map(item => {
                    const isChecked = checkedItems.has(item.id);
                    return (
                        <TouchableOpacity key={item.id} style={styles.itemRow} onPress={() => toggleCheck(item.id)}>
                            <SmartImage
                                source={{ uri: (item.imageUri || item.processedImageUri) as string }}
                                style={[styles.itemThumb, isChecked && styles.itemThumbDim]}
                            />
                            <View style={styles.itemInfo}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <CategoryIcon category={item.category} />
                                    <Text style={[styles.itemName, isChecked && styles.textDim]}>{item.category}</Text>
                                </View>
                                <Text style={styles.itemMeta}>{item.color}</Text>
                            </View>
                            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                {isChecked && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                    <Text style={styles.saveText}>Save Pack</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tripTitle: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 20,
        fontWeight: 'bold',
    },
    tripSub: {
        color: COLORS.ASH_GRAY,
        fontSize: 14,
        marginTop: 4,
    },
    closeText: {
        color: COLORS.ASH_GRAY,
        fontSize: 14,
        padding: 4,
    },
    list: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 8,
        borderRadius: 8,
    },
    itemThumb: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
    },
    itemThumbDim: {
        opacity: 0.5,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
    },
    itemMeta: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
    },
    textDim: {
        color: COLORS.ASH_GRAY,
        textDecorationLine: 'line-through',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.GLASS_BORDER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        borderColor: COLORS.ELECTRIC_VIOLET,
    },
    checkmark: {
        color: 'white',
        fontSize: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    saveBtn: {
        backgroundColor: COLORS.RITUAL_WHITE,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveText: {
        color: COLORS.VOID_BLACK,
        fontWeight: 'bold',
    }
});
