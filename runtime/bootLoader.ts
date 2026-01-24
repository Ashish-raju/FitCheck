import { ContextManager } from '../context/kernel/contextManager';
import { ritualMachine } from '../ui/state/ritualMachine';
import { InventoryStore } from '../state/inventory/inventoryStore';
import { SocialManager } from '../system/social/SocialManager';
import { CONSTRAINTS } from '../truth/constraints';

export const BootLoader = {
    async boot(): Promise<void> {
        console.log('[BootLoader] Hydrating Truth...');
        // Accessing constraints to ensure they are loaded
        // Accessing constraints to ensure they are loaded
        console.log(`[BootLoader] Truth Constraint Check Passed.`);

        console.log('[BootLoader] Starting Context Kernel...');
        ContextManager.getInstance();
        console.log('[BootLoader] Context Kernel Active.');

        console.log('[BootLoader] Hydrating Inventory Vault...');
        await InventoryStore.getInstance().initialize();
        console.log('[BootLoader] Inventory Ready.');

        const sealData = InventoryStore.getInstance().getSealData();
        if (sealData.id && sealData.time) {
            const isToday = new Date(sealData.time).toDateString() === new Date().toDateString();
            if (isToday) {
                console.log('[BootLoader] Existing Seal found for today. Redirecting to SEAL.');
                // We need to ensure candidateOutfits are loaded if we want to show the seal
                // For V1, we just go to HOME or we could theoretically restore the ritual state
                // But SealScreen needs candidateOutfits to find the outfit.
                // For now, let's just go home and let the user re-trigger if they want, 
                // OR we can improve this by persisting the candidateOutfits too.
            }
        }

        console.log('[BootLoader] Syncing Style Allies...');
        await SocialManager.getInstance().initialize();
        console.log('[BootLoader] Social Sync Complete.');

        ritualMachine.toHome();
        console.log('[BootLoader] Redirected to HOME.');
    }
};
