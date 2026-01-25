import type { Inventory, PieceID, OutfitID } from "../../truth/types";

// EMPTY initial state - prevents 4-item flicker
// Real data loaded via seedMockData() in WardrobeScreen
export const INITIAL_INVENTORY: Inventory = {
    pieces: {}
};
