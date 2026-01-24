import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from '../../system/firebase/firebaseConfig';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens/typography.tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { GlassCard } from '../primitives/GlassCard';
import * as Haptics from 'expo-haptics';

export const IdentityScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (u) => {
            setUser(u);
            if (u) {
                // Auto-route if already logged in (optional, maybe wait for user intent)
                // ritualMachine.toHome(); 
            }
        });
        return unsubscribe;
    }, []);

    const handleAnonymousSignIn = async () => {
        setIsAuthenticating(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await signInAnonymously(FIREBASE_AUTH);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            ritualMachine.toHome();
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <View style={styles.container}>
            <GlassCard style={styles.card}>
                <Text style={styles.title}>IDENTITY PROOF</Text>

                <Text style={styles.subtitle}>
                    Link your bio-signature to the Aether.
                    {'\n'}Your Style DNA will be preserved across devices.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAnonymousSignIn}
                    disabled={isAuthenticating}
                >
                    <Text style={styles.buttonText}>
                        {isAuthenticating ? "VERIFYING..." : "INITIATE NEURAL LINK"}
                    </Text>
                </TouchableOpacity>

                {user && (
                    <Text style={styles.status}>
                        LINK ESTABLISHED: {user.uid.slice(0, 8)}...
                    </Text>
                )}
            </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        justifyContent: 'center',
        padding: SPACING.GUTTER,
    },
    card: {
        padding: 32,
        alignItems: 'center',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 24,
        color: COLORS.ELECTRIC_COBALT,
        letterSpacing: 4,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.RITUAL_WHITE,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        backgroundColor: COLORS.ELECTRIC_COBALT,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 4,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontSize: 14,
    },
    status: {
        marginTop: 20,
        color: COLORS.EMERALD_DUSK,
        fontSize: 10,
        letterSpacing: 1,
    }
});
