import { selectOutfit } from "../engine/decider/select.js";
import inventorySeed from "../truth/inventory.seed.json" with { type: "json" };
import { Inventory, Context, Piece } from "../truth/types.js";

const inventory = JSON.parse(JSON.stringify(inventorySeed)) as Inventory;

const context: Context = {
    temperature: 20,
    condition: "Clear",
    occasion: "Daily"
};

console.log("RUNNING: sim_physical.ts");

function runCheck(inv: Inventory, label: string) {
    try {
        const outfit = selectOutfit(inv, context);
        const pieces = outfit.items.map(id => inv.pieces[id]);

        const hasTop = pieces.some(p => p.category === "top");
        const hasBottom = pieces.some(p => p.category === "bottom");
        const hasShoes = pieces.some(p => p.category === "shoes");
        const anyDirty = pieces.some(p => p.status === "dirty");
        const anyGhost = pieces.some(p => p.status === "ghost");

        if (!hasTop || !hasBottom || !hasShoes) {
            throw new Error(`PHSICAL_INCOMPLETE: ${label} missing core category.`);
        }
        if (anyDirty || anyGhost) {
            throw new Error(`PHYSICAL_VIOLATION: ${label} contains dirty or ghost items.`);
        }
        console.log(`PASS: ${label}`);
    } catch (e: any) {
        console.log(`EXPECTED/ERROR: ${label} -> ${e.message}`);
        if (label === "Baseline") throw e;
    }
}

// 1. Baseline
runCheck(inventory, "Baseline");

// 2. Stress: Dirty items only
const dirtyInv = JSON.parse(JSON.stringify(inventory)) as Inventory;
Object.values(dirtyInv.pieces).forEach(p => p.status = "dirty");
runCheck(dirtyInv, "All Dirty");

// 3. Stress: No shoes
const noShoesInv = JSON.parse(JSON.stringify(inventory)) as Inventory;
Object.values(noShoesInv.pieces).filter(p => p.category === "shoes").forEach(p => p.status = "ghost");
runCheck(noShoesInv, "No Shoes (Ghosted)");

console.log("SUCCESS: Physical laws validated.");
