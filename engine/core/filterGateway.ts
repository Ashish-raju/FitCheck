import type { Piece, Context, Outfit } from "../../truth/types";
import { CONSTRAINTS } from "../../truth/constraints";
import { InventoryGraph } from "../graph/inventoryGraph";

export class FilterGateway {
    /**
     * Applies hard gates (Physics, Cleanliness, Weather).
     * Returns true if the piece is acceptable.
     */
    public static filterPiece(piece: Piece, context: Context): boolean {
        // 1. Cleanliness Gate
        if (piece.status !== 'Clean') {
            return false;
        }

        // 2. Weather Gate
        // Temperature check (simplified)
        if (context.temperature < CONSTRAINTS.CONTEXT.COLD_THRESHOLD) {
            // Reject items with low warmth in cold weather
            if (piece.warmth < 2) {
                return false;
            }
        }

        return true;
    }

    /**
     * Filters a list of pieces, returning only valid ones.
     */
    public static filterPieces(pieces: Piece[], context: Context): Piece[] {
        return pieces.filter(p => this.filterPiece(p, context));
    }
}
