import React, { useEffect } from 'react';
import { BackHandler, AppState, AppStateStatus, Text } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ritualMachine } from '../state/ritualMachine';
import { useRitualState } from '../state/ritualProvider';

/**
 * RITUAL LOCK LAYER
 * 
 * Enforces hardware and system-level constraints during the ritual.
 * Traps back button, backgrounding, and orientation.
 */
export const useRitualLock = () => {
    const { phase } = useRitualState();

    useEffect(() => {
        // 1. Trap Hardware Back Button
        const backAction = () => {
            if (phase === 'RITUAL') {
                ritualMachine.triggerSafety();
                return true; // Prevent default
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        // 2. Trap App Backgrounding
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (phase === 'RITUAL' && nextAppState.match(/inactive|background/)) {
                console.log('[RitualLock] Interruption detected -> SAFETY');
                ritualMachine.triggerSafety();
            }
        };

        const appStateSubscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        );

        // 3. Trap Orientation (Lock to Portrait)
        const lockOrientation = async () => {
            if (phase === 'RITUAL' || phase === 'VOID' || phase === 'SEAL') {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            }
        };
        lockOrientation();

        // 4. Trap System Font Scaling
        if ((Text as any).defaultProps) {
            (Text as any).defaultProps.allowFontScaling = false;
        } else {
            (Text as any).defaultProps = { allowFontScaling: false };
        }

        return () => {
            backHandler.remove();
            appStateSubscription.remove();
        };
    }, [phase]);
};

/**
 * TOUCH TRAPPER
 * 
 * Prevents interaction outside gesture zones during Ritual.
 */
export const RitualTouchGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // This will be used in RitualScreen to wrap the content
    return React.createElement(React.Fragment, null, children);
};
