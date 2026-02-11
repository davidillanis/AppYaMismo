import DrawerMenu from "@/components/widgets/DrawerMenu";
import Header from "@/components/widgets/Header";
import { Colors } from "@/constants/Colors";
import { OrderEntity } from "@/src/domain/entities/OrderEntity";
import { EPaymentMethod } from "@/src/domain/entities/SaleEntity";
import { listOrder } from "@/src/domain/services/OrderService";
import OrderWebSocketService, { EOrderStatus } from "@/src/domain/services/socket/OrderWebSocketService";
import { mappingError } from "@/src/infrastructure/configuration/security/DecodeToken";
import { APK_NAME, normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    Text,
    useColorScheme,
    useWindowDimensions,
    View
} from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const SocketIndex: React.FC = () => {
    const { width } = useWindowDimensions();
    const normalize = useCallback((s: number) => normalizeScreen(s, width), [width]);
    const colors = Colors[useColorScheme() ?? "normal"];
    const styles = createStyles(colors, normalize);
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [orders, setOrders] = useState<OrderEntity[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);

    const authority = "Development";
    const menuItems = [{ icon: "person-outline", title: "Mi perfil", route: "/PerfilAdmi" }];

    const orderSocket = useMemo(() => new OrderWebSocketService(), []);

    useEffect(() => {
        listOrder({
            fields: [
                "id",
                "orderStatus",
                "total",
                "subtotal",
                "createdAt",
                "latitude",
                "longitude",
                "customer.userEntity.name",
                "customer.userEntity.lastName",
                "customer.userEntity.phone",
                "customer.userEntity.address",
                "orderDetails.amount",
                "orderDetails.unitPrice",
                "orderDetails.product.name",
                "orderDetails.product.urlImage",
                "orderDetails.product.restaurant.name",
                "orderDetails.product.restaurant.address",
            ],
            status: EOrderStatus.PENDIENTE,
            page: 0,
            size: 100,
            sortBy: "id",
            direction: "ASC",
        }).then(data => setOrders(data.data?.content || [])).catch(error => console.log(mappingError(error.data)));

        orderSocket.onDealerOrdersUpdate = (order) => {
            setOrders(prev => {
                if (order.status !== EOrderStatus.PENDIENTE) {
                    return prev.filter(o => o.id !== order.id);
                }

                const index = prev.findIndex(o => o.id === order.id);

                if (index >= 0) {
                    const copy = [...prev];
                    copy[index] = {
                        ...copy[index],
                        orderStatus: order.status,
                        total: order.total,
                    };
                    return copy;
                }

                // si llega nueva por socket
                return [
                    {
                        id: order.id,
                        orderStatus: order.status,
                        total: order.total,
                        latitude: order.latitude,
                        longitude: order.longitude,
                        orderDetails: order.orderDetails,
                        customer: order.customer,
                    } as OrderEntity,
                    ...prev,
                ];
            });
            setIsCreating(false);
            setLoadingOrderId(prev => (prev === order.id ? null : prev));
        };

        orderSocket.onOrderError = (error) => {
            setLoadingOrderId(null);
            Toast.show({
                type: 'warning',
                text1: 'Alerta',
                text2: error.errors?.[0] || "Error desconocido",
                visibilityTime: 3000,
                topOffset: 50,
            });
        };

        orderSocket.connect(user?.dealerId || 0);
        setConnected(true);

        return () => orderSocket.disconnect();
    }, []);


    const createOrder = () => {
        setIsCreating(true);
        orderSocket.createOrder({
            paymentMethod: EPaymentMethod.EFECTIVO,
            latitude: Number((Math.random() * 180 - 90).toFixed(2)),
            longitude: Number((Math.random() * 360 - 180).toFixed(2)),
            customerId: 1,
            orderDetails: [
                {
                    productId: 1,
                    amount: 1,
                    unitPrice: 1,
                    note: "TEST",
                    variantId: 1
                }
            ]
        });
    };

    const updateStatus = (orderId: number, status: EOrderStatus) => {
        setLoadingOrderId(orderId);
        orderSocket.updateStatus({ orderId, dealerId: user?.dealerId || 0, status });
    };

    return (
        <Drawer
            open={isDrawerOpen}
            onOpen={() => setIsDrawerOpen(true)}
            onClose={() => setIsDrawerOpen(false)}
            drawerType={width >= 1024 ? "permanent" : "front"}
            drawerPosition="left"
            overlayStyle={{ backgroundColor: "rgba(221,215,215,0.5)" }}
            drawerStyle={{
                backgroundColor: colors.surface,
                width: width >= 1024 ? Math.min(width * 0.25, 400) : width * 0.85
            }}
            renderDrawerContent={() => (
                <DrawerMenu
                    colors={colors}
                    user={user}
                    screenWidth={width}
                    authority={authority}
                    menuItems={menuItems}
                    onNavigate={(r) => router.push(r as any)}
                    onLogout={logout}
                />
            )}
        >
            <SafeAreaView style={styles.container}>
                <Header
                    colors={colors}
                    screenWidth={width}
                    onMenuPress={() => setIsDrawerOpen(true)}
                    onProfilePress={() => router.push("/(tabs)/ProfileUser" as any)}
                    title="Órdenes en tiempo real"
                    subTitle={APK_NAME}
                />

                <ScrollView style={styles.content}>
                    <Text style={styles.resultsCount}>
                        Estado socket: {connected ? "🟢 Conectado" : "🔴 Desconectado"}
                    </Text>

                    {isCreating ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <Button title="➕ Crear orden (demo)" onPress={createOrder} />
                    )}

                    {orders.length === 0 && (
                        <Text style={styles.resultsCount}>Sin órdenes asignadas</Text>
                    )}

                    {orders.map(order => (
                        <View
                            key={order.id}
                            style={{
                                padding: 12,
                                marginVertical: 8,
                                borderRadius: 10,
                                backgroundColor: colors.surfaceVariant
                            }}
                        >
                            <Text style={{ fontWeight: "bold" }}>
                                🧾 Orden #{order.id}

                            </Text>

                            <Text>Estado: {order.orderStatus}</Text>
                            <Text>Total: ${order.total}</Text>
                            <Text>Ubicacion: {order.latitude}-{order.longitude}</Text>
                            <Text>Detalles: {order.orderDetails.map(od => od.amount + " x " + od.unitPrice + " = " + od.amount * od.unitPrice).join(", ")}</Text>
                            <Text>Producto: {order.orderDetails.map(od => od.product.name + ", " + od.product.urlImage).join("///")}</Text>
                            <Text>Restaurante: {order.orderDetails.map(od => od.product.restaurant.name).join("//")}</Text>
                            <Text>Cliente: {order.customer?.userEntity.name} {order.customer?.userEntity.lastName}</Text>
                            <Text>Dirección: {order.customer?.userEntity.address}</Text>
                            <Text>Teléfono: {order.customer?.userEntity.phone}</Text>

                            {loadingOrderId === order.id ? (
                                <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
                            ) : (
                                <>
                                    {order.orderStatus === EOrderStatus.PENDIENTE && (
                                        <>
                                            <Button
                                                title="Aceptar"
                                                onPress={() => updateStatus(order.id, EOrderStatus.EN_CAMINO)}
                                            />
                                            <View style={{ height: 10 }} />
                                            <Button
                                                title="Rechazar"
                                                onPress={() => updateStatus(order.id, EOrderStatus.RECHAZADO)}
                                                color="red"
                                            />
                                        </>
                                    )}

                                    {order.orderStatus === EOrderStatus.EN_CAMINO && (
                                        <Button
                                            title="Marcar como entregada"
                                            onPress={() => updateStatus(order.id, EOrderStatus.ENTREGADO)}
                                        />
                                    )}
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Drawer>
    );
};

export default SocketIndex;
