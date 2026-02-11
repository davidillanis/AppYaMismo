import DrawerMenu from "@/components/widgets/DrawerMenu";
import Header from "@/components/widgets/Header";
import { Colors } from "@/constants/Colors";
import { APK_NAME, normalizeScreen } from "@/src/infrastructure/configuration/utils/GlobalConfig";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { createStyles } from "@/src/presentation/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, useWindowDimensions, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { SafeAreaView } from "react-native-safe-area-context";
import CompleteTab from "./CompleteTab";
import PendingTab from "./PendingTab";

export default function DealerPage() {
    const [activeTab, setActiveTab] = useState<"pendientes" | "completados">("pendientes");
    const { width } = useWindowDimensions();
    const normalize = useCallback((size: number) => normalizeScreen(size, width), [width]);
    const colorScheme = useColorScheme() ?? "normal";
    const colors = Colors[colorScheme ?? "normal"];
    const styles = createStyles(colors, normalize);
    const customStyles = createCustomStyles(colors, normalize);
    const router = useRouter();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { user, logout } = useAuth();

    // Estados para paginación de cada tab
    const authority = "Repartidor";
    const menuItems = [{ icon: "person-outline", title: "Mi perfil", route: "/PerfilAdmi" }];

    const handleTabChange = useCallback((tab: "pendientes" | "completados") => {
        setActiveTab(tab);
    }, []);

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
                    onProfilePress={() => router.push('/(tabs)/ProfileUser' as any)}
                    title="Pedidos"
                    subTitle={APK_NAME}
                />
                <View style={{ marginTop: normalize(10), padding: normalize(10) }}>
                    <View style={customStyles.tabContainer}>
                        <TouchableOpacity style={[customStyles.tabButton, activeTab === "pendientes" && customStyles.activeTab,]} onPress={() => handleTabChange("pendientes")} activeOpacity={0.7}>
                            <Ionicons name="bicycle-outline" size={normalize(18)} color={activeTab === "pendientes" ? "#fff" : "#333"} />
                            <Text style={[customStyles.tabText, activeTab === "pendientes" && customStyles.activeTabText,]}>
                                Pendientes
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[customStyles.tabButton, activeTab === "completados" && customStyles.activeTab,]} onPress={() => handleTabChange("completados")} activeOpacity={0.7}>
                            <Ionicons name="checkmark-done-outline" size={normalize(18)} color={activeTab === "completados" ? "#fff" : "#333"} />
                            <Text style={[customStyles.tabText, activeTab === "completados" && customStyles.activeTabText,]}>
                                Completados
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Resumen */}
                    <View style={customStyles.summaryContainer}>
                        <View style={customStyles.summaryCard}>
                            <View style={customStyles.summaryIcon}>
                                <Ionicons name="cash-outline" size={normalize(24)} color="#fff" />
                            </View>
                            <View style={customStyles.summaryInfo}>
                                <Text style={customStyles.summaryLabel}>Ganancia Hoy</Text>
                                <Text style={customStyles.summaryValue}>{0}</Text>
                            </View>
                        </View>
                        <View style={customStyles.summaryCard}>
                            <View style={[customStyles.summaryIcon, { backgroundColor: "#FFA726" }]}>
                                <Ionicons name="cube-outline" size={normalize(24)} color="#fff" />
                            </View>
                            <View style={customStyles.summaryInfo}>
                                <Text style={customStyles.summaryLabel}>Entregas Hoy</Text>
                                <Text style={customStyles.summaryValue}>{0}</Text>
                            </View>
                        </View>

                    </View>
                    {/* Subtítulo */}
                    <View style={customStyles.subTitleContainer}>
                        <Text style={[customStyles.subTitle, { color: colors.text }]}>
                            {activeTab === "pendientes" ? "Cola de entregas" : "Historial"}
                        </Text>
                    </View>
                    {/* Tab Content */}
                    {activeTab === "pendientes" ? (
                        <PendingTab />
                    ) : (
                        <CompleteTab />
                    )}
                </View>


            </SafeAreaView>
        </Drawer>

    );
}
const createCustomStyles = (colors: any, normalize: (n: number) => number) =>
    StyleSheet.create({
        tabContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 15,
            gap: 10,
        },
        tabButton: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
            backgroundColor: "#d8c8a8",
            gap: 8,
        },
        activeTab: {
            backgroundColor: "#A4243B",
            shadowColor: "#A4243B",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        tabText: {
            color: "#333",
            fontWeight: "600",
            fontSize: normalize(14),
        },
        activeTabText: {
            color: "#fff",
        },

        /** Resumen */
        summaryContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 10,
        },
        summaryCard: {
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 15,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        summaryIcon: {
            width: normalize(48),
            height: normalize(48),
            borderRadius: normalize(24),
            backgroundColor: "#A4243B",
            alignItems: "center",
            justifyContent: "center",
        },
        summaryInfo: {
            flex: 1,
        },
        summaryLabel: {
            color: "#666",
            fontWeight: "600",
            fontSize: normalize(12),
            marginBottom: 4,
        },
        summaryValue: {
            color: "#1A1A1A",
            fontSize: normalize(20),
            fontWeight: "bold",
        },

        subTitleContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 15,
        },
        subTitle: {
            fontWeight: "bold",
            fontSize: normalize(16),
        },
    });
