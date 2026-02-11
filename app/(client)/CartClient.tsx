import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/src/presentation/context/AuthContext";
// 🔥 1. USAMOS LA NUEVA INTERFAZ DEL CONTEXTO
import { useCart } from "@/src/presentation/context/CartContext";

import { EPaymentMethod } from "@/src/domain/entities/SaleEntity";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
// Asegúrate de que CartItemRow soporte la nueva estructura { item }
import { CartItemRow } from "@/src/presentation/components/cart/CartItemRow";
import { CartSummary } from "@/src/presentation/components/cart/CartSummary";
import { useCreateOrder } from "@/src/presentation/hooks/useOrderMutation";

export default function CartClient() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // 🔥 2. CAMBIO DE VARIABLES: cartItems y cartTotal
  const { cartItems, clearCart, cartTotal } = useCart();
  const { user } = useAuth();

  const [isLocating, setIsLocating] = useState(false);
  const mutation = useCreateOrder();

  const handleCheckout = () => {
    if (!user?.id) {
      Alert.alert("Error", "No se ha identificado al usuario.");
      return;
    }

    Alert.alert(
      "Confirmar Pedido",
      `Total a pagar: S/. ${cartTotal.toFixed(2)}\n¿Enviar pedido?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, pedir",
          onPress: submitOrder,
        },
      ],
    );
  };

  const submitOrder = async () => {
    setIsLocating(true);

    try {
      // 1. Obtener Permisos
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert("Permiso denegado", "Necesitamos tu ubicación para el envío.");
        setIsLocating(false);
        return;
      }

      // 2. Obtener Coordenadas
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 🔥 3. CONSTRUCCIÓN DEL PAYLOAD REAL
      const payload = {
        paymentMethod: EPaymentMethod.EFECTIVO,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        customerId: user?.id ?? 0,
        orderDetails: cartItems.map((item) => ({
          productId: item.product.id,
          // 🔴 ANTES (Error): productVariantId: item.variant.id, 
          // 🟢 AHORA (Correcto):
          variantId: item.variant.id, 
          amount: item.quantity,
          unitPrice: item.variant.price,
          note: "Sin nota",
        })),
      };

      // 4. Enviar a la API
      mutation.mutate(
        { payload },
        {
          onSuccess: (response) => {
            clearCart();
            Alert.alert(
              "¡Pedido Exitoso!",
              "Tu orden ha sido registrada correctamente.",
              [{ text: "OK", onPress: () => router.push("/OrderHistoryClient") }] // Ajusta la ruta si es necesario
            );
          },
          onError: (error: any) => {
            let message = mappingError(error);
            Alert.alert("Error", "Hubo un problema al enviar el pedido.");
          },
          onSettled: () => {
            setIsLocating(false);
          }
        }
      );

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo obtener la ubicación o procesar el pedido.");
      setIsLocating(false);
    }
  };

  const isLoading = mutation.isPending || isLocating;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Cabecera */}
      <View style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: (colors as any).border || "#eee"
        }
      ]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Mi Carrito</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Overlay de Carga */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: "#333", fontWeight: 'bold' }}>
            {isLocating ? "Obteniendo ubicación..." : "Procesando pedido..."}
          </Text>
        </View>
      )}

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={colors.text} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Tu carrito está vacío</Text>
          <TouchableOpacity
            style={[styles.continueButton, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.continueText, { color: colors.primary }]}>Ver Menú</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, opacity: isLoading ? 0.3 : 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.uniqueId} // 🔥 Usamos el uniqueId del contexto
            renderItem={({ item }) => (
              <CartItemRow
                item={item} // Pasamos el objeto completo (CartItem)
                colors={colors}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
          <View pointerEvents={isLoading ? "none" : "auto"}>
            {/* Pasamos el total calculado por el contexto */}
            <CartSummary 
                colors={colors} 
                onCheckout={handleCheckout} 
                total={cartTotal} 
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: { padding: 5 },
  title: { fontSize: 20, fontWeight: "bold" },
  listContent: { padding: 15, paddingBottom: 50 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, marginVertical: 20 },
  continueButton: { padding: 12, borderRadius: 25, borderWidth: 1 },
  continueText: { fontWeight: "600" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});