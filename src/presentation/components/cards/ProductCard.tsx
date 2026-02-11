import { Colors } from "@/constants/Colors";
import { ProductEntity } from "@/src/domain/entities/ProductEntity";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  product: ProductEntity;
  restaurantName?: string;
  colors: typeof Colors.light;
  normalize: (s: number) => number;
  onPress: (product: ProductEntity) => void; // <--- Callback para abrir modal
}

export const ProductCard: React.FC<Props> = ({
  product,
  restaurantName,
  colors,
  normalize,
  onPress,
}) => {
  
  // Calcular precio "Desde" basado en la variante más barata
  const variants = product.variant || [];
  const minPrice = variants.length > 0 
    ? Math.min(...variants.map(v => v.price)) 
    : 0;

  // Texto del botón
  const buttonText = variants.length > 0 ? "Agregar" : "Agotado";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Image
        source={{
          uri: product.urlImage || "https://via.placeholder.com/300?text=Sin+Imagen",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text, fontSize: normalize(16) }]}>
          {product.name}
        </Text>
        
        <Text style={[styles.restaurant, { color: colors.textSecondary, fontSize: normalize(13) }]}>
          {restaurantName || product.restaurant?.name || "Restaurante"}
        </Text>

        <View style={styles.detailsRow}>
          {/* Precio o Texto Informativo */}
          <Text style={[styles.price, { color: colors.text, fontSize: normalize(15) }]}>
             {minPrice > 0 ? `Desde S/ ${minPrice.toFixed(2)}` : "Ver opciones"}
          </Text>

          {/* Botón que abre el Modal */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => onPress(product)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 15, marginBottom: 15, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
  image: { width: "100%", height: 160, backgroundColor: "#eee" },
  infoContainer: { padding: 12 },
  name: { fontWeight: "bold" },
  restaurant: { marginTop: 2 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  price: { fontWeight: "bold" },
  addButton: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, elevation: 2 },
  addButtonText: { color: "#fff", fontWeight: "600", marginLeft: 4, fontSize: 12 },
});