import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { forgotPassword } from "@/src/domain/services/AuthService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import {
    APK_CITY,
    APK_COMPANY_NAME,
    APK_NAME,
} from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { KeyboardAwareWrapper } from "@/src/presentation/components/form";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import Toast from "react-native-toast-message";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "normal"];

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async () => {
        if (!email) {
            Toast.show({
                type: "warning",
                text1: "Campo requerido",
                text2: "Por favor ingresa tu correo electrónico",
                visibilityTime: 3000,
                topOffset: 60,
            });
            return;
        }

        if (!emailRegex.test(email)) {
            Toast.show({
                type: "error",
                text1: "Correo inválido",
                text2: "Ingresa un correo electrónico válido",
                visibilityTime: 3000,
                topOffset: 60,
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await forgotPassword({ email });

            if (response.isSuccess) {
                Toast.show({
                    type: "success",
                    text1: "Email enviado",
                    text2: "Revisa tu correo (incluido spam)",
                    visibilityTime: 4000,
                    topOffset: 60,
                });
                router.replace({
                    pathname: "/ResetPassword",
                    params: { email },
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "No se pudo enviar",
                    text2: response.errors?.[0] || response.message || "Intenta de nuevo",
                    visibilityTime: 4000,
                    topOffset: 60,
                });
            }
        } catch (error) {
            let err = mappingError(error) as any;
            console.log(err);

            Toast.show({
                type: "error",
                text1: "Error",
                text2: err.data?.errors || "Ocurrió un error. Intenta nuevamente.",
                visibilityTime: 4000,
                topOffset: 60,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1, padding: 20, justifyContent: "center" },
        header: { alignItems: "center", marginBottom: 40 },
        logoBox: { marginBottom: 20 },
        logo: { width: 100, height: 50, resizeMode: "contain" },
        title: {
            fontSize: 28,
            fontWeight: "bold",
            color: colors.primary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
        },
        form: {
            backgroundColor: colors.card,
            padding: 24,
            borderRadius: 16,
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
        },
        inputBox: { marginBottom: 18 },
        label: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.textSecondary,
            marginBottom: 8,
            fontFamily: colors.fontPrimary,
        },
        inputWrap: {
            flexDirection: "row",
            alignItems: "center",
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
        btn: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
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
            fontWeight: "600",
            fontFamily: colors.fontPrimary,
        },
        loadingBox: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        loadingTxt: {
            color: colors.textInverse,
            marginLeft: 10,
            fontWeight: "600",
        },
        linkBox: { alignItems: "center", marginTop: 20 },
        linkTxt: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: "500",
            fontFamily: colors.fontSecondary,
        },
        instructions: {
            marginTop: 16,
            marginBottom: 12,
        },
        instructionsTitle: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
            marginBottom: 4,
            fontFamily: colors.fontPrimary,
        },
        instructionText: {
            fontSize: 13.5,
            color: colors.textSecondary,
            lineHeight: 19,
            fontFamily: colors.fontSecondary,
        },
        bold: {
            fontWeight: "600",
            color: colors.text,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            <KeyboardAwareWrapper contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Image
                            source={require("@/assets/images/logo.png")}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.title}>Recuperar Contraseña</Text>
                    <Text style={styles.subtitle}>
                        {APK_NAME} - {APK_COMPANY_NAME} {APK_CITY}
                    </Text>
                </View>


                {/* Instrucciones breves */}
                <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>Recuperar contraseña:</Text>
                    <Text style={styles.instructionText}>
                        1. Ingresa tu correo → <Text style={styles.bold}>Enviar</Text>
                        {"\n"}2. Revisa el email → copia el{" "}
                        <Text style={styles.bold}>código</Text>
                        {"\n"}3. Código + nueva contraseña →{" "}
                        <Text style={styles.bold}>Cambiar</Text>
                    </Text>
                </View>

                {/* Formulario */}
                <View style={styles.form}>
                    <View style={styles.inputBox}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={colors.textTertiary}
                                style={styles.icon}
                            />
                            <TextInput
                                placeholder="tu@correo.com"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.btn}
                        onPress={handleSubmit}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={colors.textInverse} />
                                <Text style={styles.loadingTxt}>Enviando...</Text>
                            </View>
                        ) : (
                            <Text style={styles.btnText}>Enviar Email</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkBox}
                        onPress={() => router.replace("/login")}
                    >
                        <Text style={styles.linkTxt}>← Volver al inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareWrapper>
        </SafeAreaView>
    );
}