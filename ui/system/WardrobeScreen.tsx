import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { MOTION } from '../tokens/motion.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { InventoryStore } from '../../state/inventory/inventoryStore';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';
import { LuxuryCard } from '../primitives/LuxuryCard';
import { FloatingFAB } from '../primitives/FloatingFAB';
import { WardrobeDetailModal } from './WardrobeDetailModal';
import { BulkActionSheet } from './BulkActionSheet';
import { Piece } from '../../truth/types';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { FlashList } from '@shopify/flash-list';
import { SmartImage } from '../primitives/SmartImage';
import { GarmentIngestionService } from '../../system/ingestion/GarmentIngestionService';

export const WardrobeScreen: React.FC = () => {
    const { activeWardrobeTab } = useRitualState();
    const [selectedPiece, setSelectedPiece] = React.useState<Piece | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]); // For Bulk Action
    const [isSelectionMode, setIsSelectionMode] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);

    const store = InventoryStore.getInstance();
    const [inventoryData, setInventoryData] = React.useState(store.getInventory());

    // Derived State
    const allPieces: Piece[] = Object.values(inventoryData.pieces);
    const pieces = React.useMemo(() => {
        return allPieces
            .filter(p => p.status !== 'Ghost')
            .filter(p => activeWardrobeTab === 'All' || p.category === activeWardrobeTab)
            .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0)); // Newest first
    }, [inventoryData, activeWardrobeTab]);

    const mostWorn = store.getMostWorn(5);
    const clusters = store.getStyleClusters();

    const tabs: any[] = ['All', 'Top', 'Bottom', 'Shoes', 'Outerwear'];

    // HELPERS
    const refreshInventory = () => {
        setInventoryData({ ...store.getInventory() });
    };

    // ACTIONS
    const handleLongPress = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsSelectionMode(true);
        toggleSelection(id);
    };

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
            if (selectedIds.length === 1 && isSelectionMode) {
                setIsSelectionMode(false); // Exit mode if last one deselected
            }
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
        Haptics.selectionAsync();
    };

    const handlePress = (piece: Piece) => {
        if (isSelectionMode) {
            toggleSelection(piece.id);
        } else {
            setSelectedPiece(piece);
        }
    };

    const handleFavorite = async (piece: Piece) => {
        await store.toggleFavorite(piece.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update local selected piece to reflect change immediately in Modal
        setSelectedPiece(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        refreshInventory();
    };

    const handleDelete = async (piece: Piece) => {
        await store.deletePiece(piece.id);
        setSelectedPiece(null);
        refreshInventory();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleBulkDelete = async () => {
        for (const id of selectedIds) {
            await store.deletePiece(id as any);
        }
        setIsSelectionMode(false);
        setSelectedIds([]);
        refreshInventory();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleBulkArchive = async () => {
        for (const id of selectedIds) {
            await store.archivePiece(id as any);
        }
        setIsSelectionMode(false);
        setSelectedIds([]);
        refreshInventory();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // RENDERERS
    const renderHeader = () => (
        <View>
            <RitualHeader subtitle="Style Vault" title="Collection." />

            {/* INSIGHT STRIP - REFINED */}
            <View style={styles.insightStrip}>
                <LuxuryCard style={styles.insightCard} activeScale={0.98}>
                    <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>TOTAL ITEMS</Text>
                        <Text style={styles.insightValue}>{pieces.length}</Text>
                    </View>
                </LuxuryCard>
                <LuxuryCard style={styles.insightCard} activeScale={0.98}>
                    <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>EST. VALUE</Text>
                        <Text style={styles.insightValue}>$4.2k</Text>
                    </View>
                </LuxuryCard>
            </View>

            {/* INSIGHTS / SMART ORG (Only show when 'All' tab is active) */}
            {activeWardrobeTab === 'All' && !isSelectionMode && (
                <View style={styles.smartSection}>
                    <Text style={styles.sectionTitle}>MOST WORN</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {mostWorn.map((p) => (
                            <LuxuryCard
                                key={p.id}
                                style={styles.microCard}
                                onPress={() => handlePress(p)}
                            >
                                {p.imageUri && <SmartImage source={{ uri: p.imageUri }} style={styles.microImage} />}
                            </LuxuryCard>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* TABS */}
            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {tabs.map(tab => {
                        const isActive = activeWardrobeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => { Haptics.selectionAsync(); ritualMachine.setWardrobeTab(tab); }}
                                style={[styles.tab, isActive && styles.activeTab]}
                            >
                                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.toUpperCase()}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );

    const renderItem = React.useCallback(({ item, index }: { item: Piece; index: number }) => (
        <Animated.View
            layout={LinearTransition.springify()}
            entering={FadeIn.delay(index * 50)}
            style={styles.gridItemWrapper}
        >
            <LuxuryCard
                style={styles.itemCard}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item.id)}
                selected={selectedIds.includes(item.id)}
            >
                <View style={styles.imageContainer}>
                    {item.imageUri ? (
                        <SmartImage source={{ uri: item.imageUri }} style={styles.garmentImage} />
                    ) : (
                        <View style={[styles.colorBlock, { backgroundColor: item.color }]} />
                    )}
                    <View style={styles.metaOverlay}>
                        <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
                    </View>
                </View>
            </LuxuryCard>
        </Animated.View>
    ), [selectedIds, isSelectionMode]);

    return (
        <View style={styles.container}>
            <FlashList
                contentContainerStyle={styles.gridContainer}
                data={pieces}
                keyExtractor={item => item.id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                estimatedItemSize={220}
                renderItem={renderItem}
                extraData={selectedIds} // Ensure re-render on selection change
            />

            {/* FLOATING ACTION BUTTON */}
            {!isSelectionMode && (
                <FloatingFAB
                    onPress={() => ritualMachine.toCamera()}
                    icon="+"
                />
            )}

            {/* DETAIL MODAL */}
            <WardrobeDetailModal
                visible={!!selectedPiece}
                piece={selectedPiece}
                onClose={() => setSelectedPiece(null)}
                onDelete={handleDelete}
                onFavorite={handleFavorite}
                onEdit={() => { /* TODO: Edit */ }}
            />

            {/* BULK ACTION SHEET */}
            {isSelectionMode && (
                <BulkActionSheet
                    count={selectedIds.length}
                    onClear={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                    onDelete={handleBulkDelete}
                    onArchive={handleBulkArchive}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: COLORS.ABYSSAL_BLUE, // TRANSPARENT FOR GLOBAL BG
        paddingHorizontal: SPACING.GUTTER,
    },
    gridContainer: {
        paddingTop: SPACING.STACK.NORMAL,
        paddingBottom: 120, // Space for FAB
    },
    gridItemWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    itemCard: {
        height: 220,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
    },
    garmentImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    colorBlock: {
        flex: 1,
        opacity: 0.8,
    },
    metaOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    categoryLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // INSIGHTS
    insightStrip: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.STACK.LARGE,
        height: 72, // Reduced from 100, but taller than original 60 to fix clipping
    },
    insightCard: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    insightContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2, // Tighter gap
        paddingVertical: 4,
    },
    insightLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 9, // Slightly smaller
        letterSpacing: 2,
        fontWeight: 'bold',
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    insightValue: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 20, // Reduced from 24
        fontWeight: '300',
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        lineHeight: 24, // Explicit line height to prevent clipping
    },
    // Smart Section
    smartSection: {
        marginBottom: SPACING.STACK.LARGE,
    },
    sectionTitle: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        letterSpacing: 1.5,
        marginBottom: SPACING.STACK.TIGHT,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    horizontalScroll: {
        flexDirection: 'row',
        gap: 12,
        paddingRight: 20
    },
    microCard: {
        width: 80,
        height: 80,
    },
    microImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    // Tabs
    filterSection: {
        marginBottom: SPACING.STACK.LARGE,
    },
    tabsScroll: {
        gap: 20,
    },
    tab: {
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.ELECTRIC_COBALT,
    },
    tabText: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.4,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeTabText: {
        opacity: 1,
        color: COLORS.RITUAL_WHITE,
    }
});
