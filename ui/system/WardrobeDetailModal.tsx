import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { Piece } from '../../truth/types';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../primitives/GlassCard';
import { FloatingFAB } from '../primitives/FloatingFAB'; // Assuming we might want actions in FAB style, or simple buttons

interface WardrobeDetailModalProps {
    visible: boolean;
    piece: Piece | null;
    onClose: () => void;
    onEdit?: (piece: Piece) => void;
    onDelete?: (piece: Piece) => void;
    onFavorite?: (piece: Piece) => void;
}

export const WardrobeDetailModal: React.FC<WardrobeDetailModalProps> = ({
    visible,
    piece,
    onClose,
    onEdit,
    onDelete,
    onFavorite
}) => {
    if (!piece) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.idLabel}>NO.{piece.id.toUpperCase()}</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <Text style={styles.closeText}>[ TERMINATE VIEW ]</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* VISUAL FRAME */}
                    <Animated.View entering={ZoomIn.duration(400)} style={styles.imageFrame}>
                        {piece.imageUri ? (
                            <Image source={{ uri: piece.imageUri }} style={styles.image} />
                        ) : (
                            <View style={[styles.placeholder, { backgroundColor: piece.color }]} />
                        )}
                        {/* Decorative Brackets */}
                        <View style={styles.bracketTL} />
                        <View style={styles.bracketBR} />
                    </Animated.View>

                    {/* ACTIONS ROW */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onFavorite?.(piece)}>
                            <Text style={[styles.actionIcon, piece.isFavorite && { color: COLORS.RITUAL_RED }]}>
                                {piece.isFavorite ? "♥" : "♡"}
                            </Text>
                            <Text style={[styles.actionLabel, piece.isFavorite && { color: COLORS.RITUAL_RED }]}>
                                {piece.isFavorite ? "FAVORITED" : "FAVORITE"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit?.(piece)}>
                            <Text style={styles.actionIcon}>✏️</Text>
                            <Text style={styles.actionLabel}>EDIT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete?.(piece)}>
                            <Text style={[styles.actionIcon, { color: COLORS.FAILURE_ONLY }]}>🗑</Text>
                            <Text style={[styles.actionLabel, { color: COLORS.FAILURE_ONLY }]}>DELETE</Text>
                        </TouchableOpacity>
                    </View>

                    {/* DATA GRID */}
                    <GlassCard style={styles.dataCard}>
                        <View style={styles.row}>
                            <Text style={styles.label}>CATEGORY</Text>
                            <Text style={styles.value}>{piece.category.toUpperCase()}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>COLOR ID</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ width: 12, height: 12, backgroundColor: piece.color, borderRadius: 6 }} />
                                <Text style={styles.value}>{piece.color.toUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>STATUS</Text>
                            <Text style={[
                                styles.value,
                                { color: piece.status === 'Clean' ? COLORS.RITUAL_WHITE : COLORS.FAILURE_ONLY }
                            ]}>
                                {piece.status.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>WEAR COUNT</Text>
                            <Text style={styles.value}>{piece.currentUses} / {piece.maxUses || 3}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>STYLE TAGS</Text>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {piece.styleTags?.map((tag, i) => (
                                    <View key={i} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                                    </View>
                                )) || <Text style={[styles.value, { opacity: 0.5 }]}>NONE</Text>}
                            </View>
                        </View>
                    </GlassCard>

                    {/* AI SUGGESTION BUTTON */}
                    <TouchableOpacity
                        style={styles.aiButton}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            // TODO: Trigger AI
                        }}
                    >
                        <Text style={styles.aiButtonText}>✦ GENERATE OUTFITS</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.LARGE,
    },
    idLabel: {
        color: COLORS.ELECTRIC_COBALT,
        fontSize: 12,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    closeText: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.6,
        fontSize: 12,
        letterSpacing: 1,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageFrame: {
        height: 400,
        marginHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.SECTION,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    placeholder: {
        width: '80%',
        height: '80%',
        opacity: 0.5,
    },
    bracketTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: COLORS.ELECTRIC_COBALT,
    },
    bracketBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.ELECTRIC_COBALT,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.STACK.LARGE,
        paddingHorizontal: SPACING.GUTTER,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        fontSize: 24,
        color: COLORS.RITUAL_WHITE,
    },
    actionLabel: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    dataCard: {
        marginHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.LARGE,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.5,
        fontSize: 10,
        letterSpacing: 2,
    },
    value: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    tag: {
        backgroundColor: COLORS.ELECTRIC_COBALT,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    aiButton: {
        marginHorizontal: SPACING.GUTTER,
        height: 56,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SPACING.RADIUS.SMALL,
    },
    aiButtonText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
