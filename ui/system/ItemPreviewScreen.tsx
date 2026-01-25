import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight, runOnJS } from 'react-native-reanimated';
import { useRitualState } from '../state/ritualProvider';
import { ritualMachine } from '../state/ritualMachine';
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const GUTTER = 20;
const CARD_WIDTH = width - (GUTTER * 2);
const CARD_HEIGHT = CARD_WIDTH / 0.92;

export const ItemPreviewScreen: React.FC = () => {
    const { draftItem } = useRitualState();
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState(draftItem?.name || '');
    const [category, setCategory] = useState(draftItem?.category || 'Top');
    const [price, setPrice] = useState('');

    const CATEGORIES: any[] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];

    // Animation Logic
    const [direction, setDirection] = React.useState<'left' | 'right'>('right');

    const changeCategory = React.useCallback((dir: 1 | -1) => {
        const currentIndex = CATEGORIES.indexOf(category);
        let nextIndex = currentIndex + dir;

        // Loop
        if (nextIndex >= CATEGORIES.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = CATEGORIES.length - 1;

        setDirection(dir === 1 ? 'right' : 'left');
        setCategory(CATEGORIES[nextIndex]);
        Haptics.selectionAsync();
    }, [category]);

    const swipeLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => runOnJS(changeCategory)(1));
    const swipeRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => runOnJS(changeCategory)(-1));
    const composedGesture = Gesture.Simultaneous(swipeLeft, swipeRight);

    React.useEffect(() => {
        if (!draftItem) {
            ritualMachine.toWardrobe();
        }
    }, [draftItem]);

    if (!draftItem) return null;

    const handleAddToWardrobe = async () => {
        if (isSaving) return;

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            // Optimistically add to inventory
            const finalPiece = {
                ...draftItem,
                name: name || `${draftItem.color || ''} ${category}`.trim() || 'New Item',
                category: category,
                price: price ? parseFloat(price) : undefined,
            };
            await InventoryStore.getInstance().addPiece(finalPiece);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Clear draft and navigate to wardrobe
            ritualMachine.clearDraftItem();
            ritualMachine.toWardrobe();
        } catch (error) {
            console.error('[ItemPreviewScreen] Failed to save item:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsSaving(false);
        }
    };

    const handleRetake = () => {
        Haptics.selectionAsync();
        ritualMachine.clearDraftItem();
        ritualMachine.toCamera();
    };

    const handleCancel = () => {
        Haptics.selectionAsync();
        ritualMachine.clearDraftItem();
        ritualMachine.toWardrobe();
    };

    return (
        <View style={styles.container}>
            {/* Header - Fixed at Top */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerLabel}>PREVIEW</Text>
                    <Text style={styles.headerTitle}>New Item</Text>
                </View>
                <View style={styles.closeButton} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Preview Card - REUSED COMPONENT */}
                    <View style={styles.previewContainer}>
                        <GestureDetector gesture={composedGesture}>
                            <Animated.View
                                key={category}
                                entering={direction === 'right' ? SlideInRight.springify().damping(20) : SlideInLeft.springify().damping(20)}
                                exiting={FadeOut.duration(100)}
                            >
                                <WardrobeItemCard
                                    item={{
                                        id: draftItem.id,
                                        name: name || `${draftItem.color || ''} ${category}`.trim() || 'Untitled Item',
                                        category: category.toUpperCase(),
                                        imageUri: draftItem.imageUri,
                                        color: draftItem.color,
                                        brand: draftItem.brand,
                                        wornCount: 0
                                    }}
                                    onPress={() => { }}
                                    width={CARD_WIDTH}
                                    height={CARD_HEIGHT}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </View>

                    {/* Item Details */}
                    <View style={styles.detailsContainer}>
                        <TouchableOpacity
                            style={styles.detailRow}
                            onPress={() => {
                                const currentIndex = CATEGORIES.indexOf(category);
                                const nextIndex = (currentIndex + 1) % CATEGORIES.length;
                                setCategory(CATEGORIES[nextIndex]);
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={styles.detailLabel}>CATEGORY (TAP TO CHANGE)</Text>
                            <Text style={styles.detailValue}>{category.toUpperCase()}</Text>
                        </TouchableOpacity>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>COLOR</Text>
                            <Text style={styles.detailValue}>{draftItem.color || 'Unknown'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>PRICE</Text>
                            <TextInput
                                style={styles.priceInput}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.ASH_GRAY}
                                keyboardType="numeric"
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
                            onPress={handleAddToWardrobe}
                            disabled={isSaving}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isSaving ? 'ADDING...' : 'ADD TO WARDROBE'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.secondaryActions}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleRetake}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.secondaryButtonText}>Retake Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: GUTTER,
        paddingTop: 60,
        paddingBottom: 20,
    },
    closeButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 24,
        fontWeight: '200',
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    headerLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 2,
        marginBottom: 4,
    },
    headerTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.RITUAL_WHITE,
    },
    previewContainer: {
        alignItems: 'center',
        paddingHorizontal: GUTTER,
        marginBottom: 24,
    },
    detailsContainer: {
        paddingHorizontal: GUTTER,
        marginBottom: 32,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    detailLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 1.5,
    },
    detailValue: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.RITUAL_WHITE,
    },
    actionsContainer: {
        paddingHorizontal: GUTTER,
        paddingBottom: 40,
        marginTop: 'auto',
    },
    primaryButton: {
        backgroundColor: COLORS.ELECTRIC_BLUE,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.ELECTRIC_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    primaryButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 1.5,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.RITUAL_WHITE,
    },
    priceInput: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.RITUAL_WHITE,
        minWidth: 60,
        textAlign: 'right',
        padding: 0,
    },
});
