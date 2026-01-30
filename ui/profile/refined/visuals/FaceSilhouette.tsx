import React from 'react';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface FaceSilhouetteProps {
    fillColor: string;
    width?: number;
    height?: number;
}

export const FaceSilhouette: React.FC<FaceSilhouetteProps> = ({ fillColor, width = 80, height = 100 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 100 120">
            <Defs>
                <RadialGradient id="skinGrad" cx="50%" cy="40%" rx="60%" ry="50%">
                    <Stop offset="0" stopColor={fillColor} stopOpacity="1" />
                    <Stop offset="1" stopColor={fillColor} stopOpacity="0.8" />
                </RadialGradient>
            </Defs>

            {/* Neck */}
            <Path d="M35,90 L35,110 L65,110 L65,90" fill={fillColor} opacity={0.9} />

            {/* Face Shape */}
            <Path
                d="M20,40 C20,10 80,10 80,40 C80,75 50,95 50,95 C50,95 20,75 20,40 Z"
                fill="url(#skinGrad)"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
            />

            {/* Subtle Ears */}
            <Path d="M18,45 C15,45 15,55 18,60" fill={fillColor} />
            <Path d="M82,45 C85,45 85,55 82,60" fill={fillColor} />
        </Svg>
    );
};
