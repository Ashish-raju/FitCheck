/**
 * Pure signal adapter for Network status.
 * In a real React Native app, this wraps NetInfo.
 */
export class NetworkSignal {
    static isConnected(): boolean {
        // Defaults to true (Optimistic)
        // Can be hooked into NetInfo later
        return true;
    }

    static isExpensive(): boolean {
        return false;
    }
}
