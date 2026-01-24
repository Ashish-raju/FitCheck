import * as FileSystem from 'expo-file-system';

const TEMP_EXT = '.tmp';

/**
 * Writes content to a file atomically by writing to a temp file first
 * and then moving it to the destination.
 * 
 * Fails SAFE: Returns false on error, never throws.
 */
export async function writeAtomically(filePath: string, content: string): Promise<boolean> {
    try {
        const tempPath = filePath + TEMP_EXT;

        // 1. Write to temp file
        await FileSystem.writeAsStringAsync(tempPath, content, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // 2. Move temp file to actual path (atomic rename on most FS)
        // Expo doesn't guarantee atomicity across all platforms but move is safer than write
        await FileSystem.moveAsync({
            from: tempPath,
            to: filePath,
        });

        return true;
    } catch (error) {
        console.error(`[AtomicWriter] Failed to write to ${filePath}`, error);
        // Attempt cleanup of temp file
        try {
            await FileSystem.deleteAsync(filePath + TEMP_EXT, { idempotent: true });
        } catch (cleanupError) {
            // Ignore cleanup error
        }
        return false;
    }
}
