import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { ProfileRepo, WardrobeRepo, UserProfile, DerivedStats, WardrobeInsights } from '../../../data/repos';
import { FIREBASE_AUTH } from '../../../system/firebase/firebaseConfig';
import { Piece, TravelPack } from '../../../truth/types';
import { PackCriteria, generatePack as generateTravelPackService } from '../../../services/TravelPack';
import { AnalyticsService } from '../../../services/AnalyticsService';

export const useProfileData = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DerivedStats | null>(null);
    const [analytics, setAnalytics] = useState<WardrobeInsights | null>(null);
    const [densityData, setDensityData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [packResult, setPackResult] = useState<TravelPack | null>(null);

    // Wardrobe ref for pack generation
    const wardrobeRef = useRef<Piece[]>([]);

    useEffect(() => {
        const userId = FIREBASE_AUTH.currentUser?.uid;
        if (!userId) {
            console.warn('[useProfileData] No authenticated user');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                console.log('[useProfileData] Loading profile data for user:', userId);

                // Load profile, stats, and insights in parallel
                const [userProfile, userStats, userInsights] = await Promise.all([
                    ProfileRepo.getProfile(userId),
                    ProfileRepo.getStats(userId),
                    ProfileRepo.getInsights(userId)
                ]);

                setProfile(userProfile);
                setStats(userStats);
                setAnalytics(userInsights);

                // Load wardrobe for color density and travel pack generation
                const wardrobe = await WardrobeRepo.listGarments(userId, {});
                wardrobeRef.current = wardrobe;

                // Calculate color density
                const density = AnalyticsService.getInstance().getColorDensity(wardrobe);
                setDensityData(density);

                console.log('[useProfileData] Profile data loaded successfully');
            } catch (error) {
                console.error('[useProfileData] Failed to load profile data:', error);
                Alert.alert('Error', 'Could not load profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const generatePack = (criteria: PackCriteria) => {
        try {
            const pack = generateTravelPackService(wardrobeRef.current, criteria);
            setPackResult(pack);
        } catch (error) {
            console.error('[useProfileData] Failed to generate travel pack:', error);
            Alert.alert('Error', 'Could not generate travel pack. Please try again.');
        }
    };

    return {
        profile,
        stats,
        analytics,
        densityData,
        loading,
        packResult,
        setPackResult,
        generatePack,
        wardrobeRef
    };
};
