# Outfit Engine Integration

This document describes how the outfit suggestion engine is integrated into the app.

## Architecture

```
App Layer (React Native)
  ↓
Integration Layer (Services)
  ├─ OutfitEngineService (main API)
  ├─ FirebaseGarmentRepository (data adapter)
  └─ SimpleAIService (explanations)
  ↓
Engine Layer (Pure TypeScript)
  ├─ Context Parser
  ├─ Hard Filters
  ├─ Scoring
  ├─ Assembly (Beam Search)
  ├─ Diversification (MMR)
  └─ Learning
  ↓
Data Layer (Firebase/Storage)
```

## Quick Start

```typescript
import { useOutfitEngine } from './state/useOutfitEngine';

// In your component
const { outfits, isGenerating, generateOutfits } = useOutfitEngine();

// Generate outfits
await generateOutfits(userId, eventType, temperature, condition);

// Display outfits
outfits.map(outfit => <CandidateStage outfit={outfit} userId={userId} />)
```

## API Reference

### OutfitEngineService

```typescript
const engine = OutfitEngineService.getInstance();

// Generate outfits
const outfits = await engine.generateOutfits(
  userId: string,
  eventType: string,      // e.g. 'casual', 'office', 'wedding'
  temperature: number,    // Celsius
  condition: string       // 'Clear', 'Rain', 'Snow', 'Cloudy'
);
```

### useOutfitEngine Hook

```typescript
const {
  outfits: Outfit[],           // Generated outfits
  isGenerating: boolean,       // Loading state
  error: string | null,        // Error message
  generateOutfits: Function,   // Generate function
  clearOutfits: Function       // Clear state
} = useOutfitEngine();
```

## Event Types

- Casual: `casual`, `casual party`, `brunch`
- Formal: `office`, `office formal`, `business`, `wedding`
- Cultural: `temple`, `funeral`, `puja`
- Activity: `outdoor`, `commute`, `gym`

## India-Specific Rules

The engine enforces India-specific cultural and practical rules:

- **Temple**: No shorts, no deep necklines
- **Funeral**: No white-dominant outfits
- **Monsoon/Rain**: No suede, raw silk, or white linen
- **Office**: No graphic patterns or neon colors
- **Double-Loud**: Never pairs two non-solid patterns (top + bottom)

## Configuration

Default user profile can be customized in `FirebaseGarmentRepository.ts`:

```typescript
async getUserProfile(userId: string): Promise<UserProfile> {
  return {
    skinTone: { undertone: 'warm', depth: 'medium' },
    palette: { best: [1, 2, 10, 20], avoid: [99] },
    bodyType: 'rectangle',
    stylePrefs: ['minimal', 'chic'],
    comfortPrefs: { tight: 0.5, loose: 0.5 },
    weights: { ... }
  };
}
```

## Files

- **Services**:
  - `services/OutfitEngineService.ts` - Main API
  - `services/FirebaseGarmentRepository.ts` - Data adapter
  - `services/SimpleAIService.ts` - AI explanations

- **State**:
  - `state/useOutfitEngine.ts` - Zustand hook

- **Engine**:
  - `engine/outfit/*` - Core engine modules

## Testing

The engine has comprehensive test coverage. Run tests:

```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

## Performance

- P95 latency < 2s for 200 items
- P95 latency < 3s for 1000 items
- Graceful fallback on errors
- Memory-efficient beam search

## Support

For issues or questions, refer to:
- Test suite: `tests/`
- Test report: `tests/TEST_REPORT.md`
- Engine docs: `engine/outfit/README.md` (if exists)
