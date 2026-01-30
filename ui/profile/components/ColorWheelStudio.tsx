import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, G, Circle } from 'react-native-svg';
import { COLORS } from '../../tokens/color.tokens';
import { Piece } from '../../../truth/types';

interface DensityData {
    hue: number;
    items: Piece[];
}

interface ColorWheelStudioProps {
    palette?: { best: string[]; avoid: string[] };
    densityData?: DensityData[]; // V2 specific
}

// 12 hue segments
const SEGMENTS = 12;
const RADIUS = 80;
const CENTER = RADIUS + 10;

export const ColorWheelStudio: React.FC<ColorWheelStudioProps> = React.memo(({ palette, densityData }) => {
    // Generate wheel paths - MEMOIZED
    const paths = React.useMemo(() => {
        const p = [];
        for (let i = 0; i < SEGMENTS; i++) {
            const startAngle = (i * 360) / SEGMENTS;
            const endAngle = ((i + 1) * 360) / SEGMENTS;
            const hue = i * (360 / SEGMENTS);

            let fillOpacity = 0.2;
            let fillColor = `hsl(${hue}, 70%, 50%)`;

            if (palette) {
                fillOpacity = 0.3;
            }

            const d = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
            p.push({ d, color: fillColor, hue, startAngle, endAngle, opacity: fillOpacity });
        }
        return p;
    }, [palette]);

    // Render density dots - MEMOIZED
    const dots = React.useMemo(() => {
        if (!densityData) return null;
        return densityData.flatMap((bucket, i) => {
            const angle = bucket.hue;
            return bucket.items.slice(0, 5).map((item, j) => {
                const r = 40 + (j * 8);
                const pos = polarToCartesian(CENTER, CENTER, r, angle + 15);
                return (
                    <Circle
                        key={`${i}-${j}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={3}
                        fill={COLORS.RITUAL_WHITE}
                        stroke={COLORS.VOID_BLACK}
                        strokeWidth={0.5}
                    />
                );
            });
        });
    }, [densityData]);

    return (
        <View style={styles.container}>
            <Svg width={CENTER * 2} height={CENTER * 2}>
                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                    {paths.map((p, index) => (
                        <Path
                            key={index}
                            d={p.d}
                            fill={p.color}
                            fillOpacity={p.opacity}
                            stroke={COLORS.VOID_BLACK}
                            strokeWidth={1}
                        />
                    ))}

                    {/* Inner hole */}
                    <Circle cx={CENTER} cy={CENTER} r={RADIUS * 0.4} fill={COLORS.VOID_BLACK} />

                    {/* V2: Render Density Dots */}
                    {dots}
                </G>
            </Svg>

            <View style={styles.overlay}>
                <Text style={styles.centerText}>{densityData ? 'YOUR\nDISTRO' : 'COLOR\nWHEEL'}</Text>
            </View>

            <View style={styles.legend}>
                {densityData && (
                    <View style={styles.legendItem}>
                        <View style={[styles.dot, { backgroundColor: COLORS.RITUAL_WHITE }]} />
                        <Text style={styles.legendText}>Wardrobe Items</Text>
                    </View>
                )}
            </View>
        </View>
    );
});

// SVG Arc Math Helper
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

    const d = [
        "M", x, y,
        "L", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", x, y
    ].join(" ");

    return d;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    overlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 16
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    legendText: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
    }
});
