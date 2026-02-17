import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { useRestaurantById } from "@/src/presentation/hooks/useRestaurantById";
import { useUpdateRestaurant } from "@/src/presentation/hooks/useRestaurantMutation";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const FALLBACK_IMAGE =
  "https://ui-avatars.com/api/?name=Restaurante&background=273E47&color=ffffff&bold=true";

const ProfileRestaurant: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // ✅ Obtener el parámetro restaurantId desde la navegación
  const { restaurantId } = useLocalSearchParams();
  const id = Number(restaurantId);

  // 🔹 Hook para obtener restaurante por ID
  const { data: restaurantData, isLoading, refetch } = useRestaurantById(id);

  // 🔹 Hook de mutación (para actualizar datos)
  const updateMutation = useUpdateRestaurant();

  // 🔹 Estado inicial del restaurante
  const restaurant: any = restaurantData ?? {};

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(FALLBACK_IMAGE);

  const [editField, setEditField] = useState<
    "name" | "address" | "phone" | "description" | null
  >(null);

  const [tempValue, setTempValue] = useState("");

  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 🔹 Cargar datos en los estados locales
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name ?? "");
      setAddress(restaurant.address ?? "");
      setPhone(restaurant.phone ?? "");
      setDescription(restaurant.description ?? "");
      setImageUrl(restaurant.urlImagen ?? FALLBACK_IMAGE);
    }
  }, [restaurant]);

  // 🔹 Abrir modal de edición
  const openEditModal = (field: "name" | "address" | "phone" | "description") => {
    setEditField(field);
    if (field === "name") setTempValue(name);
    if (field === "address") setTempValue(address);
    if (field === "phone") setTempValue(phone);
    if (field === "description") setTempValue(description);
  };

  // 🔹 Guardar cambios
  const saveEdit = async () => {
    if (!editField || !id) return;
    try {
      const payload: any = {};
      if (editField === "name") payload.name = tempValue;
      if (editField === "address") payload.address = tempValue;
      if (editField === "phone") payload.phone = tempValue;
      if (editField === "description") payload.description = tempValue;

      await updateMutation.mutateAsync({ id, payload });

      // Reflejar localmente
      if (editField === "name") setName(tempValue);
      if (editField === "address") setAddress(tempValue);
      if (editField === "phone") setPhone(tempValue);
      if (editField === "description") setDescription(tempValue);

      setEditField(null);
      Toast.show({ type: "success", text1: "Datos actualizados correctamente" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Error al guardar cambios" });
    }
  };

  // 🔹 Subir imagen al servidor
  const handleImageUpload = async (base64: string) => {
    try {
      setIsUploadingImage(true);
      const response = await uploadImageToImgBB(base64, 600, async (url) => {
        await updateMutation.mutateAsync({ id, payload: { urlImagen: url } });
      });
      const newUrl = response.data.display_url;
      setImageUrl(newUrl);
      Toast.show({ type: "success", text1: "Imagen actualizada correctamente" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error al subir imagen" });
    } finally {
      setIsUploadingImage(false);
      setShowImageOptions(false);
    }
  };

  // 🔹 Componente de información
  const InfoItem = ({
    icon,
    label,
    value,
    editable,
  }: {
    icon: string;
    label: string;
    value: string;
    editable?: () => void;
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon as any} size={16} color={colors.info} />
        <Text style={[styles.infoLabel, { color: colors.info }]}>{label}</Text>
        {editable && (
          <TouchableOpacity
            onPress={editable}
            style={[styles.editButton, { backgroundColor: colors.buttonSecondary }]}
            disabled={updateMutation.isPending}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || "—"}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Encabezado */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.button }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mi Restaurante</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Imagen */}
          <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowImageOptions(true)}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.profileSubtitle, { color: colors.info }]}>Restaurante</Text>
          </View>

          {/* Información */}
          <View style={styles.profileInfo}>
            <View style={styles.sectionTitle}>
              <Ionicons name="restaurant-outline" size={20} color={colors.info} />
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                Información del restaurante
              </Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <InfoItem
                icon="home-outline"
                label="Dirección"
                value={address}
                editable={() => openEditModal("address")}
              />
              <View style={styles.divider} />

              <InfoItem
                icon="call-outline"
                label="Teléfono"
                value={phone}
                editable={() => openEditModal("phone")}
              />
              <View style={styles.divider} />

              <InfoItem
                icon="information-circle-outline"
                label="Descripción"
                value={description}
                editable={() => openEditModal("description")}
              />
            </View>
          </View>
        </ScrollView>

        {/* Modal edición */}
        <Modal visible={!!editField} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar campo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={tempValue}
                onChangeText={setTempValue}
                placeholder="Escribe aquí..."
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setEditField(null)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={saveEdit}
                >
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginHorizontal: 10,
    position: "relative",
  },
  backButton: { position: "absolute", left: 10, padding: 8, borderRadius: 50 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  profileHeader: { alignItems: "center", paddingVertical: 30, marginBottom: 20 },
  imageContainer: { position: "relative", marginBottom: 15 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.light.primary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  profileSubtitle: { fontSize: 15, fontWeight: "500" },
  profileInfo: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitleText: { fontSize: 18, fontWeight: "600", marginLeft: 8 },
  infoCard: { borderRadius: 12, padding: 20, elevation: 3 },
  infoItem: { paddingVertical: 8 },
  infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoLabel: { fontSize: 14, marginLeft: 8, fontWeight: "500", flex: 1 },
  editButton: { padding: 4, borderRadius: 10 },
  infoValue: { fontSize: 16, paddingLeft: 24 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 16, fontWeight: "500" },
});

export default ProfileRestaurant;

