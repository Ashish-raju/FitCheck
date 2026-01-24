export const RitualLatency = {
    interactionStart: 0,

    startInteraction() {
        this.interactionStart = Date.now();
    },

    recordVeto() {
        const d = Date.now() - this.interactionStart;
        console.log(`[Metrics] VETO Latency: ${d}ms`);
    },

    recordSeal() {
        const d = Date.now() - this.interactionStart;
        console.log(`[Metrics] SEAL Latency: ${d}ms`);
    }
};
