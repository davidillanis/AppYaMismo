import { Colors } from "@/constants/Colors";
import { RestaurantCreateRequestDTO } from "@/src/domain/entities/RestaurantEntity";
import { listUsers } from "@/src/domain/services/UserService";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { CameraCapture } from "@/src/presentation/components/CameraCapture";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
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
  View
} from "react-native";
import Toast from "react-native-toast-message";
import ComboBox from "../ComboBox";
import { KeyboardAwareWrapper } from "../form";

interface Props {
  initialValues?: Partial<RestaurantCreateRequestDTO>;
  onSubmit: (values: RestaurantCreateRequestDTO) => void;
  isSubmitting: boolean;
  submitLabel: string;
  colors: typeof Colors.light;
  showMapButton?: boolean;
  onMapPress?: () => void;
}

export const RestaurantForm: React.FC<Props> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  colors,
  showMapButton = true,
  onMapPress,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [urlImagen, setUrlImagen] = useState("");
  const [types, setTypes] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [user, setUser] = useState<string>("");

  // Estados para manejo de imagen
  const [showCamera, setShowCamera] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  const RED_COLOR = "#D32F2F";

  const handleImageUpload = async (base64: string) => {
    try {
      setShowCamera(false);
      setShowImageOptions(false);
      setIsUploadingImage(true);

      const response = await uploadImageToImgBB(base64, 600, (url) => {
        // Opcional: callback de progreso o finalización intermedia
      });

      const imageUrl = response.data.display_url;
      setUrlImagen(imageUrl);

      Toast.show({
        type: 'success',
        text1: 'Imagen cargada correctamente',
      });

    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error al subir la imagen',
      });
    } finally {
      setIsUploadingImage(false);
    }
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
          const base64 = `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;
          handleImageUpload(base64);
        }
      }
    } catch (error) {
      console.log("Error picking image", error);
      Toast.show({
        type: 'error',
        text1: 'Error al seleccionar imagen',
      });
    }
  };

  const selectImageOption = (option: "camera" | "gallery") => {
    setShowImageOptions(false);
    if (option === "camera") {
      setShowCamera(true);
    } else {
      handlePickImage();
    }
  };

  useEffect(() => {
    if (!initialValues) return;
    if (!name) setName(initialValues.name ?? "");
    if (!address) setAddress(initialValues.address ?? "");
    if (!urlImagen) setUrlImagen(initialValues.urlImagen ?? "");
    if (!user) setUser(initialValues.userId?.toString() ?? "");
    if (!types && Array.isArray(initialValues.type)) {
      setTypes(initialValues.type.join(", "));
    }
  }, [initialValues]);

  // CORRECCIÓN: Sincroniza lat/lng cuando cambian las props (al volver del mapa)
  useEffect(() => {
    if (initialValues?.latitude && initialValues?.longitude) {
      setLat(Number(initialValues.latitude));
      setLng(Number(initialValues.longitude));
    }
  }, [initialValues?.latitude, initialValues?.longitude]);

  const handleSubmit = () => {
    if (!name || !address || !urlImagen || !user) {
      Toast.show({
        type: "warning",
        text1: "Campo requerido",
        text2: "Por favor complete todos los campos obligatorios",
        visibilityTime: 3000,
        topOffset: 60,
      });
      return;
    }
    if (address.length < 10) {
      alert("La dirección debe tener al menos 10 caracteres.");
      return;
    }
    if (lat === null || lng === null) {
      alert("Selecciona la ubicación en el mapa.");
      return;
    }

    const payload: RestaurantCreateRequestDTO = {
      name,
      address,
      urlImagen,
      type: types
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      enabled: initialValues?.enabled ?? true,
      latitude: lat,
      longitude: lng,
      userId: Number(user),
    };
    onSubmit(payload);
  };

  return (
    <KeyboardAwareWrapper contentContainerStyle={{ padding: 16 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {showMapButton && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Ubicación en el mapa *
            </Text>
            <TouchableOpacity
              style={[styles.mapButtonOutline, { borderColor: RED_COLOR }]}
              onPress={onMapPress}
            >
              <View style={styles.mapButtonInner}>
                <Ionicons name="pencil-sharp" size={18} color={RED_COLOR} />
                <Text style={[styles.mapButtonText, { color: RED_COLOR }]}>
                  {lat !== null
                    ? `Cambiar ubicación`
                    : "Seleccionar ubicación del restaurante"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={RED_COLOR} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity onPress={() => setShowImageOptions(true)} disabled={isUploadingImage} style={{ width: '100%', alignItems: 'center' }}>
            {urlImagen ? (
              <Image source={{ uri: urlImagen }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#bbb" />
                <Text style={{ color: "#999", marginTop: 5 }}>Toca para agregar imagen</Text>
              </View>
            )}

            {isUploadingImage && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>

          {lat !== null && lng !== null && (
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Ionicons name="location-sharp" size={14} color={colors.primary} />
              <Text style={{ fontSize: 12, marginLeft: 6, color: "#666" }}>
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nombre del Restaurante *
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: La Casona"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Jr. Apurimac 123"
            placeholderTextColor="#999"
          />
        </View>

        <ComboBox
          value={user}
          onChange={setUser}
          label="Select User"
          fetchItems={async () => {
            const response = await listUsers();
            return (
              response.data?.content?.map((user) => ({
                label: String(user.name) + " " + String(user.lastName),
                value: String(user.id),
              })) ?? []
            );
          }}
          searchable={true}
          required={true}
          disabled={submitLabel !== "Crear Restaurante"}
        />

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Categorías</Text>
          <TextInput
            style={styles.input}
            value={types}
            onChangeText={setTypes}
            placeholder="Parrillas, Bebidas"
            placeholderTextColor="#999"
          />
          <Text style={styles.helperText}>Separar por comas</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isSubmitting ? "#ccc" : colors.primary },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />

        {/* MODALES DE IMAGEN */}
        <Modal visible={showImageOptions} transparent animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImageOptions(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cambiar imagen</Text>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => selectImageOption("camera")}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text style={styles.modalOptionText}>Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => selectImageOption("gallery")}
              >
                <Ionicons name="images" size={24} color={colors.primary} />
                <Text style={styles.modalOptionText}>
                  Seleccionar de galería
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowImageOptions(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showCamera}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCamera(false)}
        >
          <CameraCapture
            onPhotoTaken={handleImageUpload}
            onCancel={() => setShowCamera(false)}
            quality={0.7}
          />
        </Modal>
      </ScrollView>
    </KeyboardAwareWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  imagePreviewContainer: { alignItems: "center", marginBottom: 20 },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  formGroup: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    fontStyle: "italic",
  },
  mapButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    backgroundColor: "rgba(211, 47, 47, 0.05)",
    marginTop: 5,
  },
  mapButtonInner: { flexDirection: "row", alignItems: "center" },
  mapButtonText: { fontSize: 14, fontWeight: "bold", marginLeft: 10 },
  submitButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  // Estilos Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalCancel: {
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: 'red',
  },
});