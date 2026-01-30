import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { TodayScreen } from '../system/TodayScreen';
import { WardrobeScreen } from '../system/WardrobeScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
import { COLORS } from '../tokens/color.tokens';
import { BlurView } from 'expo-blur';

import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Simple Icon component placeholder - replace with your icon library (e.g. Ionicons/Feather)
const TabIcon = ({ focused, label }: { focused: boolean; label: string }) => {
    const color = focused ? COLORS.ELECTRIC_VIOLET : 'rgba(255,255,255,0.4)';
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
            {/* You should replace this Text with an actual Icon */}
            <Text style={{ color, fontSize: 18, fontWeight: focused ? 'bold' : 'normal' }}>
                {label === 'Ritual' ? '⚡' : label === 'Wardrobe' ? '🧥' : '👤'}
            </Text>
            <Text style={{ color, fontSize: 10, marginTop: 4 }}>{label}</Text>
        </View>
    );
};

export const MainTabs = () => {
    return (
        <Tab.Navigator
            id="MainTabs"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#000000',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 85,
                },
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView tint="dark" intensity={80} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                    ) : null
                ),
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="RitualTab"
                component={TodayScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Ritual" />
                }}
            />
            <Tab.Screen
                name="WardrobeTab"
                component={WardrobeScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Wardrobe" />
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Profile" />
                }}
            />
        </Tab.Navigator>
    );
};
