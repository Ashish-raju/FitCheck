/**
 * Seeded random number generator for deterministic tests
 * Using Mulberry32 algorithm
 */
export class SeededRandom {
    private state: number;

    constructor(seed: number = 12345) {
        this.state = seed;
    }

    /**
     * Returns a random number between 0 and 1
     */
    next(): number {
        let t = (this.state += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Returns a random integer between min (inclusive) and max (exclusive)
     */
    int(min: number, max: number): number {
        return Math.floor(this.next() * (max - min)) + min;
    }

    /**
     * Returns a random element from an array
     */
    choice<T>(arr: T[]): T {
        return arr[this.int(0, arr.length)];
    }

    /**
     * Shuffles an array in place
     */
    shuffle<T>(arr: T[]): T[] {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.int(0, i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Returns true with probability p
     */
    boolean(p: number = 0.5): boolean {
        return this.next() < p;
    }

    /**
     * Resets the generator to a specific seed
     */
    reset(seed: number) {
        this.state = seed;
    }
}

export const testRandom = new SeededRandom(12345);
