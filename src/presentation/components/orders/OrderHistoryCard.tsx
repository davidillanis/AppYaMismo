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
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
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

  const handleOpenWhatsApp = (phone?: string) => {
    if (!phone) return;
    let cleanNumber = phone.replace(/[^\d]/g, '');
    if (cleanNumber.length === 9) cleanNumber = `51${cleanNumber}`;
    const url = `whatsapp://send?phone=${cleanNumber}&text=Hola, consulta sobre pedido #${order.id}.`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://wa.me/${cleanNumber}`));
  };

  // --- LÓGICA MULTI-RESTAURANTE ---
  const { isMultiVendor, singleRestaurantInfo } = useMemo(() => {
    const restaurantNames = new Set<string>();
    let firstRestaurant: { name: string; address?: string } | null = null;
    const details = order.orderDetails || [];

    for (const detail of details) {
      const restaurant = detail.product?.restaurant;
      if (restaurant?.name) {
        restaurantNames.add(restaurant.name);
        if (!firstRestaurant) firstRestaurant = restaurant;
      }
    }

    return {
      isMultiVendor: restaurantNames.size > 1,
      singleRestaurantInfo: restaurantNames.size === 1 ? firstRestaurant : null,
    };
  }, [order.orderDetails]);

  const dealerUser = order.dealer?.userEntity;

  return (
    <View style={styles.card}>
      {/* CABECERA */}
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9} style={styles.touchableArea}>
        
        {/* Fila 1 */}
        <View style={styles.headerRow}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <View style={styles.iconBox}>
                <Ionicons name="receipt" size={20} color="#4B5563" />
             </View>
             <View style={{marginLeft: 12}}>
                <Text style={styles.orderId}>Pedido #{order.id}</Text>
                <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
             </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {/* Fila 2: Precio */}
        <View style={styles.priceRow}>
            <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>S/. {(order.total || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.expandButton, expanded && styles.expandButtonActive]}>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={expanded ? "#E63946" : "#6B7280"} />
            </View>
        </View>

      </TouchableOpacity>

      {/* ZONA EXPANDIDA */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* Restaurante */}
          {!isMultiVendor && singleRestaurantInfo && (
            <View style={styles.restaurantRow}>
               <Ionicons name="storefront" size={16} color="#E63946" style={{marginRight: 8}} />
               <Text style={styles.restaurantName} numberOfLines={1}>
                  {singleRestaurantInfo.name}
               </Text>
            </View>
          )}

          {/* Productos */}
          <View style={styles.productsList}>
            {order.orderDetails?.map((detail, index) => (
              <View key={index} style={styles.productItem}>
                <Text style={styles.qtyBadge}>{detail.amount}x</Text>
                <View style={{flex: 1, paddingHorizontal: 10}}>
                    <Text style={styles.productName} numberOfLines={1}>{detail.product?.name}</Text>
                    {isMultiVendor && detail.product?.restaurant?.name && (
                        <Text style={styles.vendorName}>{detail.product.restaurant.name}</Text>
                    )}
                </View>
                <Text style={styles.productPrice}>S/. {detail.subTotal?.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Repartidor */}
          {dealerUser && (
            <View style={styles.dealerBox}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image 
                        source={{ uri: dealerUser.imageUrl || "https://via.placeholder.com/40" }} 
                        style={styles.dealerAvatar} 
                    />
                    <View style={{marginLeft: 12}}>
                        <Text style={styles.dealerLabel}>Tu Repartidor</Text>
                        <Text style={styles.dealerName}>{dealerUser.name}</Text>
                    </View>
                </View>
                {dealerUser.phone && (
                    <TouchableOpacity onPress={() => handleOpenWhatsApp(dealerUser.phone)} style={styles.whatsappBtn}>
                        <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
          )}

          {/* BOTÓN DE SEGUIMIENTO (Restaurado sin condición oculta) */}
          <TouchableOpacity 
            style={styles.mainActionButton} 
            onPress={handleTrackOrder}
          >
              <Text style={styles.actionText}>Ver Seguimiento</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
          
          <View style={{marginTop: 15, alignItems: 'center'}}>
             <Text style={styles.paymentInfo}>Pago contra entrega (Efectivo)</Text>
          </View>

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    overflow: 'hidden'
  },
  touchableArea: { padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: 15, fontWeight: "700", color: "#111827" },
  dateText: { fontSize: 12, color: "#9CA3AF", marginTop: 2, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: "#6B7280", textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  totalAmount: { fontSize: 22, fontWeight: "900", color: "#111827", marginTop: 2 },
  expandButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F9FAFB", alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "#F3F4F6" },
  expandButtonActive: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  expandedContent: { backgroundColor: "#FAFAFA", borderTopWidth: 1, borderTopColor: "#F3F4F6", padding: 16 },
  divider: { height: 1, marginBottom: 12 },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: "#FFFFFF", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  restaurantName: { fontSize: 14, fontWeight: '700', color: "#374151" },
  productsList: { marginBottom: 16 },
  productItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qtyBadge: { fontSize: 12, fontWeight: '700', color: "#4B5563", backgroundColor: "#E5E7EB", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  productName: { fontSize: 14, color: "#374151", fontWeight: '500' },
  vendorName: { fontSize: 10, color: "#E63946", fontWeight: '700', marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: '700', color: "#111827" },
  dealerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  dealerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E5E7EB" },
  dealerLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: '700', textTransform: 'uppercase' },
  dealerName: { fontSize: 14, color: "#1F2937", fontWeight: '700' },
  whatsappBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#25D366", alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: "#25D366", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3 },
  mainActionButton: { backgroundColor: "#E63946", flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, shadowColor: "#E63946", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  actionText: { color: "#FFF", fontSize: 14, fontWeight: '800', marginRight: 8, letterSpacing: 0.5 },
  paymentInfo: { fontSize: 11, color: "#9CA3AF", backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }
});