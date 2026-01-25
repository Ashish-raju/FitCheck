import React from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { useRitualActions } from '../state/ritualProvider';
import * as Haptics from 'expo-haptics';
import { MOTION } from '../tokens/motion.tokens';
import { TYPOGRAPHY } from '../tokens';
import { COLORS } from '../tokens/color.tokens';

/**
 * GESTURE LAYER - FIT CHECK
 * 
 * Swipe Down = REJECT (Gravity discard)
 * Tap = SELECT
 * Long Press = SEAL (Authority ritual)
 */
export const GestureLayer: React.FC<{
    children: React.ReactNode,
    onSwipeRight: () => void,
    onSwipeLeft: () => void,
    onSwipeDown: () => void,
    panX: Animated.Value,
    panY: Animated.Value
}> = ({
    children,
    onSwipeRight,
    onSwipeLeft,
    onSwipeDown,
    panX,
    panY
}) => {
        const intent = React.useRef<'NONE' | 'HORIZONTAL' | 'VERTICAL'>('NONE');
        const hasTriggeredHaptic = React.useRef(false);

        const panResponder = React.useMemo(() => PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
            },
            onPanResponderGrant: () => {
                intent.current = 'NONE';
                hasTriggeredHaptic.current = false;
            },
            onPanResponderMove: (_, gestureState) => {
                const { dx, dy } = gestureState;

                if (intent.current === 'NONE') {
                    if (Math.abs(dy) > Math.abs(dx)) {
                        if (dy > 20) {
                            intent.current = 'VERTICAL';
                        }
                    } else {
                        if (dx > 20) {
                            intent.current = 'HORIZONTAL';
                        }
                    }
                }

                if (intent.current === 'VERTICAL' && dy > 0) {
                    panY.setValue(dy);
                    if (dy > 150 && !hasTriggeredHaptic.current) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        hasTriggeredHaptic.current = true;
                    } else if (dy < 150) {
                        hasTriggeredHaptic.current = false;
                    }
                } else if (intent.current === 'HORIZONTAL' && dx > 0) {
                    panX.setValue(dx);
                    if (dx > 150 && !hasTriggeredHaptic.current) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        hasTriggeredHaptic.current = true;
                    } else if (dx < 150) {
                        hasTriggeredHaptic.current = false;
                    }
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const { dx, dy, vx, vy } = gestureState;
                const currentIntent = intent.current;
                intent.current = 'NONE';

                if (currentIntent === 'VERTICAL') {
                    if (dy > 200 || vy > 1) {
                        onSwipeDown();
                    } else {
                        Animated.spring(panY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
                    }
                } else if (currentIntent === 'HORIZONTAL') {
                    if (dx > 200 || vx > 1) {
                        onSwipeRight();
                    } else {
                        Animated.spring(panX, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
                    }
                }
            },
        }), [onSwipeDown, onSwipeRight, panX, panY]);

        // Intent Overlays
        const acceptOpacity = panX.interpolate({
            inputRange: [0, 150, 250],
            outputRange: [0, 0.4, 1],
            extrapolate: 'clamp'
        });

        const discardOpacity = panY.interpolate({
            inputRange: [0, 150, 250],
            outputRange: [0, 0.4, 1],
            extrapolate: 'clamp'
        });

        return (
            <View style={styles.container} {...panResponder.panHandlers}>
                <Animated.View style={[styles.intentOverlay, styles.acceptOverlay, { opacity: acceptOpacity }]}>
                    <Animated.Text style={styles.intentText}>SEAL</Animated.Text>
                </Animated.View>

                <Animated.View style={[styles.intentOverlay, styles.discardOverlay, { opacity: discardOpacity }]}>
                    <Animated.Text style={styles.intentText}>VETO</Animated.Text>
                </Animated.View>

                {children}
            </View>
        );
    };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    intentOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    acceptOverlay: {
        backgroundColor: 'rgba(45, 91, 255, 0.4)',
    },
    discardOverlay: {
        backgroundColor: 'rgba(12, 12, 15, 0.8)',
    },
    intentText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 48,
        fontWeight: TYPOGRAPHY.WEIGHTS.BLACK as any,
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 20,
    },
});
