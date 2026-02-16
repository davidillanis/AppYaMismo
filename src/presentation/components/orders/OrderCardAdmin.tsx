import { Colors } from "@/constants/Colors";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  order: OrderEntity;
  colors: typeof Colors.light;
  onUpdateStatus: (id: number, newStatus: EOrderStatus) => void;
  onViewDetails: (order: OrderEntity) => void;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  [EOrderStatus.PENDIENTE]: { color: "#FF7F11", label: "Pendiente", icon: "time-outline" },
  [EOrderStatus.EN_CAMINO]: { color: "#2196F3", label: "En Camino", icon: "bicycle-outline" },
  [EOrderStatus.ENTREGADO]: { color: "#04F06A", label: "Entregado", icon: "checkmark-circle-outline" },
  [EOrderStatus.CANCELADO]: { color: "#F44336", label: "Cancelado", icon: "close-circle-outline" },
  [EOrderStatus.RECHAZADO]: { color: "#FF1B1C", label: "Rechazado", icon: "ban-outline" },
};

export const OrderCardAdmin: React.FC<Props> = ({
  order,
  colors,
  onUpdateStatus,
  onViewDetails,
}) => {
  const statusInfo = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG[EOrderStatus.PENDIENTE];
  const date = new Date(order.createdAt).toLocaleDateString() + " " + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 🔥 CORRECCIÓN: Accedemos a userEntity
  const customerName = order.customer?.userEntity?.name 
    ? `${order.customer.userEntity.name} ${order.customer.userEntity.lastName || ''}`
    : "Cliente Desconocido";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      
      <View style={styles.header}>
        <Text style={[styles.orderId, { color: colors.text }]}>Pedido #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} style={{marginRight: 4}} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
            <Ionicons name="person-outline" size={16} color={colors.success} />
            {/* 🔥 Usamos la variable corregida */}
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {customerName}
            </Text>
        </View>
        <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{date}</Text>
        </View>
        <View style={styles.row}>
            <Ionicons name="cash-outline" size={16} color={colors.warning} />
            <Text style={[styles.totalText, { color: colors.text }]}>
                S/. {order.total.toFixed(2)}
            </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.warning, borderWidth: 1, backgroundColor: colors.warning }]}
            onPress={() => onViewDetails(order)}
        >
            <Text style={{ color: colors.textInverse }}>Ver Detalles</Text>
        </TouchableOpacity>

        {order.orderStatus === EOrderStatus.PENDIENTE && (
            <>
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.primary, marginLeft: 8 }]}
                    onPress={() => onUpdateStatus(order.id, EOrderStatus.RECHAZADO)}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Rechazar</Text>
                </TouchableOpacity>
                
                {/*<TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: colors.success, marginLeft: 8 }]}
                    onPress={() => onUpdateStatus(order.id, EOrderStatus.EN_CAMINO)}
                >
                    <Text style={{ color: colors.textInverse, fontWeight: 'bold' }}>Aceptar</Text>
                </TouchableOpacity>*/}
            </>
        )}

        {order.orderStatus === EOrderStatus.EN_CAMINO && (
             <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.info, marginLeft: 8 }]}
                onPress={() => onUpdateStatus(order.id, EOrderStatus.ENTREGADO)}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Finalizar</Text>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  content: { marginBottom: 15, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14 },
  totalText: { fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 80, alignItems: 'center' }
});