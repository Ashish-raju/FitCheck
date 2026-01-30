import React, { useEffect } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../../tokens/color.tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface TorsoSilhouetteProps {
    bodyType?: string;
    gender?: string;
    height?: number;
    width?: number;
}

export const TorsoSilhouette: React.FC<TorsoSilhouetteProps> = ({ bodyType = 'mesomorph', gender = 'Male', width = 160, height = 300 }) => {
    const isFemale = (gender || '').toLowerCase() === 'female';

    // -------------------------------------------------------------
    // MALE TARGETS
    // -------------------------------------------------------------
    // s=shoulder, w=waist, h=hips, mus=muscularity
    let targetM = { s: 24, w: 16, h: 19, mus: 0 };

    // -------------------------------------------------------------
    // FEMALE TARGETS
    // -------------------------------------------------------------
    // Female base: s=20 (narrower), w=14 (smaller), h=22 (wider hips), mus=0 (soft)
    let targetF = { s: 20, w: 14, h: 22, mus: 0 };

    const type = (bodyType || '').toLowerCase();

    if (isFemale) {
        // FEMALE MORPHS
        if (type.includes('ecto') || type.includes('slim') || type.includes('rect')) {
            targetF = { s: 19, w: 17, h: 19, mus: 0.1 }; // "Straight/Banana"
        } else if (type.includes('endo') || type.includes('pear') || type.includes('tri')) {
            targetF = { s: 19, w: 16, h: 25, mus: 0.2 }; // "Pear/Spoon" (Wide hips)
        } else if (type.includes('meso') || type.includes('hour')) {
            targetF = { s: 21, w: 13, h: 23, mus: 0.3 }; // "Hourglass"
        } else if (type.includes('inv') || type.includes('cone')) {
            targetF = { s: 23, w: 16, h: 19, mus: 0.4 }; // "Inverted Triangle"
        } else if (type.includes('apple') || type.includes('oval')) {
            targetF = { s: 21, w: 20, h: 20, mus: 0.1 }; // "Apple" (Rounder core)
        }
    } else {
        // MALE MORPHS
        if (type.includes('ecto') || type.includes('slim')) {
            targetM = { s: 21, w: 17, h: 18, mus: 0 };
        } else if (type.includes('endo') || type.includes('oval')) {
            targetM = { s: 23, w: 22, h: 21, mus: 0.5 };
        } else if (type.includes('meso') || type.includes('athle')) {
            targetM = { s: 26, w: 15, h: 18, mus: 1.0 };
        } else if (type.includes('trap')) {
            targetM = { s: 24, w: 18, h: 19, mus: 0.5 };
        } else if (type.includes('inv')) {
            targetM = { s: 28, w: 16, h: 17, mus: 0.8 };
        }
    }

    // Shared animated values (we just feed them different targets)
    const activeTarget = isFemale ? targetF : targetM;

    const shoulder = useSharedValue(activeTarget.s);
    const waist = useSharedValue(activeTarget.w);
    const hips = useSharedValue(activeTarget.h);
    const muscle = useSharedValue(activeTarget.mus);

    useEffect(() => {
        shoulder.value = withSpring(activeTarget.s);
        waist.value = withSpring(activeTarget.w);
        hips.value = withSpring(activeTarget.h);
        muscle.value = withSpring(activeTarget.mus);
    }, [bodyType, isFemale]);

    const bodyProps = useAnimatedProps(() => {
        const s = shoulder.value;
        const w = waist.value;
        const h = hips.value;
        const m = muscle.value;

        // COMMON HEAD
        const headPath = `
            M 50,2
            C 56,2 60,8 60,18
            C 60,24 55,28 50,28
            C 45,28 40,24 40,18
            C 40,8 44,2 50,2
        `;

        if (isFemale) {
            // ============================================
            // FEMALE PATH CONSTRUCTION
            // ============================================
            // Softer shoulders, defined bust, distinct waist curve, wider hip sweep

            const neckWidth = 5;
            const xNeckR = 50 + neckWidth;
            const xNeckL = 50 - neckWidth;
            const yNeckBase = 32;

            const xS_R = 50 + s;
            const xS_L = 50 - s;
            const yShoulderTop = 34;

            // Bust
            const yBust = 55;
            const bustOut = 2 + (m * 2); // Slight projection

            // Waist (Higher than male)
            const yWaist = 75;
            const xW_R = 50 + w;
            const xW_L = 50 - w;

            // Hips
            const yHips = 105;
            const xH_R = 50 + h;

            // Arms
            const armW = 5;
            const xHandR = xS_R + 2;
            const xHandL = xS_L - 2;
            const yElbow = 75;
            const yWrist = 100;

            // Legs
            const yKnee = 155;
            const kneeW = 6;
            const ankleW = 4;
            const yFeet = 210;

            // --- RIGHT SIDE ---
            const pShoulderR = `L ${xS_R},${yShoulderTop}`;
            const pArmOuterR = `Q ${xS_R + 3},45 ${xS_R + 2},${yElbow} L ${xHandR},${yWrist}`;

            // Arm Inner -> Armpit -> Bust -> Waist -> Hip
            // Female armpit curve is softer
            const xArmpitR = xS_R - 3;
            const pArmInnerR = `L ${xHandR - armW},${yWrist} L ${xS_R - 2},${yElbow} L ${xArmpitR},48`;

            // Torso Contour
            const pTorsoR = `
                C ${xArmpitR + 1},55 ${xW_R + bustOut},55 ${xW_R},${yWaist} 
                C ${xW_R},85 ${xH_R},90 ${xH_R},${yHips}
            `;

            // Leg Right (Thigh -> Knee -> Calf -> Ankle)
            const pLegOuterR = `
                C ${xH_R},125 ${50 + h * 0.5},135 ${50 + kneeW + 4},${yKnee}
                C ${50 + kneeW + 3},170 ${50 + ankleW + 5},180 ${50 + ankleW + 2},${yFeet - 5}
                L ${50 + ankleW + 2},${yFeet}
            `;

            const pLegInnerR = `
                L ${50 + ankleW - 1},${yFeet}
                L ${50 + ankleW - 1},190
                C ${50 + ankleW - 1},175 ${50 + kneeW},${yKnee + 10} ${50 + kneeW - 1},${yKnee}
                L ${50 + 2},120 L 50,115
            `;

            // --- LEFT SIDE (Mirror) ---
            const pLegInnerL = `
                L 50,115 L ${50 - 2},120
                L ${50 - (kneeW - 1)},${yKnee}
                C ${50 - kneeW},${yKnee + 10} ${50 - (ankleW - 1)},175 ${50 - (ankleW - 1)},190
                L ${50 - (ankleW - 1)},${yFeet}
            `;

            const pLegOuterL = `
                L ${50 - (ankleW + 2)},${yFeet}
                L ${50 - (ankleW + 2)},${yFeet - 5}
                C ${50 - (ankleW + 5)},180 ${50 - (kneeW + 3)},170 ${50 - (kneeW + 4)},${yKnee}
                C ${50 - h * 0.5},135 ${50 - h},125 ${50 - h},${yHips}
            `;

            const xArmpitL = 50 - s + 3;

            const pTorsoL = `
                C ${50 - h},90 ${xW_L},85 ${xW_L},${yWaist}
                C ${xW_L - bustOut},55 ${xArmpitL - 1},55 ${xArmpitL},48
            `;

            const xS_L_explicit = 50 - s;
            const xHandL_explicit = xS_L_explicit - 2;

            const pArmInnerL = `L ${xS_L_explicit + 2},${yElbow} L ${xHandL_explicit + armW},${yWrist}`;
            const pArmOuterL = `L ${xHandL_explicit},${yWrist} Q ${xS_L_explicit - 2},${yElbow} ${xS_L_explicit - 3},45 L ${xS_L_explicit},${yShoulderTop}`;

            const d = `
                ${headPath}
                M ${xNeckR},${yNeckBase}
                ${pShoulderR}
                ${pArmOuterR}
                ${pArmInnerR}
                ${pTorsoR}
                ${pLegOuterR}
                ${pLegInnerR}
                ${pLegInnerL}
                ${pLegOuterL}
                ${pTorsoL}
                ${pArmInnerL}
                ${pArmOuterL}
                L ${xNeckL},${yNeckBase}
                Z
            `;
            return { d };

        } else {
            // ============================================
            // MALE PATH CONSTRUCTION (Existing Graphic Style)
            // ============================================
            const sVal = s; // Rename to avoid confusion

            const trapRise = 30 - (m * 2);
            const neckWidth = 6 + (m * 1);
            const xNeckR = 50 + neckWidth;
            const xNeckL = 50 - neckWidth;
            const yNeckBase = 34;

            const xS_R = 50 + sVal;
            const xS_L = 50 - sVal;
            const yShoulderTop = 36;
            const yDeltoidBot = 52;

            const armW = 5 + (m * 1.5);
            const yElbow = 80;
            const yWrist = 105;
            const xHandR = xS_R + 3;

            const xArmpitR = xS_R - 4;
            const xW_R = 50 + w;
            const xH_R = 50 + h;

            const yKnee = 160;
            const thighW = h * 0.5;
            const kneeW = 6;
            const calfBulge = 7 + (m * 1);
            const ankleW = 4;

            // Shoulder to Arm Outer
            const pDeltoidR = `C ${xS_R + 2},${yShoulderTop} ${xS_R + 5},${yDeltoidBot - 10} ${xS_R + 4},${yDeltoidBot}`;
            const pArmOuterR = `L ${xS_R + 3},${yElbow} L ${xHandR},${yWrist}`;

            const pArmInnerR = `L ${xHandR - armW},${yWrist} L ${xS_R - 1},${yElbow} L ${xArmpitR},${50}`;

            const latCtrl = m > 0.5 ? xArmpitR + 3 : xArmpitR;
            const pTorsoR = `C ${latCtrl},65 ${xW_R},70 ${xW_R},80 C ${xW_R},90 ${xH_R},95 ${xH_R},105`;

            const pLegOuterR = `
                C ${xH_R},120 ${50 + thighW + 2},140 ${50 + kneeW + 3},${yKnee}
                C ${50 + kneeW + 2},170 ${50 + calfBulge},175 ${50 + ankleW + 2},200
            `;

            const pLegInnerR = `
                L ${50 + ankleW},200
                C ${50 + ankleW - 1},175 ${50 + calfBulge - 4},170 ${50 + kneeW - 1},${yKnee}
                C ${50 + kneeW - 1},140 ${50 + 2},125 50,115
            `;

            const pLegInnerL = `
                L 50,115
                C ${50 - 2},125 ${50 - (kneeW - 1)},140 ${50 - (kneeW - 1)},${yKnee}
                C ${50 - (calfBulge - 4)},170 ${50 - (ankleW - 1)},175 ${50 - ankleW},200
            `;

            const pLegOuterL = `
                L ${50 - (ankleW + 2)},200
                C ${50 - calfBulge},175 ${50 - (kneeW + 2)},170 ${50 - (kneeW + 3)},${yKnee}
                C ${50 - (thighW + 2)},140 ${50 - h},120 ${50 - h},105
            `;

            const xW_L = 50 - w;
            const xArmpitL = 50 - sVal + 4;
            const latCtrlL = m > 0.5 ? xArmpitL - 3 : xArmpitL;

            const pTorsoL = `
                C ${50 - h},95 ${xW_L},90 ${xW_L},80
                C ${xW_L},70 ${latCtrlL},65 ${xArmpitL},50
            `;

            const xS_L_explicit = 50 - sVal;
            const xHandL_explicit = xS_L - 3;

            const pArmInnerL = `L ${xS_L_explicit + 1},${yElbow} L ${xHandL_explicit + armW},${yWrist}`;
            const pArmOuterL = `L ${xHandL_explicit},${yWrist} L ${xS_L_explicit - 3},${yElbow}`;

            const pDeltoidL = `
                 L ${xS_L_explicit - 4},${yDeltoidBot}
                 C ${xS_L_explicit - 5},${yDeltoidBot - 10} ${xS_L_explicit - 2},${yShoulderTop} ${xNeckL},${yNeckBase}
            `;

            const d = `
                ${headPath}
                M ${xNeckR},${yNeckBase}
                L ${xS_R},${yShoulderTop}
                ${pDeltoidR}
                ${pArmOuterR}
                ${pArmInnerR}
                ${pTorsoR}
                ${pLegOuterR}
                ${pLegInnerR}
                ${pLegInnerL}
                ${pLegOuterL}
                ${pTorsoL}
                ${pArmInnerL}
                ${pArmOuterL}
                ${pDeltoidL}
                L ${xNeckL},${yNeckBase}
                Z
            `;
            return { d };
        }
    });

    const overlayProps = useAnimatedProps(() => {
        const s = shoulder.value;
        const w = waist.value;
        const h = hips.value;

        // MALE OVERLAY
        if (!isFemale) {
            const yTop = 60;
            const yBot = 105;

            const xS_R = 50 + s - 3;
            const xS_L = 50 - s + 3;
            const xH_R = 50 + h - 2;
            const xH_L = 50 - h + 2;
            const xW_R = 50 + w - 2;
            const xW_L = 50 - w + 2;

            const isHourglass = (w < s * 0.9) && (w < h * 0.9);

            if (isHourglass) {
                return {
                    d: `M ${xS_L},${yTop} L ${xS_R},${yTop} L ${xW_R},80 L ${xH_R},${yBot} L ${xH_L},${yBot} L ${xW_L},80 Z`
                }
            }
            return {
                d: `M ${xS_L},${yTop} L ${xS_R},${yTop} L ${xH_R},${yBot} L ${xH_L},${yBot} Z`
            };
        } else {
            // FEMALE OVERLAY (Follows curves more)
            const yTop = 55;
            const yWaist = 75;
            const yBot = 105;

            const xS_R = 50 + s - 2;
            const xS_L = 50 - s + 2;
            const xH_R = 50 + h - 1;
            const xH_L = 50 - h + 1;
            const xW_R = 50 + w - 1;
            const xW_L = 50 - w + 1;

            // Allow more points for female shape to show Hourglass/Pear distinctly
            return {
                d: `M ${xS_L},${yTop} L ${xS_R},${yTop} L ${xW_R},${yWaist} L ${xH_R},${yBot} L ${xH_L},${yBot} L ${xW_L},${yWaist} Z`
            };
        }
    });

    return (
        <Svg width={width} height={height} viewBox="0 0 100 220">
            <Defs>
                <LinearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#A0A0A0" />
                    <Stop offset="0.5" stopColor="#E0E0E0" />
                    <Stop offset="1" stopColor="#A0A0A0" />
                </LinearGradient>
            </Defs>

            {/* 1. Body */}
            <AnimatedPath
                animatedProps={bodyProps}
                fill="url(#skinGrad)"
                stroke="none"
            />

            {/* 2. Geometric Overlay */}
            <AnimatedPath
                animatedProps={overlayProps}
                fill="rgba(50, 50, 255, 0.1)"
                stroke={COLORS.ELECTRIC_VIOLET}
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </Svg>
    );
};
