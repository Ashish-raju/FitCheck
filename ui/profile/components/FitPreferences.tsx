import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolation } from 'react-native-reanimated';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { SPACING } from '../../tokens/spacing.tokens';
import { UserService } from '../../../services/UserService';
import { FIREBASE_AUTH } from '../../../system/firebase/firebaseConfig';
import { MOTION } from '../../tokens/motion.tokens';

const PROBLEM_AREAS = ['Shoulders', 'Chest', 'Midsection', 'Hips', 'Thighs', 'Arms'];

interface FitPreferencesProps {
    fitPrefs?: string[]; // e.g. ['slim'] or value based
    comfortPrefs?: string[];
    problemAreas?: string[];
}

// Optimization: generic memo to avoid re-renders from parent
export const FitPreferences: React.FC<FitPreferencesProps> = React.memo(({ fitPrefs = [], comfortPrefs = [], problemAreas = [] }) => {
    // Map fit string to slider value: Slim (0) -> Regular (1) -> Relaxed (2) -> Oversized (3)
    const fitMap = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
    const initialFitIndex = fitPrefs[0] ? fitMap.indexOf(fitPrefs[0]) : 1;
    const safeInitialIndex = initialFitIndex !== -1 ? initialFitIndex : 1;

    // State for the Label (0, 1, 2, 3) - Only update when crossing threshold
    const [activeFitIndex, setActiveFitIndex] = useState(safeInitialIndex);
    const [selectedProblemAreas, setSelectedProblemAreas] = useState<string[]>(problemAreas);

    // Animation Shared Value (Exact float for smooth garment morph)
    const fitAnim = useSharedValue(safeInitialIndex);

    const updatePreferences = async (updates: any) => {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (uid) {
            await UserService.getInstance().updateProfile(uid, {
                // @ts-ignore
                "preferences.fitPrefs": updates.fitPrefs !== undefined ? updates.fitPrefs : [fitMap[activeFitIndex]],
                "preferences.problemAreas": updates.problemAreas !== undefined ? updates.problemAreas : selectedProblemAreas,
            });
        }
    };

    const handleValueChange = (val: number) => {
        // Run animation on UI thread immediately
        fitAnim.value = val;

        // Optimization: Only trigger JS re-render if the discrete label changes
        const rounded = Math.round(val);
        if (rounded !== activeFitIndex) {
            setActiveFitIndex(rounded);
        }
    };

    const handleSliderComplete = (val: number) => {
        const index = Math.round(val);
        // Snap visually
        setActiveFitIndex(index);
        fitAnim.value = withSpring(index, MOTION.PHYSICS.SPRING_SNAPPY);

        // Save logic
        updatePreferences({ fitPrefs: [fitMap[index]] });
    };

    const toggleProblemArea = (area: string) => {
        const newAreas = selectedProblemAreas.includes(area)
            ? selectedProblemAreas.filter(a => a !== area)
            : [...selectedProblemAreas, area];

        setSelectedProblemAreas(newAreas);
        updatePreferences({ problemAreas: newAreas });
    };

    // Morphing Garment Style
    const garmentStyle = useAnimatedStyle(() => {
        // Interpolate scale based on fit value (0-3)
        const scaleX = interpolate(fitAnim.value, [0, 3], [0.85, 1.25], Extrapolation.CLAMP);
        const scaleY = interpolate(fitAnim.value, [0, 3], [0.95, 1.05], Extrapolation.CLAMP);

        return {
            transform: [
                { scaleX },
                { scaleY }
            ]
        } as any;
    });

    return (
        <View style={styles.container}>
            {/* Visual Garment Preview */}
            <View style={styles.previewContainer}>
                <Animated.View style={[styles.garmentWrapper, garmentStyle as any]}>
                    <Svg width="120" height="120" viewBox="0 0 100 100">
                        {/* Abstract T-Shirt Path */}
                        <Path
                            d="M20,30 L30,10 L70,10 L80,30 L75,35 L70,30 L70,90 L30,90 L30,30 L25,35 Z"
                            fill="none"
                            stroke={COLORS.RITUAL_WHITE}
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        {/* Inner detail to show 'looseness' */}
                        <Path
                            d="M30,90 Q50,95 70,90"
                            stroke={COLORS.GLASS_BORDER}
                            strokeWidth="1"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>
                <Text style={styles.previewLabel}>{fitMap[activeFitIndex]}</Text>
            </View>

            {/* Fit Slider */}
            <View style={styles.section}>
                <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>Slim</Text>
                    <Slider
                        style={{ flex: 1, height: 40 }}
                        minimumValue={0}
                        maximumValue={3}
                        step={0} // Smooth sliding
                        value={safeInitialIndex} // Set only initial, then let it be uncontrolled visually
                        onValueChange={handleValueChange}
                        onSlidingComplete={handleSliderComplete}
                        minimumTrackTintColor={COLORS.ELECTRIC_VIOLET}
                        maximumTrackTintColor={COLORS.GLASS_BORDER}
                        thumbTintColor={COLORS.RITUAL_WHITE}
                    />
                    <Text style={styles.sliderLabel}>Oversized</Text>
                </View>
            </View>

            {/* Problem Areas */}
            <View style={styles.section}>
                <Text style={styles.label}>FOCUS AREAS (Hide/Neutralize)</Text>
                <View style={styles.chipContainer}>
                    {PROBLEM_AREAS.map(area => {
                        const active = selectedProblemAreas.includes(area);
                        return (
                            <TouchableOpacity
                                key={area}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => toggleProblemArea(area)}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{area}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    previewContainer: {
        height: 160,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: SPACING.RADIUS.MEDIUM,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    garmentWrapper: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewLabel: {
        position: 'absolute',
        bottom: 12,
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sliderLabel: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    chipActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: COLORS.RITUAL_WHITE,
    },
    chipText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
    },
    chipTextActive: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: '600',
    }
});
