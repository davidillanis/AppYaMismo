import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ProductCreateRequestDTO,
  VariantRequestDTO,
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
  const [variants, setVariants] = React.useState<VariantRequestDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { mutateAsync: createProductMutation } = useCreateProduct();

  /* ================= VARIANTES ================= */
  // ... (Tu lógica de variantes con Modal se mantiene igual, está perfecta)
  const agregarVariante = () => {
    setVariants([...variants, { name: "", price: 0, stock: 0 }]);
  };

  const actualizarVariante = (
    index: number,
    field: keyof VariantRequestDTO,
    value: any
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
        variants,
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
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.button }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
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
                <Ionicons name="image-outline" size={40} color="#A55A00" />
                <Text style={styles.imageText}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowCamera(true)}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.iconButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.iconButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULARIO */}
        {/* ... (Tus inputs de nombre, descripción, etc.) ... */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput value={description} onChangeText={setDescription} style={[styles.input, { height: 80 }]} multiline />

        <Text style={styles.label}>Categoría</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} />

        {/* VARIANTES Y GUARDAR */}
        <TouchableOpacity style={[styles.variantButton, { backgroundColor: colors.button }]} onPress={() => setShowVariants(true)}>
          <Ionicons name="layers-outline" size={20} color="#fff" />
          <Text style={styles.variantText}>{variants.length > 0 ? `Variantes (${variants.length})` : "Configurar Variantes"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: loading ? "#999" : colors.primary }]} onPress={guardarProducto} disabled={loading}>
          <Text style={styles.saveText}>{loading ? "Guardando..." : "Guardar Producto"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL VARIANTES (Tu código original) */}
      <Modal visible={showVariants} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* ... Tu UI del modal ... */}
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.title}>Variantes</Text>
            {variants.map((item, index) => (
              <View key={index} style={styles.card}>
                <TextInput placeholder="Nombre" value={item.name} style={styles.input} onChangeText={(v) => actualizarVariante(index, "name", v)} />
                <TextInput placeholder="Precio" keyboardType="numeric" value={item.price === 0 ? "" : String(item.price)} style={styles.input} onChangeText={(v) => actualizarVariante(index, "price", Number(v) || 0)} />
                <TextInput placeholder="Stock" keyboardType="numeric" value={item.stock === 0 ? "" : String(item.stock)} style={styles.input} onChangeText={(v) => actualizarVariante(index, "stock", Number(v) || 0)} />
                <TouchableOpacity onPress={() => eliminarVariante(index)} style={styles.deleteBtn}>
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.fab} onPress={agregarVariante}><Ionicons name="add" size={30} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={() => setShowVariants(false)}><Text style={styles.saveText}>Listo</Text></TouchableOpacity>
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
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  title: { fontSize: normalize(18), fontWeight: "bold" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { backgroundColor: "#F8EBD3", borderRadius: 8, padding: 10, marginTop: 5 },
  variantButton: { flexDirection: "row", gap: 10, borderRadius: 10, padding: 15, marginTop: 20, alignItems: "center", justifyContent: "center" },
  variantText: { color: "#fff", fontWeight: "bold" },
  saveButton: { backgroundColor: colors.primary, padding: 15, alignItems: "center", borderRadius: 10, marginTop: 20 },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: { backgroundColor: "#F8EBD3", borderRadius: 10, padding: 15, marginBottom: 15 },
  deleteBtn: { backgroundColor: "#C0392B", alignSelf: "flex-end", padding: 6, borderRadius: 6 },
  fab: { position: "absolute", bottom: 80, right: 20, backgroundColor: colors.primary, width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  // Agregué estos que faltaban en el snippet reducido para que compile bien
  logo: { width: 50, height: 50, borderRadius: 25 },
  imageSection: { alignItems: 'center', marginVertical: 20 },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8EBD3',
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
  imageText: { color: "#A55A00", fontWeight: "bold", marginTop: 8 },
  imageActions: { flexDirection: 'row', gap: 15, marginTop: 15 },
  iconButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  iconButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default AgregarProducto;