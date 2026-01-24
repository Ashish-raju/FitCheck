import { FadeIn, SlideInDown } from 'react-native-reanimated';
import { MOTION } from '../tokens/motion.tokens';

export const useScreenEnter = (index: number = 0, type: 'fade' | 'slide' = 'fade') => {
    const delay = index * 50; // Standard stagger

    if (type === 'slide') {
        return SlideInDown
            .duration(MOTION.DURATIONS.MEDIUM)
            .delay(delay)
            .springify()
            .damping(MOTION.PHYSICS.SPRING_SNAPPY.damping)
            .stiffness(MOTION.PHYSICS.SPRING_SNAPPY.stiffness);
    }

    return FadeIn
        .duration(MOTION.DURATIONS.SNAPPY)
        .delay(delay);
};
