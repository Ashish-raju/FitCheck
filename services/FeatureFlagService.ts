export const FeatureFlagService = {
    // TOGGLES
    NEW_ENGINE_ENABLED: true,      // LIVE: The new brain is active.
    PARALLEL_RUN: false,            // Safe: Runs new engine in background for comparisons
    ENGINE_STRICT_MODE: false,      // If true, enforces stricter confidence thresholds
    ENGINE_DEBUG_LOGGING: true,     // DEV: Verbose logging for debugging

    /**
     * Check if we should use the new Outfit Engine
     */
    useNewEngine: (): boolean => {
        return FeatureFlagService.NEW_ENGINE_ENABLED;
    },

    /**
     * Check if we should run the new engine in shadow mode
     */
    shouldRunParallel: (): boolean => {
        return FeatureFlagService.PARALLEL_RUN && !FeatureFlagService.NEW_ENGINE_ENABLED;
    },

    /**
     * Check if strict mode is enabled
     */
    isStrictMode: (): boolean => {
        return FeatureFlagService.ENGINE_STRICT_MODE;
    },

    /**
     * Check if debug logging is enabled
     */
    isDebugMode: (): boolean => {
        return FeatureFlagService.ENGINE_DEBUG_LOGGING && __DEV__;
    }
};
