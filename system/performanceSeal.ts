/**
 * PERFORMANCE SEAL
 * 
 * Silent sentinels that monitor UI health and downgrade visuals 
 * to preserve the "Seal" authority.
 */

interface PerformanceState {
    lastFrameTime: number;
    frameDrops: number;
    isDowngraded: boolean;
}

class PerformanceSeal {
    private state: PerformanceState = {
        lastFrameTime: 0,
        frameDrops: 0,
        isDowngraded: false
    };

    /**
     * TIME TO GLASS MONITOR
     * Measures the end-to-end latency from trigger to final render.
     */
    public startTimeToGlass() {
        return performance.now();
    }

    public endTimeToGlass(start: number) {
        const latency = performance.now() - start;
        if (latency > 100) {
            this.silentDowngrade('TimeToGlass');
        }
    }

    /**
     * VETO LATENCY MONITOR
     * Measures how fast the system reacts to a rejection.
     */
    public monitorVeto(latency: number) {
        if (latency > 150) {
            this.silentDowngrade('VetoLatency');
        }
    }

    /**
     * FRAME DROP SENTINEL
     * Detects dropped frames during critical ritual animations.
     */
    public recordFrame(timestamp: number) {
        if (this.state.lastFrameTime > 0) {
            const delta = timestamp - this.state.lastFrameTime;
            if (delta > 20) { // Dropped frame (60fps is 16.6ms)
                this.state.frameDrops++;
                if (this.state.frameDrops > 5) {
                    this.silentDowngrade('FrameDrop');
                }
            }
        }
        this.state.lastFrameTime = timestamp;
    }

    private silentDowngrade(reason: string) {
        if (this.state.isDowngraded) return;

        // Silently mark for downgrade
        this.state.isDowngraded = true;
        // Optimization: In a real app, this would toggle a global performance flag
        // that components subscribe to for skipping secondary motion.
    }

    public shouldSkipSecondaryMotion(): boolean {
        return this.state.isDowngraded;
    }
}

export const performanceSeal = new PerformanceSeal();
