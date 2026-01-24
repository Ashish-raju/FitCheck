/**
 * Detects if a new calendar day has started since the last check.
 */

export function isNewDay(lastCheckTimeMs: number, nowMs: number = Date.now()): boolean {
    if (!lastCheckTimeMs) return true;

    const lastDate = new Date(lastCheckTimeMs);
    const nowDate = new Date(nowMs);

    return (
        lastDate.getFullYear() !== nowDate.getFullYear() ||
        lastDate.getMonth() !== nowDate.getMonth() ||
        lastDate.getDate() !== nowDate.getDate()
    );
}
