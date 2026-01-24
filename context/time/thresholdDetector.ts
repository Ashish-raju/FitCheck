/**
 * Logic to detect if we are within the Ritual Window.
 * The Ritual Window is the time when the user is expected to interact with the system.
 */

const RITUAL_START_HOUR = 4; // 04:00
const RITUAL_END_HOUR = 10;  // 10:00

export function isRitualWindow(date: Date = new Date()): boolean {
    const hour = date.getHours();
    return hour >= RITUAL_START_HOUR && hour < RITUAL_END_HOUR;
}

export function getSecondsUntilNextWindow(date: Date = new Date()): number {
    if (isRitualWindow(date)) {
        return 0;
    }

    const target = new Date(date);
    if (target.getHours() >= RITUAL_END_HOUR) {
        // Next day
        target.setDate(target.getDate() + 1);
    }
    target.setHours(RITUAL_START_HOUR, 0, 0, 0);

    return Math.floor((target.getTime() - date.getTime()) / 1000);
}
