import type { Inventory, PieceID } from "../../truth/types.ts";

export const GhostProtocol = {
    isGhost: (inventory: Inventory, id: PieceID): boolean => {
        const piece = inventory.pieces[id];
        if (!piece) return true; // It doesn't exist, so it's a ghost
        return piece.status === 'Ghost';
    },

    assertExistence: (inventory: Inventory, id: PieceID): void => {
        if (GhostProtocol.isGhost(inventory, id)) {
            throw new Error(`GHOST_PROTOCOL_VIOLATION: Piece ${id} is dead.`);
        }
    }
};
