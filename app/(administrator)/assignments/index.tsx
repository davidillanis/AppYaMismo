import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { DealerSelectorModal } from "@/src/presentation/components/assignments/DealerSelectorModal";
// 🔥 CAMBIO 1: Usamos useUpdateOrder en lugar de useAcceptOrder
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
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssignmentManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE">("PENDING");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const targetStatus = activeTab === "PENDING" ? EOrderStatus.PENDIENTE : EOrderStatus.EN_CAMINO;

  const { data: response, isLoading, refetch } = useOrderList({
    status: targetStatus,
    size: 50,
    fields: [
        "id", "total", "orderStatus", 
        "customer.userEntity.name", "customer.userEntity.lastName", "customer.address",
        "dealer.name"
    ]
  });

  const orders = response?.data?.content || [];

  // 🔥 CAMBIO 2: Inicializamos la mutación de actualización
  const updateMutation = useUpdateOrder();

  const handleOpenAssignModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleAssignDealer = (dealerId: number) => {
    if (!selectedOrderId) return;

    // 🔥 CAMBIO 3: Usamos updateMutation para cambiar SOLO el estado
    // Nota: Aunque seleccionamos un dealerId en el modal, por ahora solo cambiamos 
    // el estado del pedido a 'EN_CAMINO' según la nueva indicación.
    updateMutation.mutate(
      { 
        id: selectedOrderId, 
        payload: { 
            orderStatus: EOrderStatus.EN_CAMINO 
            // dealerId se omite intencionalmente para evitar error 500
        } 
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          Alert.alert("Pedido Aceptado", "El pedido ha pasado a estado 'En Camino' correctamente.");
          refetch(); 
        },
        onError: (error: any) => {
          console.error("❌ ERROR AL ACTUALIZAR:", error);
          const backendMessage = error?.response?.data?.message || "Error desconocido";
          Alert.alert("Error", `No se pudo actualizar el pedido: ${backendMessage}`);
        }
      }
    );
  };

  const renderOrder = ({ item }: { item: OrderEntity }) => {
    const customerName = item.customer?.userEntity?.name || "Cliente";
    
    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View>
                <Text style={[styles.orderId, { color: colors.text }]}>Pedido #{item.id}</Text>
                <Text style={{fontSize: 12, color: colors.textSecondary}}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.price, { color: colors.text }]}>S/. {item.total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.row}>
                <Ionicons name="person-outline" size={16} color={colors.info} />
                <Text style={{color: colors.text, marginLeft: 6}}>{customerName}</Text>
            </View>
            
            {activeTab === "ACTIVE" && (
               <View style={[styles.row, { marginTop: 6 }]}>
                 <Ionicons name="bicycle" size={16} color="green" />
                 <Text style={{color: "green", fontWeight: "bold", marginLeft: 6}}>
                   {/* Como updateOrder no guarda el dealer, esto podría salir vacío hasta que el backend se actualice */}
                   Repartidor: {item.dealer?.name || "En ruta"}
                 </Text>
               </View>
            )}
          </View>
    
          {activeTab === "PENDING" && (
            <TouchableOpacity 
              style={[styles.assignButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOpenAssignModal(item.id)}
            >
              <Text style={styles.assignButtonText}>Asignar / Aceptar</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{marginLeft: 6}}/>
            </TouchableOpacity>
          )}
        </View>
      );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Asignación de Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "PENDING" ? colors.primary : colors.surface, // cambia fondo
            },
          ]}
          onPress={() => setActiveTab("PENDING")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "PENDING" ? colors.textInverse : colors.text, // cambia texto
              },
            ]}
          >
            Por Asignar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === "ACTIVE" ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => setActiveTab("ACTIVE")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "ACTIVE" ? colors.textInverse : colors.text,
              },
            ]}
          >
            En Entrega
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{marginTop: 10, color: '#666'}}>Cargando pedidos...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
                <Ionicons name="checkmark-circle-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                    {activeTab === "PENDING" ? "¡Todo limpio! No hay pedidos pendientes." : "No hay entregas en curso."}
                </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      <DealerSelectorModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectDealer={handleAssignDealer}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: "#eee" },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
  tabContainer: { flexDirection: "row", padding: 15, justifyContent: "center" },
  tab: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20, marginHorizontal: 5, backgroundColor: "#e0e0e0" },
  tabText: { color: "#fff", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  card: { padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: {width:0, height:2} },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, alignItems: 'flex-start' },
  orderId: { fontWeight: "bold", fontSize: 16 },
  price: { fontWeight: "bold", fontSize: 18 },
  cardBody: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  assignButton: { flexDirection: 'row', padding: 12, borderRadius: 8, alignItems: "center", justifyContent: 'center' },
  assignButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  emptyText: { textAlign: "center", marginTop: 10, color: "#999" }
});