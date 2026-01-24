import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeInRight,
    FadeOutLeft
} from 'react-native-reanimated';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { ritualMachine } from '../state/ritualMachine';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Define.\nYour.\nRitual.',
        subtitle: 'Style is a daily discipline.',
        accent: COLORS.ELECTRIC_BLUE,
    },
    {
        id: '2',
        title: 'Curated.\nBy.\nIntelligence.',
        subtitle: 'We learn what makes you, you.',
        accent: COLORS.PLUM_VIOLET,
    },
    {
        id: '3',
        title: 'Own.\nThe.\nRoom.',
        subtitle: 'Confidence built on data.',
        accent: COLORS.SUCCESS_MINT,
    }
];

export const IntroSlideshow: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            ritualMachine.toOnboarding();
        }
    };

    const currentSlide = SLIDES[currentIndex];

    return (
        <View style={styles.container}>
            {/* Background elements would go here - abstract shapes */}

            <Animated.View
                key={currentSlide.id}
                entering={FadeInRight.springify()}
                exiting={FadeOutLeft.duration(200)}
                style={styles.content}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: currentSlide.accent }]}>
                        {currentSlide.title}
                    </Text>
                    <View style={[styles.line, { backgroundColor: currentSlide.accent }]} />
                    <Text style={styles.subtitle}>
                        {currentSlide.subtitle}
                    </Text>
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && {
                                    backgroundColor: currentSlide.accent,
                                    width: 24
                                }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, { borderColor: currentSlide.accent }]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? 'BEGIN' : 'NEXT'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    textContainer: {
        marginTop: -60,
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 64,
        lineHeight: 72,
        fontWeight: TYPOGRAPHY.WEIGHTS.BLACK,
        letterSpacing: -1,
        textTransform: 'uppercase',
    },
    line: {
        width: 60,
        height: 4,
        marginTop: 24,
        marginBottom: 24,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: TYPOGRAPHY.SCALE.H3,
        color: MATERIAL.TEXT_MAIN,
        fontWeight: TYPOGRAPHY.WEIGHTS.LIGHT,
    },
    footer: {
        height: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: MATERIAL.TEXT_MUTED,
        opacity: 0.3,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderRadius: 30,
    },
    buttonText: {
        color: MATERIAL.TEXT_MAIN,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fontSize: TYPOGRAPHY.SCALE.SMALL,
        letterSpacing: 2,
    }
});
