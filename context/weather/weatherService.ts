import { Context } from '../../truth/types';
import { WeatherCache } from './weatherCache';
import { WeatherNormalizer } from './weatherNormalizer';

export class WeatherService {
    /**
     * Returns the best available weather immediately.
     * Never waits for network.
     * Triggers background refresh if stale.
     */
    static getWeatherSignal(): Context {
        // 1. Try Cache
        const cached = WeatherCache.get();
        if (cached) {
            return cached;
        }

        // 2. Return Fallback immediately (Safe Fallback Always)
        // trigger background fetch
        this.fetchInBackground();

        return WeatherNormalizer.normalize(null); // Returns safe default
    }

    private static async fetchInBackground() {
        try {
            // Mock API call - in real firewall this hits a specific safe endpoint
            // For now, simulate latency and success
            await new Promise(resolve => setTimeout(resolve, 500));

            // Simulating a response
            const simulatedResponse = {
                tempC: 22,
                conditionCode: "Clear",
                isDay: 1
            };

            const normalized = WeatherNormalizer.normalize(simulatedResponse);
            WeatherCache.set(normalized);

            // In a real system, we might emit an event here if the context changed drastically
            // But ContextManager usually polls or we'd call ContextManager.update() here
            // However, requirements say "Never logic" inside hardware/context? 
            // The service just provides data. 
            // The binder/consumer pulls it.

        } catch (e) {
            // Squelch errors - weather failure must be silent
            console.warn("[WeatherService] Background fetch failed (silent)", e);
        }
    }
}
