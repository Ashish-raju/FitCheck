# Production Readiness Roadmap

## Phase 1: Performance (The Non-Negotiable)
- [x] **Audit Codebase** for blocking ops
- [x] **Install Multi-threading Prep** (`react-native-worklets-core`)
- [x] **Offload Engine to Worker** (`backgroundWorker.ts`)
- [x] **Async Architecture** (Refactor Orchestrator, Director, Binder)

## Phase 2: Bulletproof Reliability
- [x] **Strict Navigation Typing**
    - [x] Create `ui/navigation/types.ts` with complete `RootStackParamList`
    - [x] Refactor `firewallRoot.tsx` to remove `as any`
    - [x] Fix type errors in `NavigationSync`
- [x] **React Error Boundaries**
    - [x] Create `ui/system/SafeZone.tsx` (Global Error Boundary)
    - [x] Wrap critical features (Root) in boundaries
- [x] **Robust State Persistence**
    - [x] Refactor `inventoryStore.ts` to use debounced save & migrations
    - [x] Remove `safetyBoot.ts` / manual hydration hacks
    - [x] Implement versioned migrations for storage

## Phase 3: Scalable Backend
- [x] **Dynamic Firestore Rules** (Review & Optimize)
- [ ] **Cloud Functions** (Plan for offloading simple logic if needed)

## Phase 4: Polish
- [/] **Unify Design System** (Merge `typography.ts` duplicates)
- [ ] **Directory Cleanup**
