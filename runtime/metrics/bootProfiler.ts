export const BootProfiler = {
    startTime: 0,
    endTime: 0,

    startBoot() {
        this.startTime = Date.now();
        console.log('[Metrics] Boot Timer Started');
    },

    endBoot() {
        this.endTime = Date.now();
        const duration = this.endTime - this.startTime;
        console.log(`[Metrics] BOOT COMPLETE. Duration: ${duration}ms`);
        return duration;
    }
};
