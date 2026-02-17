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
  const styles = useMemo(() => createStyles(colors), [colors]);

  const variants = product.variant || [];
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress(product)}
      activeOpacity={0.95}
    >
      {/* 1. SECCIÓN DE IMAGEN (Full width superior) */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.urlImage || "https://via.placeholder.com/400x250" }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badge de Promoción (Placeholder) */}
        <View style={styles.promoBadge}>
          <Ionicons name="flash" size={12} color="#FFF" />
          <Text style={styles.promoText}>Envío Rápido</Text>
        </View>
        
        {/* Botón flotante "+" */}
        <TouchableOpacity 
          style={[styles.floatingAddButton, { backgroundColor: colors.primary }]}
          onPress={() => onPress(product)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 2. SECCIÓN DE INFORMACIÓN (Debajo de la imagen) */}
      <View style={styles.footerContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { fontSize: normalize(17), color: colors.text }]} numberOfLines={1}>
            {product.name}
          </Text>
          {/* Rating (Simulado para nivel profesional) */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
        
        <Text style={[styles.restaurantName, { color: colors.textSecondary }]} numberOfLines={1}>
          {restaurantName || product.restaurant?.name || "Restaurante local"}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.priceBox}>
            <Text style={[styles.price, { color: colors.warning, fontSize: normalize(18) }]}>
              {minPrice > 0 ? `S/ ${minPrice.toFixed(2)}` : "Consultar"}
            </Text>
            {variants.length > 1 && (
              <Text style={[styles.variantsLabel, { color: colors.textSecondary }]}>(más opciones)</Text>
            )}
          </View>
          
          {/* Info extra (Simulada) */}
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={14} color={colors.text} />
            <Text style={[styles.timeText, { color: colors.text }]}>25-35 min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // Blanco puro para resaltar la comida
    overflow: 'hidden', // Importante para que la imagen respete el radio superior
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 180, // Altura tipo Rappi
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#00BFA5', // Color turquesa tipo Rappi/Uber
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promoText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: -12,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  footerContent: {
    padding: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: "900",
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFB800',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "600",
    color: '#8E8E93',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontWeight: "900",
  },
  variantsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: '#C7C7CC',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
});