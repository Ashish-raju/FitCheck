import Svg, { Path } from 'react-native-svg';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, RefreshControl } from 'react-native';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { UserService, UserProfile, DerivedStats } from '../../services/UserService';
import { AnalyticsService, WardrobeAnalytics as AnalyticsData } from '../../services/AnalyticsService';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../system/firebase/firebaseConfig';
import { SmartImage } from '../primitives/SmartImage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Seeder } from '../../data/seeder/Seeder';

// Components
// Refined Components (Visual Upgrade)
import { PROFILE_VISUAL_REFINED } from './refined/config';
import { RefinedStats } from './refined/components/RefinedStats';
import { RefinedBodySnapshot } from './refined/components/RefinedBodySnapshot';
import { RefinedFitPreferences } from './refined/components/RefinedFitPreferences';
import { RefinedBestFits } from './refined/components/RefinedBestFits';
import { RefinedSkinTone } from './refined/components/RefinedSkinTone';
import { RefinedColorWheel } from './refined/components/RefinedColorWheel';
import { RefinedStyleDNA } from './refined/components/RefinedStyleDNA';

// Components
import { EditProfileSheet } from './components/EditProfileSheet';
import { StylePreferences } from './components/StylePreferences';
import { SkinToneSummary } from './components/SkinToneSummary';
import { BodySnapshot } from './components/BodySnapshot';
import { FitPreferences } from './components/FitPreferences';
import { ColorWheelStudio } from './components/ColorWheelStudio';
import { WardrobeAnalytics } from './components/WardrobeAnalytics';
import { BestFitsRecommendations } from './components/BestFitsRecommendations';
import { TravelPackModal } from './components/TravelPack/TravelPackModal';
import { TravelPackResult } from './components/TravelPack/TravelPackResult';

// Types for fetch
import { Piece, Outfit, TravelPack } from '../../truth/types';
import { savePack, generatePack, PackCriteria } from '../../services/TravelPack';
import { useProfileData } from './hooks/useProfileData'; // IMPORT HOOK

const SECTION_SPACING = 24;

// Simple SVG Icon
const ProfileIcon = ({ name, color, size = 16 }: { name: string, color: string, size?: number }) => {
    let d = "M10,10 L90,10 L90,90 L10,90 Z";
    if (name === 'edit') d = "M20,80 L80,20 L90,30 L30,90 L20,90 L20,80"; // Edit pencil
    else if (name === 'suit') d = "M30,30 L70,30 L70,80 L30,80 M40,30 L40,10 L60,10 L60,30"; // Suitcase
    else if (name === 'export') d = "M50,10 L50,60 M30,40 L50,60 L70,40 M20,80 L80,80";
    else if (name === 'reset') d = "M50,20 A30,30 0 1,1 30,30";
    else if (name === 'delete') d = "M30,20 L30,80 L70,80 L70,20 M20,20 L80,20 M40,20 L40,10 L60,10 L60,20";

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ marginRight: 6 }}>
            <Path d={d} stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
    );
};

import { useAuth } from '../../context/auth/AuthProvider';

export const ProfileScreen: React.FC = () => {
    // USE HOOK
    const { user } = useAuth();
    const {
        profile,
        stats,
        analytics,
        densityData,
        loading,
        packResult,
        setPackResult,
        generatePack
    } = useProfileData();

    // Modal States
    const [editSheetVisible, setEditSheetVisible] = useState(false);
    const [travelModalVisible, setTravelModalVisible] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Pull-to-refresh handler
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Profile data will auto-refresh via useProfileData hook on component remount
        // Just wait a moment and clear refreshing state
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    }, []);

    const handleSavePack = async () => {
        if (!packResult || !user?.uid) {
            Alert.alert("Saved", "Your trip is packed! (Simulated)");
            setPackResult(null);
            return;
        }
        await savePack(user.uid, packResult);
        setPackResult(null); // Close result
        Alert.alert("Saved", "Your trip is packed!");
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Need access to update avatar.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setAvatarLoading(true);
            setAvatarLoading(true);
            try {
                if (user?.uid) {
                    await UserService.getInstance().updateProfile(user.uid, { photoURL: uri });
                }
            } catch (e) {
                Alert.alert("Error", "Failed to update avatar.");
            } finally {
                setAvatarLoading(false);
            }
        }
    };

    const handleExportData = async () => {
        const uid = user?.uid;
        if (!uid) return;
        try {
            const data = await UserService.getInstance().exportUserData(uid);
            const docDir = (FileSystem as any).documentDirectory;
            if (!docDir) {
                Alert.alert("Error", "Storage not available.");
                return;
            }
            const path = docDir + 'user_data_export.json';
            await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(path);
            } else {
                Alert.alert("Exported", "Data saved locally.");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to export.");
        }
    };

    const handleResetPersonalization = () => {
        Alert.alert("Reset Personalization?", "Irreversible.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reset", style: "destructive", onPress: async () => {
                    const uid = user?.uid;
                    if (uid) await UserService.getInstance().resetPersonalization(uid);
                }
            }
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert("Delete Account?", "Irreversible.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    const uid = user?.uid;
                    if (uid) {
                        await UserService.getInstance().deleteAccount(uid);
                        // For demo users, we might just want to sign out or handle differently, 
                        // but UserService might throw if it tries to delete from Firebase.
                        // Assuming UserService handles it or we catch it.
                        // Actually, let's just use the auth signOut logic we have.
                        // But wait, FIREBASE_AUTH.signOut() won't clear our context user if we bypass it.
                        // We should use verify signOut from useAuth but here we don't have it imported.
                        // Let's safe guard.
                        if (!uid.startsWith('demo_')) {
                            FIREBASE_AUTH.signOut();
                        }
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.ELECTRIC_VIOLET} />
            </View>
        );
    }

    // High Feature: Travel Result Overlay
    if (packResult) {
        return (
            <TravelPackResult
                pack={packResult}
                onSave={handleSavePack}
                onClose={() => setPackResult(null)}
            />
        );
    }

    return (
        <View style={styles.container}>


            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.ELECTRIC_BLUE}
                        colors={[COLORS.ELECTRIC_BLUE]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    {user?.uid.startsWith('demo_') && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                Alert.alert("Reset Demo Data?", "This will wipe local changes and restore original demo items.", [
                                    { text: "Cancel", style: 'cancel' },
                                    {
                                        text: "Reset", style: 'destructive', onPress: async () => {
                                            try {
                                                await Seeder.seedForDemo(user.uid);
                                                Alert.alert("Reset Complete", "Please pull down to refresh the profile.");
                                            } catch (e) {
                                                Alert.alert("Error", "Failed to reset demo data.");
                                            }
                                        }
                                    }
                                ]);
                            }}
                            style={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                backgroundColor: '#FF00FF',
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderRadius: 12,
                                transform: [{ rotate: '5deg' }],
                                zIndex: 10
                            }}
                        >
                            <Text style={{
                                color: COLORS.VOID_BLACK,
                                fontWeight: 'bold',
                                fontSize: 10,
                                letterSpacing: 1
                            }}>DEMO MODE (RESET)</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
                        <SmartImage
                            source={{ uri: profile?.photoURL || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        {avatarLoading && <ActivityIndicator style={StyleSheet.absoluteFill} />}
                        <View style={styles.editBadge}><Text style={{ color: 'white', fontSize: 10 }}>📷</Text></View>
                    </TouchableOpacity>
                    <Text style={styles.name}>{profile?.displayName || 'Traveler'}</Text>
                    <Text style={styles.subtext}>
                        {profile?.city || 'Nowhere'} • {profile?.gender ? profile.gender + ' • ' : ''}{profile?.bodyType || 'Model'}
                    </Text>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.editButton} onPress={() => setEditSheetVisible(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ProfileIcon name="edit" color={COLORS.ELECTRIC_VIOLET} size={12} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.editButton, { backgroundColor: COLORS.ELECTRIC_BLUE }]} onPress={() => setTravelModalVisible(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ProfileIcon name="suit" color={COLORS.VOID_BLACK} size={12} />
                                <Text style={[styles.editButtonText, { color: COLORS.VOID_BLACK }]}>Plan Trip</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                {PROFILE_VISUAL_REFINED ? (
                    <RefinedStats
                        wardrobeCount={stats?.wardrobeCount || 0}
                        outfitsCount={stats?.outfitsSavedCount || 0}
                        streak={stats?.streakCount || 0}
                    />
                ) : (
                    <View style={styles.statsRow}>
                        <StatPill label="Wardrobe" value={stats?.wardrobeCount || 0} />
                        <StatPill label="Outfits" value={stats?.outfitsSavedCount || 0} />
                        <StatPill label="Streak" value={`${stats?.streakCount || 0} days`} />
                    </View>
                )}

                {/* Body Intelligence - Updated */}
                <Section title="Body Intelligence">
                    {PROFILE_VISUAL_REFINED ? (
                        <>
                            <RefinedBodySnapshot
                                currentBodyType={profile?.bodyType}
                                gender={profile?.gender}
                                confidence={profile?.bodyConfidence}
                                onRetakePress={() => Alert.alert("Coming Soon", "Scan flow...")}
                            />
                            <View style={{ height: 16 }} />
                            <RefinedFitPreferences
                                fitPrefs={profile?.preferences?.fitPrefs}
                                problemAreas={profile?.preferences?.problemAreas}
                                comfortPrefs={profile?.preferences?.comfortPrefs}
                            />
                            <View style={{ height: 16 }} />
                            <RefinedBestFits bodyType={profile?.bodyType} />
                        </>
                    ) : (
                        <>
                            <BodySnapshot
                                currentBodyType={profile?.bodyType}
                                confidence={profile?.bodyConfidence}
                                onRetakePress={() => Alert.alert("Coming Soon", "Scan flow...")}
                            />
                            <View style={{ height: 16 }} />
                            <FitPreferences
                                fitPrefs={profile?.preferences?.fitPrefs}
                                problemAreas={profile?.preferences?.problemAreas}
                                comfortPrefs={profile?.preferences?.comfortPrefs}
                            />
                            <View style={{ height: 16 }} />
                            <BestFitsRecommendations bodyType={profile?.bodyType} />
                        </>
                    )}
                </Section>

                {/* Skin Tone */}
                <Section title="Skin Tone Analysis">
                    {PROFILE_VISUAL_REFINED ? (
                        <RefinedSkinTone
                            skinTone={profile?.skinTone}
                            palette={profile?.palette}
                            onRescan={() => Alert.alert("Coming Soon")}
                        />
                    ) : (
                        <SkinToneSummary
                            skinTone={profile?.skinTone}
                            palette={profile?.palette}
                            onRescan={() => Alert.alert("Coming Soon")}
                        />
                    )}
                </Section>

                {/* Color Wheel - Updated with Density */}
                <Section title="Your Palette">
                    {PROFILE_VISUAL_REFINED ? (
                        <RefinedColorWheel palette={profile?.palette} densityData={densityData} />
                    ) : (
                        <ColorWheelStudio palette={profile?.palette} densityData={densityData} />
                    )}
                </Section>

                {/* Style DNA */}
                <Section title="Style DNA">
                    {PROFILE_VISUAL_REFINED ? (
                        <RefinedStyleDNA preferences={profile?.preferences?.stylePreferences} />
                    ) : (
                        <StylePreferences
                            selected={profile?.preferences?.stylePreferences || []}
                            onUpdate={() => { }}
                        />
                    )}
                </Section>

                {/* Wardrobe Analytics - Updated */}
                <Section title="Analytics">
                    <WardrobeAnalytics data={analytics ? {
                        ...analytics,
                        mostVersatileItems: analytics.versatileItems,
                        topColors: analytics.colorDistribution,
                        healthBreakdown: analytics.healthBreakdown || { coverage: 0, diversity: 0, freshness: 0 }
                    } : undefined} />
                </Section>

                {/* Settings */}
                <Section title="Settings">
                    <TouchableOpacity style={styles.settingsRow} onPress={handleExportData}>
                        <Text style={styles.settingsText}>Export Personal Data</Text>
                        <Text style={styles.settingsArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingsRow} onPress={handleResetPersonalization}>
                        <Text style={styles.settingsText}>Reset Personalization</Text>
                        <Text style={styles.settingsArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
                        <Text style={[styles.settingsText, { color: '#FF0055' }]}>Delete Account</Text>
                    </TouchableOpacity>
                </Section>

                <View style={{ height: 100 }} />
            </ScrollView>

            <EditProfileSheet
                visible={editSheetVisible}
                onClose={() => setEditSheetVisible(false)}
                currentProfile={profile}
            />

            <TravelPackModal
                visible={travelModalVisible}
                onClose={() => setTravelModalVisible(false)}
                onGenerate={generatePack}
            />
        </View>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const StatPill: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <View style={styles.statPill}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: COLORS.ELECTRIC_VIOLET,
        backgroundColor: COLORS.CARBON_BLACK,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.VOID_BLACK,
    },
    name: {
        color: MATERIAL.TEXT_MAIN,
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtext: {
        color: MATERIAL.TEXT_MUTED,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        marginBottom: 12,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    editButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    editButtonText: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 12,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statPill: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statValue: {
        color: COLORS.ELECTRIC_VIOLET,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: MATERIAL.TEXT_MUTED,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: SECTION_SPACING,
    },
    sectionTitle: {
        color: MATERIAL.TEXT_MAIN,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    settingsText: {
        color: MATERIAL.TEXT_MAIN,
        fontSize: 16,
    },
    settingsArrow: {
        color: MATERIAL.TEXT_MUTED,
        fontSize: 18,
    }
});
