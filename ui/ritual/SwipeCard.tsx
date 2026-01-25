import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CandidateStage } from './CandidateStage';
import { Outfit } from '../../truth/types';

interface SwipeCardProps {
    item: Outfit;
    userId: string;
    priority: 'low' | 'normal' | 'high';
}

export const SwipeCard = React.memo(({ item, userId, priority }: SwipeCardProps) => {
    return (
        <View style={styles.cardContainer} pointerEvents="box-none">
            <CandidateStage
                outfit={item}
                userId={userId}
                priority={priority}
            />
        </View>
    );
}, (prev, next) => {
    return (
        prev.item.id === next.item.id &&
        prev.priority === next.priority
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        ...StyleSheet.absoluteFillObject,
    },
});
