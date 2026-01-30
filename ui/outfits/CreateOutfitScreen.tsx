import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { OutfitStore, OUTFIT_OCCASIONS } from '../../state/outfits/OutfitStore';
import { OutfitDraftStore } from '../../state/outfits/OutfitDraftStore';
import { Piece } from '../../truth/types';
import { scoreOutfit } from '../../engine/outfit/outfit_scoring';
import { FlashList } from '@shopify/flash-list';
import { mapPieceToGarment } from './utils/mapper';

// DEBUG LOGGING
const DEBUG = true;
function log(msg: string, ...args: any[]) {
    if (DEBUG) console.log(`[CreateOutfit] ${msg}`, ...args);
}
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { ScrollView } from 'react-native';

const CATEGORIES = ['All', 'Favourites', 'Top', 'Bottom', 'Shoes', 'Outerwear'] as const;

// Memoized Category Tab (Copied from WardrobeScreen for parity)
const CategoryTab = React.memo(({ category, isActive, onPress }: { category: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.tab} activeOpacity={0.7}>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{category.toUpperCase()}</Text>
        {isActive && (
            <View style={styles.activeIndicatorContainer}>
                <View style={styles.activeDot} />
                <View style={styles.activeUnderline} />
            </View>
        )}
    </TouchableOpacity>
));

const { width, height } = Dimensions.get('window');
const CANVAS_HEIGHT = height * 0.40;
const SCORE_BAR_HEIGHT = height * 0.15; // Slightly reduced from 20% to fit better
const PICKER_HEIGHT = height * 0.45;



export const CreateOutfitScreen: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Connect to Draft Store
    const draftStore = OutfitDraftStore.getInstance();

    // Init state from Draft Store (Single Source of Truth)
    const [selectedItems, setSelectedItems] = useState<(Piece | null)[]>(draftStore.state.items);
    const [totalSlots, setTotalSlots] = useState<number>(draftStore.state.totalSlots);
    const [activeSlot, setActiveSlot] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [occasion, setOccasion] = useState(draftStore.state.occasion);
    const [activeTab, setActiveTab] = useState<string>('All');

    // Sync back to Draft Store on change
    useEffect(() => {
        draftStore.updateItems(selectedItems);
    }, [selectedItems]);

    useEffect(() => {
        draftStore.updateOccasion(occasion);
    }, [occasion]);

    useEffect(() => {
        draftStore.updateTotalSlots(totalSlots);
    }, [totalSlots]);

    // Inventory State
    const [pieces, setPieces] = useState<Piece[]>([]);

    // Load inventory on focus
    useFocusEffect(
        useCallback(() => {
            log('Focus Effect Triggered - USING DIRECT MOCK BYPASS');
            const { MOCK_PIECES } = require('../../assets/mock-data/mockPieces');
            setPieces(MOCK_PIECES);

            // Re-sync with store in case we came back from Canvas
            setSelectedItems(draftStore.state.items);
            // This ensures if we back-nav from Canvas, we see what we had
        }, [])
    );

    const filteredPieces = useMemo(() => {
        return pieces.filter(p => {
            if (activeTab === 'Favourites') return p.isFavorite;
            if (activeTab === 'All') return true;
            return p.category === activeTab;
        });
    }, [pieces, activeTab]);

    // Derived State
    const filledItems = useMemo(() => selectedItems.filter(i => i !== null) as Piece[], [selectedItems]);

    // Live Scoring
    useEffect(() => {
        if (filledItems.length > 0) {
            // Need base scores, user profile, context (mocked for now)
            // This is a simplified call, ideally we fetch real context
            const mockUser = { bodyType: 'balanced' } as any;
            const mockContext = { season: 'summer', event: occasion.toLowerCase() } as any;

            // Assuming base item score is ~10-20 per item
            const baseScores = filledItems.map(() => 20);

            const garments = filledItems.map(mapPieceToGarment);
            const calculatedScore = scoreOutfit(garments, baseScores, mockUser, mockContext);
            setScore(calculatedScore); // Normalize if needed
        } else {
            setScore(0);
        }
    }, [filledItems, occasion]);

    const handleSelectItem = (item: Piece) => {
        Haptics.selectionAsync();
        const newItems = [...selectedItems];
        newItems[activeSlot] = item;
        setSelectedItems(newItems);

        // Auto-advance to next empty slot
        const nextEmpty = newItems.findIndex((val, idx) => val === null && idx > activeSlot);
        if (nextEmpty !== -1) {
            setActiveSlot(nextEmpty);
        } else if (newItems.some(i => i === null)) {
            // Wrap around finding first empty
            setActiveSlot(newItems.findIndex(i => i === null));
        }
    };

    const handleSlotChange = (increment: number) => {
        const newTotal = Math.max(2, Math.min(7, totalSlots + increment));
        if (newTotal === totalSlots) return;

        setTotalSlots(newTotal);
        Haptics.selectionAsync();

        // Resize selectedItems array
        setSelectedItems(prev => {
            const newItems = [...prev];
            if (newTotal > prev.length) {
                // Add nulls
                while (newItems.length < newTotal) newItems.push(null);
            } else {
                // Trim (remove last items)
                newItems.length = newTotal;
            }
            return newItems;
        });

        // Ensure active slot is valid
        if (activeSlot >= newTotal) {
            setActiveSlot(newTotal - 1);
        }
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...selectedItems];
        newItems[index] = null;
        setSelectedItems(newItems);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Swipe Logic
    const handleSwipe = useCallback((direction: number) => {
        const currentIndex = CATEGORIES.indexOf(activeTab as any);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + direction;

        // Clamp index
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= CATEGORIES.length) nextIndex = CATEGORIES.length - 1;

        if (nextIndex !== currentIndex) {
            setActiveTab(CATEGORIES[nextIndex]);
            Haptics.selectionAsync();
        }
    }, [activeTab]);

    const hasTriggeredHaptic = React.useRef(false);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-15, 15]) // Only vertical? No. Wait.
        // WardrobeScreen logic: activeOffsetX([-15, 15]) means FAIL if it moves less than 15?
        // Actually: "Range of touch movement in the X position where the handler should be ACTIVE".
        // If array: [min, max]. If X < min or X > max, it activates? No.
        // Documentation: `activeOffsetX` defines the window where it REMAINS in `began` state?
        // Let's copy WardrobeScreen EXACTLY: activeOffsetX([-15, 15]) and failOffsetY([-10, 10]).
        // This implies: "Activate if X moves > 15px, but Fail if Y moves > 10px".
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])
        .onStart(() => {
            hasTriggeredHaptic.current = false;
        })
        .onUpdate((event) => {
            const threshold = 50;
            if (!hasTriggeredHaptic.current && Math.abs(event.translationX) > threshold) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                hasTriggeredHaptic.current = true;
            }
        })
        .onEnd((event) => {
            const threshold = 50;
            const velocityThreshold = 500;

            if (event.translationX < -threshold || event.velocityX < -velocityThreshold) {
                // Swiped left -> Next tab
                runOnJS(handleSwipe)(1);
            } else if (event.translationX > threshold || event.velocityX > velocityThreshold) {
                // Swiped right -> Prev tab
                runOnJS(handleSwipe)(-1);
            }
        });

    const handleSave = async () => {
        if (filledItems.length < 2) {
            log('Save blocked: Need at least 2 items');
            return;
        }

        log('Navigating to Styling Canvas...');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to styling canvas (DraftStore active)
        navigation.navigate('StylingCanvas' as never);
    };

    // Dynamic Bento Logic
    const getSlotStyle = (index: number, total: number) => {
        const gap = 10;
        // Adjusted widths to account for side bar (Score)
        // Canvas takes ~85% width, Score takes ~15%
        // but this style is relative to the Grid container, so percentages are fine

        const fullW = '100%';
        const halfW = '48%';
        const thirdW = '31%';

        // 2 Items: Side by Side
        if (total === 2) {
            return { width: halfW, height: '100%' };
        }

        // 3 Items: 1 Top, 2 Bottom
        if (total === 3) {
            if (index === 0) return { width: fullW, height: '55%' };
            return { width: halfW, height: '42%' }; // Bottom 2
        }

        // 4 Items: Grid 2x2
        if (total === 4) {
            return { width: halfW, height: '48%' };
        }

        // 5 Items: 2 Top, 3 Bottom
        if (total === 5) {
            if (index < 2) return { width: halfW, height: '55%' };
            return { width: thirdW, height: '42%' };
        }

        // 6 Items: 3x2 Grid
        if (total === 6) {
            return { width: thirdW, height: '48%' };
        }

        // 7 Items: 1 Top, 3 Middle, 3 Bottom
        if (total === 7) {
            if (index === 0) return { width: fullW, height: '40%' };
            return { width: thirdW, height: '28%' };
        }

        return { width: halfW, height: '48%' }; // Fallback
    };

    // Combined Canvas + Vertical Score Bar
    const renderCanvasArea = () => {
        // Normalize score 0-1 range for slider position
        // Assuming max score is ~120
        const normalizedScore = Math.min(score, 120) / 120;
        // Invert for UI (Bottom is 0, Top is 1) -> Actually standard view is Top 0.
        // We want 0 at bottom. So top position = (1 - normalized) * height

        return (
            <View style={[styles.canvasContainer, { paddingTop: insets.top + 40, height: height * 0.45 }]}>
                {/* Left Side: Bento Grid */}
                <View style={styles.canvasGridWrapper}>
                    <View style={[styles.canvasGrid, { justifyContent: totalSlots === 2 ? 'center' : 'flex-start' }]}>
                        {selectedItems.map((item, index) => {
                            const style = getSlotStyle(index, totalSlots);
                            if (item) console.log(`[BentoGrid] Slot ${index}:`, item.imageUri);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.canvasSlot,
                                        activeSlot === index && styles.activeSlot,
                                        item ? styles.filledSlot : styles.emptySlotState,
                                        { width: style.width as any, height: style.height as any }
                                    ]}
                                    onPress={() => setActiveSlot(index)}
                                >
                                    {item ? (
                                        <>
                                            <Image
                                                source={item.imageUri && typeof item.imageUri === 'string' ? { uri: item.imageUri } : item.imageUri}
                                                style={styles.slotImage}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                            />
                                            {/* Remove Button */}
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => handleRemoveItem(index)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons name="close" size={14} color="#FFF" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <Text style={styles.plusText}>+</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Occasion Overlay */}
                    <TouchableOpacity style={styles.occasionPill}>
                        <Text style={styles.occasionText}>{occasion.toUpperCase()}</Text>
                    </TouchableOpacity>

                </View>

                {/* Right Side: Vertical Score Bar */}
                <View style={styles.scoreBarWrapper}>
                    <Text style={styles.emojiIcon}>😁</Text>
                    <View style={styles.scoreTrack}>
                        <LinearGradient
                            colors={['#4CD964', '#FFCC00', '#FF3B30']} // Green (Top) -> Orange -> Red (Bottom)
                            style={styles.scoreGradient}
                        />
                        {/* Indicator */}
                        <Animated.View
                            style={[
                                styles.scoreIndicator,
                                {
                                    bottom: `${normalizedScore * 100}%`,
                                    // Clamp to keep inside track
                                    marginBottom: -8 // center dot
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.emojiIcon}>😟</Text>
                </View>
            </View>
        );
    };

    // Render Picker
    const ITEM_WIDTH = (width - 40) / 2.1; // Approx half width minus gaps
    const ITEM_HEIGHT = ITEM_WIDTH * 1.25;

    const renderPicker = () => (
        <View style={styles.pickerContainer}>
            {/* Tabs Header */}
            <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>WARDROBE</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 20 }}
                >
                    {CATEGORIES.map(cat => (
                        <CategoryTab
                            key={cat}
                            category={cat}
                            isActive={activeTab === cat}
                            onPress={() => {
                                setActiveTab(cat);
                                Haptics.selectionAsync();
                            }}
                        />
                    ))}
                </ScrollView>
            </View>

            <FlatList
                onLayout={(e) => log(`FlatList Layout: ${e.nativeEvent.layout.height}px height`)}
                data={filteredPieces}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    return (
                        <View style={{ margin: 5, width: ITEM_WIDTH }}>
                            <WardrobeItemCard
                                item={{
                                    id: item.id,
                                    name: item.name || 'Untitled',
                                    category: item.category.toUpperCase(),
                                    imageUri: item.imageUri,
                                    color: item.color,
                                    brand: item.brand,
                                    wornCount: item.wearHistory?.length || 0
                                }}
                                onPress={() => handleSelectItem(item)}
                                width={ITEM_WIDTH}
                                height={ITEM_HEIGHT}
                            />
                        </View>
                    )
                }}
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
                style={{ height: height * 0.40 }} // Adjusted for better fit
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 14 }}>
                            {pieces.length === 0 ? "Loading Wardrobe..." : `No items in ${activeTab}`}
                        </Text>
                    </View>
                }
            />
        </View>
    );

    const renderBottomFooter = () => (
        <View style={[styles.bottomFooter, { paddingBottom: insets.bottom + 10, height: 80 + insets.bottom }]}>
            {/* Left: CANCEL */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.footerBtn}>
                <Text style={styles.footerBtnText}>Cancel</Text>
            </TouchableOpacity>

            {/* Center: GRID CONTROLS */}
            <View style={styles.footerCenterControls}>
                <TouchableOpacity
                    onPress={() => handleSlotChange(-1)}
                    style={[styles.footerSizeBtn, totalSlots <= 2 && styles.sizeBtnDisabled]}
                    disabled={totalSlots <= 2}
                >
                    <Text style={styles.sizeBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.sizeLabel, { marginHorizontal: 15 }]}>{totalSlots}</Text>
                <TouchableOpacity
                    onPress={() => handleSlotChange(1)}
                    style={[styles.footerSizeBtn, totalSlots >= 7 && styles.sizeBtnDisabled]}
                    disabled={totalSlots >= 7}
                >
                    <Text style={styles.sizeBtnText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Right: DONE */}
            <TouchableOpacity onPress={handleSave} style={styles.footerBtn}>
                <Text style={[styles.footerBtnText, { color: COLORS.ELECTRIC_BLUE }]}>Done</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                <StatusBar hidden={true} />

                {/* Top area - clear for canvas */}
                {renderCanvasArea()}
                {renderPicker()}
                {renderBottomFooter()}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.RITUAL_BLACK,
        // No top padding here, Header handles it
    },

    // Bottom Footer
    bottomFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F0F0F', // Darker to contrast
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 200,
    },
    footerBtn: {
        padding: 8,
    },
    footerBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerCenterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    footerSizeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Main Content Area
    canvasContainer: {
        height: height * 0.55,
        flexDirection: 'row',
        paddingTop: 50, // Fallback, overridden by style prop if dynamic? No, we need to pass insets
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    canvasGridWrapper: {
        flex: 1, // Takes remaining width
        position: 'relative',
        marginRight: 16,
    },
    canvasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: '100%',
        gap: 8,
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    // Vertical Score Bar
    scoreBarWrapper: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    scoreTrack: {
        flex: 1,
        width: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        marginVertical: 8,
        position: 'relative',
        overflow: 'visible', // Allow indicator to hang out? No, keep it clean
    },
    scoreGradient: {
        flex: 1,
        borderRadius: 3,
    },
    scoreIndicator: {
        position: 'absolute',
        left: -5, // (16 width - 6 track) / 2 = 5 roughly
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    emojiIcon: {
        fontSize: 20,
    },


    sizeBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBtnDisabled: {
        opacity: 0.3,
    },
    sizeBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginTop: -2,
    },
    sizeLabel: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        marginHorizontal: 8,
        minWidth: 10,
        textAlign: 'center',
    },

    canvasSlot: {
        // Dimensions controlled dynamically
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeSlot: {
        borderColor: COLORS.ELECTRIC_BLUE,
        borderWidth: 2,
    },
    filledSlot: {
        backgroundColor: 'transparent',
    },
    emptySlotState: {
        borderStyle: 'dashed',
    },
    slotImage: {
        width: '100%',
        height: '100%',
    },
    plusText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 32,
        fontWeight: '300',
    },
    occasionPill: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    occasionText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    // Picker
    pickerContainer: {
        flex: 1, // Take remaining space
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        minHeight: 200, // Enforce visibility
    },
    pickerHeader: {
        marginBottom: 10,
    },
    pickerTitle: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginLeft: 20,
        marginBottom: 8,
    },
    tabsContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 20,
    },
    tab: {
        paddingVertical: 8,
        marginRight: 10,
    },
    tabText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        opacity: 0.5,
        letterSpacing: 1,
    },
    activeTabText: {
        color: COLORS.RITUAL_WHITE,
        opacity: 1,
    },
    activeIndicatorContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        marginBottom: 4,
    },
    activeUnderline: {
        width: '100%',
        height: 2,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        borderRadius: 1,
    },
    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});
