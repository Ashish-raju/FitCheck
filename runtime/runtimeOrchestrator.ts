import { ContextManager } from '../context/kernel/contextManager';
import { EngineBinder } from '../bridge/engineBinder';
import { RitualDirector } from '../engine/ritual/ritualDirector';
import { InventoryStore } from '../state/inventory/inventoryStore';

export const RuntimeOrchestrator = {
    orchestrate(): void {
        console.log('[RuntimeOrchestrator] Binding Context -> Engine...');

        // 1. Get Initial Inventory
        const inventory = InventoryStore.getInstance().getInventory();

        // 2. Instantiate Ritual Director (The Brain)
        const director = new RitualDirector(inventory);

        // 3. Wire Engine Binder (The Synapse)
        console.log('[RuntimeOrchestrator] Connecting Ritual Director to Binder...');
        EngineBinder.setDirector(director);

        console.log('[RuntimeOrchestrator] Subscribing Binder to Context pulses...');
        EngineBinder.bind(inventory);

        // 4. Predictive Instantiation: Trigger Generation on Boot
        // DISABLED: Wait for inventory seeding to complete first
        // EngineBinder.execute();

        console.log('[RuntimeOrchestrator] Orchestration Complete. Organism is wired.');
    }
};
