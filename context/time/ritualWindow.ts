import { Chronos } from './chronos';

export class RitualWindow {
    // 4 AM to 10 AM
    static readonly WINDOW_START_HOUR = 4;
    static readonly WINDOW_END_HOUR = 10;

    static isWithinWindow(): boolean {
        const hour = Chronos.getHour();
        return hour >= this.WINDOW_START_HOUR && hour < this.WINDOW_END_HOUR;
    }

    static isLocked(): boolean {
        return !this.isWithinWindow();
    } // 18-hour lock implied by the 6-hour window

    static getMinutesRemaining(): number {
        if (!this.isWithinWindow()) return 0;

        const now = Chronos.now();
        const d = new Date(now);
        // Target is today at END_HOUR
        const distinctTarget = new Date(now);
        distinctTarget.setHours(this.WINDOW_END_HOUR, 0, 0, 0);

        const diffMs = distinctTarget.getTime() - now;
        return Math.floor(diffMs / 1000 / 60);
    }
}
