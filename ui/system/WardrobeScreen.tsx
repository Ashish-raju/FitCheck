import React, { useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { Piece } from '../../truth/types';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { WardrobeDetailModal } from './WardrobeDetailModal';
import { Image } from 'expo-image';
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const GUTTER = 20;
const GAP = 20; // Increased spacing (Uniform with Gutter)
const ITEM_SIZE = (width - (GUTTER * 2) - GAP) / 2;
// const ITEM_SIZE = (width - GUTTER * 3) / 2; // Old logic

// Categories
const CATEGORIES = ['All', 'Top', 'Bottom', 'Shoes', 'Outerwear'] as const;

// Memoized Category Tab
const CategoryTab = memo(({
    category,
    isActive,
    onPress
}: {
    category: string;
    isActive: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        onPress={onPress}
        style={styles.tab}
        activeOpacity={0.7}
    >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {category.toUpperCase()}
        </Text>
        {isActive && (
            <View style={styles.activeIndicatorContainer}>
                <View style={styles.activeDot} />
                <View style={styles.activeUnderline} />
            </View>
        )}
    </TouchableOpacity>
));

// Item card logic migrated to WardrobeItemCard component

// Stat Card Component
const StatCard = memo(({ label, value }: { label: string, value: string | number }) => (
    <View style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
));

// Empty State Component
const EmptyState = memo(({ category, onAdd }: { category: string; onAdd: () => void }) => (
    <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>
            {category === 'All' ? 'Your collection is empty' : `No ${category.toLowerCase()} yet`}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Text style={styles.emptyButtonText}>+ Add Item</Text>
        </TouchableOpacity>
    </View>
));

export const WardrobeScreen: React.FC = () => {
    const { activeWardrobeTab } = useRitualState();
    const [selectedPiece, setSelectedPiece] = React.useState<Piece | null>(null);
    const [isLoading, setIsLoading] = React.useState(true); // Start true to prevent empty flash

    const store = InventoryStore.getInstance();
    const [inventoryData, setInventoryData] = React.useState(store.getInventory());

    React.useEffect(() => {
        // Seed if inventory is small (< 50 items)
        const init = async () => {
            const currentSize = Object.keys(store.getInventory().pieces).length;
            console.log('[WardrobeScreen] Current inventory size:', currentSize);
            if (currentSize < 50) {
                console.log('[WardrobeScreen] Seeding mock data...');
                await store.seedMockData();
                setInventoryData({ ...store.getInventory() });
                console.log('[WardrobeScreen] Seeding complete, inventory size:', Object.keys(store.getInventory().pieces).length);
            }
            setIsLoading(false); // Done loading
        };
        init();
    }, []);

    // Filtered pieces
    const pieces = useMemo(() => {
        return Object.values(inventoryData.pieces)
            .filter(p => p.status !== 'Ghost')
            .filter(p => activeWardrobeTab === 'All' || p.category === activeWardrobeTab)
            .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
    }, [inventoryData, activeWardrobeTab]);

    // Stats
    const stats = useMemo(() => {
        const totalItems = Object.values(inventoryData.pieces).filter(p => p.status !== 'Ghost').length;
        // Mocking estimated value for now as it's not in the store, 
        // using count * 120 as a placeholder or just a static value as per reference vibe if preferred
        const estValue = `$${(totalItems * 124.50).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        return { totalItems, estValue };
    }, [inventoryData]);

    // Handlers
    const refreshInventory = useCallback(() => {
        setInventoryData({ ...store.getInventory() });
    }, [store]);

    // Refresh on focus
    useFocusEffect(
        React.useCallback(() => {
            refreshInventory();
        }, [refreshInventory])
    );

    const handleTabPress = useCallback((tab: string) => {
        Haptics.selectionAsync();
        ritualMachine.setWardrobeTab(tab);
    }, []);

    const handlePress = useCallback((piece: Piece) => {
        setSelectedPiece(piece);
    }, []);

    const handleFavorite = useCallback(async (piece: Piece) => {
        await store.toggleFavorite(piece.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSelectedPiece(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        refreshInventory();
    }, [store, refreshInventory]);

    const handleDelete = useCallback(async (piece: Piece) => {
        await store.deletePiece(piece.id);
        setSelectedPiece(null);
        refreshInventory();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [store, refreshInventory]);

    const handleAddItem = useCallback(() => {
        ritualMachine.toCamera();
    }, []);

    // Render Header
    const renderHeader = useCallback(() => (
        <View style={styles.header}>
            <View style={styles.titleSection}>
                <Text style={styles.vaultLabel}>STYLE VAULT</Text>
                <Text style={styles.title}>Your Collection.</Text>
            </View>

            <View style={styles.statsRow}>
                <StatCard label="TOTAL ITEMS" value={stats.totalItems} />
                <StatCard label="EST. VALUE" value={stats.estValue} />
            </View>

            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {CATEGORIES.map(category => (
                        <CategoryTab
                            key={category}
                            category={category}
                            isActive={activeWardrobeTab === category}
                            onPress={() => handleTabPress(category)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    ), [activeWardrobeTab, handleTabPress, stats]);

    // Swipe Logic
    const handleSwipe = useCallback((direction: number) => {
        // Cast to any to avoid strict literal type mismatch if RitualState has extra categories
        const currentIndex = CATEGORIES.indexOf(activeWardrobeTab as any);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + direction;

        // Clamp index
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= CATEGORIES.length) nextIndex = CATEGORIES.length - 1;

        if (nextIndex !== currentIndex) {
            handleTabPress(CATEGORIES[nextIndex]);
        }
    }, [activeWardrobeTab, handleTabPress]);

    const swipeLeft = Gesture.Fling()
        .direction(Directions.LEFT)
        .onEnd(() => {
            runOnJS(handleSwipe)(1);
        });

    const swipeRight = Gesture.Fling()
        .direction(Directions.RIGHT)
        .onEnd(() => {
            runOnJS(handleSwipe)(-1);
        });

    const composedGesture = Gesture.Simultaneous(swipeLeft, swipeRight);

    // Render item
    const ITEM_HEIGHT = ITEM_SIZE / 0.92;
    const renderItem = useCallback(({ item }: { item: Piece }) => (
        <WardrobeItemCard
            item={{
                id: item.id,
                name: item.name || `${item.color || ''} ${item.category}`.trim() || 'Untitled Piece',
                category: item.category.toUpperCase(),
                imageUri: item.imageUri,
                color: item.color,
                brand: item.brand,
                wornCount: item.wearHistory?.length || 0
            }}
            onPress={() => handlePress(item)}
            width={ITEM_SIZE}
            height={ITEM_HEIGHT}
        />
    ), [handlePress]);

    return (
        <GestureDetector gesture={composedGesture}>
            <View style={styles.container}>
                <FlashList
                    data={pieces}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    // @ts-ignore - estimatedItemSize is a valid prop for FlashList
                    estimatedItemSize={(ITEM_SIZE / 0.92) + 20}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    ListEmptyComponent={<EmptyState category={activeWardrobeTab} onAdd={handleAddItem} />}
                />

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleAddItem}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                {/* Detail Modal */}
                <WardrobeDetailModal
                    visible={!!selectedPiece}
                    piece={selectedPiece}
                    onClose={() => setSelectedPiece(null)}
                    onDelete={handleDelete}
                    onFavorite={handleFavorite}
                    onEdit={() => { }}
                />

                {/* Bulk Action Sheet */}
                {/* Bulk Action Sheet - TODO: Implement Selection Mode
                {isSelectionMode && (
                    <BulkActionSheet
                        count={selectedIds.length}
                        onClear={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                        onDelete={handleBulkDelete}
                        onArchive={handleBulkArchive}
                    />
                )}
                */}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    listContent: {
        paddingHorizontal: GUTTER,
        paddingBottom: 120,
    },
    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 10,
    },
    titleSection: {
        marginBottom: 24,
    },
    vaultLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 2,
        marginBottom: 4,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.RITUAL_WHITE,
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 1,
        marginBottom: 2,
    },
    statValue: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.RITUAL_WHITE,
    },
    // Tabs
    tabsWrapper: {
        marginHorizontal: -GUTTER,
        marginBottom: 24,
    },
    tabsContainer: {
        paddingHorizontal: GUTTER,
        flexDirection: 'row',
        gap: 24,
    },
    tab: {
        paddingVertical: 8,
        position: 'relative',
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
        bottom: -4,
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
    // Item Cards
    cardContainer: {
        width: ITEM_SIZE,
        marginBottom: 24,
        marginRight: GUTTER,
    },
    itemCardLuxury: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: 24,
        padding: 0,
        backgroundColor: 'transparent', // Let GlassCard handle background
    },
    cardShine: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
    },
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    itemImage: {
        width: '90%',
        height: '90%',
    },
    colorPlaceholder: {
        width: '80%',
        height: '80%',
        borderRadius: 12,
        opacity: 0.6,
    },
    itemInfo: {
        marginTop: 10,
        paddingHorizontal: 4,
    },
    itemCategory: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 1,
        marginBottom: 4,
        textAlign: 'center',
    },
    itemName: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.RITUAL_WHITE,
        textAlign: 'center',
    },
    selectionIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 110, // Positioned above the 85px PersistentNav
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.ELECTRIC_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
        zIndex: 1000, // Ensure it's above screen content
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
        marginTop: -3,
    },
    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.ASH_GRAY,
        marginBottom: 20,
        textAlign: 'center',
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    emptyButtonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.RITUAL_WHITE,
    },
});

