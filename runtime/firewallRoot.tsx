import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer, NavigationContainerRef, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { RitualProvider, useRitualState } from '../ui/state/ritualProvider';
import { ritualMachine } from '../ui/state/ritualMachine';
import { BootLoader } from './bootLoader';
import { RuntimeOrchestrator } from './runtimeOrchestrator';
import { PersistentNav } from '../ui/primitives/PersistentNav';
import { LivingBackground } from '../ui/primitives/LivingBackground';

import { AppStack, NAV_THEME, RootStackParamList } from '../ui/navigation/AppNavigator';

// Sync Component: Bridges Ritual Machine State -> Native Navigation
const NavigationSync: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { phase } = useRitualState();

    useEffect(() => {
        console.log('[NavigationSync] Syncing Phase:', phase);
        switch (phase) {
            case 'VOID': navigation.navigate('Void'); break;
            case 'SPLASH': navigation.navigate('Splash'); break;
            case 'INTRO': navigation.navigate('Intro'); break;
            case 'ONBOARDING': navigation.navigate('Onboarding'); break;
            case 'HOME': navigation.navigate('Home'); break;
            case 'RITUAL': navigation.navigate('Ritual'); break;
            case 'SEAL': navigation.navigate('Seal'); break;
            case 'WARDROBE': navigation.navigate('Wardrobe'); break;
            case 'PROFILE': navigation.navigate('Profile'); break;
            case 'CAMERA': navigation.navigate('Camera'); break;
            case 'FRIENDS_FEED': navigation.navigate('Social'); break;
            case 'AI_STYLIST_CHAT': navigation.navigate('AIStylist'); break;
        }
    }, [phase, navigation]);

    return null;
};

// The Boot Controller Component
const SystemController: React.FC = () => {
    useEffect(() => {
        const init = async () => {
            console.log('[SystemController] Booting...');
            await BootLoader.boot();
            RuntimeOrchestrator.orchestrate();
            console.log('[SystemController] System Live.');
            ritualMachine.toSplash();
        };
        init();
    }, []);
    return null;
};

export const FirewallRoot: React.FC = () => {
    const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
    const [currentRoute, setCurrentRoute] = useState<string>('Void');

    const handleStateChange = () => {
        const route = navigationRef.current?.getCurrentRoute();
        if (route) {
            setCurrentRoute(route.name);
        }
    };

    return (
        <RitualProvider>
            <LivingBackground>
                {/* Status Bar: Light content for dark theme */}
                <StatusBar style="light" backgroundColor="transparent" translucent />

                <SafeAreaView style={styles.container}>
                    <NavigationContainer
                        theme={NAV_THEME}
                        ref={navigationRef}
                        onStateChange={handleStateChange}
                    >
                        <View style={{ flex: 1 }}>
                            <AppStack />
                            {/* Persistent Nav floats on top */}
                            <PersistentNav activeRouteName={currentRoute} />

                            {/* Controllers */}
                            <NavigationSync />
                            <SystemController />
                        </View>
                    </NavigationContainer>
                </SafeAreaView>
            </LivingBackground>
        </RitualProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
