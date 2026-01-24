export type InventoryId = string;

export interface InventoryItem {
    id: InventoryId;
    name: string;
    wearCount: number;
    lastWorn?: number; // timestamp
    entropy: number; // 0-1 decay
}

export interface StateSchemaV1 {
    version: 1;
    inventory: Record<string, any>; // Simplified for now to avoid duplications with truth/types
    globalMaxUses: number;
    lastBoot: number;
    trustScore: number;
}

export const DEFAULT_STATE: StateSchemaV1 = {
    version: 1,
    inventory: {},
    globalMaxUses: 3, // Default threshold
    lastBoot: 0,
    trustScore: 100,
};

export type AnyState = StateSchemaV1;
