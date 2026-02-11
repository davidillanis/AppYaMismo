import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserCreateRequestDTO } from "@/src/domain/entities/UserEntity";
import { KeyboardAwareWrapper } from "@/src/presentation/components/form";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const { signUp, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    if (!name || !lastName || !dni || !phone || !email || !password || !confirmPassword) {
      Toast.show({
        type: "warning",
        text1: "Campos requeridos",
        text2: "Completa todos los campos",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Correo inválido",
        text2: "Por favor, ingresa un correo válido",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Contraseña",
        text2: "Las contraseñas no coinciden",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }

    const user: UserCreateRequestDTO = {
      name,
      lastName,
      dni,
      phone,
      address: "",
      imageUrl: "",
      email,
      password,
      roles: [],
    };

    try {
      await signUp(user);
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error de registro",
        text2: "Intenta nuevamente.",
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAwareWrapper contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Botón atrás */}
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.button }]} onPress={() => router.replace("/login")}
          >
            <Ionicons name="arrow-back" size={26} color={colors.textInverse} />
          </TouchableOpacity>

          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>CREAR CUENTA</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Regístrate para comenzar</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {[
              { icon: "person-outline", placeholder: "Nombre", value: name, set: setName },
              { icon: "person-outline", placeholder: "Apellido", value: lastName, set: setLastName },
              { icon: "id-card-outline", placeholder: "Documento de identidad", value: dni, set: setDni, keyboardType: "numeric" },
              { icon: "call-outline", placeholder: "Teléfono", value: phone, set: setPhone, keyboardType: "phone-pad" },
              { icon: "mail-outline", placeholder: "Correo electrónico", value: email, set: setEmail, keyboardType: "email-address" },
            ].map((f, i) => (
              <View style={styles.inputWrapper} key={i}>
                <Ionicons name={f.icon as any} size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder={f.placeholder}
                  style={styles.input}
                  placeholderTextColor="#999"
                  value={f.value}
                  onChangeText={f.set}
                  keyboardType={f.keyboardType as any}
                />
              </View>
            ))}

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirmar contraseña"
                style={styles.input}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Botón registrar */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.textInverse} />
                  <Text style={styles.loadingText}>Registrando...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>

            {/* Ir a Login */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.replace("/login")}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>¿Tienes una cuenta?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAwareWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 8,
    borderRadius: 50,
    zIndex: 2,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 70,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#000",
  },
  loginButton: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  forgotPassword: {
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 8,
  },
});

