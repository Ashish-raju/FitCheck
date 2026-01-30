import { INITIAL_CONTEXT, createSnapshot } from './contextSnapshot';
import type { ContextVector } from './contextSnapshot';
import { ContextValidator } from './contextValidator';

type ContextListener = (ctx: ContextVector) => void;

export class ContextManager {
    private static instance: ContextManager;
    private current: ContextVector;
    private listeners: Set<ContextListener>;

    private constructor() {
        this.current = INITIAL_CONTEXT;
        this.listeners = new Set();
    }

    static getInstance(): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
    }

    getCurrent(): ContextVector {
        return this.current;
    }

    update(partial: Partial<ContextVector>): void {
        const next = createSnapshot(this.current, partial);

        if (ContextValidator.validate(next)) {
            this.current = next;
            this.notify();
        } else {
            console.error("[ContextManager] Invalid context update rejected", partial);
        }
    }

    subscribe(listener: ContextListener): () => void {
        this.listeners.add(listener);
        // Immediate callback with current state
        listener(this.current);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(l => l(this.current));
    }
}
