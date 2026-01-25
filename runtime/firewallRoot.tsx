import React, { useEffect, useState, useRef, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, NavigationContainerRef, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { RitualProvider, useRitualState } from '../ui/state/ritualProvider';
import { ritualMachine } from '../ui/state/ritualMachine';
import { BootLoader } from './bootLoader';
import { RuntimeOrchestrator } from './runtimeOrchestrator';
import { PersistentNav } from '../ui/primitives/PersistentNav';
import { AppBackground } from '../ui/system/background/AppBackground';
import { AuthProvider, useAuth } from '../context/auth/AuthProvider';

import { AppStack, NAV_THEME, RootStackParamList } from '../ui/navigation/AppNavigator';

// Sync Component: Bridges Ritual Machine State -> Native Navigation
const NavigationSync: React.FC = memo(() => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { phase } = useRitualState();

    useEffect(() => {
        console.log('[NavigationSync] Syncing Phase:', phase);
        switch (phase) {
            case 'VOID': navigation.navigate('Void'); break;
            case 'SPLASH': navigation.navigate('Splash'); break;
            case 'INTRO': navigation.navigate('Intro'); break;
            case 'ONBOARDING': navigation.navigate('Onboarding'); break;
            case 'AUTH': navigation.navigate('Auth'); break;
            case 'HOME': navigation.navigate('Home'); break;
            case 'RITUAL': navigation.navigate('RitualDeck'); break;
            case 'SEAL': navigation.navigate('Seal'); break;
            case 'WARDROBE': navigation.navigate('Wardrobe'); break;
            case 'PROFILE': navigation.navigate('Profile'); break;
            case 'CAMERA': navigation.navigate('Camera'); break;
            case 'ITEM_PREVIEW': navigation.navigate('ItemPreview'); break;
            case 'FRIENDS_FEED': navigation.navigate('Social'); break;
            case 'AI_STYLIST_CHAT': navigation.navigate('AIStylist'); break;
        }
    }, [phase, navigation]);

    return null;
});

// The Boot Controller Component
const SystemController: React.FC = memo(() => {
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const init = async () => {
            console.log('[SystemController] Booting...');

            // Wait for auth to initialize
            if (authLoading) {
                console.log('[SystemController] Waiting for auth...');
                return;
            }

            // Check auth status
            if (!user) {
                console.log('[SystemController] No user - redirecting to Auth');
                // Navigate to Auth screen
                ritualMachine.toAuth();
                return;
            }

            // User is authenticated - proceed with normal boot
            console.log('[SystemController] User authenticated:', user.uid);

            // CRITICAL: Navigate to SPLASH FIRST, before any heavy work
            console.log('[SystemController] Navigating to SPLASH immediately');
            ritualMachine.toSplash();

            // Do minimal boot process only
            console.log('[SystemController] Starting boot loader...');
            await BootLoader.boot();
            console.log('[SystemController] Boot complete. System Live.');

            // NOTE: Orchestration is INTENTIONALLY SKIPPED at boot
            // The heavy outfit generation (getAllPossibleOutfits) blocks the JS thread
            // for seconds with large inventories. It will run lazily when user
            // triggers the Ritual from HOME screen instead.
        };
        init();
    }, [user, authLoading]);
    return null;
});

// Memoized PersistentNav wrapper to prevent re-renders
const MemoizedNav = memo(({ routeName }: { routeName: string }) => (
    <PersistentNav activeRouteName={routeName} />
));

export const FirewallRoot: React.FC = () => {
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
    const [currentRoute, setCurrentRoute] = useState<string>('Void');

    const handleStateChange = () => {
        const route = navigationRef.current?.getCurrentRoute();
        if (route && route.name !== currentRoute) {
            setCurrentRoute(route.name);
        }
    };

    return (
        <AuthProvider>
            <RitualProvider>
                <View style={styles.rootContainer}>
                    {/* Background Layer - Renders FIRST (behind everything) */}
                    <AppBackground />

                    <StatusBar style="light" backgroundColor="transparent" translucent />

                    {/* Content Layer - Renders on top of background */}
                    <SafeAreaView style={styles.container}>
                        <NavigationContainer
                            theme={NAV_THEME}
                            ref={navigationRef}
                            onStateChange={handleStateChange}
                        >
                            <View style={styles.content}>
                                <AppStack />
                                {/* Memoized Nav */}
                                <MemoizedNav routeName={currentRoute} />

                                {/* Controllers */}
                                <NavigationSync />
                                <SystemController />
                            </View>
                        </NavigationContainer>
                    </SafeAreaView>
                </View>
            </RitualProvider>
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#0B1021', // DEEP_NAVY - visible dark blue background
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
    },
});
