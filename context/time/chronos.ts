export class Chronos {
    // Allows for time-travel simulation
    private static offsetMs = 0;

    static now(): number {
        return Date.now() + this.offsetMs;
    }

    static getHour(): number {
        const d = new Date(this.now());
        return d.getHours();
    }

    static getDayStartTimestamp(): number {
        const d = new Date(this.now());
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    // Simulation Only
    static _setOffset(ms: number) {
        this.offsetMs = ms;
    }

    static _reset() {
        this.offsetMs = 0;
    }
}
