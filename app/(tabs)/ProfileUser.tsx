import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ✅ NUEVO: hooks reales
import {
  UserEntity,
  UserUpdateRequestDTO,
} from "@/src/domain/entities/UserEntity";
import { uploadImageToImgBB } from "@/src/domain/services/UtilsService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { CameraCapture } from "@/src/presentation/components/CameraCapture";
import { useUserById } from "@/src/presentation/hooks/useUserById";
import { useUserMutation } from "@/src/presentation/hooks/useUserMutation";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import Toast from "react-native-toast-message";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=Usuario&background=273E47&color=ffffff&bold=true";

const ProfileUser: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const isDark = colorScheme === "dark";
  const normalize = (size: number) => normalizeScreen(size, 390);
  const styles = createStyles(colors, normalize);
  const router = useRouter();

  const { user: sessionUser, isLoading: isAuthLoading } = useAuth();

  // ✅ Datos reales por ID
  const userId = sessionUser?.id;
  const { data, isLoading: isProfileLoading } = useUserById(userId);

  // ✅ Normaliza ResponseStatusDTO<UserEntity> (soporta data.data o data)
  const profile: UserEntity | undefined =
    (data as any)?.data?.data ?? (data as any)?.data;

  // ✅ Mezcla sesión + backend (backend prioridad)
  const mergedUser: UserEntity | undefined = useMemo(():
    | UserEntity
    | undefined => {
    if (!sessionUser && !profile) return undefined;

    return {
      id: sessionUser?.id ?? profile?.id,
      name: profile?.name ?? sessionUser?.name,
      lastName: profile?.lastName ?? sessionUser?.lastName,
      email: profile?.email ?? sessionUser?.email,
      imageUrl: profile?.imageUrl ?? sessionUser?.imageUrl,
      dni: profile?.dni,
      phone: profile?.phone,
      address: profile?.address,
      registrationDate: profile?.registrationDate,
      enabled: profile?.enabled,
      emailVerified: profile?.emailVerified,
      roles: profile?.roles,
    } as UserEntity;
  }, [sessionUser, profile]);

  // ✅ Mutation real
  const { updateUserAsync, isUpdating } = useUserMutation();

  // ✅ Imagen (mantienes tu UI)
  // ✅ Imagen (mantienes tu UI)
  const [profileImage, setProfileImage] = useState<string>(FALLBACK_AVATAR);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ✅ Campos (antes estaban hardcodeados, ahora se llenan desde mergedUser)
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  // ✅ Cuando llega el perfil real, llenamos los estados (SIN cambiar UI)
  useEffect(() => {
    if (!mergedUser) return;

    setNombre(mergedUser.name ?? "");
    setApellido(mergedUser.lastName ?? "");
    setCorreo(mergedUser.email ?? "");
    setDni(mergedUser.dni ?? "");
    setTelefono(mergedUser.phone ?? "");
    setDireccion(mergedUser.address ?? "");

    setProfileImage(mergedUser.imageUrl ?? FALLBACK_AVATAR);
  }, [mergedUser]);

  // 🔹 Modal de edición
  const [editField, setEditField] = useState<
    "nombre" | "apellido" | "dni" | "telefono" | "direccion" | null
  >(null);

  const [tempValue, setTempValue] = useState("");

  const openEditModal = (
    field: "nombre" | "apellido" | "dni" | "telefono" | "direccion",
  ) => {
    setEditField(field);

    if (field === "nombre") setTempValue(nombre);
    if (field === "apellido") setTempValue(apellido);
    if (field === "dni") setTempValue(dni);
    if (field === "telefono") setTempValue(telefono);
    if (field === "direccion") setTempValue(direccion);
  };

  // ✅ Guarda REAL en backend (y luego refleja en UI)
  const saveEdit = async () => {
    if (!editField) return;
    if (!mergedUser?.id) {
      Alert.alert("Error", "No se pudo identificar al usuario logueado.");
      return;
    }

    try {
      const payload: UserUpdateRequestDTO = {};

      if (editField === "nombre") payload.name = tempValue;
      if (editField === "apellido") payload.lastName = tempValue;
      if (editField === "dni") payload.dni = tempValue;
      if (editField === "telefono") payload.phone = tempValue;
      if (editField === "direccion") payload.address = tempValue;

      await updateUserAsync({ id: mergedUser.id, data: payload });

      // refleja local (UI)
      if (editField === "nombre") setNombre(tempValue);
      if (editField === "apellido") setApellido(tempValue);
      if (editField === "dni") setDni(tempValue);
      if (editField === "telefono") setTelefono(tempValue);
      if (editField === "direccion") setDireccion(tempValue);

      setEditField(null);
    } catch (e) {
      // toast lo maneja el hook; aquí solo log por si acaso
      console.log(e);
    }
  };

  const handleImageUpload = async (base64: string) => {
    try {
      setShowCameraModal(false);
      setShowImageOptions(false);
      setIsUploadingImage(true);

      const response = await uploadImageToImgBB(base64, 600, async (url) => {
        if (mergedUser?.id) {
          await updateUserAsync({ id: mergedUser.id, data: { imageUrl: url } });
        }
      });
      const imageUrl = response.data.display_url;
      // setProfileImage(imageUrl); // El useEffect lo actualizará cuando mergingUser cambie o podemos hacerlo optimistamente

      Toast.show({
        type: 'success',
        text1: 'Foto guardada correctamente',
      });

    } catch (error) {
      console.log(mappingError(error));
      Toast.show({
        type: 'error',
        text1: 'Error al guardar la foto',
        text2: 'Intenta nuevamente',
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
      setShowCameraModal(true);
    } else {
      handlePickImage();
    }
  };

  // 🔹 InfoItem reutilizable (tu UI igual)
  const InfoItem = ({
    icon,
    label,
    value,
    editable,
    labelColor,
    valueColor,
  }: {
    icon: string;
    label: string;
    value: string;
    editable?: () => void;
    labelColor?: string;
    valueColor?: string;
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon as any} size={16} color={labelColor ?? "#666"} />
        <Text
          style={[styles.infoLabel, labelColor ? { color: labelColor } : null]}
        >
          {label}
        </Text>
        {editable && (
          <TouchableOpacity
            onPress={editable}
            style={[
              styles.editButton,
              { backgroundColor: colors.buttonSecondary },
            ]}
            disabled={isUpdating}
          >
            <Ionicons name="create-outline" size={18} color={colors.warning} />
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[styles.infoValue, valueColor ? { color: valueColor } : null]}
      >
        {value && String(value).trim() ? value : "—"}
      </Text>
    </View>
  );

  const Divider = () => <View style={styles.divider} />;

  // ✅ Loading real (no altera UI, solo agrega pantalla de carga)
  const loading = isAuthLoading || (userId ? isProfileLoading : false);

  if (loading) {
    return (
      <>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator />
            <Text style={{ color: colors.text, marginTop: 10 }}>
              Cargando perfil...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Encabezado */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Mi Perfil
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Cabecera de perfil */}
          <View
            style={[styles.profileHeader, { backgroundColor: colors.surface }]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: profileImage || FALLBACK_AVATAR }}
                style={styles.profileImage}
              />
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

            {/* ✅ Nombre/Email REAL */}
            <Text style={[styles.profileName, { color: colors.text }]}>
              {mergedUser?.name ?? "—"} {mergedUser?.lastName ?? ""}
            </Text>
            <Text style={[styles.profileSubtitle, { color: colors.info }]}>
              {mergedUser?.email ?? "—"}
            </Text>
          </View>

          {/* Información Personal */}
          <View style={styles.profileInfo}>
            <View style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={20} color={colors.info} />
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                Mi Información
              </Text>
            </View>

            <View
              style={[styles.infoCard, { backgroundColor: colors.surface }]}
            >
              <InfoItem
                icon="person-circle-outline"
                label="Nombre"
                value={nombre}
                editable={() => openEditModal("nombre")}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              <InfoItem
                icon="people-outline"
                label="Apellido"
                value={apellido}
                editable={() => openEditModal("apellido")}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              {/* correo: lo mostramos real, pero NO lo editamos aquí */}
              <InfoItem
                icon="mail-outline"
                label="Correo"
                value={correo}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              <InfoItem
                icon="card-outline"
                label="DNI"
                value={dni}
                editable={() => openEditModal("dni")}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              <InfoItem
                icon="call-outline"
                label="Teléfono"
                value={telefono}
                editable={() => openEditModal("telefono")}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              <InfoItem
                icon="home-outline"
                label="Dirección"
                value={direccion}
                editable={() => openEditModal("direccion")}
                labelColor={colors.info}
                valueColor={colors.text}
              />
              <Divider />

              <InfoItem
                icon="calendar-outline"
                label="Registrado el:"
                value={mergedUser?.registrationDate ?? "—"}
                labelColor={colors.info}
                valueColor={colors.text}
              />
            </View>
          </View>

          {/* Botón eliminar cuenta (de momento UI igual) */}
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal editar campo */}
        <Modal visible={!!editField} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Editar{" "}
                {
                  {
                    nombre: "Nombre",
                    apellido: "Apellido",
                    dni: "DNI",
                    telefono: "Teléfono",
                    direccion: "Dirección",
                  }[editField as string]
                }
              </Text>

              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={tempValue}
                onChangeText={setTempValue}
                placeholder="Escribe aquí..."
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setEditField(null)}
                  disabled={isUpdating}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={saveEdit}
                  disabled={isUpdating}
                >
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                    {isUpdating ? "Guardando..." : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal cambiar imagen */}
        <Modal visible={showImageOptions} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cambiar foto de perfil</Text>

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
          </View>
        </Modal>
      </SafeAreaView>

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <CameraCapture
          onPhotoTaken={handleImageUpload}
          onCancel={() => setShowCameraModal(false)}
          quality={0.7}
        />
      </Modal>

      <Toast />
    </>
  );
};

const createStyles = (
  colors: typeof Colors.light,
  normalize: (n: number) => number,
) =>
  StyleSheet.create({
    container: { flex: 1 },
    customHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      marginHorizontal: 10,
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 10,
      padding: 8,
      borderRadius: 50,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    profileHeader: {
      alignItems: "center",
      paddingVertical: 30,
      backgroundColor: "#D9D9D9",
      marginBottom: 20,
    },
    imageContainer: { position: "relative", marginBottom: 15 },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.primary,
    },
    cameraButton: {
      position: "absolute",
      bottom: 5,
      right: 5,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "#fff",
      elevation: 8,
    },
    profileName: {
      fontSize: normalize(22),
      fontWeight: "bold",
      marginBottom: 5,
    },
    profileSubtitle: {
      fontSize: normalize(15),
      fontWeight: "500",
    },
    profileInfo: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    sectionTitleText: {
      fontSize: normalize(18),
      fontWeight: "600",
      marginLeft: 8,
    },
    infoCard: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      elevation: 5,
    },
    infoItem: { paddingVertical: 8 },
    infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    infoLabel: {
      fontSize: 14,
      marginLeft: 8,
      fontWeight: "500",
      flex: 1,
    },
    editButton: { padding: 4, borderRadius: 10 },
    infoValue: { fontSize: 16, paddingLeft: 24 },
    divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 12,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: "#ff4757",
    },
    deleteButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 8,
    },
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
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modalBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      marginHorizontal: 5,
      alignItems: "center",
    },
    modalBtnText: {
      fontSize: 16,
      fontWeight: "500",
    },
  });

export default ProfileUser;
