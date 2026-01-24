import type { Inventory, Piece, Category, PieceID } from "../../truth/types";

export class InventoryGraph {
    private inventory: Inventory;
    private byCategory: Record<Category, Piece[]>;

    constructor(inventory: Inventory) {
        this.inventory = inventory;
        this.byCategory = {
            "Top": [],
            "Bottom": [],
            "Outerwear": [],
            "Shoes": [],
            "Accessory": []
        };
        this.buildGraph();
    }

    private buildGraph(): void {
        const pieces = Object.values(this.inventory.pieces);
        for (const piece of pieces) {
            // Robustness check for garbage injection
            if (piece && piece.category && this.byCategory[piece.category]) {
                this.byCategory[piece.category].push(piece);
            }
        }
    }

    public getPiecesByCategory(category: Category): Piece[] {
        return this.byCategory[category] || [];
    }

    public getPiece(id: PieceID): Piece | undefined {
        return this.inventory.pieces[id];
    }

    public getAllPieces(): Piece[] {
        return Object.values(this.inventory.pieces);
    }
}
