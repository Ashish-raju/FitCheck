import { Chronos } from './chronos.ts';
import { RitualWindow } from './ritualWindow.ts';

export class DayBoundary {
    private lastCheckTime: number;

    constructor() {
        this.lastCheckTime = Chronos.now();
    }

    /**
     * Checks if we have crossed the ritual boundary (4 AM) since the last check.
     * This signals a "New Day" for the organism.
     */
    hasCrossedBoundary(): boolean {
        const now = Chronos.now();
        const last = this.lastCheckTime;

        const lastDate = new Date(last);
        const nowDate = new Date(now);

        // Simple check: Different days?
        // Actually, strictly we care if we passed 4 AM.
        // If last < Today 4AM <= Now -> Crossed.

        // Construct today's 4 AM
        const todayBoundary = new Date(now);
        todayBoundary.setHours(RitualWindow.WINDOW_START_HOUR, 0, 0, 0);
        const boundaryTime = todayBoundary.getTime();

        // If 'now' is past 4am today, AND 'last' was before 4am today (or yesterday).
        // Case 1: Same day, last was 3am, now is 5am. Crossed.
        // Case 2: Different day. Last was yesterday. Now is today. Crossed.

        let crossed = false;

        if (now >= boundaryTime && last < boundaryTime) {
            crossed = true;
        } else if (nowDate.getDate() !== lastDate.getDate()) {
            // Different calendar day.
            // If now is past 4am, definitely crossed a boundary somewhere (either today's or yesterday's).
            if (now >= boundaryTime) {
                crossed = true;
            } else {
                // It's 2 AM on new day. Boundary is at 4 AM. 
                // Last check was 11 PM yesterday. Be careful.
                // We haven't crossed Today's 4 AM yet.
                // Did we cross Yesterday's 4 AM? Yes, but that probably happened long ago.
                // We want to detect the *fresh* crossing.

                // If we are in the pre-dawn hours of a new day, we haven't crossed the ritual line yet for *this* day.
                // So actually, false. The "New Day" for the firewall starts at 4 AM.
                crossed = false;
            }
        }

        this.lastCheckTime = now;
        return crossed;
    }
}
