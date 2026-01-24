import { Chronos } from '../context/time/chronos.ts';
import { RitualWindow } from '../context/time/ritualWindow.ts';
import { DayBoundary } from '../context/time/dayBoundary.ts';

async function runSimulation() {
    console.log("--- SIMULATION: TIME TRAVEL GATE 4 ---");

    // 1. Establish Baseline (Reset Chronos)
    Chronos._reset();
    const dayBoundary = new DayBoundary();

    // 2. Set Time to 11:00 AM (Locked)
    console.log("-> Jump to 11:00 AM (Locked Zone)");
    const today11am = new Date();
    today11am.setHours(11, 0, 0, 0);
    Chronos._setOffset(today11am.getTime() - Date.now());

    if (!RitualWindow.isLocked()) throw new Error("FAIL: 11 AM should be Locked");
    if (RitualWindow.isWithinWindow()) throw new Error("FAIL: 11 AM is not in window");
    console.log("PASS: 11 AM is Locked.");

    // 3. Set Time to 5:00 AM (Ritual Window)
    console.log("-> Jump to 5:00 AM (Ritual Zone)");
    const today5am = new Date();
    today5am.setHours(5, 0, 0, 0);
    Chronos._setOffset(today5am.getTime() - Date.now());

    if (RitualWindow.isLocked()) throw new Error("FAIL: 5 AM should be Unlocked (Windows implies unlocked for ritual)");
    if (!RitualWindow.isWithinWindow()) throw new Error("FAIL: 5 AM should be in window");
    console.log("PASS: 5 AM is Ritual Window.");

    // 4. Force New Day Boundary
    console.log("-> Jump to Next Day 4:01 AM (Boundary Crossing)");
    const tomorrow4am = new Date();
    tomorrow4am.setDate(tomorrow4am.getDate() + 1);
    tomorrow4am.setHours(4, 1, 0, 0);

    // We need to verify DayBoundary sees the cross.
    // Ideally we simulate a sequence: 11PM -> 4:01AM
    // Let's set it to 11PM today first
    const today11pm = new Date();
    today11pm.setHours(23, 0, 0, 0);
    Chronos._setOffset(today11pm.getTime() - Date.now());
    dayBoundary.hasCrossedBoundary(); // Update internal state to 11PM

    // Now jump to tomorrow 4:01 AM
    Chronos._setOffset(tomorrow4am.getTime() - Date.now());

    if (!dayBoundary.hasCrossedBoundary()) {
        throw new Error("FAIL: Did not detect day boundary crossing from 11PM to 4AM next day");
    }
    console.log("PASS: Day Boundary Detected.");

    console.log("--- SIMULATION COMPLETE: ALL PASS ---");
}

runSimulation().catch(e => {
    console.error(e);
    process.exit(1);
});
