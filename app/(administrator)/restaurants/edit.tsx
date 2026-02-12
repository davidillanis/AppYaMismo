import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { RestaurantForm } from "@/src/presentation/components/restaurants/RestaurantForm";
import { useRestaurantById } from "@/src/presentation/hooks/useRestaurantById";
import { useUpdateRestaurant } from "@/src/presentation/hooks/useRestaurantMutation";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditRestaurantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = Number(params.id);

  const pickedLat =
    params.latitude !== undefined ? Number(params.latitude) : null;
  const pickedLng =
    params.longitude !== undefined ? Number(params.longitude) : null;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    data: restaurantData,
    isLoading,
    isPending,
    isError,
    refetch,
  } = useRestaurantById(restaurantId);
  const mutation = useUpdateRestaurant();

  const handleOpenMap = () => {
    const lat = pickedLat ?? restaurantData?.latitude ?? null;
    const lng = pickedLng ?? restaurantData?.longitude ?? null;

    router.push({
      pathname: "/(development)/maps/RestaurantMap",
      params: {
        id: restaurantId.toString(),
        ...(lat != null && lng != null
          ? { initialLat: lat.toString(), initialLng: lng.toString() }
          : {}),
      },
    });
  };

  const handleUpdate = (values: any) => {
    // Usamos any aquí para evitar conflictos de DTOs en el form
    mutation.mutate(
      { id: restaurantId, payload: values },
      {
        onSuccess: () => {
          // 🔹 REDIRECCIÓN AL INDEX DE RESTAURANTES
          // Según tu estructura de archivos: app/(administrator)/restaurants/index.tsx
          router.replace("/restaurants");
        },
        onError: () => alert("Error al actualizar"),
      },
    );
  };

  const initialValues = restaurantData
    ? {
      name: restaurantData.name,
      address: restaurantData.address,
      urlImagen: restaurantData.urlImagen,
      enabled: restaurantData.enabled,
      latitude: pickedLat ?? restaurantData.latitude ?? null,
      longitude: pickedLng ?? restaurantData.longitude ?? null,
      type: restaurantData.restaurantTypes?.map((t) => t.name) || [],
    }
    : undefined;

  if (!restaurantId) {
    return (
      <View style={styles.center}>
        <Text>Error: ID inválido</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Editar Restaurante
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading || isPending ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Cargando datos...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text style={{ color: "red", marginTop: 10 }}>Error de conexión</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <Text style={{ color: "#fff" }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : restaurantData ? (
        <>
          <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  borderColor:
                    pickedLat != null || restaurantData.latitude != null
                      ? "#4CAF50"
                      : colors.primary,
                },
              ]}
              onPress={handleOpenMap}
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={20}
                color={
                  pickedLat != null || restaurantData.latitude != null
                    ? "#4CAF50"
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.locationButtonText,
                  {
                    color:
                      pickedLat != null || restaurantData.latitude != null
                        ? "#4CAF50"
                        : colors.primary,
                  },
                ]}
              >
                {pickedLat != null
                  ? "Ubicación actualizada ✅"
                  : restaurantData.latitude != null
                    ? "Editar ubicación en el mapa"
                    : "Seleccionar ubicación en Google Maps"}
              </Text>
            </TouchableOpacity>
          </View>

          <RestaurantForm
            colors={colors}
            initialValues={initialValues}
            onSubmit={handleUpdate}
            isSubmitting={mutation.isPending}
            submitLabel="Finalizar Edición" // 👈 Texto actualizado
            showMapButton={false}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: 10,
  },
  locationButtonText: { marginLeft: 8, fontWeight: "600" },
  coordsText: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
});