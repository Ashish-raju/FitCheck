import { ReliabilityConfig } from './config';
import { UserProfileMeta } from '../../engine/types';

// Simple LCG for deterministic randomness
class LCG {
    private state: number;
    constructor(seed: number) {
        this.state = seed % 2147483647;
        if (this.state <= 0) this.state += 2147483646;
    }
    next(): number {
        this.state = (this.state * 48271) % 2147483647;
        return this.state / 2147483647;
    }
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    pick<T>(array: T[]): T {
        return array[this.nextInt(0, array.length - 1)];
    }
    // Random float between 0 and 1
    random(): number {
        return this.next();
    }
}

export interface ReliabilityScenario {
    id: string;
    seed: number;
    context: any; // Using any for ease, maps to StyleContext input
    userProfile: UserProfileMeta;
    adversarialType?: 'NONE' | 'MUST_REFUSE' | 'REPETITION';
}

export class ScenarioGenerator {
    private prng: LCG;

    constructor(runSeed: number) {
        this.prng = new LCG(runSeed);
    }

    generate(count: number): ReliabilityScenario[] {
        const scenarios: ReliabilityScenario[] = [];
        for (let i = 0; i < count; i++) {
            scenarios.push(this.createScenario(i));
        }
        return scenarios;
    }

    private createScenario(index: number): ReliabilityScenario {
        const seed = this.prng.nextInt(1, 10000000);
        // Create a local PRNG for this scenario so it's reproducible by only its ID/Seed
        const localRng = new LCG(seed);

        const event = localRng.pick(['General', 'Wedding', 'Office', 'Party', 'Date', 'Gym', 'Travel', 'Temple', 'Funeral']);
        const timeOfDay = localRng.pick(['Morning', 'Afternoon', 'Evening', 'Night']);
        const weatherCondition = localRng.pick(['Sunny', 'Rainy', 'Cloudy', 'Cold']);
        const temp = localRng.pick([10, 20, 28, 35, 42]);

        // 10% chance of adversarial task
        const isAdversarial = localRng.random() < 0.1;
        const adversarialType = isAdversarial ? (localRng.random() > 0.5 ? 'MUST_REFUSE' : 'REPETITION') : 'NONE';

        // Profile Variations
        const userProfile: UserProfileMeta = {
            id: `user_${index}`,
            bodyType: localRng.pick(['rectangle', 'hourglass', 'triangle', 'inverted_triangle']),
            skinTone: {
                hex: localRng.pick(['#FFE0BD', '#F5C6A5', '#E29E75', '#8D5524', '#2F1D0F']),
                undertone: localRng.pick(['cool', 'warm', 'neutral']),
                contrastLevel: localRng.pick(['low', 'medium', 'high'])
            },
            fitPreference: localRng.pick(['regular', 'slim', 'relaxed']),
            modestyLevel: localRng.nextInt(1, 10),
            palette: { bestColors: [], avoidColors: [] }, // TODO: fill with fuzz
            weights: {
                comfort: localRng.random(),
                style: localRng.random(),
                colorHarmony: localRng.random(),
                novelty: localRng.random()
            }
        };

        return {
            id: `scn_${index}`,
            seed,
            adversarialType,
            context: {
                event,
                timeOfDay,
                weather: { condition: weatherCondition, tempC: temp },
                location: 'Mumbai' // Placeholder
            },
            userProfile
        };
    }
}
