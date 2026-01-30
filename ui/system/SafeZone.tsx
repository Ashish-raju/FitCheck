import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../../ui/tokens/color.tokens'; // Adjust path if needed
import { Image } from 'expo-image';
import * as Updates from 'expo-updates';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string; // For logging identity
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SafeZone extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[SafeZone:${this.props.name || 'Global'}] CRITICAL FAILURE:`, error, errorInfo);
        // TODO: Send to Sentry/Crashlytics here
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            console.log('Failed to reload, manual restart needed', e);
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>😵</Text>
                        <Text style={styles.title}>System Glitch</Text>
                        <Text style={styles.subtitle}>
                            Our style algorithms tripped over a loose thread.
                        </Text>
                        <Text style={styles.debugText}>
                            {this.state.error?.toString()}
                        </Text>

                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <Text style={styles.buttonText}>REBOOT SYSTEM</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 32,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 64,
        marginBottom: 24,
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    subtitle: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    debugText: {
        color: '#333',
        fontSize: 12,
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Courier',
    },
    button: {
        backgroundColor: '#FFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 100,
    },
    buttonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
