import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Gesture, GestureDetector, Directions, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight, runOnJS, useAnimatedStyle, useSharedValue, useAnimatedScrollHandler, useAnimatedRef } from 'react-native-reanimated';
import { useRitualState } from '../state/ritualProvider';
import { ritualMachine } from '../state/ritualMachine';
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { WardrobeRepo } from '../../data/repos/wardrobeRepo';
import { useAuth } from '../../context/auth/AuthProvider';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import * as Haptics from 'expo-haptics';
import { OpenAIVisionService } from '../../services/OpenAIVisionService';

const { width } = Dimensions.get('window');
const GUTTER = 20;
const CARD_WIDTH = width - (GUTTER * 2);
const CARD_HEIGHT = CARD_WIDTH / 0.92;

// Create an Animated version of the GestureHandler ScrollView
const AnimatedScrollView = Animated.createAnimatedComponent(GHScrollView);

export const ItemPreviewScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { draftItem } = useRitualState();
    const { user } = useAuth();

    // @ts-ignore
    const viewParams: any = route.params || {};
    const viewItem = viewParams.item;
    const isReadOnly = viewParams.readonly || false;

    // Use viewItem (from params) OR draftItem (from context)
    const targetItem = viewItem || draftItem;

    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiMetadata, setAiMetadata] = useState<any>(null);
    const [name, setName] = useState(targetItem?.name || '');
    const [category, setCategory] = useState(targetItem?.category || 'Top');
    const [price, setPrice] = useState(targetItem?.price ? String(targetItem.price) : '');

    const CATEGORIES: any[] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];

    // Animation Logic
    const [direction, setDirection] = React.useState<'left' | 'right'>('right');

    const changeCategory = React.useCallback((dir: 1 | -1) => {
        if (isReadOnly) return; // Disable in read-only
        const currentIndex = CATEGORIES.indexOf(category);
        let nextIndex = currentIndex + dir;

        // Loop
        if (nextIndex >= CATEGORIES.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = CATEGORIES.length - 1;

        setDirection(dir === 1 ? 'right' : 'left');
        setCategory(CATEGORIES[nextIndex]);
        Haptics.selectionAsync();
    }, [category, isReadOnly]);

    const swipeLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => runOnJS(changeCategory)(1));
    const swipeRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => runOnJS(changeCategory)(-1));
    const composedGesture = Gesture.Simultaneous(swipeLeft, swipeRight);

    // Redirect effect - only runs if no item is available
    React.useEffect(() => {
        if (!viewItem && !draftItem) {
            ritualMachine.toWardrobe();
        }
    }, [draftItem, viewItem]);

    // Define handleCancel for BOTH modes
    const handleCancel = () => {
        Haptics.selectionAsync();
        if (isReadOnly) {
            navigation.goBack();
        } else {
            ritualMachine.clearDraftItem();
            ritualMachine.toCamera();
        }
    };

    // --- ALL ANIMATION/SHEET HOOKS MUST BE CALLED BEFORE EARLY RETURN ---
    // Sheet Logic (Read Only)
    const sheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: 0 }]
        };
    });

    const handleSheetClose = () => {
        navigation.goBack();
    };

    // Track Scroll Position
    const scrollY = useSharedValue(0);
    // Use AnimatedRef for the GH ScrollView
    const scrollRef = useAnimatedRef<any>();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Hard Swipe To Close Logic
    const panGesture = Gesture.Pan()
        // Simultaneous with the scroll view reference (works best with GHScrollView)
        .simultaneousWithExternalGesture(scrollRef)
        .onEnd((e) => {
            // "Hard Swipe" check:
            // 1. High velocity downward (1500 is firm but achievable)
            // 2. We are at or near the top (<= 5px tolerance)
            if (e.velocityY > 1500 && scrollY.value <= 5) {
                runOnJS(handleSheetClose)();
            }
        });

    // NOW it's safe to return early AFTER ALL HOOKS have been called
    if (!targetItem) {
        return null;
    }

    const userId = user?.uid || 'guest';

    const handleAddToWardrobe = async () => {
        if (isSaving) return;

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            // Create garment using WardrobeRepo (use targetItem, not draftItem)
            const finalPiece = {
                ...targetItem,
                name: name || `${targetItem.color || ''} ${category}`.trim() || 'New Item',
                category: category,
                price: price ? parseFloat(price) : undefined,
            };

            // Save to WardrobeRepo (this is what WardrobeScreen reads from)
            await WardrobeRepo.createGarment(userId, finalPiece);

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

    /**
     * AI Photo Analysis - Extracts metadata using GPT-4 Vision
     */
    const handleAnalyzePhoto = async () => {
        if (!targetItem?.imageUri || isAnalyzing) return;

        setIsAnalyzing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            console.log('[ItemPreviewScreen] Starting GPT-4o analysis...');
            const metadata = await OpenAIVisionService.analyzeGarment(targetItem.imageUri);

            console.log('[ItemPreviewScreen] AI analysis complete:', metadata);

            // Store metadata
            setAiMetadata(metadata);

            // Auto-fill form with AI suggestions
            if (metadata.type) {
                const categoryMap: Record<string, string> = {
                    'top': 'Top',
                    'bottom': 'Bottom',
                    'shoes': 'Shoes',
                    'layer': 'Outerwear',
                    'accessory': 'Accessory'
                };
                const suggestedCategory = categoryMap[metadata.type] || 'Top';
                setCategory(suggestedCategory);
            }

            if (metadata.aiDescription) {
                // Use AI description as name if not set
                setName(metadata.aiDescription.split(',')[0] || name);
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                '✨ Analysis Complete!',
                `AI detected: ${metadata.aiDescription}\n\nConfidence: ${Math.round((metadata.aiConfidence || 0.9) * 100)}%\n\nReview and confirm the details below.`,
                [{ text: 'OK', style: 'default' }]
            );

        } catch (error) {
            console.error('[ItemPreviewScreen] AI analysis failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            Alert.alert(
                'Analysis Failed',
                error instanceof Error ? error.message : 'Could not analyze photo. Please enter details manually.',
                [{ text: 'OK', style: 'cancel' }]
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    // If Read Only, we render a Bottom Sheet style
    if (isReadOnly) {
        return (
            <View style={[styles.container, { justifyContent: 'flex-end', backgroundColor: 'transparent' }]}>
                {/* Backdrop */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleSheetClose}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                </TouchableOpacity>

                {/* Sheet Content (60%) */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.sheetContainer, sheetStyle]}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        <AnimatedScrollView
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            onScroll={scrollHandler}
                            scrollEventThrottle={16}
                            bounces={true} // Bounces feel better on iOS
                        >
                            {/* Preview Card - No Bounce Animation */}
                            <View style={[styles.previewContainer, { marginTop: 20 }]}>
                                <WardrobeItemCard
                                    item={{
                                        id: targetItem.id,
                                        name: name || `${targetItem.color || ''} ${category}`.trim() || 'Untitled Item',
                                        category: category.toUpperCase(),
                                        imageUri: targetItem.imageUri,
                                        color: targetItem.color,
                                        brand: targetItem.brand,
                                        wornCount: targetItem.wearHistory?.length || 0
                                    }}
                                    onPress={() => { }}
                                    width={CARD_WIDTH * 0.9} // Slightly smaller in sheet
                                    height={(CARD_WIDTH * 0.9) / 0.92}
                                />
                            </View>

                            {/* Details - Simplified */}
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>CATEGORY</Text>
                                    <Text style={styles.detailValue}>{category.toUpperCase()}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>COLOR</Text>
                                    <Text style={styles.detailValue}>{targetItem.color || 'Unknown'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>PRICE</Text>
                                    <Text style={styles.detailValue}>${price || '0.00'}</Text>
                                </View>
                                {targetItem.brand && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>BRAND</Text>
                                        <Text style={styles.detailValue}>{targetItem.brand}</Text>
                                    </View>
                                )}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>TIMES WORN</Text>
                                    <Text style={styles.detailValue}>{targetItem.wearHistory?.length || 0}</Text>
                                </View>

                                {/* Dummy content to ensure scrollability if needed */}
                                <View style={{ height: 20 }} />
                            </View>
                        </AnimatedScrollView>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    }

    // --- STANDARD FULL SCREEN (Camera / Edit) ---
    return (
        <View style={[styles.container, { backgroundColor: COLORS.RITUAL_BLACK }]}>
            {/* Header - Fixed at Top */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerLabel}>PREVIEW</Text>
                    <Text style={styles.headerTitle}>{name || 'Item'}</Text>
                </View>
                <View style={styles.closeButton} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <AnimatedScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Preview Card */}
                    <View style={styles.previewContainer}>
                        <GestureDetector gesture={composedGesture}>
                            <Animated.View
                                key={category}
                                entering={direction === 'right' ? SlideInRight.springify().damping(20) : SlideInLeft.springify().damping(20)}
                                exiting={FadeOut.duration(100)}
                            >
                                <WardrobeItemCard
                                    item={{
                                        id: targetItem.id,
                                        name: name || `${targetItem.color || ''} ${category}`.trim() || 'Untitled Item',
                                        category: category.toUpperCase(),
                                        imageUri: targetItem.imageUri,
                                        color: targetItem.color,
                                        brand: targetItem.brand,
                                        wornCount: targetItem.wearHistory?.length || 0
                                    }}
                                    onPress={() => { }}
                                    width={CARD_WIDTH}
                                    height={CARD_HEIGHT}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </View>

                    {/* AI Analysis Button */}
                    {!isReadOnly && (
                        <View style={styles.aiButtonContainer}>
                            <TouchableOpacity
                                style={[styles.aiButton, isAnalyzing && styles.aiButtonDisabled]}
                                onPress={handleAnalyzePhoto}
                                disabled={isAnalyzing}
                                activeOpacity={0.8}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <ActivityIndicator size="small" color={COLORS.RITUAL_BLACK} style={{ marginRight: 8 }} />
                                        <Text style={styles.aiButtonText}>Analyzing Photo...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.aiButtonIcon}>✨</Text>
                                        <Text style={styles.aiButtonText}>Analyze with AI</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            {aiMetadata && aiMetadata.aiConfidence && (
                                <Text style={styles.confidenceText}>
                                    {Math.round(aiMetadata.aiConfidence * 100)}% confident
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Item Details (Editable) */}
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
                            <Text style={styles.detailValue}>{targetItem.color || 'Unknown'}</Text>
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
                </AnimatedScrollView>
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
    // Sheet Styles
    sheetContainer: {
        height: '60%',
        backgroundColor: COLORS.RITUAL_BLACK,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        paddingTop: 10,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 10,
        marginTop: 5,
    },
    // AI Analysis Styles
    aiButtonContainer: {
        paddingHorizontal: GUTTER,
        marginBottom: 20,
        alignItems: 'center',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A78BFA',  // Purple gradient
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 20,
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    aiButtonDisabled: {
        opacity: 0.6,
    },
    aiButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    aiButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.RITUAL_BLACK,
        letterSpacing: 0.5,
    },
    confidenceText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 11,
        fontWeight: '500',
        color: '#A78BFA',
        marginTop: 8,
        letterSpacing: 0.5,
    },
});
