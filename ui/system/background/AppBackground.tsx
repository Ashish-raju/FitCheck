import React, { useEffect, memo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Mask } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { COLORS } from '../../tokens/color.tokens';
import { useBackgroundMotion } from './BackgroundContext';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

const width = SCREEN_WIDTH;
const height = SCREEN_HEIGHT;


const CELL_SIZE = 40;
const JUNCTION_SIZE = 4;
const SWIPE_THRESHOLD = WINDOW_WIDTH * 0.3;


// Pre-compute paths at module level (runs once, not per render)
const computePaths = () => {
    let gridD = '';
    let junctionD = '';

    const numCols = Math.ceil(width / CELL_SIZE) + 4;
    const numRows = Math.ceil(height / CELL_SIZE) + 4;

    // Diagonal lines
    for (let i = -numRows; i <= numCols + numRows; i++) {
        const startX = i * CELL_SIZE;
        gridD += `M${startX},0 L${startX + height},${height} `;
        gridD += `M${startX},0 L${startX - height},${height} `;
    }

    // Junction X marks
    for (let row = 0; row <= numRows * 2 + 4; row++) {
        const y = row * (CELL_SIZE / 2);
        const xOffset = (row % 2) * (CELL_SIZE / 2);

        for (let col = -2; col <= numCols + 2; col++) {
            const x = col * CELL_SIZE + xOffset;
            junctionD += `M${x - JUNCTION_SIZE},${y - JUNCTION_SIZE} L${x + JUNCTION_SIZE},${y + JUNCTION_SIZE} `;
            junctionD += `M${x + JUNCTION_SIZE},${y - JUNCTION_SIZE} L${x - JUNCTION_SIZE},${y + JUNCTION_SIZE} `;
        }
    }

    return { gridPath: gridD, junctionPath: junctionD };
};

const PATHS = computePaths();

// Static SVG layer - rendered once, never updates
const StaticGrid = memo(() => (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
            <LinearGradient id="fadeMask" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="black" stopOpacity="0" />
                <Stop offset="0.4" stopColor="black" stopOpacity="0" />
                <Stop offset="0.7" stopColor="white" stopOpacity="0.6" />
                <Stop offset="1" stopColor="white" stopOpacity="1" />
            </LinearGradient>
            <Mask id="gridMask">
                <Rect x="0" y="0" width={width} height={height} fill="url(#fadeMask)" />
            </Mask>
        </Defs>

        {/* Black Background */}
        <Rect width={width} height={height} fill="#000000" />

        {/* Static Grid */}
        <G mask="url(#gridMask)">
            <Path
                d={PATHS.gridPath}
                stroke="#FFFFFF"
                strokeWidth="0.6"
                strokeOpacity={0.08}
                fill="none"
            />
            {/* Base X marks - always visible at low opacity */}
            <Path
                d={PATHS.junctionPath}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeOpacity={0.12}
                fill="none"
            />
        </G>
    </Svg>
));

// Animated overlay - just opacity animation, no SVG manipulation
const AnimatedOverlay = memo(() => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 0 }),
                withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 1500, easing: Easing.in(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
    }));

    return (
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]} pointerEvents="none">
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="fadeMask2" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="black" stopOpacity="0" />
                        <Stop offset="0.4" stopColor="black" stopOpacity="0" />
                        <Stop offset="0.7" stopColor="white" stopOpacity="0.6" />
                        <Stop offset="1" stopColor="white" stopOpacity="1" />
                    </LinearGradient>
                    <Mask id="gridMask2">
                        <Rect x="0" y="0" width={width} height={height} fill="url(#fadeMask2)" />
                    </Mask>
                </Defs>
                {/* Bright X marks - fades in/out */}
                <G mask="url(#gridMask2)">
                    <Path
                        d={PATHS.junctionPath}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeOpacity={0.25}
                        fill="none"
                    />
                </G>
            </Svg>
        </Animated.View>
    );
});


// Swipe Direction Glow - RED for left, GREEN for right
const SwipeGlow = memo(() => {
    const { panX } = useBackgroundMotion();

    // Green glow (right swipe)
    const greenGlowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            panX.value,
            [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD * 1.2],
            [0, 0.3, 0.7],
            Extrapolation.CLAMP
        ),
    }));

    // Red glow (left swipe)
    const redGlowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            panX.value,
            [-SWIPE_THRESHOLD * 1.2, -SWIPE_THRESHOLD * 0.5, 0],
            [0.7, 0.3, 0],
            Extrapolation.CLAMP
        ),
    }));

    return (
        <>
            {/* Green Glow Overlay (Right Swipe) */}
            <Animated.View style={[StyleSheet.absoluteFill, greenGlowStyle]} pointerEvents="none">
                <Svg width={width} height={height}>
                    <Defs>
                        <LinearGradient id="greenFade" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="black" stopOpacity="0" />
                            <Stop offset="0.4" stopColor="black" stopOpacity="0" />
                            <Stop offset="0.7" stopColor="white" stopOpacity="0.6" />
                            <Stop offset="1" stopColor="white" stopOpacity="1" />
                        </LinearGradient>
                        <Mask id="greenMask">
                            <Rect x="0" y="0" width={width} height={height} fill="url(#greenFade)" />
                        </Mask>
                    </Defs>
                    <G mask="url(#greenMask)">
                        <Path
                            d={PATHS.gridPath}
                            stroke={COLORS.SUCCESS_MINT}
                            strokeWidth="0.8"
                            strokeOpacity={0.5}
                            fill="none"
                        />
                        <Path
                            d={PATHS.junctionPath}
                            stroke={COLORS.SUCCESS_MINT}
                            strokeWidth="2"
                            strokeOpacity={0.8}
                            fill="none"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Red Glow Overlay (Left Swipe) */}
            <Animated.View style={[StyleSheet.absoluteFill, redGlowStyle]} pointerEvents="none">
                <Svg width={width} height={height}>
                    <Defs>
                        <LinearGradient id="redFade" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor="black" stopOpacity="0" />
                            <Stop offset="0.4" stopColor="black" stopOpacity="0" />
                            <Stop offset="0.7" stopColor="white" stopOpacity="0.6" />
                            <Stop offset="1" stopColor="white" stopOpacity="1" />
                        </LinearGradient>
                        <Mask id="redMask">
                            <Rect x="0" y="0" width={width} height={height} fill="url(#redFade)" />
                        </Mask>
                    </Defs>
                    <G mask="url(#redMask)">
                        <Path
                            d={PATHS.gridPath}
                            stroke={COLORS.ERROR_ROSE}
                            strokeWidth="0.8"
                            strokeOpacity={0.5}
                            fill="none"
                        />
                        <Path
                            d={PATHS.junctionPath}
                            stroke={COLORS.ERROR_ROSE}
                            strokeWidth="2"
                            strokeOpacity={0.8}
                            fill="none"
                        />
                    </G>
                </Svg>
            </Animated.View>
        </>
    );
});

// Main background component - combines static, animated, and swipe glow layers
export const AppBackground: React.FC = memo(() => {
    return (
        <View style={styles.container} pointerEvents="none">
            <StaticGrid />
            <AnimatedOverlay />
            <SwipeGlow />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
});
