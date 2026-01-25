import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { ritualMachine } from '../state/ritualMachine';
import { RitualHeader } from '../primitives/RitualHeader';
import { GlassCard } from '../primitives/GlassCard';
import { t } from '../../src/copy';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export const AIStylistChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Systems online. How can I assist with your visual intelligence today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            let aiResponse = "Analyzing your wardrobe... I recommend a high-contrast combination for today's context.";

            if (input.toLowerCase().includes('formal')) {
                aiResponse = "For formal contexts, prioritize your dark silhouettes. Calibrating specific options...";
            }

            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={{ flex: 1, paddingHorizontal: SPACING.GUTTER }}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => ritualMachine.toHome()}>
                        <Text style={styles.backLink}>← BACK</Text>
                    </TouchableOpacity>
                </View>

                <RitualHeader
                    subtitle="Neural Stylist"
                    title="Intelligence."
                />

                <ScrollView
                    ref={scrollRef}
                    style={styles.chatArea}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(m => (
                        <View key={m.id} style={[styles.messageRow, m.sender === 'user' ? styles.userRow : styles.aiRow]}>
                            <View style={[styles.bubble, m.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                                <Text style={styles.messageText}>{m.text}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder={t('chat.placeholder')}
                        placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendText}>{t('chat.send').toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
    },
    headerRow: {
        marginTop: 40,
        marginBottom: 8,
    },
    backLink: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.ELECTRIC_COBALT,
        letterSpacing: 1,
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        paddingVertical: 20,
    },
    messageRow: {
        marginBottom: 20,
        flexDirection: 'row',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '85%',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: SPACING.RADIUS.MEDIUM,
    },
    userBubble: {
        backgroundColor: COLORS.ELECTRIC_COBALT,
        borderBottomRightRadius: 2,
    },
    aiBubble: {
        backgroundColor: COLORS.SURFACE_MUTE,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    messageText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.RITUAL_WHITE,
        fontSize: 14,
        lineHeight: 22,
    },
    inputArea: {
        flexDirection: 'row',
        paddingVertical: 24,
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 56,
        backgroundColor: COLORS.SURFACE_MUTE,
        borderRadius: SPACING.RADIUS.MEDIUM,
        paddingHorizontal: 20,
        color: COLORS.RITUAL_WHITE,
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sendButton: {
        height: 56,
        paddingHorizontal: 24,
        backgroundColor: COLORS.RITUAL_WHITE,
        borderRadius: SPACING.RADIUS.MEDIUM,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        color: COLORS.DEEP_OBSIDIAN,
        letterSpacing: 1,
    }
});
