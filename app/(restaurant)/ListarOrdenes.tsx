import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // 🔥 IMPORTANTE
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
  
export default function OrdenesScreen() {
    const [orders, setOrders] = useState<OrderEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    // 🔥 1. CAPTURAMOS EL ID
    const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
  
    const loadOrders = async () => {
      // Seguridad: Si no hay ID, no cargamos nada
      if (!restaurantId) return;

      try {
        const response = await listOrder({
          status: EOrderStatus.PENDIENTE,
          page: 0,
          size: 20,
          // 🔥 2. FILTRAMOS POR RESTAURANTE
          restaurantId: Number(restaurantId) 
        });
  
        if (response.isSuccess) {
          setOrders(response.data?.content ?? []);
        }
      } catch (error) {
        console.error("Error cargando órdenes", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadOrders();
    }, [restaurantId]); // 🔥 Recargamos si cambia el ID
  
    const getStatusColor = (status: EOrderStatus) => {
      switch (status) {
        case EOrderStatus.PENDIENTE: return "#E67E22";
        case EOrderStatus.EN_CAMINO: return "#3498DB";
        case EOrderStatus.ENTREGADO: return "#2ECC71";
        case EOrderStatus.CANCELADO:
        case EOrderStatus.RECHAZADO: return "#E74C3C";
        default: return "#555";
      }
    };
  
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
  
    // UI - (Se mantiene igual, solo asegúrate de importar los estilos)
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.button }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Órdenes pendientes {restaurantId ? `(Sucursal #${restaurantId})` : ''}
        </Text>
  
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
             <View style={styles.center}>
                 <Text style={{ color: colors.text }}>No hay órdenes pendientes 📭</Text>
             </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>Orden #{item.id}</Text>
              <Text style={styles.text}>
                Estado: <Text style={[styles.status, { color: getStatusColor(item.orderStatus) }]}>{item.orderStatus}</Text>
              </Text>
              <Text style={styles.text}>Total: <Text style={styles.total}>S/. {item.total}</Text></Text>
              <Text style={styles.text}>Cliente: {item.customer?.userEntity?.name} {item.customer?.userEntity?.lastName}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          )}
        />
      </View>
    );
}

// ... (Tus estilos originales createStyles) ...
const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, paddingTop: 50 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    backButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 15 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 25 },
    card: { backgroundColor: "#F2E7C9", padding: 14, borderRadius: 12, marginBottom: 12 },
    orderId: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
    text: { fontSize: 14, marginTop: 2 },
    status: { fontWeight: "bold" },
    total: { fontWeight: "bold" },
    date: { fontSize: 12, marginTop: 6, color: "#555" },
});