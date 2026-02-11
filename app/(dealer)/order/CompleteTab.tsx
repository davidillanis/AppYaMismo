import { Colors } from "@/constants/Colors";
import { EOrderStatus, OrderEntity } from "@/src/domain/entities/OrderEntity";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { OrderListItem } from "@/src/presentation/components/pages/OrderListItem";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useOrderList } from "@/src/presentation/hooks/useOrderList";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";


const PAGE_SIZE = 10;

const CompleteTab = () => {
    const { width } = useWindowDimensions();
    const normalize = useCallback((size: number) => normalizeScreen(size, width), [width]);
    const colorScheme = useColorScheme() ?? "normal";
    const colors = Colors[colorScheme ?? "normal"];
    const styles = createStyles(colors, normalize);
    const { user } = useAuth();

    // Estados para paginación de cada tab
    const [pageCompletados, setPageCompletados] = useState(0);
    const [allCompletados, setAllCompletados] = useState<OrderEntity[]>([]);
    const [hasMoreCompletados, setHasMoreCompletados] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const customStyles = createCustomStyles(colors, normalize);
    const queryClient = useQueryClient();

    // Ref para evitar múltiples llamadas a onEndReached
    const isLoadingMore = useRef(false);

    // Query para pedidos completados
    const { data: completadosData, isFetching: fetchingCompletados, refetch: refetchCompletados } = useOrderList({
        fields: [
            "id",
            "orderStatus",
            "total",
            "subtotal",
            "createdAt",
            "closingDate",
            "customer.userEntity.name",
            "customer.userEntity.lastName",
            "customer.userEntity.phone",
            "customer.userEntity.address",
            "orderDetails.amount",
            "orderDetails.unitPrice",
            "orderDetails.product.name",
            "orderDetails.product.urlImage",
        ],
        status: EOrderStatus.ENTREGADO,
        page: pageCompletados,
        size: PAGE_SIZE,
        sortBy: "id",
        direction: 'ASC',
        dealerId: user?.dealerId || 0
    });
    const totalPagesCompletados = completadosData?.data?.totalPages ?? 0;

    // Actualizar lista de completados
    useEffect(() => {
        if (completadosData?.data?.content) {
            const newOrders = completadosData.data.content;
            setAllCompletados((prev) => {
                if (pageCompletados === 0) {
                    return newOrders;
                }
                const existingIds = new Set(prev.map((o) => o.id));
                const uniqueNew = newOrders.filter((o) => !existingIds.has(o.id));
                return [...prev, ...uniqueNew];
            });
            setHasMoreCompletados(pageCompletados + 1 < totalPagesCompletados);
            isLoadingMore.current = false;
        }
    }, [completadosData, pageCompletados, totalPagesCompletados]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setPageCompletados(0);
        setAllCompletados([]);
        setHasMoreCompletados(true);
        isLoadingMore.current = false;

        try {
            await refetchCompletados();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchCompletados]);
    //DELETED CACHE
    /*const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);

        setPageCompletados(0);
        setAllCompletados([]);
        setHasMoreCompletados(true);

        await queryClient.invalidateQueries({
            queryKey: ["orders"],
        });
        setIsRefreshing(false);
    }, []);*/

    // Infinite scroll handler
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore.current || fetchingCompletados || !hasMoreCompletados) return;
        isLoadingMore.current = true;
        setPageCompletados((prev) => prev + 1);
    }, [fetchingCompletados, hasMoreCompletados]);

    // Footer component para mostrar loading indicator
    const renderFooter = useCallback(() => {
        if (fetchingCompletados && pageCompletados > 0) {
            return (
                <View style={customStyles.footerLoader}>
                    <ActivityIndicator size="small" color="#A4243B" />
                    <Text style={customStyles.footerText}>Cargando más pedidos...</Text>
                </View>
            );
        }

        if (!hasMoreCompletados && allCompletados.length > 0) {
            return (
                <View style={customStyles.footerLoader}>
                    <Text style={customStyles.footerText}>No hay más pedidos</Text>
                </View>
            );
        }

        return null;
    }, [fetchingCompletados, pageCompletados, hasMoreCompletados, allCompletados.length]);


    if (fetchingCompletados && pageCompletados === 0) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={allCompletados}
                renderItem={({ item }) => (
                    <OrderListItem
                        item={item}
                        activeTab={"completados"}
                        onAccept={() => { }}
                        onViewDetail={() => { }}
                    />
                )}
                keyExtractor={(item) => `order-${item.id}`}
                contentContainerStyle={[
                    customStyles.listContent,
                    allCompletados.length === 0 && { flex: 1 },
                ]}
                ListHeaderComponent={
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsCount}>Mostrando {allCompletados.length} Pedidos</Text>
                    </View>
                }
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={["#A4243B"]}
                        tintColor="#A4243B"
                    />
                }
                showsVerticalScrollIndicator={true}
            />
        </View>
    )
};

const createCustomStyles = (colors: any, normalize: (n: number) => number) =>
    StyleSheet.create({
        listContent: {
            padding: 15,
            backgroundColor: colors.background
        },
        footerLoader: {
            paddingVertical: 20,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        footerText: {
            color: "#666",
            fontSize: normalize(12),
            fontWeight: "500",
        },
    });

export default CompleteTab;
