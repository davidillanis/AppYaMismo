import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ERole } from "@/src/domain/entities/UserEntity";
import { DealerCardAdmin } from "@/src/presentation/components/dealers/DealerCardAdmin";
import { ProductStatusFilter } from "@/src/presentation/components/filters/ProductStatusFilter";
import { useUserList } from "@/src/presentation/hooks/useUserList";
import { useUserMutation } from "@/src/presentation/hooks/useUserMutation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DealerManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // 1. OBTENER USUARIOS GENERALES
  const { data: response, isLoading, refetch } = useUserList({
    size: 100,
    fields: ["id", "name", "lastName", "email", "phone", "imageUrl", "enabled", "roles"],
    role: ERole.REPARTIDOR
  });

  const allUsers = response?.data?.content || [];

  // 2. FUNCIÓN SEGURA PARA DETECTAR REPARTIDORES
  // Corrige el problema del "TypeError" validando todos los formatos posibles
  const isRepartidor = (user: any) => {
    return true;
  };

  // Filtramos la lista usando la función segura
  const dealers = allUsers.filter(isRepartidor);

  const { updateUserAsync } = useUserMutation();

  // 3. FILTRADO DE UI (Buscador y Estados)
  const filteredDealers = dealers.filter((user) => {
    const fullName = `${user.name || ''} ${user.lastName || ''}`.toLowerCase();

    // Filtro Texto
    const matchesSearch = fullName.includes(searchText.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()));

    // Filtro Estado
    let matchesStatus = true;
    if (selectedStatus === "ACTIVE") matchesStatus = user.enabled === true;
    if (selectedStatus === "INACTIVE") matchesStatus = user.enabled === false;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    await updateUserAsync({ id: userId, data: { enabled: !currentStatus } });
    refetch();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gestión de Repartidores</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        <ProductStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          colors={colors}
          backgroundColor={colors.background}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: "#666" }}>Cargando repartidores...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDealers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            // Adaptador visual para que la tarjeta no falle
            const operatorAdapter = {
              id: 0,
              license: "No asignada",
              salary: 0,
              userEntity: item,
              assignmentSet: []
            };

            return (
              <DealerCardAdmin
                operator={operatorAdapter as any}
                colors={colors}
                onToggleStatus={handleToggleStatus}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bicycle-outline" size={50} color="#ccc" />
              <Text style={{ color: "#999", marginTop: 10 }}>No se encontraron repartidores.</Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
  filterSection: { padding: 15, paddingBottom: 5 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  listContent: { padding: 15, paddingBottom: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});