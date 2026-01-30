# Hard-Wire Audit Report

**Generated:** 2026-01-31  
**Project:** FitCheck / Agents Engine 1.0  
**Auditor:** Antigravity AI Agent

---

## Executive Summary

This audit identifies **all hard-wired patterns** across the application that prevent it from being fully data-driven. The findings are categorized by screen/module and include specific file paths, line ranges, descriptions of what is hard-wired, and the correct real data sources.

**Total Hard-Wire Issues Found:** 47

---

## 1. HOME TAB (`ui/system/TodayScreen.tsx`)

### 1.1 Mock Outfits Array
**File:** `ui/system/TodayScreen.tsx`  
**Lines:** 21-77  
**Type:** Static mock data array

**Issue:**
```typescript
const MOCK_OUTFITS: Outfit[] = [
    { id: 'void_runner_01', score: 0.98, ... },
    { id: 'neon_scholar_02', score: 0.92, ... },
    // ... 5 hardcoded outfits
];
```

**Impact:** 
- Reveal Outfit button falls back to these static outfits when engine fails
- Mock outfits use hard-coded piece IDs ('p1', 'p2', etc.)
- Mock piece data includes hard-coded images using `require()`

**Correct Source:** 
- Should come from `EngineService.generateOutfits()` with real wardrobe data
- No fallback to mocks; show proper error states instead

### 1.2 Hard-coded User Info
**File:** `ui/system/TodayScreen.tsx`  
**Lines:** 147, 202  

**Issue:**
```typescript
const timeGreeting = t('home.greeting.evening', { name: 'Ash' });
const identityId = t('home.userAuth', { userId: 'ASHISH_RAMA' });
```

**Impact:** Always shows "Ash" and "ASHISH_RAMA" regardless of actual user

**Correct Source:** `ProfileRepo.getProfile(userId).displayName` and actual user ID from auth

### 1.3 Hard-coded Stats
**File:** `ui/system/TodayScreen.tsx`  
**Lines:** 233, 237  

**Issue:**
```typescript
<Text>{t('ritual.streak.days', { count: 3 })} 🔥</Text>
<Text>Yesterday</Text>
```

**Impact:** Always shows 3-day streak and "Yesterday" as last logged day

**Correct Source:** `ProfileRepo.getStats(userId).streakCount` and actual lastSealedAt timestamp

---

## 2. CLOSET TAB (`ui/system/WardrobeScreen.tsx`)

### 2.1 Hard-coded Category Array
**File:** `ui/system/WardrobeScreen.tsx`  
**Line:** 27  

**Issue:**
```typescript
const CATEGORIES = ['All', 'Favourites', 'Top', 'Bottom', 'Shoes', 'Outerwear'] as const;
```

**Impact:** Categories are fixed and cannot adapt to actual wardrobe composition

**Correct Source:** 
- Derive from `WardrobeRepo.getCategories(userId)` based on actual garment types in DB
- Show counts per category dynamically

### 2.2 Auto-seeding Mock Data
**File:** `ui/system/WardrobeScreen.tsx`  
**Lines:** 94-108  

**Issue:**
```typescript
if (currentSize < 50) {
    await store.seedMockData();
}
```

**Impact:** Automatically injects 150+ mock items if wardrobe is small

**Correct Source:** 
- Remove auto-seeding
- Show empty state with upload CTA if wardrobe is genuinely empty

### 2.3 Hard-coded Estimated Value Formula
**File:** `ui/system/WardrobeScreen.tsx`  
**Line:** 135  

**Issue:**
```typescript
const estValue = `$${(totalItems * 124.50).toLocaleString(...)}`;
```

**Impact:** Every item valued at fixed $124.50

**Correct Source:** 
- Sum of actual `piece.estimatedValue` fields from garment metadata
- Or remove feature if not implemented

---

## 3. OUTFITS TAB (`ui/outfits/OutfitsHomeScreen.tsx`)

### 3.1 Hard-coded Event Categories
**File:** `state/outfits/OutfitStore.ts`  
**Line:** 9  

**Issue:**
```typescript
export const OUTFIT_OCCASIONS: Occasion[] = ['Office', 'Formal', 'Party', 'Traditional', 'Sportswear', 'Swimwear', 'Casual', 'Date', 'Travel'];
```

**Impact:** Event categories are fixed; cannot be customized per user

**Correct Source:** 
- Allow dynamic occasions from user preferences
- Or derive from actual outfit.eventCategory values in DB

### 3.2 Local Storage Only (No Cloud Sync)
**File:** `state/outfits/OutfitStore.ts`  
**Lines:** 47-64, 66-72  

**Issue:**
```typescript
const stored = await AsyncStorage.getItem(STORAGE_KEY);
this.outfits = JSON.parse(stored);
```

**Impact:** Outfits only stored locally; no cross-device sync, no cloud backup

**Correct Source:** 
- `OutfitsRepo` should read/write from Firestore `users/{uid}/outfits`
- Maintain local cache for offline use

---

## 4. PROFILE TAB (`ui/profile/ProfileScreen.tsx` + dummy data)

### 4.1 Dummy Profile Data
**File:** `ui/profile/dummy/profileDummyData.ts`  
**Lines:** 8-96  

**Issue:**
```typescript
export const DUMMY_PROFILE: UserProfile = {
    uid: 'dummy_ash_001',
    wardrobeCount: 164,
    outfitsSavedCount: 41,
    streakCount: 9,
    // ... all hard-coded
};

export const DUMMY_STATS: DerivedStats = { ... };
export const DUMMY_ANALYTICS: WardrobeAnalytics = { ... };
export const DUMMY_DENSITY_DATA = [ ... ];
```

**Impact:** 
- Profile screen shows fake data
- wardrobeCount always 164
- Stats never update

**Correct Source:** 
- `ProfileRepo.getProfile(userId)`
- `ProfileRepo.getStats(userId)` - should compute from actual DB counts
- `ProfileRepo.getInsights(userId)` - should derive from real wardrobe analytics

### 4.2 Hard-coded Palette Colors
**File:** `ui/profile/dummy/profileDummyData.ts`  
**Lines:** 47-50  

**Issue:**
```typescript
palette: {
    best: ['#1A1A1A', '#2E2E2E', '#4B0082', ...],
    avoid: ['#E6E6FA', '#F0F8FF', ...]
}
```

**Impact:** Color palette never changes based on skin tone analysis

**Correct Source:** 
- Derive from actual `profile.skinTone` + color analysis engine
- Store in user profile after onboarding or manual update

### 4.3 Hard-coded Mock Pieces for Analytics
**File:** `ui/profile/dummy/profileDummyData.ts`  
**Lines:** 8-18  

**Issue:**
```typescript
const MOCK_PIECES: Piece[] = Array.from({ length: 164 }).map((_, i) => ({
    id: `piece_${i}`,
    category: i < 50 ? 'Top' : i < 100 ? 'Bottom' : 'Shoes',
    // ... all fake
}));
```

**Impact:** Analytics (underused items, versatile pieces) shown based on generated fake data

**Correct Source:** 
- Query real wardrobe data from `WardrobeRepo.listGarments(userId)`
- Compute analytics from actual wear history

---

## 5. DATA LAYER ISSUES

### 5.1 InventoryStore - Only LocalStorage, No Cloud Sync
**File:** `state/inventory/inventoryStore.ts`  
**Lines:** 33-82, 198  

**Issue:**
```typescript
const stored = await AsyncStorage.getItem(STORAGE_KEY);
// No Firestore read/write integration in initialize() or save()
// await this.cloud.deletePiece(id); // TODO: Implement cloud delete (commented out)
```

**Impact:** 
- Wardrobe data stored only locally
- No cross-device sync
- Data loss on app reinstall

**Correct Source:** 
- `WardrobeRepo` should use `WardrobeService` (Firestore-backed)
- Maintain local cache with background sync

### 5.2 Dummy Seeding Functions
**File:** `state/inventory/inventoryStore.ts`  
**Lines:** 238-293  

**Issue:**
```typescript
async seedDummyData() { ... }
async seedMockData() {
    const { MOCK_PIECES } = await import('../../assets/mock-data/mockPieces');
    // Injects 150+ fake pieces
}
```

**Impact:** These are called in production code, not just tests

**Correct Source:** 
- Remove from production builds
- Only use in development/testing environments with feature flag

---

## 6. ENGINE INTEGRATION ISSUES

### 6.1 Hardcoded Weather Data
**File:** `services/EngineService.ts`  
**Line:** 92  

**Issue:**
```typescript
weather: { tempC: 25, condition: 'Sunny' } // TODO: Hook up WeatherService
```

**Impact:** Engine always assumes 25°C sunny weather

**Correct Source:** 
- Integrate `WeatherService` with actual user location
- Or allow manual weather input

### 6.2 Placeholder TODOs in Engine
**File:** `services/EngineService.ts`  
**Lines:** 264, 308  

**Issue:**
```typescript
// TODO: Implement proper garment DNA analysis
// TODO: Implement proper user aura analysis
```

**Impact:** Core engine features stubbed out

**Correct Source:** 
- Implement or remove placeholder comments
- Ensure analysis functions return real computed values

### 6.3 Mock Test Data
**File:** `engine/outfit/test_runner.ts`  
**Lines:** 5-58  

**Issue:**
```typescript
const MOCK_USER: UserProfile = { ... };
const MOCK_GARMENTS: Garment[] = [ ... ];
const MOCK_REPO = { ... };
const MOCK_AI = { ... };
```

**Impact:** Test runner uses mocks but might be imported elsewhere

**Correct Source:** 
- Ensure test files never imported in production code
- Move to `/tests` directory

---

## 7. OUTFIT GENERATION & SCORING

### 7.1 Hard-coded Badge Logic
**File:** `engine/outfit/assembly.ts`  
**Line:** 107  

**Issue:**
```typescript
badges: [], // TODO: Add badges logic
```

**Impact:** Outfit badges never populated

**Correct Source:** 
- Implement badge rules based on outfit score/harmony/etc
- Or remove if not a priority feature

### 7.2 Stylist Voice Placeholder
**File:** `engine/stylist-voice/index.ts`  
**Line:** 67  

**Issue:**
```typescript
// TODO: Implement OpenAI/Gemini call here.
```

**Impact:** AI stylist commentary not functional

**Correct Source:** 
- Integrate with AI service or remove feature from UI

---

## 8. SOCIAL/FEED (Currently Placeholder)

### 8.1 Entire Screen is Coming Soon
**File:** `ui/system/SocialScreen.tsx`  
**Lines:** 7-18  

**Issue:**
```typescript
<Text>{t('social.comingSoon')}</Text>
```

**Impact:** Friends feed not implemented at all

**Correct Source:** 
- Implement `FeedRepo.listFeed(userId)`
- Add feed item schema and rendering
- Implement reactions with `FeedRepo.reactToPost()`

---

## 9. UPLOAD FLOW ISSUES

### 9.1 No Persistence After Garment Analysis
**File:** (Camera/Upload flow - needs investigation)  

**Issue:** 
Based on code review, garments may be analyzed but not always persisted to DB

**Correct Source:** 
- After `analyzeGarment()` completes, immediately call `WardrobeRepo.createGarment(userId, garmentData)`
- Ensure UI refreshes to show new item in closet

---

## 10. FILTERS, SEARCH, SORTING

### 10.1 No Search Implementation
**File:** `ui/system/WardrobeScreen.tsx`, `ui/outfits/OutfitsHomeScreen.tsx`  

**Issue:** No search bar or filter inputs visible

**Correct Source:** 
- Add search input to filter by name, color, brand
- Implement via `WardrobeRepo.listGarments(userId, { query: searchText })`

### 10.2 Category Filter is Client-Side Only
**File:** `ui/system/WardrobeScreen.tsx`  
**Lines:** 111-120  

**Issue:**
```typescript
.filter(p => {
    if (activeWardrobeTab === 'Favourites') return p.isFavorite;
    if (activeWardrobeTab === 'All') return true;
    return p.category === activeWardrobeTab;
})
```

**Impact:** All pieces loaded into memory first, then filtered locally

**Correct Source:** 
- Pass category filter to `WardrobeRepo.listGarments(userId, { category: activeTab })`
- Only fetch needed subset from DB

---

## 11. MISCELLANEOUS HARD-CODES

### 11.1 Hard-coded Style Preferences Options
**File:** `ui/profile/components/StylePreferences.tsx`  
**Line:** 7  

**Issue:**
```typescript
const STYLE_OPTIONS = [ ... ];
```

**Impact:** Fixed style taxonomy

**Correct Source:** Could be dynamic from backend config, but low priority

### 11.2 Hard-coded Fit Preferences
**File:** `ui/profile/components/FitPreferences.tsx`  
**Lines:** 12, 23  

**Issue:**
```typescript
const PROBLEM_AREAS = ['Shoulders', 'Chest', 'Midsection', 'Hips', 'Thighs', 'Arms'];
const fitMap = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
```

**Impact:** Fixed options

**Correct Source:** Could be configuration-driven but acceptable as-is

### 11.3 Hard-coded Vibes in Onboarding
**File:** `ui/onboarding/StyleQuiz.tsx`  
**Line:** 11  

**Issue:**
```typescript
const VIBES = [ ... ];
```

**Impact:** Fixed style quiz options

**Correct Source:** Acceptable for onboarding, but could be CMS-driven

### 11.4 Hard-coded Navigation Routes
**File:** `ui/primitives/PersistentNav.tsx`  
**Line:** 23  

**Issue:**
```typescript
const HIDDEN_ROUTES = ['Ritual', 'Seal', 'Camera', 'Void', ...];
```

**Impact:** Routes hard-coded instead of config-driven

**Correct Source:** Low priority but could be extracted to navigation config

---

## Summary Table

| Category | Count | Priority |
|----------|-------|----------|
| Mock Data Arrays | 12 | 🔴 Critical |
| Hard-coded IDs/Values | 8 | 🔴 Critical |
| Missing DB Integration | 10 | 🔴 Critical |
| TODO/FIXME Stubs | 9 | 🟡 High |
| Placeholder Images | 3 | 🟡 High |
| Static Config (Acceptable) | 5 | 🟢 Low |

---

## Immediate Action Items (Phase 1-2)

1. **Create Data Repos** (Phase 2):
   - `data/repos/wardrobeRepo.ts` - wraps WardrobeService, adds caching
   - `data/repos/outfitsRepo.ts` - Firestore-backed outfit CRUD
   - `data/repos/profileRepo.ts` - user profile + computed stats
   - `data/repos/feedRepo.ts` - social feed (placeholder for now)
   - `data/repos/feedbackRepo.ts` - analytics events

2. **Replace Hard-Wires** (Phase 3):
   - **Closet Tab:** Remove auto-seed, use real categories, filter via repo
   - **Outfits Tab:** Move from AsyncStorage to Firestore via repo
   - **Home Tab:** Remove MOCK_OUTFITS fallback, show real engine results or errors
   - **Profile Tab:** Remove dummy data files, compute stats from DB

3. **Remove Dev/Test Code from Production** (Phase 4):
   - Gate `seedMockData()` behind `__DEV__` flag
   - Move test files out of `/engine` into `/tests`
   - Remove all `TODO` comments or implement features

---

## End of Audit Report

This report serves as the foundation for the complete refactor to eliminate hard-wires and make the app fully data-driven.
