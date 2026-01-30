# Engine 2.0 Go-Live Checklist

## Pre-Flight Checks

### 1. Environment Variables

**Development (.env.local)**:
```bash
NEW_ENGINE_ENABLED=true
PARALLEL_RUN=false
ENGINE_STRICT_MODE=false
ENGINE_DEBUG_LOGGING=true
```

**Production (.env)**:
```bash
NEW_ENGINE_ENABLED=true     # Set to true after validation
ENGINE_STRICT_MODE=true      # Enforce strict confidence gates
ENGINE_DEBUG_LOGGING=false   # Disable verbose logs
```

### 2. Feature Flags Verification

Run this command to verify flag status:
```typescript
// In React Native Debugger console or dev menu
import { FeatureFlagService } from './services/FeatureFlagService';
console.log('Engine Enabled:', FeatureFlagService.useNewEngine());
console.log('Strict Mode:', FeatureFlagService.isStrictMode());
console.log('Debug Mode:', FeatureFlagService.isDebugMode());
```

### 3. Data Source Verification

On app startup (dev mode), check console for:
```
╔═══════════════════════════════════════════════════════════╗
║           ENGINE HEALTH CHECK                             ║
╚═══════════════════════════════════════════════════════════╝
MODE: LIVE
WARDROBE_SOURCE: Firebase Firestore - users/{uid}/wardrobe
WARDROBE_COUNT: <number>
SAMPLE_GARMENT_IDS: [...]
USER_ID: <uid>
NEW_ENGINE_ENABLED: true
═══════════════════════════════════════════════════════════
```

**✅ PASS Criteria**: MODE = LIVE, WARDROBE_COUNT > 0

---

## Launch Sequence

### Phase A: Dev Environment Testing

1. **Start Dev Server**:
   ```bash
   npm start
   ```

2. **Run Health Check**:
   - Open any tab that triggers outfit generation
   - Verify health check logs appear in console
   - Confirm wardrobe count matches Firebase

3. **Test All Tabs** (Smoke Test):
   - [ ] Closet Tab: Upload item → Meta stored
   - [ ] Home Tab: Reveal Outfit → Generated outfits display
   - [ ] Outfits Tab: View saved outfit → Score displays
   - [ ] Profile Tab: View insights → No crashes

4. **Verify No Crashes**:
   ```bash
   # Check for React Native errors
   npx react-native log-android  # or log-ios
   ```

### Phase B: Staged Rollout (Production)

1. **Set Feature Flag** (Gradual):
   ```typescript
   // services/FeatureFlagService.ts
   NEW_ENGINE_ENABLED: true  // Start with 10% of users if using remote config
   ```

2. **Monitor Metrics** (First 24h):
   - Crash rate
   - API error rate
   - Average outfit generation time
   - User engagement (outfit saves, reveals)

3. **Rollback Trigger**:
   - If crash rate > 2%
   - If outfit generation fails > 5%
   - If P95 latency > 3s

---

## Sanity Checks (Manual QA)

###Test Case 1: Empty Wardrobe
**Steps**:
1. Create test user with 0 items
2. Navigate to Home → Reveal Outfit
3. **Expected**: Graceful message ("Add items to your closet to get started")
4. **Should NOT**: Crash or show empty screen

### Test Case 2: Minimal Wardrobe (3 items)
**Steps**:
1. Wardrobe: 1 top, 1 bottom, 1 shoes
2. Reveal outfit
3. **Expected**: 1 outfit generated
4. **Verify**: All 3 items are present in outfit

### Test Case 3: Large Wardrobe (100+ items)
**Steps**:
1. Wardrobe: 100+ items
2. Reveal outfit
3. **Expected**: 3-5 outfits generated within 2 seconds
4. **Verify**: No duplicates, diverse recommendations

### Test Case 4: Outfit Scoring
**Steps**:
1. Navigate to saved outfit
2. View outfit detail
3. **Expected**: Score badge (0-100 or ⭐ rating) displays
4. **Verify**: Explanation text shows context relevance

### Test Case 5: Item Analysis
**Steps**:
1. Closet → Upload new item
2. Wait for processing
3. View item detail
4. **Expected**: Enhanced metadata (formality, season scores, etc.)
5. **Verify**: `stylistMeta` persisted to Firebase

---

## Rollback Procedure

### Immediate Rollback (< 5 minutes)

**Option 1: Feature Flag Kill Switch**
```typescript
// services/FeatureFlagService.ts
NEW_ENGINE_ENABLED: false
```
Redeploy or use remote config to toggle instantly.

**Option 2: Git Revert**
```bash
git revert <commit-hash>  # Revert engine integration commit
git push origin main
# Redeploy app
```

### Gradual Rollback
1. Set `PARALLEL_RUN: true` to shadow-run engine without affecting users
2. Debug issues offline
3. Re-enable when fixed

---

## Required NPM Scripts

Ensure these scripts exist in `package.json`:

```json
{
  "scripts": {
    "start": "expo start --clear",
    "test": "jest",
    "test:integration": "jest --testMatch='**/tests/integration/**/*.test.ts'",
    "typecheck": "tsc --noEmit"
  }
}
```

---

##Validation Commands

### Before Deployment

```bash
# Type check
npm run typecheck

# Run tests
npm test

# Build (if applicable)
npm run build

# Start dev server
npm start
```

### After Deployment

```bash
# Monitor logs
npx react-native log-ios  # or log-android

# Check Firebase for new stylistMeta fields
# Navigate to Firebase Console → Firestore → users/{uid}/wardrobe
# Verify pieces have `stylistMeta` object
```

---

## Success Metrics

### Week 1 Targets
- [ ] 0 critical crashes
- [ ] Outfit generation success rate > 95%
- [ ] Average latency < 500ms
- [ ] User engagement (outfit reveals) increase by 10%

### Week 4 Targets
- [ ] Full rollout (100% users)
- [ ] Legacy engine deprecation
- [ ] Remove `OutfitEngineService` code

---

## Emergency Contacts

**On-Call Engineer**: [Your contact]
**Firebase Admin**: [Firebase project owner]
**Slack Channel**: #engine-rollout

---

## Post-Launch Tasks

- [ ] Remove `PARALLEL_RUN` flag (no longer needed)
- [ ] Archive `OutfitEngineService.ts`
- [ ] Update documentation
- [ ] Celebrate 🎉

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-31  
**Owner**: Engine Integration Team
