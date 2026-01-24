import React, { useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import { useRitualState, useRitualActions } from '../state/ritualProvider';
import { CandidateStage } from './CandidateStage';
import { GestureLayer } from './GestureLayer';
import { COLORS } from '../tokens/color.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { ContextManager } from '../../context/kernel/contextManager';
import { RitualPulseOverlay } from './RitualPulseOverlay';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * RITUAL SURFACE
 * 
 * The active engagement layer.
 * One candidate. Two choices (Seal or Discard).
 */
export const RitualScreen: React.FC = () => {
    // Current Ritual State
    const { phase, candidateOutfits, currentOutfitIndex } = useRitualState();

    // Get the current outfit from the array
    const candidateOutfit = candidateOutfits && candidateOutfits.length > currentOutfitIndex
        ? candidateOutfits[currentOutfitIndex]
        : null;

    console.log('[RitualScreen] Render. Index:', currentOutfitIndex, 'Candidate:', candidateOutfit?.id);

    // Animation Values
    const dropY = useRef(new Animated.Value(0)).current;
    const panX = useRef(new Animated.Value(0)).current;
    const panY = useRef(new Animated.Value(0)).current;

    const pulseRef = React.useRef<any>(null); // Type 'any' for speed, ideally RitualPulseHandle

    const handleReject = () => {
        if (!candidateOutfit) return;

        console.log('REJECT triggered - Gravity engaged');

        // 1. Gravity Animation (Fall down)
        Animated.timing(panY, {
            toValue: SCREEN_HEIGHT, // Fall off screen
            duration: 400, // Heavy fall
            useNativeDriver: true,
        }).start(() => {
            // 2. Logic executes AFTER object is gone
            // Move to next outfit
            const nextIndex = currentOutfitIndex + 1;

            if (nextIndex < candidateOutfits.length) {
                ritualMachine.setOutfitIndex(nextIndex);
            } else {
                console.log("End of Ritual Deck");
            }

            // 3. Reset position instantly for next candidate
            panY.setValue(0);
            panX.setValue(0);

            // Trigger next pulse interaction if needed, or just reset
            pulseRef.current?.reset();
        });
    };

    const handleAccept = () => {
        if (candidateOutfit) {
            console.log('ACCEPT triggered - Sealing Ritual');
            pulseRef.current?.triggerRevealSuccess();
            // Delay actual logic slightly to let animation play?
            // Or parallel.
            setTimeout(() => {
                ritualMachine.sealRitual(candidateOutfit.id);
            }, 300);

        }
    };

    // Trigger "Reveal Start" when component mounts or new candidate appears?
    // Depending on effect desired.
    // useEffect(() => { pulseRef.current?.triggerRevealStart(); }, [candidateOutfit]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.ABYSSAL_BLUE} />

            {/* PULSE OVERLAY BACK LAYER */}
            <RitualPulseOverlay ref={pulseRef} />

            <GestureLayer
                onSwipeRight={handleAccept}
                onSwipeLeft={handleReject}
                onSwipeDown={handleReject}
                panX={panX}
                panY={panY}
            >
                <View style={styles.altarWrapper}>
                    {/* The Swiping Object */}
                    {/* GestureLayer drives panX/panY via Animated.event or direct setValue */}
                    {/* We bind the transform to those values */}
                    <Animated.View style={{
                        transform: [
                            { translateX: panX },
                            { translateY: panY },
                            // Add slight rotation based on X for fluid feel
                            { rotate: panX.interpolate({ inputRange: [-200, 200], outputRange: ['-10deg', '10deg'] }) }
                        ]
                    }}>
                        {candidateOutfit ? (
                            <CandidateStage outfit={candidateOutfit} />
                        ) : (
                            <View style={styles.emptyState}>
                                {/* Placeholder or Empty State */}
                            </View>
                        )}
                    </Animated.View>
                </View>
            </GestureLayer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Using TRANSPARENT so the LivingBackground shows through
        backgroundColor: 'transparent',
    },
    altarWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        width: 300,
        height: 400,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
    }
});
