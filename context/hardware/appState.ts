/**
 * Pure signal adapter for AppState.
 * Wraps React Native AppState.
 */
export type ApplicationState = 'active' | 'background' | 'inactive';

export class AppStateSignal {
    private static currentState: ApplicationState = 'active';

    static getState(): ApplicationState {
        return this.currentState;
    }

    static isActive(): boolean {
        return this.currentState === 'active';
    }

    // Called by the root component or bridge
    static _update(state: ApplicationState) {
        this.currentState = state;
    }
}
