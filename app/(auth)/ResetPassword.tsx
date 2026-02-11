import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { resetPassword } from '@/src/domain/services/AuthService';
import { mappingError } from '@/src/infrastructure/configuration/security/DecodeToken';
import {
    APK_CITY,
    APK_COMPANY_NAME,
    APK_NAME,
} from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { KeyboardAwareWrapper } from '@/src/presentation/components/form';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email: urlEmail } = useLocalSearchParams<{
        email?: string;
    }>();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'normal'];

    const [email] = useState(urlEmail || '');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async () => {
        // Validación básica
        if (!newPassword) {
            Toast.show({
                type: 'warning',
                text1: 'Campo requerido',
                text2: 'Ingresa tu nueva contraseña',
                visibilityTime: 3000,
                topOffset: 60,
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Contraseña corta',
                text2: 'Mínimo 6 caracteres',
                visibilityTime: 3000,
                topOffset: 60,
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await resetPassword({
                token,
                newPassword,
                email,
            });

            if (response.isSuccess) {
                Toast.show({
                    type: 'success',
                    text1: '¡Contraseña actualizada!',
                    text2: response.message || 'Ya puedes iniciar sesión',
                    visibilityTime: 4000,
                    topOffset: 60,
                });
                setTimeout(() => router.replace('/login'), 2000);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.errors?.[0] || response.message || 'Intenta de nuevo',
                    visibilityTime: 4000,
                    topOffset: 60,
                });
            }
        } catch (error) {
            let err = mappingError(error) as any;

            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.data?.errors || 'Revisa tu conexión',
                visibilityTime: 4000,
                topOffset: 60,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1, padding: 20, justifyContent: 'center' },

        header: { alignItems: 'center', marginBottom: 40 },
        logoBox: { marginBottom: 20 },
        logo: { width: 100, height: 50, resizeMode: 'contain' },
        title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
        subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

        form: {
            backgroundColor: colors.card,
            padding: 24,
            borderRadius: 16,
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
        },

        inputBox: { marginBottom: 18 },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 8,
            fontFamily: colors.fontPrimary,
        },
        inputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            backgroundColor: colors.surface,
            minHeight: 52,
        },
        icon: { marginRight: 10 },
        input: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
            paddingVertical: 14,
            fontFamily: colors.fontSecondary,
        },
        inputReadOnly: {
            color: colors.textTertiary,
        },
        eye: { padding: 6 },

        btn: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 12,
            elevation: 3,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
        },
        btnText: {
            color: colors.textInverse,
            fontSize: 16,
            fontWeight: '600',
            fontFamily: colors.fontPrimary,
        },

        loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
        loadingTxt: { color: colors.textInverse, marginLeft: 10, fontWeight: '600' },

        linkBox: { alignItems: 'center', marginTop: 20 },
        linkTxt: { color: colors.primary, fontSize: 14, fontWeight: '500', fontFamily: colors.fontSecondary },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            <KeyboardAwareWrapper contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
                    </View>
                    <Text style={styles.title}>Restablecer Contraseña</Text>
                    <Text style={styles.subtitle}>
                        {APK_NAME} – {APK_COMPANY_NAME} {APK_CITY}
                    </Text>
                </View>


                {/* Formulario */}
                <View style={styles.form}>
                    {/* Email (solo lectura) */}
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.icon} />
                            <TextInput
                                value={email}
                                editable={false}
                                style={[styles.input, styles.inputReadOnly]}
                            />
                        </View>
                    </View>

                    {/* Token (editable) */}
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Código de Verificación</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="key-outline" size={20} color={colors.textTertiary} style={styles.icon} />
                            <TextInput
                                placeholder="Ej: X12k9P"
                                value={token}
                                onChangeText={setToken}
                                style={styles.input}
                                placeholderTextColor={colors.textTertiary}
                                autoCapitalize="none"
                                keyboardType="default"
                            />
                        </View>
                    </View>

                    {/* Nueva contraseña */}
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Nueva Contraseña</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.icon} />
                            <TextInput
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                autoComplete="password-new"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                style={styles.input}
                                placeholderTextColor={colors.textTertiary}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Botón */}
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={handleSubmit}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={colors.textInverse} />
                                <Text style={styles.loadingTxt}>Guardando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.btnText}>Cambiar Contraseña</Text>
                        )}
                    </TouchableOpacity>

                    {/* Volver */}
                    <TouchableOpacity style={styles.linkBox} onPress={() => router.replace('/login')}>
                        <Text style={styles.linkTxt}>← Volver al inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareWrapper>
        </SafeAreaView>
    );
}