import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { TYPOGRAPHY } from '../../tokens';
import { Outfit } from '../../../state/outfits/OutfitStore';
import { Piece } from '../../../truth/types';
import { InventoryStore } from '../../../state/inventory/inventoryStore';

interface OutfitCardProps {
    outfit: Outfit;
    onPress: () => void;
    width: number;
    height: number;
}

export const OutfitCard: React.FC<OutfitCardProps> = React.memo(({ outfit, onPress, width, height }) => {

    // Retrieve first 4 items to display a collage
    const inventory = InventoryStore.getInstance();
    const loadedItems = outfit.items
        .map(id => inventory.getPiece(id))
        .filter((p): p is Piece => !!p)
        .slice(0, 4);

    const renderPreview = () => {
        // 1. Show saved canvas thumbnail if available
        if (outfit.imageUri) {
            return (
                <View style={[styles.collageContainer, { backgroundColor: '#FFF' }]}>
                    <Image
                        source={{ uri: outfit.imageUri }}
                        style={styles.image}
                        contentFit="contain" // Contain to show full outfit
                        transition={200}
                    />
                </View>
            );
        }

        if (loadedItems.length === 0) {
            return (
                <View style={styles.emptyPreview}>
                    <Text style={styles.emptyText}>Empty</Text>
                </View>
            );
        }

        // 2x2 Grid Collage (Fallback)
        return (
            <View style={styles.collageContainer}>
                {loadedItems.map((item, index) => (
                    <View key={item.id} style={styles.collageItem}>
                        <Image source={item.imageUri ? { uri: String(item.imageUri) } : undefined} style={styles.image} contentFit="cover" />
                    </View>
                ))}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={[styles.card, { width, height }]}
            onPress={() => {
                Haptics.selectionAsync();
                onPress();
            }}
            activeOpacity={0.9}
        >
            {renderPreview()}

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />

            <View style={styles.content}>
                <Text style={styles.occasion}>{outfit.occasion.toUpperCase()}</Text>
                <Text style={styles.score}>{Math.round(outfit.score)}</Text>
            </View>

            {outfit.isFavorite && (
                <View style={styles.favBadge}>
                    <Text style={styles.favIcon}>♥</Text>
                </View>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    collageContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    collageItem: {
        width: '50%',
        height: '50%',
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.2)',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    emptyPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    emptyText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    content: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    occasion: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    score: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    favBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
        padding: 4,
    },
    favIcon: {
        color: COLORS.RITUAL_RED || '#FF3B30',
        fontSize: 10,
    }
});
