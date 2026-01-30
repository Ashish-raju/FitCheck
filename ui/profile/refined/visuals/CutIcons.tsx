import React from 'react';
import Svg, { Path, G, Rect, Circle } from 'react-native-svg';
import { COLORS } from '../../../tokens/color.tokens';

// Helper for consistent sizing
const IconFrame = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <Svg width="40" height="40" viewBox="0 0 40 40">
        <G stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </G>
    </Svg>
);

export const CutIcons = {
    // Necklines
    CrewNeck: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,12 Q20,22 30,12" />
            <Path d="M10,12 L5,30 M30,12 L35,30" />
        </IconFrame>
    ),
    VNeck: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,10 L20,25 L30,10" />
            <Path d="M10,10 L5,30 M30,10 L35,30" />
        </IconFrame>
    ),
    Collared: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M20,25 L10,15 L10,10 L20,15 L30,10 L30,15 L20,25 Z" />
            <Path d="M10,15 L5,30 M30,15 L35,30" />
        </IconFrame>
    ),

    // Rises
    LowRise: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            {/* Hips high, waist low */}
            <Path d="M10,10 L10,35 M30,10 L30,35" strokeOpacity="0.3" />
            <Path d="M10,25 Q20,28 30,25" strokeWidth="2" />
            <Path d="M20,27 L20,35" />
        </IconFrame>
    ),
    MidRise: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,10 L10,35 M30,10 L30,35" strokeOpacity="0.3" />
            <Path d="M10,18 Q20,21 30,18" strokeWidth="2" />
            <Path d="M20,20 L20,35" />
        </IconFrame>
    ),
    HighRise: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,10 L10,35 M30,10 L30,35" strokeOpacity="0.3" />
            <Path d="M10,12 Q20,15 30,12" strokeWidth="2" />
            <Path d="M20,14 L20,35" />
        </IconFrame>
    ),

    // Lengths
    Cropped: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,10 L30,10 L30,22 L10,22 Z" />
            <Path d="M10,22 L10,30 M30,22 L30,30" strokeDasharray="2 2" strokeOpacity="0.5" />
        </IconFrame>
    ),
    RegularLength: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,10 L30,10 L30,30 L10,30 Z" />
        </IconFrame>
    ),
    Longline: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Path d="M10,5 L30,5 L30,35 L10,35 Z" />
        </IconFrame>
    ),

    // Generic fallback
    Default: ({ color }: { color: string }) => (
        <IconFrame color={color}>
            <Rect x="10" y="10" width="20" height="20" rx="4" />
        </IconFrame>
    )
};

export const getCutIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('crew')) return CutIcons.CrewNeck;
    if (n.includes('v-neck')) return CutIcons.VNeck;
    if (n.includes('collar')) return CutIcons.Collared;
    if (n.includes('low')) return CutIcons.LowRise;
    if (n.includes('mid')) return CutIcons.MidRise;
    if (n.includes('high')) return CutIcons.HighRise;
    if (n.includes('crop')) return CutIcons.Cropped;
    if (n.includes('long')) return CutIcons.Longline;
    return CutIcons.Default;
};
