import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { OrderStatusTimeline } from "@/src/presentation/components/orders/OrderStatusTimeLine";
// 1. IMPORTAMOS EL NUEVO COMPONENTE
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import { VerificationQrSection } from "@/src/presentation/components/orders/VerificationQrSection";

export default function OrderTrackingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  
  const params = useLocalSearchParams();
  const order: OrderEntity = params.order ? JSON.parse(params.order as string) : null;

  if (!order) return <View><Text>Cargando...</Text></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* ... HEADER (Igual que antes) ... */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Seguimiento</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- SECCIÓN 1: ESTADO (Igual que antes) --- */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface}]}>
            <Text style={[styles.orderTitle, { color: colors.text }]}>Pedido #{order.id}</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Tiempo estimado: 25-30 min</Text>
            <View style={styles.divider} />
            <OrderStatusTimeline currentStatus={order.orderStatus} date={order.createdAt} />
        </View>

        {/* --- SECCIÓN 2: CÓDIGO QR REAL --- */}
        {/* Reemplazamos el placeholder anterior con el componente real */}
        
        {order.orderStatus !== 'ENTREGADO' && order.orderStatus !== 'CANCELADO' && order.orderStatus !== 'PENDIENTE'? (
           <VerificationQrSection order={order} />
        ) : (
           // Opcional: Mostrar un mensaje si ya no es necesario el QR
           <View style={styles.qrFinishedPlaceholder}>
              <Ionicons name={order.orderStatus === 'ENTREGADO' ? "checkmark-circle" : "close-circle"} size={40} color="#ccc" />
              <Text style={styles.qrFinishedText}>Código de verificación no necesario</Text>
           </View>
        )}
        {/* ---------------------------------- */}


        {/* --- SECCIÓN 3: DIRECCIÓN (Igual que antes) --- */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface}]}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Dirección de entrega</Text>
            <View style={styles.row}>
                <Ionicons name="location-sharp" size={20} color={colors.primary} />
                <Text style={[styles.addressText, { color: colors.text }]}>
                    Av. Los Andes 123, Andahuaylas
                </Text>
            </View>
        </View>

      </ScrollView>
      
       {/* ... Footer ... */}
       <View style={styles.footer}>
         {/* ... */}
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Mantén tus estilos container, header, etc.)
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { padding: 5 },
  title: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  orderTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subTitle: { fontSize: 14, color: "#666", marginBottom: 15 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  
  sectionHeader: { fontWeight: '700', marginBottom: 10, color: '#444' },
  row: { flexDirection: 'row', alignItems: 'center' },
  addressText: { marginLeft: 10, color: '#333' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  
  // --- NOTA: HE ELIMINADO LOS ESTILOS qrPlaceholder ANTIGUOS ---
  // porque ahora el componente VerificationQrSection trae sus propios estilos.

  // Estilos opcionales para cuando el QR ya no se muestra
  qrFinishedPlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed'
  },
  qrFinishedText: {
      marginTop: 8,
      color: '#888',
      fontSize: 13
  }
});