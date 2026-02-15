import React, { useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { OutfitsRepo, Outfit } from '../../data/repos';
import { OutfitDraftStore } from '../../state/outfits/OutfitDraftStore';
import { OutfitStore } from '../../state/outfits/OutfitStore';
import { FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';
import { OutfitCard } from './components/OutfitCard';

// Navigation Hook Placeholder (Replace with actual if needed)
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const GUTTER = 20;
const GAP = 16;
const CARD_WIDTH = (width - (GUTTER * 2) - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Tabs will be loaded dynamically from user's outfits

export const OutfitsHomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [tabs, setTabs] = useState<string[]>(['All', 'Favorites']);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Get current user ID
    const userId = FIREBASE_AUTH.currentUser?.uid || 'guest';

    const loadOutfits = useCallback(async () => {
        setIsLoading(true);
        try {
            // Refresh Store (Load all outfits)
            await OutfitStore.getInstance().refresh();

            // Get all outfits from Store
            let allOutfits = OutfitStore.getInstance().getOutfits();

            // Filter
            if (activeTab === 'Favorites') {
                allOutfits = allOutfits.filter(o => o.isFavorite);
            } else if (activeTab !== 'All') {
                allOutfits = allOutfits.filter(o => o.occasion === activeTab);
            }

            // Load dynamic occasions
            // const occasions = await OutfitsRepo.getOccasions(userId);
            // setTabs(['All', 'Favorites', ...occasions]);
            setTabs(['All', 'Favorites', 'Work', 'Casual', 'Date', 'Event']); // Static fallback

            setOutfits(allOutfits);
        } catch (error) {
            console.error('[OutfitsHomeScreen] Failed to load outfits:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId, activeTab]);

    useFocusEffect(
        useCallback(() => {
            loadOutfits();
        }, [loadOutfits])
    );

    // Pull-to-refresh handler
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadOutfits();
        setRefreshing(false);
    }, [loadOutfits]);

    // Outfits are already filtered by loadOutfits via OutfitsRepo
    const filteredOutfits = outfits;

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        Haptics.selectionAsync();
    };

    const handleCreateOutfit = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Clear previous draft data to ensure a fresh session
        OutfitDraftStore.getInstance().startNewDraft();
        // Navigate to Create Screen
        // @ts-ignore
        navigation.navigate('CreateOutfit');
    };

    // Swipe Logic
    const handleSwipe = useCallback((direction: number) => {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + direction;

        // Clamp index
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= tabs.length) nextIndex = tabs.length - 1;

        if (nextIndex !== currentIndex) {
            handleTabPress(tabs[nextIndex]);
        }
    }, [activeTab, tabs]);

    // Track if we've already triggered haptic for this gesture
    const hasTriggeredHaptic = useRef(false);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-15, 15]) // Horizontal threshold
        .failOffsetY([-10, 10]) // Fail if vertical movement is too large (scrolling list)
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

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleSection}>
                <Text style={styles.sectionLabel}>YOUR LOOKS</Text>
                <Text style={styles.title}>Outfits</Text>
            </View>

            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                >
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab.toUpperCase()}
                            </Text>
                            {activeTab === tab && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Outfit }) => (
        <OutfitCard
            outfit={item}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            onPress={() => {
                Haptics.selectionAsync();
                // @ts-ignore
                navigation.navigate('OutfitDetail', { outfitId: item.id });
            }}
        />
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No outfits found in {activeTab}.</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateOutfit}>
                <Text style={styles.createButtonText}>Create New Outfit</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                {renderHeader()}

                <View style={{ flex: 1, paddingHorizontal: GUTTER }}>
                    <FlashList
                        data={filteredOutfits}
                        renderItem={renderItem}
                        // @ts-ignore
                        estimatedItemSize={250}
                        numColumns={2}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={EmptyState}
                        showsVerticalScrollIndicator={false}
                        // Important for gesture handler to work with list
                        simultaneousHandlers={panGesture}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={COLORS.ELECTRIC_BLUE}
                                colors={[COLORS.ELECTRIC_BLUE]}
                            />
                        }
                    />
                </View>

                <TouchableOpacity style={styles.fab} onPress={handleCreateOutfit}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: GUTTER,
    },
    titleSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.RITUAL_WHITE,
    },
    tabsWrapper: {
        marginHorizontal: -GUTTER,
    },
    tabsContainer: {
        paddingHorizontal: GUTTER,
        gap: 24,
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    activeTab: {},
    tabText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.ASH_GRAY,
        opacity: 0.6,
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: COLORS.ELECTRIC_BLUE,
        opacity: 1,
    },
    activeIndicator: {
        marginTop: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.ELECTRIC_BLUE,
    },
    // Grid Card
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginBottom: GAP,
        marginRight: GAP, // FlashList handles column spacing differently, might need adjustment
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        overflow: 'hidden',
        position: 'relative',
    },
    cardImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    cardOccasion: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 2,
    },
    cardName: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    scoreBadge: {
        position: 'absolute',
        top: -CARD_HEIGHT + 24, // Top right corner relative to content
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    scoreText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    // Empty State
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.ASH_GRAY,
        marginBottom: 20,
    },
    createButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    createButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 100, // Above Nav
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
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFF',
        marginTop: -4,
    },
});
