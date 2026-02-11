import { Colors } from "@/constants/Colors";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { CartItem, useCart } from "@/src/presentation/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: CartItem;
  colors: typeof Colors.light;
}

export const CartItemRow: React.FC<Props> = ({ item, colors }) => {
  // Obtenemos las funciones actualizadas del contexto
  const { addToCart, decreaseQuantity } = useCart();
  
  const normalize = (size: number) => normalizeScreen(size, 390);

  // Acceso seguro a los datos (Nueva estructura)
  const product = item.product;
  const variant = item.variant;
  const restaurantName = product.restaurant?.name || "Restaurante";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* 1. Imagen del Producto */}
      <Image
        source={{ uri: product.urlImage || "https://via.placeholder.com/100" }}
        style={styles.image}
      />

      {/* 2. Información Central */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>
        
        {/* Mostramos el nombre de la variante (Ej: "Familiar") */}
        <Text style={[styles.variantName, { color: colors.primary }]}>
            {variant.name}
        </Text>

        <Text style={[styles.restaurant, { color: colors.textSecondary }]} numberOfLines={1}>
          {restaurantName}
        </Text>

        {/* Precio total de esta fila (Precio variante * Cantidad) */}
        <Text style={[styles.price, { color: colors.text }]}>
          S/. {(variant.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      {/* 3. Controles de Cantidad */}
      <View style={styles.actionsContainer}>
        {/* CORRECCIÓN: Usamos uniqueId para disminuir */}
        <TouchableOpacity
          onPress={() => decreaseQuantity(item.uniqueId)}
          style={[styles.iconButton, { borderColor: "#ddd" }]}
        >
          {item.quantity === 1 ? (
            <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          ) : (
            <Ionicons name="remove" size={16} color={colors.text} />
          )}
        </TouchableOpacity>

        <Text style={[styles.quantity, { color: colors.text }]}>
          {item.quantity}
        </Text>

        {/* CORRECCIÓN: addToCart ahora pide (product, variant, qty) */}
        <TouchableOpacity
          onPress={() => addToCart(product, variant, 1)}
          style={[
            styles.iconButton,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  variantName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  restaurant: {
    fontSize: 12,
    marginBottom: 4,
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    padding: 4,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  quantity: {
    marginHorizontal: 10,
    fontWeight: "600",
    fontSize: 14,
  },
});