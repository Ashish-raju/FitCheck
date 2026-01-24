/**
 * FIREWALL — RITUAL SCREEN v2
 * Rebuilt using pure primitives.
 */

import React from 'react';
import { View } from 'react-native';
import { VoidSurface } from '../primitives/VoidSurface';
import { AltarStage } from '../primitives/AltarStage';
import { CandidateSlab } from '../primitives/CandidateSlab';
import { SystemWhisper } from '../primitives/SystemWhisper';

export const RitualScreen: React.FC = () => {
    return (
        <VoidSurface>
            <AltarStage>
                <CandidateSlab>
                    <View style={{ width: 200, height: 300 }} />
                </CandidateSlab>

                <View style={{ marginTop: 24, alignItems: 'center' }}>
                    <SystemWhisper mode="ID">AESTHETIC VERIFIED</SystemWhisper>
                    <SystemWhisper mode="WHISPER">Calculating coherence...</SystemWhisper>
                </View>
            </AltarStage>
        </VoidSurface>
    );
};
