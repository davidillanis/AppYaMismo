import { ProductEntity } from "@/src/domain/entities/ProductEntity";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  product: ProductEntity;
  restaurantName?: string;
  colors: any; // MappedPalette
  normalize: (s: number) => number;
  onPress: (product: ProductEntity) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  restaurantName,
  colors,
  normalize,
  onPress,
}) => {
  // 1. Memorizamos los estilos para que tengan acceso a 'colors' y sean eficientes
  const styles = useMemo(() => createStyles(colors), [colors]);

  const variants = product.variant || [];
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { fontSize: normalize(15) }]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {restaurantName || product.restaurant?.name || "Disponible ahora"}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary, fontSize: normalize(16) }]}>
              {minPrice > 0 ? `S/ ${minPrice.toFixed(2)}` : "Consultar"}
            </Text>
            {variants.length > 1 && (
              <Text style={styles.variantsLabel}>(más opciones)</Text>
            )}
          </View>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.urlImage || "https://via.placeholder.com/150" }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={[styles.miniAddButton, { backgroundColor: colors.primary }]}
            onPress={() => onPress(product)}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 2. Función que genera los estilos usando los colores del tema
const createStyles = (colors: any) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 12,
    backgroundColor: '#f4edd9', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
    paddingLeft: 4,
    justifyContent: 'center'
  },
  name: {
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 6,
    color: '#1A1A1A', 
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
    color: '#8E8E93', 
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  price: {
    fontWeight: "900",
  },
  variantsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: '#C7C7CC'
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  miniAddButton: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 36,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    // Ahora sí podemos usar colors.primary sin errores
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});