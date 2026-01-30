# Engine 2.0 Architecture

## Overview
The new Outfit Engine (Project "Antigravity") is a deterministic, rule-based system with LLM enhancement layers. It replaces the legacy random-selection logic with a structured 8-step pipeline designed for high relevance, style coherence, and hyper-personalization.

## Architecture Diagram

```mermaid
graph TD
    User([User]) -->|Request| EngineFacade[EngineService]
    EngineFacade -->|Feature Flag| ContextRadar
    
    subgraph "Phase 4: Context Awareness"
    ContextRadar -->|Context Vector| RetrievalEngine
    end
    
    subgraph "Phase 5: Retrieval & Scoring"
    RetrievalEngine -->|Candidates| ItemScorer
    ItemScorer -->|Scored Items| OutfitForge
    end
    
    subgraph "Phase 6: Forge & Gating"
    OutfitForge -->|Raw Outfits| OutfitScorer
    OutfitScorer -->|Scored Outfits| MMR[Diversification (MMR)]
    MMR -->|Top Picks| ConfidenceGate
    end
    
    subgraph "Phase 7: Stylist Voice"
    ConfidenceGate -->|Approved| StylistVoice
    StylistVoice -->|Explanation| Final[OutfitResult]
    end
    
    subgraph "Phase 8: Learning"
    Final -->|Feedback| FeedbackService
    FeedbackService -->|Update| UserProfile
    end
```

## Key Components

### 1. Engine Facade (`EngineService.ts`)
The single entry point for all outfit generation. It handles:
- **Feature Flagging**: Toggles between Legacy and New Engine.
- **Parallel Execution**: Can run both engines for comparison.
- **Fallback**: Automatically reverts to legacy engine if the new one fails.

### 2. Context Radar (`ContextRadar.ts`)
Analyzes the user's request (e.g., "Wedding", "Gym") and external factors (Weather) to produce a `StyleContext` object. This context drives all downstream scoring.
- **India Rules Pack**: Contains specific logic for Indian cultural events (e.g., strictly avoiding white for weddings if configured).

### 3. Retrieval Engine (`RetrievalEngine.ts`)
Efficiently scans the user's wardrobe to find "Candidate Items".
- Filters by Weather, Season, and Event suitability.
- Uses `O(1)` lookups where possible.

### 4. Outfit Forge (`OutfitForge.ts`)
The core combinatorial engine.
- **Anchoring**: Starts with a high-score "Anchor Item" (e.g., a formal shirt).
- **Assembly**: Finds compatible matches (Keys -> Shoes) using the `OutfitRules` matrix.
- **MMR (Maximal Marginal Relevance)**: Ensures the final list of 3-5 outfits are distinct from each other (e.g., not 3 blue shirt outfits).

### 5. Stylist Voice (`StylistVoice.ts`)
A "Safe Mode" LLM layer.
- **Token Capping**: Ensures explanations are concise.
- **Caching**: Reuses explanations for similar outfits to save cost.
- **Personality**: Injects the "Ritual" brand voice.

## Data Persistence
- **GarmentMeta**: Extended metadata for every item (Fabric, Weight, Cut).
- **UserProfileMeta**: Detailed user style profile (Body Shape, Skin Tone, Weights).
- **Feedback**: Tracks `wornCount` and `lastWorn` to improve future recommendations.

## Migration Status
- **Legacy Engine**: Still present in `services/OutfitEngineService.ts` but marked `@deprecated`.
- **Switch**: Controlled by `FeatureFlagService.NEW_ENGINE_ENABLED`.
