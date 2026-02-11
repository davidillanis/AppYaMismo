import { Colors } from "@/constants/Colors";
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import {
  formatDate,
  getOrderStatusColor,
} from "@/src/presentation/utils/OrderStatusUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  order: OrderEntity;
  colors: typeof Colors.light;
}

export const OrderHistoryCard: React.FC<Props> = ({ order, colors }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const statusStyle = getOrderStatusColor(order.orderStatus);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleTrackOrder = () => {
    router.push({
      pathname: "/tracking/[orderId]",
      params: { orderId: order.id, order: JSON.stringify(order) },
    });
  };

  // --- LÓGICA MULTI-RESTAURANTE ---
  // Analizamos los detalles para ver cuántos restaurantes únicos hay
  const { isMultiVendor, singleRestaurantInfo } = useMemo(() => {
    const restaurantNames = new Set<string>();
    
    // 1. Tipado explícito para que TS sepa qué esperar
    let firstRestaurant: { name: string; address?: string } | null = null;

    // 2. Usamos (order.orderDetails || []) para evitar error si es null
    const details = order.orderDetails || [];

    // 3. CAMBIO CLAVE: Usamos for...of en lugar de .forEach
    for (const detail of details) {
      const restaurant = detail.product?.restaurant;
      
      if (restaurant?.name) {
        restaurantNames.add(restaurant.name);
        
        // Si aún no tenemos el primero, lo guardamos
        if (!firstRestaurant) {
            firstRestaurant = restaurant;
        }
      }
    }

    return {
      isMultiVendor: restaurantNames.size > 1,
      singleRestaurantInfo: restaurantNames.size === 1 ? firstRestaurant : null,
    };
  }, [order.orderDetails]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface}]}>
      {/* --- CABECERA (Siempre visible) --- */}
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.headerTop}>
          <Text style={[styles.orderId, { color: colors.text}]}>Pedido #{order.id}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Ionicons
              name={statusStyle.icon as any}
              size={12}
              color={statusStyle.text}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <Text style={[styles.dateText, { color: colors.textSecondary}]}>{formatDate(order.createdAt)}</Text>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalText, { color: colors.text }]}>
              S/. {(order.total || 0).toFixed(2)}
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.text}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* --- DETALLES --- */}
      {expanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.divider} />

          {/* CASO A: UN SOLO RESTAURANTE -> MOSTRAR CABECERA GLOBAL */}
          {!isMultiVendor && singleRestaurantInfo && (
            <View style={[styles.restaurantContainer, { backgroundColor: colors.buttonSecondary }]}>
              <View style={[styles.restaurantIcon, { backgroundColor: colors.card }]}>
                <Ionicons name="storefront" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.restaurantName, { color: colors.textInverse }]}>
                  {singleRestaurantInfo.name || "Restaurante"}
                </Text>
                {singleRestaurantInfo.address && (
                  <Text style={[styles.restaurantAddress, { color: colors.textInverse }]} numberOfLines={1}>
                    {singleRestaurantInfo.address}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* CASO B: MULTI RESTAURANTE -> MOSTRAR AVISO (Opcional) */}
          {isMultiVendor && (
             <Text style={styles.multiVendorLabel}>Pedido Multi-Restaurante</Text>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>PRODUCTOS</Text>

          {order.orderDetails && order.orderDetails.length > 0 ? (
            order.orderDetails.map((detail, index) => (
              <View key={index} style={styles.productRow}>
                {detail.product?.urlImage ? (
                  <Image
                    source={{ uri: detail.product.urlImage }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <Ionicons
                      name="fast-food-outline"
                      size={20}
                      color="#ccc"
                    />
                  </View>
                )}

                <View style={{ flex: 1, paddingRight: 10 }}>
                  
                  {/* CASO B: MULTI RESTAURANTE -> MOSTRAR ETIQUETA POR PRODUCTO */}
                  {isMultiVendor && detail.product?.restaurant?.name && (
                    <View style={styles.inlineVendorBadge}>
                        <Ionicons name="storefront-outline" size={10} color="#666" style={{marginRight: 3}}/>
                        <Text style={styles.inlineVendorText}>
                            {detail.product.restaurant.name}
                        </Text>
                    </View>
                  )}

                  <Text style={[styles.productName, { color: colors.textSecondary }]}>
                    {detail.amount}x{" "}
                    {detail.product?.name || "Producto desconocido"}
                  </Text>
                  {detail.note ? (
                    <Text style={styles.noteText}>Nota: `{detail.note}`</Text>
                  ) : null}
                </View>

                <Text style={[styles.productPrice, { color: colors.text }]}>
                  S/. {detail.subTotal?.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyDetails}>
              No hay detalles disponibles.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: colors.primary }]}
            onPress={handleTrackOrder}
          >
            <Text style={styles.trackButtonText}>Ver Seguimiento</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>

          <View style={styles.divider} />
          <View style={styles.footer}>
            <Text style={[styles.paymentInfo, { color: colors.textSecondary }]}>
              Pago contra entrega (Efectivo)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: { fontWeight: "bold", fontSize: 16, color: "#333" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "bold" },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { color: "#888", fontSize: 13 },
  totalContainer: { flexDirection: "row", alignItems: "center" },
  totalText: { fontWeight: "bold", fontSize: 16 },

  // Detalles
  detailsContainer: { marginTop: 10 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },

  // Estilos Restaurante (Global)
  restaurantContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  restaurantIcon: {
    marginRight: 10,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 1,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },
  restaurantAddress: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  
  // Estilos Multi-Vendor
  multiVendorLabel: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
    alignSelf: 'flex-end'
  },
  inlineVendorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  inlineVendorText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "700",
    textTransform: "uppercase"
  },

  sectionTitle: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  productName: { fontSize: 14, color: "#444" },
  productPrice: { fontSize: 14, fontWeight: "600", color: "#333" },
  noteText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 2,
  },
  emptyDetails: {
    fontStyle: "italic",
    color: "#999",
    textAlign: "center",
    marginVertical: 5,
  },
  footer: { alignItems: "flex-end" },
  paymentInfo: { fontSize: 12, color: "#666" },

  trackButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trackButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 5,
  },
});