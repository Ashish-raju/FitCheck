import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import Animated, {
    FadeIn,
    SlideInDown,
    ZoomIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
    runOnJS,
    interpolate,
    Extrapolation,
    FadeOut
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';
import { Piece } from '../../truth/types';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../primitives/GlassCard';

interface WardrobeDetailModalProps {
    visible: boolean;
    piece: Piece | null;
    onClose: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onEdit?: (piece: Piece) => void;
    onDelete?: (piece: Piece) => void;
    onFavorite?: (piece: Piece) => void;
}

export const WardrobeDetailModal: React.FC<WardrobeDetailModalProps> = ({
    visible,
    piece,
    onClose,
    onNext,
    onPrevious,
    onEdit,
    onDelete,
    onFavorite
}) => {
    const { candidateOutfits } = useRitualState();
    const { height, width } = Dimensions.get('window');

    // Gesture tracking
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const hasTriggeredHaptic = useSharedValue(false);

    // Toast State
    const [showToast, setShowToast] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');

    // Delete Confirmation State
    const [isDeleting, setIsDeleting] = React.useState(false);
    // Slider animation value
    const slideX = useSharedValue(0);
    const SLIDER_WIDTH = width * 0.7;
    const SLIDER_HEIGHT = 60;
    const SLIDER_PADDING = 5;
    const KNOB_SIZE = SLIDER_HEIGHT - (SLIDER_PADDING * 2);
    const MAX_SLIDE = SLIDER_WIDTH - KNOB_SIZE - (SLIDER_PADDING * 2);

    // Track last piece ID to determine animation direction
    const [lastPieceId, setLastPieceId] = React.useState(piece?.id);
    // Keep track of swipe direction for animation
    const swipeDirection = React.useRef<'left' | 'right' | null>(null);

    // Reset animations when piece changes or modal visibility changes
    React.useEffect(() => {
        if (visible) {
            // If just opened
            if (opacity.value === 0) {
                translateY.value = 0;
                translateX.value = 0;
                opacity.value = 1;
            }
        }
    }, [visible]);

    // Handle Piece Change Animation
    React.useEffect(() => {
        if (piece && piece.id !== lastPieceId) {
            // We changed pieces
            const direction = swipeDirection.current;

            // Immediately position off-screen based on direction
            if (direction === 'left') {
                // Swiped left (show next), so new content comes from right
                translateX.value = width;
            } else if (direction === 'right') {
                // Swiped right (show prev), so new content comes from left
                translateX.value = -width;
            }

            // Animate back to center
            translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });

            setLastPieceId(piece.id);
            swipeDirection.current = null;
        } else if (piece && translateX.value !== 0 && !swipeDirection.current) {
            // Ensure centered if no swipe involved
            translateX.value = withTiming(0, { duration: 300 });
        }

        // If same piece but coming back (e.g. initial load), ensure id is set
        if (piece && piece.id !== lastPieceId) {
            setLastPieceId(piece.id);
        }
    }, [piece, lastPieceId]);

    // Track last valid piece to prevent crash when parent sets piece to null (while modal is closing)
    const [renderedPiece, setRenderedPiece] = React.useState(piece);

    React.useEffect(() => {
        if (piece) {
            setRenderedPiece(piece);
        }
    }, [piece]);

    // Use renderedPiece for all display logic
    const activePiece = piece || renderedPiece;

    // Content Style (Horizontal Swipe)
    // IMAGE Style (Horizontal Swipe + Fade)
    const imageAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value }
        ] as any,
        opacity: interpolate(
            Math.abs(translateX.value),
            [0, width * 0.5],
            [1, 0],
            Extrapolation.CLAMP
        )
    }));

    // INFO Style (Fade Only, No Movement)
    const infoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            Math.abs(translateX.value),
            [0, width * 0.5],
            [1, 0],
            Extrapolation.CLAMP
        )
    }));

    // Background Container Style (Vertical Swipe only)
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            // Scale effect on background to look nice
            { scale: interpolate(translateY.value, [0, height * 0.4], [1, 0.95], Extrapolation.CLAMP) }
        ] as any,
        opacity: opacity.value
    }));

    if (!activePiece) return null;

    // Helper to handle swipe completion on JS thread
    const handleSwipeComplete = (direction: 'left' | 'right') => {
        swipeDirection.current = direction;
        if (direction === 'left') {
            onNext?.();
        } else {
            onPrevious?.();
        }
    };

    const panGesture = Gesture.Pan()
        .enabled(!isDeleting) // Disable main swipe when deleting
        .onUpdate((event) => {
            // Priority: Vertical swipe (Down) or Horizontal swipe
            if (event.translationY > 0 && Math.abs(event.translationY) > Math.abs(event.translationX)) {
                // Swiping Down
                translateY.value = event.translationY;
                opacity.value = interpolate(
                    event.translationY,
                    [0, height * 0.4],
                    [1, 0.5],
                    Extrapolation.CLAMP
                );
            } else if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                // Swiping Horizontal
                translateX.value = event.translationX;

                // Trigger Haptic on threshold
                const threshold = 50;
                if (!hasTriggeredHaptic.value && Math.abs(event.translationX) > threshold) {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                    hasTriggeredHaptic.value = true;
                }
            }
        })
        .onEnd((event) => {
            const verticalThreshold = height * 0.15;
            const horizontalThreshold = width * 0.25;
            const velocityThreshold = 500;

            // Only allow closing if we were explicitly swiping vertically (translateY > 0)
            if (translateY.value > 0 && (translateY.value > verticalThreshold || event.velocityY > velocityThreshold)) {
                // Close modal
                runOnJS(onClose)();
            }
            // Only allow navigation if we were explicitly swiping horizontally (translateX != 0)
            else if (translateX.value !== 0 && (translateX.value < -horizontalThreshold || event.velocityX < -velocityThreshold)) {
                // Next item (Swipe Left)
                // Animate fully out to left
                translateX.value = withTiming(-width, { duration: 250, easing: Easing.inOut(Easing.quad) });
                runOnJS(handleSwipeComplete)('left');
            } else if (translateX.value !== 0 && (translateX.value > horizontalThreshold || event.velocityX > velocityThreshold)) {
                // Previous item (Swipe Right)
                // Animate fully out to right
                translateX.value = withTiming(width, { duration: 250, easing: Easing.inOut(Easing.quad) });
                runOnJS(handleSwipeComplete)('right');
            } else {
                // Snap back
                translateY.value = withSpring(0);
                translateX.value = withTiming(0, { duration: 300 });
                opacity.value = withSpring(1);
            }
            hasTriggeredHaptic.value = false;
        });

    // Delete Slider Gesture
    const deleteGesture = Gesture.Pan()
        .onUpdate((event) => {
            slideX.value = Math.max(0, Math.min(event.translationX, MAX_SLIDE));
            // Haptic trigger near end
            if (slideX.value > MAX_SLIDE * 0.9 && !hasTriggeredHaptic.value) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                hasTriggeredHaptic.value = true;
            }
        })
        .onEnd(() => {
            if (slideX.value > MAX_SLIDE * 0.9) {
                // Completed slide - Trigger Action directly
                // Do NOT animate here as we are about to unmount/close the modal
                runOnJS(handleDeleteConfirm)();
            } else {
                // Reset
                slideX.value = withSpring(0);
            }
            hasTriggeredHaptic.value = false;
        });

    const handleDeleteInit = () => {
        setIsDeleting(true);
        slideX.value = 0;
    };

    const handleDeleteCancel = () => {
        setIsDeleting(false);
        slideX.value = 0;
    };

    const handleDeleteConfirm = () => {
        // Break the gesture stack to prevent race conditions during unmount
        // Increased delay to ensure all gesture handlers are fully detached
        setTimeout(() => {
            if (activePiece) onDelete?.(activePiece);
            setIsDeleting(false);
            // Do NOT call onClose() here. Let onDelete handle the flow.
            // Calling onClose here creates a race with onDelete's own state updates.
        }, 300);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.container, containerAnimatedStyle]}>
                        <View style={{ flex: 1 }}>
                            {/* HEADER */}
                            <View style={styles.header}>
                                <Text style={styles.idLabel}>NO.{activePiece.id.toUpperCase()}</Text>
                                <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                                    <Text style={styles.closeText}>[ TERMINATE VIEW ]</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                {/* VISUAL FRAME - SWIPES */}
                                <Animated.View style={[styles.imageFrame, imageAnimatedStyle]}>
                                    {activePiece.imageUri ? (
                                        <Image
                                            source={typeof activePiece.imageUri === 'string' ? { uri: activePiece.imageUri } : activePiece.imageUri}
                                            style={styles.image}
                                        />
                                    ) : (
                                        <View style={[styles.placeholder, { backgroundColor: activePiece.color }]} />
                                    )}
                                    {/* Decorative Brackets */}
                                    <View style={styles.bracketTL} />
                                    <View style={styles.bracketBR} />
                                </Animated.View>

                                {/* INFO SECTION - STATIC LABELS, FADING VALUES */}
                                <View>
                                    {/* ACTIONS ROW */}
                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => {
                                            // Capture state BEFORE action to avoid mutation issues
                                            const willAdd = !activePiece.isFavorite;
                                            onFavorite?.(activePiece);
                                            // Trigger Toast
                                            setToastMessage(willAdd ? "ADDED TO FAVORITES" : "REMOVED FROM FAVORITES");
                                            setShowToast(true);
                                            // Hide after 2s
                                            setTimeout(() => setShowToast(false), 2000);
                                        }}>
                                            <Text style={[styles.actionIcon, activePiece.isFavorite && { color: COLORS.RITUAL_RED }]}>
                                                {activePiece.isFavorite ? "♥" : "♡"}
                                            </Text>
                                            <Text style={[styles.actionLabel, activePiece.isFavorite && { color: COLORS.RITUAL_RED }]}>
                                                {activePiece.isFavorite ? "FAVORITED" : "FAVORITE"}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit?.(activePiece)}>
                                            <Text style={styles.actionIcon}>✏️</Text>
                                            <Text style={styles.actionLabel}>EDIT</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteInit}>
                                            <Text style={[styles.actionIcon, { color: COLORS.FAILURE_ONLY }]}>🗑</Text>
                                            <Text style={[styles.actionLabel, { color: COLORS.FAILURE_ONLY }]}>DELETE</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* DATA GRID */}
                                    <GlassCard style={styles.dataCard}>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>CATEGORY</Text>
                                            <Animated.Text style={[styles.value, infoAnimatedStyle]}>{activePiece.category.toUpperCase()}</Animated.Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>COLOR ID</Text>
                                            <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, infoAnimatedStyle]}>
                                                <View style={{ width: 12, height: 12, backgroundColor: activePiece.color, borderRadius: 6 }} />
                                                <Text style={styles.value}>{activePiece.color.toUpperCase()}</Text>
                                            </Animated.View>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>STATUS</Text>
                                            <Animated.Text style={[
                                                styles.value,
                                                { color: activePiece.status === 'Clean' ? COLORS.RITUAL_WHITE : COLORS.FAILURE_ONLY },
                                                infoAnimatedStyle
                                            ]}>
                                                {activePiece.status.toUpperCase()}
                                            </Animated.Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>WEAR COUNT</Text>
                                            <Animated.Text style={[styles.value, infoAnimatedStyle]}>{activePiece.currentUses} / {activePiece.maxUses || 3}</Animated.Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>STYLE TAGS</Text>
                                            <Animated.View style={[{ flexDirection: 'row', gap: 6 }, infoAnimatedStyle]}>
                                                {activePiece.styleTags?.map((tag, i) => (
                                                    <View key={i} style={styles.tag}>
                                                        <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                                                    </View>
                                                )) || <Text style={[styles.value, { opacity: 0.5 }]}>NONE</Text>}
                                            </Animated.View>
                                        </View>
                                    </GlassCard>

                                    {/* AI SUGGESTION BUTTON */}
                                    <TouchableOpacity
                                        style={styles.aiButton}
                                        onPress={() => {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            // Set phase to RITUAL and provide outfits
                                            // Using a fallback to ensure we always have something to show
                                            const outfits = (candidateOutfits && candidateOutfits.length > 0) ? candidateOutfits : [];
                                            ritualMachine.enterRitual(outfits);
                                            onClose(); // Close modal
                                        }}
                                    >
                                        <Text style={styles.aiButtonText}>✦ GENERATE OUTFITS</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </Animated.View>
                </GestureDetector>

                {/* DELETE CONFIRMATION OVERLAY */}
                {isDeleting && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        style={styles.deleteOverlay}
                    >
                        <TouchableOpacity style={styles.deleteCancelZone} onPress={handleDeleteCancel} activeOpacity={1} />

                        <View style={styles.deleteContainer}>
                            <Text style={styles.deleteTitle}>PERMANENTLY DELETE?</Text>
                            <Text style={styles.deleteSub}>This action cannot be undone.</Text>

                            <View style={[styles.sliderTrack, { width: SLIDER_WIDTH, height: SLIDER_HEIGHT }]}>
                                <Text style={styles.sliderText}>SLIDE TO CONFIRM</Text>
                                <GestureDetector gesture={deleteGesture}>
                                    <Animated.View style={[
                                        styles.sliderKnob,
                                        {
                                            width: KNOB_SIZE,
                                            height: KNOB_SIZE,
                                            transform: [{ translateX: slideX }]
                                        }
                                    ]}>
                                        <Text style={styles.knobIcon}>→</Text>
                                    </Animated.View>
                                </GestureDetector>
                            </View>

                            <TouchableOpacity style={styles.cancelBtn} onPress={handleDeleteCancel}>
                                <Text style={styles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </GestureHandlerRootView>

            {/* TOAST NOTIFICATION */}
            {
                showToast && (
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={styles.toast}
                    >
                        <View style={styles.toastBlur} />
                        <Text style={styles.toastText}>{toastMessage}</Text>
                    </Animated.View>
                )
            }
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.LARGE,
    },
    idLabel: {
        color: COLORS.ELECTRIC_COBALT,
        fontSize: 12,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    closeText: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.6,
        fontSize: 12,
        letterSpacing: 1,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageFrame: {
        height: 400,
        marginHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.X_LARGE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    placeholder: {
        width: '80%',
        height: '80%',
        opacity: 0.5,
    },
    bracketTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderColor: COLORS.ELECTRIC_COBALT,
    },
    bracketBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.ELECTRIC_COBALT,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.STACK.LARGE,
        paddingHorizontal: SPACING.GUTTER,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        fontSize: 24,
        color: COLORS.RITUAL_WHITE,
    },
    actionLabel: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    dataCard: {
        marginHorizontal: SPACING.GUTTER,
        marginBottom: SPACING.STACK.LARGE,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        color: COLORS.RITUAL_WHITE,
        opacity: 0.5,
        fontSize: 10,
        letterSpacing: 2,
    },
    value: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
    },
    tag: {
        backgroundColor: COLORS.ELECTRIC_COBALT,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    aiButton: {
        marginHorizontal: SPACING.GUTTER,
        height: 56,
        backgroundColor: COLORS.ELECTRIC_COBALT,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: SPACING.RADIUS.SMALL,
    },
    aiButtonText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    toast: {
        position: 'absolute',
        bottom: 100, // Above the bottom content
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 9999,
        elevation: 100, // Ensure visibility on Android
        alignItems: 'center',
        justifyContent: 'center',
    },
    toastBlur: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        opacity: 0.9,
    },
    toastText: {
        color: COLORS.RITUAL_WHITE,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Delete Overlay
    deleteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    deleteCancelZone: {
        flex: 1,
        width: '100%',
    },
    deleteContainer: {
        width: '100%',
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    deleteTitle: {
        color: COLORS.FAILURE_ONLY,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    deleteSub: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        marginBottom: 30,
    },
    sliderTrack: {
        backgroundColor: 'rgba(255,59,48,0.2)', // Red tint
        borderRadius: 60,
        justifyContent: 'center',
        padding: 5,
        position: 'relative',
        marginBottom: 20,
    },
    sliderText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: COLORS.FAILURE_ONLY,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        zIndex: -1,
    },
    sliderKnob: {
        backgroundColor: COLORS.FAILURE_ONLY,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    knobIcon: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        letterSpacing: 1,
    }
});
