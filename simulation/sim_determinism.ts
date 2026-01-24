import { selectOutfit } from "../engine/decider/select.js";
import inventorySeed from "../truth/inventory.seed.json" with { type: "json" };
import { Inventory, Context } from "../truth/types.js";
import crypto from "crypto";

const inventory = inventorySeed as unknown as Inventory;
const context: Context = {
    temperature: 18,
    condition: "Clear",
    occasion: "Daily"
};

console.log("RUNNING: sim_determinism.ts");
console.log("Iterations: 1000");

const results: string[] = [];
for (let i = 0; i < 1000; i++) {
    const outfit = selectOutfit(inventory, context);
    results.push(JSON.stringify(outfit));
}

const uniqueResults = new Set(results);
const hash = crypto.createHash('sha256').update(results[0]).digest('hex');

if (uniqueResults.size === 1) {
    console.log("SUCCESS: 1000/1000 identical outfits.");
    console.log(`Outfit Hash: ${hash}`);
    console.log(`Selected Items: ${JSON.parse(results[0]).items.join(", ")}`);
} else {
    console.error(`FAILURE: Determinism broken. Unique results: ${uniqueResults.size}`);
    process.exit(1);
}
