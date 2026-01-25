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
import { TodayScreen } from '../system/TodayScreen';
import { RitualDeckScreen } from '../ritual/RitualDeckScreen';
import { SealScreen } from '../seal/SealScreen';
import { WardrobeScreen } from '../system/WardrobeScreen';
import { InsightsScreen } from '../system/InsightsScreen';
import { CameraScreen } from '../system/CameraScreen';
import { ItemPreviewScreen } from '../system/ItemPreviewScreen';
import { SocialScreen } from '../system/SocialScreen';
import { AIStylistChat } from '../system/AIStylistChat';
import { SegmentationCorrectionScreen } from '../vision/SegmentationCorrectionScreen';

// Define Route Params
export type RootStackParamList = {
    Void: undefined;
    Splash: undefined;
    Intro: undefined;
    Onboarding: undefined;
    Auth: undefined;
    Home: undefined; // TodayScreen
    RitualDeck: undefined; // New Deck Screen
    Seal: undefined;
    Wardrobe: undefined;
    Profile: undefined; // InsightsScreen
    Camera: undefined;
    ItemPreview: undefined; // Item Preview Screen
    Social: undefined; // FriendsFeed
    AIStylist: undefined;
    SegmentationCorrection: { imageUri: string; maskUri: string; onConfirm: (uri: string) => void; onCancel: () => void };
};

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
            initialRouteName="Void"
            screenOptions={SCREEN_OPTIONS}
        >
            {/* SYSTEM BOOT */}
            <Stack.Screen name="Void" component={VoidScreen} />
            <Stack.Screen name="Splash" component={SplashSequence} />
            <Stack.Screen name="Intro" component={IntroSlideshow} />
            <Stack.Screen name="Onboarding" component={StyleQuiz} />
            <Stack.Screen name="Auth" component={AuthScreen} />

            {/* THE CORE LOOP */}
            <Stack.Screen
                name="Home"
                component={TodayScreen}
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
            <Stack.Screen
                name="Wardrobe"
                component={WardrobeScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="Profile"
                component={InsightsScreen}
                options={{ animation: 'slide_from_right' }}
            />
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
                name="Social"
                component={SocialScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="AIStylist"
                component={AIStylistChat}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="SegmentationCorrection"
                component={SegmentationCorrectionScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
};
