import { Context } from '../../truth/types';

// Loose type for raw API response or untrusted input
export interface RawWeatherData {
    tempC?: number;
    conditionCode?: string; // e.g., "sunny", "rain", "heavy-snow"
    isDay?: number;
}

export class WeatherNormalizer {
    static normalize(raw: RawWeatherData | null): Context {
        // Safe Fallback Default
        const fallback: Context = {
            temperature: 20,
            condition: "Clear",
            occasion: "Standard"
        };

        if (!raw) return fallback;

        return {
            temperature: this.sanitizeTemp(raw.tempC),
            condition: this.mapCondition(raw.conditionCode),
            occasion: "Standard" // Occasion is usually user-defined or inferred from complexity, default to Standard
        };
    }

    private static sanitizeTemp(t: number | undefined): number {
        if (typeof t !== 'number' || isNaN(t)) return 20;
        // Clamp to survive
        return Math.max(-100, Math.min(60, t));
    }

    private static mapCondition(code: string | undefined): Context["condition"] {
        if (!code) return "Clear";
        const c = code.toLowerCase();

        if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) return "Rain";
        if (c.includes("snow") || c.includes("ice") || c.includes("blizzard")) return "Snow";
        if (c.includes("cloud") || c.includes("overcast") || c.includes("fog") || c.includes("mist")) return "Cloudy";

        return "Clear";
    }
}
