
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EOrderStatus, OrderEntity } from '@/src/domain/entities/OrderEntity';
import { normalizeScreen } from '@/src/infrastructure/configuration/utils/GlobalConfig';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface OrderListItemProps {
    item: OrderEntity;
    activeTab: 'pendientes' | 'completados';
    onAccept: (item: OrderEntity) => void;
    onViewDetail: (id: number) => void;
}

export const OrderListItem: React.FC<OrderListItemProps> = ({
    item,
    activeTab,
    onAccept,
    onViewDetail,
}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    // Use normal theme if colorScheme is not light/dark (or adjust based on usage pattern)
    // Original file used: const colors = Colors[colorScheme ?? "normal"];
    // If Colors has 'normal', we use it.
    const colors = Colors[theme as keyof typeof Colors] || Colors.light;

    const { width } = useWindowDimensions();

    const normalize = (size: number) => normalizeScreen(size, width);

    const styles = useMemo(() => createStyles(colors, normalize), [colors, width]);

    const getRestaurantInfo = (order: OrderEntity) => {
        const firstDetail = order.orderDetails?.[0];
        if (firstDetail?.product?.restaurant) {
            return {
                name: firstDetail.product.restaurant.name || "Restaurante",
                address: firstDetail.product.restaurant.address || null,
            };
        }
        return null;
    };

    const getTotalItems = (order: OrderEntity) => {
        return order.orderDetails?.reduce((sum, detail) => sum + (detail.amount || 0), 0) || 0;
    };

    const getCustomerName = (order: OrderEntity) => {
        if (order.customer?.userEntity) {
            const { name, lastName } = order.customer.userEntity;
            return `${name || ""} ${lastName || ""}`.trim() || "Cliente";
        }
        return "Cliente";
    };

    const getCustomerPhone = (order: OrderEntity) => {
        return order.customer?.userEntity?.phone || "Sin teléfono";
    };

    const formatAddress = (order: OrderEntity) => {
        if (order.customer?.userEntity?.address) {
            return order.customer.userEntity.address;
        }
        if (order.latitude && order.longitude) {
            return `Lat: ${order.latitude.toFixed(4)}, Lng: ${order.longitude.toFixed(4)}`;
        }
        return "Dirección no disponible";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const restaurantInfo = getRestaurantInfo(item);
    const totalItems = getTotalItems(item);

    return (
        <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
            {/* Header compacto */}
            <View style={styles.cardHeader}>
                <View style={styles.orderBadge}>
                    <Ionicons name="receipt-outline" size={normalize(12)} color={colors.text} />
                    <Text style={[styles.orderBadgeText, { color: colors.text }]}>#{item.id}</Text>
                </View>

                <View style={[styles.statusBadge, styles.statusCompleted]}>
                    {item.orderStatus === EOrderStatus.ENTREGADO && (
                        <>
                            <Ionicons name="checkmark-circle" size={normalize(12)} color={colors.success} />
                            <Text style={[styles.statusText, { color: colors.success }]}>{item.orderStatus}</Text>
                        </>
                    )}
                    {item.orderStatus === EOrderStatus.PENDIENTE && (
                        <>
                            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                            <Text style={[styles.statusText, { color: colors.warning }]}>{item.orderStatus}</Text>
                        </>
                    )}
                </View>

                <Text style={[styles.totalCompact, { color: colors.text }]}>S/ {item.total.toFixed(2)}</Text>
            </View>

            {/* Productos en formato compacto */}
            <View style={styles.productsSection}>
                <View style={styles.productsSummary}>
                    <Ionicons name="fast-food-outline" size={normalize(14)} color={colors.warning} />
                    <Text style={[styles.productsSummaryText, { color: colors.warning }]}>
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                    </Text>
                </View>

                {item.orderDetails?.slice(0, 2).map((detail, index) => (
                    <View key={detail.id || index} style={styles.productRow}>
                        {detail.product?.urlImage && (
                            <Image
                                source={{ uri: detail.product.urlImage }}
                                style={styles.productThumb}
                                resizeMode="cover"
                            />
                        )}
                        <View style={styles.productInfo}>
                            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                                {detail.product?.name || "Producto"}
                            </Text>
                            <Text style={[styles.productMeta, { color: colors.text }]}>
                                x{detail.amount} • S/ {detail.unitPrice?.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                ))}

                {item.orderDetails && item.orderDetails.length > 2 && (
                    <Text style={styles.moreProducts}>
                        +{item.orderDetails.length - 2} producto{item.orderDetails.length - 2 !== 1 ? 's' : ''} más
                    </Text>
                )}
            </View>

            {/* Información contextual según tab */}
            {activeTab === "pendientes" && restaurantInfo && (
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="restaurant-outline" size={normalize(14)} color="#FFA726" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Recoger en:</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {restaurantInfo.name}, <Text style={styles.infoSubValue}>{restaurantInfo.address}</Text>
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={{
                            marginTop: 10,
                            backgroundColor: colors.primary,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 8,
                            alignItems: 'center',
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                        onPress={() => onAccept(item)}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: normalize(14) }}>ACEPTAR PEDIDO</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={normalize(14)} color={colors.info} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: colors.info }]}>Cliente:</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{getCustomerName(item)}</Text>
                        {activeTab === "pendientes" && (
                            <View style={styles.phoneRow}>
                                <Ionicons name="call-outline" size={normalize(12)} color={colors.success} />
                                <Text style={[styles.phoneText, { color: colors.success }]}>{getCustomerPhone(item)}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {activeTab === "pendientes" && (
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={normalize(14)} color={colors.error} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: colors.text }]}>Entregar en:</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>
                                {formatAddress(item)}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {activeTab === "completados" && (
                <View style={styles.dateRow}>
                    <Ionicons name="time-outline" size={normalize(12)} color={colors.text} />
                    <Text style={[styles.dateText, { color: colors.text }]}>
                        {formatDate(item.closingDate?.toString() || item.createdAt?.toString())}
                    </Text>
                </View>
            )}

            {/* Footer */}
            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => onViewDetail(item.id)}
                activeOpacity={0.7}
            >
                <Text style={styles.detailText}>Ver detalle completo</Text>
                <Ionicons name="chevron-forward" size={normalize(14)} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors: any, normalize: (n: number) => number) =>
    StyleSheet.create({
        orderCard: {
            borderRadius: 12,
            marginBottom: 12,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        cardHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.1)",
        },
        orderBadge: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            gap: 4,
        },
        orderBadgeText: {
            fontWeight: "bold",
            fontSize: normalize(11),
        },
        statusBadge: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            gap: 4,
        },
        statusCompleted: {
            backgroundColor: "rgba(76, 175, 80, 0.2)",
        },
        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#FFA726",
        },
        statusText: {
            fontWeight: "600",
            fontSize: normalize(11),
        },
        totalCompact: {
            fontSize: normalize(16),
            fontWeight: "bold",
        },
        productsSection: {
            marginBottom: 12,
        },
        productsSummary: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
        },
        productsSummaryText: {
            fontSize: normalize(12),
            fontWeight: "600",
        },
        productRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
        },
        productThumb: {
            width: normalize(40),
            height: normalize(40),
            borderRadius: 6,
            backgroundColor: "#1a2930",
        },
        productInfo: {
            flex: 1,
        },
        productName: {
            color: "#fff",
            fontSize: normalize(13),
            fontWeight: "600",
            marginBottom: 2,
        },
        productMeta: {
            color: "#B0BEC5",
            fontSize: normalize(11),
        },
        moreProducts: {
            color: "#90A4AE",
            fontSize: normalize(11),
            fontStyle: "italic",
            marginTop: 4,
            paddingLeft: 8,
        },
        infoSection: {
            marginBottom: 10,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
        },
        infoContent: {
            flex: 1,
        },
        infoLabel: {
            fontWeight: "600",
            fontSize: normalize(11),
            marginBottom: 2,
        },
        infoValue: {
            fontSize: normalize(12),
            lineHeight: normalize(16),
        },
        infoSubValue: {
            color: "#90A4AE",
            fontSize: normalize(11),
            lineHeight: normalize(14),
            marginTop: 2,
        },
        phoneRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
        },
        phoneText: {
            fontSize: normalize(11),
            fontWeight: "600",
        },
        dateRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
        },
        dateText: {
            color: "#B0BEC5",
            fontSize: normalize(11),
        },
        detailButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#A4243B",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            gap: 6,
            marginTop: 4,
        },
        detailText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: normalize(12),
        },
    });
