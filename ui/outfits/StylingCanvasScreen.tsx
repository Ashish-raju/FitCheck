import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SimpleDraggableItem } from './components/SimpleDraggableItem';
import { OutfitDraftStore } from '../../state/outfits/OutfitDraftStore';
import { Piece } from '../../truth/types';

const { width, height } = Dimensions.get('window');

// Exported for reuse if needed, or kept local
export interface CanvasItem {
    id: string;
    pieceId: string;
    imageUri: string | number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    zIndex: number;
}

export const StylingCanvasScreen: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const viewShotRef = useRef<ViewShot>(null);

    // DRAFT STORE SOURCE
    const draftStore = OutfitDraftStore.getInstance();

    // State
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // Undo/Redo History
    const [history, setHistory] = useState<CanvasItem[][]>([]);
    const [future, setFuture] = useState<CanvasItem[][]>([]);

    // Sync on Focus - FAANG Grade Reliability
    // This ensures that whether fresh mount or cached back-nav, we ALWAYS reflect the store.
    useFocusEffect(
        useCallback(() => {
            console.log('[StylingCanvas] Hydrating...');

            // 1. Check for Saved Position State
            if (draftStore.state.canvasState) {
                console.log('[StylingCanvas] Restoring saved canvas state.', draftStore.state.canvasState.length, 'items');
                setCanvasItems(draftStore.state.canvasState as CanvasItem[]);
                return;
            }

            // 2. Fresh Draft? Scatter Strategy
            const items = draftStore.getFilledItems();
            console.log('[StylingCanvas] Scattering new items:', items.length);

            if (items.length === 0) {
                console.warn('[StylingCanvas] Warning: No items found in DraftStore!');
            }

            const newItems = items.map((item: Piece, index: number) => {
                // Smart Grid Scatter (2x2 centered)
                const col = index % 2;
                const row = Math.floor(index / 2);

                // Item size is approx 120. Spacing 20.
                const ITEM_SIZE = 120;
                const SPACING = 40;

                // Calculate Center Offsets
                const totalWidth = (ITEM_SIZE * 2) + SPACING;
                const startX = (width - totalWidth) / 2;
                const startY = (height / 2) - ITEM_SIZE; // Start slightly above center

                return {
                    id: `canvas_${item.id}_${Date.now()}_${index}`,
                    pieceId: item.id,
                    imageUri: item.imageUri,
                    x: startX + (col * (ITEM_SIZE + SPACING)),
                    y: startY + (row * (ITEM_SIZE + SPACING)),
                    scale: 1,
                    rotate: (Math.random() * 10) - 5, // Slight natural tilt
                    zIndex: index,
                };
            });

            setCanvasItems(newItems);

            // Clear history on fresh load
            setHistory([]);
            setFuture([]);

        }, []) // Empty dep array for useFocusEffect callback is fine, it triggers on focus
    );

    const saveToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-10), canvasItems]); // Keep last 10
        setFuture([]); // Clear redo
    }, [canvasItems]);

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setFuture(prev => [canvasItems, ...prev]);
        setCanvasItems(previous);
        setHistory(prev => prev.slice(0, -1));
        Haptics.selectionAsync();
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory(prev => [...prev, canvasItems]);
        setCanvasItems(next);
        setFuture(prev => prev.slice(1));
        Haptics.selectionAsync();
    };

    const handleUpdateItem = (id: string, changes: Partial<CanvasItem>) => {
        setCanvasItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, ...changes };
            }
            return item;
        }));
    };

    const handleTapItem = (id: string) => {
        setActiveItemId(id);
        // Bring to front
        setCanvasItems(prev => {
            const maxZ = Math.max(...prev.map(i => i.zIndex));
            return prev.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i);
        });
        Haptics.selectionAsync();
    };

    const handleSave = async () => {
        try {
            if (!viewShotRef.current) return;
            setActiveItemId(null); // Remove selection borders

            // Delay capture for UI update
            setTimeout(async () => {
                const uri = await viewShotRef.current?.capture();
                console.log("Captured URI:", uri);

                // Commit via DraftStore - AND SAVE STATE
                // We pass the current 'canvasItems' as the second arg to save positions
                const finalId = await draftStore.commit(uri, canvasItems);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Return Logic - ALWAYS Home for safety, or Detail for update
                if (draftStore.state.mode === 'edit') {
                    // Go back to Details to show the updated outfit
                    navigation.navigate('OutfitDetail' as never, { outfitId: finalId } as never);
                } else {
                    // New creation -> Home
                    navigation.navigate('Outfits' as never);
                }
            }, 100);

        } catch (e) {
            console.error("Failed to capture:", e);
            Alert.alert("Error", "Could not save outfit.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Toolbar */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{draftStore.state.occasion.toUpperCase()}</Text>

                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveText}>SAVE</Text>
                </TouchableOpacity>
            </View>

            {/* Canvas Area */}
            <ViewShot
                ref={viewShotRef}
                options={{ format: 'jpg', quality: 0.9 }}
                style={[styles.canvasContainer, { backgroundColor: '#FFF' }]}
            >
                {/* Draggable Items */}
                {canvasItems.map((item) => (
                    <SimpleDraggableItem
                        key={item.id}
                        id={item.id}
                        imageUri={item.imageUri as string} // Handled by component logic now
                        initialX={item.x}
                        initialY={item.y}
                        initialScale={item.scale}
                        isActive={activeItemId === item.id}
                        onTap={() => handleTapItem(item.id)}
                        onChange={(transform) => handleUpdateItem(item.id, transform)}
                    />
                ))}
            </ViewShot>

            {/* Footer / Controls */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity onPress={handleUndo} style={[styles.controlButton, history.length === 0 && styles.disabledButton]}>
                    <Ionicons name="arrow-undo" size={24} color={history.length > 0 ? "#FFF" : "#555"} />
                </TouchableOpacity>

                <Text style={styles.hintText}>Pinch to Resize • Drag to Move</Text>

                <TouchableOpacity onPress={handleRedo} style={[styles.controlButton, future.length === 0 && styles.disabledButton]}>
                    <Ionicons name="arrow-redo" size={24} color={future.length > 0 ? "#FFF" : "#555"} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 10,
        backgroundColor: '#111',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    canvasContainer: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        overflow: 'hidden',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingTop: 20,
    },
    controlButton: {
        padding: 10,
        backgroundColor: '#222',
        borderRadius: 20,
    },
    hintText: {
        color: '#666',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#222',
        borderRadius: 20,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
    saveText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    disabledButton: {
        opacity: 0.3,
    },
});
