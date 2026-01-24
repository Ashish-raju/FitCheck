import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Category } from '../../truth/types';

interface MannequinOverlayProps {
    imageUri?: string;
    processedImageUri?: string;
    category: Category;
    style?: ViewStyle;
    color?: string;
}

export const MannequinOverlay: React.FC<MannequinOverlayProps> = ({
    imageUri,
    processedImageUri,
    category,
    style,
    color = '#CCCCCC'
}) => {
    // If we have a processed image, we use the Mannequin base + Overlay
    // If not, we fall back to just showing the original image (pre-processing or failed)

    // NOTE: This assumes mannequin_base.png is transparent and positioned for standard overlays.
    // In a real app, we might need different mannequins for Top vs Bottom or complex z-indexing.
    // For V1, we overlay the item on top.

    // For Tops: positioned upper body
    // For Bottoms: positioned lower body
    // For now, we center it and let the user's photo crop do the work, or assume standard framing.

    const finalImage = processedImageUri || imageUri;
    const isProcessed = !!processedImageUri;

    if (!finalImage) {
        return <View style={[styles.fallbackBox, { backgroundColor: color }, style]} />;
    }

    if (!isProcessed) {
        return (
            <View style={[styles.container, style]}>
                <Image
                    source={{ uri: finalImage }}
                    style={styles.fullImage}
                    resizeMode="cover"
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {/* Base Mannequin */}
            <Image
                source={require('../../assets/mannequin_base.png')}
                style={styles.mannequin}
                resizeMode="contain"
            />

            {/* Garment Overlay */}
            {/* 
               We adjust position based on category if needed, but standard 
               "center over mannequin" logic is a good start if the API returns trimmed images.
            */}
            <Image
                source={{ uri: finalImage }}
                style={[
                    styles.garment,
                    category === 'Top' && styles.topStyle,
                    category === 'Bottom' && styles.bottomStyle,
                    category === 'Shoes' && styles.shoesStyle,
                ]}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    fallbackBox: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    mannequin: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        zIndex: 1,
        opacity: 0.9,
    },
    garment: {
        width: '100%',
        height: '100%',
        zIndex: 2,
    },
    // Heuristic positioning if the processed image is tightly cropped
    // If remove.bg preserves original canvas size, these aren't needed. 
    // Assuming remove.bg "auto" size mode crops to content. 
    // We might need to adjust "size" param in service to "full" to keep alignment simplified.
    // Let's assume for now it fits well or we tweak styles.
    topStyle: {
        // top specifics
    },
    bottomStyle: {
        // bottom specifics
    },
    shoesStyle: {
        // shoes specifics
    }
});
