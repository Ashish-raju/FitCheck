import React, { createContext, useContext, useMemo } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';

interface BackgroundContextType {
    scrollY: SharedValue<number>;
    panX: SharedValue<number>;
    panY: SharedValue<number>;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const scrollY = useSharedValue(0);
    const panX = useSharedValue(0);
    const panY = useSharedValue(0);

    const value = useMemo(() => ({
        scrollY,
        panX,
        panY
    }), [scrollY, panX, panY]);

    return (
        <BackgroundContext.Provider value={value}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackgroundMotion = () => {
    const context = useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackgroundMotion must be used within a BackgroundProvider');
    }
    return context;
};

import { useAnimatedScrollHandler } from 'react-native-reanimated';

export const useBackgroundScrollHandler = () => {
    const { scrollY } = useBackgroundMotion();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return scrollHandler;
};
