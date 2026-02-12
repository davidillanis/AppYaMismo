import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { OrderStatusFilter } from "@/src/presentation/components/filters/OrderStatusFilter";
import { OrderCardAdmin } from "@/src/presentation/components/orders/OrderCardAdmin";
import { useOrderList } from "@/src/presentation/hooks/useOrderList";
import { useUpdateOrder } from "@/src/presentation/hooks/useOrderMutation";
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

export default function OrderManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchText, setSearchText] = useState("");

  const { data: response, isLoading, refetch } = useOrderList({
    status: selectedStatus !== "ALL" ? (selectedStatus as EOrderStatus) : undefined,
    size: 50,
    // 🔥 CORRECCIÓN: Solicitamos los campos anidados userEntity.name y lastName
    fields: [
      "id",
      "orderStatus",
      "total",
      "createdAt",
      "customer.userEntity.name",
      "customer.userEntity.lastName"
    ]
  });

  const orders = response?.data?.content || [];
  const updateMutation = useUpdateOrder();

  const filteredOrders = orders.filter((o: OrderEntity) => {
    // 🔥 CORRECCIÓN: Acceso seguro a userEntity
    const customerName = o.customer?.userEntity?.name || "";
    const customerLastName = o.customer?.userEntity?.lastName || "";
    const fullName = `${customerName} ${customerLastName}`.toLowerCase();

    return fullName.includes(searchText.toLowerCase()) || String(o.id).includes(searchText);
  });

  const handleUpdateStatus = (id: number, newStatus: EOrderStatus) => {
    if (newStatus === EOrderStatus.RECHAZADO || newStatus === EOrderStatus.CANCELADO) {
      Alert.alert(
        "Confirmar Acción",
        `¿Estás seguro de marcar el pedido #${id} como ${newStatus}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: () => executeUpdate(id, newStatus) }
        ]
      );
    } else {
      executeUpdate(id, newStatus);
    }
  };

  const executeUpdate = (id: number, orderStatus: EOrderStatus) => {
    updateMutation.mutate(
      { id, payload: { orderStatus } },
      { onError: () => Alert.alert("Error", "No se pudo actualizar el estado") }
    );
  };

  const handleViewDetails = (order: OrderEntity) => {
    Alert.alert("Detalle", "Próximamente: Vista detallada del pedido " + order.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gestión de Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente o ID..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        <OrderStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          colors={colors}
          backgroundColor={colors.background}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: "#666" }}>Cargando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OrderCardAdmin
              order={item}
              colors={colors}
              onUpdateStatus={handleUpdateStatus}
              onViewDetails={handleViewDetails}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={50} color="#ccc" />
              <Text style={{ color: "#999", marginTop: 10 }}>No hay pedidos en este estado.</Text>
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