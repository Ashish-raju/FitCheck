# Engine Migration Map

## 1. System Overview
**Goal:** Replace the existing `engine/outfit` (Legacy Engine) with a new modular, deterministic Stylist Engine in `engine/`.

### Current Architecture
- **Entry Point:** `services/OutfitEngineService.ts` -> `generateOutfits()`
- **Core Logic:** `engine/outfit/index.ts` -> `generateOutfitSuggestions()`
- **AI:** `services/SimpleAIService.ts` (Stub)
- **Data:** `services/FirebaseGarmentRepository.ts`

### New Architecture
- **Entry Point:** `engine/facade/index.ts` (to be called by `OutfitEngineService`)
- **Core Logic:** Distributed across `engine/` submodules.
- **AI:** `engine/stylist-voice` (Safe Mode)
- **Data:** Persisted Analysis Service (Phase 3)

## 2. Module Mapping (Old → New)

| Legacy Component (`engine/outfit/`) | New Component (`engine/`) | Notes |
|-------------------------------------|---------------------------|-------|
| `context.ts` | `context-radar/` | Enhanced with India Rules, strict formality, weather logic. |
| `retrieval.ts` | `retrieval/` | Needs availability, gender, category filters. Returns 20-60 candidates. |
| `scoring.ts` & `models.ts` | `scoring/` | Deterministic scoring. Palette dictionary, body fit, etc. |
| `assembly.ts` | `assembly/` | Beam search implementation (Outfit Forge). |
| `diversification.ts` | `diversification/` | MMR implementation. |
| `explanation.ts` | `stylist-voice/` | LLM restricted to explanation only. |
| N/A | `rules/` | **NEW**: India Rules Pack (modesty, culture). |
| N/A | `confidence-gate/` | **NEW**: Rejection logic. |
| `learning.ts` (stub) | `learning/` | Feedback loop implementation. |
| `index.ts` | `facade/` | The cleaner interface for the app. |

## 3. Data Gaps & Schema Extensions

### Garment Metadata (`Grail`)
| Field | Status | Action |
|-------|--------|--------|
| `colors` | Basic | enhance with `dictColorId` and `hex` |
| `fabricGuess` | Missing | Add field |
| `texture` | Missing | Add field |
| `fitMeta` | Basic | Expand to `neckline`, `rise`, `length`, `silhouette` |
| `versatilityScore` | Missing | Add placeholder |
| `availability` | Missing | Add logic |

### User Profile (`UserProfile`)
| Field | Status | Action |
|-------|--------|--------|
| `skinTone` | Basic | Expand `undertone`, `depth`, `contrast` |
| `palette` | Basic | Add `best[]`, `avoid[]` colors |
| `bodyConfidence` | Missing | Add field |
| `comfortVetoes` | Missing | Add field |

## 4. Risk Points
- **Breaking existing flows:** `OutfitEngineService` must support the legacy engine via feature flag until Phase 9.
- **Performance:** Beam search and repeated scoring might be slow in JS/TS. Need detailed logging.
- **Data Migration:** Existing garments in Firebase need backfilling for new fields.

## 5. Preservation List
- **`services/OutfitEngineService.ts`**: The public API. Do not change its signature yet.
- **`FirebaseGarmentRepository.ts`**: We will extend this, not replace it immediately.
- **Existing User Data**: No data loss allowed.

## 6. Migration Plan Summary
1.  **Skeleton**: Build new modules side-by-side with `outfit/`.
2.  **Persistence**: Update schemas without breaking old types (optional fields).
3.  **Parallel Run**: Use `OutfitEngineService` to call BOTH engines and log results.
4.  **Switch**: Flip feature flag.
