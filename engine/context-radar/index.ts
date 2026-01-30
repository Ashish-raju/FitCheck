import { ContextSpec, Season, Gender } from '../types';

export interface RawContextInput {
    event: string; // Free text from user or UI
    weather?: {
        tempC: number;
        condition: string;
        rainProb?: number;
    };
    time?: Date;
    location?: string;
    gender?: Gender;
}

export class ContextRadar {

    /**
     * Parse raw input into a Stylist Context Specification
     */
    static deriveContext(input: RawContextInput): ContextSpec {
        const { event, weather, time } = input;

        // 1. Analyze Event for Formality & Mood
        const analysis = this.analyzeEventString(event);

        // 2. Analyze Weather
        const weatherSpec = this.analyzeWeather(weather);

        // 3. Determine Time of Day
        const timeOfDay = this.getTimeOfDay(time || new Date());

        return {
            eventType: analysis.normalizedEvent,
            formalityTarget: analysis.formality,
            weather: weatherSpec,
            timeOfDay: timeOfDay,
            hardVetoes: [], // To be populated by Rules Pack
            mood: analysis.mood,
            requiredPieces: analysis.requiredPieces
        };
    }

    private static analyzeEventString(event: string): {
        normalizedEvent: string;
        formality: number;
        mood: string;
        requiredPieces?: string[];
    } {
        const lowerEvent = event.toLowerCase();

        // Default
        let result = {
            normalizedEvent: 'casual_daily',
            formality: 2, // Casual
            mood: 'relaxed',
            requiredPieces: undefined as string[] | undefined
        };

        // Keyword Matching
        if (lowerEvent.includes('wedding')) {
            result.normalizedEvent = 'wedding_guest';
            result.formality = 9; // High formality
            result.mood = 'festive';
        } else if (lowerEvent.includes('office') || lowerEvent.includes('work') || lowerEvent.includes('meeting')) {
            result.normalizedEvent = 'office_work';
            result.formality = 7; // Business Casual/Formal
            result.mood = 'professional';
        } else if (lowerEvent.includes('party') || lowerEvent.includes('club')) {
            result.normalizedEvent = 'party_night';
            result.formality = 5; // Smart Casual / Party
            result.mood = 'energetic';
        } else if (lowerEvent.includes('date')) {
            result.normalizedEvent = 'date_night';
            result.formality = 6; // Smart Casual +
            result.mood = 'romantic';
        } else if (lowerEvent.includes('gym') || lowerEvent.includes('workout') || lowerEvent.includes('run')) {
            result.normalizedEvent = 'athletic';
            result.formality = 1; // Active
            result.mood = 'active';
        } else if (lowerEvent.includes('temple') || lowerEvent.includes('pooja')) {
            result.normalizedEvent = 'cultural_religious';
            result.formality = 6;
            result.mood = 'serene';
        } else if (lowerEvent.includes('home') || lowerEvent.includes('relax')) {
            result.normalizedEvent = 'home_lounge';
            result.formality = 1;
            result.mood = 'cozy';
        }

        return result;
    }

    private static analyzeWeather(weather?: RawContextInput['weather']): {
        tempC: number;
        rainProb: number;
        isIndoor: boolean;
    } {
        if (!weather) {
            return { tempC: 25, rainProb: 0, isIndoor: true }; // Default safe assumption
        }

        const isRainy = weather.condition.toLowerCase().includes('rain') || (weather.rainProb || 0) > 0.4;

        return {
            tempC: weather.tempC,
            rainProb: weather.rainProb || (isRainy ? 0.8 : 0),
            isIndoor: false // Assume outdoor unless specific location logic exists
        };
    }

    private static getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }
}
