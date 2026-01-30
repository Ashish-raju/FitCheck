import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import { COLORS, MATERIAL } from '../../../tokens/color.tokens';

interface TravelPackModalProps {
    visible: boolean;
    onClose: () => void;
    onGenerate: (data: any) => void;
}

const PURPOSES = ['Vacation', 'Business', 'Adventure', 'Wedding', 'Date Night'];

// Simple Icons
const Icon = ({ name, color, size = 16 }: { name: string, color: string, size?: number }) => {
    let d = "M10,10 L90,10 L90,90 L10,90 Z"; // Default box
    if (name === 'pin') d = "M50,10 C70,10 80,30 50,90 C20,30 30,10 50,10"; // Pin
    else if (name === 'clock') d = "M50,10 C28,10 10,28 10,50 C10,72 28,90 50,90 C72,90 90,72 90,50 C90,28 72,10 50,10 M50,20 L50,50 L80,50"; // Clock
    else if (name === 'suit') d = "M30,30 L70,30 L70,80 L30,80 M40,30 L40,10 L60,10 L60,30"; // Suitcase
    else if (name === 'purpose') d = "M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z"; // Star/Purpose

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ marginRight: 6 }}>
            <Path d={d} stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
    );
};

export const TravelPackModal: React.FC<TravelPackModalProps> = ({ visible, onClose, onGenerate }) => {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState(3);
    const [purpose, setPurpose] = useState('Vacation');

    const handleGenerate = () => {
        onGenerate({
            destination,
            duration,
            purpose,
            season: 'Summer' // Default for now
        });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <Icon name="suit" color={COLORS.RITUAL_WHITE} size={24} />
                        <Text style={styles.title}>Plan a Trip</Text>
                    </View>

                    {/* Destination */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Icon name="pin" color={COLORS.ASH_GRAY} />
                            <Text style={styles.label}>DESTINATION</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Paris, Goa"
                            placeholderTextColor={MATERIAL.TEXT_MUTED}
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </View>

                    {/* Duration */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Icon name="clock" color={COLORS.ASH_GRAY} />
                            <Text style={styles.label}>DURATION: {duration} DAYS</Text>
                        </View>
                        <Slider
                            style={{ height: 40 }}
                            minimumValue={1}
                            maximumValue={30}
                            step={1}
                            value={duration}
                            onSlidingComplete={setDuration}
                            minimumTrackTintColor={COLORS.ELECTRIC_BLUE}
                            thumbTintColor={COLORS.RITUAL_WHITE}
                        />
                    </View>

                    {/* Purpose */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Icon name="purpose" color={COLORS.ASH_GRAY} />
                            <Text style={styles.label}>PURPOSE</Text>
                        </View>
                        <View style={styles.chipGrid}>
                            {PURPOSES.map(p => {
                                const active = purpose === p;
                                return (
                                    <TouchableOpacity
                                        key={p}
                                        style={[styles.chip, active && styles.chipActive]}
                                        onPress={() => setPurpose(p)}
                                    >
                                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                        <Text style={styles.generateBtnText}>Generate Pack</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    title: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        color: COLORS.ASH_GRAY,
        fontSize: 10,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        color: COLORS.RITUAL_WHITE,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    chipActive: {
        backgroundColor: COLORS.ELECTRIC_BLUE,
    },
    chipText: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
    },
    chipTextActive: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
    },
    generateBtn: {
        backgroundColor: COLORS.RITUAL_WHITE,
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 12,
    },
    generateBtnText: {
        color: COLORS.VOID_BLACK,
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeBtn: {
        alignItems: 'center',
        padding: 8,
    },
    closeText: {
        color: COLORS.ASH_GRAY,
    }
});
