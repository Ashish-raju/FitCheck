/**
 * FIREWALL — SYSTEM WHISPER
 * Authority-locked text primitive.
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, formatCommand } from '../tokens';
import { COLORS } from '../tokens/color.tokens';

interface SystemWhisperProps {
    children: string;
    mode: 'ID' | 'WHISPER' | 'LOCK';
}

export const SystemWhisper: React.FC<SystemWhisperProps> = ({ children, mode }) => {
    const getStyle = () => {
        switch (mode) {
            case 'ID':
                return styles.id;
            case 'WHISPER':
                return styles.whisper;
            case 'LOCK':
                return styles.lock;
        }
    };

    return (
        <Text style={[styles.base, getStyle()]}>
            {mode === 'ID' || mode === 'LOCK' ? formatCommand(children) : children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        color: COLORS.MATTER_WHITE,
    },
    id: {
        fontFamily: TYPOGRAPHY.COMMAND_FONT,
        fontSize: TYPOGRAPHY.ID_SIZE,
        fontWeight: TYPOGRAPHY.ID_WEIGHT,
        letterSpacing: TYPOGRAPHY.ID_TRACKING,
    },
    whisper: {
        fontFamily: TYPOGRAPHY.COMMAND_FONT,
        fontSize: TYPOGRAPHY.WHISPER_SIZE,
        opacity: TYPOGRAPHY.WHISPER_OPACITY,
    },
    lock: {
        fontFamily: TYPOGRAPHY.AUTHORITY_FONT,
        fontSize: TYPOGRAPHY.LOCK_SIZE,
        letterSpacing: TYPOGRAPHY.LOCK_TRACKING,
        color: COLORS.AUTHORITY_WHITE,
    },
});
