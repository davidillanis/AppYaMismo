import { Colors } from "@/constants/Colors";
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import OrderWebSocketService, { EOrderStatus } from "@/src/domain/services/socket/OrderWebSocketService";
import { MappedPalette } from "@/src/domain/types/MappedPalette";
import { OrderMapPoint, RestaurantMapPoint } from "@/src/domain/types/MapType";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { formatDate } from "@/src/presentation/utils/OrderStatusUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import Toast from "react-native-toast-message";

const createStyles = (colors: MappedPalette, normalize: (n: number) => number) =>
  StyleSheet.create({
    orderCard: {
      borderRadius: 12,
      marginBottom: 12,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: "column",
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    cardHeaderItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 7,
      paddingBottom: 7,
    },
    orderBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    orderBadgeText: {
      fontWeight: "bold",
      fontSize: normalize(11),
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#FFA726",
    },
    statusText: {
      fontWeight: "600",
      fontSize: normalize(11),
    },
    totalCompact: {
      fontSize: normalize(16),
      fontWeight: "bold",
    },
    productsSection: {
      marginBottom: 12,
    },
    productsSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    productsSummaryText: {
      fontSize: normalize(12),
      fontWeight: "600",
    },
    productRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
      backgroundColor: "rgba(255,255,255,0.05)",
      padding: 8,
      borderRadius: 8,
    },
    productThumb: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: 6,
      backgroundColor: "#1a2930",
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      color: "#fff",
      fontSize: normalize(13),
      fontWeight: "600",
      marginBottom: 2,
    },
    productMeta: {
      color: "#B0BEC5",
      fontSize: normalize(11),
    },
    infoSection: {
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontWeight: "600",
      fontSize: normalize(11),
      marginBottom: 2,
    },
    infoValue: {
      fontSize: normalize(12),
      lineHeight: normalize(16),
    },
    phoneRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    phoneText: {
      fontSize: normalize(11),
      fontWeight: "600",
    },
    dateText: {
      color: colors.text,
      fontSize: normalize(12),
    },
    actionButton: {
      marginTop: 10,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.button,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: normalize(14),
    },
    resultsCount: {
      fontSize: 14,
      marginBottom: 8,
    },
    restaurantGroup: {
      marginBottom: 10,
      backgroundColor: "rgba(0,0,0,0.03)",
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
    },
    restaurantHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    restaurantName: {
      fontSize: normalize(13),
      fontWeight: 'bold',
    },
    locationButton: {
      padding: normalize(7),
      borderRadius: normalize(25),
    },
  });

const PendingTab = () => {
  const { width } = useWindowDimensions();
  const normalize = useCallback((s: number) => normalizeScreen(s, width), [width]);
  const colors = Colors[useColorScheme() ?? "normal"];
  const styles = createStyles(colors, normalize);
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const loadingOrderIdRef = useRef<number | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  const orderSocket = useMemo(() => new OrderWebSocketService(), []);

  useEffect(() => {
    listOrder({
      fields: ["id", "orderStatus", "total", "subtotal", "createdAt", "latitude", "longitude",
        "customer.userEntity.name", "customer.userEntity.lastName", "customer.userEntity.phone", "customer.userEntity.address",
        "orderDetails.amount", "orderDetails.unitPrice", "orderDetails.product.name", "orderDetails.product.urlImage",
        "orderDetails.product.restaurant.name", "orderDetails.product.restaurant.address",
        "orderDetails.product.restaurant.latitude", "orderDetails.product.restaurant.longitude",
      ],
      status: EOrderStatus.PENDIENTE,
      page: 0,
      size: 100,
      sortBy: "created_at",
      direction: "ASC",
    }).then(data => setOrders(data.data?.content || [])).catch(error => console.log(mappingError(error.data)));

    orderSocket.onDealerOrdersUpdate = (order) => {
      if (order.status !== EOrderStatus.PENDIENTE && loadingOrderIdRef.current === order.id) {
        loadingOrderIdRef.current = null;
        Toast.show({
          type: "success",
          text1: "Éxito",
          text2: "Se aceptó exitosamente la orden",
          visibilityTime: 3000,
          topOffset: normalize(60),
        });
      }

      setOrders(prev => {
        if (order.status !== EOrderStatus.PENDIENTE) {
          return prev.filter(o => o.id !== order.id);
        }
        const index = prev.findIndex(o => o.id === order.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = { ...copy[index], orderStatus: order.status, total: order.total, };
          return copy;
        }
        // si llega nueva por socket
        return [
          {
            id: order.id,
            orderStatus: order.status,
            total: order.total,
            latitude: order.latitude,
            longitude: order.longitude,
            orderDetails: order.orderDetails,
            customer: order.customer,
          } as OrderEntity,
          ...prev,
        ];
      });
      setLoadingOrderId(prev => (prev === order.id ? null : prev));
    };

    orderSocket.onOrderError = (error) => {
      setLoadingOrderId(null);
      loadingOrderIdRef.current = null;
      Toast.show({
        type: 'warning',
        text1: 'Alerta',
        text2: error.errors?.[0] || "Error desconocido",
        visibilityTime: 3000,
        topOffset: 50,
      });
    };
    orderSocket.connect(user?.dealerId || 0);
    setConnected(true);
    return () => orderSocket.disconnect();
  }, [orderSocket, user, normalize]);


  const updateStatus = (orderId: number, status: EOrderStatus) => {
    setLoadingOrderId(orderId);
    loadingOrderIdRef.current = orderId;
    orderSocket.updateStatus({ orderId, dealerId: user?.dealerId || 0, status });
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Helper to group products by restaurant
  const getGroupedProducts = (details: any[]) => {
    const groups: Record<string, any[]> = {};
    details.forEach(item => {
      const rName = item.product.restaurant?.name || "Restaurante";
      if (!groups[rName]) groups[rName] = [];
      groups[rName].push(item);
    });
    return Object.entries(groups);
  };
  const transformToMapPoint = (order: OrderEntity): OrderMapPoint => {
    const restaurantGroups = getGroupedProducts(order.orderDetails);

    const restaurants: RestaurantMapPoint[] = restaurantGroups.map(([restaurantName, items]) => {
      const firstProduct = items[0]?.product;
      return {
        latitude: firstProduct?.restaurant?.latitude || order.latitude,
        longitude: firstProduct?.restaurant?.longitude || order.longitude,
        name: restaurantName || 'Restaurante',
        products: items.map(item => ({
          name: item.product.name,
          price: item.unitPrice,
          quantity: item.amount
        }))
      };
    });

    return {
      id: order.id, restaurant: restaurants,
      customer: {
        latitude: order.latitude,
        longitude: order.longitude,
        name: `${order.customer?.userEntity.name} ${order.customer?.userEntity.lastName}`.trim()
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
      {/**<Text style={styles.resultsCount}>Estado socket: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</Text> */}
      {orders.length === 0 && (
        <Text style={styles.resultsCount}>Esperando órdenes...</Text>
      )}

      {orders.map(order => (
        <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>

          {/* Encabezado compacto */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderItem}>
              <View style={styles.orderBadge}>
                <Ionicons name="receipt-outline" size={normalize(12)} color={colors.text} />
                <Text style={[styles.orderBadgeText, { color: colors.text }]}>#{order.id}</Text>
              </View>

              <View style={[styles.statusBadge]}>
                {order.orderStatus === EOrderStatus.ENTREGADO && (
                  <>
                    <Ionicons name="checkmark-circle" size={normalize(12)} color={colors.success} />
                    <Text style={[styles.statusText, { color: colors.success }]}>{order.orderStatus}</Text>
                  </>
                )}
                {order.orderStatus === EOrderStatus.PENDIENTE && (
                  <>
                    <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.statusText, { color: colors.warning }]}>{order.orderStatus}</Text>
                  </>
                )}
                {order.orderStatus === EOrderStatus.EN_CAMINO && (
                  <>
                    <Ionicons name="bicycle-outline" size={normalize(12)} color={colors.info} />
                    <Text style={[styles.statusText, { color: colors.info }]}>{order.orderStatus}</Text>
                  </>
                )}
              </View>
              {/*<Text style={[styles.totalCompact, { color: colors.text }]}>S/ {order.total.toFixed(2)}</Text> */}
              <View style={styles.productsSummary}>
                <Ionicons name="fast-food-outline" size={normalize(14)} color={colors.warning} />
                <Text style={[styles.productsSummaryText, { color: colors.warning }]}>
                  {order.orderDetails.length} {order.orderDetails.length === 1 ? "Item" : "Items"}
                </Text>
              </View>

            </View>

            <View style={styles.cardHeaderItem}>
              <TouchableOpacity activeOpacity={0.7}
                onPress={() => router.push({
                  pathname: '/order/MapScreenView',
                  params: { orderData: JSON.stringify([transformToMapPoint(order)]) }
                })}>
                <Ionicons name={"location"} size={20} color={colors.success} style={styles.locationButton} />
              </TouchableOpacity>
              <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpanded(order.id)}>
                <Ionicons name={expandedOrders[order.id] ? "chevron-up" : "chevron-down"} size={22} color={colors.text} style={{ padding: normalize(7) }} />
              </TouchableOpacity>
            </View>
          </View>

          {expandedOrders[order.id] && (
            <>
              {/* Sección de productos */}
              <View style={styles.productsSection}>
                {getGroupedProducts(order.orderDetails).map(([restaurantName, items], idx) => (
                  <View key={idx} style={styles.restaurantGroup}>
                    <View style={styles.restaurantHeader}>
                      <Ionicons name="storefront" size={normalize(14)} color={colors.text} />
                      <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurantName}</Text>
                    </View>

                    {items.map((od, index) => (
                      <View key={index} style={styles.productRow}>
                        {od.product.urlImage && (
                          <Image source={{ uri: od.product.urlImage }} style={styles.productThumb} resizeMode="cover" />
                        )}
                        <View style={styles.productInfo}>
                          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                            {od.product.name}
                          </Text>
                          <Text style={[styles.productMeta, { color: colors.text }]}>
                            x{od.amount} • S/ {od.unitPrice.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              {/* Información del cliente */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={normalize(14)} color={colors.info} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.info }]}>Cliente:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {order.customer?.userEntity.name} {order.customer?.userEntity.lastName}
                    </Text>
                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={normalize(12)} color={colors.success} />
                      <Text style={[styles.phoneText, { color: colors.success }]}>{order.customer?.userEntity.phone}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Dirección */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={normalize(14)} color={colors.error} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Dirección:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>
                      {order.customer?.userEntity.address} ({order.latitude}, {order.longitude})
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Acciones */}
          {loadingOrderId === order.id ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
          ) : (
            <>
              {order.orderStatus === EOrderStatus.PENDIENTE && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateStatus(order.id, EOrderStatus.EN_CAMINO)}
                >
                  <Text style={styles.actionButtonText}>ACEPTAR PEDIDO</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  )
};

export default PendingTab;