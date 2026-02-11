import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ERole } from "@/src/domain/entities/UserEntity";
import { UserCard } from "@/src/presentation/components/users/UserCard";
import { useUserList } from "@/src/presentation/hooks/useUserList";
import { useUserMutation } from "@/src/presentation/hooks/useUserMutation";
// 🔥 1. Importamos el componente de filtro
import { ProductStatusFilter } from "@/src/presentation/components/filters/ProductStatusFilter";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Filtros visuales por Rol
const ROLE_FILTERS = [
  { id: "ALL", label: "Todos" },
  { id: ERole.CLIENTE, label: "Clientes" },
  { id: ERole.RESTAURANTE, label: "Gerentes" },
  { id: ERole.REPARTIDOR, label: "Repartidores" },
  { id: ERole.ADMINISTRADOR, label: "Admins" },
];

export default function UserManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  // 🔥 2. Estado para el filtro Activo/Inactivo
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // 1. Obtener todos los usuarios
  const { data: response, isLoading, refetch } = useUserList({
    size: 100, 
    fields: ["id", "name", "lastName", "email", "phone", "imageUrl", "enabled", "roles", "dni"],
  });

  const allUsers = response?.data?.content || [];
  const { updateUserAsync } = useUserMutation();

  // 2. Lógica de Filtrado (Texto + Rol + Estado)
  const filteredUsers = allUsers.filter((user) => {
    // A. Filtro Texto
    const fullName = `${user.name || ""} ${user.lastName || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    // B. Filtro Rol (Robusto)
    let matchesRole = false;
    if (selectedRole === "ALL") {
        matchesRole = true;
    } else {
        const r = user.roles as any;
        if (r) {
            if (r === selectedRole) matchesRole = true;
            else if (r.role === selectedRole) matchesRole = true;
            else if (Array.isArray(r)) {
                matchesRole = r.some((item: any) => 
                    (typeof item === 'string' && item === selectedRole) || 
                    (typeof item === 'object' && item.role === selectedRole)
                );
            }
        }
    }
    if (!matchesRole) return false;

    // 🔥 3. Filtro de Estado (Nuevo)
    if (selectedStatus === "ACTIVE" && user.enabled === false) return false;
    if (selectedStatus === "INACTIVE" && user.enabled === true) return false;

    return true;
  });

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    await updateUserAsync({ id: userId, data: { enabled: !currentStatus } });
    refetch();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>Gestión de Usuarios</Text>
        
        <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: colors.warning + '15' }]} 
            onPress={() => router.push('/(administrator)/users/create')}
        >
            <Ionicons name="person-add" size={20} color={colors.primary} />
            <Text style={[styles.createText, { color: colors.primary }]}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
                style={styles.input}
                placeholder="Buscar usuario..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
            />
        </View>
      </View>

      {/* Filtros: Roles + Estados */}
      <View style={styles.filterContainer}>
        {/* Roles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15, marginBottom: 5}}>
            {ROLE_FILTERS.map((filter) => {
                const isSelected = selectedRole === filter.id;
                return (
                    <TouchableOpacity
                        key={filter.id}
                        onPress={() => setSelectedRole(filter.id)}
                        style={[
                            styles.filterChip,
                            { 
                                backgroundColor: isSelected ? colors.primary : "#E0E0E0",
                                borderWidth: isSelected ? 0 : 1,
                                borderColor: "#ddd"
                            }
                        ]}
                    >
                        <Text style={[styles.filterText, { color: isSelected ? "#fff" : "#555" }]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

        {/* 🔥 4. UI del Filtro de Estado */}
        <View style={{ paddingHorizontal: 30 }}>
            <ProductStatusFilter
                selectedStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                colors={colors}
                backgroundColor={colors.background}
            />
        </View>
      </View>

      {/* Lista */}
      {isLoading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{marginTop: 10, color: '#666'}}>Cargando directorio...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
          renderItem={({ item }) => (
            // 🔥 AQUÍ AGREGAMOS LA NAVEGACIÓN A EDICIÓN
            <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => {
                    // Validación de seguridad: Si no tiene ID, no hacemos nada
                    if (!item.id) return;

                    router.push({
                        pathname: "/(administrator)/users/[id]",
                        params: { 
                            // 🛠️ CORRECCIÓN: Usamos '!' o '??'
                            // Opción A (Recomendada): item.id! le dice a TS "Confía en mí, el ID existe"
                            id: item.id!, 
                            
                            // Opción B (Alternativa segura): item.id ?? 0 
                            // id: item.id ?? 0,

                            userCache: JSON.stringify(item)
                        }
                    });
                }}
            >
                <UserCard 
                    user={item} 
                    colors={colors} 
                    onToggleStatus={handleToggleStatus} 
                />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
                <Ionicons name="people-circle-outline" size={60} color="#ccc" />
                <Text style={{color: "#999", marginTop: 10}}>No se encontraron usuarios.</Text>
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
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4
  },
  createText: { fontWeight: "600", fontSize: 13 },
  searchSection: { padding: 15, paddingBottom: 5 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: "#ddd" },
  input: { flex: 1, marginLeft: 10 },
  filterContainer: { marginTop: 10, marginBottom: 5 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterText: { fontWeight: "600", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
});