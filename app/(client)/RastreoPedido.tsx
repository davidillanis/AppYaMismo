import { Colors } from "@/constants/Colors";
import { GOOGLE_API_KEY } from "@/src/infrastructure/configuration/auth/env";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import MapView, { LatLng, Marker, Polyline } from "react-native-maps";

const { width: screenWidth } = Dimensions.get("window");
const normalize = (size: number) => normalizeScreen(size, screenWidth);

const DESTINATION_COORDS: LatLng = {
  latitude: -13.651399,
  longitude: -73.365743,
};

const APP_MODE = {
  VIEW: "view",
  EDIT: "edit",
  DRAW: "draw",
} as const;
type AppMode = (typeof APP_MODE)[keyof typeof APP_MODE];

const loadingPoints = false;

/** --- Funciones para Google Directions --- */
const decodePolyline = (encoded: string): LatLng[] => {
  let index = 0, lat = 0, lng = 0;
  const coords: LatLng[] = [];
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
};

const fetchRoutePolyline = async (origin: LatLng, destination: LatLng, waypoints?: LatLng[]) => {
  if (!GOOGLE_API_KEY) {
    console.error("Google API Key no definida");
    return [];
  }

  const originStr = `${origin.latitude},${origin.longitude}`;
  const destStr = `${destination.latitude},${destination.longitude}`;
  const waypointsStr = waypoints?.length
    ? `&waypoints=${waypoints.map(p => `${p.latitude},${p.longitude}`).join("|")}`
    : "";

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}${waypointsStr}&key=${GOOGLE_API_KEY}&mode=driving`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes?.[0]?.overview_polyline?.points) {
      return decodePolyline(data.routes[0].overview_polyline.points);
    }
  } catch (err) {
    console.error("Error fetchRoutePolyline", err);
  }
  return [];
};

/** --- Componente MapScreen --- */
const MapScreen = () => {
  const colorScheme = useColorScheme() as keyof typeof Colors;
  const colors = Colors[colorScheme ?? "light"];
  const styles = createStyles(colors, normalize);

  const [mode, setMode] = useState<AppMode>(APP_MODE.VIEW);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [drawingCoordinates, setDrawingCoordinates] = useState<LatLng[]>([]);
  const [operatorLocations] = useState<Record<string, LatLng>>({});
  const [googleRouteCoordinates, setGoogleRouteCoordinates] = useState<LatLng[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const isEditMode = mode === APP_MODE.EDIT;
  const isDrawMode = mode === APP_MODE.DRAW;
  const [isViewNamePoint, setIsViewNamePoint] = useState(true);
  const [loadingReload, setLoadingReload] = useState(false);

  const selectedOperator = Object.values(operatorLocations)[0] || DESTINATION_COORDS;

  /** --- Obtener ruta Google cuando cambian los puntos --- */
  useEffect(() => {
    const getGoogleRoute = async () => {
      if (routeCoordinates.length < 2) return;

      const origin = routeCoordinates[0];
      const destination = routeCoordinates[routeCoordinates.length - 1];
      const waypoints = routeCoordinates.slice(1, -1);

      const decoded = await fetchRoutePolyline(origin, destination, waypoints);
      if (decoded?.length) {
        setGoogleRouteCoordinates(decoded);
        mapRef.current?.fitToCoordinates(decoded, {
          edgePadding: { top: normalize(120), bottom: normalize(200), left: normalize(50), right: normalize(50) },
          animated: true,
        });
      }
    };
    getGoogleRoute();
  }, [routeCoordinates]);


  /** --- Handlers --- */
  const handleMapPress = useCallback(
    (e: any) => {
      const coord = e.nativeEvent.coordinate;
      if (isDrawMode) setDrawingCoordinates(prev => [...prev, coord]);
      else if (isEditMode) setRouteCoordinates(prev => [...prev, coord]);
    },
    [isDrawMode, isEditMode]
  );

  const handleMarkerDragEnd = useCallback((idx: number, coord: LatLng) => {
    setRouteCoordinates(prev => {
      const updated = [...prev];
      updated[idx] = coord;
      return updated;
    });
  }, []);


  const toggleDrawMode = useCallback(() => {
    setMode(isDrawMode ? APP_MODE.VIEW : APP_MODE.DRAW);
    setDrawingCoordinates([]);
  }, [isDrawMode]);

  const applyDrawnRoute = useCallback(() => {
    if (drawingCoordinates.length < 2) return;
    const newRoute = [selectedOperator, ...drawingCoordinates];
    setRouteCoordinates(newRoute);
    setMode(APP_MODE.EDIT);
    setDrawingCoordinates([]);
  }, [drawingCoordinates, selectedOperator]);

  const clearAllPoints = useCallback(() => {
    Alert.alert("Limpiar puntos", "¿Deseas eliminar todos los puntos?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Limpiar", style: "destructive", onPress: () => { setRouteCoordinates([]); setDrawingCoordinates([]); } },
    ]);
  }, []);



  if (loadingPoints) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, fontFamily: colors.fontSecondary }]}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={locationStyles.map}
        region={{
          latitude: selectedOperator.latitude,
          longitude: selectedOperator.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        {/* Ruta con calles Google */}
        {googleRouteCoordinates.length > 0 ? (
          <Polyline coordinates={googleRouteCoordinates} strokeWidth={5} strokeColor={colors.primary} />
        ) : (
          routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor={colors.warning} lineDashPattern={[10, 5]} />
        )}

        {/* Editable Markers */}
        {isEditMode && routeCoordinates.map((coord, idx) => (
          <Marker key={`edit-${idx}`} coordinate={coord} draggable onDragEnd={e => handleMarkerDragEnd(idx, e.nativeEvent.coordinate)}>
            <View style={[locationStyles.customMarker, { backgroundColor: colors.primary }]}>
              <Text style={[locationStyles.markerText, { color: colors.textInverse }]}>{idx + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* Route Markers */}
        {!isEditMode && isViewNamePoint && routeCoordinates.map((coord, idx) => (
          <Marker key={`route-${idx}`} coordinate={coord} title={`Punto ${idx + 1}`}>
            <View style={[locationStyles.customMarker, { backgroundColor: colors.success }]}>
              <Text style={[locationStyles.markerText, { color: colors.textInverse }]}>{idx + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* Drawing Polyline */}
        {drawingCoordinates.length > 1 && <Polyline coordinates={drawingCoordinates} strokeWidth={4} strokeColor={colors.tertiary} />}
        {drawingCoordinates.map((coord, idx) => <Marker key={`draw-${idx}`} coordinate={coord} pinColor={colors.tertiary} />)}

        {/* Operators */}
        {Object.entries(operatorLocations).map(([id, loc]) => (
          <Marker key={id} coordinate={loc} title={`Operario: ${id}`} pinColor={colors.secondary} />
        ))}

        {/* Destination */}
        <Marker coordinate={DESTINATION_COORDS} title="Destino: Talavera" pinColor={colors.success} />
      </MapView>

      {/* Info Panel */}
      <View style={[locationStyles.infoPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={locationStyles.infoPanelHeader}>
          <MaterialIcons name="edit-location" size={normalize(24)} color={colors.primary} />
          <Text style={[locationStyles.infoPanelTitle, { color: colors.text, fontFamily: colors.fontPrimary }]}>Asignación de Ruta</Text>
        </View>
        {(isEditMode || isDrawMode) && (
          <Text style={[locationStyles.instructionText, { color: colors.textTertiary, fontFamily: colors.fontSecondary }]}>
            {isEditMode ? "Toca para agregar o arrastra puntos" : "Toca para dibujar una ruta"}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={locationStyles.buttonContainer}>
        <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: isEditMode ? colors.success : colors.primary }]} onPress={() => { }}>
          <MaterialIcons name={isEditMode ? "save" : "edit"} size={normalize(24)} color={colors.textInverse} />
        </TouchableOpacity>
        <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: isDrawMode ? colors.warning : colors.surface }]} onPress={toggleDrawMode}>
          <MaterialIcons name="gesture" size={normalize(24)} color={isDrawMode ? colors.textInverse : colors.icon} />
        </TouchableOpacity>
        {isDrawMode && drawingCoordinates.length > 1 && (
          <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: colors.success }]} onPress={applyDrawnRoute}>
            <MaterialIcons name="check" size={normalize(24)} color={colors.textInverse} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: colors.warning }]} onPress={clearAllPoints}>
          <MaterialIcons name="clear" size={normalize(24)} color={colors.textInverse} />
        </TouchableOpacity>
        <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: isViewNamePoint ? colors.info : colors.icon }]} onPress={() => setIsViewNamePoint(prev => !prev)}>
          <MaterialIcons name={isViewNamePoint ? "visibility" : "visibility-off"} size={normalize(24)} color={colors.textInverse} />
        </TouchableOpacity>
        <TouchableOpacity style={[locationStyles.actionButton, { backgroundColor: colors.success }]} onPress={() => { }} disabled={loadingReload}>
          {loadingReload ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <MaterialIcons name="replay" size={normalize(24)} color={colors.textInverse} />
          )}
        </TouchableOpacity>
      </View>

      {/* Points List */}
      {routeCoordinates.length > 0 && (
        <ScrollView style={[locationStyles.pointsList, { backgroundColor: colors.card, borderColor: colors.border }]} showsVerticalScrollIndicator={false}>
          {routeCoordinates.map((point, index) => (
            <View key={index} style={[locationStyles.pointItem, { borderBottomColor: colors.borderVariant }]}>
              <View style={locationStyles.pointInfo}>
                <Text style={[locationStyles.pointOrder, { color: colors.primary, fontFamily: colors.fontPrimary }]}>#{index + 1}</Text>
                <View>
                  <Text style={[locationStyles.pointCoords, { color: colors.text, fontFamily: colors.fontSecondary }]}>Lat: {point.latitude.toFixed(6)}</Text>
                  <Text style={[locationStyles.pointCoords, { color: colors.text, fontFamily: colors.fontSecondary }]}>Lng: {point.longitude.toFixed(6)}</Text>
                </View>
              </View>

              {isEditMode && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Eliminar punto", "¿Confirmas la eliminación?", [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Eliminar", style: "destructive", onPress: () => setRouteCoordinates(prev => prev.filter((_, i) => i !== index)) },
                    ]);
                  }}
                  style={[locationStyles.removeButton, { backgroundColor: colors.error }]}
                >
                  <MaterialIcons name="remove" size={normalize(16)} color={colors.textInverse} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/**savingPoints */}
      {false && (
        <View style={locationStyles.loadingOverlay}>
          <View style={[locationStyles.loadingContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text, fontFamily: colors.fontSecondary }]}>Guardando...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MapScreen;

/** --- Styles --- */
const locationStyles = StyleSheet.create({
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: normalize(10), fontSize: normalize(14), textAlign: "center" },
  infoPanel: { position: "absolute", top: normalize(50), left: normalize(16), right: normalize(16), padding: normalize(12), borderRadius: normalize(12), borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  infoPanelHeader: { flexDirection: "row", alignItems: "center", marginBottom: normalize(6) },
  infoPanelTitle: { fontSize: normalize(16), fontWeight: "600", marginLeft: normalize(6) },
  infoPanelSubtitle: { fontSize: normalize(12), marginBottom: normalize(4) },
  instructionText: { fontSize: normalize(11), fontStyle: "italic" },
  buttonContainer: { position: "absolute", right: normalize(16), top: normalize(140), flexDirection: "column", gap: normalize(10) },
  actionButton: { width: normalize(48), height: normalize(48), borderRadius: normalize(24), justifyContent: "center", alignItems: "center", borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: normalize(10) },
  customMarker: { width: normalize(28), height: normalize(28), borderRadius: normalize(14), justifyContent: "center", alignItems: "center", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3 },
  markerText: { fontSize: normalize(12), fontWeight: "600" },
  pointsList: { position: "absolute", bottom: normalize(100), left: normalize(16), right: normalize(16), maxHeight: normalize(180), borderRadius: normalize(12), borderWidth: 1, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, padding: normalize(12) },
  pointItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: normalize(10), borderBottomWidth: 1 },
  pointInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  pointOrder: { fontSize: normalize(14), fontWeight: "600", width: normalize(40) },
  pointCoords: { fontSize: normalize(11), lineHeight: normalize(14) },
  removeButton: { width: normalize(24), height: normalize(24), borderRadius: normalize(12), justifyContent: "center", alignItems: "center", elevation: 2 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center", zIndex: 2000 },
  loadingContent: { padding: normalize(20), borderRadius: normalize(12), alignItems: "center", borderWidth: 1, elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
});