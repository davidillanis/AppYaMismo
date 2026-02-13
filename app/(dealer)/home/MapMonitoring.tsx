import { Colors } from "@/constants/Colors";
import { OrderMapPoint } from "@/src/domain/types/MapType";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as ExpoLocation from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import Toast from "react-native-toast-message";

const { width: screenWidth } = Dimensions.get("window");
const normalize = (size: number) => normalizeScreen(size, screenWidth);

// --- Constants ---
const MARKER_SIZE = normalize(30);
const MARKER_RADIUS = normalize(15);
const ICON_SIZE = normalize(20);

// --- Types ---
interface MarkerData {
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
    type: "Restaurant" | "Customer";
    orderId: number;
    restaurantIndex?: number;
}

// --- Utils ---
const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

// --- Sub-Components (Memoized for Performance) ---

// 1. Optimized Marker Component
const MapMarker = React.memo(({
    marker,
    colors
}: {
    marker: MarkerData;
    colors: any;
}) => {
    // Optimization: Stop tracking view changes after initial render to safe CPU
    // This is critical for maps with many custom markers
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
        if (Platform.OS === 'android') {
            // Small delay to ensure render is complete before freezing
            const timeout = setTimeout(() => {
                setTracksViewChanges(false);
            }, 100);
            return () => clearTimeout(timeout);
        } else {
            setTracksViewChanges(false);
        }
    }, []);

    const markerColor = marker.type === "Restaurant" ? colors.primary : colors.warning;
    const markerIcon = marker.type === "Restaurant" ? "restaurant" : "person-pin-circle";

    return (
        <Marker
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            anchor={{ x: 0.5, y: 0.5 }}
            centerOffset={{ x: 0, y: 0 }}
            tracksViewChanges={tracksViewChanges}
        >
            <View style={locationStyles.customMarker}>
                <View
                    style={[
                        locationStyles.markerCircle,
                        { backgroundColor: markerColor },
                    ]}
                >
                    <MaterialIcons
                        name={markerIcon}
                        size={ICON_SIZE}
                        color={colors.textInverse}
                    />
                </View>
            </View>
        </Marker>
    );
});

// 2. Filter Chip Component
const FilterChip = React.memo(({
    id,
    label,
    isSelected,
    onPress,
    colors
}: {
    id: number | null;
    label: string;
    isSelected: boolean;
    onPress: (id: number | null) => void;
    colors: any;
}) => {
    return (
        <TouchableOpacity
            style={[
                locationStyles.filterChip,
                { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant }
            ]}
            onPress={() => onPress(id)}
            accessibilityLabel={id === null ? "Mostrar todas las órdenes" : `Filtrar por orden ${id}`}
        >
            <Text style={[
                locationStyles.filterText,
                { color: isSelected ? colors.textInverse : colors.text }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
});

// 3. Product Item Component
const ProductItem = React.memo(({ product, colors }: { product: any, colors: any }) => (
    <View style={locationStyles.productItem}>
        <View style={locationStyles.productLeft}>
            <View style={[locationStyles.quantityBadge, { backgroundColor: colors.primary }]}>
                <Text style={[locationStyles.quantityText, { color: colors.textInverse }]}>
                    {product.quantity}x
                </Text>
            </View>
            <Text style={[locationStyles.productName, { color: colors.text }]} numberOfLines={1}>
                {product.name}
            </Text>
        </View>
        <Text style={[locationStyles.productPrice, { color: colors.textSecondary }]}>
            S/ {(product.price * product.quantity).toFixed(2)}
        </Text>
    </View>
));

// 4. Restaurant Section Component
const RestaurantSection = React.memo(({ rest, colors }: { rest: any, colors: any }) => (
    <View style={locationStyles.restaurantSection}>
        <View style={locationStyles.restaurantHeader}>
            <MaterialIcons name="restaurant" size={normalize(14)} color={colors.primary} />
            <Text style={[locationStyles.restaurantName, { color: colors.text }]} numberOfLines={1}>
                {rest.name}
            </Text>
        </View>

        {rest.products.map((product: any, prodIndex: number) => (
            <ProductItem
                key={`prod-${prodIndex}`}
                product={product}
                colors={colors}
            />
        ))}
    </View>
));

// --- Main Component ---

const MapMonitoring = () => {
    // 1. Hooks & Configuration
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme() as keyof typeof Colors;
    const colors = Colors[colorScheme ?? "light"];
    const styles = createStyles(colors, normalize);
    const mapRef = useRef<MapView | null>(null);
    const [showOrderSummary, setShowOrderSummary] = useState(false);

    // 2. State & Data Parsing
    const parsedOrders = useMemo(() => {
        try {
            return params.orderData
                ? (JSON.parse(params.orderData as string) as OrderMapPoint[])
                : [];
        } catch (error) {
            console.error("Error parsing orderData:", error);
            return [];
        }
    }, [params.orderData]);

    const [orders] = useState<OrderMapPoint[]>(parsedOrders);
    const [filterId, setFilterId] = useState<number | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // 3. Derived Computations

    // Active markers calculation
    const visibleMarkers = useMemo(() => {
        const activeOrders = filterId !== null
            ? orders.filter(o => o.id === filterId)
            : orders;

        const markers: MarkerData[] = [];

        activeOrders.forEach(order => {
            // Add Restaurant Markers
            order.restaurant.forEach((rest, index) => {
                if (isValidCoordinate(rest.latitude, rest.longitude)) {
                    markers.push({
                        id: `rest-${order.id}-${index}`,
                        coordinate: {
                            latitude: rest.latitude,
                            longitude: rest.longitude
                        },
                        title: rest.name,
                        description: `Restaurante ${index + 1} - Orden #${order.id}`,
                        type: "Restaurant",
                        orderId: order.id,
                        restaurantIndex: index
                    });
                }
            });

            // Add Customer Marker
            if (isValidCoordinate(order.customer.latitude, order.customer.longitude)) {
                markers.push({
                    id: `cust-${order.id}`,
                    coordinate: {
                        latitude: order.customer.latitude,
                        longitude: order.customer.longitude
                    },
                    title: order.customer.name,
                    description: `Cliente - Orden #${order.id}`,
                    type: "Customer",
                    orderId: order.id
                });
            }
        });

        return markers;
    }, [orders, filterId]);

    // Selected order details
    const selectedOrder = useMemo(() => {
        if (filterId === null) return null;
        return orders.find(o => o.id === filterId) || null;
    }, [filterId, orders]);

    // Counts for legend
    const { restaurantCount, customerCount } = useMemo(() => ({
        restaurantCount: visibleMarkers.filter(m => m.type === "Restaurant").length,
        customerCount: visibleMarkers.filter(m => m.type === "Customer").length,
    }), [visibleMarkers]);

    // Order total calculation
    const orderTotal = useMemo(() => {
        if (!selectedOrder) return 0;
        return selectedOrder.restaurant.reduce((acc, rest) =>
            acc + rest.products.reduce((sum, p) => sum + (p.price * p.quantity), 0), 0
        );
    }, [selectedOrder]);

    // Initial Map Region
    const initialRegion = useMemo((): Region => {
        if (visibleMarkers.length === 0) {
            return {
                latitude: -13.6556,
                longitude: -73.3872,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        const lats = visibleMarkers.map(m => m.coordinate.latitude);
        const lngs = visibleMarkers.map(m => m.coordinate.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const latDelta = (maxLat - minLat) * 1.5 || 0.05;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.05;

        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latDelta, 0.01),
            longitudeDelta: Math.max(lngDelta, 0.01),
        };
    }, [visibleMarkers]);

    // 4. Effects
    useEffect(() => {
        if (mapRef.current && visibleMarkers.length > 0) {
            // Animate only if region changes meaningfully, but using region prop handles this often.
            // Explicit animation is safer for user feedback on filter change.
            mapRef.current.animateToRegion(initialRegion, 800);
        }
    }, [filterId, initialRegion]); // Depends on filterId changing the region

    // 5. User Actions
    const handleFilterPress = useCallback((id: number | null) => {
        setFilterId(prev => (prev === id ? null : id));
    }, []);

    const centerOnUserLocation = useCallback(async () => {
        setIsLocating(true);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    type: 'warning',
                    text1: 'Alerta',
                    text2: "Se necesita acceso a la ubicación.",
                    visibilityTime: 3000,
                    topOffset: 50,
                });
                return;
            }

            const location = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);

        } catch (error) {
            console.error("GPS Error:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "No se pudo obtener la ubicación.",
                visibilityTime: 3000,
                topOffset: 50,
            });
        } finally {
            setIsLocating(false);
        }
    }, []);

    const handleContactWhatsApp = useCallback((phone: string, orderId: number) => {
        if (!phone) {
            Toast.show({
                type: 'error',
                text1: 'Sin teléfono',
                text2: "Este cliente no tiene número registrado.",
            });
            return;
        }
        const message = `Hola, soy tu repartidor de AppYaMismo. Estoy en camino con tu pedido #${orderId}.`;
        const url = `whatsapp://send?phone=+51${phone}&text=${encodeURIComponent(message)}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                Linking.openURL(`https://wa.me/+51${phone}?text=${encodeURIComponent(message)}`);
            }
        }).catch(err => console.error("An error occurred", err));
    }, []);

    // 6. Render
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <MapView
                ref={mapRef}
                style={locationStyles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {visibleMarkers.map((marker) => (
                    <MapMarker
                        key={marker.id}
                        marker={marker}
                        colors={colors}
                    />
                ))}
            </MapView>

            {/* Info Panel */}
            <View style={[locationStyles.infoPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={locationStyles.infoPanelHeader}>
                    <MaterialIcons name="edit-location" size={normalize(24)} color={colors.primary} />
                    <Text style={[locationStyles.infoPanelTitle, { color: colors.text, fontFamily: colors.fontPrimary }]}>
                        Gestión de Órdenes
                    </Text>
                    {selectedOrder && (
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowOrderSummary(!showOrderSummary)}>
                            <Ionicons name={showOrderSummary ? "chevron-up" : "chevron-down"} size={24} color={colors.text} style={{ padding: normalize(7) }} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={locationStyles.filterScroll}
                    contentContainerStyle={locationStyles.filterContent}
                >
                    <FilterChip
                        id={null}
                        label="Todas"
                        isSelected={filterId === null}
                        onPress={() => handleFilterPress(null)}
                        colors={colors}
                    />
                    {orders.map((order) => (
                        <FilterChip
                            key={order.id}
                            id={order.id}
                            label={`#${order.id}`}
                            isSelected={filterId === order.id}
                            onPress={handleFilterPress}
                            colors={colors}
                        />
                    ))}
                </ScrollView>

                {/* Selected Order Details */}
                {selectedOrder && showOrderSummary ? (
                    <View style={locationStyles.orderDetails}>
                        <View style={locationStyles.orderHeader}>
                            <View style={locationStyles.orderHeaderLeft}>
                                <MaterialIcons name="shopping-bag" size={normalize(18)} color={colors.primary} />
                                <Text style={[locationStyles.orderHeaderText, { color: colors.text, fontFamily: colors.fontPrimary }]}>
                                    Orden #{selectedOrder.id}
                                </Text>
                            </View>
                            <Text style={[locationStyles.orderTotal, { color: colors.primary, fontFamily: colors.fontPrimary }]}>
                                S/ {orderTotal.toFixed(2)}
                            </Text>
                        </View>

                        <View style={locationStyles.locationInfo}>
                            <View style={locationStyles.locationRow}>
                                <MaterialIcons name="person-pin-circle" size={normalize(14)} color={colors.textSecondary} />
                                <Text style={[locationStyles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {selectedOrder.customer.name}
                                </Text>
                            </View>
                        </View>
                        <View style={locationStyles.actionButtonsRow}>
                            <TouchableOpacity
                                style={[locationStyles.actionButtonMain, { backgroundColor: colors.success }]}
                                onPress={() => handleContactWhatsApp(selectedOrder.customer.phone || "", selectedOrder.id)}
                            >
                                <Ionicons name="logo-whatsapp" size={normalize(20)} color="#fff" />
                                <Text style={locationStyles.actionButtonText}>Contactar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[locationStyles.actionButtonMain, { backgroundColor: colors.text }]}
                                onPress={() => router.push({
                                    pathname: '/(dealer)/home/QrPage',
                                    params: {
                                        orderId: selectedOrder.id,
                                        customer: selectedOrder.customer.name,
                                        address: selectedOrder.customer.address,
                                        phone: selectedOrder.customer.phone,
                                        items: JSON.stringify([
                                            ...selectedOrder.restaurant.flatMap((rest) => rest.products.map((prod) => ({
                                                name: prod.name,
                                                quantity: prod.quantity,
                                                price: prod.price
                                            })))
                                        ]),
                                        total: orderTotal
                                    }
                                })}
                            >
                                <Ionicons name="qr-code" size={normalize(18)} color={colors.background} />
                                <Text style={[locationStyles.actionButtonText, { color: colors.background }]}>QR Entrega</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[locationStyles.productsDivider, { backgroundColor: colors.border }]} />

                        <ScrollView
                            style={locationStyles.productsScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {selectedOrder.restaurant.map((rest, restIndex) => (
                                <RestaurantSection
                                    key={`rest-${restIndex}`}
                                    rest={rest}
                                    colors={colors}
                                />
                            ))}
                        </ScrollView>
                    </View>
                ) : (
                    /* Legend */
                    <View style={locationStyles.legendContainer}>
                        <View style={locationStyles.legendItem}>
                            <View style={[locationStyles.legendDot, { backgroundColor: colors.primary }]} />
                            <Text style={[locationStyles.legendText, { color: colors.textSecondary }]}>
                                Restaurantes ({restaurantCount})
                            </Text>
                        </View>
                        <View style={locationStyles.legendItem}>
                            <View style={[locationStyles.legendDot, { backgroundColor: colors.warning }]} />
                            <Text style={[locationStyles.legendText, { color: colors.textSecondary }]}>
                                Clientes ({customerCount})
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* GPS Button */}
            <View style={locationStyles.buttonContainer}>
                <TouchableOpacity
                    style={[locationStyles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={centerOnUserLocation}
                    disabled={isLocating}
                    accessibilityLabel="Centrar en mi ubicación"
                >
                    <MaterialIcons
                        name={isLocating ? "gps-not-fixed" : "my-location"}
                        size={normalize(24)}
                        color={colors.textInverse}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MapMonitoring;

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
        maxHeight: normalize(340),
    },
    infoPanelHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: normalize(8),
    },
    infoPanelTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        marginLeft: normalize(6),
    },
    filterScroll: {
        marginVertical: normalize(8),
        maxHeight: normalize(36),
    },
    filterContent: {
        gap: normalize(8),
        paddingRight: normalize(8),
    },
    filterChip: {
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(6),
        borderRadius: normalize(16),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterText: {
        fontSize: normalize(13),
        fontWeight: "600",
    },
    orderDetails: {
        marginTop: normalize(8),
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: normalize(8),
    },
    orderHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    orderHeaderText: {
        fontSize: normalize(15),
        fontWeight: "600",
    },
    orderTotal: {
        fontSize: normalize(16),
        fontWeight: "700",
    },
    locationInfo: {
        gap: normalize(4),
        marginBottom: normalize(8),
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
    },
    locationText: {
        fontSize: normalize(12),
        flex: 1,
    },
    productsDivider: {
        height: 1,
        marginVertical: normalize(8),
    },
    productsScroll: {
        maxHeight: normalize(120),
    },
    restaurantSection: {
        marginBottom: normalize(8),
    },
    restaurantHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(6),
        marginBottom: normalize(6),
        paddingBottom: normalize(4),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    restaurantName: {
        fontSize: normalize(13),
        fontWeight: "600",
        flex: 1,
    },
    productItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: normalize(4),
        paddingHorizontal: normalize(4),
        marginLeft: normalize(20),
    },
    productLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: normalize(8),
        flex: 1,
    },
    quantityBadge: {
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
        borderRadius: normalize(10),
        minWidth: normalize(28),
        alignItems: "center",
    },
    quantityText: {
        fontSize: normalize(11),
        fontWeight: "700",
    },
    productName: {
        fontSize: normalize(13),
        fontWeight: "500",
        flex: 1,
    },
    productPrice: {
        fontSize: normalize(13),
        fontWeight: "600",
        marginLeft: normalize(8),
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
        bottom: normalize(80),
        flexDirection: "column",
        gap: normalize(10),
    },
    actionButton: {
        width: normalize(48),
        height: normalize(48),
        borderRadius: normalize(24),
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    customMarker: {
        alignItems: "center",
        justifyContent: "center",
    },
    markerCircle: {
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        borderRadius: MARKER_RADIUS,
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
    actionButtonsRow: {
        flexDirection: "row",
        gap: normalize(10),
        marginTop: normalize(8),
    },
    actionButtonMain: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: normalize(10),
        borderRadius: normalize(10),
        gap: normalize(8),
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: normalize(13),
    },
});