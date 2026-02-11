import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { RestaurantCreateRequestDTO } from "@/src/domain/entities/RestaurantEntity";
import { RestaurantForm } from "@/src/presentation/components/restaurants/RestaurantForm";
import { useCreateRestaurant } from "@/src/presentation/hooks/useRestaurantMutation";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateRestaurantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const mutation = useCreateRestaurant();

  // 1. Extraemos lat y lng de los params de la URL
  const lat = params.latitude ? Number(params.latitude) : undefined;
  const lng = params.longitude ? Number(params.longitude) : undefined;

  // 2. Memorizamos los valores iniciales de ubicación
  const locationValues = useMemo(
    () => ({
      latitude: lat,
      longitude: lng,
    }),
    [lat, lng],
  );

  const handleCreate = (values: RestaurantCreateRequestDTO) => {
    console.log("📤 Enviando Payload:", JSON.stringify(values, null, 2));

    mutation.mutate(
      { payload: values },
      {
        onSuccess: () => {
          Alert.alert("¡Éxito!", "Restaurante creado correctamente", [
            {
              text: "OK",
              onPress: () => {
                // 1. Navegamos a la pantalla de gestión/lista
                // Ajusta la ruta a tu carpeta real, por ejemplo: "/(tabs)/restaurants" o "/management/list"
                router.replace(
                  "/restaurants", // Ajusta esta ruta según tu estructura de carpetas
                );
              },
            },
          ]);
        },
        onError: (error: any) => {
          console.log(
            "❌ ERROR 400 - DETALLE DEL BACKEND:",
            JSON.stringify(error.response?.data, null, 2),
          );
          const serverMessage =
            error.response?.data?.errors?.[0] ||
            error.response?.data?.message ||
            "Error en los datos";
          Alert.alert("Error del servidor", serverMessage);
        },
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Nuevo Restaurante
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <RestaurantForm
        colors={colors}
        initialValues={{
          latitude: locationValues.latitude,
          longitude: locationValues.longitude,
          enabled: true,
        }}
        onSubmit={handleCreate}
        isSubmitting={mutation.isPending}
        submitLabel="Crear Restaurante"
        showMapButton={true}
        onMapPress={() => {
          // Usamos la ruta completa que tenías
          router.push("/(development)/maps/RestaurantMap");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
});