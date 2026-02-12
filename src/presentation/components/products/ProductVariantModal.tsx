//import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/OrderEntity"; // Asegúrate de apuntar a tu definición correcta de Entidades
import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/ProductEntity";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  product: ProductEntity | null;
  onClose: () => void;
  onAddToCart: (product: ProductEntity, variant: ProductVariantEntity, quantity: number) => void;
  colors: any;
}

export const ProductVariantModal: React.FC<Props> = ({
  visible,
  product,
  onClose,
  onAddToCart,
  colors,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantEntity | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Resetear estados cuando se abre el modal o cambia el producto
  useEffect(() => {
    if (visible) {
      setSelectedVariant(null);
      setQuantity(1);
    }
  }, [visible, product]);

  if (!product) return null;

  // Filtrar variantes válidas (si tu entidad tiene 'stock' o 'enabled', úsalos aquí)
  // Nota: Ajusta la validación según los campos reales de tu 'ProductVariantEntity'
  const variants = product.variant || [];

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant, quantity);
      onClose();
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  // Precio total calculado
  const currentPrice = selectedVariant ? selectedVariant.price : 0;
  const totalPrice = currentPrice * quantity;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Contenedor Principal (Estilo Bottom Sheet) */}
        <View style={[styles.container, { backgroundColor: colors.background }]}>

          {/* Imagen de Cabecera */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: product.urlImage || "https://via.placeholder.com/400x300?text=Sin+Imagen",
              }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.content, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={false}>
            {/* Información Básica */}
            <Text style={[styles.productName, { color: colors.text }]}>
              {product.name}
            </Text>
            {product.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {product.description}
              </Text>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.text }]} />

            {/* Selección de Variantes */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Elige una opción
            </Text>

            <View style={styles.variantsContainer}>
              {variants.length > 0 ? (
                variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <TouchableOpacity
                      key={variant.id}
                      style={[
                        styles.variantOption,
                        {
                          borderColor: isSelected ? colors.primary : "#ddd",
                          backgroundColor: isSelected ? `${colors.primary}10` : "transparent"
                        },
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.variantInfo}>
                        <View style={[
                          styles.radioCircle,
                          { borderColor: isSelected ? colors.primary : "#999" }
                        ]}>
                          {isSelected && <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />}
                        </View>
                        <Text style={[styles.variantName, { color: colors.text }]}>
                          {variant.name}
                        </Text>
                      </View>
                      <Text style={[styles.variantPrice, { color: colors.text }]}>
                        S/ {variant.price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: colors.error, fontStyle: 'italic' }}>
                  No hay opciones disponibles para este producto.
                </Text>
              )}
            </View>

            {/* Selector de Cantidad (Solo visible si hay variante seleccionada) */}
            {selectedVariant && (
              <View style={styles.quantitySection}>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                  Cantidad
                </Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={decrementQuantity}
                    style={[styles.qtyButton, { borderColor: "#ddd" }]}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>

                  <Text style={[styles.qtyText, { color: colors.text }]}>
                    {quantity}
                  </Text>

                  <TouchableOpacity
                    onPress={incrementQuantity}
                    style={[styles.qtyButton, { borderColor: colors.primary, backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Espacio extra al final para el scroll */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer Fijo con Botón de Acción */}
          <View style={[styles.footer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: selectedVariant ? colors.primary : "#ccc" },
              ]}
              disabled={!selectedVariant}
              onPress={handleAddToCart}
            >
              <Text style={styles.actionButtonText}>
                {selectedVariant
                  ? `Agregar   |   S/ ${totalPrice.toFixed(2)}`
                  : "Selecciona una opción"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  imageContainer: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  variantsContainer: {
    marginBottom: 20,
  },
  variantOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  variantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  variantName: {
    fontSize: 16,
    fontWeight: "500",
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 10, // Sombra para Android
    shadowColor: "#000", // Sombra para iOS
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});