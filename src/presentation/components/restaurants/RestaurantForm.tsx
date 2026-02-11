import { Colors } from "@/constants/Colors";
import { RestaurantCreateRequestDTO } from "@/src/domain/entities/RestaurantEntity";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  const RED_COLOR = "#D32F2F";

  useEffect(() => {
    if (!initialValues) return;
    if (!name) setName(initialValues.name ?? "");
    if (!address) setAddress(initialValues.address ?? "");
    if (!urlImagen) setUrlImagen(initialValues.urlImagen ?? "");
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
    if (!name || !address || !urlImagen) {
      alert("Completa los campos obligatorios.");
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
      userId: 1,
    };
    onSubmit(payload);
  };

  return (
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
        {urlImagen ? (
          <Image source={{ uri: urlImagen }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#bbb" />
            <Text style={{ color: "#999", marginTop: 5 }}>URL de Imagen</Text>
          </View>
        )}

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

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>URL Imagen *</Text>
        <TextInput
          style={styles.input}
          value={urlImagen}
          onChangeText={setUrlImagen}
          placeholder="https://..."
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

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
    </ScrollView>
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
});