import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { DefaultTheme } from '@react-navigation/native';
import { COLORS } from '../tokens/color.tokens';

// Screen Imports
import { VoidScreen } from '../void/VoidScreen';
import { SplashSequence } from '../onboarding/SplashSequence';
import { IntroSlideshow } from '../onboarding/IntroSlideshow';
import { StyleQuiz } from '../onboarding/StyleQuiz';
import { AuthScreen } from '../auth/AuthScreen';
import { MainTabs } from './MainTabs'; // [NEW] Use Tabs
import { RitualDeckScreen } from '../ritual/RitualDeckScreen';
import { SealScreen } from '../seal/SealScreen';
import { CameraScreen } from '../system/CameraScreen';
import { ItemPreviewScreen } from '../system/ItemPreviewScreen';
import { OutfitsHomeScreen } from '../outfits/OutfitsHomeScreen';
import { CreateOutfitScreen } from '../outfits/CreateOutfitScreen';
import { StylingCanvasScreen } from '../outfits/StylingCanvasScreen';
import { OutfitDetailScreen } from '../outfits/OutfitDetailScreen';
import { AIStylistChat } from '../system/AIStylistChat';
import { SegmentationCorrectionScreen } from '../vision/SegmentationCorrectionScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const SCREEN_OPTIONS: NativeStackNavigationOptions = {
    headerShown: false,
    animation: 'fade', // Default, can be overridden per screen
    contentStyle: { backgroundColor: 'transparent' }, // IMPORTANT for LivingBackground
};

export const NAV_THEME = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: 'transparent', // IMPORTANT for LivingBackground
    },
};

export const AppStack: React.FC = () => {
    return (
        <Stack.Navigator
            id="AppStack"
            initialRouteName="Void"
            screenOptions={SCREEN_OPTIONS}
        >
            {/* SYSTEM BOOT */}
            <Stack.Screen name="Void" component={VoidScreen} />
            <Stack.Screen name="Splash" component={SplashSequence} />
            <Stack.Screen name="Intro" component={IntroSlideshow} />
            <Stack.Screen name="Onboarding" component={StyleQuiz} />
            <Stack.Screen name="Auth" component={AuthScreen} />

            {/* THE CORE LOOP (TABS) */}
            <Stack.Screen
                name="Home"
                component={MainTabs} // [MODIFIED] Point to Tabs
                options={{ animation: 'fade' }}
            />
            {/* RITUAL FLOW */}
            <Stack.Screen
                name="RitualDeck"
                component={RitualDeckScreen}
                options={{ animation: 'fade', gestureEnabled: false }}
            />

            <Stack.Screen
                name="Seal"
                component={SealScreen}
                options={{ animation: 'fade', gestureEnabled: false }}
            />

            {/* MODULES */}
            {/* Wardrobe and Profile are now in MainTabs */}

            <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="ItemPreview"
                component={ItemPreviewScreen}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen
                name="ItemDetailSheet"
                component={ItemPreviewScreen}
                options={{
                    presentation: 'transparentModal',
                    animation: 'none', // We'll handle animation inside or simple fade
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' }
                }}
            />
            <Stack.Screen
                name="Outfits"
                component={OutfitsHomeScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="CreateOutfit"
                component={CreateOutfitScreen}
                options={{
                    animation: 'slide_from_bottom',
                    gestureEnabled: false,
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="AIStylist"
                component={AIStylistChat}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="StylingCanvas"
                component={StylingCanvasScreen} // Use Lazy if needed, or import
                options={{
                    animation: 'fade',
                    headerShown: false,
                    gestureEnabled: false // Prevent swipe back during editing
                }}
            />
            <Stack.Screen
                name="SegmentationCorrection"
                component={SegmentationCorrectionScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
                name="OutfitDetail"
                component={OutfitDetailScreen}
                options={{ animation: 'slide_from_right', headerShown: false }}
            />
        </Stack.Navigator>
    );
};

