import React, { useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { Piece } from '../../truth/types';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { WardrobeRepo, CategorySummary } from '../../data/repos';
import { FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';
import { useAuth } from '../../context/auth/AuthProvider';
import { WardrobeDetailModal } from './WardrobeDetailModal';
import { Image } from 'expo-image';
import { WardrobeItemCard } from '../components/WardrobeItemCard';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, FadeIn, FadeOut, SlideInRight, SlideInLeft, Easing } from 'react-native-reanimated';
import { t } from '../../src/copy';

const { width } = Dimensions.get('window');
const GUTTER = 20;
const GAP = 20; // Increased spacing (Uniform with Gutter)
const ITEM_SIZE = (width - (GUTTER * 2) - GAP) / 2;
// const ITEM_SIZE = (width - GUTTER * 3) / 2; // Old logic

// Categories will be loaded dynamically from wardrobe data

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
const StatCard = ({ label, value }: { label: string, value: string | number | React.ReactNode }) => (
    <View style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        {typeof value === 'string' || typeof value === 'number' ? (
            <Text style={styles.statValue}>{value}</Text>
        ) : (
            value
        )}
    </View>
);

// Empty State Component
const EmptyState = memo(({ category, onAdd }: { category: string; onAdd: () => void }) => (
    <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>
            {category === 'All' ? t('wardrobe.empty.default') : t('wardrobe.empty.category', { category: category.toLowerCase() })}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
            <Text style={styles.emptyButtonText}>{t('wardrobe.addButton')}</Text>
        </TouchableOpacity>
    </View>
));

export const WardrobeScreen: React.FC = () => {
    const { activeWardrobeTab } = useRitualState();
    const [selectedPiece, setSelectedPiece] = React.useState<Piece | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [pieces, setPieces] = React.useState<Piece[]>([]);
    const [categories, setCategories] = React.useState<CategorySummary[]>([]);

    // Animation State
    const [direction, setDirection] = React.useState<'left' | 'right'>('right');
    const prevTabRef = React.useRef(activeWardrobeTab);

    // Get current user ID via Auth Context (supports Demo users)
    const { user } = useAuth();
    const userId = user?.uid || 'guest';

    // Load wardrobe data from WardrobeRepo
    const loadWardrobe = useCallback(async () => {
        setIsLoading(true);
        try {
            const [garments, cats] = await Promise.all([
                WardrobeRepo.listGarments(userId, {
                    category: activeWardrobeTab !== 'All' && activeWardrobeTab !== 'Favourites' ? activeWardrobeTab : undefined,
                    isFavorite: activeWardrobeTab === 'Favourites' ? true : undefined
                }),
                WardrobeRepo.getCategories(userId)
            ]);
            setPieces(garments);
            setCategories(cats);
            if (garments.length > 0) {
                console.log('[WardrobeScreen] Loaded pieces. Sample:', {
                    id: garments[0].id,
                    imageUri: garments[0].imageUri,
                    uriType: typeof garments[0].imageUri
                });
            }
        } catch (error) {
            console.error('[WardrobeScreen] Failed to load wardrobe:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, activeWardrobeTab]);

    React.useEffect(() => {
        loadWardrobe();
    }, [loadWardrobe]);

    // Pieces are already filtered by loadWardrobe via WardrobeRepo

    // Stats computed from categories and pieces
    const stats = useMemo(() => {
        const totalItems = categories.find(c => c.category === 'All')?.count || 0;
        const currentCount = categories.find(c => c.category === activeWardrobeTab)?.count || pieces.length;

        // Compute estimated value from actual garment data (if available)
        const estValue = pieces.reduce((sum, g: any) => sum + (g.estimatedValue || 0), 0);
        const estValueStr = estValue > 0
            ? `$${estValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            : '—'; // Show dash if no values available

        console.log(`[WardrobeScreen] Stats: ${currentCount}/${totalItems} (Tab: ${activeWardrobeTab})`);

        return { totalItems, currentCount, estValue: estValueStr };
    }, [categories, pieces, activeWardrobeTab]);

    // Handlers
    const refreshInventory = useCallback(() => {
        loadWardrobe();
    }, [loadWardrobe]);

    // Pull-to-refresh handler
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadWardrobe();
        setRefreshing(false);
    }, [loadWardrobe]);

    // Refresh on focus
    useFocusEffect(
        React.useCallback(() => {
            refreshInventory();
        }, [refreshInventory])
    );

    const handleTabPress = useCallback((tab: string) => {
        const categoryNames = categories.map(c => c.category);
        const oldIndex = categoryNames.indexOf(activeWardrobeTab);
        const newIndex = categoryNames.indexOf(tab);
        setDirection(newIndex > oldIndex ? 'right' : 'left');

        Haptics.selectionAsync();
        ritualMachine.setWardrobeTab(tab);
    }, [activeWardrobeTab, categories]);

    const handlePress = useCallback((piece: Piece) => {
        setSelectedPiece(piece);
    }, []);

    const handleFavorite = useCallback(async (piece: Piece) => {
        // Optimistic Update: Update UI immediately
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update local state right away
        setSelectedPiece(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);

        // Update via WardrobeRepo in background
        try {
            await WardrobeRepo.toggleFavorite(userId, piece.id);
        } catch (error) {
            // Rollback on error
            setSelectedPiece(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
            console.error('[WardrobeScreen] Failed to toggle favorite:', error);
        }

        // Refresh after short delay
        setTimeout(refreshInventory, 100);
    }, [userId, refreshInventory]);

    const handleDelete = useCallback(async (piece: Piece) => {
        // Optimistic Delete: Close modal and remove from UI immediately
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // 1. Close Modal Immediately
        setSelectedPiece(null);

        // 2. Delete via WardrobeRepo
        try {
            await WardrobeRepo.deleteGarment(userId, piece.id);
        } catch (error) {
            console.error('[WardrobeScreen] Failed to delete garment:', error);
        }

        // 3. Refresh List
        refreshInventory();
    }, [userId, refreshInventory]);

    const handleNextPiece = useCallback(() => {
        if (!selectedPiece || pieces.length <= 1) return;
        const currentIndex = pieces.findIndex(p => p.id === selectedPiece.id);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % pieces.length;
        setSelectedPiece(pieces[nextIndex]);
    }, [pieces, selectedPiece]);

    const handlePreviousPiece = useCallback(() => {
        if (!selectedPiece || pieces.length <= 1) return;
        const currentIndex = pieces.findIndex(p => p.id === selectedPiece.id);
        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + pieces.length) % pieces.length;
        setSelectedPiece(pieces[prevIndex]);
    }, [pieces, selectedPiece]);

    const handleAddItem = useCallback(() => {
        ritualMachine.toCamera();
    }, []);

    // Render Header
    const renderHeader = useCallback(() => (
        <View style={styles.header}>
            <View style={styles.titleSection}>
                <Text style={styles.vaultLabel}>{t('wardrobe.title')}</Text>
                <Text style={styles.title}>{t('wardrobe.subtitle')}</Text>
            </View>

            <View style={styles.statsRow}>
                <StatCard
                    label={t('wardrobe.totalItems')}
                    value={
                        activeWardrobeTab === 'All' ? (
                            stats.totalItems.toString()
                        ) : (
                            <Text style={styles.statValue}>
                                {stats.currentCount.toString().padStart(3, '0')}
                                <Text style={{ fontSize: 16 }}>/</Text>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 16 }}>
                                    {stats.totalItems.toString()}
                                </Text>
                            </Text>
                        )
                    }
                />
                <StatCard label={t('wardrobe.estValue')} value={stats.estValue} />
            </View>

            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {categories.map(cat => (
                        <CategoryTab
                            key={cat.category}
                            category={`${cat.category} (${cat.count})`}
                            isActive={activeWardrobeTab === cat.category}
                            onPress={() => handleTabPress(cat.category)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    ), [activeWardrobeTab, handleTabPress, stats]);

    // Swipe Logic
    const handleSwipe = useCallback((direction: number) => {
        const categoryNames = categories.map(c => c.category);
        const currentIndex = categoryNames.indexOf(activeWardrobeTab);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + direction;

        // Clamp index
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= categoryNames.length) nextIndex = categoryNames.length - 1;

        if (nextIndex !== currentIndex) {
            handleTabPress(categoryNames[nextIndex]);
        }
    }, [activeWardrobeTab, handleTabPress, categories]);

    // Track if we've already triggered haptic for this gesture
    const hasTriggeredHaptic = React.useRef(false);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-15, 15]) // Horizontal threshold - only activate when swiping horizontally
        .failOffsetY([-10, 10]) // Fail if vertical movement is too large
        .onStart(() => {
            hasTriggeredHaptic.current = false;
        })
        .onUpdate((event) => {
            // Trigger haptic feedback when user swipes far enough
            const threshold = 50;
            if (!hasTriggeredHaptic.current && Math.abs(event.translationX) > threshold) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                hasTriggeredHaptic.current = true;
            }
        })
        .onEnd((event) => {
            // Determine swipe direction based on velocity and translation
            const threshold = 50;
            const velocityThreshold = 500;

            if (event.translationX < -threshold || event.velocityX < -velocityThreshold) {
                // Swiped left -> go to next tab (right direction)
                runOnJS(handleSwipe)(1);
            } else if (event.translationX > threshold || event.velocityX > velocityThreshold) {
                // Swiped right -> go to previous tab (left direction)
                runOnJS(handleSwipe)(-1);
            }
        });

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
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                {renderHeader()}
                <Animated.View
                    entering={FadeIn.duration(150)}
                    style={{ flex: 1 }}
                >
                    <FlashList
                        data={pieces}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        renderItem={renderItem}
                        // @ts-ignore - estimatedItemSize is a valid prop for FlashList
                        estimatedItemSize={(ITEM_SIZE / 0.92) + 20}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        ListEmptyComponent={<EmptyState category={activeWardrobeTab} onAdd={handleAddItem} />}
                        // Performance optimizations
                        drawDistance={width}
                        // Pull-to-refresh
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={COLORS.ELECTRIC_BLUE}
                                colors={[COLORS.ELECTRIC_BLUE]}
                            />
                        }
                    />
                </Animated.View>

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
                    onNext={handleNextPiece}
                    onPrevious={handlePreviousPiece}
                    onDelete={handleDelete}
                    onFavorite={handleFavorite}
                    onEdit={() => { }}
                />
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

