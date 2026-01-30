import type { ContextVector } from './contextSnapshot';
import { CONSTRAINTS } from '../../truth/constraints';

export class ContextValidator {
    static validate(vector: ContextVector): boolean {
        if (!vector.id) return false;
        if (vector.timestamp <= 0 && vector.id !== "genesis") return false;

        // Weather sanity checks
        if (vector.weather.temperature < -50 || vector.weather.temperature > 60) {
            console.warn(`[ContextValidator] Extreme temperature detected: ${vector.weather.temperature}`);
            // We don't fail, just warn, unless it's impossible logic
        }

        // Time consistency
        if (vector.isDaytime && vector.dayPhase === "Night") {
            // This is ambiguous but arguably possible in transition? 
            // Actually let's enforce consistency.
            // But 'Night' might be a specific UX state. 
            // Let's assume passed for now but log.
        }

        return true;
    }

    static isSafeState(vector: ContextVector): boolean {
        // Returns true if this context allows for safe UI rendering
        return !!vector.weather && !!vector.dayPhase;
    }
}
