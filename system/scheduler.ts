import { InteractionManager } from 'react-native';

/**
 * MARKET STANDARD: Time-Slicing Scheduler
 * 
 * This class ensures that heavy computational tasks (like outfit generation)
 * never block the UI thread for longer than a specific "Time Budget" (default 8ms).
 * 
 * It breaks a massive loop into tiny "units of work" and yields control
 * back to React Native's bridge every few milliseconds.
 */

type TaskGenerator<T> = Generator<void, T, void>;

export class SystemScheduler {
    // 8ms budget leaves ~8ms for React Rendering to maintain 60fps (16ms total frame)
    private static FRAME_BUDGET_MS = 8;

    /**
     * Runs a generator function with time-slicing.
     * The generator should yield regularly.
     */
    static async run<T>(
        taskName: string,
        generator: TaskGenerator<T>
    ): Promise<T> {
        console.log(`[Scheduler] Starting task: ${taskName}`);

        return new Promise((resolve, reject) => {
            let start = performance.now();

            const step = () => {
                try {
                    // Execute chunks until budget is exhausted
                    let result;
                    const frameStart = performance.now();

                    do {
                        result = generator.next();
                        // If done, resolve and exit
                        if (result.done) {
                            const totalTime = performance.now() - start;
                            console.log(`[Scheduler] Task '${taskName}' finished in ${totalTime.toFixed(1)}ms`);
                            resolve(result.value);
                            return;
                        }
                    } while (performance.now() - frameStart < this.FRAME_BUDGET_MS);

                    // Budget exhausted for this frame. Yield to UI.
                    // We use runAfterInteractions to check if user is touching screen,
                    // or setImmediate/setTimeout to just hit next tick.

                    // "Fast Yield" - Schedule next chunk ASAP
                    setTimeout(step, 0);

                } catch (e) {
                    console.error(`[Scheduler] Task '${taskName}' failed:`, e);
                    reject(e);
                }
            };

            // Kick off the first step
            step();
        });
    }
}
