import { Colors } from "@/constants/Colors";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import { OrderMapPoint, RestaurantMapPoint } from "@/src/domain/types/MapType";
import { CarCardProps } from "@/src/domain/types/WidgetsType";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const ActualOrderCard: React.FC<CarCardProps> = ({
    colors,
    screenWidth,
}) => {
    const normalize = useCallback((size: number) => normalizeScreen(size, screenWidth), [screenWidth]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState<OrderEntity[]>([]);
    const isMounted = useRef(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Scale animation for the list container
    const scaleAnim = useRef(new Animated.Value(0.98)).current;

    const { user } = useAuth();

    const getGroupedProducts = (details: any[]) => {
        if (!details || !Array.isArray(details)) return [];
        const groups: Record<string, any[]> = {};
        details.forEach(item => {
            const rName = item.product.restaurant?.name || "Restaurante";
            if (!groups[rName]) groups[rName] = [];
            groups[rName].push(item);
        });
        return Object.entries(groups);
    };

    const transformToMapPoint = (order: OrderEntity): OrderMapPoint => {
        const restaurantGroups = getGroupedProducts(order.orderDetails);

        const restaurants: RestaurantMapPoint[] = restaurantGroups.map(([restaurantName, items]) => {
            const firstProduct = items[0]?.product;
            return {
                latitude: firstProduct?.restaurant?.latitude || order.latitude,
                longitude: firstProduct?.restaurant?.longitude || order.longitude,
                name: restaurantName || 'Restaurante',
                products: items.map(item => ({
                    name: item.product.name,
                    price: item.unitPrice,
                    quantity: item.amount
                }))
            };
        });

        return {
            id: order.id, restaurant: restaurants,
            customer: {
                latitude: order.latitude,
                longitude: order.longitude,
                address: order.customer?.userEntity.address || "",
                phone: order.customer?.userEntity.phone || "",
                name: `${order.customer?.userEntity.name} ${order.customer?.userEntity.lastName}`.trim()
            }
        }
    };

    const fetchOrders = useCallback(async () => {
        try {
            const res = await listOrder({
                fields: ["id", "orderStatus", "total", "latitude", "longitude",
                    "customer.userEntity.name", "customer.userEntity.lastName", "customer.userEntity.phone", "customer.userEntity.address",
                    "orderDetails.amount", "orderDetails.unitPrice", "orderDetails.product.name",
                    "orderDetails.product.restaurant.name", "orderDetails.product.restaurant.address",
                    "orderDetails.product.restaurant.latitude", "orderDetails.product.restaurant.longitude"],
                dealerId: user?.dealerId || 0,
                status: EOrderStatus.EN_CAMINO,
            });

            if (isMounted.current) {
                setOrders(res.data?.content || []);
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 8,
                        tension: 40,
                        useNativeDriver: true,
                    })
                ]).start();
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (isMounted.current) {
                setOrders([]);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [fadeAnim, scaleAnim, user?.dealerId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.98);
        await fetchOrders();
        if (isMounted.current) {
            setRefreshing(false);
        }
    }, [fetchOrders, fadeAnim, scaleAnim]);

    const handleNavigateToOrder = useCallback((order: OrderEntity) => {
        router.push({
            pathname: '/home/MapMonitoring',
            params: { orderData: JSON.stringify([transformToMapPoint(order)]) }
        })
    }, []);

    const handleNavigateToQR = useCallback((order: OrderEntity) => {
        router.push({
            pathname: '/(dealer)/home/QrPage',
            params: {
                orderId: order.id.toString(),
                customer: `${order.customer?.userEntity.name} ${order.customer?.userEntity.lastName}`.trim(),
                address: order.customer?.userEntity.address || "",
                phone: order.customer?.userEntity.phone || "",
                total: order.total.toString(),
                items: JSON.stringify(order.orderDetails.map(d => ({
                    name: d.product.name,
                    quantity: d.amount,
                    price: d.unitPrice
                })))
            }
        });
    }, []);

    const handleContactWhatsApp = useCallback((phone: string, orderId: number) => {
        if (!phone) return;
        const message = `Hola, soy tu repartidor de AppYaMismo. Estoy en camino con tu pedido #${orderId}.`;
        const url = `whatsapp://send?phone=+51${phone}&text=${encodeURIComponent(message)}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                return Linking.openURL(url);
            } else {
                // Fallback for web or if whatsapp scheme isn't supported
                Linking.openURL(`https://wa.me/+51${phone}?text=${encodeURIComponent(message)}`);
            }
        }).catch(err => console.error("An error occurred", err));
    }, []);

    useEffect(() => {
        fetchOrders();
        return () => {
            isMounted.current = false;
        };
    }, [fetchOrders]);

    const styles = useMemo(() => createStyles(colors, normalize), [colors, normalize]);

    const renderOrderItem = useCallback((order: OrderEntity, index: number) => {
        const customerName = `${order.customer?.userEntity.name} ${order.customer?.userEntity.lastName}`.trim();
        const customerPhone = order.customer?.userEntity.phone || "";

        return (
            <View
                key={order.id}
                style={[styles.orderItemDisplay, { backgroundColor: colors.surface }]}
            >
                {/* Header: ID and Status */}
                <View style={styles.orderHeaderRow}>
                    <View style={styles.orderIdBadge}>
                        <Text style={styles.orderIdText}>#{order.id}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
                        <Text style={styles.statusText}>{order.orderStatus.replace(/_/g, ' ')}</Text>
                    </View>
                </View>

                {/* Content: Customer Info */}
                <View style={styles.orderContent}>
                    <View style={styles.customerRow}>
                        <Ionicons name="person-circle-outline" size={normalize(20)} color={colors.textSecondary} />
                        <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
                            {customerName}
                        </Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={normalize(18)} color={colors.textSecondary} />
                        <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {order.customer?.userEntity.address || "Dirección no disponible"}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.whatsappButton,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleContactWhatsApp(customerPhone, order.id)}
                    >
                        <Ionicons name="logo-whatsapp" size={normalize(20)} color="#fff" />
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.text },
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleNavigateToQR(order)}
                    >
                        <Ionicons name="qr-code" size={normalize(18)} color={colors.background} />
                        <Text style={[styles.buttonText, { color: colors.background }]}>QR</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.trackButton,
                            { backgroundColor: colors.primary, flex: 2 },
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={() => handleNavigateToOrder(order)}
                    >
                        <Text style={[styles.buttonText, { color: colors.textInverse }]}>Ver Mapa</Text>
                        <Ionicons name="map-outline" size={normalize(18)} color={colors.textInverse} />
                    </Pressable>
                </View>
            </View>
        );
    }, [styles, colors, normalize, handleNavigateToOrder, handleContactWhatsApp]);

    const renderContent = useMemo(() => {
        if (loading) {
            return (
                <View style={styles.centerWrapper}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textTertiary }]}>Buscando pedidos activos...</Text>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.centerWrapper}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceVariant }]}>
                        <Ionicons name="bicycle" size={normalize(24)} color={colors.tertiary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin pedidos en curso</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Los nuevos pedidos aparecerán aquí
                    </Text>
                </View>
            );
        }

        return (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], gap: 12 }}>
                {orders.map((order, index) => renderOrderItem(order, index))}
            </Animated.View>
        );
    }, [loading, orders, styles, colors, normalize, renderOrderItem, fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
            <View style={[styles.mainCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {/* Card Header with Refresh */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerTitleRow}>
                        <View style={[styles.iconBadge, { backgroundColor: colors.surfaceVariant }]}>
                            <Ionicons name="flash" size={normalize(14)} color={colors.primary} />
                        </View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            En Curso ({orders.length})
                        </Text>
                    </View>

                    <Pressable
                        onPress={handleRefresh}
                        style={({ pressed }) => [styles.refreshButton, pressed && { backgroundColor: colors.surfaceVariant }]}
                        hitSlop={8}
                    >
                        {refreshing ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="refresh" size={normalize(18)} color={colors.textSecondary} />
                        )}
                    </Pressable>
                </View>

                {renderContent}
            </View>
        </View>
    );
};

const createStyles = (
    colors: typeof Colors.light,
    normalize: (n: number) => number,
) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        mainCard: {
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            // Subtle shadow for depth
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        headerTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        iconBadge: {
            width: normalize(32),
            height: normalize(32),
            borderRadius: normalize(10),
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: normalize(16),
            fontWeight: "700",
            letterSpacing: -0.3,
            fontFamily: colors.fontPrimary,
        },
        refreshButton: {
            width: normalize(32),
            height: normalize(32),
            borderRadius: normalize(16),
            justifyContent: 'center',
            alignItems: 'center',
        },
        // Loading & Empty States
        centerWrapper: {
            paddingVertical: 24,
            alignItems: "center",
            gap: 8,
        },
        loadingText: {
            fontSize: normalize(13),
            fontFamily: colors.fontSecondary,
        },
        emptyIconCircle: {
            width: normalize(48),
            height: normalize(48),
            borderRadius: normalize(24),
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 4,
        },
        emptyTitle: {
            fontSize: normalize(15),
            fontWeight: "600",
            fontFamily: colors.fontPrimary,
        },
        emptySubtitle: {
            fontSize: normalize(13),
            fontFamily: colors.fontSecondary,
        },
        // Order Item
        orderItemDisplay: {
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.04)', // Very subtle border
        },
        orderHeaderRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        orderIdBadge: {
            backgroundColor: 'rgba(0,0,0,0.05)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        orderIdText: {
            fontSize: normalize(12),
            fontWeight: '700',
            color: colors.textSecondary,
            fontFamily: colors.fontPrimary,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(231, 12, 12, 0.1)', // Light green bg
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 100,
        },
        statusIndicator: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        statusText: {
            fontSize: normalize(11),
            fontWeight: '600',
            color: colors.success,
            textTransform: 'uppercase',
            fontFamily: colors.fontSecondary,
        },
        orderContent: {
            marginBottom: 14,
            gap: 6,
        },
        customerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        customerName: {
            fontSize: normalize(14),
            fontWeight: '600',
            flex: 1,
            fontFamily: colors.fontPrimary,
        },
        addressRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        addressText: {
            fontSize: normalize(13),
            flex: 1,
            fontFamily: colors.fontSecondary,
        },
        actionButtonsContainer: {
            flexDirection: 'row',
            gap: 10,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 10,
            gap: 8,
        },
        whatsappButton: {
            backgroundColor: colors.success, // WhatsApp color
            paddingHorizontal: 0,
            flex: 0.6,
        },
        buttonText: {
            fontWeight: '600',
            fontSize: normalize(13),
            fontFamily: colors.fontPrimary,
        },
        trackButton: {
            // Background comes from props/inline style
        },
        trackButtonText: {
            fontWeight: '600',
            fontSize: normalize(13),
            fontFamily: colors.fontPrimary,
        }
    });

export default ActualOrderCard;