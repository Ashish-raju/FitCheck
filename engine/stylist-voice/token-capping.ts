export class TokenBucket {
    private capacity: number;
    private tokens: number;
    private lastRefill: number;
    private refillRate: number; // Tokens per second

    constructor(capacity: number = 100, refillRate: number = 1) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.lastRefill = Date.now();
        this.refillRate = refillRate;
    }

    consume(amount: number = 1): boolean {
        this.refill();
        if (this.tokens >= amount) {
            this.tokens -= amount;
            return true;
        }
        return false;
    }

    private refill() {
        const now = Date.now();
        const deltaSeconds = (now - this.lastRefill) / 1000;
        const newTokens = deltaSeconds * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + newTokens);
        this.lastRefill = now;
    }
}
