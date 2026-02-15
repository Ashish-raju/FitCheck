import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../../tokens/color.tokens';

// VISUAL_ID: MANNEQUIN_V3_CROQUIS
// Refined to match standard fashion croquis proportions for "Perfect" look.

interface TorsoSilhouetteProps {
    bodyType?: string;
    gender?: string;
    height?: number;
    width?: number;
}

export const TorsoSilhouette: React.FC<TorsoSilhouetteProps> = ({ bodyType = 'mesomorph', gender = 'Male', width = 160, height = 300 }) => {
    const isFemale = (gender || '').toLowerCase() === 'female';

    // ------------------------------------------------------------------
    // FEMALE MANNEQUIN PATH (High Precision)
    // ------------------------------------------------------------------
    const getFemalePath = () => {
        // Head: 50,15 r=10
        // Neck: 45,28 to 55,28
        // Shoulders: 30,35 to 70,35
        // Armpits: 32,50 to 68,50
        // Waist: 40,75 to 60,75
        // Hips: 32,105 to 68,105
        // Knees: 38,155 to 62,155
        // Ankles: 42,205 to 58,205
        // Feet: 40,215 to 60,215

        return `
            M 50,4 
            C 55,4 58,10 58,18 C 58,26 55,30 50,30 C 45,30 42,26 42,18 C 42,10 45,4 50,4 Z
            M 55,28 L 56,32 L 68,34 
            C 72,35 72,40 71,45 L 70,75 L 72,95 L 70,95 L 68,75 L 65,48 L 65,50 
            C 65,55 60,70 60,75 
            C 60,85 68,95 68,105 
            C 68,125 58,145 56,155 
            C 55,170 56,180 56,205 L 58,210 L 52,210 L 51,200 L 51,165 
            L 50,120 
            L 49,165 L 49,200 L 48,210 L 42,210 L 44,205 
            C 44,180 45,170 44,155 
            C 42,145 32,125 32,105 
            C 32,95 40,85 40,75 
            C 40,70 35,55 35,50 L 35,48 L 32,75 L 30,95 L 28,95 L 30,75 L 29,45 
            C 28,40 28,35 32,34 L 44,32 L 45,28 Z
        `;
    };

    // ------------------------------------------------------------------
    // MALE MANNEQUIN PATH (High Precision)
    // ------------------------------------------------------------------
    const getMalePath = () => {
        // Broad shoulders, V-taper
        return `
            M 50,4 C 55,4 59,9 59,18 C 59,25 55,30 50,30 C 45,30 41,25 41,18 C 41,9 45,4 50,4 Z
            M 56,30 L 58,34 L 74,36
            C 78,37 78,42 77,50 L 75,78 L 77,100 L 73,100 L 71,78 L 68,52 L 68,54
            C 68,65 60,78 58,85 
            C 58,95 60,105 60,110
            C 60,130 58,150 58,160
            C 58,175 58,190 58,210 L 59,215 L 53,215 L 53,170 
            L 50,130
            L 47,170 L 47,215 L 41,215 L 42,210
            C 42,190 42,175 42,160
            C 42,150 40,130 40,110
            C 40,105 42,95 42,85
            C 40,78 32,65 32,54 L 32,52 L 29,78 L 27,100 L 23,100 L 25,78 L 23,50
            C 22,42 22,37 26,36 L 42,34 L 44,30 Z
        `;
    };

    const d = isFemale ? getFemalePath() : getMalePath();

    // ------------------------------------------------------------------
    // OVERLAYS (Matches Body Points)
    // ------------------------------------------------------------------
    const getOverlay = () => {
        if (isFemale) {
            // Hourglass Poly
            return "M 32,34 L 68,34 L 60,75 L 68,105 L 32,105 L 40,75 Z";
        } else {
            // Trapezoid Poly
            return "M 26,36 L 74,36 L 60,110 L 40,110 Z";
        }
    };

    return (
        <Svg width={width} height={height} viewBox="0 0 100 220">
            <Defs>
                <LinearGradient id="skinGrad" x1="0" y1="0.2" x2="1" y2="0.2">
                    <Stop offset="0" stopColor="#B0B0B0" />
                    <Stop offset="0.3" stopColor="#F5F5F5" />
                    <Stop offset="0.6" stopColor="#E0E0E0" />
                    <Stop offset="1" stopColor="#A0A0A0" />
                </LinearGradient>
            </Defs>

            {/* Body */}
            <Path
                d={d}
                fill="url(#skinGrad)"
                stroke="none"
            />

            {/* Overlay */}
            <Path
                d={getOverlay()}
                fill="rgba(80, 80, 255, 0.08)"
                stroke={COLORS.ELECTRIC_VIOLET}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeDasharray="4, 2"
            />
        </Svg>
    );
};
