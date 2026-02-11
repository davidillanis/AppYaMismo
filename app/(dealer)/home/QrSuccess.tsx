import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QrSuccess() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Animation Values
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const checkmarkScale = useSharedValue(0);
    const textTranslateY = useSharedValue(30);
    const buttonOpacity = useSharedValue(0);

    useEffect(() => {
        // Haptic feedback al entrar
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animación del círculo principal
        scale.value = withSequence(
            withTiming(0, { duration: 0 }),
            withSpring(1, {
                damping: 15,
                stiffness: 100,
                mass: 0.8
            })
        );

        // Animación del checkmark
        checkmarkScale.value = withDelay(
            300,
            withSpring(1, {
                damping: 12,
                stiffness: 150
            })
        );

        // Animación del texto
        opacity.value = withDelay(500, withTiming(1, { duration: 600 }));
        textTranslateY.value = withDelay(
            500,
            withSpring(0, { damping: 15 })
        );

        // Animación del botón
        buttonOpacity.value = withDelay(
            800,
            withTiming(1, { duration: 400 })
        );

        // Prevenir volver atrás con el botón físico
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleGoHome();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    const handleGoHome = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace('/(dealer)');
    };

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedCheckmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const animatedButtonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
    }));

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.surface, colors.background]}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Success Icon */}
                    <Animated.View style={[styles.iconContainer, animatedCircleStyle]}>
                        <LinearGradient
                            colors={['#4CAF50', colors.success]}
                            style={styles.successCircle}
                        >
                            <Animated.View style={animatedCheckmarkStyle}>
                                <Ionicons name="checkmark" size={80} color="#FFF" />
                            </Animated.View>
                        </LinearGradient>

                        {/* Decorative Rings */}
                        <View style={[styles.ring, styles.ring1]} />
                        <View style={[styles.ring, styles.ring2]} />
                    </Animated.View>

                    {/* Success Message */}
                    <Animated.View style={[styles.messageContainer, animatedTextStyle]}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            ¡Entrega Exitosa!
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            El pedido ha sido marcado como entregado correctamente
                        </Text>
                    </Animated.View>

                    {/* Order Details */}
                    <Animated.View style={[styles.detailsCard, { backgroundColor: colors.surface }, animatedTextStyle]}>
                        <View style={styles.detailRow}>
                            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                Pedido:
                            </Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                #{params.orderId || '0000'}
                            </Text>
                        </View>

                        {params.customerName && (
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={20} color={colors.success} />
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                    Cliente:
                                </Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {params.customerName}
                                </Text>
                            </View>
                        )}

                        {params.code && (
                            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                                <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
                                    {params.code}
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* Confirmation Message */}
                    <Animated.View style={[styles.confirmationBox, animatedTextStyle]}>
                        <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                        <Text style={[styles.confirmationText, { color: colors.textSecondary }]}>
                            La entrega ha sido registrada en el sistema
                        </Text>
                    </Animated.View>
                </View>

                {/* Action Button */}
                <Animated.View style={[styles.footer, animatedButtonStyle]}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleGoHome}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="home" size={22} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Volver al Inicio</Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 40,
        position: 'relative',
    },
    successCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    ring: {
        position: 'absolute',
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#4CAF50',
        opacity: 0.2,
    },
    ring1: {
        width: 160,
        height: 160,
        top: -10,
        left: -10,
    },
    ring2: {
        width: 180,
        height: 180,
        top: -20,
        left: -20,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
    },
    detailsCard: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        gap: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailLabel: {
        fontSize: 15,
        flex: 1,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        marginTop: 4,
    },
    codeLabel: {
        fontSize: 13,
        flex: 1,
    },
    codeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    confirmationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    confirmationText: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: 32,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
