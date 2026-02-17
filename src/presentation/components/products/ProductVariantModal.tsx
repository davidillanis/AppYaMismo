import { ProductEntity, ProductVariantEntity } from "@/src/domain/entities/ProductEntity";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (visible) {
      setSelectedVariant(null);
      setQuantity(1);
    }
  }, [visible, product]);

  if (!product) return null;

  const variants = product.variant || [];

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant, quantity);
      onClose();
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const totalPrice = (selectedVariant ? selectedVariant.price : 0) * quantity;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          {/* A. INDICADOR DE ARRASTRE (Handle) */}
          <View style={styles.dragHandle} />

          {/* B. CABECERA CON IMAGEN */}
          <View style={styles.imageHeader}>
            <Image
              source={{ uri: product.urlImage || "https://via.placeholder.com/400x300" }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.blurCloseButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* C. INFORMACIÓN DEL PRODUCTO */}
            <View style={styles.infoSection}>
              <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
              {product.description && (
                <Text style={styles.productDescription}>{product.description}</Text>
              )}
            </View>

            <View style={styles.separator} />

            {/* D. SELECCIÓN DE VARIANTES (Cards modernas) */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Selecciona tu opción</Text>
              {variants.length > 0 ? (
                variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <TouchableOpacity
                      key={variant.id}
                      style={[
                        styles.variantCard, { borderColor: colors.button, backgroundColor: colors.surfaceVariant },
                        isSelected && { borderColor: colors.warning, backgroundColor: colors.card }
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.variantLeft}>
                        <View style={[styles.outerCircle, , { borderColor: colors.textInverse}, isSelected && { borderColor: colors.warning }]}>
                          {isSelected && <View style={[styles.innerCircle, { backgroundColor: colors.warning }]} />}
                        </View>
                        <Text style={[styles.variantName, { color: colors.textInverse }, isSelected && { color: colors.warning }]}>
                          {variant.name}
                        </Text>
                      </View>
                      <Text style={[styles.variantPrice, { color: colors.textInverse }, isSelected && { color: colors.warning }]}>S/ {variant.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noVariants}>No hay opciones disponibles.</Text>
              )}
            </View>

            {/* E. CONTROL DE CANTIDAD (Estilo Pill) */}
            {selectedVariant && (
              <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>¿Cuántos deseas?</Text>
                <View style={styles.quantityPill}>
                  <TouchableOpacity onPress={decrementQuantity} style={styles.qtyControl}>
                    <Ionicons name="remove" size={22} color={quantity > 1 ? colors.primary : '#C7C7CC'} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  
                  <TouchableOpacity onPress={incrementQuantity} style={styles.qtyControl}>
                    <Ionicons name="add" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* F. FOOTER CON PRECIO TOTAL (Sticky) */}
          <View style={[styles.footer, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[
                styles.mainActionButton,
                { backgroundColor: selectedVariant ? colors.primary : colors.buttonSecondary }
              ]}
              disabled={!selectedVariant}
              onPress={handleAddToCart}
            >
              <Text style={[styles.buttonLabel, !selectedVariant && { color: '#8E8E93' }]}>
                {selectedVariant 
                  ? `Agregar al carrito  •  S/ ${totalPrice.toFixed(2)}` 
                  : "Elige una opción"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)", // Oscurecemos un poco más para centrar la atención
    justifyContent: "flex-end",
  },
  container: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    zIndex: 10,
  },
  imageHeader: {
    height: 220,
    width: "100%",
    position: "relative",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  blurCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  infoSection: {
    marginTop: 20,
  },
  productName: {
    fontSize: 26,
    fontWeight: "900",
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  productDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: '#1A1A1A',
    marginBottom: 16,
  },
  variantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    marginBottom: 12,
  },
  variantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  variantName: {
    fontSize: 16,
    fontWeight: "600",
    color: '#1A1A1A',
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: '#1A1A1A',
  },
  quantitySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 30,
    padding: 6,
    width: 160,
    justifyContent: 'space-between',
  },
  qtyControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "800",
    color: '#1A1A1A',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34, // Extra para iPhone Home Indicator
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  mainActionButton: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 17,
  },
  noVariants: {
    color: '#FF3B30',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});