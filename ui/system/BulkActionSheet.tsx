import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { TYPOGRAPHY, formatCommand } from '../tokens';

interface BulkActionSheetProps {
    count: number;
    onClear: () => void;
    onDelete: () => void;
    onArchive: () => void;
}

export const BulkActionSheet: React.FC<BulkActionSheetProps> = ({ count, onClear, onDelete, onArchive }) => {
    if (count === 0) return null;

    return (
        <Animated.View
            entering={SlideInDown.springify()}
            exiting={SlideOutDown.duration(200)}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.countText}>{count} SELECTED</Text>
                <TouchableOpacity onPress={onClear}>
                    <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={onDelete}>
                    <Text style={styles.btnText}>DELETE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.archiveBtn]} onPress={onArchive}>
                    <Text style={styles.btnText}>ARCHIVE</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: SPACING.RADIUS.LARGE,
        padding: SPACING.GUTTER,
        borderColor: COLORS.ELECTRIC_COBALT,
        borderWidth: 1,
        shadowColor: COLORS.ELECTRIC_COBALT,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    countText: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cancelText: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.6,
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SPACING.RADIUS.SMALL,
    },
    deleteBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: COLORS.FAILURE_ONLY,
    },
    archiveBtn: {
        backgroundColor: COLORS.SURFACE_GLASS,
        borderWidth: 1,
        borderColor: COLORS.SURFACE_BORDER,
    },
    btnText: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    }
});
