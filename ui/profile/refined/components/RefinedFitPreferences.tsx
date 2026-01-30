import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withSpring, interpolate, Extrapolation } from 'react-native-reanimated';
import { COLORS } from '../../../tokens/color.tokens';
import { MOTION } from '../../../tokens/motion.tokens';
import { IllustrationFrame } from '../visuals/IllustrationFrame';
import { UserService } from '../../../../services/UserService';
import { FIREBASE_AUTH } from '../../../../system/firebase/firebaseConfig';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RefinedFitPreferencesProps {
    fitPrefs?: string[];
    comfortPrefs?: string[];
    problemAreas?: string[];
}

export const RefinedFitPreferences: React.FC<RefinedFitPreferencesProps> = React.memo(({ fitPrefs = [], comfortPrefs = [], problemAreas = [] }) => {

    const fitMap = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
    const initialFitIndex = fitPrefs[0] ? fitMap.indexOf(fitPrefs[0]) : 1;
    const safeInitial = initialFitIndex !== -1 ? initialFitIndex : 1;

    const [activeFitIndex, setActiveFitIndex] = useState(safeInitial);

    const fitAnim = useSharedValue(safeInitial);

    const updatePreferences = async (updates: any) => {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (uid) {
            await UserService.getInstance().updateProfile(uid, {
                // @ts-ignore
                "preferences.fitPrefs": updates.fitPrefs !== undefined ? updates.fitPrefs : [fitMap[activeFitIndex]],
            });
        }
    };

    const handleValueChange = (val: number) => {
        fitAnim.value = val;
        const rounded = Math.round(val);
        if (rounded !== activeFitIndex) setActiveFitIndex(rounded);
    };

    const handleSliderComplete = (val: number) => {
        const index = Math.round(val);
        setActiveFitIndex(index);
        fitAnim.value = withSpring(index, MOTION.PHYSICS.SPRING_SNAPPY);
        updatePreferences({ fitPrefs: [fitMap[index]] });
    };

    // ------------------------------------------------------------------
    // SHARP T-SHIRT PATH
    // ------------------------------------------------------------------
    const animatedProps = useAnimatedProps(() => {
        const v = fitAnim.value;
        const cx = 60;

        // 0=Slim, 3=Oversized
        const shoulderW = interpolate(v, [0, 3], [24, 38]);
        const bodyW = interpolate(v, [0, 3], [20, 34]);
        const hemW = interpolate(v, [0, 3], [20, 36]);

        const sleeveL = interpolate(v, [0, 3], [12, 24]);
        const sleeveW = interpolate(v, [0, 3], [10, 18]);

        const neckY = 10;
        const shoulderY = neckY + interpolate(v, [0, 3], [5, 12]);
        const armpitY = shoulderY + sleeveW + interpolate(v, [0, 3], [0, 5]);
        const hemY = 95;

        // Points
        const pNeckL = `${cx - 12},${neckY}`;
        const pNeckR = `${cx + 12},${neckY}`;
        const pNeckBottom = `${cx},${neckY + 8}`;

        const pShoulderR = `${cx + shoulderW},${shoulderY}`;
        const pSleeveR_EndTop = `${cx + shoulderW + sleeveL},${shoulderY + (sleeveL * 0.2)}`;
        const pSleeveR_EndBot = `${cx + shoulderW + sleeveL - (sleeveW * 0.2)},${shoulderY + sleeveW + (sleeveL * 0.2)}`;
        const pArmpitR = `${cx + bodyW + 2},${armpitY}`;

        const pHemR = `${cx + hemW},${hemY}`;
        const pHemL = `${cx - hemW},${hemY}`;

        const pArmpitL = `${cx - bodyW - 2},${armpitY}`;
        const pSleeveL_EndBot = `${cx - shoulderW - sleeveL + (sleeveW * 0.2)},${shoulderY + sleeveW + (sleeveL * 0.2)}`;
        const pSleeveL_EndTop = `${cx - shoulderW - sleeveL},${shoulderY + (sleeveL * 0.2)}`;
        const pShoulderL = `${cx - shoulderW},${shoulderY}`;

        // Sharp Geometric Outline
        const d = `
            M ${pNeckL}
            Q ${pNeckBottom} ${pNeckR}
            L ${pShoulderR}
            L ${pSleeveR_EndTop}
            L ${pSleeveR_EndBot}
            L ${pArmpitR}
            L ${pHemR}
            L ${pHemL}
            L ${pArmpitL}
            L ${pSleeveL_EndBot}
            L ${pSleeveL_EndTop}
            L ${pShoulderL}
            Z
        `;

        return { d };
    });

    return (
        <View style={styles.container}>
            <IllustrationFrame height={180}>
                <Svg width="120" height="120" viewBox="0 0 120 120">
                    <Defs>
                        <LinearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#FFFFFF" />
                            <Stop offset="1" stopColor="#E0E0E0" />
                        </LinearGradient>
                    </Defs>

                    <AnimatedPath
                        animatedProps={animatedProps}
                        fill="url(#shirtGrad)"
                        stroke="#333"
                        strokeWidth="1"
                        strokeLinejoin="miter" // Sharp corners
                    />
                </Svg>
                <Text style={styles.previewLabel}>{fitMap[activeFitIndex]}</Text>
            </IllustrationFrame>

            <View style={styles.section}>
                <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>Slim</Text>
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={0}
                        maximumValue={3}
                        value={safeInitial}
                        onValueChange={handleValueChange}
                        onSlidingComplete={handleSliderComplete}
                        minimumTrackTintColor={COLORS.ELECTRIC_VIOLET}
                        maximumTrackTintColor={COLORS.GLASS_BORDER}
                        thumbTintColor={COLORS.RITUAL_WHITE}
                    />
                    <Text style={styles.sliderLabel}>Oversized</Text>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {},
    previewLabel: {
        position: 'absolute', bottom: 16, color: COLORS.ELECTRIC_VIOLET,
        fontSize: 14, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase'
    },
    section: { marginBottom: 20 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sliderLabel: { color: COLORS.ASH_GRAY, fontSize: 10, textTransform: 'uppercase' },
});
