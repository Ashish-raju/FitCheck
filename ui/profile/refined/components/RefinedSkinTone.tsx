import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../tokens/color.tokens';
import { IllustrationFrame } from '../visuals/IllustrationFrame';
import { FaceSilhouette } from '../visuals/FaceSilhouette';

interface RefinedSkinToneProps {
    skinTone?: any; // Replace with proper type/interface
    palette?: { best: string[]; avoid: string[] };
    onRescan: () => void;
}

export const RefinedSkinTone: React.FC<RefinedSkinToneProps> = ({ skinTone, palette, onRescan }) => {
    // Derive skin fill or use fallback
    const skinColor = (skinTone && skinTone.skinColorHex) ? skinTone.skinColorHex : '#E0AC69'; // Fallback
    const toneLabel = skinTone ? `${skinTone.undertone} ${skinTone.tone}` : 'Analyze Skin Tone';

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                {/* Visual Face */}
                <IllustrationFrame height={140} style={{ flex: 1, marginRight: 16 }}>
                    <FaceSilhouette fillColor={skinColor} />
                    <View style={styles.toneTag}>
                        <Text style={styles.toneText}>{toneLabel}</Text>
                    </View>
                </IllustrationFrame>

                {/* Palette Preview */}
                <View style={styles.paletteInfo}>
                    <Text style={styles.sectionTitle}>YOUR PALETTE</Text>
                    <Text style={styles.seasonTitle}>{palette ? 'Deep Winter' : 'Unknown Season'}</Text>

                    <View style={styles.swatchRow}>
                        {(palette?.best || ['#333', '#444', '#555']).slice(0, 4).map((c, i) => (
                            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
                        ))}
                    </View>

                    <TouchableOpacity onPress={onRescan} style={styles.rescanBtn}>
                        <Text style={styles.rescanText}>Retake Analysis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%' },
    topRow: { flexDirection: 'row' },
    toneTag: {
        position: 'absolute',
        bottom: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    toneText: { color: COLORS.RITUAL_WHITE, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    paletteInfo: { flex: 1, justifyContent: 'center' },
    sectionTitle: { color: COLORS.ASH_GRAY, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    seasonTitle: { color: COLORS.RITUAL_WHITE, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    swatchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    rescanBtn: { borderBottomWidth: 1, borderBottomColor: COLORS.ASH_GRAY, alignSelf: 'flex-start' },
    rescanText: { color: COLORS.ASH_GRAY, fontSize: 12 },
});
