import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, MATERIAL } from '../../../tokens/color.tokens';
import { SPACING } from '../../../tokens/spacing.tokens';

interface IllustrationFrameProps {
    children: React.ReactNode;
    style?: ViewStyle;
    height?: number;
    showGrid?: boolean;
}

export const IllustrationFrame: React.FC<IllustrationFrameProps> = ({
    children,
    style,
    height = 160,
    showGrid = false
}) => {
    return (
        <View style={[styles.container, { height }, style]}>
            {/* Background Glow */}
            <View style={StyleSheet.absoluteFill}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%" gradientUnits="userSpaceOnUse">
                            <Stop offset="0" stopColor="rgba(255,255,255,0.03)" stopOpacity="1" />
                            <Stop offset="1" stopColor="rgba(255,255,255,0)" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>

            {/* Content centered */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.01)', // Very subtle base
        borderRadius: SPACING.RADIUS.MEDIUM,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    }
});
