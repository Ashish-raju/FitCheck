# Implementation Plan - Phase 2: Bulletproof Reliability

## Goal Description
Enhance application reliability by enforcing strict TypeScript types for navigation (eliminating direct casts that hide bugs) and implementing robust state persistence to prevent data loss.

## User Review Required
> [!IMPORTANT]
> This plan changes how navigation parameters are typed. If you have custom navigation logic that relies on untyped params, it might need adjustment.

## Proposed Changes

### Navigation Type Safety
#### [NEW] [types.ts](file:///c:/Users/VudumudiAshishRamaRa/Downloads/Agents%20Engne%201.0%204/Agents%20Engne%201.0/ui/navigation/types.ts)
- Define `RootStackParamList` containing all routes and their parameters.
- Define `AuthStackParamList` and `TabParamList` for nested navigators.

#### [MODIFY] [AppNavigator.tsx](file:///c:/Users/VudumudiAshishRamaRa/Downloads/Agents%20Engne%201.0%204/Agents%20Engne%201.0/ui/navigation/AppNavigator.tsx)
- Import `RootStackParamList` from new types file.
- Apply strictly typed `Stack.Navigator` and `Stack.Screen` components.

#### [MODIFY] [firewallRoot.tsx](file:///c:/Users/VudumudiAshishRamaRa/Downloads/Agents%20Engne%201.0%204/Agents%20Engne%201.0/runtime/firewallRoot.tsx)
- Remove `as any` casts in `NavigationSync`.
- Use strictly typed `useNavigation` hook.

### Error Boundaries
#### [NEW] [SafeZone.tsx](file:///c:/Users/VudumudiAshishRamaRa/Downloads/Agents%20Engne%201.0%204/Agents%20Engne%201.0/ui/system/SafeZone.tsx)
- Create a reusable Error Boundary component that catches JS errors and displays a friendly "Something went wrong" UI with a restart button.

### Robust Persistence
#### [MODIFY] [inventoryStore.ts](file:///c:/Users/VudumudiAshishRamaRa/Downloads/Agents%20Engne%201.0%204/Agents%20Engne%201.0/state/inventory/inventoryStore.ts)
- Switch to `persist` middleware from `zustand/middleware`.
- Add version number (e.g., version: 4).
- Add `migrate` function to handle schema updates safely.

## Verification Plan

### Automated Tests
- TypeScript compilation check (`npx tsc --noEmit`) to verify no type errors remain in navigation.

### Manual Verification
1.  **Navigation Test:**
    - Navigate through the app flows (Auth -> Home -> Ritual -> Profile).
    - ensure no crashes occur during transitions.
2.  **Persistence Test:**
    - Add an item to the wardrobe.
    - Kill the app (force close).
    - Relaunch and verify the item is still there.
3.  **Error Boundary Test:**
    - Temporarily throw an error in a component (e.g., `CameraScreen`).
    - Verify the `SafeZone` UI appears instead of a white screen or crash.
