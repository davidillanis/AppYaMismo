import { Colors } from "@/constants/Colors";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

export default function OrdenesScreen() {
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const router = useRouter();
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();

  const { width } = useWindowDimensions();
  const normalize = useCallback(
    (size: number) => normalizeScreen(size, width),
    [width]
  );

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = createStyles(colors, normalize);

  const loadOrders = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await listOrder({
        status: EOrderStatus.PENDIENTE,
        page: 0,
        size: 20,
        restaurantId: Number(restaurantId),
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
  }, [restaurantId]);

  const getStatusColor = (status: EOrderStatus) => {
    switch (status) {
      case EOrderStatus.PENDIENTE:
        return "#FF8C00";
      case EOrderStatus.EN_CAMINO:
        return "#3498DB";
      case EOrderStatus.ENTREGADO:
        return "#2ECC71";
      case EOrderStatus.CANCELADO:
      case EOrderStatus.RECHAZADO:
        return "#E74C3C";
      default:
        return "#777";
    }
  };

  const toggleAccordion = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>
          Órdenes #{restaurantId}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadOrders}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.text }}>
              No hay órdenes disponibles
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedOrder === item.id;

          return (
            <View style={styles.card}>
              {/* Top Row */}
              <View style={styles.rowBetween}>
                <Text style={styles.orderId}>Orden #{item.id}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.orderStatus) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.orderStatus.replace("_", " ")}
                  </Text>
                </View>
              </View>

              {/* Cliente */}
              <Text style={styles.clientText}>
                👤 {item.customer?.userEntity?.name}{" "}
                {item.customer?.userEntity?.lastName}
              </Text>

              {/* Total */}
              <Text style={styles.total}>
                S/. {item.total?.toFixed(2)}
              </Text>

              {/* Confirmación */}
              <View style={styles.confirmationBox}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#555" />
                <Text style={styles.confirmationText}>
                  {item.confirmationStatus}
                </Text>
              </View>

              {/* Accordion Button */}
              <TouchableOpacity
                style={styles.accordionButton}
                onPress={() => toggleAccordion(item.id)}
              >
                <Text style={styles.accordionText}>
                  {isExpanded ? "Ocultar productos" : "Ver productos"}
                </Text>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#A4243B"
                />
              </TouchableOpacity>

              {/* Productos */}
              {isExpanded && (
                <View style={styles.productsContainer}>
                  {item.orderDetails?.map((detail, index) => (
                    <View key={index} style={styles.productRow}>
                      <Text style={styles.productName}>
                        {detail.product?.name}
                      </Text>
                      <Text style={styles.productAmount}>
                        x{detail.amount}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors: any, normalize: (n: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 50,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
      gap: 15,
    },
    backButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
    },
    title: {
      fontSize: normalize(18),
      fontWeight: "bold",
      color: colors.text,
    },
    card: {
      backgroundColor: "#FFF",
      padding: 18,
      borderRadius: 18,
      marginBottom: 18,
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    orderId: {
      fontWeight: "bold",
      fontSize: 16,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    statusText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    clientText: {
      marginTop: 8,
      fontSize: 14,
      color: "#444",
    },
    total: {
      marginTop: 10,
      fontSize: 20,
      fontWeight: "bold",
      color: "#A4243B",
    },
    confirmationBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },
    confirmationText: {
      fontSize: 12,
      color: "#555",
      fontWeight: "500",
    },
    accordionButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingVertical: 6,
    },
    accordionText: {
      color: "#A4243B",
      fontWeight: "600",
    },
    productsContainer: {
      marginTop: 10,
      padding: 10,
      borderRadius: 12,
      backgroundColor: "#F9F9F9",
    },
    productRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    productName: {
      fontSize: 13,
      color: "#333",
    },
    productAmount: {
      fontWeight: "600",
      color: "#333",
    },
  });