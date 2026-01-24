import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
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
    const HIDDEN_ROUTES = ['Ritual', 'Seal', 'Camera', 'Void', 'Splash', 'Intro', 'Onboarding'];
    if (HIDDEN_ROUTES.includes(activeRouteName)) {
        return null;
    }

    const navItems: { label: string; icon: string; route: keyof RootStackParamList }[] = [
        { label: 'Today', icon: '○', route: 'Home' },
        { label: 'Closet', icon: '□', route: 'Wardrobe' },
        { label: 'Circle', icon: '◇', route: 'Social' },
        { label: 'Insights', icon: '△', route: 'Profile' },
    ];

    const handleNavigate = (route: keyof RootStackParamList) => {
        navigation.navigate(route);
    };

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const isActive = activeRouteName === item.route;
                return (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.navItem}
                        onPress={() => handleNavigate(item.route)}
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
