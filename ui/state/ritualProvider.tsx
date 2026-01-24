import React, { createContext, useContext, useEffect, useState } from 'react';
import { UIState, INITIAL_STATE } from './uiState';
export type { UIState };
import { ritualMachine } from './ritualMachine';

/**
 * RITUAL PROVIDER
 * 
 * Binds the RitualMachine to React.
 * This is the ONLY way components read state.
 */

const RitualContext = createContext<UIState>(INITIAL_STATE);

export const RitualProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<UIState>(ritualMachine.getState());

    useEffect(() => {
        const unsubscribe = ritualMachine.subscribe((newState) => {
            setState(newState);
        });
        return unsubscribe;
    }, []);

    return (
        <RitualContext.Provider value={state}>
            {children}
        </RitualContext.Provider>
    );
};

export const useRitualState = () => useContext(RitualContext);

// Expose actions via a separate hook or just generic exports
// For strict "Authority", components should perhaps call the machine directly for actions
// and use this hook only for reading.
export const useRitualActions = () => {
    return {
        setSwipe: (d: 'LEFT' | 'RIGHT' | 'DOWN' | 'NONE') => ritualMachine.setSwipe(d),
        // enterRitual and sealRitual are typically driven by Engine events, not UI components directly,
        // (except Seal which is triggered by user selection).
    };
};
