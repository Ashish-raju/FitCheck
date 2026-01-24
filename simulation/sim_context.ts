import { selectOutfit } from "../engine/decider/select.js";
import inventorySeed from "../truth/inventory.seed.json" with { type: "json" };
import { Inventory, Context } from "../truth/types.js";

const inventory = inventorySeed as unknown as Inventory;

console.log("RUNNING: sim_context.ts");

const contexts: { label: string, ctx: Context }[] = [
    { label: "Freezing", ctx: { temperature: -5, condition: "Snow", occasion: "Daily" } },
    { label: "Mild", ctx: { temperature: 15, condition: "Clear", occasion: "Daily" } },
    { label: "Heatwave", ctx: { temperature: 35, condition: "Clear", occasion: "Daily" } }
];

contexts.forEach(({ label, ctx }) => {
    const outfit = selectOutfit(inventory, ctx);
    const pieces = outfit.items.map(id => inventory.pieces[id]);
    const avgWarmth = pieces.reduce((acc, p) => acc + p.warmth, 0) / pieces.length;

    console.log(`${label} (Temp: ${ctx.temperature}): Avg Warmth ${avgWarmth.toFixed(1)}, Items: ${outfit.items.length}`);

    if (label === "Freezing" && avgWarmth < 3) throw new Error("Freezing context chose cold outfit");
    if (label === "Heatwave" && avgWarmth > 3) throw new Error("Heatwave context chose hot outfit");
});

console.log("SUCCESS: Context awareness validated.");
