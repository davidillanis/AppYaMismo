import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import { OrderHistoryCard } from "@/src/presentation/components/orders/OrderHistoryCard";
// 1. IMPORTAMOS EL NUEVO COMPONENTE
import { OrderStatusFilter, getFilterLabel } from "@/src/presentation/components/filters/OrderStatusFilter";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useOrderList } from "@/src/presentation/hooks/useOrderList";

export default function OrderHistoryClient() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const { user } = useAuth();

  // Estado del filtro
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading, refetch, isRefetching } = useOrderList({
    page: 0,
    size: 50,
    sortBy: "id",
    direction: "DESC",
    customerId: user?.id,
    fields: [
      "id",
      "total",
      "orderStatus",
      "createdAt",
      "qrToken",
      "pin",
      //"orderDetails",             // Obligatorio para inicializar el array
      "orderDetails.id",          // Añade el ID del detalle (ayuda a JPA a iterar)
      "orderDetails.amount",
      "orderDetails.subTotal",
      //"orderDetails.note",        // No olvides la nota que usas en el componente
      "orderDetails.product.name",
      "orderDetails.product.urlImage",
      "orderDetails.product.restaurant.name",
      "orderDetails.product.restaurant.address",

      "dealer.userEntity.name",
      "dealer.userEntity.lastName",
      "dealer.userEntity.phone",
      "dealer.userEntity.imageUrl",
    ],
  });

  const orders = data?.data?.content || [];

  // Lógica de filtrado
  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((order: OrderEntity) => order.orderStatus === statusFilter);
  }, [orders, statusFilter]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Mis Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 2. USAMOS EL COMPONENTE FILTRO */}
      <OrderStatusFilter
        selectedStatus={statusFilter}
        onSelectStatus={setStatusFilter}
        colors={colors}
        backgroundColor={colors.background}
      />

      {isLoading && !isRefetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>
            Cargando historial...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderHistoryCard order={item} colors={colors} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color="#ccc" />
              <Text style={styles.emptyText}>
                {statusFilter === "ALL"
                  ? "No se encontraron pedidos."
                  : `No hay pedidos ${getFilterLabel(statusFilter).toLowerCase()}.`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F4F6F8" // Gris azulado muy suave (Moderno)
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF", // Header blanco limpio
    // Sombra sutil para separar el header del contenido
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  backButton: { 
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5" // Botón gris claro
  },
  title: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#1A1A1A", // Negro casi puro
    letterSpacing: -0.5 
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 30 },
  
  // Empty State
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#888", marginTop: 15 },
});