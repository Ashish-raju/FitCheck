import React, { useEffect, PropsWithChildren } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, ClipPath } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { COLORS } from '../tokens/color.tokens';

const { width, height } = Dimensions.get('window');

// Create Animated Rect for Reanimated compatibility
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// --- STATIC GRID GENERATION ---
// Calculate once outside component to avoid scope/hook issues
const generateGrid = () => {
    let d = "";
    const cols = 12;
    const step = width / cols;

    for (let i = 0; i <= cols; i++) {
        const x = i * step;
        d += `M${x},0 L${x},${height} `;
    }
    return d;
};

const GRID_PATH_DATA = generateGrid();

export const LivingBackground: React.FC<PropsWithChildren> = ({ children }) => {
    const pulseY = useSharedValue(height);

    useEffect(() => {
        pulseY.value = withRepeat(
            withTiming(-height * 0.5, {
                duration: 8000,
                easing: Easing.linear
            }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        return {
            y: pulseY.value,
        };
    });

    if (Platform.OS === 'web') {
        return <View style={styles.container}>{children}</View>;
    }

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg height="100%" width="100%" style={styles.svg}>
                    <Defs>
                        <LinearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                            <Stop offset="0.5" stopColor={COLORS.ELECTRIC_COBALT} stopOpacity="0.15" />
                            <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                        </LinearGradient>

                        <ClipPath id="gridClip">
                            <Path
                                d={GRID_PATH_DATA}
                                stroke="white"
                                strokeWidth="1"
                                fill="none"
                            />
                        </ClipPath>
                    </Defs>

                    {/* Animated Pulse - Masked by Grid */}
                    <AnimatedRect
                        x="0"
                        width="100%"
                        height={height * 1.5}
                        fill="url(#pulseGrad)"
                        clipPath="url(#gridClip)"
                        animatedProps={animatedProps}
                    />
                </Svg>
            </View>

            {/* CONTENT LAYER */}
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    svg: {
        opacity: 0.6,
    }
});
