import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface Props {
    imageUri: string;
    maskUri: string; // The initial mask (transparent png)
    onConfirm: (finalUri: string) => void;
    onCancel: () => void;
}

export const SegmentationCorrectionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as Props | undefined;
    const { imageUri, maskUri } = params || {};

    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('');

    // Basic drawing logic using PanResponder
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            setCurrentPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
            setPaths((prev) => [...prev, currentPath]);
            setCurrentPath('');
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Adjust Edges</Text>
                <Text style={styles.subtitle}>Paint over areas to restore</Text>
            </View>

            <View style={styles.editorContainer} {...panResponder.panHandlers}>
                {/* Background Layer: Original Image (dimmed) */}
                <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} resizeMode="contain" />

                {/* Foreground Layer: The Masked Result */}
                <Image source={{ uri: maskUri }} style={StyleSheet.absoluteFill} resizeMode="contain" />

                {/* Drawing Layer: SVG Overlay */}
                <Svg style={StyleSheet.absoluteFill}>
                    {paths.map((d, i) => (
                        <Path key={i} d={d} stroke="rgba(0, 255, 0, 0.5)" strokeWidth={20} fill="none" />
                    ))}
                    <Path d={currentPath} stroke="rgba(0, 255, 0, 0.5)" strokeWidth={20} fill="none" />
                </Svg>
            </View>

            <View style={styles.toolbar}>
                <TouchableOpacity style={styles.buttonCancel} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonConfirm} onPress={() => {
                    // In a real implementation, we would flatten the SVG onto the mask here.
                    // For now, we just pass back the original mask.
                    navigation.goBack();
                }}>
                    <Text style={styles.buttonTextMain}>Confirm Mask</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.GUTTER,
        paddingBottom: 20,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 24,
        color: COLORS.RITUAL_WHITE,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.ASH_GRAY,
        marginTop: 4,
    },
    editorContainer: {
        flex: 1,
        backgroundColor: '#000', // Checkerboard ideally
    },
    toolbar: {
        padding: SPACING.GUTTER,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    buttonCancel: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    buttonConfirm: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: COLORS.ELECTRIC_BLUE,
    },
    buttonText: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: '600',
    },
    buttonTextMain: {
        color: '#000',
        fontWeight: '700',
    }
});
