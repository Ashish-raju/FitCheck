import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ShiningBorderProps {
    children: React.ReactNode;
    style?: ViewStyle;
    borderWidth?: number;
    colors?: string[];
    locations?: number[];
    hiddenCorners?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
    isAnimated?: boolean;
    borderRadius?: number;
}

export const ShiningBorder: React.FC<ShiningBorderProps> = ({
    children,
    style,
    borderWidth = 1.5,
    colors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)'],
    locations = [0, 0.5, 1],
    hiddenCorners = [],
    isAnimated = false,
    borderRadius = 24,
}) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (!isAnimated) {
            pulse.value = 1; // Static visibility
            return;
        }

        pulse.value = withRepeat(
            withTiming(0.4, {
                duration: 2500,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );
    }, [isAnimated]);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulse.value,
    }));

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
    };

    const renderFullPerimeter = () => {
        const { width, height } = dimensions;
        if (width === 0 || height === 0) return null;

        const r = borderRadius;
        const bw = 0.8; // Ultra-thin masterpiece stroke
        const offset = bw / 2;

        const d = `
            M ${r} ${offset}
            L ${width - r} ${offset}
            A ${r - offset} ${r - offset} 0 0 1 ${width - offset} ${r}
            L ${width - offset} ${height - r}
            A ${r - offset} ${r - offset} 0 0 1 ${width - r} ${height - offset}
            L ${r} ${height - offset}
            A ${r - offset} ${r - offset} 0 0 1 ${offset} ${height - r}
            L ${offset} ${r}
            A ${r - offset} ${r - offset} 0 0 1 ${r} ${offset}
            Z
        `;

        return (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width={width} height={height}>
                    <Defs>
                        {/* 1) Top-Left Highlight Gradient */}
                        <LinearGradient id="tlHighlightMaster" x1="0%" y1="0%" x2="50%" y2="50%">
                            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </LinearGradient>

                        {/* 2) Bottom-Right Shadow Hint */}
                        <LinearGradient id="brShadowMaster" x1="50%" y1="50%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="rgba(0, 0, 0, 0)" />
                            <Stop offset="100%" stopColor="rgba(0, 0, 0, 0.3)" />
                        </LinearGradient>

                        {/* 3) Inner Surface Glow */}
                        <LinearGradient id="innerGlowMaster" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                        </LinearGradient>
                    </Defs>

                    {/* Layer 1: Base Rim (Quiet) */}
                    <Path
                        d={d}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={bw}
                        fill="none"
                    />

                    {/* Layer 2: Top-Left Hit (Sharp) */}
                    <Path
                        d={d}
                        stroke="url(#tlHighlightMaster)"
                        strokeWidth={bw}
                        fill="none"
                    />

                    {/* Layer 3: Bottom-Right Shadow (Grounded) */}
                    <Path
                        d={d}
                        stroke="url(#brShadowMaster)"
                        strokeWidth={bw}
                        fill="none"
                    />
                </Svg>
            </View>
        );
    };

    return (
        <View style={[styles.container, style]} onLayout={onLayout}>
            {/* 1) RENDER THE LIQUID PERIMETER */}
            <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]} pointerEvents="none">
                {renderFullPerimeter()}
            </Animated.View>

            {/* 2) CONTENT */}
            <View style={styles.contentContainer}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    contentContainer: {
        flex: 1,
        zIndex: 1,
    },
});
