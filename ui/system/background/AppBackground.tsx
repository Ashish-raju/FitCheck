import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Mask, Pattern } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    useDerivedValue,
    interpolateColor,
    Extrapolate
} from 'react-native-reanimated';
import { COLORS } from '../../tokens/color.tokens';
import { useBackgroundMotion } from './BackgroundContext';

const { width, height } = Dimensions.get('window');

// --- CONSTANTS ---
const ANI_DURATION = 8000;
const VIGNETTE_INTENSITY = 0.8;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// --- STATIC GRID GENERATION ---
// Symmetric Cross Grid
const generateGrid = () => {
    let d = "";
    // Vertical Lines (Symmetric from center)
    const cols = 8; // Fewer cols for cleaner look
    const stepX = width / cols;

    for (let i = 1; i < cols; i++) {
        const x = i * stepX;
        d += `M${x},0 L${x},${height} `;
    }

    // Horizontal Lines
    const rows = 12;
    const stepY = height / rows;
    for (let i = 1; i < rows; i++) {
        const y = i * stepY;
        d += `M0,${y} L${width},${y} `;
    }

    return d;
};
const GRID_PATH_DATA = generateGrid();

export const AppBackground: React.FC = () => {
    const { panX } = useBackgroundMotion();
    const pulseY = useSharedValue(height);

    useEffect(() => {
        // Idle Pulse (Rising Tide)
        pulseY.value = withRepeat(
            withTiming(-height * 0.5, {
                duration: ANI_DURATION,
                easing: Easing.linear
            }),
            -1,
            false // Do not reverse, just loop
        );
    }, []);

    // --- ANIMATION PROPS ---

    // 1. Idle Pulse Props
    const pulseProps = useAnimatedProps(() => {
        return {
            y: pulseY.value,
            opacity: 0.3 // Subtle
        };
    });

    // 2. Swipe Wave Props
    const waveProps = useAnimatedProps(() => {
        // Map panX to vertical progress of the wave
        // Swipe > 0 (Right/Accept) -> Move Up
        // Swipe < 0 (Left/Reject) -> Move Up
        // Range: 0 to width/2

        const swipeMag = Math.abs(panX.value);
        const progress = interpolate(swipeMag, [0, width * 0.3], [height, 0], Extrapolate.CLAMP); // Start at bottom, go to top

        return {
            y: progress - (height * 0.5), // Offset to center the gradient beam
            opacity: interpolate(swipeMag, [0, 50], [0, 1], Extrapolate.CLAMP)
        };
    });

    // 3. Dynamic Gradient Colors based on Direction
    const waveGradientProps = useAnimatedProps(() => {
        const color = panX.value > 0 ? '#4CAF50' : '#F44336'; // Green or Red
        // We can't easily animate the stops inside <Stop> with props in this setup without deeper reanimated support or state.
        // Strategy: Use Two rectangles (Red and Green) and fade them in/out?
        // OR just use a derived color string if supported?
        // Reanimated supports colors on 'fill' but maybe not gradient stops easily.
        // Easier approach: Two wave rects. One Red, One Green. Opacity controls which one shows.
        return {};
    });

    const redOpacity = useDerivedValue(() => {
        return panX.value < 0 ? 1 : 0;
    });

    const greenOpacity = useDerivedValue(() => {
        return panX.value > 0 ? 1 : 0;
    });

    const redWaveProps = useAnimatedProps(() => {
        const swipeMag = Math.abs(panX.value);
        // Map swipe distance to wave vertical position (Bottom -> Top)
        const yPos = interpolate(swipeMag, [0, width * 0.4], [height, -height * 0.2], Extrapolate.CLAMP);
        const op = interpolate(swipeMag, [10, 100], [0, 0.8], Extrapolate.CLAMP);
        return {
            y: yPos,
            opacity: op * redOpacity.value
        };
    });

    const greenWaveProps = useAnimatedProps(() => {
        const swipeMag = Math.abs(panX.value);
        const yPos = interpolate(swipeMag, [0, width * 0.4], [height, -height * 0.2], Extrapolate.CLAMP);
        const op = interpolate(swipeMag, [10, 100], [0, 0.8], Extrapolate.CLAMP);
        return {
            y: yPos,
            opacity: op * greenOpacity.value
        };
    });

    return (
        <View style={styles.container} pointerEvents="none">
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
                <Defs>
                    <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={COLORS.ABYSSAL_BLUE} stopOpacity="1" />
                        <Stop offset="1" stopColor="#050510" stopOpacity="1" />
                    </LinearGradient>

                    {/* Blue/Silver Idle Pulse */}
                    <LinearGradient id="idlePulse" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                        <Stop offset="0.5" stopColor={COLORS.ELECTRIC_COBALT} stopOpacity="0.2" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>

                    {/* RED Wave Gradient */}
                    <LinearGradient id="redWave" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                        <Stop offset="0.2" stopColor="#FF0000" stopOpacity="0.8" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>

                    {/* GREEN Wave Gradient */}
                    <LinearGradient id="greenWave" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="transparent" stopOpacity="0" />
                        <Stop offset="0.2" stopColor="#00FF00" stopOpacity="0.8" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>

                    <Mask id="gridMask">
                        <Path
                            d={GRID_PATH_DATA}
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                        />
                    </Mask>

                    <LinearGradient id="vignette" x1="0.5" y1="0.5" x2="1" y2="1">
                        <Stop offset="0.3" stopColor="transparent" stopOpacity="0" />
                        <Stop offset="1" stopColor="black" stopOpacity={VIGNETTE_INTENSITY} />
                    </LinearGradient>
                </Defs>

                {/* Base Background */}
                <Rect width={width} height={height} fill="url(#bgGradient)" />

                {/* --- GRID MASKED LAYERS --- */}

                {/* 1. Base Static Grid (Very Faint) */}
                <Path
                    d={GRID_PATH_DATA}
                    stroke={COLORS.KINETIC_SILVER}
                    strokeWidth="1"
                    strokeOpacity="0.05" // Barely visible base
                    fill="none"
                />

                {/* 2. Idle Upward Pulse (Masked by Grid) */}
                <AnimatedRect
                    x="0"
                    width={width}
                    height={height * 1.5}
                    fill="url(#idlePulse)"
                    mask="url(#gridMask)"
                    animatedProps={pulseProps}
                />

                {/* 3. Interaction Waves (Masked by Grid) */}
                <AnimatedRect
                    x="0"
                    width={width}
                    height={height * 1.5}
                    fill="url(#redWave)"
                    mask="url(#gridMask)"
                    animatedProps={redWaveProps}
                />
                <AnimatedRect
                    x="0"
                    width={width}
                    height={height * 1.5}
                    fill="url(#greenWave)"
                    mask="url(#gridMask)"
                    animatedProps={greenWaveProps}
                />


                {/* Vignette Overlay */}
                <Rect width={width} height={height} fill="url(#vignette)" />

            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
        backgroundColor: COLORS.ABYSSAL_BLUE,
    },
});
