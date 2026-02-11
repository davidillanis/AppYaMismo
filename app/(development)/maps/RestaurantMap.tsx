import { Colors } from "@/constants/Colors";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useRestaurantById } from "@/src/presentation/hooks/useRestaurantById";
import { useUpdateRestaurant } from "@/src/presentation/hooks/useRestaurantMutation";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import MapView, { LatLng, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");
const normalize = (size: number) => normalizeScreen(size, screenWidth);

const DEFAULT_COORDS: LatLng = {
  latitude: -13.5319,
  longitude: -71.9675,
};

const Location = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Capturamos el ID. Si no hay, estamos en modo "Crear"
  const restaurantId = params?.id || params?.restaurantId;

  const colorScheme = useColorScheme() as keyof typeof Colors;
  const colors = Colors[colorScheme ?? "light"];
  const styles = createStyles(colors, normalize);
  const mapRef = useRef<MapView | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Cargamos datos solo si hay ID (Edición)
  const { data: restaurantData } = useRestaurantById(
    restaurantId ? Number(restaurantId) : 0,
  );
  const updateRestaurant = useUpdateRestaurant();

  useEffect(() => {
    initializeLocation();
  }, [restaurantData]);

  const initializeLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === "granted");

      // Prioridad: 1. DB (Editar) | 2. Params de URL | 3. GPS | 4. Default
      const initialLat = restaurantData?.latitude || params.latitude;
      const initialLng = restaurantData?.longitude || params.longitude;

      let currentPos: LatLng = DEFAULT_COORDS;

      if (initialLat && initialLng) {
        currentPos = {
          latitude: Number(initialLat),
          longitude: Number(initialLng),
        };
      } else if (status === "granted") {
        const location = await ExpoLocation.getCurrentPositionAsync({});
        currentPos = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      setSelectedLocation(currentPos);
      mapRef.current?.animateToRegion(
        {
          ...currentPos,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } catch (error) {
      setSelectedLocation(DEFAULT_COORDS);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const centerOnUserLocation = useCallback(async () => {
    if (!hasLocationPermission) return;
    setIsLocating(true);
    try {
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setSelectedLocation(userRegion);
      mapRef.current?.animateToRegion(
        { ...userRegion, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000,
      );
    } finally {
      setIsLocating(false);
    }
  }, [hasLocationPermission]);

  const handleMapPress = useCallback((event: any) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  }, []);

  const handleMarkerDragEnd = useCallback((event: any) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  }, []);

  const handleSaveLocation = useCallback(async () => {
    if (!selectedLocation) return;

    if (!restaurantId) {
      // Caso Creación: Enviamos params para que el form los capture
      router.replace({
        pathname: "/restaurants/create",
        params: {
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
        },
      });
      return;
    }

    try {
      // 1. Esperamos a que la base de datos se actualice realmente
      await updateRestaurant.mutateAsync({
        id: Number(restaurantId),
        payload: {
          ...restaurantData,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          type:
            restaurantData?.restaurantTypes?.map((t: any) => t.name || t) || [],
        },
      });

      Toast.show({ type: "success", text1: "Ubicación actualizada" });

      // 2. IMPORTANTE: No uses back(). Usa replace con el ID y las coordenadas.
      // Esto "despierta" a la pantalla de edición.
      router.replace({
        pathname: "/restaurants/edit", // Sin los paréntesis
        params: {
          id: restaurantId, // O el nombre del parámetro que use tu pantalla de edición
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
        },
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error al guardar" });
    }
  }, [selectedLocation, restaurantId, restaurantData]);

  if (isLoadingLocation) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MapView
          ref={mapRef}
          style={locationStyles.map}
          initialRegion={{
            latitude: selectedLocation?.latitude || DEFAULT_COORDS.latitude,
            longitude: selectedLocation?.longitude || DEFAULT_COORDS.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={handleMarkerDragEnd}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={locationStyles.customMarker}>
                <View
                  style={[
                    locationStyles.markerCircle,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <MaterialIcons
                    name="restaurant"
                    size={normalize(20)}
                    color={colors.textInverse}
                  />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <View
          style={[
            locationStyles.infoPanel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {selectedLocation && (
            <View style={locationStyles.coordinatesContainer}>
              <View style={locationStyles.coordinateRow}>
                <MaterialIcons
                  name="place"
                  size={normalize(18)}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    locationStyles.coordinateText,
                    { color: colors.text },
                  ]}
                >
                  Lat: {selectedLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={locationStyles.coordinateRow}>
                <MaterialIcons
                  name="place"
                  size={normalize(18)}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    locationStyles.coordinateText,
                    { color: colors.text },
                  ]}
                >
                  Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              locationStyles.actionButtonSave,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleSaveLocation}
            disabled={!selectedLocation || updateRestaurant.isPending}
          >
            {updateRestaurant.isPending ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <MaterialIcons
                  name="save"
                  size={normalize(20)}
                  color={colors.textInverse}
                />
                <Text
                  style={[
                    locationStyles.saveButtonText,
                    { color: colors.textInverse },
                  ]}
                >
                  Guardar Ubicación
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={locationStyles.buttonContainer}>
          {hasLocationPermission && (
            <TouchableOpacity
              style={[
                locationStyles.actionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={centerOnUserLocation}
              disabled={isLocating}
            >
              <MaterialIcons
                name={isLocating ? "gps-not-fixed" : "my-location"}
                size={normalize(24)}
                color={colors.textInverse}
              />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            locationStyles.instructionsPanel,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <MaterialIcons
            name="info-outline"
            size={normalize(18)}
            color={colors.primary}
          />
          <Text
            style={[
              locationStyles.instructionsText,
              { color: colors.textSecondary },
            ]}
          >
            Toca el mapa o arrastra el marcador para seleccionar la ubicación
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Location;

const locationStyles = StyleSheet.create({
  map: { flex: 1 },
  infoPanel: {
    position: "absolute",
    bottom: normalize(32),
    left: normalize(16),
    right: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(12),
    borderWidth: 1,
    elevation: 4,
    gap: normalize(12),
  },
  coordinatesContainer: { gap: normalize(8) },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
  },
  coordinateText: { fontSize: normalize(13), fontWeight: "500" },
  instructionsPanel: {
    position: "absolute",
    top: normalize(16),
    left: normalize(16),
    right: normalize(16),
    padding: normalize(12),
    borderRadius: normalize(8),
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: normalize(8),
    elevation: 3,
  },
  instructionsText: { flex: 1, fontSize: normalize(12) },
  buttonContainer: {
    position: "absolute",
    right: normalize(16),
    top: normalize(90),
    flexDirection: "column",
    gap: normalize(10),
  },
  actionButton: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    elevation: 4,
  },
  actionButtonSave: {
    flexDirection: "row",
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14),
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    gap: normalize(8),
  },
  saveButtonText: { fontSize: normalize(16), fontWeight: "600" },
  customMarker: { alignItems: "center", justifyContent: "center" },
  markerCircle: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
  },
});