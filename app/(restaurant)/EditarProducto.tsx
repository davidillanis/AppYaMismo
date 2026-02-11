import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VariantRequestDTO } from "@/src/domain/entities/ProductEntity";
import { replaceVariants } from "@/src/domain/services/ProductService";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { CameraCapture } from "@/src/presentation/components/CameraCapture";
import { useProductById } from "@/src/presentation/hooks/useProductById";
import { useUpdateProduct } from "@/src/presentation/hooks/useProductMutation";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const EditarProducto: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "normal"];
  const router = useRouter();
  const normalize = (size: number) => normalizeScreen(size, 390);
  const styles = createStyles(colors, normalize);

  // --- ID del producto recibido desde MiCarta ---
  const { id } = useLocalSearchParams<{ id: string }>();

  // --- Hooks para obtener y actualizar producto ---
  const { data: product, isLoading } = useProductById(Number(id));
  const { mutateAsync: updateProductMutation } = useUpdateProduct();

  // --- Estados locales ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [variants, setVariants] = useState<VariantRequestDTO[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- Cargar datos del producto al montar ---
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setCategory(product.category?.name || "");
      setImageUrl(product.urlImage || null);
      setVariants(
        product.variant?.map((v) => ({
          name: v.name,
          price: v.price,
          stock: v.stock,
        })) || []
      );
    }
  }, [product]);

  // --- Actualizar producto ---
  const guardarCambios = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Nombre requerido",
        text2: "Debes ingresar el nombre del producto",
      });
      return;
    }

    if (variants.length === 0) {
      Toast.show({
        type: "error",
        text1: "Variantes requeridas",
        text2: "Debes agregar al menos una variante",
      });
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Actualizamos los datos generales
      await updateProductMutation({
        id: Number(id),
        payload: {
          name,
          description,
          category,
          enabled: true,
          urlImage: imageUrl || product?.urlImage || "https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_1280.jpg",
        },
      });

      // 2️⃣ Reemplazamos las variantes
      await replaceVariants(Number(id), variants);

      Toast.show({
        type: "success",
        text1: "Cambios guardados",
        text2: `"${name}" se actualizó correctamente.`,
      });

      setTimeout(() => router.back(), 1200);
    } catch (error) {
      console.log(mappingError(error).data);

      Toast.show({
        type: "error",
        text1: "Error al guardar",
        text2: "No se pudo actualizar el producto.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Funciones variantes ---
  const agregarVariante = () => setVariants([...variants, { name: "", price: 0, stock: 0 }]);
  const actualizarVariante = (i: number, f: keyof VariantRequestDTO, v: any) => {
    const copia = [...variants];
    copia[i] = { ...copia[i], [f]: v };
    setVariants(copia);
  };
  const eliminarVariante = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

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
        setImageUrl(response.data.display_url);
        Toast.show({ type: "success", text1: "Imagen subida", text2: "La imagen se actualizó correctamente" });
      }
    } catch (error) {
      console.log("Error uploading image", error);
      Toast.show({ type: "error", text1: "Error subida", text2: "No se pudo subir la imagen" });
    } finally {
      setUploadingImage(false);
    }
  };

  // --- UI ---
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Cargando producto...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.button }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
          </TouchableOpacity>

          <Image
            source={{
              uri: product?.urlImage || "https://via.placeholder.com/100",
            }}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>Editar Producto</Text>
        </View>

        {/* IMAGEN */}
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

        {/* CAMPOS */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} />

        {/* VARIANTES */}
        <TouchableOpacity
          style={[styles.variantButton, { backgroundColor: colors.button }]}
          onPress={() => setShowVariants(true)}
        >
          <Ionicons name="layers-outline" size={20} color="#fff" />
          <Text style={styles.variantText}>
            {variants.length > 0
              ? `Variantes (${variants.length})`
              : "Configurar Variantes"}
          </Text>
        </TouchableOpacity>

        {/* GUARDAR */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: loading ? "#999" : colors.primary },
          ]}
          onPress={guardarCambios}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL VARIANTES */}
      <Modal visible={showVariants} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={styles.title}>Editar Variantes</Text>

            {variants.map((item, index) => (
              <View key={index} style={styles.card}>
                <TextInput
                  placeholder="Nombre"
                  value={item.name}
                  style={styles.input}
                  onChangeText={(v) => actualizarVariante(index, "name", v)}
                />
                <TextInput
                  placeholder="Precio"
                  keyboardType="numeric"
                  value={item.price === 0 ? "" : String(item.price)}
                  style={styles.input}
                  onChangeText={(v) =>
                    actualizarVariante(index, "price", Number(v) || 0)
                  }
                />
                <TextInput
                  placeholder="Stock"
                  keyboardType="numeric"
                  value={item.stock === 0 ? "" : String(item.stock)}
                  style={styles.input}
                  onChangeText={(v) =>
                    actualizarVariante(index, "stock", Number(v) || 0)
                  }
                />

                <TouchableOpacity
                  onPress={() => eliminarVariante(index)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={agregarVariante}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowVariants(false)}
          >
            <Text style={styles.saveText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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

/* ================= STYLES ================= */
const createStyles = (colors: any, normalize: any) =>
  StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: { width: 50, height: 50, borderRadius: 25 },
    title: { fontSize: normalize(18), fontWeight: "bold" },
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
    iconButtonText: { color: '#fff', fontWeight: 'bold' },
    label: { fontWeight: "bold", marginTop: 10 },
    input: {
      backgroundColor: "#F8EBD3",
      borderRadius: 8,
      padding: 10,
      marginTop: 5,
    },
    variantButton: {
      flexDirection: "row",
      gap: 10,
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    variantText: { color: "#fff", fontWeight: "bold" },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 15,
      alignItems: "center",
      borderRadius: 10,
      marginTop: 20,
    },
    saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    card: {
      backgroundColor: "#F8EBD3",
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    deleteBtn: {
      backgroundColor: "#C0392B",
      alignSelf: "flex-end",
      padding: 6,
      borderRadius: 6,
    },
    fab: {
      position: "absolute",
      bottom: 80,
      right: 20,
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default EditarProducto;

