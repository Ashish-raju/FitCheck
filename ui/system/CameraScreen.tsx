import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { GarmentIngestionService } from '../../system/ingestion/GarmentIngestionService';

export const CameraScreen: React.FC = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const scanAnim = React.useRef(new Animated.Value(0)).current;
    const shutterFlash = React.useRef(new Animated.Value(0)).current;
    const cameraRef = React.useRef<CameraView>(null);

    // Lifecycle Guards
    const isFocused = useIsFocused();
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        let hapticInterval: any;
        if (isProcessing && isFocused) {
            hapticInterval = setInterval(() => {
                Haptics.selectionAsync();
            }, 300);

            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                    Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            scanAnim.stopAnimation();
            if (hapticInterval) clearInterval(hapticInterval);
        }
        return () => hapticInterval && clearInterval(hapticInterval);
    }, [isProcessing, isFocused]);

    const takePicture = async () => {
        if (isProcessing) return;
        if (!cameraRef.current) return;

        // Prevent double triggers
        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Flash Animation
        shutterFlash.setValue(1);
        Animated.timing(shutterFlash, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        try {
            let capturedUri: string | undefined;

            // 1. Capture Logic
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: false,
                exif: false
            });
            capturedUri = photo?.uri;

            if (!capturedUri) throw new Error("Failed to capture image URI");
            if (!isMounted.current) return;

            // 2. Mockable Ingestion with TIMEOUT Guard
            // If Ingestion/AI takes too long, we fail gracefully rather than hanging forever.
            const ingestionPromise = GarmentIngestionService.getInstance().createDraftItem(capturedUri);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Analysis Timed Out")), 8000)
            );

            const draftItem = await Promise.race([ingestionPromise, timeoutPromise]);

            if (!isMounted.current) return;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Navigate safely
            setTimeout(() => {
                if (isMounted.current) {
                    ritualMachine.toItemPreview(draftItem);
                }
            }, 100);

        } catch (error) {
            console.error('[CameraScreen] Capture/Ingestion Failed:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            // Alert user if needed, or just reset
            if (isMounted.current) {
                // Optional: Show toast/alert here
            }
        } finally {
            if (isMounted.current) {
                setIsProcessing(false);
            }
        }
    };

    // If we don't have permission info yet, render empty
    if (!permission) return <View style={styles.container} />;

    // STRICT Permission Gate
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Vision access required for garment ingestion.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
                    <Text style={styles.grantText}>GRANT ACCESS</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => ritualMachine.toWardrobe()} style={{ marginTop: 20 }}>
                    <Text style={[styles.closeText, { fontSize: 16 }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Unmount camera when not focused to prevent background resource usage / freezes
    if (!isFocused) {
        return <View style={styles.container} />;
    }

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
                <Animated.View
                    pointerEvents="none"
                    style={[styles.shutterFlash, { opacity: shutterFlash }]}
                />
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => ritualMachine.toWardrobe()}>
                        <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>

                    <View style={styles.guideContainer}>
                        <View style={styles.guideBox}>
                            {isProcessing && (
                                <Animated.View
                                    style={[
                                        styles.scanLine,
                                        {
                                            transform: [{
                                                translateY: scanAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 300]
                                                })
                                            }]
                                        }
                                    ]}
                                />
                            )}
                        </View>
                        <Text style={styles.guideText}>
                            {isProcessing ? "ANALYZING STRUCTURE..." : "ALIGN GARMENT"}
                        </Text>
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={[styles.captureButton, isProcessing && styles.captureDisabled]}
                            onPress={takePicture}
                            disabled={isProcessing}
                        >
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    shutterFlash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: MATERIAL.TEXT_MAIN,
        zIndex: 10,
    },
    container: {
        flex: 1,
        backgroundColor: MATERIAL.BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        padding: SPACING.GUTTER,
    },
    closeButton: {
        marginTop: 40,
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    closeText: {
        color: MATERIAL.TEXT_MAIN,
        fontSize: 24,
        fontWeight: '200',
    },
    guideContainer: {
        alignItems: 'center',
    },
    guideBox: {
        width: 280,
        height: 350,
        borderWidth: 1,
        borderColor: MATERIAL.BORDER,
        borderRadius: SPACING.RADIUS.MEDIUM,
        overflow: 'hidden',
    },
    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        shadowColor: COLORS.ELECTRIC_BLUE,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    guideText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: MATERIAL.TEXT_MAIN,
        letterSpacing: 2,
        marginTop: 20,
        opacity: 0.6,
    },
    controls: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 4,
        borderColor: MATERIAL.TEXT_MAIN,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureDisabled: {
        opacity: 0.3,
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: MATERIAL.TEXT_MAIN,
    },
    permissionText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: MATERIAL.TEXT_MAIN,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.6,
    },
    grantButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        borderRadius: SPACING.RADIUS.MEDIUM,
    },
    grantText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: MATERIAL.TEXT_MAIN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        letterSpacing: 1,
    }
});
