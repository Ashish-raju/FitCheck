/**
 * Simple FNV-1a 32-bit hash implementation.
 * Chosen for speed and sufficient collision resistance for state integrity.
 */
function fnv1a(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
}

/**
 * Generates a checksum for the given content.
 */
export function generateChecksum(content: string): string {
    return fnv1a(content);
}

/**
 * Verifies if the content matches the provided checksum.
 */
export function verifyChecksum(content: string, expectedHash: string): boolean {
    return generateChecksum(content) === expectedHash;
}
