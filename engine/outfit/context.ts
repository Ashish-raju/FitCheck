import { Context, Season } from './models';
import { INDIA_CULTURE_RULES, SEASONS } from './constants';

interface ContextInput {
    eventType: string; // e.g. "wedding", "office", "party", "funeral", "temple", "brunch"
    timeOfDay: string; // "morning", "afternoon", "evening", "night"
    geoLocation: string; // Assumed India based on spec, but keeping for API shape
    weather: {
        temp: number; // Celsius
        rainProb: number; // 0-1
    };
}

// Helper to determine season from simple weather heuristic if needed, 
// though often valid season comes from date. Here using temp/rain as proxy if strictly following "Given weather".
// However, the spec output has "season", so we must derive it.
function deriveSeason(weather: { temp: number; rainProb: number }): Season {
    if (weather.rainProb > 0.3) return "monsoon";
    if (weather.temp < 20) return "winter";
    return "summer";
}

export function parseContext(input: ContextInput): Context {
    const { eventType, timeOfDay, weather } = input;

    const season = deriveSeason(weather);
    const cultureRules: string[] = [];
    let formalityMin = 0;
    let desiredStyle: string[] = [];
    let paletteTarget: number[] = []; // Currently empty, would need complex mapping logic or lookup table

    // MANDATORY INDIA-SPECIFIC RULES
    const lowerEvent = eventType.toLowerCase();

    // 1. Temple Rules
    if (lowerEvent.includes("temple") || lowerEvent.includes("puja")) {
        cultureRules.push(INDIA_CULTURE_RULES.TEMPLE_NO_SHORTS);
        formalityMin = 1; // Respectful
    }

    // 2. Funeral Rules
    if (lowerEvent.includes("funeral") || lowerEvent.includes("cremation")) {
        cultureRules.push(INDIA_CULTURE_RULES.FUNERAL_NO_WHITE_HEAVY);
        formalityMin = 1;
    }

    // 3. Monsoon Rules
    // Applied if season is monsoon OR rain probability is high regardless of "season" label
    if (season === "monsoon" || weather.rainProb > 0.4) {
        cultureRules.push(INDIA_CULTURE_RULES.MONSOON_VETO);
    }

    // 4. Office Formal Validity
    if (lowerEvent.includes("office") || lowerEvent.includes("formal") || lowerEvent.includes("business")) {
        cultureRules.push(INDIA_CULTURE_RULES.OFFICE_NO_LOUD);
        formalityMin = 2; // Business
    }

    // Mapping Event to TimeBucket/Vibe (Simulated for this layer)
    // Real implementation might have a deeper lookup db.

    // Formality overrides based on specific event types
    if (lowerEvent.includes("wedding")) formalityMin = 3;
    if (lowerEvent.includes("black tie")) formalityMin = 4;

    return {
        event: eventType,
        formalityMin,
        season,
        rainProb: weather.rainProb,
        temp: weather.temp,
        timeBucket: timeOfDay,
        cultureRules,
        desiredStyle,
        paletteTarget
    };
}
