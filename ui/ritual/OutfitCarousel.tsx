import React from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Outfit } from '../../truth/types';
import { CandidateStage } from './CandidateStage';
import * as Haptics from 'expo-haptics';
import { FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';

const { width } = Dimensions.get('window');

interface OutfitCarouselProps {
    outfits: Outfit[];
    onIndexChange: (index: number) => void;
}

export const OutfitCarousel: React.FC<OutfitCarouselProps> = ({ outfits, onIndexChange }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={outfits}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onIndexChange(index);
                }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <CandidateStage outfit={item} userId={FIREBASE_AUTH.currentUser?.uid || ''} />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
