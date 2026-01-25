import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';

export const PerfHUD = () => {
    const [fps, setFps] = useState(0);
    const [jsFps, setJsFps] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // UI FPS (Reanimated)
    const frameCount = useSharedValue(0);
    const lastFrameTimestamp = useSharedValue(0);

    useFrameCallback((frameInfo) => {
        if (!frameInfo.timestamp) return;
        if (lastFrameTimestamp.value === 0) {
            lastFrameTimestamp.value = frameInfo.timestamp;
            return;
        }
        const delta = frameInfo.timestamp - lastFrameTimestamp.value;
        if (delta >= 1000) {
            // Approx FPS
            // This logic runs on UI thread, we can't set state here easily without runOnJS
            // For simplicity, we'll just log stalls or store in shared value
            lastFrameTimestamp.value = frameInfo.timestamp;
            // frameCount.value = ...
        }
    });

    // JS FPS
    useEffect(() => {
        let lastTime = Date.now();
        let frames = 0;
        let loopId: number;

        const loop = () => {
            const now = Date.now();
            frames++;
            if (now - lastTime >= 1000) {
                setJsFps(frames);
                frames = 0;
                lastTime = now;
            }
            loopId = requestAnimationFrame(loop);
        };
        loopId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(loopId);
    }, []);

    // Override console.log to capture perf logs
    useEffect(() => {
        const originalLog = console.log;
        console.log = (...args) => {
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            if (msg.includes('[PERF]')) {
                setLogs(prev => [msg, ...prev].slice(0, 20));
            }
            originalLog(...args);
        };
        return () => {
            console.log = originalLog;
        };
    }, []);

    if (!__DEV__) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>JS FPS: {jsFps}</Text>
            <ScrollView style={styles.logContainer}>
                {logs.map((log, i) => (
                    <Text key={i} style={styles.logText}>{log}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 8,
        zIndex: 9999,
        width: 200,
        height: 150,
    },
    text: {
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logContainer: {
        marginTop: 4,
    },
    logText: {
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'monospace',
    }
});
