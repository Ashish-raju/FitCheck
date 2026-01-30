import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { RootStackParamList } from '../navigation/AppNavigator';

interface PersistentNavProps {
    activeRouteName: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * PersistentNav - The global bottom navigation model for Fit Check.
 * Contextual: Hidden during RITUAL and SEAL phases to maximize focus.
 */
export const PersistentNav: React.FC<PersistentNavProps> = ({ activeRouteName }) => {
    const navigation = useNavigation<NavigationProp>();

    // Hide if in immersive screens
    const HIDDEN_ROUTES = ['Ritual', 'Seal', 'Camera', 'Void', 'Splash', 'Intro', 'Onboarding', 'RitualDeck', 'ItemPreview', 'CreateOutfit', 'OutfitDetail', 'ItemDetailSheet'];
    if (HIDDEN_ROUTES.includes(activeRouteName)) {
        return null;
    }

    const navItems = [
        { label: 'Today', icon: '○', match: 'RitualTab', route: 'Home', params: { screen: 'RitualTab' } },
        { label: 'Closet', icon: '□', match: 'WardrobeTab', route: 'Home', params: { screen: 'WardrobeTab' } },
        { label: 'Outfits', icon: '∞', match: 'Outfits', route: 'Outfits', params: undefined },
        { label: 'Insights', icon: '△', match: 'ProfileTab', route: 'Home', params: { screen: 'ProfileTab' } },
    ];

    const handleNavigate = (route: string, params?: any) => {
        // @ts-ignore - Dynamic navigation
        navigation.navigate(route, params);
    };

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                // If we are in 'Home' (root) but unknown tab, default check? 
                // Actually activeRouteName is likely the leaf name (RitualTab, etc)
                const isActive = activeRouteName === item.match || (activeRouteName === 'Home' && item.match === 'RitualTab');

                return (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.navItem}
                        onPress={() => handleNavigate(item.route, item.params)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.icon, isActive && styles.activeIcon]}>{item.icon}</Text>
                        <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 85,
        backgroundColor: COLORS.ABYSSAL_BLUE,
        borderTopWidth: 1,
        borderTopColor: MATERIAL.BORDER,
        paddingBottom: 25,
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute', // FLOAT ABOVE
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    icon: {
        fontSize: 24,
        color: MATERIAL.TEXT_MUTED,
        marginBottom: 4,
    },
    activeIcon: {
        color: COLORS.ELECTRIC_BLUE,
    },
    label: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: MATERIAL.TEXT_MUTED,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    activeLabel: {
        color: MATERIAL.TEXT_MAIN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    },
});
