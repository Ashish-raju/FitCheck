import type { Inventory, PieceID, Category } from "../../truth/types.ts";

export interface GraphNode {
    id: PieceID;
    edges: PieceID[]; // IDs of pieces this piece can be worn with
}

export class InventoryGraph {
    private adjacencyList: Map<PieceID, Set<PieceID>>;

    constructor(inventory: Inventory) {
        this.adjacencyList = new Map();
        this.buildGraph(inventory);
    }

    private buildGraph(inventory: Inventory) {
        // In V1, we assume a simple compatibility model:
        // Every Top matches every Bottom unless explicitly blacklisted (blacklist not implemented in v1 yet, per spec)
        // Or we rely on "Uniforms" which are pre-validated sets.

        // For the purpose of "Constraint: Engines must be PURE", we build the graph from the static inventory.
        const tops = Object.values(inventory.pieces).filter(p => p.category === "Top");
        const bottoms = Object.values(inventory.pieces).filter(p => p.category === "Bottom");

        // Naive V1 Graph: All Tops connect to all Bottoms
        tops.forEach(top => {
            bottoms.forEach(bottom => {
                this.addEdge(top.id, bottom.id);
            });
        });
    }

    private addEdge(a: PieceID, b: PieceID) {
        if (!this.adjacencyList.has(a)) this.adjacencyList.set(a, new Set());
        if (!this.adjacencyList.has(b)) this.adjacencyList.set(b, new Set());

        this.adjacencyList.get(a)!.add(b);
        this.adjacencyList.get(b)!.add(a);
    }

    public getCompatible(id: PieceID): PieceID[] {
        return Array.from(this.adjacencyList.get(id) || []);
    }
}
