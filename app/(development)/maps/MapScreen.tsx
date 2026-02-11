import { Colors } from "@/constants/Colors";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import React, { useCallback, useRef, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import MapView, { LatLng, Marker, Region } from "react-native-maps";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");
const normalize = (size: number) => normalizeScreen(size, screenWidth);

const DESTINATION_COORDS: LatLng = {
    latitude: -13.6556,
    longitude: -73.3872,
};

// Tipos
type PointType = "Customer" | "Restaurant";

interface MapPoint {
    latitude: number;
    longitude: number;
    name: string;
    type: PointType;
}

// Datos de ejemplo (reemplazar con datos dinámicos de tu API)
const SAMPLE_POINTS: MapPoint[] = [
    {
        latitude: -13.6556,
        longitude: -73.3872,
        name: "Restaurant Central",
        type: "Restaurant"
    },
    {
        latitude: -13.6600,
        longitude: -73.3900,
        name: "Cliente Juan Pérez",
        type: "Customer"
    },
    {
        latitude: -13.6520,
        longitude: -73.3850,
        name: "Cliente María López",
        type: "Customer"
    },
    {
        latitude: -13.6580,
        longitude: -73.3920,
        name: "Restaurant El Sabor",
        type: "Restaurant"
    },
];

const Location = () => {
    const colorScheme = useColorScheme() as keyof typeof Colors;
    const colors = Colors[colorScheme ?? "light"];
    const styles = createStyles(colors, normalize);

    const mapRef = useRef<MapView | null>(null);
    const selectedOperator = DESTINATION_COORDS;
    const [isLocating, setIsLocating] = useState(false);
    const [points, setPoints] = useState<MapPoint[]>(SAMPLE_POINTS);

    const centerOnUserLocation = useCallback(async () => {
        setIsLocating(true);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Toast.show({
                    type: 'warning',
                    text1: 'Alerta',
                    text2: "Se necesita acceso a la ubicación para centrar el mapa en tu posición actual.",
                    visibilityTime: 3000,
                    topOffset: 50,
                });
                setIsLocating(false);
                return;
            }

            const location = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            const userRegion: Region = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            mapRef.current?.animateToRegion(userRegion, 1000);
        } catch (error) {
            console.error("Error obteniendo ubicación:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "No se pudo obtener tu ubicación actual. Verifica que el GPS esté activado.",
                visibilityTime: 3000,
                topOffset: 50,
            });
        } finally {
            setIsLocating(false);
        }
    }, []);

    // Función para obtener el color del marcador según el tipo
    const getMarkerColor = (type: PointType): string => {
        return type === "Restaurant" ? colors.primary : colors.warning;
    };

    // Función para obtener el icono del marcador según el tipo
    const getMarkerIcon = (type: PointType): keyof typeof MaterialIcons.glyphMap => {
        return type === "Restaurant" ? "restaurant" : "person-pin-circle";
    };

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
                showsUserLocation={true}
            >
                {/* Renderizar todos los puntos dinámicamente */}
                {points.map((point, index) => (
                    <Marker
                        key={`${point.type}-${index}`}
                        coordinate={{
                            latitude: point.latitude,
                            longitude: point.longitude,
                        }}
                        title={point.name}
                        description={point.type === "Restaurant" ? "Restaurante" : "Cliente"}
                        anchor={{ x: 0.5, y: 0.5 }}
                        centerOffset={{ x: 0, y: 0 }}
                    >
                        <View style={locationStyles.customMarker}>
                            <View
                                style={[
                                    locationStyles.markerCircle,
                                    {
                                        backgroundColor: getMarkerColor(point.type),
                                    },
                                ]}
                            >
                                <MaterialIcons
                                    name={getMarkerIcon(point.type)}
                                    size={normalize(20)}
                                    color={colors.textInverse}
                                />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            <View style={[locationStyles.infoPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={locationStyles.infoPanelHeader}>
                    <MaterialIcons name="edit-location" size={normalize(24)} color={colors.primary} />
                    <Text style={[locationStyles.infoPanelTitle, { color: colors.text, fontFamily: colors.fontPrimary }]}>
                        Asignación de Ruta
                    </Text>
                </View>
                <View style={locationStyles.legendContainer}>
                    <View style={locationStyles.legendItem}>
                        <View style={[locationStyles.legendDot, { backgroundColor: colors.primary }]} />
                        <Text style={[locationStyles.legendText, { color: colors.textSecondary }]}>
                            Restaurantes ({points.filter(p => p.type === "Restaurant").length})
                        </Text>
                    </View>
                    <View style={locationStyles.legendItem}>
                        <View style={[locationStyles.legendDot, { backgroundColor: colors.warning }]} />
                        <Text style={[locationStyles.legendText, { color: colors.textSecondary }]}>
                            Clientes ({points.filter(p => p.type === "Customer").length})
                        </Text>
                    </View>
                </View>
            </View>

            <View style={locationStyles.buttonContainer}>
                <TouchableOpacity
                    style={[locationStyles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={centerOnUserLocation}
                    disabled={isLocating}
                >
                    <MaterialIcons name={isLocating ? "gps-not-fixed" : "my-location"} size={normalize(24)} color={colors.textInverse} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Location;

const locationStyles = StyleSheet.create({
    map: { flex: 1 },
    infoPanel: {
        position: "absolute",
        top: normalize(50),
        left: normalize(16),
        right: normalize(16),
        padding: normalize(12),
        borderRadius: normalize(12),
        borderWidth: 1,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoPanelHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: normalize(6),
    },
    infoPanelTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        marginLeft: normalize(6),
    },
    legendContainer: {
        flexDirection: "row",
        gap: normalize(16),
        marginTop: normalize(8),
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    legendDot: {
        width: normalize(12),
        height: normalize(12),
        borderRadius: normalize(6),
    },
    legendText: {
        fontSize: normalize(12),
        fontWeight: "500",
    },
    buttonContainer: {
        position: "absolute",
        right: normalize(16),
        top: normalize(140),
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
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: normalize(10),
    },
    customMarker: {
        alignItems: "center",
        justifyContent: "center",
    },
    markerCircle: {
        width: normalize(26),
        height: normalize(26),
        borderRadius: normalize(13),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});