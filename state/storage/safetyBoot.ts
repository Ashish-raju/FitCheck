import * as FileSystem from 'expo-file-system';
import { writeAtomically } from './atomicWriter';
import { DEFAULT_STATE, StateSchemaV1 } from './schema';

/**
 * Boots the system state.
 * 
 * PROTOCOL:
 * 1. Read file.
 * 2. Parse JSON.
 * 3. IF FAIL -> NUCLEAR RESET -> Return Safe Default.
 * 4. IF SUCCESS -> Return State.
 */
export async function safetyBoot(filePath: string): Promise<StateSchemaV1> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (!fileInfo.exists) {
            // First boot or missing file, initialize default
            await writeAtomically(filePath, JSON.stringify(DEFAULT_STATE));
            return DEFAULT_STATE;
        }

        const content = await FileSystem.readAsStringAsync(filePath);

        try {
            const state = JSON.parse(content);
            // Basic schema check
            if (typeof state.version !== 'number') {
                throw new Error('Invalid schema: missing version');
            }
            return state as StateSchemaV1;
        } catch (parseError) {
            console.warn('Corruption detected. Initiating NUCLEAR RESET.');

            // Corruption detected!
            // 1. Backup corrupted file (optional, but good for debug)
            try {
                await FileSystem.moveAsync({
                    from: filePath,
                    to: filePath + '.corrupt-' + Date.now()
                });
            } catch (e) { /* ignore backup failure */ }

            // 2. Restore default
            await writeAtomically(filePath, JSON.stringify(DEFAULT_STATE));

            return DEFAULT_STATE;
        }

    } catch (error) {
        console.error('Critical boot failure. Serving default state.', error);
        return DEFAULT_STATE;
    }
}
