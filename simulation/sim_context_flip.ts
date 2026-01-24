import { ContextManager } from '../context/kernel/contextManager.ts';
import { EngineBinder } from '../bridge/engineBinder.ts';

async function runSimulation() {
    console.log("--- SIMULATION: CONTEXT FLIP GATE 4 ---");

    // Bind Engine
    // Mock Inventory for Binder
    EngineBinder.bind({ pieces: {}, outfits: {} } as any);

    const cm = ContextManager.getInstance();

    // Flip 50 times
    for (let i = 0; i < 50; i++) {
        const isRain = Math.random() > 0.5;
        const temp = Math.floor(Math.random() * 40) - 5;

        try {
            cm.update({
                weather: {
                    condition: isRain ? "Rain" : "Clear",
                    temperature: temp,
                    occasion: "Simulated"
                }
            });

            const current = cm.getCurrent();
            if (current.weather.temperature !== temp) {
                throw new Error("Context update mismatch");
            }
        } catch (e) {
            console.error("Context Crash at iteration " + i);
            throw e;
        }
    }

    console.log("PASS: 50 Context Flips survived.");
    console.log("--- SIMULATION COMPLETE: ALL PASS ---");
}

runSimulation().catch(e => {
    console.error(e);
    process.exit(1);
});
