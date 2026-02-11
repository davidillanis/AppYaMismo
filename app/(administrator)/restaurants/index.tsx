import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks de Dominio (Tus archivos analizados)
import { useRestaurantList } from "@/src/presentation/hooks/useRestaurantList";
import { useDeleteRestaurant, useUpdateRestaurant } from "@/src/presentation/hooks/useRestaurantMutation";

// Componentes
import { ProductStatusFilter } from "@/src/presentation/components/filters/ProductStatusFilter"; // Reutilizamos el filtro
import { RestaurantCardAdmin } from "@/src/presentation/components/restaurants/RestaurantCardAdmin";

export default function RestaurantManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Estados Locales
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL, ACTIVE, INACTIVE

  // 1. OBTENER DATOS
  // Pedimos todos los campos necesarios para la tarjeta
  const { data: response, isLoading, refetch } = useRestaurantList({
    fields: ["id", "name", "address", "urlImagen", "enabled", "restaurantTypes.name"],
    size: 100, // Traemos suficientes para scroll
  });

  const restaurants = response?.data?.content || [];

  // 2. MUTACIONES
  const updateMutation = useUpdateRestaurant();
  const deleteMutation = useDeleteRestaurant();

  // --- LÓGICA DE FILTRADO (Cliente) ---
  const filteredRestaurants = restaurants.filter((r) => {
    // Filtro por Nombre
    const matchesSearch = r.name.toLowerCase().includes(searchText.toLowerCase());
    
    // Filtro por Estado
    let matchesStatus = true;
    if (selectedStatus === "ACTIVE") matchesStatus = r.enabled === true;
    if (selectedStatus === "INACTIVE") matchesStatus = r.enabled === false;

    return matchesSearch && matchesStatus;
  });

  // --- HANDLERS ---
  
  // A. Cambiar Estado (Switch)
  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      payload: { enabled: !currentStatus }
    });
  };

  // B. Eliminar
  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Restaurante",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => deleteMutation.mutate(id) 
        }
      ]
    );
  };

  // C. Editar (Navegación)
  const handleEdit = (id: number) => {
    // Navegar a la pantalla de edición (que crearemos luego)
    router.push({ pathname: "/(administrator)/restaurants/edit", params: { id } } as any);
  };

  // D. Crear (Navegación)
  const handleCreate = () => {
    router.push("/(administrator)/restaurants/create");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header Simple con Botón Atrás */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gestión de Restaurantes</Text>
        <View style={[{ width: 24 }, { backgroundColor: colors.text }]} /> 
      </View>

      {/* Buscador y Filtros */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar restaurante..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
            />
        </View>

        {/* Filtro Activo/Inactivo */}
        <ProductStatusFilter
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            colors={colors}
            backgroundColor={colors.background}
        />
      </View>

      {/* Lista de Restaurantes */}
      {isLoading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textSecondary }}>Cargando restaurantes...</Text>
        </View>
      ) : (
        <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <RestaurantCardAdmin
                    restaurant={item}
                    colors={colors}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            )}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Ionicons name="storefront-outline" size={50} color="#ccc" />
                    <Text style={{ color: "#999", marginTop: 10 }}>No se encontraron restaurantes.</Text>
                </View>
            }
            refreshing={isLoading}
            onRefresh={refetch}
        />
      )}

      {/* FAB para Crear Nuevo */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreate}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

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
  filterSection: {
    padding: 15,
    paddingBottom: 5,
  },
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
  listContent: { padding: 15, paddingBottom: 80 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
});