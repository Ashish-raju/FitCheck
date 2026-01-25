import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, MATERIAL } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { useAuth } from '../../context/auth/AuthProvider';
import * as Haptics from 'expo-haptics';

export const AuthScreen: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (mode === 'signup' && !displayName) {
            setError('Please enter your name');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (mode === 'signin') {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
        Haptics.selectionAsync();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>FIT CHECK</Text>
                    <Text style={styles.tagline}>
                        {mode === 'signin' ? 'Welcome back' : 'Create your wardrobe'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {mode === 'signup' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>NAME</Text>
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Your name"
                                placeholderTextColor={MATERIAL.TEXT_MUTED}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>EMAIL</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            placeholderTextColor={MATERIAL.TEXT_MUTED}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>PASSWORD</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor={MATERIAL.TEXT_MUTED}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={MATERIAL.TEXT_MAIN} />
                        ) : (
                            <Text style={styles.submitText}>
                                {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleMode}
                        disabled={loading}
                    >
                        <Text style={styles.toggleText}>
                            {mode === 'signin'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MATERIAL.BACKGROUND,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.GUTTER,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 32,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: MATERIAL.TEXT_MAIN,
        letterSpacing: 4,
        marginBottom: 8,
    },
    tagline: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: MATERIAL.TEXT_MUTED,
        letterSpacing: 1,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: MATERIAL.TEXT_MUTED,
        letterSpacing: 2,
        marginBottom: 8,
    },
    input: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 16,
        color: MATERIAL.TEXT_MAIN,
        backgroundColor: MATERIAL.CARD,
        borderWidth: 1,
        borderColor: MATERIAL.BORDER,
        borderRadius: SPACING.RADIUS.MEDIUM,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
        borderRadius: SPACING.RADIUS.MEDIUM,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 12,
        color: '#FF3B30',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: COLORS.ELECTRIC_BLUE,
        borderRadius: SPACING.RADIUS.MEDIUM,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: MATERIAL.TEXT_MAIN,
        letterSpacing: 2,
    },
    toggleButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 12,
        color: MATERIAL.TEXT_MUTED,
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        color: MATERIAL.TEXT_MUTED,
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 16,
    },
});
