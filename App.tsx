import { BackgroundProvider } from './ui/system/background/BackgroundContext';
import { FirewallRoot } from './runtime/firewallRoot';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { clearAllInventoryData } from './state/inventory/clearData';

// EMERGENCY: Clear cached data on boot to fix label mismatch
clearAllInventoryData();

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <BackgroundProvider>
                    <FirewallRoot />
                </BackgroundProvider>
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

