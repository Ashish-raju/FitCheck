import React from 'react';
import { Image, ImageStyle, StyleProp, View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { COLORS } from '../tokens/color.tokens';

interface SmartImageProps {
    source: { uri: string } | number;
    style?: StyleProp<ImageStyle>;
    contentFit?: 'cover' | 'contain' | 'fill';
    transition?: number;
    priority?: 'low' | 'normal' | 'high';
}

/**
 * SmartImage - Performance optimized image component.
 * Uses expo-image for caching, downsampling, and off-main-thread decoding.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
    source,
    style,
    contentFit = 'cover',
    transition = 200, // Quick fade in
    priority = 'normal'
}) => {
    // If no URI, show placeholder
    if (typeof source === 'object' && !source.uri) {
        return <View style={[style, styles.placeholder]} />;
    }

    return (
        <ExpoImage
            source={source}
            style={style}
            contentFit={contentFit}
            transition={transition}
            cachePolicy="memory-disk"
            priority={priority}
        />
    );
};

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: COLORS.SUBTLE_GRAY,
    }
});
