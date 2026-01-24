import type { Outfit, OutfitID } from "../../truth/types";

export class RejectionMemory {
    private rejectedIds: Set<OutfitID> = new Set();
    private rejectionCount: number = 0;

    public recordRejection(outfit: Outfit): void {
        this.rejectedIds.add(outfit.id);
        this.rejectionCount++;
    }

    public isRejected(outfit: Outfit): boolean {
        return this.rejectedIds.has(outfit.id);
    }

    public getRejectionCount(): number {
        return this.rejectionCount;
    }

    public clear(): void {
        this.rejectedIds.clear();
        this.rejectionCount = 0;
    }
}
