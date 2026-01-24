import { AppBackground } from './ui/system/background/AppBackground';
import { BackgroundProvider } from './ui/system/background/BackgroundContext';
import { FirewallRoot } from './runtime/firewallRoot';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <BackgroundProvider>
                <AppBackground />
                <FirewallRoot />
            </BackgroundProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
