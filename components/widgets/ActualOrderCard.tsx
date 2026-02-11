import { Colors } from "@/constants/Colors";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import { OrderMapPoint, RestaurantMapPoint } from "@/src/domain/types/MapType";
import { CarCardProps } from "@/src/domain/types/WidgetsType";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View
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
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const { user } = useAuth();

    const styles = useMemo(() => createStyles(colors, normalize), [colors, normalize]);

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
                        duration: 400,
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
    }, [fadeAnim, scaleAnim]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
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

    useEffect(() => {
        fetchOrders();
        return () => {
            isMounted.current = false;
        };
    }, [fetchOrders]);

    const renderOrderItem = useCallback((order: OrderEntity, index: number) => (
        <Pressable
            key={order.id}
            style={({ pressed }) => [
                styles.orderItem,
                pressed && styles.orderItemPressed,
                { backgroundColor: colors.surfaceVariant}
            ]}
            onPress={() => handleNavigateToOrder(order)}
        >
            <View style={styles.orderLeft}>
                <View style={styles.orderNumber}>
                    <Text style={styles.orderNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, { color: colors.textInverse}]}>#{order.id}</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={[styles.orderStatus, { color: colors.textInverse}]}>En ruta</Text>
                    </View>
                </View>
            </View>
            <Ionicons
                name="chevron-forward"
                size={normalize(16)}
                color={colors.textInverse}
            />
        </Pressable>
    ), [styles, colors, normalize, handleNavigateToOrder]);

    const renderContent = useMemo(() => {
        if (loading) {
            return (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando</Text>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.emptyWrapper}>
                    <View style={styles.emptyIconWrapper}>
                        <Ionicons
                            name="bicycle-outline"
                            size={normalize(28)}
                            color={colors.textTertiary}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>Todo listo</Text>
                    <Text style={styles.emptySubtitle}>No hay entregas pendientes</Text>
                </View>
            );
        }

        return (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                {orders.map((order, index) => renderOrderItem(order, index))}
            </Animated.View>
        );
    }, [loading, orders, styles, colors, normalize, renderOrderItem, fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
            <Pressable
                onPress={handleRefresh}
                disabled={refreshing}
                style={({ pressed }) => [
                    styles.card,
                    pressed && !refreshing && styles.cardPressed,
                    { backgroundColor: colors.surface }
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.badge, { backgroundColor: colors.card }]}>
                            <Ionicons
                                name="location"
                                size={normalize(14)}
                                color={colors.primary}
                            />
                        </View>
                        <View>
                            <Text style={[styles.title, { color: colors.text }]}>Entregas activas</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {loading ? "—" : orders.length === 0 ? "Ninguna" : `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"}`}
                            </Text>
                        </View>
                    </View>
                    {refreshing && (
                        <ActivityIndicator size="small" color={colors.primary} />
                    )}
                </View>

                {renderContent}
            </Pressable>
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
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 3,
        },
        cardPressed: {
            opacity: 0.92,
            transform: [{ scale: 0.99 }],
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
        },
        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        badge: {
            width: normalize(36),
            height: normalize(36),
            borderRadius: normalize(10),
            backgroundColor: colors.surfaceVariant,
            justifyContent: "center",
            alignItems: "center",
        },
        title: {
            fontSize: normalize(15),
            fontWeight: "600",
            color: colors.text,
            fontFamily: colors.fontPrimary,
            letterSpacing: -0.2,
        },
        subtitle: {
            fontSize: normalize(12),
            color: colors.textSecondary,
            fontFamily: colors.fontSecondary,
            marginTop: 2,
        },
        loadingWrapper: {
            paddingVertical: 28,
            alignItems: "center",
            gap: 10,
        },
        loadingText: {
            fontSize: normalize(12),
            color: colors.textTertiary,
            fontFamily: colors.fontSecondary,
        },
        emptyWrapper: {
            paddingVertical: 32,
            alignItems: "center",
        },
        emptyIconWrapper: {
            width: normalize(56),
            height: normalize(56),
            borderRadius: normalize(28),
            backgroundColor: colors.surfaceVariant,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
        },
        emptyTitle: {
            fontSize: normalize(14),
            fontWeight: "600",
            color: colors.text,
            fontFamily: colors.fontPrimary,
            marginBottom: 4,
        },
        emptySubtitle: {
            fontSize: normalize(12),
            color: colors.textTertiary,
            fontFamily: colors.fontSecondary,
        },
        orderItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 14,
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        orderItemPressed: {
            opacity: 0.6,
            backgroundColor: colors.surfaceVariant,
        },
        orderLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flex: 1,
        },
        orderNumber: {
            width: normalize(28),
            height: normalize(28),
            borderRadius: normalize(8),
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
        },
        orderNumberText: {
            fontSize: normalize(13),
            fontWeight: "700",
            color: colors.textInverse,
            fontFamily: colors.fontPrimary,
        },
        orderInfo: {
            flex: 1,
        },
        orderId: {
            fontSize: normalize(14),
            fontWeight: "600",
            color: colors.text,
            fontFamily: colors.fontPrimary,
            marginBottom: 3,
            letterSpacing: -0.1,
        },
        statusRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        statusDot: {
            width: normalize(6),
            height: normalize(6),
            borderRadius: normalize(3),
            backgroundColor: colors.success,
        },
        orderStatus: {
            fontSize: normalize(11),
            color: colors.textSecondary,
            fontFamily: colors.fontSecondary,
            fontWeight: "500",
        },
    });

export default ActualOrderCard;