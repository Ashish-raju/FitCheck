import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * EMERGENCY: Clear all inventory data
 * Run this if you need to force a fresh start
 */
export async function clearAllInventoryData() {
    const keys = [
        '@fit_check_inventory_v1',
        '@fit_check_inventory_v2',
        '@fit_check_inventory_v3',
    ];

    for (const key of keys) {
        try {
            await AsyncStorage.removeItem(key);
            console.log(`[ClearData] Removed ${key}`);
        } catch (e) {
            console.error(`[ClearData] Failed to remove ${key}:`, e);
        }
    }

    console.log('[ClearData] All inventory data cleared. Please reload the app.');
}

// Uncomment to run on app start (EMERGENCY ONLY)
// clearAllInventoryData();
