import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { COLORS } from '../../../tokens/color.tokens';
import { Piece } from '../../../../truth/types';
import { WardrobeItemCard } from '../../../components/WardrobeItemCard'; // Reuse existing card
import { FadeInUp } from '../motion/Motion';

interface DensityData {
    hue: number;
    items: Piece[];
}

interface RefinedColorWheelProps {
    palette?: { best: string[]; avoid: string[] };
    densityData?: DensityData[];
}

const SEGMENTS = 12;
const RADIUS = 80;
const CENTER = RADIUS + 10;

export const RefinedColorWheel: React.FC<RefinedColorWheelProps> = ({ palette, densityData }) => {
    const [selectedHue, setSelectedHue] = useState<number | null>(null);

    // Filter Items based on selection
    const filteredItems = useMemo(() => {
        if (selectedHue === null || !densityData) return [];
        // Find bucket for hue
        // Simple approximation: check if bucket hue matches selectedHue
        const bucket = densityData.find(d => Math.abs(d.hue - selectedHue) < (360 / SEGMENTS) / 2 + 1);
        return bucket ? bucket.items : [];
    }, [selectedHue, densityData]);

    // Paths
    const paths = useMemo(() => {
        const p = [];
        for (let i = 0; i < SEGMENTS; i++) {
            const startAngle = (i * 360) / SEGMENTS;
            const endAngle = ((i + 1) * 360) / SEGMENTS;
            const hue = i * (360 / SEGMENTS);

            const isSelected = selectedHue !== null && Math.abs(hue - selectedHue) < 1;

            // Adjust opacity/color logic for "Best Range" vs "Avoid" if palette exists
            // For now, just render the wheel
            const fillColor = `hsl(${hue}, 90%, 65%)`;
            const opacity = isSelected ? 1 : 0.6;

            const d = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
            p.push({ d, color: fillColor, hue, opacity, isSelected });
        }
        return p;
    }, [selectedHue, palette]);

    // Dots
    const dots = useMemo(() => {
        if (!densityData) return null;
        return densityData.flatMap((bucket, i) => {
            const angle = bucket.hue;
            return bucket.items.slice(0, 5).map((item, j) => {
                const r = 40 + (j * 8); // stack outward
                const pos = polarToCartesian(CENTER, CENTER, r, angle + 15); // +15 to center in segment
                // If any segment is selected, dim others?
                const isSegmentSelected = selectedHue !== null && Math.abs(angle - selectedHue) < 15;
                const opacity = (selectedHue === null || isSegmentSelected) ? 1 : 0.2;

                return (
                    <Circle
                        key={`${i}-${j}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={3}
                        fill={COLORS.RITUAL_WHITE}
                        opacity={opacity}
                    />
                );
            });
        });
    }, [densityData, selectedHue]);

    return (
        <View style={styles.container}>
            {/* WHEEL INTERACTION */}
            <View style={{ alignItems: 'center' }}>
                <Svg width={CENTER * 2} height={CENTER * 2}>
                    <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                        {paths.map((p, index) => (
                            <Path
                                key={index}
                                d={p.d}
                                fill={p.color}
                                fillOpacity={p.opacity}
                                stroke={p.isSelected ? COLORS.RITUAL_WHITE : COLORS.VOID_BLACK}
                                strokeWidth={p.isSelected ? 2 : 1}
                                onPressIn={() => setSelectedHue(p.hue === selectedHue ? null : p.hue)}
                            />
                        ))}
                        <Circle cx={CENTER} cy={CENTER} r={RADIUS * 0.4} fill={COLORS.VOID_BLACK} />
                        {dots}
                    </G>
                </Svg>

                <View style={styles.overlay}>
                    <Text style={styles.centerText}>{selectedHue !== null ? 'FILTERED' : 'YOUR\nDISTRO'}</Text>
                </View>
            </View>

            {/* FILTERED LIST */}
            {selectedHue !== null && (
                <FadeInUp style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>
                            {filteredItems.length} ITEMS IN THIS COLOR
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedHue(null)}>
                            <Text style={styles.clearBtn}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredItems.length > 0 ? (
                        <FlatList
                            horizontal
                            data={filteredItems}
                            renderItem={({ item }) => (
                                <View style={{ width: 100, marginRight: 12 }}>
                                    <WardrobeItemCard item={item} onPress={() => { }} width={100} height={150} />
                                </View>
                            )}
                            keyExtractor={item => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 4 }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>No items found in this range.</Text>
                    )}
                </FadeInUp>
            )}
        </View>
    );
};

// Math Helpers
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", x, y, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "L", x, y].join(" ");
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
    centerText: { color: COLORS.RITUAL_WHITE, fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
    listContainer: { marginTop: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    listTitle: { color: COLORS.ASH_GRAY, fontSize: 10, fontWeight: 'bold' },
    clearBtn: { color: COLORS.ELECTRIC_VIOLET, fontSize: 10 },
    emptyText: { color: COLORS.ASH_GRAY, fontStyle: 'italic', fontSize: 12 },
});
