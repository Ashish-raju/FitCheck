import { Context } from '../../truth/types';

interface CacheEntry {
    data: Context;
    timestamp: number;
}

export class WeatherCache {
    private static readonly KEY = "FIREWALL_WEATHER_CACHE";
    private static readonly TTL_MS = 30 * 60 * 1000; // 30 minutes

    static get(): Context | null {
        // In a real app we might use AsyncStorage, but for now in-memory or mock is fine.
        // Assuming this runs in an environment where we might stick to simple memory first 
        // or if explicitly requested persistence, we'd add it. 
        // Given constraints "Never blocks UI", memory is fastest. 
        // But for persistence across reloads we'd want storage. 
        // Let's assume in-memory for the 'nervous system' session for now, 
        // relying on re-fetch on boot if needed, or fallback.

        // Actually, let's implement a simple in-memory cache for this class.
        if (!this.memoryCache) return null;

        if (Date.now() - this.memoryCache.timestamp > this.TTL_MS) {
            this.memoryCache = null;
            return null;
        }

        return this.memoryCache.data;
    }

    static set(data: Context) {
        this.memoryCache = {
            data,
            timestamp: Date.now()
        };
    }

    private static memoryCache: CacheEntry | null = null;
}
