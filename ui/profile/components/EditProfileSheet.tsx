import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, MATERIAL } from '../../tokens/color.tokens';
import { UserService, UserProfile } from '../../../services/UserService';
import { BlurView } from 'expo-blur';
import { FIREBASE_AUTH } from '../../../system/firebase/firebaseConfig';

interface EditProfileSheetProps {
    visible: boolean;
    onClose: () => void;
    currentProfile: UserProfile | null;
}

export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({ visible, onClose, currentProfile }) => {
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProfile) {
            setName(currentProfile.displayName || '');
            setCity(currentProfile.city || '');
            setGender(currentProfile.gender || '');
            setHeight(currentProfile.height ? currentProfile.height.toString() : '');
            setWeight(currentProfile.weight ? currentProfile.weight.toString() : '');
        }
    }, [currentProfile, visible]);

    const handleSave = async () => {
        const uid = FIREBASE_AUTH.currentUser?.uid;
        if (!uid) return;

        setLoading(true);
        try {
            await UserService.getInstance().updateProfile(uid, {
                displayName: name,
                city,
                gender,
                height: height ? parseFloat(height) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
            });
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            // TODO: Add toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <BlurView intensity={20} tint="dark" style={styles.sheetContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <InputField label="Display Name" value={name} onChangeText={setName} placeholder="Your name" />
                        <InputField label="City" value={city} onChangeText={setCity} placeholder="e.g. New York" />

                        <View style={styles.row}>
                            <InputField label="Gender" value={gender} onChangeText={setGender} placeholder="Optional" style={{ flex: 1, marginRight: 8 }} />
                        </View>
                        <View style={styles.row}>
                            <InputField label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="175" style={{ flex: 1, marginRight: 8 }} />
                            <InputField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="70" style={{ flex: 1 }} />
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={COLORS.RITUAL_WHITE} /> : <Text style={styles.saveText}>Save Changes</Text>}
                    </TouchableOpacity>
                </BlurView>
            </View>
        </Modal>
    );
};

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, style }: any) => (
    <View style={[styles.inputContainer, style]}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.MUTED_ASH}
            keyboardType={keyboardType}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheetContainer: {
        backgroundColor: COLORS.DEEP_NAVY,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        color: COLORS.ASH_GRAY,
        fontSize: 16,
    },
    content: {
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        color: COLORS.ASH_GRAY,
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: COLORS.CARBON_BLACK,
        borderRadius: 12,
        padding: 16,
        color: COLORS.RITUAL_WHITE,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.GLASS_BORDER,
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: COLORS.ELECTRIC_VIOLET,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveText: {
        color: COLORS.RITUAL_WHITE,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
