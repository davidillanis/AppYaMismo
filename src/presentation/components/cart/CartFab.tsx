import { useCart } from "@/src/presentation/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  colors: any;
}

export const CartFab: React.FC<Props> = ({ colors }) => {
  const router = useRouter();
  
  // 1. CORRECCIÓN: Usamos los nombres actualizados del CartContext
  // (Si tu contexto aún usa totalItems/totalAmount, cámbialos aquí, 
  // pero recomiendo usar cartCount/cartTotal para mantener consistencia con la lógica nueva)
  const { cartCount, cartTotal } = useCart();
  
  const insets = useSafeAreaInsets();

  // 2. CORRECCIÓN DE SEGURIDAD (Arregla el error .toFixed)
  // Si cartTotal es undefined, usamos 0.
  const safeTotal = cartTotal || 0;
  const safeCount = cartCount || 0;

  // Ocultar si está vacío
  if (safeCount === 0) return null; 

  return (
    <TouchableOpacity
      style={[
        styles.fab, 
        { 
          backgroundColor: colors.primary,
          marginBottom: 10 + insets.bottom // Un poco más de margen para que no pegue al borde
        }
      ]}
      onPress={() => router.push("/CartClient" as any)} // Asegúrate que esta ruta exista en tu app
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cart" size={24} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{safeCount}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.viewCartText}>Ver Carrito</Text>
          {/* Usamos safeTotal para evitar el crash */}
          <Text style={styles.totalText}>S/. {safeTotal.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20, // Ajustado para dar espacio base antes del inset
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: { position: "relative" },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: "#FFA726", // Color naranja para resaltar sobre el rojo
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: '#fff'
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  info: { alignItems: "flex-end" },
  viewCartText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  totalText: { color: "#FFD700", fontWeight: "bold", fontSize: 13 }, // Dorado para el precio
});