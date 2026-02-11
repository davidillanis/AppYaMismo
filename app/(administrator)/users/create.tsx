import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ERole } from "@/src/domain/entities/UserEntity";
import { UserForm } from "@/src/presentation/components/users/UserForm";
import { useUserMutation } from "@/src/presentation/hooks/useUserMutation"; // 🔥 Importamos el hook
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateUserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  
  // 🔥 Usamos la mutación centralizada
  const { createUser, isCreating } = useUserMutation();

  const handleSubmit = (values: any) => {
    // 1. Preparamos el UserDTO (Datos comunes)
    const userDTO = {
        name: values.name,
        lastName: values.lastName,
        dni: values.dni,
        phone: values.phone,
        address: "Dirección Genérica", // Puedes agregar un campo en el form si quieres
        imageUrl: "",
        email: values.email,
        password: values.password,
        roles: [values.role] // Enviamos el rol en el array
    };

    // 2. Preparamos el OperatorDTO (Solo si aplica)
    let operatorDTO = undefined;
    if (values.role === ERole.REPARTIDOR) {
        operatorDTO = {
            license: values.license,
            salary: Number(values.salary)
        };
    }

    // 3. Ejecutamos la mutación (El hook decide qué endpoint usar)
    createUser({
        role: values.role,
        userDTO: userDTO,
        operatorDTO: operatorDTO
    }, {
        onSuccess: () => {
            // Regresamos solo si fue exitoso
            router.back();
        }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Nuevo Usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <UserForm
        onSubmit={handleSubmit}
        isSubmitting={isCreating}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
});