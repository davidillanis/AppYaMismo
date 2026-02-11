import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getUserById } from "@/src/domain/services/UserService";
import { UserForm } from "@/src/presentation/components/users/UserForm";
import { useUserMutation } from "@/src/presentation/hooks/useUserMutation";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
// 🔥 Importamos Alert para la confirmación
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditUserScreen() {
  const router = useRouter();
  const { id, userCache } = useLocalSearchParams(); 
  const userId = Number(id);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // --- LÓGICA DE CARGA (Igual que antes) ---S
  const cachedUser = useMemo(() => {
    if (typeof userCache === 'string') {
        try { return JSON.parse(userCache); } catch (e) { return null; }
    }
    return null;
  }, [userCache]);

  const { data: userWrapper, isLoading } = useQuery({
    queryKey: ["user-by-id", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
    initialData: cachedUser ? { data: cachedUser } as any : undefined,
  });

  const userData = userWrapper?.data || cachedUser;
  
  // 🔥 Importamos deleteUser e isDeleting
  const { updateUser, isUpdating} = useUserMutation();

  const handleSubmit = (values: any) => {
    const updatePayload = {
        name: values.name,
        lastName: values.lastName,
        dni: values.dni,
        phone: values.phone,
        address: values.address || "Dirección Genérica",
    };
    updateUser({ id: userId, data: updatePayload }, { onSuccess: () => router.back() });
  };

  

  const getSafeRole = (r: any) => {
    if (!r) return "CLIENTE";
    if (typeof r === 'string') return r;
    if (r.role) return r.role;
    if (Array.isArray(r) && r.length > 0) return typeof r[0] === 'string' ? r[0] : r[0].role;
    return "CLIENTE";
  };

  const initialValues = userData ? {
    name: userData.name,
    lastName: userData.lastName,
    dni: userData.dni,
    phone: userData.phone,
    email: userData.email,
    role: getSafeRole(userData.roles),
    license: (userData as any).license || "", 
    salary: (userData as any).salary ? String((userData as any).salary) : "",
  } : null;

  if (isLoading && !userData) {
    return (
        <View style={[styles.center, {backgroundColor: colors.background}]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{marginTop: 10, color: colors.text}}>Cargando información...</Text>
        </View>
    );
  }

  if (!userData) {
      return (
        <View style={[styles.center, {backgroundColor: colors.background}]}>
            <Ionicons name="alert-circle-outline" size={50} color="#ff4444" />
            <Text style={{marginTop: 10, color: colors.text}}>No se encontró el usuario.</Text>
            <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
                <Text style={{color: colors.primary, fontWeight: 'bold'}}>Volver</Text>
            </TouchableOpacity>
        </View>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
            <Text style={[styles.title, { color: colors.text }]}>Editar Usuario</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Envolvemos en un View flex para empujar el contenido */}
      <View style={{flex: 1}}>
          <UserForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isUpdating}
            colors={colors}
          />

          {/* 🔥 ZONA DE PELIGRO (Footer) 
          <View style={styles.dangerZone}>
            <View style={styles.divider} />
            <TouchableOpacity 
                style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]} 
                onPress={handleDelete}
                disabled={isDeleting}
            >
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                <Text style={styles.deleteText}>
                    {isDeleting ? "Eliminando..." : "Eliminar Usuario Definitivamente"}
                </Text>
            </TouchableOpacity>
          </View>
          */}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Estilos Zona Peligro
  dangerZone: { padding: 20, paddingBottom: 30 },
  divider: { height: 1, backgroundColor: "#eee", marginBottom: 20 },
  deleteButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 15, 
      borderRadius: 10, 
      backgroundColor: "#FFEBEE", // Rojo muy claro
      borderWidth: 1,
      borderColor: "#FFCDD2"
  },
  deleteText: { color: "#D32F2F", fontWeight: "bold", marginLeft: 8 }
});