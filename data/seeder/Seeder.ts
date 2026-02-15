import { MOCK_GARMENTS, MOCK_OUTFITS, MOCK_PROFILE } from './mockData';
import { WardrobeRepo } from '../repos/wardrobeRepo';
import { OutfitsRepo } from '../repos/outfitsRepo';
import { ProfileRepo } from '../repos/profileRepo';
import { FIREBASE_DB } from '../../system/firebase/firebaseConfig';
import { DEMO_MALE_PROFILE, DEMO_MALE_GARMENTS, DEMO_MALE_OUTFITS } from './demoMale';
import { DEMO_FEMALE_PROFILE, DEMO_FEMALE_GARMENTS, DEMO_FEMALE_OUTFITS } from './demoFemale';

export class Seeder {
    /**
     * Seed the database with mock data if it's empty
     */
    static async seedIfEmpty(userId: string): Promise<void> {
        try {
            console.log('[Seeder] Checking if seeding is needed...');
            const count = await WardrobeRepo.getCount(userId);

            if (count === 0) {
                console.log('[Seeder] Wardrobe is empty. Starting seed process...');
                await this.seedAll(userId);
                console.log('[Seeder] Seed complete!');
            } else {
                console.log('[Seeder] Data exists. Skipping seed.');
            }
        } catch (error) {
            console.error('[Seeder] Failed to check/seed:', error);
        }
    }

    /**
     * Seed for Demo Accounts (Male/Female)
     */
    static async seedForDemo(userId: string): Promise<void> {
        try {
            console.log(`[Seeder] Seeding demo data for: ${userId}`);

            // 1. Determine which data set to use
            let profileData, garmentsData, outfitsData;

            if (userId === 'demo_female') {
                profileData = DEMO_FEMALE_PROFILE;
                garmentsData = DEMO_FEMALE_GARMENTS;
                outfitsData = DEMO_FEMALE_OUTFITS;
            } else {
                profileData = DEMO_MALE_PROFILE;
                garmentsData = DEMO_MALE_GARMENTS;
                outfitsData = DEMO_MALE_OUTFITS;
            }

            // 2. Check if already seeded (light check)
            const existingCount = await WardrobeRepo.getCount(userId);
            if (existingCount >= 40) {
                console.log('[Seeder] Demo account seems populated. Skipping massive re-seed.');
                return;
            }

            // 3. Seed Profile
            await ProfileRepo.updateProfile(userId, {
                ...profileData,
                onboardingCompleted: true
            });

            // 4. Seed Garments
            // Use sequential execution to prevent overwhelming local storage or race conditions
            console.log(`[Seeder] Inserting ${garmentsData.length} garments...`);
            for (const garment of garmentsData) {
                await WardrobeRepo.createGarment(userId, garment);
            }

            // 5. Seed Outfits
            console.log(`[Seeder] Inserting ${outfitsData.length} outfits...`);
            for (const outfit of outfitsData) {
                // OutfitsRepo might expect items to safeguard existence, but for demo we force it
                await OutfitsRepo.createOutfit(userId, {
                    ...outfit,
                    items: outfit.items
                } as any);
            }

            console.log('[Seeder] Demo Seed Complete!');

        } catch (error) {
            console.error('[Seeder] Failed to seed demo data:', error);
        }
    }

    /**
     * Force seed data (useful for standard "Demo Mode" or debugging)
     */
    static async seedAll(userId: string): Promise<void> {
        // If it's a known demo user, redirect to specific seeder
        if (userId === 'demo_male' || userId === 'demo_female') {
            return this.seedForDemo(userId);
        }

        try {
            // 1. Seed Profile
            await ProfileRepo.updateProfile(userId, {
                displayName: MOCK_PROFILE.displayName || 'User',
                city: MOCK_PROFILE.city || 'City',
                gender: MOCK_PROFILE.gender || 'Female', // Default
                bodyType: MOCK_PROFILE.bodyType || 'Rectangle',
                skinTone: MOCK_PROFILE.skinTone || { undertone: 'neutral', depth: 'medium' },
                preferences: MOCK_PROFILE.preferences || {},
                onboardingCompleted: true
            } as any);

            // 2. Seed Garments
            const garmentPromises = MOCK_GARMENTS.map(garment => {
                const { id, ...data } = garment;
                return WardrobeRepo.createGarment(userId, data as any);
            });
            await Promise.all(garmentPromises);

            // 3. Seed Outfits
            const realGarments = await WardrobeRepo.listGarments(userId, {});
            if (realGarments.length >= 3) {
                const top = realGarments.find(g => g.category === 'Top');
                const bottom = realGarments.find(g => g.category === 'Bottom');
                const shoes = realGarments.find(g => g.category === 'Shoes');

                if (top && bottom && shoes) {
                    await OutfitsRepo.createOutfit(userId, {
                        items: [top.id, bottom.id, shoes.id],
                        score: 0.95,
                        name: 'Mock Outfit 1',
                        occasion: 'Casual'
                    });
                }
            }

            console.log('[Seeder] Standard Seed Complete (Mock Data)');

        } catch (error) {
            console.error('[Seeder] Failed to seed all data:', error);
        }
    }
}
