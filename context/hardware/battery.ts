/**
 * Pure signal adapter for Battery status.
 * In a real React Native app, this wraps expo-battery.
 */
export class BatterySignal {
    static getLevel(): number {
        // Safe default: 100%
        return 1.0;
    }

    static isLowPowerMode(): boolean {
        return false;
    }

    static isCharging(): boolean {
        return false;
    }
}
