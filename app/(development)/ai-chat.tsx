import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { chatAsk } from '@/src/domain/services/AiService';
import { ResponseStatusDTO } from '@/src/domain/types/ResponseStatusDTO';
import { mappingError } from '@/src/infrastructure/configuration/security/DecodeToken';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { useAuth } from '@/src/presentation/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isError?: boolean;
}

const ChatScreen: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];
    const { width } = useWindowDimensions();
    const normalize = (size: number) => normalizeScreen(size, width);
    const styles = createStyles(colors, normalize);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Generate a random session ID if not available, or use user ID
    const sessionId = user?.id ? String(user.id) : 'guest-session-' + Date.now();

    useEffect(() => {
        // Initial greeting
        const initialMessage: Message = {
            id: 'init-1',
            text: `Hola ${user?.name || 'invitado'}, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
            sender: 'ai',
            timestamp: new Date(),
        };
        setMessages([initialMessage]);
    }, []);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Scroll to bottom
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

            const response: ResponseStatusDTO<string> = await chatAsk(userMessage.text, sessionId);

            if (response && response.data) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: response.data,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                // Handle error or empty response
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Lo siento, no pude procesar tu solicitud en este momento.",
                    sender: 'ai',
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages((prev) => [...prev, errorMessage]);
            }

        } catch (error) {
            console.error("Error asking AI:", mappingError(error));
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Ocurrió un error de conexión. Por favor intenta nuevamente.",
                sender: 'ai',
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessage : styles.aiMessage
            ]}>
                {!isUser && (
                    <View style={[styles.avatarContainer, item.isError && { backgroundColor: colors.error }]}>
                        <Ionicons name={item.isError ? "alert-circle" : "logo-android"} size={normalize(20)} color="#FFFFFF" />
                    </View>
                )}
                <View style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                    item.isError && { backgroundColor: colors.errorLight, borderColor: colors.error }
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.aiMessageText,
                        item.isError && { color: colors.error }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.timestamp,
                        isUser ? styles.userTimestamp : styles.aiTimestamp,
                        item.isError && { color: colors.error }
                    ]}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {isUser && (
                    <View style={styles.userAvatarContainer}>
                        <Ionicons name="person" size={normalize(20)} color="#FFFFFF" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    accessibilityLabel="Volver"
                    accessibilityRole="button"
                >
                    <Ionicons name="arrow-back" size={normalize(24)} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Asistente Virtual</Text>
                    <Text style={styles.headerSubtitle}>Siempre disponible</Text>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-vertical" size={normalize(24)} color={colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    keyboardDismissMode="on-drag"
                />

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.loadingText}>Escribiendo...</Text>
                    </View>
                )}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        maxLength={500}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !inputText.trim() && styles.sendButtonDisabled,
                            inputText.trim() && { elevation: 4 }
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        accessibilityLabel="Enviar mensaje"
                        accessibilityRole="button"
                        activeOpacity={0.7}
                    >
                        <Ionicons name={isLoading ? "hourglass" : "send"} size={normalize(20)} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (colors: any, normalize: (size: number) => number) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: normalize(16),
            paddingVertical: normalize(12),
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
            elevation: 2,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            zIndex: 10,
        },
        backButton: {
            padding: normalize(8),
            marginRight: normalize(8),
        },
        headerTitleContainer: {
            flex: 1,
        },
        headerTitle: {
            fontSize: normalize(18),
            fontWeight: 'bold',
            color: colors.text,
            fontFamily: colors.fontPrimary,
        },
        headerSubtitle: {
            fontSize: normalize(12),
            color: colors.success,
            fontFamily: colors.fontSecondary,
        },
        menuButton: {
            padding: normalize(8),
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        messagesList: {
            paddingHorizontal: normalize(16),
            paddingTop: normalize(16),
            paddingBottom: normalize(16),
        },
        messageContainer: {
            flexDirection: 'row',
            marginBottom: normalize(16),
            alignItems: 'flex-end',
            maxWidth: '85%',
        },
        userMessage: {
            alignSelf: 'flex-end',
            justifyContent: 'flex-end',
        },
        aiMessage: {
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
        },
        avatarContainer: {
            width: normalize(32),
            height: normalize(32),
            borderRadius: normalize(16),
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: normalize(8),
            elevation: 2,
        },
        userAvatarContainer: {
            width: normalize(32),
            height: normalize(32),
            borderRadius: normalize(16),
            backgroundColor: colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: normalize(8),
            elevation: 2,
        },
        bubble: {
            padding: normalize(12),
            borderRadius: normalize(16),
            maxWidth: '100%',
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
        },
        userBubble: {
            backgroundColor: colors.primary,
            borderBottomRightRadius: normalize(4),
        },
        aiBubble: {
            backgroundColor: colors.card,
            borderBottomLeftRadius: normalize(4),
            borderWidth: 1,
            borderColor: colors.border,
        },
        messageText: {
            fontSize: normalize(15),
            lineHeight: normalize(20),
            fontFamily: colors.fontPrimary,
        },
        userMessageText: {
            color: '#FFFFFF',
        },
        aiMessageText: {
            color: colors.text,
        },
        timestamp: {
            fontSize: normalize(10),
            marginTop: normalize(4),
            alignSelf: 'flex-end',
            fontFamily: colors.fontSecondary,
        },
        userTimestamp: {
            color: 'rgba(255, 255, 255, 0.7)',
        },
        aiTimestamp: {
            color: colors.textSecondary,
        },
        loadingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: normalize(10),
            marginLeft: normalize(16),
            backgroundColor: colors.card,
            alignSelf: 'flex-start',
            borderRadius: normalize(16),
            marginBottom: normalize(10),
            borderBottomLeftRadius: normalize(4),
        },
        loadingText: {
            marginLeft: normalize(8),
            color: colors.textSecondary,
            fontSize: normalize(12),
            fontFamily: colors.fontSecondary,
            fontStyle: 'italic',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: normalize(16),
            paddingVertical: normalize(12),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
        },
        input: {
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: normalize(24),
            paddingHorizontal: normalize(16),
            paddingVertical: normalize(10),
            fontSize: normalize(15),
            color: colors.text,
            maxHeight: normalize(100),
            marginRight: normalize(12),
            borderWidth: 1,
            borderColor: colors.border,
            fontFamily: colors.fontPrimary,
        },
        sendButton: {
            width: normalize(44),
            height: normalize(44),
            borderRadius: normalize(22),
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
        },
        sendButtonDisabled: {
            backgroundColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
        },
    });

export default ChatScreen;
