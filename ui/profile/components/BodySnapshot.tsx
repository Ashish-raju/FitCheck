import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { SPACING } from '../../tokens/spacing.tokens';
import { UserService } from '../../../services/UserService';
import { FIREBASE_AUTH } from '../../../system/firebase/firebaseConfig';
import { BlurView } from 'expo-blur';

const BODY_TYPES = ['Ectomorph', 'Mesomorph', 'Endomorph', 'Athletic', 'Curvy', 'Rectangular'];

interface BodySnapshotProps {
    currentBodyType?: string;
    confidence?: number;
    onRetakePress: () => void;
}

// Memoized to prevent re-renders when parent ProfileScreen updates unrelated state
export const BodySnapshot: React.FC<BodySnapshotProps> = React.memo(({ currentBodyType, confidence, onRetakePress }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedType, setSelectedType] = useState(currentBodyType || 'Mesomorph');

    const handleSave = async () => {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (uid) {
            try {
                await UserService.getInstance().updateProfile(uid, {
                    bodyType: selectedType
                });
                setIsEditing(false);
            } catch (e) {
                Alert.alert("Error", "Failed to save body type.");
            }
        }
    };

    // Simplified paths for silhouettes (Placeholder shapes that change slightly)
    const getSilhouettePath = (type: string) => {
        const t = (type || 'Mesomorph').toLowerCase();
        // Simple abstract paths
        if (t === 'ectomorph') return "M50,10 L70,20 L65,50 L70,120 L30,120 L35,50 L30,20 Z";
        if (t === 'endomorph') return "M50,10 L80,25 L75,60 L80,120 L20,120 L25,60 L20,25 Z";
        return "M50,10 L75,20 L70,55 L75,120 L25,120 L30,55 L25,20 Z"; // Default/Mesomorph
    };

    if (isEditing) {
        return (
            <View style={styles.container}>
                <Text style={styles.headerTitle}>Manual Override</Text>
                <View style={styles.grid}>
                    {BODY_TYPES.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.optionBtn,
                                selectedType === type && styles.optionBtnActive
                            ]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[styles.optionText, selectedType === type && styles.optionTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveText}>Save Override</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.visualContainer}>
                {/* Silhouette Graphic */}
                <Svg height="140" width="100%" viewBox="0 0 100 130" style={styles.silhouette}>
                    <Defs>
                        <LinearGradient id="silGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="white" stopOpacity="0.8" />
                            <Stop offset="1" stopColor="white" stopOpacity="0.1" />
                        </LinearGradient>
                    </Defs>
                    <Path
                        d={getSilhouettePath(currentBodyType || '')}
                        fill="url(#silGrad)"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                    />
                </Svg>

                {/* Overlays */}
                <View style={styles.overlayContent}>
                    <BlurView intensity={20} tint="dark" style={styles.typeChip}>
                        <Text style={styles.typeLabel}>{currentBodyType || 'UNKNOWN'}</Text>
                        {confidence !== undefined && (
                            <Text style={styles.confidenceText}>{Math.round(confidence * 100)}% Match</Text>
                        )}
                    </BlurView>
                </View>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.actionLink}>Adjust</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onRetakePress} style={styles.retakeBtn}>
                    <Text style={styles.retakeText}>Rescan</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: SPACING.RADIUS.MEDIUM,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
        overflow: 'hidden',
    },
    visualContainer: {
        height: 160,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    silhouette: {
        alignSelf: 'center',
    },
    overlayContent: {
        position: 'absolute',
        bottom: 16,
        alignItems: 'center',
    },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    typeLabel: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    confidenceText: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 10,
        marginTop: 2,
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.STACK.NORMAL,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionLink: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    retakeBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    retakeText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 12,
        fontWeight: '600',
    },
    // ... manual override styles
    headerTitle: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 16,
    },
    optionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: COLORS.CARBON_BLACK,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    optionBtnActive: {
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        borderColor: COLORS.ELECTRIC_VIOLET,
    },
    optionText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
    },
    optionTextActive: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    cancelBtn: { padding: 10 },
    cancelText: { color: COLORS.ASH_GRAY },
    saveBtn: {
        backgroundColor: COLORS.RITUAL_WHITE,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    saveText: {
        color: COLORS.VOID_BLACK,
        fontWeight: 'bold',
    }
});
