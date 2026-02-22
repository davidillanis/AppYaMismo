import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ProductCreateRequestDTO
} from "@/src/domain/entities/ProductEntity";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { CameraCapture } from "@/src/presentation/components/CameraCapture";
import { useCreateProduct } from "@/src/presentation/hooks/useProductMutation";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router"; // 🔥 IMPORTANTE
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
interface VariantForm {
  name: string;
  price: string; // 👈 ahora es string mientras se escribe
  stock: string;
}


const AgregarProducto: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const router = useRouter();
  const normalize = (size: number) => normalizeScreen(size, 390);
  const styles = createStyles(colors, normalize);

  // 🔥 1. CAPTURAMOS EL ID DEL RESTAURANTE
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [variants, setVariants] = React.useState<VariantForm[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { mutateAsync: createProductMutation } = useCreateProduct();

  /* ================= VARIANTES ================= */
  // ... (Tu lógica de variantes con Modal se mantiene igual, está perfecta)
  const agregarVariante = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);

  };

  const actualizarVariante = (
    index: number,
    field: keyof VariantForm,
    value: string
  ) => {
    const copia = [...variants];
    copia[index] = { ...copia[index], [field]: value };
    setVariants(copia);
  };


  const eliminarVariante = (index: number) => {
    const copia = variants.filter((_, i) => i !== index);
    setVariants(copia);
  };

  /* ================= IMAGENES ================= */
  const handlePhotoTaken = async (base64: string) => {
    setShowCamera(false);
    await processImageUpload(base64);
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          const base64 = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
          await processImageUpload(base64);
        }
      }
    } catch (error) {
      console.log("Error picking image", error);
      Toast.show({ type: "error", text1: "Error", text2: "No se pudo seleccionar la imagen" });
    }
  };

  const processImageUpload = async (base64: string) => {
    try {
      setUploadingImage(true);
      const response = await uploadImageToImgBB(base64);
      if (response?.data?.display_url) {
        setImageUrl(response.data.display_url); // Store the dedicated URL
        Toast.show({ type: "success", text1: "Imagen subida", text2: "La imagen se cargó correctamente" });
      }
    } catch (error) {
      console.log("Error uploading image", error);
      Toast.show({ type: "error", text1: "Error subida", text2: "No se pudo subir la imagen" });
    } finally {
      setUploadingImage(false);
    }
  };

  /* ================= GUARDAR PRODUCTO ================= */

  const guardarProducto = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Nombre requerido", text2: "Falta el nombre." });
      return;
    }

    // Validación de seguridad
    if (!restaurantId) {
      Toast.show({ type: "error", text1: "Error de Sistema", text2: "No se identificó la sucursal." });
      return;
    }

    if (variants.length === 0) {
      Toast.show({ type: "error", text1: "Variantes requeridas", text2: "Agrega al menos una variante." });
      return;
    }

    try {
      setLoading(true);

      const payload: ProductCreateRequestDTO = {
        name,
        description,
        category,
        enabled: true,
        urlImage: imageUrl || "https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_1280.jpg",
        variants: variants.map(v => ({
          name: v.name,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0
        })),

        // 🔥 2. USAMOS EL ID DINÁMICO (Adiós al '1' hardcoded)
        restaurantId: Number(restaurantId),
      };

      const res = await createProductMutation(payload);

      Toast.show({
        type: "success",
        text1: "Producto creado",
        text2: res.message,
      });

      setTimeout(() => router.back(), 1200);
    } catch (error) {
      const err = (mappingError(error).data as any)?.errors?.[0] ?? "Error al crear";
      Toast.show({ type: "error", text1: "Error", text2: err });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  // ... (El resto del renderizado es idéntico a tu archivo original) ...
  // Solo asegúrate de copiar todo el return y styles que ya tenías.

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Agregar Producto</Text>
        </View>

        <View style={styles.imageSection}>
          <View style={styles.imagePreviewContainer}>
            {loading || uploadingImage ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={40} color={colors.textInverse} />
                <Text style={styles.imageText}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowCamera(true)}>
              <Ionicons name="camera" size={24} color={colors.text} />
              <Text style={styles.iconButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color={colors.text} />
              <Text style={styles.iconButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULARIO */}
        {/* ... (Tus inputs de nombre, descripción, etc.) ... */}

        <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={[styles.label, { color: colors.text }]}>Descripción</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 80 }]} multiline />

        <Text style={[styles.label, { color: colors.text }]}>Categoría</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} />

        {/* VARIANTES Y GUARDAR */}
        <TouchableOpacity style={[styles.variantButton, { backgroundColor: colors.button }]} onPress={() => setShowVariants(true)}>
          <Ionicons name="layers-outline" size={20} color={colors.textInverse} />
          <Text style={[styles.variantText, { color: colors.textInverse }]}>{variants.length > 0 ? `Variantes (${variants.length})` : "Configurar Variantes"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: loading ? "#999" : colors.primary }]} onPress={guardarProducto} disabled={loading}>
          <Text style={styles.saveText}>{loading ? "Guardando..." : "Guardar Producto"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL VARIANTES */}
      <Modal visible={showVariants} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* MODAL HEADER */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowVariants(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Variantes del Producto</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {variants.length === 0 ? (
              <View style={styles.emptyVariants}>
                <Ionicons name="layers-outline" size={60} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay variantes agregadas</Text>
                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Agrega tamaños o tipos diferentes para este producto</Text>
              </View>
            ) : (
              variants.map((item, index) => (
                <View key={index} style={[styles.variantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.variantCardHeader}>
                    <Text style={[styles.variantIndex, { color: colors.primary }]}>Variante #{index + 1}</Text>
                    <TouchableOpacity onPress={() => eliminarVariante(index)} style={styles.variantDeleteBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.variantRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Nombre / Tamaño</Text>
                      <TextInput
                        placeholder="Ej: Familiar, 500ml..."
                        placeholderTextColor={colors.textTertiary}
                        value={item.name}
                        style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                        onChangeText={(v) => actualizarVariante(index, "name", v)}
                      />
                    </View>
                  </View>

                  <View style={styles.variantRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Precio</Text>
                      <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                        <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>$</Text>
                        <TextInput
                          placeholder="0.00"
                          placeholderTextColor={colors.textTertiary}
                          keyboardType="decimal-pad"
                          value={item.price}
                          style={[styles.modalInputFlat, { color: colors.text }]}
                          onChangeText={(v) => {
                            if (/^\d*\.?\d*$/.test(v)) {
                              actualizarVariante(index, "price", v);
                            }
                          }}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Stock</Text>
                      <TextInput
                        placeholder="Cant."
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        value={item.stock}
                        style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                        onChangeText={(v) => {
                          if (/^\d*$/.test(v)) {
                            actualizarVariante(index, "stock", v);
                          }
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* BOTTOM ACTIONS */}
          <View style={[styles.modalFooter, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.addVariantBtn, { backgroundColor: colors.secondary }]} onPress={agregarVariante}>
              <Ionicons name="add" size={24} color={colors.textInverse} />
              <Text style={styles.addVariantText}>Nueva Variante</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalDoneBtn, { backgroundColor: colors.primary }]} onPress={() => setShowVariants(false)}>
              <Text style={styles.modalDoneText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CAMERA MODAL */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <CameraCapture
          onPhotoTaken={handlePhotoTaken}
          onCancel={() => setShowCamera(false)}
          quality={0.7}
        />
      </Modal >
    </>
  );
};

// ... (Tus estilos originales createStyles) ...
const createStyles = (colors: any, normalize: any) => StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginTop: 15, },
  title: { fontSize: normalize(18), fontWeight: "bold", marginTop: 15, },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { backgroundColor: colors.surface, borderRadius: 8, padding: 10, marginTop: 5, color: colors.text },
  variantButton: { flexDirection: "row", gap: 10, borderRadius: 10, padding: 15, marginTop: 20, alignItems: "center", justifyContent: "center" },
  variantText: { color: "#fff", fontWeight: "bold" },
  saveButton: { backgroundColor: colors.primary, padding: 15, alignItems: "center", borderRadius: 10, marginTop: 20 },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#F8EBD3", borderRadius: 10, padding: 15, marginBottom: 15 },
  deleteBtn: { backgroundColor: "#C0392B", alignSelf: "flex-end", padding: 6, borderRadius: 6 },
  fab: { position: "absolute", bottom: 80, right: 20, backgroundColor: colors.primary, width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },

  // --- NUEVOS ESTILOS MODAL ---
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
  },
  emptyVariants: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: normalize(14),
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 40,
  },
  variantCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  variantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  variantIndex: {
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  variantDeleteBtn: {
    padding: 5,
  },
  variantRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  miniLabel: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    fontSize: normalize(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  currencyPrefix: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    marginRight: 5,
  },
  modalInputFlat: {
    flex: 1,
    paddingVertical: 10,
    fontSize: normalize(14),
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    borderTopWidth: 1,
  },
  addVariantBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addVariantText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(14),
  },
  modalDoneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalDoneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(14),
  },

  // Agregué estos que faltaban en el snippet reducido para que compile bien
  logo: { width: 50, height: 50, borderRadius: 25 },
  imageSection: { alignItems: 'center', marginVertical: 10 },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A55A00',
    borderStyle: 'dashed'
  },
  previewImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  imageText: { color: colors.text, fontWeight: "bold", marginTop: 8 },
  imageActions: { flexDirection: 'row', gap: 20, marginTop: 15 },
  iconButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  iconButtonText: { color: colors.text, fontWeight: 'bold' }
});

export default AgregarProducto;