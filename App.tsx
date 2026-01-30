import { BackgroundProvider } from './ui/system/background/BackgroundContext';
import { FirewallRoot } from './runtime/firewallRoot';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { SafeZone } from './ui/system/SafeZone';

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <SafeZone name="Root">
                    <BackgroundProvider>
                        <FirewallRoot />
                    </BackgroundProvider>
                </SafeZone>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Pure black
    }
});

