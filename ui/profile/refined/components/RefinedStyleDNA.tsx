import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../tokens/color.tokens';
import { IllustrationFrame } from '../visuals/IllustrationFrame';

// Dummy implementation of icons if not available, or use emojis for simplicity as requested "chips with icons"
const STYLE_ICONS: Record<string, string> = {
    'Minimalist': '⚪',
    'Street': '👟',
    'Old Money': '🏛️',
    'Boho': '🌿',
    'Chic': '✨',
    'Casual': '🧢',
};

interface RefinedStyleDNAProps {
    preferences?: string[];
}

export const RefinedStyleDNA: React.FC<RefinedStyleDNAProps> = ({ preferences = [] }) => {
    // Fake distribution for demo if no weights available
    const distribution = preferences.slice(0, 4).map((p, i) => ({
        label: p,
        pct: i === 0 ? 45 : (i === 1 ? 25 : 15), // Example weights
        icon: STYLE_ICONS[p] || '✨'
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>STYLE SIGNATURE</Text>
                <Text style={styles.subtitle}>Learned from your saves.</Text>
            </View>

            {/* DNA Bars */}
            <View style={styles.barsContainer}>
                {distribution.map((d, i) => (
                    <View key={i} style={styles.dnaRow}>
                        <View style={styles.labelCol}>
                            <Text style={styles.icon}>{d.icon}</Text>
                            <Text style={styles.label}>{d.label}</Text>
                        </View>
                        <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${d.pct}%` }]} />
                        </View>
                        <Text style={styles.pctText}>{d.pct}%</Text>
                    </View>
                ))}
            </View>

            {/* Thumbnails Row (Placeholder for "You usually choose") */}
            <View style={styles.thumbsRow}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={styles.thumbPlaceholder} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    header: { marginBottom: 16 },
    title: { color: COLORS.RITUAL_WHITE, fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
    subtitle: { color: COLORS.ASH_GRAY, fontSize: 12 },
    barsContainer: { gap: 12, marginBottom: 20 },
    dnaRow: { flexDirection: 'row', alignItems: 'center' },
    labelCol: { flexDirection: 'row', width: 100, alignItems: 'center' },
    icon: { fontSize: 12, marginRight: 6 },
    label: { color: COLORS.RITUAL_WHITE, fontSize: 12 },
    barTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginHorizontal: 12 },
    barFill: { height: '100%', backgroundColor: COLORS.ELECTRIC_VIOLET, borderRadius: 3 },
    pctText: { color: COLORS.ASH_GRAY, fontSize: 10, width: 30, textAlign: 'right' },
    thumbsRow: { flexDirection: 'row', gap: 12 },
    thumbPlaceholder: { width: 60, height: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: COLORS.GLASS_BORDER }
});
