import { Colors } from "@/constants/Colors";
import { DealerSummaryResponseDTO } from "@/src/domain/entities/StatisticsEntity";
import { dealerSummary } from "@/src/domain/services/StatisticsService";
import { CarCardProps } from "@/src/domain/types/WidgetsType";
import { normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";

const SummaryCard: React.FC<CarCardProps> = ({
    colors,
    screenWidth,
}) => {
    const normalize = useCallback((size: number) => normalizeScreen(size, screenWidth), [screenWidth]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<DealerSummaryResponseDTO>({
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
    });
    const isMounted = useRef(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const { user } = useAuth();

    const styles = useMemo(() => createStyles(colors, normalize), [colors, normalize]);

    const fetchSummary = useCallback(async () => {
        if (!user?.id) {
            if (isMounted.current) {
                setLoading(false);
            }
            return;
        }

        try {
            const res = await dealerSummary(user.id);

            if (isMounted.current && res.data) {
                setSummary(res.data);
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
            console.error("Error fetching summary:", error);
            if (isMounted.current) {
                setSummary({
                    totalOrders: 0,
                    totalRevenue: 0,
                    todayOrders: 0,
                    todayRevenue: 0,
                });
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [user?.id, fadeAnim, scaleAnim]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
        await fetchSummary();
        if (isMounted.current) {
            setRefreshing(false);
        }
    }, [fetchSummary, fadeAnim, scaleAnim]);

    useEffect(() => {
        fetchSummary();
        return () => {
            isMounted.current = false;
        };
    }, [fetchSummary]);

    const formatCurrency = useCallback((value: number) => {
        return value?.toFixed(2);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando resumen...</Text>
                </View>
            </View>
        );
    }

    return (
        <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            style={styles.container}
        >
            {refreshing && (
                <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}

            <Animated.View
                style={[
                    styles.summaryContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            >
                <View style={[styles.summaryCard, { backgroundColor: colors.surface}]}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="cash-outline" size={normalize(22)} color="#fff" />
                    </View>
                    <View style={styles.summaryInfo}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Hoy</Text>
                        <Text style={[styles.summaryValue, { color: colors.text}]}>S/ {formatCurrency(summary.todayRevenue)}</Text>
                        <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>{summary.todayOrders} entregas</Text>
                    </View>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: colors.surface}]}>
                    <View style={[styles.summaryIcon, { backgroundColor: "#10B981" }]}>
                        <Ionicons name="trending-up-outline" size={normalize(22)} color="#fff" />
                    </View>
                    <View style={styles.summaryInfo}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>S/ {formatCurrency(summary.totalRevenue)}</Text>
                        <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>{summary.totalOrders} entregas</Text>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
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
        refreshIndicator: {
            position: "absolute",
            top: 10,
            right: 30,
            zIndex: 10,
        },
        loadingWrapper: {
            paddingVertical: 40,
            alignItems: "center",
            gap: 10,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        loadingText: {
            fontSize: normalize(12),
            color: colors.textTertiary,
            fontFamily: colors.fontSecondary,
        },
        summaryContainer: {
            flexDirection: "row",
            gap: 12,
        },
        summaryCard: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 3,
        },
        summaryIcon: {
            width: normalize(42),
            height: normalize(42),
            borderRadius: normalize(12),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
        },
        summaryInfo: {
            gap: 2,
        },
        summaryLabel: {
            color: colors.textSecondary,
            fontWeight: "500",
            fontSize: normalize(11),
            fontFamily: colors.fontSecondary,
            marginBottom: 2,
        },
        summaryValue: {
            color: colors.text,
            fontSize: normalize(18),
            fontWeight: "700",
            fontFamily: colors.fontPrimary,
            letterSpacing: -0.3,
        },
        summarySubtext: {
            color: colors.textTertiary,
            fontSize: normalize(10),
            fontWeight: "500",
            fontFamily: colors.fontSecondary,
            marginTop: 2,
        },
    });

export default SummaryCard;