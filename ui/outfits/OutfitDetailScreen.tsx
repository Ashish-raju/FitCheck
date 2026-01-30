import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, interpolate, Extrapolation, withTiming, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { OutfitStore } from '../../state/outfits/OutfitStore';
import { OutfitDraftStore } from '../../state/outfits/OutfitDraftStore';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { COLORS, TYPOGRAPHY } from '../tokens';
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { Piece } from '../../truth/types';

const { width, height } = Dimensions.get('window');

// Layout Proportions (Approximate based on user request)
const TITLE_HEIGHT = height * 0.15; // 15% (20% might be too big with nav)
const IMAGE_HEIGHT = height * 0.50; // 50%
const DESC_HEIGHT = height * 0.20;  // 20%

const SWIPE_THRESHOLD = width * 0.6;

export const OutfitDetailScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // @ts-ignore
    const { outfitId } = route.params;

    useEffect(() => {
        console.log("!!! OUTFIT DETAIL SCREEN MOUNTED !!! ID:", outfitId);
        const outfit = OutfitStore.getInstance().getOutfit(outfitId);
        console.log("!!! OUTFIT DATA:", outfit ? "FOUND" : "NOT FOUND");
        if (outfit) {
            console.log("!!! ITEMS:", outfit.items);
            const inv = InventoryStore.getInstance();
            outfit.items.forEach(id => {
                console.log(`!!! CHECKING ID ${id}:`, inv.getPiece(id) ? "EXISTS" : "MISSING");
            });
        }
    }, [outfitId]);

    const [isDeleting, setIsDeleting] = useState(false);
    const [items, setItems] = useState<Piece[]>([]);

    const outfit = useMemo(() => {
        return OutfitStore.getInstance().getOutfit(outfitId);
    }, [outfitId]);

    // Load items with retry to handle store initialization race conditions
    useEffect(() => {
        if (!outfit) return;

        let retries = 0;
        const load = () => {
            const inventory = InventoryStore.getInstance();
            // @ts-ignore
            const loaded: Piece[] = outfit.items
                .map(id => inventory.getPiece(id))
                .filter((p): p is Piece => !!p);

            setItems(loaded);
            return loaded.length;
        };

        const count = load();
        if (count === 0 && outfit.items.length > 0) {
            const interval = setInterval(() => {
                const c = load();
                retries++;
                // If we find items, or max retries reached
                if (c > 0 || retries > 5) clearInterval(interval);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [outfit]);

    // --- DELETE LOGIC ---
    const translateX = useSharedValue(0);
    const overlayTranslateY = useSharedValue(0);

    // Threshold calculation
    const ACTION_THRESHOLD = width * 0.7;
    const DISMISS_THRESHOLD = 50;

    const confirmDelete = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await OutfitStore.getInstance().deleteOutfit(outfitId);
        navigation.goBack();
    };

    const closeDeleteOverlay = () => {
        setIsDeleting(false);
        // Reset values
        translateX.value = withTiming(0, { duration: 300 });
        overlayTranslateY.value = withTiming(0, { duration: 300 });
    };

    // Horizontal Slide to Delete
    const horizontalPan = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationX > 0 && e.translationX <= width - 80) {
                translateX.value = e.translationX;
            }
        })
        .onEnd(() => {
            if (translateX.value > ACTION_THRESHOLD) {
                runOnJS(confirmDelete)();
            } else {
                translateX.value = withTiming(0, { duration: 300 });
            }
        });

    // Vertical Swipe to Dismiss
    const verticalPan = Gesture.Pan()
        .onChange((e) => {
            // Only allow dragging down
            if (e.translationY > 0) {
                overlayTranslateY.value = e.translationY;
            }
        })
        .onEnd(() => {
            if (overlayTranslateY.value > DISMISS_THRESHOLD) {
                runOnJS(closeDeleteOverlay)();
            } else {
                overlayTranslateY.value = withTiming(0, { duration: 300 });
            }
        });

    const sliderStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }]
        };
    });

    const sliderTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [0, ACTION_THRESHOLD / 2], [1, 0], Extrapolation.CLAMP);
        return { opacity };
    });

    const overlayStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: overlayTranslateY.value }]
        };
    });

    if (!outfit) return null;

    // Analysis Placeholder Data
    const analysis = {
        score: Math.round(outfit.score || 85),
        skinMatch: 'High',
        skinToneAdvice: 'These colors complement your warm undertones wonderfully.',
        season: 'Recommended for Fall/Winter'
    };

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>

            {!isDeleting ? (
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        setIsDeleting(true);
                    }}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={24} color="#FF453A" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        closeDeleteOverlay();
                    }}
                    style={styles.deleteButton}
                >
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    );

    const ITEM_WIDTH = (width - 40) / 2.1;
    const ITEM_HEIGHT = ITEM_WIDTH * 1.25;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 1. Title Section (Top 20% concept) */}
                <View style={[styles.titleSection, { marginTop: insets.top }]}>
                    <Text style={styles.occasionLabel}>{outfit.occasion.toUpperCase()}</Text>
                    <Text style={styles.outfitTitle}>{outfit.name || 'Untitled Look'}</Text>
                    <Text style={styles.dateLabel}>{new Date(outfit.createdAt).toLocaleDateString()}</Text>
                </View>

                {/* 2. Hero Image (50% Height) */}
                <View style={[styles.imageSection, { height: IMAGE_HEIGHT }]}>
                    <Image
                        source={outfit.imageUri ? { uri: outfit.imageUri } : undefined}
                        style={styles.heroImage}
                        contentFit="contain" // Contain to show the full canvas
                        transition={300}
                    />
                </View>

                {/* 3. Description (20% Height) */}
                <View style={[styles.descSection, { minHeight: DESC_HEIGHT }]}>
                    <Text style={styles.descText}>
                        A perfect {outfit.occasion.toLowerCase()} look combining {items.length} pieces.
                        Features {items.slice(0, 2).map(i => i.brand).join(' and ')} for a balanced silhouette.
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => {
                                Haptics.selectionAsync();
                                // Initialize Draft Session (Synchronous)
                                OutfitDraftStore.getInstance().loadDraft(outfit.id);
                                // Navigate directly to Canvas for editing (Bypassing Bento Grid / CreateOutfit)
                                // @ts-ignore
                                navigation.navigate('StylingCanvas');
                            }}
                        >
                            <Ionicons name="create-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="calendar-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>Plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="share-social-outline" size={20} color="#FFF" />
                            <Text style={styles.actionBtnText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* scrollable Content */}
                <View style={styles.scrollContent}>

                    {/* Analysis Card */}
                    <LinearGradient
                        colors={['#1F1F1F', '#111']}
                        style={styles.analysisCard}
                    >
                        <View style={styles.scoreCircle}>
                            <Text style={styles.scoreVal}>{analysis.score}</Text>
                            <Text style={styles.scoreLabel}>MATCH</Text>
                        </View>
                        <View style={styles.analysisTextContent}>
                            <Text style={styles.analysisTitle}>Style Analysis</Text>
                            <Text style={styles.analysisBody}>{analysis.skinToneAdvice}</Text>
                            <Text style={styles.analysisDetail}>{analysis.season}</Text>
                        </View>
                    </LinearGradient>

                    {/* Items Grid */}
                    <Text style={styles.sectionHeader}>In this Look ({items.length})</Text>
                    <View style={styles.itemsGrid}>
                        {items.map(item => (
                            <View key={item.id} style={{ marginBottom: 20 }}>
                                <WardrobeItemCard
                                    item={{
                                        id: item.id,
                                        name: item.name || 'Untitled',
                                        category: item.category.toUpperCase(),
                                        imageUri: item.imageUri,
                                        color: item.brand || 'Brand', // Using brand slot for brand
                                        brand: item.color || 'Color',
                                        wornCount: item.wearHistory?.length || 0
                                    }}
                                    onPress={() => {
                                        // Open Item Detail (Read Only Sheet)
                                        // @ts-ignore
                                        navigation.navigate('ItemDetailSheet', { item: item, readonly: true });
                                    }}
                                    width={ITEM_WIDTH}
                                    height={ITEM_HEIGHT}
                                />
                            </View>
                        ))}
                    </View>

                </View>
            </ScrollView>

            {/* Absolute Header Overlay */}
            {renderHeader()}

            {/* Delete Confirmation Overlay - Bottom Sheet Style */}
            {isDeleting && (
                <GestureDetector gesture={verticalPan}>
                    <Animated.View
                        style={[styles.deleteOverlay, { paddingBottom: insets.bottom + 20 }, overlayStyle]}
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(200)}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        <Text style={styles.deleteWarning}>Permanently Delete?</Text>

                        <View style={styles.sliderTrack}>
                            <Animated.Text style={[styles.sliderText, sliderTextStyle]}>
                                Swipe right to delete {'>>'}
                            </Animated.Text>

                            <GestureDetector gesture={horizontalPan}>
                                <Animated.View style={[styles.sliderKnob, sliderStyle]}>
                                    <Ionicons name="trash" size={24} color="#FFF" />
                                </Animated.View>
                            </GestureDetector>
                        </View>
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.RITUAL_BLACK,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Sections
    titleSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        justifyContent: 'flex-end',
        minHeight: 100, // Ensure strictly layout compliance? 
    },
    occasionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.ELECTRIC_BLUE,
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    outfitTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: '#888',
    },
    imageSection: {
        width: '100%',
        backgroundColor: '#FFF', // White BG for canvas
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    descSection: {
        padding: 20,
        backgroundColor: '#161616',
        justifyContent: 'center',
    },
    descText: {
        fontSize: 16,
        color: '#CCC',
        lineHeight: 24,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 15,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        gap: 8,
    },
    actionBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 12,
    },
    // Scroll Content
    scrollContent: {
        padding: 20,
    },
    analysisCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    scoreCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: COLORS.ELECTRIC_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    scoreVal: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    scoreLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: COLORS.ELECTRIC_BLUE,
    },
    analysisTextContent: {
        flex: 1,
    },
    analysisTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 6,
    },
    analysisBody: {
        fontSize: 13,
        color: '#CCC',
        marginBottom: 4,
        lineHeight: 18,
    },
    analysisDetail: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 15,
    },
    itemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    // Delete Overlay
    deleteOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        alignItems: 'center',
        zIndex: 200,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 20,
        borderTopWidth: 1,
        borderColor: '#333',
    },
    deleteWarning: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF453A',
        marginBottom: 20,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    sliderTrack: {
        width: '100%',
        height: 60,
        backgroundColor: '#333',
        borderRadius: 30,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    sliderKnob: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FF453A',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 4,
    },
    sliderText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 2.5,
        marginBottom: 15, // Space between handle and warning text
    }
});
