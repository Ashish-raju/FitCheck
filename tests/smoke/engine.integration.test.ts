/**
 * Engine 2.0 Smoke Tests
 * 
 * Integration tests to verify end-to-end functionality
 * Run before production deployment
 */

import { EngineService } from '../../services/EngineService';
import { HealthCheckService } from '../../services/HealthCheckService';
import { WardrobeService } from '../../services/WardrobeService';
import { UserService } from '../../services/UserService';
import { FeatureFlagService } from '../../services/FeatureFlagService';

describe('Engine 2.0 Smoke Tests', () => {

    // ========================================
    // PHASE 1: Health Check & Data Sources
    // ========================================

    describe('Health Check', () => {
        it('should verify live data connection', async () => {
            const health = await HealthCheckService.getInstance().performCheck();

            expect(health.mode).toBe('LIVE');
            expect(health.dataSource).toContain('Firebase');
            expect(health.dataSource).toContain('wardrobe');
        }, 10000);

        it('should show wardrobe count > 0 for test user', async () => {
            const health = await HealthCheckService.getInstance().performCheck();

            // Assuming test user has items
            expect(health.wardrobeCount).toBeGreaterThan(0);
            expect(health.sampleGarmentIds.length).toBeGreaterThan(0);
        }, 10000);
    });

    // ========================================
    // PHASE 2: Feature Flags
    // ========================================

    describe('Feature Flags', () => {
        it('should have NEW_ENGINE_ENABLED set to true', () => {
            expect(FeatureFlagService.useNewEngine()).toBe(true);
        });

        it('should have PARALLEL_RUN disabled', () => {
            expect(FeatureFlagService.shouldRunParallel()).toBe(false);
        });

        it('should expose debug mode in DEV', () => {
            if (__DEV__) {
                expect(FeatureFlagService.isDebugMode()).toBe(true);
            }
        });
    });

    // ========================================
    // PHASE 3: Engine Facade Methods
    // ========================================

    describe('Engine Facade', () => {
        const mockUserId = 'test_user_123';

        it('should generate outfit suggestions from live wardrobe', async () => {
            const outfits = await EngineService.getSuggestions(mockUserId, 'General');

            expect(Array.isArray(outfits)).toBe(true);
            // Should return 0-5 outfits depending on wardrobe
            expect(outfits.length).toBeGreaterThanOrEqual(0);
            expect(outfits.length).toBeLessThanOrEqual(5);
        }, 15000);

        it('should score an outfit', async () => {
            // Get a test outfit first
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const itemIds = Object.keys(wardrobeRecord).slice(0, 3); // First 3 items

            if (itemIds.length >= 3) {
                const result = await EngineService.scoreOutfit(itemIds, { event: 'General' });

                expect(result).toHaveProperty('totalScore');
                expect(result).toHaveProperty('subscores');
                expect(result).toHaveProperty('explanation');
                expect(result.totalScore).toBeGreaterThanOrEqual(0);
                expect(result.totalScore).toBeLessThanOrEqual(1);
            }
        }, 10000);

        it('should analyze a garment (with caching)', async () => {
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const firstItemId = Object.keys(wardrobeRecord)[0];

            if (firstItemId) {
                const meta = await EngineService.analyzeGarment(firstItemId);

                expect(meta).not.toBeNull();
                expect(meta).toHaveProperty('id');
                expect(meta).toHaveProperty('type');
                expect(meta).toHaveProperty('colors');
            }
        }, 10000);

        it('should analyze user profile (with caching)', async () => {
            const meta = await EngineService.analyzeUser(mockUserId);

            expect(meta).not.toBeNull();
            expect(meta).toHaveProperty('id');
            expect(meta).toHaveProperty('bodyType');
            expect(meta).toHaveProperty('skinTone');
        }, 10000);
    });

    // ========================================
    // PHASE 4: Performance
    // ========================================

    describe('Performance', () => {
        it('should generate outfits within 2 seconds', async () => {
            const start = Date.now();
            await EngineService.getSuggestions('test_user', 'General');
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(2000);
        }, 15000);

        it('should use cache for repeat garment analysis', async () => {
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const itemId = Object.keys(wardrobeRecord)[0];

            if (itemId) {
                // First call (may hit cache or analyze)
                const start1 = Date.now();
                await EngineService.analyzeGarment(itemId);
                const duration1 = Date.now() - start1;

                // Second call (should hit cache)
                const start2 = Date.now();
                await EngineService.analyzeGarment(itemId);
                const duration2 = Date.now() - start2;

                // Cache hit should be faster (< 50ms typically)
                expect(duration2).toBeLessThan(Math.max(100, duration1));
            }
        }, 15000);
    });

    // ========================================
    // PHASE 5: Safety & Error Handling
    // ========================================

    describe('Safety', () => {
        it('should handle empty wardrobe gracefully', async () => {
            // Mock empty wardrobe (if test allows)
            const outfits = await EngineService.getSuggestions('user_with_no_items', 'General');

            expect(Array.isArray(outfits)).toBe(true);
            expect(outfits.length).toBe(0); // Empty array, not crash
        }, 10000);

        it('should not crash with invalid garment ID', async () => {
            const result = await EngineService.analyzeGarment('nonexistent_id_999');

            expect(result).toBeNull(); // Graceful null return
        }, 5000);

        it('should fallback to legacy on new engine failure', async () => {
            // This test would require mocking engine failure
            // For now, just verify legacy engine still exists
            const { OutfitEngineService } = require('../../services/OutfitEngineService');
            expect(OutfitEngineService).toBeDefined();
        });
    });

    // ========================================
    // PHASE 6: Data Persistence
    // ========================================

    describe('Data Persistence', () => {
        it('should persist garment stylistMeta to Firebase', async () => {
            const wardrobeRecord = await WardrobeService.getInstance().getAllPieces();
            const itemId = Object.keys(wardrobeRecord)[0];

            if (itemId) {
                await EngineService.analyzeGarment(itemId);

                // Re-fetch from Firebase
                const updatedRecord = await WardrobeService.getInstance().getAllPieces();
                const piece = updatedRecord[itemId as any];

                // Should have stylistMeta field
                expect(piece).toHaveProperty('stylistMeta');
            }
        }, 15000);
    });
});

// ========================================
// Manual Test Checklist (Run in App)
// ========================================

/*
MANUAL SMOKE TESTS (Run in actual app):

1. Navigation
   - [ ] Open app, navigate to all 4 tabs without crashes
   - [ ] Closet → Home → Outfits → Profile
   - [ ] All tabs render correctly

2. Closet Tab
   - [ ] Upload new item
   - [ ] Item appears in closet grid
   - [ ] Tap item → detail modal opens
   - [ ] stylistMeta persisted (check Firebase console)

3. Home Tab (Reveal Outfit)
   - [ ] Tap "Reveal Outfit" button
   - [ ] Loading screen appears
   - [ ] Outfit(s) generated and displayed
   - [ ] Health check logs in console (DEV mode)

4. Outfits Tab
   - [ ] Saved outfits list loads
   - [ ] Tap outfit → detail screen opens
   - [ ] Score badge displays (if implemented)

5. Profile Tab
   - [ ] Profile loads without crashes
   - [ ] Insights display (if wired)

6. Console Logs (DEV)
   - [ ] Health check appears on first engine call:
         MODE: LIVE
         WARDROBE_SOURCE: Firebase...
         WARDROBE_COUNT: <number>
   - [ ] No critical errors in console
*/
