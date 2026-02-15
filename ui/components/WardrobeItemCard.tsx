import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
// import { Image } from 'expo-image';
import { SmartImage } from '../primitives/SmartImage';
import { GlassCard } from '../primitives/GlassCard';
import { ShiningBorder } from '../primitives/ShiningBorder';
import { TYPOGRAPHY } from '../tokens';
import { COLORS } from '../tokens/color.tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WardrobeItemCardProps {
    item: any;
    onPress?: () => void;
    width: number;
    height: number;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = memo(({
    item,
    onPress,
    width,
    height
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, animatedStyle, { width, height }]}
        >
            <GlassCard noPadding style={styles.card}>
                <ShiningBorder style={{ ...StyleSheet.absoluteFillObject }}>
                    {null}
                </ShiningBorder>

                <View style={styles.content}>
                    <View style={styles.imageWrapper}>
                        {item.imageUri ? (
                            <SmartImage
                                source={typeof item.imageUri === 'string' ? { uri: item.imageUri } : item.imageUri}
                                style={styles.image}
                                contentFit="contain"
                                transition={50}
                            />
                        ) : (
                            <View style={[styles.image, { backgroundColor: item.color || '#333' }]} />
                        )}
                    </View>

                    <View style={styles.textGroup}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.subtitle}>
                            {item.subtype ? item.subtype.toUpperCase() : item.category} • {item.wornCount ?? 0} worn
                        </Text>
                    </View>
                </View>
            </GlassCard>
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 20, // Matched vertical gap
        // Width/Height injected via style prop
    },
    card: {
        flex: 1, // Fill the specific height
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: 'rgba(20, 20, 22, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center', // Fix top-heaviness
        padding: 12,
    },
    imageWrapper: {
        height: '58%', // Fixed height ratio
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '100%',
        transform: [{ translateY: 0 }],
    },
    textGroup: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        letterSpacing: 0.5,
    }
});
